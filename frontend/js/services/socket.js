/**
 * Socket Service for WebSocket communication
 */
class SocketService {
  constructor(token) {
    this.socket = null;
    this.token = token;
    this.baseUrl = 'ws://localhost:8001'; // WebSocket server URL
    this.events = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.connect();
  }
  
  /**
   * Connect to the WebSocket server
   */
  connect() {
    try {
      this.socket = new WebSocket(`${this.baseUrl}?token=${this.token}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0;
        this.triggerEvent('connect');
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed');
        this.triggerEvent('disconnect');
        
        // Attempt to reconnect
        this.attemptReconnect();
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
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
      }, this.reconnectDelay);
    } else {
      console.log('Max reconnect attempts reached');
      this.triggerEvent('reconnect_failed');
    }
  }
  
  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    if (data.event && typeof data.event === 'string') {
      this.triggerEvent(data.event, data.payload);
    }
  }
  
  /**
   * Send data to the WebSocket server
   */
  send(event, payload = {}) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        event,
        payload
      });
      
      this.socket.send(message);
      return true;
    } else {
      console.error('WebSocket is not connected');
      return false;
    }
  }
  
  /**
   * Register an event handler
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
    
    return this;
  }
  
  /**
   * Remove an event handler
   */
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    
    return this;
  }
  
  /**
   * Trigger an event
   */
  triggerEvent(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        callback(data);
      });
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}