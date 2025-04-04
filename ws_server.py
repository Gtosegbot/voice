"""
WebSocket server for real-time communication in VoiceAI Platform

This server provides real-time communication between the different components
of the VoiceAI platform, such as:
- Frontend client applications
- Backend server instances
- MCP (Message Control Protocol) server
- External integrations (Asterisk, WhatsApp, etc.)

It acts as a message broker for real-time events and notifications.
"""

import asyncio
import websockets
import json
import logging
import os
import jwt
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
PORT = int(os.environ.get('WS_PORT', 8765))
JWT_SECRET = os.environ.get('JWT_SECRET', 'voiceai-secret-key')

# Connected clients
clients = {}

async def authenticate(websocket, path):
    """Authenticate client using JWT token"""
    # Wait for authentication message
    try:
        auth_msg = await asyncio.wait_for(websocket.recv(), timeout=10.0)
        auth_data = json.loads(auth_msg)
        
        if not auth_data.get('token'):
            await websocket.send(json.dumps({
                'type': 'error',
                'message': 'Authentication failed: Missing token'
            }))
            return None
        
        # Verify token
        try:
            token = auth_data.get('token')
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            user_id = payload.get('sub')
            
            # Return user ID if authentication successful
            return user_id
        except jwt.ExpiredSignatureError:
            await websocket.send(json.dumps({
                'type': 'error',
                'message': 'Authentication failed: Token expired'
            }))
            return None
        except jwt.InvalidTokenError:
            await websocket.send(json.dumps({
                'type': 'error',
                'message': 'Authentication failed: Invalid token'
            }))
            return None
    except asyncio.TimeoutError:
        await websocket.send(json.dumps({
            'type': 'error',
            'message': 'Authentication failed: Timeout'
        }))
        return None
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        await websocket.send(json.dumps({
            'type': 'error',
            'message': f'Authentication failed: {str(e)}'
        }))
        return None

async def handle_client(websocket, path):
    """Handle WebSocket client connection"""
    # Authenticate client
    user_id = await authenticate(websocket, path)
    
    if not user_id:
        return
    
    # Store client connection
    if user_id in clients:
        # Close existing connection
        try:
            await clients[user_id].send(json.dumps({
                'type': 'disconnect',
                'message': 'New connection established'
            }))
            await clients[user_id].close()
        except Exception:
            pass
    
    clients[user_id] = websocket
    
    # Send welcome message
    await websocket.send(json.dumps({
        'type': 'connected',
        'message': 'Connected to VoiceAI platform',
        'timestamp': datetime.utcnow().isoformat()
    }))
    
    logger.info(f"Client connected: User ID {user_id}")
    
    try:
        # Handle messages
        async for message in websocket:
            try:
                data = json.loads(message)
                event_type = data.get('type')
                payload = data.get('payload')
                
                # Handle different event types
                if event_type == 'ping':
                    await websocket.send(json.dumps({
                        'type': 'pong',
                        'timestamp': datetime.utcnow().isoformat()
                    }))
                else:
                    logger.info(f"Received event: {event_type}")
                    # Process other events as needed
            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
                await websocket.send(json.dumps({
                    'type': 'error',
                    'message': 'Invalid JSON format'
                }))
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Connection closed: User ID {user_id}")
    except Exception as e:
        logger.error(f"Error handling client: {str(e)}")
    finally:
        # Remove client on disconnect
        if user_id in clients and clients[user_id] == websocket:
            del clients[user_id]
            logger.info(f"Client removed: User ID {user_id}")

async def broadcast_message(event, payload):
    """Broadcast message to all connected clients"""
    if not clients:
        return
    
    message = json.dumps({
        'type': event,
        'payload': payload,
        'timestamp': datetime.utcnow().isoformat()
    })
    
    # Send to all connected clients
    disconnected_clients = []
    for user_id, websocket in clients.items():
        try:
            await websocket.send(message)
        except websockets.exceptions.ConnectionClosed:
            disconnected_clients.append(user_id)
        except Exception as e:
            logger.error(f"Error sending message to client {user_id}: {str(e)}")
            disconnected_clients.append(user_id)
    
    # Remove disconnected clients
    for user_id in disconnected_clients:
        if user_id in clients:
            del clients[user_id]
            logger.info(f"Client removed: User ID {user_id}")

async def send_to_user(user_id, event, payload):
    """Send message to a specific user"""
    if user_id not in clients:
        logger.warning(f"User not connected: {user_id}")
        return False
    
    message = json.dumps({
        'type': event,
        'payload': payload,
        'timestamp': datetime.utcnow().isoformat()
    })
    
    try:
        await clients[user_id].send(message)
        return True
    except websockets.exceptions.ConnectionClosed:
        # Remove client if connection closed
        del clients[user_id]
        logger.info(f"Client removed: User ID {user_id}")
        return False
    except Exception as e:
        logger.error(f"Error sending message to client {user_id}: {str(e)}")
        return False

async def main():
    """Main function to start WebSocket server"""
    # WebSocket server port
    port = int(os.environ.get('WS_PORT', 8765))
    
    # Start WebSocket server
    async with websockets.serve(handle_client, '0.0.0.0', port):
        logger.info(f"WebSocket server started on port {port}")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped")
