/**
 * API service for communicating with the backend
 */

// API base URL
const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Send a request to the API
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request data
 * @returns {Promise} - Promise that resolves to the API response
 */
async function apiRequest(method, endpoint, data = null) {
    // Get token from local storage
    const token = localStorage.getItem('token');
    
    // Build request options
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    // Add authorization header if token exists
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add request body for POST and PUT requests
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    // Build URL
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Send request
    try {
        const response = await fetch(url, options);
        
        // Check if response is ok
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Something went wrong');
        }
        
        // Return response
        return response;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

/**
 * API class for making requests
 */
class API {
    /**
     * Send a GET request to the API
     * @param {string} endpoint - API endpoint
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async get(endpoint) {
        return apiRequest('GET', endpoint);
    }
    
    /**
     * Send a POST request to the API
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async post(endpoint, data) {
        return apiRequest('POST', endpoint, data);
    }
    
    /**
     * Send a PUT request to the API
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async put(endpoint, data) {
        return apiRequest('PUT', endpoint, data);
    }
    
    /**
     * Send a DELETE request to the API
     * @param {string} endpoint - API endpoint
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async delete(endpoint) {
        return apiRequest('DELETE', endpoint);
    }
    
    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async login(email, password) {
        return apiRequest('POST', '/auth/login', { email, password });
    }
    
    /**
     * Register user
     * @param {string} name - User name
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async register(name, email, password) {
        return apiRequest('POST', '/auth/register', { name, email, password });
    }
    
    /**
     * Get current user
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async getCurrentUser() {
        return apiRequest('GET', '/auth/me');
    }
    
    /**
     * Get leads
     * @param {number} page - Page number
     * @param {number} limit - Number of items per page
     * @param {string} search - Search term
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async getLeads(page = 1, limit = 10, search = '') {
        return apiRequest('GET', `/leads?page=${page}&limit=${limit}&search=${search}`);
    }
    
    /**
     * Get lead by ID
     * @param {number} id - Lead ID
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async getLead(id) {
        return apiRequest('GET', `/leads/${id}`);
    }
    
    /**
     * Create lead
     * @param {Object} leadData - Lead data
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async createLead(leadData) {
        return apiRequest('POST', '/leads', leadData);
    }
    
    /**
     * Update lead
     * @param {number} id - Lead ID
     * @param {Object} leadData - Lead data
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async updateLead(id, leadData) {
        return apiRequest('PUT', `/leads/${id}`, leadData);
    }
    
    /**
     * Delete lead
     * @param {number} id - Lead ID
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async deleteLead(id) {
        return apiRequest('DELETE', `/leads/${id}`);
    }
    
    /**
     * Get conversations
     * @param {number} page - Page number
     * @param {number} limit - Number of items per page
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async getConversations(page = 1, limit = 10) {
        return apiRequest('GET', `/conversations?page=${page}&limit=${limit}`);
    }
    
    /**
     * Get conversation by ID
     * @param {number} id - Conversation ID
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async getConversation(id) {
        return apiRequest('GET', `/conversations/${id}`);
    }
    
    /**
     * Get conversation messages
     * @param {number} id - Conversation ID
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async getConversationMessages(id) {
        return apiRequest('GET', `/conversations/${id}/messages`);
    }
    
    /**
     * Send message to conversation
     * @param {number} id - Conversation ID
     * @param {string} message - Message text
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async sendMessage(id, message) {
        return apiRequest('POST', `/conversations/${id}/messages`, { message });
    }
    
    /**
     * Get campaigns
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async getCampaigns() {
        return apiRequest('GET', '/campaigns');
    }
    
    /**
     * Get campaign by ID
     * @param {number} id - Campaign ID
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async getCampaign(id) {
        return apiRequest('GET', `/campaigns/${id}`);
    }
    
    /**
     * Create campaign
     * @param {Object} campaignData - Campaign data
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async createCampaign(campaignData) {
        return apiRequest('POST', '/campaigns', campaignData);
    }
    
    /**
     * Update campaign
     * @param {number} id - Campaign ID
     * @param {Object} campaignData - Campaign data
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async updateCampaign(id, campaignData) {
        return apiRequest('PUT', `/campaigns/${id}`, campaignData);
    }
    
    /**
     * Delete campaign
     * @param {number} id - Campaign ID
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async deleteCampaign(id) {
        return apiRequest('DELETE', `/campaigns/${id}`);
    }
    
    /**
     * Get callbacks
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async getCallbacks() {
        return apiRequest('GET', '/callbacks');
    }
    
    /**
     * Get callback by ID
     * @param {number} id - Callback ID
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async getCallback(id) {
        return apiRequest('GET', `/callbacks/${id}`);
    }
    
    /**
     * Create callback
     * @param {Object} callbackData - Callback data
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async createCallback(callbackData) {
        return apiRequest('POST', '/callbacks', callbackData);
    }
    
    /**
     * Update callback
     * @param {number} id - Callback ID
     * @param {Object} callbackData - Callback data
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async updateCallback(id, callbackData) {
        return apiRequest('PUT', `/callbacks/${id}`, callbackData);
    }
    
    /**
     * Delete callback
     * @param {number} id - Callback ID
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async deleteCallback(id) {
        return apiRequest('DELETE', `/callbacks/${id}`);
    }
    
    /**
     * Get users (admin only)
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async getUsers() {
        return apiRequest('GET', '/admin/users');
    }
    
    /**
     * Get user by ID (admin only)
     * @param {number} id - User ID
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async getUser(id) {
        return apiRequest('GET', `/admin/users/${id}`);
    }
    
    /**
     * Create user (admin only)
     * @param {Object} userData - User data
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async createUser(userData) {
        return apiRequest('POST', '/admin/users', userData);
    }
    
    /**
     * Update user (admin only)
     * @param {number} id - User ID
     * @param {Object} userData - User data
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async updateUser(id, userData) {
        return apiRequest('PUT', `/admin/users/${id}`, userData);
    }
    
    /**
     * Delete user (admin only)
     * @param {number} id - User ID
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async deleteUser(id) {
        return apiRequest('DELETE', `/admin/users/${id}`);
    }
    
    /**
     * Get system settings (admin only)
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async getSystemSettings() {
        return apiRequest('GET', '/admin/settings');
    }
    
    /**
     * Update system settings (admin only)
     * @param {Object} settingsData - Settings data
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async updateSystemSettings(settingsData) {
        return apiRequest('PUT', '/admin/settings', settingsData);
    }
    
    /**
     * Get system logs (admin only)
     * @returns {Promise} - Promise that resolves to the API response
     */
    static async getSystemLogs() {
        return apiRequest('GET', '/admin/logs');
    }
}

// Expose to window object
window.API = API;
window.apiRequest = apiRequest;