/**
 * Store for application state management
 */

class Store {
    constructor() {
        // Application state
        this.state = {
            currentUser: null,
            isAuthenticated: false,
            leads: [],
            leadsPagination: {
                page: 1,
                perPage: 10,
                total: 0,
                pages: 0
            },
            conversations: [],
            currentConversation: null,
            messages: [],
            activeCall: null,
            notification: null
        };
        
        // State change listeners
        this.listeners = [];
        
        // Load authentication state
        this.loadAuthState();
    }
    
    /**
     * Subscribe to state changes
     */
    subscribe(listener) {
        this.listeners.push(listener);
        
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    /**
     * Update state
     */
    setState(newState) {
        this.state = {
            ...this.state,
            ...newState
        };
        
        // Notify listeners
        this.notifyListeners();
    }
    
    /**
     * Notify listeners of state change
     */
    notifyListeners() {
        for (const listener of this.listeners) {
            listener(this.state);
        }
    }
    
    /**
     * Load authentication state from local storage
     */
    loadAuthState() {
        const token = ApiService.getAuthToken();
        
        if (token) {
            this.setState({
                isAuthenticated: true
            });
            
            // Load user data
            this.loadUserData();
        }
    }
    
    /**
     * Load user data from API
     */
    async loadUserData() {
        try {
            const userData = await ApiService.getCurrentUser();
            
            this.setState({
                currentUser: userData.user,
                isAuthenticated: true
            });
            
            return userData.user;
        } catch (error) {
            console.error('Error loading user data:', error);
            // Clear auth if token is invalid
            this.clearAuth();
            return null;
        }
    }
    
    /**
     * Login user
     */
    async login(email, password) {
        try {
            const data = await ApiService.login(email, password);
            
            this.setState({
                currentUser: data.user,
                isAuthenticated: true
            });
            
            return data.user;
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Register user
     */
    async register(name, email, password) {
        try {
            const data = await ApiService.register(name, email, password);
            
            this.setState({
                currentUser: data.user,
                isAuthenticated: true
            });
            
            return data.user;
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Logout user
     */
    async logout() {
        try {
            await ApiService.logout();
        } catch (error) {
            console.error('Error logging out:', error);
        }
        
        this.clearAuth();
    }
    
    /**
     * Clear authentication state
     */
    clearAuth() {
        ApiService.clearAuthToken();
        
        this.setState({
            currentUser: null,
            isAuthenticated: false
        });
    }
    
    /**
     * Set notification
     */
    setNotification(message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };
        
        this.setState({
            notification
        });
        
        // Auto-clear notification
        if (duration > 0) {
            setTimeout(() => {
                if (this.state.notification && this.state.notification.id === notification.id) {
                    this.setState({
                        notification: null
                    });
                }
            }, duration);
        }
        
        return notification;
    }
    
    /**
     * Clear notification
     */
    clearNotification() {
        this.setState({
            notification: null
        });
    }
    
    /**
     * Load leads
     */
    async loadLeads(params = {}) {
        try {
            const data = await ApiService.getLeads(params);
            
            this.setState({
                leads: data.leads,
                leadsPagination: data.pagination
            });
            
            return data;
        } catch (error) {
            console.error('Error loading leads:', error);
            throw error;
        }
    }
    
    /**
     * Load conversations
     */
    async loadConversations(params = {}) {
        try {
            const data = await ApiService.getConversations(params);
            
            this.setState({
                conversations: data.conversations
            });
            
            return data.conversations;
        } catch (error) {
            console.error('Error loading conversations:', error);
            throw error;
        }
    }
    
    /**
     * Load conversation messages
     */
    async loadMessages(conversationId) {
        try {
            const data = await ApiService.getMessages(conversationId);
            
            this.setState({
                messages: data.messages
            });
            
            return data.messages;
        } catch (error) {
            console.error('Error loading messages:', error);
            throw error;
        }
    }
    
    /**
     * Send message
     */
    async sendMessage(conversationId, content, messageType = 'text') {
        try {
            const data = await ApiService.sendMessage(conversationId, content, messageType);
            
            // Add message to state
            this.setState({
                messages: [...this.state.messages, data.message]
            });
            
            return data.message;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
    
    /**
     * Set active call
     */
    setActiveCall(call) {
        this.setState({
            activeCall: call
        });
    }
    
    /**
     * Clear active call
     */
    clearActiveCall() {
        this.setState({
            activeCall: null
        });
    }
}

// Create global store instance
window.store = new Store();
