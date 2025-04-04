/**
 * WhatsApp MCP Client Example
 * 
 * This is an example of a WhatsApp client that connects to the MCP server
 * and handles WhatsApp messages through the official WhatsApp API.
 */

const io = require('socket.io-client');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuration
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:9000';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
const CLIENT_ID = 'whatsapp-official';
const CLIENT_NAME = 'WhatsApp Official API Client';
const CLIENT_TYPE = 'whatsapp';
const CLIENT_PORT = process.env.WHATSAPP_CLIENT_PORT || 3001;

// WhatsApp API configuration
const WHATSAPP_BUSINESS_ID = process.env.WHATSAPP_BUSINESS_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'example-verify-token';

// Create Express app for webhooks
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create a JWT token for authentication
function createToken() {
  const payload = {
    user_id: 'whatsapp-system',
    name: 'WhatsApp System',
    role: 'system',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  
  return jwt.sign(payload, JWT_SECRET);
}

// Register with MCP server
async function registerClient() {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/api/clients/register`, {
      clientId: CLIENT_ID,
      clientName: CLIENT_NAME,
      clientType: CLIENT_TYPE,
      token: 'whatsapp-token',
      features: ['messaging', 'templates', 'media']
    });
    
    if (response.data.success) {
      console.log('Registered with MCP server successfully');
      return true;
    } else {
      console.error('Failed to register with MCP server:', response.data.error);
      return false;
    }
  } catch (error) {
    console.error('Error registering with MCP server:', error.message);
    return false;
  }
}

// Connect to MCP server
function connectToMCP() {
  const token = createToken();
  
  const socket = io(MCP_SERVER_URL, {
    auth: {
      token
    }
  });
  
  // Connection events
  socket.on('connect', () => {
    console.log('Connected to MCP server');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from MCP server');
  });
  
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
  });
  
  // MCP events
  socket.on('mcp:connected', (data) => {
    console.log(`MCP connection confirmed: ${data.message}`);
  });
  
  // Specific WhatsApp events
  socket.on('mcp:whatsapp:send', async (data) => {
    console.log(`Request to send WhatsApp message to ${data.to}`);
    
    try {
      const result = await sendWhatsAppMessage(data.to, data.content);
      socket.emit('mcp:whatsapp:sent', {
        ...data,
        messageId: result.message_id,
        timestamp: new Date().toISOString(),
        status: 'sent'
      });
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      socket.emit('mcp:whatsapp:error', {
        to: data.to,
        error: error.message
      });
    }
  });
  
  return socket;
}

// Send a WhatsApp message using the official API
async function sendWhatsAppMessage(to, content) {
  try {
    // WhatsApp Cloud API endpoint
    const url = `https://graph.facebook.com/v17.0/${WHATSAPP_BUSINESS_ID}/messages`;
    
    // Message payload
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { 
        body: content 
      }
    };
    
    // Send message
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`WhatsApp message sent to ${to}`);
    
    return {
      success: true,
      message_id: response.data.messages[0].id,
      status: 'sent'
    };
  } catch (error) {
    console.error('WhatsApp API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || error.message);
  }
}

// Webhook endpoint for WhatsApp
app.get('/webhook', (req, res) => {
  // Handle verification request from Meta
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.challenge']) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    // Verify the correct token
    if (token === WHATSAPP_VERIFY_TOKEN) {
      console.log('WhatsApp webhook verified');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  
  return res.sendStatus(400);
});

// Webhook endpoint for WhatsApp messages
app.post('/webhook', async (req, res) => {
  try {
    // Forward to MCP server
    await axios.post(`${MCP_SERVER_URL}/webhook/whatsapp`, req.body);
    
    return res.sendStatus(200);
  } catch (error) {
    console.error('Error forwarding webhook to MCP server:', error);
    return res.sendStatus(500);
  }
});

// Start HTTP server for webhooks
function startWebhookServer() {
  app.listen(CLIENT_PORT, () => {
    console.log(`WhatsApp webhook server running on port ${CLIENT_PORT}`);
  });
}

// Main function
async function main() {
  try {
    // Register client
    const registered = await registerClient();
    
    if (!registered) {
      console.error('Could not register client. Retrying in 10 seconds...');
      setTimeout(main, 10000);
      return;
    }
    
    // Connect to MCP
    const socket = connectToMCP();
    
    // Start webhook server
    startWebhookServer();
    
    // Keep process running
    console.log('WhatsApp client running. Press Ctrl+C to exit.');
    
    // Example: Periodically show connection status
    setInterval(() => {
      if (socket.connected) {
        console.log('WhatsApp client is connected to MCP server');
      } else {
        console.log('WhatsApp client is disconnected from MCP server');
        socket.connect();
      }
    }, 30000);
    
  } catch (error) {
    console.error('Error in WhatsApp MCP client:', error);
    console.log('Retrying in 10 seconds...');
    setTimeout(main, 10000);
  }
}

// Run main function
main();