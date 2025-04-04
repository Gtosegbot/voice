/**
 * WebSocket service for VoiceAI platform
 */

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        this.eventHandlers = {};
        this.socketUrl = 'ws://localhost:8765';
    }
    
    /**
     * Connect to WebSocket server
     */
    connect(token) {
        if (this.socket) {
            this.disconnect();
        }
        
        this.socket = new WebSocket(this.socketUrl);
        
        // Set up event handlers
        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // Send authentication message
            this.socket.send(JSON.stringify({
                token: token
            }));
            
            // Trigger connect event
            this._triggerEvent('connect');
        };
        
        this.socket.onclose = (event) => {
            console.log('WebSocket disconnected', event);
            this.isConnected = false;
            
            // Try to reconnect if not closed cleanly
            if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                setTimeout(() => {
                    this.connect(token);
                }, this.reconnectDelay * this.reconnectAttempts);
            }
            
            // Trigger disconnect event
            this._triggerEvent('disconnect');
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error', error);
            
            // Trigger error event
            this._triggerEvent('error', error);
        };
        
        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const eventType = data.type;
                
                // Trigger event
                this._triggerEvent(eventType, data.payload);
                
                // Also trigger message event
                this._triggerEvent('message', data);
            } catch (error) {
                console.error('Error parsing WebSocket message', error);
            }
        };
    }
    
    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
        }
    }
    
    /**
     * Send message to WebSocket server
     */
    send(type, payload = {}) {
        if (!this.isConnected) {
            console.error('WebSocket not connected');
            return false;
        }
        
        try {
            this.socket.send(JSON.stringify({
                type,
                payload,
                timestamp: new Date().toISOString()
            }));
            return true;
        } catch (error) {
            console.error('Error sending WebSocket message', error);
            return false;
        }
    }
    
    /**
     * Register event handler
     */
    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        
        this.eventHandlers[event].push(handler);
    }
    
    /**
     * Remove event handler
     */
    off(event, handler) {
        if (!this.eventHandlers[event]) {
            return;
        }
        
        if (!handler) {
            // Remove all handlers for this event
            delete this.eventHandlers[event];
        } else {
            // Remove specific handler
            this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
        }
    }
    
    /**
     * Trigger event
     */
    _triggerEvent(event, data) {
        if (!this.eventHandlers[event]) {
            return;
        }
        
        for (const handler of this.eventHandlers[event]) {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in ${event} handler:`, error);
            }
        }
    }
    
    /**
     * Send ping message
     */
    ping() {
        return this.send('ping');
    }
    
    /**
     * Start ping interval
     */
    startPingInterval(interval = 30000) {
        this.pingInterval = setInterval(() => {
            if (this.isConnected) {
                this.ping();
            }
        }, interval);
    }
    
    /**
     * Stop ping interval
     */
    stopPingInterval() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }
}

// Create global instance
window.socketService = new SocketService();
