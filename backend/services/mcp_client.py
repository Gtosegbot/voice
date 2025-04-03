"""
MCP (Message Control Protocol) client for the VoiceAI platform
"""

import os
import requests
import json
import time
from flask import current_app
import socketio

class MCPClient:
    def __init__(self):
        self.base_url = os.environ.get('MCP_SERVER_URL', 'http://localhost:8002')
        self.token = os.environ.get('MCP_API_TOKEN')
        self.socket = None
        self.is_connected = False
        self.client_id = f"backend-{int(time.time())}"
        self.event_handlers = {}
    
    def connect(self):
        """Connect to MCP server via Socket.IO"""
        try:
            self.socket = socketio.Client()
            
            # Set up event handlers
            @self.socket.on('connect')
            def on_connect():
                current_app.logger.info('Connected to MCP server')
                self.is_connected = True
            
            @self.socket.on('disconnect')
            def on_disconnect():
                current_app.logger.info('Disconnected from MCP server')
                self.is_connected = False
            
            @self.socket.on('mcp:connected')
            def on_mcp_connected(data):
                current_app.logger.info(f'MCP connection established: {data}')
            
            @self.socket.on('mcp:error')
            def on_mcp_error(data):
                current_app.logger.error(f'MCP error: {data}')
            
            @self.socket.on('mcp:message:received')
            def on_message(data):
                self._handle_event('message:received', data)
            
            @self.socket.on('mcp:call')
            def on_call_event(data):
                event_type = data.get('action', 'unknown')
                self._handle_event(f'call:{event_type}', data)
            
            # Connect to the socket server
            self.socket.connect(
                self.base_url,
                auth={
                    'token': self.token,
                    'clientId': self.client_id
                }
            )
            
            return True
        except Exception as e:
            current_app.logger.error(f'Failed to connect to MCP server: {str(e)}')
            return False
    
    def disconnect(self):
        """Disconnect from MCP server"""
        if self.socket and self.is_connected:
            self.socket.disconnect()
            self.is_connected = False
    
    def on(self, event, handler):
        """Register event handler"""
        if event not in self.event_handlers:
            self.event_handlers[event] = []
        
        self.event_handlers[event].append(handler)
    
    def _handle_event(self, event, data):
        """Handle incoming events"""
        if event in self.event_handlers:
            for handler in self.event_handlers[event]:
                try:
                    handler(data)
                except Exception as e:
                    current_app.logger.error(f'Error in MCP event handler ({event}): {str(e)}')
    
    def send_message(self, conversation_id, message, recipient_id=None):
        """Send message via MCP"""
        if not self.is_connected:
            if not self.connect():
                return {
                    'success': False,
                    'error': 'Not connected to MCP server'
                }
        
        try:
            self.socket.emit('mcp:message', {
                'type': 'chat:message',
                'payload': {
                    'conversationId': conversation_id,
                    'message': message,
                    'recipientId': recipient_id
                }
            })
            
            return {
                'success': True
            }
        except Exception as e:
            current_app.logger.error(f'Error sending message via MCP: {str(e)}')
            return {
                'success': False,
                'error': str(e)
            }
    
    def send_typing_indicator(self, conversation_id, recipient_id, is_typing=True):
        """Send typing indicator via MCP"""
        if not self.is_connected:
            if not self.connect():
                return {
                    'success': False,
                    'error': 'Not connected to MCP server'
                }
        
        try:
            self.socket.emit('mcp:message', {
                'type': 'chat:typing',
                'payload': {
                    'conversationId': conversation_id,
                    'recipientId': recipient_id,
                    'isTyping': is_typing
                }
            })
            
            return {
                'success': True
            }
        except Exception as e:
            current_app.logger.error(f'Error sending typing indicator via MCP: {str(e)}')
            return {
                'success': False,
                'error': str(e)
            }
    
    def initiate_call(self, lead_id, phone_number=None):
        """Initiate call via MCP"""
        if not self.is_connected:
            if not self.connect():
                return {
                    'success': False,
                    'error': 'Not connected to MCP server'
                }
        
        try:
            self.socket.emit('mcp:call', {
                'action': 'initiate',
                'payload': {
                    'leadId': lead_id,
                    'phoneNumber': phone_number
                }
            })
            
            return {
                'success': True
            }
        except Exception as e:
            current_app.logger.error(f'Error initiating call via MCP: {str(e)}')
            return {
                'success': False,
                'error': str(e)
            }
    
    def end_call(self, call_id):
        """End call via MCP"""
        if not self.is_connected:
            if not self.connect():
                return {
                    'success': False,
                    'error': 'Not connected to MCP server'
                }
        
        try:
            self.socket.emit('mcp:call', {
                'action': 'end',
                'payload': {
                    'callId': call_id
                }
            })
            
            return {
                'success': True
            }
        except Exception as e:
            current_app.logger.error(f'Error ending call via MCP: {str(e)}')
            return {
                'success': False,
                'error': str(e)
            }
    
    def send_whatsapp_message(self, phone_number, message, attachment_url=None):
        """Send WhatsApp message via MCP"""
        try:
            url = f"{self.base_url}/api/whatsapp/send"
            
            payload = {
                'to': phone_number,
                'message': message
            }
            
            if attachment_url:
                payload['attachment'] = attachment_url
            
            response = requests.post(
                url,
                headers={
                    'Authorization': f'Bearer {self.token}',
                    'Content-Type': 'application/json'
                },
                json=payload
            )
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'message_id': response.json().get('id')
                }
            else:
                return {
                    'success': False,
                    'error': f"Failed to send WhatsApp message: {response.text}"
                }
        except Exception as e:
            current_app.logger.error(f'Error sending WhatsApp message via MCP: {str(e)}')
            return {
                'success': False,
                'error': str(e)
            }
    
    def schedule_callback(self, phone_number, lead_id, scheduled_time, agent_id=None):
        """Schedule a callback via MCP"""
        try:
            url = f"{self.base_url}/api/calendar/schedule"
            
            payload = {
                'type': 'callback',
                'phone': phone_number,
                'leadId': lead_id,
                'scheduledTime': scheduled_time,
                'agentId': agent_id
            }
            
            response = requests.post(
                url,
                headers={
                    'Authorization': f'Bearer {self.token}',
                    'Content-Type': 'application/json'
                },
                json=payload
            )
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'event_id': response.json().get('id')
                }
            else:
                return {
                    'success': False,
                    'error': f"Failed to schedule callback: {response.text}"
                }
        except Exception as e:
            current_app.logger.error(f'Error scheduling callback via MCP: {str(e)}')
            return {
                'success': False,
                'error': str(e)
            }

# Create a global instance
mcp_client = MCPClient()
