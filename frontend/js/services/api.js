/**
 * API service for VoiceAI platform
 */

const API_BASE_URL = 'http://localhost:5001/api';

class ApiService {
    /**
     * Get auth token from local storage
     */
    static getAuthToken() {
        return localStorage.getItem('authToken');
    }
    
    /**
     * Set auth token in local storage
     */
    static setAuthToken(token) {
        localStorage.setItem('authToken', token);
    }
    
    /**
     * Clear auth token from local storage
     */
    static clearAuthToken() {
        localStorage.removeItem('authToken');
    }
    
    /**
     * Check if user is authenticated
     */
    static isAuthenticated() {
        return !!this.getAuthToken();
    }
    
    /**
     * Make API request with authentication
     */
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        // Set default headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // Add authorization header if token exists
        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Make request
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            // Parse JSON response
            const data = await response.json();
            
            // Handle errors
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }
    
    /**
     * Login user
     */
    static async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        // Save token
        this.setAuthToken(data.token);
        
        return data;
    }
    
    /**
     * Register user
     */
    static async register(name, email, password) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        
        // Save token
        this.setAuthToken(data.token);
        
        return data;
    }
    
    /**
     * Get current user
     */
    static async getCurrentUser() {
        return this.request('/auth/me');
    }
    
    /**
     * Change user password
     */
    static async changePassword(currentPassword, newPassword) {
        return this.request('/auth/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }
    
    /**
     * Logout user
     */
    static async logout() {
        this.clearAuthToken();
        return this.request('/auth/logout', { method: 'POST' });
    }
    
    /**
     * Get leads
     */
    static async getLeads(params = {}) {
        const queryParams = new URLSearchParams();
        
        // Add query parameters
        if (params.page) queryParams.append('page', params.page);
        if (params.perPage) queryParams.append('perPage', params.perPage);
        if (params.status) queryParams.append('status', params.status);
        if (params.source) queryParams.append('source', params.source);
        if (params.search) queryParams.append('search', params.search);
        
        const queryString = queryParams.toString();
        return this.request(`/leads?${queryString}`);
    }
    
    /**
     * Get a specific lead
     */
    static async getLead(leadId) {
        return this.request(`/leads/${leadId}`);
    }
    
    /**
     * Create a new lead
     */
    static async createLead(leadData) {
        return this.request('/leads', {
            method: 'POST',
            body: JSON.stringify(leadData)
        });
    }
    
    /**
     * Update a lead
     */
    static async updateLead(leadId, leadData) {
        return this.request(`/leads/${leadId}`, {
            method: 'PUT',
            body: JSON.stringify(leadData)
        });
    }
    
    /**
     * Delete a lead
     */
    static async deleteLead(leadId) {
        return this.request(`/leads/${leadId}`, {
            method: 'DELETE'
        });
    }
    
    /**
     * Export leads to CSV
     */
    static async exportLeads(params = {}) {
        const queryParams = new URLSearchParams();
        
        // Add query parameters
        if (params.status) queryParams.append('status', params.status);
        if (params.source) queryParams.append('source', params.source);
        
        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/leads/export?${queryString}`;
        
        // Get auth token
        const token = this.getAuthToken();
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'leads_export.csv';
        
        // Add authorization header (for Blob URLs)
        link.setAttribute('download', '');
        link.setAttribute('target', '_blank');
        
        // Append to body and click
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
    }
    
    /**
     * Get conversations
     */
    static async getConversations(params = {}) {
        const queryParams = new URLSearchParams();
        
        // Add query parameters
        if (params.status) queryParams.append('status', params.status);
        if (params.channel) queryParams.append('channel', params.channel);
        if (params.search) queryParams.append('search', params.search);
        
        const queryString = queryParams.toString();
        return this.request(`/conversations?${queryString}`);
    }
    
    /**
     * Get a specific conversation
     */
    static async getConversation(conversationId) {
        return this.request(`/conversations/${conversationId}`);
    }
    
    /**
     * Create a new conversation
     */
    static async createConversation(conversationData) {
        return this.request('/conversations', {
            method: 'POST',
            body: JSON.stringify(conversationData)
        });
    }
    
    /**
     * Create a new conversation with a new lead
     */
    static async createConversationWithNewLead(data) {
        return this.request('/conversations/with-new-lead', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    /**
     * Get messages for a conversation
     */
    static async getMessages(conversationId) {
        return this.request(`/conversations/${conversationId}/messages`);
    }
    
    /**
     * Send a message in a conversation
     */
    static async sendMessage(conversationId, content, messageType = 'text') {
        return this.request(`/conversations/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content, messageType })
        });
    }
    
    /**
     * Update conversation status
     */
    static async updateConversationStatus(conversationId, status) {
        return this.request(`/conversations/${conversationId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
}

// Export the API service
window.ApiService = ApiService;
