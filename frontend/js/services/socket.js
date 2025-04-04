/**
 * WebSocket Service
 * This service handles real-time communication with the WebSocket server
 */

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.eventHandlers = {};
        this.baseUrl = 'ws://localhost:8765';
    }

    /**
     * Initialize the WebSocket connection
     * @param {string} token - JWT authentication token
     */
    init(token) {
        if (this.socket && this.isConnected) {
            return;
        }

        this.token = token;
        this.connect();
    }

    /**
     * Connect to the WebSocket server
     */
    connect() {
        try {
            // Close existing socket if any
            if (this.socket) {
                this.socket.close();
            }

            this.socket = new WebSocket(`${this.baseUrl}?token=${this.token}`);
            
            this.socket.onopen = () => this.handleOpen();
            this.socket.onclose = (event) => this.handleClose(event);
            this.socket.onerror = (error) => this.handleError(error);
            this.socket.onmessage = (event) => this.handleMessage(event);
            
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.attemptReconnect();
        }
    }

    /**
     * Handle WebSocket open event
     */
    handleOpen() {
        console.log('WebSocket connection established');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.triggerEvent('connect', { status: 'connected' });
    }

    /**
     * Handle WebSocket close event
     * @param {CloseEvent} event - WebSocket close event
     */
    handleClose(event) {
        console.log('WebSocket connection closed:', event.code, event.reason);
        this.isConnected = false;
        this.triggerEvent('disconnect', { 
            code: event.code, 
            reason: event.reason 
        });
        this.attemptReconnect();
    }

    /**
     * Handle WebSocket error event
     * @param {Event} error - WebSocket error event
     */
    handleError(error) {
        console.error('WebSocket error:', error);
        this.triggerEvent('error', { error });
    }

    /**
     * Handle WebSocket message event
     * @param {MessageEvent} event - WebSocket message event
     */
    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            
            if (data.event) {
                this.triggerEvent(data.event, data.payload || {});
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    /**
     * Attempt to reconnect to the WebSocket server
     */
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectInterval);
        } else {
            console.error('Maximum reconnect attempts reached.');
            this.triggerEvent('reconnect_failed', {
                attempts: this.reconnectAttempts
            });
        }
    }

    /**
     * Send a message to the WebSocket server
     * @param {string} event - Event name
     * @param {object} payload - Event payload
     */
    send(event, payload = {}) {
        if (!this.isConnected) {
            console.error('Cannot send message: WebSocket is not connected');
            return false;
        }

        try {
            const message = JSON.stringify({ event, payload });
            this.socket.send(message);
            return true;
        } catch (error) {
            console.error('Error sending WebSocket message:', error);
            return false;
        }
    }

    /**
     * Register an event handler
     * @param {string} event - Event name
     * @param {function} callback - Event callback function
     */
    on(event, callback) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        
        this.eventHandlers[event].push(callback);
    }

    /**
     * Remove an event handler
     * @param {string} event - Event name
     * @param {function} callback - Event callback function to remove
     */
    off(event, callback) {
        if (!this.eventHandlers[event]) {
            return;
        }
        
        this.eventHandlers[event] = this.eventHandlers[event].filter(
            handler => handler !== callback
        );
    }

    /**
     * Trigger an event
     * @param {string} event - Event name
     * @param {object} data - Event data
     */
    triggerEvent(event, data) {
        if (!this.eventHandlers[event]) {
            return;
        }
        
        this.eventHandlers[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} event handler:`, error);
            }
        });
    }

    /**
     * Disconnect from the WebSocket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
        }
    }

    /**
     * Check if the WebSocket is connected
     * @returns {boolean} Connection status
     */
    isSocketConnected() {
        return this.isConnected;
    }

    /**
     * Send a typing indicator
     * @param {number} conversationId - Conversation ID
     * @param {boolean} isTyping - Whether the user is typing
     */
    sendTypingIndicator(conversationId, isTyping = true) {
        this.send('typing_indicator', {
            conversation_id: conversationId,
            is_typing: isTyping
        });
    }

    /**
     * Send a message to a conversation
     * @param {number} conversationId - Conversation ID
     * @param {string} content - Message content
     * @param {string} messageType - Message type (text, audio, etc.)
     */
    sendMessage(conversationId, content, messageType = 'text') {
        this.send('message', {
            conversation_id: conversationId,
            content: content,
            message_type: messageType
        });
    }

    /**
     * Send a call event
     * @param {string} action - Call action (initiate, answer, end, etc.)
     * @param {object} data - Call data
     */
    sendCallEvent(action, data = {}) {
        this.send('call_event', {
            action: action,
            ...data
        });
    }
}

// Create and export a singleton instance
const socketService = new SocketService();
