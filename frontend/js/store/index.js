/**
 * Store
 * A simple state management system for the application
 */

class Store {
    constructor() {
        this.state = {
            // User data
            user: null,
            isAuthenticated: false,
            
            // Navigation state
            currentPage: 'dashboard',
            sidebarCollapsed: false,
            
            // Data collections
            leads: [],
            conversations: [],
            campaigns: [],
            flows: [],
            
            // Pagination and filtering
            pagination: {
                leads: {
                    page: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                },
                conversations: {
                    page: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                }
            },
            
            // Filters
            filters: {
                leads: {
                    status: 'all',
                    search: '',
                    sortBy: 'created_at',
                    sortOrder: 'desc'
                },
                conversations: {
                    status: 'all',
                    search: '',
                    sortBy: 'last_activity_at',
                    sortOrder: 'desc'
                }
            },
            
            // Current active items
            currentLead: null,
            currentConversation: null,
            currentCampaign: null,
            currentFlow: null,
            
            // Call state
            activeCall: null,
            callTranscript: [],
            callInsights: null,
            
            // UI state
            loading: {},
            errors: {},
            notifications: []
        };
        
        this.listeners = [];
    }
    
    /**
     * Get the current state
     * @returns {object} Current state
     */
    getState() {
        return this.state;
    }
    
    /**
     * Update the state
     * @param {function} updater - Function that receives current state and returns updated state
     */
    setState(updater) {
        const newState = updater(this.state);
        this.state = { ...this.state, ...newState };
        this.notifyListeners();
    }
    
    /**
     * Register a listener for state changes
     * @param {function} listener - Listener function
     * @returns {function} Function to unregister the listener
     */
    subscribe(listener) {
        this.listeners.push(listener);
        
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    /**
     * Notify all listeners of state changes
     */
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }
    
    // State updaters
    
    /**
     * Set the current user
     * @param {object} user - User data
     */
    setUser(user) {
        this.setState(state => ({
            user,
            isAuthenticated: !!user
        }));
    }
    
    /**
     * Set the authentication state
     * @param {boolean} isAuthenticated - Whether the user is authenticated
     */
    setAuthenticated(isAuthenticated) {
        this.setState(state => ({ isAuthenticated }));
    }
    
    /**
     * Navigate to a page
     * @param {string} page - Page name
     */
    navigateTo(page) {
        this.setState(state => ({ currentPage: page }));
    }
    
    /**
     * Toggle the sidebar
     */
    toggleSidebar() {
        this.setState(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
    }
    
    /**
     * Set leads data
     * @param {array} leads - Leads data
     * @param {object} pagination - Pagination data
     */
    setLeads(leads, pagination = null) {
        const update = { leads };
        
        if (pagination) {
            update.pagination = {
                ...this.state.pagination,
                leads: pagination
            };
        }
        
        this.setState(state => update);
    }
    
    /**
     * Set conversations data
     * @param {array} conversations - Conversations data
     * @param {object} pagination - Pagination data
     */
    setConversations(conversations, pagination = null) {
        const update = { conversations };
        
        if (pagination) {
            update.pagination = {
                ...this.state.pagination,
                conversations: pagination
            };
        }
        
        this.setState(state => update);
    }
    
    /**
     * Set the current lead
     * @param {object} lead - Lead data
     */
    setCurrentLead(lead) {
        this.setState(state => ({ currentLead: lead }));
    }
    
    /**
     * Set the current conversation
     * @param {object} conversation - Conversation data
     */
    setCurrentConversation(conversation) {
        this.setState(state => ({ currentConversation: conversation }));
    }
    
    /**
     * Set the campaigns data
     * @param {array} campaigns - Campaigns data
     */
    setCampaigns(campaigns) {
        this.setState(state => ({ campaigns }));
    }
    
    /**
     * Set the current campaign
     * @param {object} campaign - Campaign data
     */
    setCurrentCampaign(campaign) {
        this.setState(state => ({ currentCampaign: campaign }));
    }
    
    /**
     * Set the flows data
     * @param {array} flows - Flows data
     */
    setFlows(flows) {
        this.setState(state => ({ flows }));
    }
    
    /**
     * Set the current flow
     * @param {object} flow - Flow data
     */
    setCurrentFlow(flow) {
        this.setState(state => ({ currentFlow: flow }));
    }
    
    /**
     * Set the filters for a collection
     * @param {string} collection - Collection name (leads, conversations)
     * @param {object} filters - Filters data
     */
    setFilters(collection, filters) {
        this.setState(state => ({
            filters: {
                ...state.filters,
                [collection]: {
                    ...state.filters[collection],
                    ...filters
                }
            }
        }));
    }
    
    /**
     * Set the active call data
     * @param {object} call - Call data
     */
    setActiveCall(call) {
        this.setState(state => ({ activeCall: call }));
    }
    
    /**
     * Add a message to the call transcript
     * @param {object} message - Transcript message
     */
    addCallTranscript(message) {
        this.setState(state => ({
            callTranscript: [...state.callTranscript, message]
        }));
    }
    
    /**
     * Set the call insights
     * @param {object} insights - Call insights data
     */
    setCallInsights(insights) {
        this.setState(state => ({ callInsights: insights }));
    }
    
    /**
     * Set the loading state for a key
     * @param {string} key - Loading key
     * @param {boolean} isLoading - Whether the key is loading
     */
    setLoading(key, isLoading) {
        this.setState(state => ({
            loading: {
                ...state.loading,
                [key]: isLoading
            }
        }));
    }
    
    /**
     * Set the error for a key
     * @param {string} key - Error key
     * @param {string|null} error - Error message or null to clear
     */
    setError(key, error) {
        this.setState(state => ({
            errors: {
                ...state.errors,
                [key]: error
            }
        }));
    }
    
    /**
     * Add a notification
     * @param {object} notification - Notification object
     */
    addNotification(notification) {
        const id = Date.now();
        
        this.setState(state => ({
            notifications: [
                ...state.notifications,
                { 
                    id,
                    ...notification,
                    timestamp: new Date()
                }
            ]
        }));
        
        // Auto-dismiss notification after timeout
        if (notification.autoDismiss !== false) {
            setTimeout(() => {
                this.dismissNotification(id);
            }, notification.timeout || 5000);
        }
        
        return id;
    }
    
    /**
     * Dismiss a notification
     * @param {number} id - Notification ID
     */
    dismissNotification(id) {
        this.setState(state => ({
            notifications: state.notifications.filter(n => n.id !== id)
        }));
    }
    
    /**
     * Reset the store to its initial state
     */
    reset() {
        this.setState(() => this.getInitialState());
    }
    
    /**
     * Get the initial state
     * @returns {object} Initial state
     */
    getInitialState() {
        return {
            user: null,
            isAuthenticated: false,
            currentPage: 'dashboard',
            sidebarCollapsed: false,
            leads: [],
            conversations: [],
            campaigns: [],
            flows: [],
            pagination: {
                leads: {
                    page: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                },
                conversations: {
                    page: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                }
            },
            filters: {
                leads: {
                    status: 'all',
                    search: '',
                    sortBy: 'created_at',
                    sortOrder: 'desc'
                },
                conversations: {
                    status: 'all',
                    search: '',
                    sortBy: 'last_activity_at',
                    sortOrder: 'desc'
                }
            },
            currentLead: null,
            currentConversation: null,
            currentCampaign: null,
            currentFlow: null,
            activeCall: null,
            callTranscript: [],
            callInsights: null,
            loading: {},
            errors: {},
            notifications: []
        };
    }
}

// Create and expose the store as a global variable
const store = new Store();
window.store = store;
