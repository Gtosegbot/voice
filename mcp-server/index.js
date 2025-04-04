/**
 * Message Control Protocol (MCP) Server
 * 
 * The MCP server acts as a central communication hub for the VoiceAI platform.
 * It connects different communication channels (Asterisk for voice, WhatsApp API, etc.)
 * and integrates with AI services (Speech-to-Text, LLMs, Text-to-Speech).
 * 
 * This enhanced version includes support for:
 * - WhatsApp Official API and Evolution API
 * - Calendar integrations for appointment scheduling
 * - Multiple SIP trunks for voice calls
 * - Webhooks for external integrations
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';

// WhatsApp API configuration
const WHATSAPP_BUSINESS_ID = process.env.WHATSAPP_BUSINESS_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

// Client connections
const connections = new Map();

// MCP Clients registry
const mcpClients = new Map();

// Channel providers
const channelProviders = {
  whatsapp: {
    official: async (message) => {
      try {
        // WhatsApp Cloud API endpoint
        const url = `https://graph.facebook.com/v17.0/${WHATSAPP_BUSINESS_ID}/messages`;
        
        // Message payload
        const payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: message.to,
          type: 'text',
          text: { 
            body: message.content 
          }
        };
        
        // Send message
        const response = await axios.post(url, payload, {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        return {
          success: true,
          message_id: response.data.messages[0].id,
          status: 'sent'
        };
      } catch (error) {
        console.error('WhatsApp Official API error:', error.response?.data || error.message);
        return {
          success: false,
          error: error.response?.data?.error?.message || error.message
        };
      }
    },
    
    evolution: async (message) => {
      try {
        // Evolution API endpoint
        const url = `${EVOLUTION_API_URL}/api/${message.instance}/messages/send`;
        
        // Message payload
        const payload = {
          number: message.to,
          options: {
            delay: 1200,
            presence: 'composing'
          },
          textMessage: {
            text: message.content
          }
        };
        
        // Send message
        const response = await axios.post(url, payload, {
          headers: {
            'Authorization': `Bearer ${EVOLUTION_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        return {
          success: true,
          message_id: response.data.key?.id,
          status: 'sent'
        };
      } catch (error) {
        console.error('Evolution API error:', error.response?.data || error.message);
        return {
          success: false,
          error: error.response?.data?.message || error.message
        };
      }
    }
  },
  
  sms: {
    twilio: async (message) => {
      // TODO: Implement Twilio SMS integration
      console.log('Twilio SMS integration not yet implemented');
      return { success: false, error: 'Not implemented' };
    }
  },
  
  email: {
    sendgrid: async (message) => {
      // TODO: Implement SendGrid email integration
      console.log('SendGrid email integration not yet implemented');
      return { success: false, error: 'Not implemented' };
    }
  },
  
  voice: {
    asterisk: async (call) => {
      // TODO: Implement Asterisk integration
      console.log('Asterisk integration not yet implemented');
      return { success: false, error: 'Not implemented' };
    }
  }
};

// API Endpoints
// MCP Client registration endpoint
app.post('/api/clients/register', async (req, res) => {
  try {
    const { clientId, clientName, clientType, token } = req.body;
    
    if (!clientId || !clientName || !clientType || !token) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    // Register MCP client
    mcpClients.set(clientId, {
      id: clientId,
      name: clientName,
      type: clientType,
      token,
      status: 'active',
      lastSeen: new Date(),
      features: req.body.features || []
    });
    
    // Store in database for persistence
    await pool.query(
      'INSERT INTO mcp_clients (client_id, client_name, client_type, status) VALUES ($1, $2, $3, $4) ON CONFLICT (client_id) DO UPDATE SET client_name = $2, client_type = $3, status = $4, last_seen = NOW()',
      [clientId, clientName, clientType, 'active']
    );
    
    console.log(`MCP Client registered: ${clientName} (${clientId})`);
    
    // Broadcast client connection to all users
    io.emit('mcp:client:connected', {
      clientId,
      clientName,
      clientType,
      features: req.body.features || []
    });
    
    return res.json({
      success: true,
      message: 'Client registered successfully'
    });
  } catch (error) {
    console.error('Error registering MCP client:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to register client'
    });
  }
});

// WhatsApp webhook endpoint for Official API
app.post('/webhook/whatsapp', async (req, res) => {
  // Verify webhooks from Meta for WhatsApp cloud API
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.challenge']) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    // Verify the correct token
    if (token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('WhatsApp webhook verified');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  
  try {
    const data = req.body;
    
    // Check if this is a message notification
    if (data.object === 'whatsapp_business_account') {
      // Process WhatsApp message
      if (data.entry && data.entry.length > 0) {
        const entry = data.entry[0];
        
        if (entry.changes && entry.changes.length > 0) {
          const change = entry.changes[0];
          
          if (change.value && change.value.messages && change.value.messages.length > 0) {
            // Handle messages
            const message = change.value.messages[0];
            const from = message.from;
            
            console.log(`Received WhatsApp message from ${from}`);
            
            // Process message based on type
            if (message.type === 'text') {
              const text = message.text.body;
              
              // Find or create contact
              const contactResult = await pool.query(
                'SELECT id FROM leads WHERE phone = $1',
                [from]
              );
              
              let leadId;
              
              if (contactResult.rows.length === 0) {
                // Create new lead
                const newLeadResult = await pool.query(
                  'INSERT INTO leads (phone, source, status) VALUES ($1, $2, $3) RETURNING id',
                  [from, 'whatsapp', 'new']
                );
                
                leadId = newLeadResult.rows[0].id;
              } else {
                leadId = contactResult.rows[0].id;
              }
              
              // Find or create conversation
              const conversationResult = await pool.query(
                'SELECT id FROM conversations WHERE lead_id = $1 AND channel = $2 ORDER BY created_at DESC LIMIT 1',
                [leadId, 'whatsapp']
              );
              
              let conversationId;
              
              if (conversationResult.rows.length === 0) {
                // Create new conversation
                const newConversationResult = await pool.query(
                  'INSERT INTO conversations (lead_id, channel, status, last_activity_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
                  [leadId, 'whatsapp', 'active']
                );
                
                conversationId = newConversationResult.rows[0].id;
              } else {
                conversationId = conversationResult.rows[0].id;
                
                // Update conversation
                await pool.query(
                  'UPDATE conversations SET status = $1, last_activity_at = NOW() WHERE id = $2',
                  ['active', conversationId]
                );
              }
              
              // Store message
              await pool.query(
                'INSERT INTO messages (conversation_id, sender_type, content, message_type, external_id) VALUES ($1, $2, $3, $4, $5)',
                [conversationId, 'lead', text, 'text', message.id]
              );
              
              // Broadcast message to connected clients
              io.emit('mcp:whatsapp:message', {
                from,
                text,
                leadId,
                conversationId,
                messageId: message.id,
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      }
    }
    
    return res.sendStatus(200);
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    return res.sendStatus(500);
  }
});

// Evolution API webhook endpoint
app.post('/webhook/evolution', async (req, res) => {
  try {
    const data = req.body;
    
    if (data.event === 'message') {
      const message = data.data;
      const from = message.from.replace(/\D/g, ''); // Clean phone number
      
      console.log(`Received Evolution API message from ${from}`);
      
      if (message.type === 'text') {
        const text = message.content;
        
        // Find or create contact
        const contactResult = await pool.query(
          'SELECT id FROM leads WHERE phone = $1',
          [from]
        );
        
        let leadId;
        
        if (contactResult.rows.length === 0) {
          // Create new lead
          const newLeadResult = await pool.query(
            'INSERT INTO leads (phone, source, status) VALUES ($1, $2, $3) RETURNING id',
            [from, 'whatsapp_evolution', 'new']
          );
          
          leadId = newLeadResult.rows[0].id;
        } else {
          leadId = contactResult.rows[0].id;
        }
        
        // Find or create conversation
        const conversationResult = await pool.query(
          'SELECT id FROM conversations WHERE lead_id = $1 AND channel = $2 ORDER BY created_at DESC LIMIT 1',
          [leadId, 'whatsapp']
        );
        
        let conversationId;
        
        if (conversationResult.rows.length === 0) {
          // Create new conversation
          const newConversationResult = await pool.query(
            'INSERT INTO conversations (lead_id, channel, status, last_activity_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
            [leadId, 'whatsapp', 'active']
          );
          
          conversationId = newConversationResult.rows[0].id;
        } else {
          conversationId = conversationResult.rows[0].id;
          
          // Update conversation
          await pool.query(
            'UPDATE conversations SET status = $1, last_activity_at = NOW() WHERE id = $2',
            ['active', conversationId]
          );
        }
        
        // Store message
        await pool.query(
          'INSERT INTO messages (conversation_id, sender_type, content, message_type, external_id) VALUES ($1, $2, $3, $4, $5)',
          [conversationId, 'lead', text, 'text', message.id]
        );
        
        // Broadcast message to connected clients
        io.emit('mcp:whatsapp:message', {
          from,
          text,
          leadId,
          conversationId,
          messageId: message.id,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return res.sendStatus(200);
  } catch (error) {
    console.error('Error processing Evolution webhook:', error);
    return res.sendStatus(500);
  }
});

// Asterisk SIP event endpoint
app.post('/sip/event', async (req, res) => {
  try {
    const event = req.body;
    
    console.log(`Received SIP event: ${event.type}`);
    
    // Process based on event type
    switch (event.type) {
      case 'incoming_call':
        // Handle incoming call
        console.log(`Incoming call from ${event.caller} on trunk ${event.trunk}`);
        
        // Broadcast to connected clients
        io.emit('mcp:sip:incoming_call', {
          callId: event.callId,
          caller: event.caller,
          trunk: event.trunk,
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'call_answered':
        // Handle call answered
        console.log(`Call ${event.callId} answered`);
        
        // Update call status in database
        await pool.query(
          'UPDATE calls SET status = $1, start_time = NOW() WHERE id = $2',
          ['active', event.callId]
        );
        
        // Broadcast to connected clients
        io.emit('mcp:sip:call_answered', {
          callId: event.callId,
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'call_ended':
        // Handle call ended
        console.log(`Call ${event.callId} ended, duration: ${event.duration}s`);
        
        // Update call status in database
        await pool.query(
          'UPDATE calls SET status = $1, end_time = NOW(), duration = $2 WHERE id = $3',
          ['completed', event.duration, event.callId]
        );
        
        // Broadcast to connected clients
        io.emit('mcp:sip:call_ended', {
          callId: event.callId,
          duration: event.duration,
          timestamp: new Date().toISOString()
        });
        break;
        
      default:
        console.log(`Unhandled SIP event type: ${event.type}`);
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error processing SIP event:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Calendar integration webhook
app.post('/webhook/calendar', async (req, res) => {
  try {
    const event = req.body;
    
    console.log(`Received calendar event: ${event.type}`);
    
    // Process based on event type
    switch (event.type) {
      case 'appointment_created':
        // Handle new appointment
        console.log(`New appointment: ${event.title} at ${event.startTime}`);
        
        // Create callback record
        const callbackResult = await pool.query(
          'INSERT INTO callbacks (lead_id, agent_id, scheduled_at, notes, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [event.leadId, event.agentId, new Date(event.startTime), event.description, 'scheduled']
        );
        
        // Broadcast to connected clients
        io.emit('mcp:calendar:appointment_created', {
          callbackId: callbackResult.rows[0].id,
          leadId: event.leadId,
          agentId: event.agentId,
          title: event.title,
          startTime: event.startTime,
          endTime: event.endTime,
          description: event.description
        });
        break;
        
      case 'appointment_updated':
        // Handle updated appointment
        console.log(`Updated appointment: ${event.title} at ${event.startTime}`);
        
        // Update callback record
        await pool.query(
          'UPDATE callbacks SET scheduled_at = $1, notes = $2 WHERE id = $3',
          [new Date(event.startTime), event.description, event.callbackId]
        );
        
        // Broadcast to connected clients
        io.emit('mcp:calendar:appointment_updated', {
          callbackId: event.callbackId,
          leadId: event.leadId,
          agentId: event.agentId,
          title: event.title,
          startTime: event.startTime,
          endTime: event.endTime,
          description: event.description
        });
        break;
        
      case 'appointment_cancelled':
        // Handle cancelled appointment
        console.log(`Cancelled appointment: ${event.callbackId}`);
        
        // Update callback record
        await pool.query(
          'UPDATE callbacks SET status = $1 WHERE id = $2',
          ['cancelled', event.callbackId]
        );
        
        // Broadcast to connected clients
        io.emit('mcp:calendar:appointment_cancelled', {
          callbackId: event.callbackId,
          reason: event.reason
        });
        break;
        
      default:
        console.log(`Unhandled calendar event type: ${event.type}`);
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error processing calendar event:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    clients: mcpClients.size,
    connections: connections.size
  });
});

// Initialize the server
async function initServer() {
  try {
    // Verify database connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();
    
    // Create tables if needed
    await setupDatabase();
    
    // Set up Socket.IO authentication middleware
    io.use(async (socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }
      
      try {
        // Verify JWT token
        const payload = jwt.verify(token, JWT_SECRET);
        socket.user = payload;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
    
    // Socket.IO connection handling
    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.user_id}`);
      
      // Store connection
      connections.set(socket.user.user_id, socket);
      
      // Send welcome message
      socket.emit('mcp:connected', {
        userId: socket.user.user_id,
        message: 'Connected to Message Control Protocol server'
      });
      
      // Send active MCP clients
      const activeClients = Array.from(mcpClients.values())
        .filter(client => client.status === 'active')
        .map(client => ({
          id: client.id,
          name: client.name,
          type: client.type,
          features: client.features
        }));
      
      socket.emit('mcp:clients', { clients: activeClients });
      
      // Handle events
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.user_id}`);
        connections.delete(socket.user.user_id);
      });
      
      // Handle messages
      socket.on('mcp:message', (data) => {
        handleMessage(socket, data);
      });
      
      // Handle call events
      socket.on('mcp:call', (data) => {
        handleCallEvent(socket, data);
      });
      
      // Handle WhatsApp message send requests
      socket.on('mcp:whatsapp:send', (data) => {
        handleWhatsAppMessageSend(socket, data);
      });
      
      // Handle calendar events
      socket.on('mcp:calendar:create', (data) => {
        handleCalendarEventCreate(socket, data);
      });
    });
    
    // Start server
    const PORT = process.env.MCP_PORT || 9000;
    server.listen(PORT, () => {
      console.log(`MCP Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize MCP server:', error);
    process.exit(1);
  }
}

/**
 * Set up database tables
 */
