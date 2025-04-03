/**
 * Redux Reducers for VoiceAI Platform
 */

// Initial state
const initialState = {
  currentView: 'dashboard',
  user: null,
  isAuthenticated: false,
  isLoading: true,
  notifications: [],
  isSidebarCollapsed: false,
  activeCall: null,
  calls: [],
  leads: [],
  conversations: [],
  campaigns: []
};

// Root reducer
function rootReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_CURRENT_VIEW':
      return {
        ...state,
        currentView: action.payload
      };
      
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      };
      
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
      
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
      
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => 
          notification.id === action.payload 
            ? { ...notification, read: true } 
            : notification
        )
      };
      
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
      
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        isSidebarCollapsed: !state.isSidebarCollapsed
      };
      
    case 'SET_ACTIVE_CALL':
      return {
        ...state,
        activeCall: action.payload
      };
      
    case 'UPDATE_CALL_STATUS':
      if (state.activeCall && state.activeCall.id === action.payload.id) {
        return {
          ...state,
          activeCall: {
            ...state.activeCall,
            status: action.payload.status,
            ...action.payload.data
          }
        };
      }
      return state;
      
    case 'SET_CALLS':
      return {
        ...state,
        calls: action.payload
      };
      
    case 'ADD_CALL':
      return {
        ...state,
        calls: [action.payload, ...state.calls]
      };
      
    case 'SET_LEADS':
      return {
        ...state,
        leads: action.payload
      };
      
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(lead => 
          lead.id === action.payload.id 
            ? { ...lead, ...action.payload } 
            : lead
        )
      };
      
    case 'SET_CONVERSATIONS':
      return {
        ...state,
        conversations: action.payload
      };
      
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conversation => 
          conversation.id === action.payload.id 
            ? { ...conversation, ...action.payload } 
            : conversation
        )
      };
      
    case 'SET_CAMPAIGNS':
      return {
        ...state,
        campaigns: action.payload
      };
      
    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map(campaign => 
          campaign.id === action.payload.id 
            ? { ...campaign, ...action.payload } 
            : campaign
        )
      };
      
    default:
      return state;
  }
}