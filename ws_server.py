"""
WebSocket server for real-time communication in VoiceAI Platform
"""

import asyncio
import websockets
import json
import jwt
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get JWT secret from environment variables
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-for-development')

# Store connected clients
connected_clients = {}

async def authenticate(websocket, path):
    """Authenticate client using JWT token"""
    # Get token from query parameters
    query_params = {}
    if '?' in path:
        query_string = path.split('?')[1]
        query_params = {k: v for k, v in [param.split('=') for param in query_string.split('&')]}
    
    token = query_params.get('token')
    
    if not token:
        await websocket.send(json.dumps({
            'event': 'error',
            'payload': {'message': 'Missing authentication token'}
        }))
        return None
    
    try:
        # Verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        if not user_id:
            await websocket.send(json.dumps({
                'event': 'error',
                'payload': {'message': 'Invalid token'}
            }))
            return None
        
        return {
            'user_id': user_id,
            'email': payload.get('email'),
            'role': payload.get('role')
        }
    except jwt.ExpiredSignatureError:
        await websocket.send(json.dumps({
            'event': 'error',
            'payload': {'message': 'Token expired'}
        }))
        return None
    except jwt.InvalidTokenError:
        await websocket.send(json.dumps({
            'event': 'error',
            'payload': {'message': 'Invalid token'}
        }))
        return None

async def handle_client(websocket, path):
    """Handle WebSocket client connection"""
    # Authenticate client
    user = await authenticate(websocket, path)
    
    if not user:
        return
    
    user_id = user['user_id']
    
    # Add client to connected clients
    connected_clients[user_id] = websocket
    
    # Send welcome message
    await websocket.send(json.dumps({
        'event': 'connected',
        'payload': {
            'message': 'Successfully connected to WebSocket server',
            'user': user
        }
    }))
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                event = data.get('event')
                payload = data.get('payload', {})
                
                # Log received message
                print(f"Received {event} event from user {user_id} with payload: {payload}")
                
                # Handle different event types
                if event == 'ping':
                    await websocket.send(json.dumps({
                        'event': 'pong',
                        'payload': {'timestamp': payload.get('timestamp')}
                    }))
                elif event == 'subscribe':
                    # Handle channel subscription
                    channel = payload.get('channel')
                    if channel:
                        # TODO: Implement channel subscription logic
                        await websocket.send(json.dumps({
                            'event': 'subscribed',
                            'payload': {'channel': channel}
                        }))
                elif event == 'direct_message':
                    # Handle direct message to another user
                    recipient_id = payload.get('recipient_id')
                    message_content = payload.get('message')
                    
                    if recipient_id and message_content and recipient_id in connected_clients:
                        recipient_ws = connected_clients[recipient_id]
                        await recipient_ws.send(json.dumps({
                            'event': 'direct_message',
                            'payload': {
                                'sender_id': user_id,
                                'message': message_content
                            }
                        }))
                        
                        # Send confirmation to sender
                        await websocket.send(json.dumps({
                            'event': 'message_sent',
                            'payload': {
                                'recipient_id': recipient_id,
                                'message': message_content
                            }
                        }))
                    else:
                        # Recipient not found or invalid message
                        await websocket.send(json.dumps({
                            'event': 'error',
                            'payload': {
                                'message': 'Failed to send message',
                                'reason': 'Recipient not found or invalid message'
                            }
                        }))
                # Add more event handlers here
            except json.JSONDecodeError:
                await websocket.send(json.dumps({
                    'event': 'error',
                    'payload': {'message': 'Invalid JSON format'}
                }))
    except websockets.exceptions.ConnectionClosed:
        print(f"Connection closed for user {user_id}")
    finally:
        # Remove client from connected clients
        if user_id in connected_clients:
            del connected_clients[user_id]

async def broadcast_message(event, payload):
    """Broadcast message to all connected clients"""
    message = json.dumps({
        'event': event,
        'payload': payload
    })
    
    disconnected_clients = []
    
    for user_id, websocket in connected_clients.items():
        try:
            await websocket.send(message)
        except websockets.exceptions.ConnectionClosed:
            disconnected_clients.append(user_id)
    
    # Remove disconnected clients
    for user_id in disconnected_clients:
        if user_id in connected_clients:
            del connected_clients[user_id]

async def send_to_user(user_id, event, payload):
    """Send message to a specific user"""
    if user_id in connected_clients:
        try:
            await connected_clients[user_id].send(json.dumps({
                'event': event,
                'payload': payload
            }))
            return True
        except websockets.exceptions.ConnectionClosed:
            # Remove disconnected client
            del connected_clients[user_id]
            return False
    return False

async def main():
    """Main function to start WebSocket server"""
    host = os.environ.get('WS_HOST', '0.0.0.0')
    port = int(os.environ.get('WS_PORT', 8001))
    
    print(f"Starting WebSocket server on {host}:{port}")
    
    server = await websockets.serve(handle_client, host, port)
    
    # Keep the server running
    await server.wait_closed()

if __name__ == '__main__':
    # Run the WebSocket server
    asyncio.run(main())