async function setupDatabase() {
  try {
    const client = await pool.connect();
    
    // Create MCP clients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mcp_clients (
        client_id VARCHAR(100) PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        client_type VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        last_seen TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Load existing clients
    const clientsResult = await client.query('SELECT * FROM mcp_clients WHERE status = $1', ['active']);
    
    for (const client of clientsResult.rows) {
      mcpClients.set(client.client_id, {
        id: client.client_id,
        name: client.client_name,
        type: client.client_type,
        status: client.status,
        lastSeen: client.last_seen,
        features: []
      });
    }
    
    console.log(`Loaded ${mcpClients.size} active MCP clients`);
    
    client.release();
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}

/**
 * Handle incoming messages
 */
async function handleMessage(socket, data) {
  const { type, payload } = data;
  
  try {
    switch (type) {
      case 'chat:message':
        await handleChatMessage(socket, payload);
        break;
      
      case 'chat:typing':
        await handleTypingIndicator(socket, payload);
        break;
      
      default:
        console.log(`Unknown message type: ${type}`);
    }
  } catch (error) {
    console.error(`Error handling message (${type}):`, error);
    socket.emit('mcp:error', {
      message: `Error processing message: ${error.message}`,
      originalType: type
    });
  }
}

/**
 * Handle chat messages
 */
async function handleChatMessage(socket, payload) {
  const { conversationId, message, recipientId } = payload;
  
  if (!conversationId || !message) {
    throw new Error('Missing required fields (conversationId, message)');
  }
  
  try {
    // Store message in database
    const result = await pool.query(
      'INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [conversationId, 'agent', socket.user.user_id, message, 'text']
    );
    
    const newMessage = result.rows[0];
    
    // Update conversation last activity
    await pool.query(
      'UPDATE conversations SET last_activity_at = NOW() WHERE id = $1',
      [conversationId]
    );
    
    // Acknowledge message receipt to sender
    socket.emit('mcp:message:sent', {
      messageId: newMessage.id,
      conversationId,
      timestamp: newMessage.created_at
    });
    
    // If recipient is connected, forward the message
    if (recipientId && connections.has(recipientId)) {
      const recipientSocket = connections.get(recipientId);
      recipientSocket.emit('mcp:message:received', {
        messageId: newMessage.id,
        conversationId,
        senderId: socket.user.user_id,
        senderName: socket.user.name,
        content: message,
        timestamp: newMessage.created_at
      });
    }
  } catch (error) {
    console.error('Error handling chat message:', error);
    throw new Error('Failed to process message');
  }
}

/**
 * Handle typing indicators
 */
async function handleTypingIndicator(socket, payload) {
  const { conversationId, recipientId, isTyping } = payload;
  
  if (!conversationId || recipientId === undefined) {
    throw new Error('Missing required fields (conversationId, recipientId)');
  }
  
  // If recipient is connected, forward the typing indicator
  if (connections.has(recipientId)) {
    const recipientSocket = connections.get(recipientId);
    recipientSocket.emit('mcp:typing', {
      conversationId,
      senderId: socket.user.user_id,
      isTyping
    });
  }
}

/**
 * Handle call events
 */
async function handleCallEvent(socket, data) {
  const { action, payload } = data;
  
  try {
    switch (action) {
      case 'initiate':
        await handleCallInitiation(socket, payload);
        break;
      
      case 'answer':
        await handleCallAnswer(socket, payload);
        break;
      
      case 'end':
        await handleCallEnd(socket, payload);
        break;
      
      case 'hold':
        await handleCallHold(socket, payload);
        break;
      
      case 'transfer':
        await handleCallTransfer(socket, payload);
        break;
      
      default:
        console.log(`Unknown call action: ${action}`);
    }
  } catch (error) {
    console.error(`Error handling call event (${action}):`, error);
    socket.emit('mcp:error', {
      message: `Error processing call event: ${error.message}`,
      originalAction: action
    });
  }
}

/**
 * Handle call initiation
 */
async function handleCallInitiation(socket, payload) {
  const { leadId, phoneNumber } = payload;
  
  if (!leadId && !phoneNumber) {
    throw new Error('Missing required fields (either leadId or phoneNumber)');
  }
  
  try {
    let leadPhone;
    let leadName;
    
    // Get lead information if leadId is provided
    if (leadId) {
      const leadResult = await pool.query(
        'SELECT name, phone FROM leads WHERE id = $1',
        [leadId]
      );
      
      if (leadResult.rows.length === 0) {
        throw new Error('Lead not found');
      }
      
      leadPhone = leadResult.rows[0].phone;
      leadName = leadResult.rows[0].name;
      
      if (!leadPhone) {
        throw new Error('Lead has no phone number');
      }
    } else {
      leadPhone = phoneNumber;
      leadName = 'Unknown';
    }
    
    // TODO: Integrate with Asterisk to initiate call
    
    // Create call record in database
    const callResult = await pool.query(
      'INSERT INTO calls (lead_id, agent_id, direction, status, start_time) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [leadId, socket.user.user_id, 'outbound', 'initiating']
    );
    
    const newCall = callResult.rows[0];
    
    // Create or update conversation
    let conversationId;
    
    // Check if conversation exists
    if (leadId) {
      const conversationResult = await pool.query(
        'SELECT id FROM conversations WHERE lead_id = $1 AND channel = $2 ORDER BY created_at DESC LIMIT 1',
        [leadId, 'call']
      );
      
      if (conversationResult.rows.length > 0) {
        conversationId = conversationResult.rows[0].id;
        
        // Update conversation
        await pool.query(
          'UPDATE conversations SET status = $1, last_activity_at = NOW() WHERE id = $2',
          ['active', conversationId]
        );
      } else {
        // Create new conversation
        const newConversationResult = await pool.query(
          'INSERT INTO conversations (lead_id, channel, status, last_activity_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
          [leadId, 'call', 'active']
        );
        
        conversationId = newConversationResult.rows[0].id;
      }
      
      // Update call with conversation ID
      await pool.query(
        'UPDATE calls SET conversation_id = $1 WHERE id = $2',
        [conversationId, newCall.id]
      );
    }
    
    // Send call initiation event to the client
    socket.emit('mcp:call:initiating', {
      callId: newCall.id,
      leadId,
      leadName,
      phoneNumber: leadPhone,
      conversationId
    });
    
    // TODO: Update this with actual Asterisk call status
    setTimeout(() => {
      // Update call status to ringing
      pool.query(
        'UPDATE calls SET status = $1 WHERE id = $2',
        ['ringing', newCall.id]
      );
      
      socket.emit('mcp:call:ringing', {
        callId: newCall.id,
        leadId,
        leadName,
        phoneNumber: leadPhone
      });
    }, 2000);
  } catch (error) {
    console.error('Error handling call initiation:', error);
    throw new Error('Failed to initiate call');
  }
}

/**
 * Handle call answer
 */
async function handleCallAnswer(socket, payload) {
  // TODO: Implement call answer logic
  console.log('Call answer not yet implemented');
}

/**
 * Handle call end
 */
async function handleCallEnd(socket, payload) {
  // TODO: Implement call end logic
  console.log('Call end not yet implemented');
}

/**
 * Handle call hold
 */
async function handleCallHold(socket, payload) {
  // TODO: Implement call hold logic
  console.log('Call hold not yet implemented');
}

/**
 * Handle call transfer
 */
async function handleCallTransfer(socket, payload) {
  // TODO: Implement call transfer logic
  console.log('Call transfer not yet implemented');
}

/**
 * Handle WhatsApp message send
 */
async function handleWhatsAppMessageSend(socket, data) {
  const { conversationId, to, content, provider = 'official', instance = 'default' } = data;
  
  if (!to || !content) {
    socket.emit('mcp:whatsapp:error', {
      error: 'Missing required fields (to, content)',
      originalData: data
    });
    return;
  }
  
  try {
    console.log(`Sending WhatsApp message to ${to} using ${provider} provider`);
    
    // Get the appropriate provider function
    const providerFn = channelProviders.whatsapp[provider];
    
    if (!providerFn) {
      throw new Error(`Unsupported WhatsApp provider: ${provider}`);
    }
    
    // Send message using the provider
    const result = await providerFn({
      to,
      content,
      instance,
      sender: socket.user.user_id
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send message');
    }
    
    console.log(`WhatsApp message sent to ${to}, ID: ${result.message_id}`);
    
    // If we have a conversation ID, store the message in database
    if (conversationId) {
      // Store message in database
      const messageResult = await pool.query(
        'INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type, external_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [conversationId, 'agent', socket.user.user_id, content, 'text', result.message_id]
      );
      
      // Update conversation last activity
      await pool.query(
        'UPDATE conversations SET last_activity_at = NOW() WHERE id = $1',
        [conversationId]
      );
      
      // Acknowledge message sent to sender
      socket.emit('mcp:whatsapp:sent', {
        messageId: messageResult.rows[0].id,
        externalId: result.message_id,
        conversationId,
        to,
        timestamp: messageResult.rows[0].created_at
      });
    } else {
      // Just acknowledge message sent
      socket.emit('mcp:whatsapp:sent', {
        externalId: result.message_id,
        to,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    socket.emit('mcp:whatsapp:error', {
      error: error.message,
      originalData: data
    });
  }
}

/**
 * Handle calendar event creation
 */
async function handleCalendarEventCreate(socket, data) {
  const { leadId, startTime, endTime, title, description, reminders } = data;
  
  if (!leadId || !startTime || !title) {
    socket.emit('mcp:calendar:error', {
      error: 'Missing required fields (leadId, startTime, title)',
      originalData: data
    });
    return;
  }
  
  try {
    console.log(`Creating calendar event: ${title} at ${startTime}`);
    
    // Get lead information
    const leadResult = await pool.query(
      'SELECT name, phone, email FROM leads WHERE id = $1',
      [leadId]
    );
    
    if (leadResult.rows.length === 0) {
      throw new Error('Lead not found');
    }
    
    const lead = leadResult.rows[0];
    
    // Create callback record
    const callbackResult = await pool.query(
      'INSERT INTO callbacks (lead_id, agent_id, scheduled_at, notes, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [leadId, socket.user.user_id, new Date(startTime), description || title, 'scheduled']
    );
    
    const callback = callbackResult.rows[0];
    
    // Create reminders if requested
    if (reminders && Array.isArray(reminders) && reminders.length > 0) {
      for (const reminder of reminders) {
        const { minutes, channel } = reminder;
        
        if (!minutes || !channel) {
          continue;
        }
        
        const reminderTime = new Date(startTime);
        reminderTime.setMinutes(reminderTime.getMinutes() - minutes);
        
        await pool.query(
          'INSERT INTO reminders (callback_id, reminder_time, channel, status) VALUES ($1, $2, $3, $4)',
          [callback.id, reminderTime, channel, 'pending']
        );
      }
    }
    
    // Acknowledge event creation
    socket.emit('mcp:calendar:created', {
      callbackId: callback.id,
      leadId,
      leadName: lead.name,
      startTime,
      endTime: endTime || new Date(new Date(startTime).getTime() + 30 * 60000).toISOString(), // Default 30 min
      title,
      description: description || title
    });
    
    // Broadcast event creation to all users
    io.emit('mcp:calendar:event_created', {
      callbackId: callback.id,
      agentId: socket.user.user_id,
      agentName: socket.user.name,
      leadId,
      leadName: lead.name,
      startTime,
      endTime: endTime || new Date(new Date(startTime).getTime() + 30 * 60000).toISOString(),
      title,
      description: description || title
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    socket.emit('mcp:calendar:error', {
      error: error.message,
      originalData: data
    });
  }
}

// Initialize server
initServer();
