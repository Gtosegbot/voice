/**
 * Redux Actions for VoiceAI Platform
 */

// Authentication actions
const setUser = (user) => ({
  type: 'SET_USER',
  payload: user
});

const setAuthenticated = (isAuthenticated) => ({
  type: 'SET_AUTHENTICATED',
  payload: isAuthenticated
});

const setLoading = (isLoading) => ({
  type: 'SET_LOADING',
  payload: isLoading
});

// Navigation actions
const setCurrentView = (view) => ({
  type: 'SET_CURRENT_VIEW',
  payload: view
});

const toggleSidebar = () => ({
  type: 'TOGGLE_SIDEBAR'
});

// Notification actions
const addNotification = (notification) => ({
  type: 'ADD_NOTIFICATION',
  payload: notification
});

const markNotificationRead = (id) => ({
  type: 'MARK_NOTIFICATION_READ',
  payload: id
});

const clearNotifications = () => ({
  type: 'CLEAR_NOTIFICATIONS'
});

// Call actions
const setActiveCall = (call) => ({
  type: 'SET_ACTIVE_CALL',
  payload: call
});

const updateCallStatus = (id, status, data = {}) => ({
  type: 'UPDATE_CALL_STATUS',
  payload: { id, status, data }
});

const setCalls = (calls) => ({
  type: 'SET_CALLS',
  payload: calls
});

const addCall = (call) => ({
  type: 'ADD_CALL',
  payload: call
});

// Lead actions
const setLeads = (leads) => ({
  type: 'SET_LEADS',
  payload: leads
});

const updateLead = (leadData) => ({
  type: 'UPDATE_LEAD',
  payload: leadData
});

// Conversation actions
const setConversations = (conversations) => ({
  type: 'SET_CONVERSATIONS',
  payload: conversations
});

const updateConversation = (conversationData) => ({
  type: 'UPDATE_CONVERSATION',
  payload: conversationData
});

// Campaign actions
const setCampaigns = (campaigns) => ({
  type: 'SET_CAMPAIGNS',
  payload: campaigns
});

const updateCampaign = (campaignData) => ({
  type: 'UPDATE_CAMPAIGN',
  payload: campaignData
});