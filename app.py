"""
VoiceAI Platform - Main application entry point
"""

from backend import create_app
from backend.models.db import db
import os
import threading
import json
import logging
import requests
import time
import datetime
import websocket
import jwt
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = create_app()

# Use app.before_request instead of before_first_request in newer Flask versions
@app.before_request
def create_tables():
    """Create database tables before first request"""
    try:
        db.create_all()
        app.logger.info("Database tables created successfully")
    except Exception as e:
        app.logger.error(f"Error creating database tables: {str(e)}")

# Client Configuration
MCP_SERVER_URL = os.environ.get('MCP_SERVER_URL', 'http://localhost:9000')
WS_SERVER_URL = os.environ.get('WS_SERVER_URL', 'ws://localhost:8765')
MCP_API_TOKEN = os.environ.get('MCP_API_TOKEN', 'voiceai-mcp-token')
JWT_SECRET = os.environ.get('JWT_SECRET', 'voiceai-secret-key')

# WebSocket-based MCP client
class WebSocketMCPClient:
    def __init__(self, ws_server_url, mcp_server_url):
        self.ws_server_url = ws_server_url
        self.mcp_server_url = mcp_server_url
        self.running = False
        self.client_id = f"backend-system-{uuid.uuid4().hex[:8]}"
        self.ws = None
        self.reconnect_delay = 5  # Start with 5 seconds
        self.max_reconnect_delay = 60  # Max 1 minute between retries
    
    def start(self):
        """Start the WebSocket client"""
        self.running = True
        self._connect_to_websocket()
        
        # Register with MCP server (still using HTTP)
        self._register_with_mcp_server()
        
        return self.running
    
    def stop(self):
        """Stop the WebSocket client"""
        self.running = False
        if self.ws:
            self.ws.close()
    
    def _register_with_mcp_server(self):
        """Register with the MCP server"""
        try:
            response = requests.post(
                f"{self.mcp_server_url}/api/clients/register",
                json={
                    "clientId": self.client_id,
                    "clientName": "Backend System",
                    "clientType": "backend",
                    "token": MCP_API_TOKEN,
                    "features": ["api", "events"]
                },
                timeout=5
            )
            
            if response.status_code == 200:
                logger.info("Registered with MCP server successfully")
                return True
            else:
                logger.warning(f"Failed to register with MCP server: {response.status_code} {response.text}")
                return False
                
        except Exception as e:
            logger.warning(f"Could not register with MCP server (it may not be running yet): {str(e)}")
            return False
    
    def _connect_to_websocket(self):
        """Connect to the WebSocket server"""
        # Create a JWT token for authentication
        token = jwt.encode(
            {
                "sub": self.client_id,
                "name": "Backend System",
                "type": "backend",
                "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
            },
            JWT_SECRET,
            algorithm="HS256"
        )
        
        try:
            # Initialize WebSocket connection
            self.ws = websocket.WebSocketApp(
                self.ws_server_url,
                on_open=self._on_open,
                on_message=self._on_message,
                on_error=self._on_error,
                on_close=self._on_close
            )
            
            # Store token for authentication during connection
            self.ws.auth_token = token
            
            # Start connection in a thread
            wst = threading.Thread(target=self.ws.run_forever)
            wst.daemon = True
            wst.start()
            
            logger.info(f"WebSocket client connecting to {self.ws_server_url}")
        except Exception as e:
            logger.error(f"Failed to connect to WebSocket server: {str(e)}")
            self._schedule_reconnect()
    
    def _on_open(self, ws):
        """Callback when WebSocket connection is established"""
        logger.info("WebSocket connection established")
        
        # Send authentication message
        auth_message = {
            "token": ws.auth_token
        }
        ws.send(json.dumps(auth_message))
        
        # Reset reconnection delay on successful connection
        self.reconnect_delay = 5
    
    def _on_message(self, ws, message):
        """Callback when message is received from WebSocket server"""
        try:
            data = json.loads(message)
            event_type = data.get('type')
            
            if event_type == 'connected':
                logger.info("Authenticated with WebSocket server")
            elif event_type == 'error':
                logger.error(f"WebSocket error: {data.get('message')}")
            else:
                logger.info(f"Received event: {event_type}")
                self._process_event(data)
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {message}")
        except Exception as e:
            logger.error(f"Error processing WebSocket message: {str(e)}")
    
    def _on_error(self, ws, error):
        """Callback when WebSocket error occurs"""
        logger.error(f"WebSocket error: {str(error)}")
    
    def _on_close(self, ws, close_status_code, close_msg):
        """Callback when WebSocket connection is closed"""
        logger.warning(f"WebSocket connection closed: {close_status_code} {close_msg}")
        
        if self.running:
            self._schedule_reconnect()
    
    def _schedule_reconnect(self):
        """Schedule a reconnection attempt with exponential backoff"""
        if self.running:
            logger.info(f"Reconnecting in {self.reconnect_delay} seconds...")
            time.sleep(self.reconnect_delay)
            
            # Exponential backoff with maximum cap
            self.reconnect_delay = min(self.reconnect_delay * 1.5, self.max_reconnect_delay)
            
            # Attempt to reconnect
            self._connect_to_websocket()
    
    def _process_event(self, event):
        """Process an event received via WebSocket"""
        event_type = event.get('type')
        payload = event.get('payload', {})
        
        if event_type == 'mcp:whatsapp:message':
            logger.info(f"Received WhatsApp message from {payload.get('from')}: {payload.get('text')}")
            # TODO: Process WhatsApp message
        elif event_type == 'mcp:sip:incoming_call':
            logger.info(f"Received incoming call from {payload.get('caller')} on trunk {payload.get('trunk')}")
            # TODO: Process incoming call
        elif event_type == 'mcp:calendar:appointment_created':
            logger.info(f"Received appointment creation: {payload.get('title')} at {payload.get('startTime')}")
            # TODO: Process appointment creation
        elif event_type == 'pong':
            # Normal ping response, don't log
            pass
        else:
            logger.info(f"Received event type: {event_type}")
    
    def send_message(self, event_type, payload=None):
        """Send a message to the WebSocket server"""
        if not self.ws:
            logger.warning("Cannot send message, WebSocket not connected")
            return False
        
        message = {
            "type": event_type,
            "payload": payload or {}
        }
        
        try:
            self.ws.send(json.dumps(message))
            return True
        except Exception as e:
            logger.error(f"Error sending WebSocket message: {str(e)}")
            return False

def run_websocket_client():
    """
    Run the WebSocket client in a background thread
    """
    client = WebSocketMCPClient(WS_SERVER_URL, MCP_SERVER_URL)
    
    # Start the client
    client.start()
    
    # Keep the thread alive
    while client.running:
        # Send ping every 30 seconds to keep connection alive
        if client.ws and client.ws.sock and client.ws.sock.connected:
            client.send_message("ping")
        
        # Sleep for 30 seconds
        time.sleep(30)

# Start WebSocket client in a background thread
def start_websocket_client():
    try:
        # Start the client in a background thread
        thread = threading.Thread(target=run_websocket_client, daemon=True)
        thread.start()
        
        logger.info("WebSocket client started in background thread")
        
    except Exception as e:
        logger.error(f"Failed to start WebSocket client: {str(e)}")

if __name__ == '__main__':
    # Get port from environment or use default (5001)
    port = int(os.environ.get('PORT', 5001))
    
    # Start WebSocket client
    start_websocket_client()
    
    # Run the application
    app.run(host='0.0.0.0', port=port, debug=True)
