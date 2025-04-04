/**
 * API Service
 * This service handles all API calls to the backend server
 */

class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:5001/api';
        this.token = localStorage.getItem('token') || null;
    }

    /**
     * Set the authentication token
     * @param {string} token - JWT token
     */
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    /**
     * Get the authentication token
     * @returns {string} JWT token
     */
    getToken() {
        return this.token;
    }

    /**
     * Create headers for API requests
     * @param {boolean} includeContentType - Whether to include Content-Type header
     * @returns {Headers} Headers object
     */
    getHeaders(includeContentType = true) {
        const headers = new Headers();
        
        if (includeContentType) {
            headers.append('Content-Type', 'application/json');
        }
        
        if (this.token) {
            headers.append('Authorization', `Bearer ${this.token}`);
        }
        
        return headers;
    }

    /**
     * Make a GET request to the API
     * @param {string} endpoint - API endpoint
     * @returns {Promise} Promise with response data
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            return this.handleResponse(response);
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    }

    /**
     * Make a POST request to the API
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request data
     * @returns {Promise} Promise with response data
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            return this.handleResponse(response);
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    }

    /**
     * Make a PUT request to the API
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request data
     * @returns {Promise} Promise with response data
     */
    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            return this.handleResponse(response);
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    }

    /**
     * Make a DELETE request to the API
     * @param {string} endpoint - API endpoint
     * @returns {Promise} Promise with response data
     */
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            return this.handleResponse(response);
        } catch (error) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    }

    /**
     * Handle API response
     * @param {Response} response - Fetch response object
     * @returns {Promise} Promise with response data
     */
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            
            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || 'API Error',
                    errors: data.errors || null
                };
            }
            
            return data;
        } else {
            const text = await response.text();
            
            if (!response.ok) {
                throw {
                    status: response.status,
                    message: text || 'API Error'
                };
            }
            
            return text;
        }
    }

    // Authentication API Calls
    
    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} Promise with user data
     */
    async login(email, password) {
        const data = await this.post('/auth/login', { email, password });
        this.setToken(data.token);
        return data;
    }
    
    /**
     * Register new user
     * @param {string} name - User name
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} Promise with user data
     */
    async register(name, email, password) {
        const data = await this.post('/auth/register', { name, email, password });
        this.setToken(data.token);
        return data;
    }
    
    /**
     * Get current user data
     * @returns {Promise} Promise with user data
     */
    async getCurrentUser() {
        return this.get('/auth/me');
    }
    
    /**
     * Logout user
     */
    logout() {
        this.setToken(null);
    }
    
    // Leads API Calls
    
    /**
     * Get all leads
     * @param {object} params - Optional query parameters
     * @returns {Promise} Promise with leads data
     */
    async getLeads(params = {}) {
        const queryString = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        
        return this.get(`/leads${queryString ? `?${queryString}` : ''}`);
    }
    
    /**
     * Get lead by ID
     * @param {number} id - Lead ID
     * @returns {Promise} Promise with lead data
     */
    async getLead(id) {
        return this.get(`/leads/${id}`);
    }
    
    /**
     * Create new lead
     * @param {object} leadData - Lead data
     * @returns {Promise} Promise with created lead data
     */
    async createLead(leadData) {
        return this.post('/leads', leadData);
    }
    
    /**
     * Update lead
     * @param {number} id - Lead ID
     * @param {object} leadData - Lead data to update
     * @returns {Promise} Promise with updated lead data
     */
    async updateLead(id, leadData) {
        return this.put(`/leads/${id}`, leadData);
    }
    
    /**
     * Delete lead
     * @param {number} id - Lead ID
     * @returns {Promise} Promise with delete status
     */
    async deleteLead(id) {
        return this.delete(`/leads/${id}`);
    }
    
    // Conversations API Calls
    
    /**
     * Get all conversations
     * @param {object} params - Optional query parameters
     * @returns {Promise} Promise with conversations data
     */
    async getConversations(params = {}) {
        const queryString = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        
        return this.get(`/conversations${queryString ? `?${queryString}` : ''}`);
    }
    
    /**
     * Get conversation by ID
     * @param {number} id - Conversation ID
     * @returns {Promise} Promise with conversation data
     */
    async getConversation(id) {
        return this.get(`/conversations/${id}`);
    }
    
    /**
     * Create new conversation
     * @param {object} conversationData - Conversation data
     * @returns {Promise} Promise with created conversation data
     */
    async createConversation(conversationData) {
        return this.post('/conversations', conversationData);
    }
    
    /**
     * Create conversation with a new lead
     * @param {object} data - Conversation and lead data
     * @returns {Promise} Promise with created conversation data
     */
    async createConversationWithNewLead(data) {
        return this.post('/conversations/with-new-lead', data);
    }
    
    /**
     * Get messages for a conversation
     * @param {number} id - Conversation ID
     * @returns {Promise} Promise with messages data
     */
    async getMessages(id) {
        return this.get(`/conversations/${id}/messages`);
    }
    
    /**
     * Create message in a conversation
     * @param {number} id - Conversation ID
     * @param {object} messageData - Message data
     * @returns {Promise} Promise with created message data
     */
    async createMessage(id, messageData) {
        return this.post(`/conversations/${id}/messages`, messageData);
    }
    
    /**
     * Update conversation status
     * @param {number} id - Conversation ID
     * @param {string} status - New status
     * @returns {Promise} Promise with updated conversation data
     */
    async updateConversationStatus(id, status) {
        return this.put(`/conversations/${id}/status`, { status });
    }
    
    // Campaigns API Calls
    
    /**
     * Get all campaigns
     * @returns {Promise} Promise with campaigns data
     */
    async getCampaigns() {
        return this.get('/campaigns');
    }
    
    /**
     * Get campaign by ID
     * @param {number} id - Campaign ID
     * @returns {Promise} Promise with campaign data
     */
    async getCampaign(id) {
        return this.get(`/campaigns/${id}`);
    }
    
    /**
     * Create new campaign
     * @param {object} campaignData - Campaign data
     * @returns {Promise} Promise with created campaign data
     */
    async createCampaign(campaignData) {
        return this.post('/campaigns', campaignData);
    }
    
    // Flows API Calls
    
    /**
     * Get all flows
     * @returns {Promise} Promise with flows data
     */
    async getFlows() {
        return this.get('/flows');
    }
    
    /**
     * Get flow by ID
     * @param {number} id - Flow ID
     * @returns {Promise} Promise with flow data
     */
    async getFlow(id) {
        return this.get(`/flows/${id}`);
    }
    
    /**
     * Create new flow
     * @param {object} flowData - Flow data
     * @returns {Promise} Promise with created flow data
     */
    async createFlow(flowData) {
        return this.post('/flows', flowData);
    }
    
    /**
     * Update flow
     * @param {number} id - Flow ID
     * @param {object} flowData - Flow data to update
     * @returns {Promise} Promise with updated flow data
     */
    async updateFlow(id, flowData) {
        return this.put(`/flows/${id}`, flowData);
    }
    
    // Call API Calls
    
    /**
     * Initiate a call
     * @param {string} phoneNumber - Phone number to call
     * @param {number} leadId - Lead ID (optional)
     * @returns {Promise} Promise with call data
     */
    async initiateCall(phoneNumber, leadId = null) {
        return this.post('/calls/initiate', { phone_number: phoneNumber, lead_id: leadId });
    }
    
    /**
     * End a call
     * @param {string} callId - Call ID
     * @returns {Promise} Promise with call end status
     */
    async endCall(callId) {
        return this.post(`/calls/${callId}/end`);
    }
    
    /**
     * Get call status
     * @param {string} callId - Call ID
     * @returns {Promise} Promise with call status
     */
    async getCallStatus(callId) {
        return this.get(`/calls/${callId}/status`);
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
