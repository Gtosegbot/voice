/**
 * MCP Client Example
 * 
 * This is a simple example of a client that connects to the MCP server
 * and demonstrates basic functionality.
 */

const io = require('socket.io-client');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuration
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:9000';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
const CLIENT_ID = 'example-client';
const CLIENT_NAME = 'Example MCP Client';
const CLIENT_TYPE = 'example';

// Create a JWT token for authentication
function createToken() {
  const payload = {
    user_id: 'system-client',
    name: 'System Client',
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
      token: 'example-token',
      features: ['messaging', 'notifications']
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
  
  socket.on('mcp:clients', (data) => {
    console.log(`Active MCP clients: ${data.clients.length}`);
    data.clients.forEach(client => {
      console.log(`- ${client.name} (${client.id}, ${client.type})`);
    });
  });
  
  // WhatsApp events
  socket.on('mcp:whatsapp:message', (data) => {
    console.log(`WhatsApp message from ${data.from}: ${data.text}`);
  });
  
  // Calendar events
  socket.on('mcp:calendar:appointment_created', (data) => {
    console.log(`New appointment: ${data.title} at ${data.startTime}`);
  });
  
  // SIP events
  socket.on('mcp:sip:incoming_call', (data) => {
    console.log(`Incoming call from ${data.caller} on trunk ${data.trunk}`);
  });
  
  return socket;
}

// Main function
async function main() {
  try {
    // Register client
    const registered = await registerClient();
    
    if (!registered) {
      console.error('Could not register client. Exiting...');
      process.exit(1);
    }
    
    // Connect to MCP
    const socket = connectToMCP();
    
    // Keep process running
    console.log('Client running. Press Ctrl+C to exit.');
    
    // Example: Periodically show connection status
    setInterval(() => {
      if (socket.connected) {
        console.log('Client is connected to MCP server');
      } else {
        console.log('Client is disconnected from MCP server');
      }
    }, 30000);
    
  } catch (error) {
    console.error('Error in MCP client:', error);
    process.exit(1);
  }
}

// Run main function
main();