/**
 * Message Control Protocol (MCP) Server
 * 
 * The MCP server acts as a central communication hub for the VoiceAI platform.
 * It connects different communication channels (Asterisk for voice, WhatsApp API, etc.)
 * and integrates with AI services (Speech-to-Text, LLMs, Text-to-Speech).
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

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

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';

// Client connections
const connections = new Map();

// Initialize the server
async function initServer() {
  try {
    // Verify database connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();
    
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
    });
    
    // Start server
    const PORT = process.env.MCP_PORT || 8002;
    server.listen(PORT, () => {
      console.log(`MCP Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize MCP server:', error);
    process.exit(1);
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

// Initialize server
initServer();
