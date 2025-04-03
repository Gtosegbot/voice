/**
 * VoiceAI - Main Application
 * Enterprise Voice Prospecting Platform
 */

// Global application state
const AppState = {
  currentView: 'dashboard',
  user: null,
  isAuthenticated: false,
  isLoading: true,
  notifications: [],
  isSidebarCollapsed: false
};

// Main application class
class VoiceAIApp {
  constructor() {
    this.store = createStore(rootReducer);
    this.socket = null;
    this.apiService = new ApiService();
    this.components = {
      dashboard: new DashboardComponent(this),
      conversations: new ConversationsComponent(this),
      leadManagement: new LeadManagementComponent(this),
      analytics: new AnalyticsComponent(this),
      flowBuilder: new FlowBuilderComponent(this),
      settings: new SettingsComponent(this)
    };
    
    // Subscribe to store changes
    this.store.subscribe(() => this.render());
  }
  
  /**
   * Initialize the application
   */
  async init() {
    try {
      // Check authentication status
      const token = localStorage.getItem('voiceai_token');
      
      if (token) {
        // Set token in API service
        this.apiService.setAuthToken(token);
        
        // Fetch user data
        const userData = await this.apiService.get('/api/auth/me');
        
        this.store.dispatch({
          type: 'SET_USER',
          payload: userData
        });
        
        this.store.dispatch({
          type: 'SET_AUTHENTICATED',
          payload: true
        });
        
        // Initialize WebSocket connection
        this.initializeSocket(token);
      }
      
      // Initialize event listeners
      this.initEventListeners();
      
      // Set loading to false
      this.store.dispatch({
        type: 'SET_LOADING',
        payload: false
      });
      
      // Render initial view
      this.render();
    } catch (error) {
      console.error('Initialization error:', error);
      
      // Clear any invalid tokens
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('voiceai_token');
      }
      
      this.store.dispatch({
        type: 'SET_LOADING',
        payload: false
      });
      
      this.renderLoginView();
    }
  }
  
  /**
   * Initialize WebSocket connection
   */
  initializeSocket(token) {
    this.socket = new SocketService(token);
    
    // Set up socket event handlers
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    this.socket.on('notification', (data) => {
      this.store.dispatch({
        type: 'ADD_NOTIFICATION',
        payload: data
      });
    });
    
    this.socket.on('call_incoming', (data) => {
      this.handleIncomingCall(data);
    });
    
    this.socket.on('call_status_changed', (data) => {
      this.store.dispatch({
        type: 'UPDATE_CALL_STATUS',
        payload: data
      });
    });
    
    this.socket.on('lead_updated', (data) => {
      this.store.dispatch({
        type: 'UPDATE_LEAD',
        payload: data
      });
    });
    
    this.socket.on('conversation_updated', (data) => {
      this.store.dispatch({
        type: 'UPDATE_CONVERSATION',
        payload: data
      });
    });
  }
  
  /**
   * Handle incoming call notification
   */
  handleIncomingCall(data) {
    // Create call notification
    const notification = {
      id: Date.now(),
      type: 'call',
      title: 'Incoming Call',
      message: `Incoming call from ${data.caller}`,
      data: data,
      timestamp: new Date(),
      read: false
    };
    
    this.store.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: notification
    });
    
    // Play sound for incoming call
    const audio = new Audio('https://cdn.freesound.org/previews/415/415346_7607624-lq.mp3');
    audio.play();
    
    // Show browser notification if possible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('VoiceAI - Incoming Call', {
        body: `Call from ${data.caller}`,
        icon: 'https://via.placeholder.com/128'
      });
    }
  }
  
  /**
   * Initialize application event listeners
   */
  initEventListeners() {
    // Navigation event handling
    document.addEventListener('click', (e) => {
      // Handle navigation clicks
      if (e.target.matches('[data-nav]') || e.target.closest('[data-nav]')) {
        const navItem = e.target.matches('[data-nav]') ? 
                        e.target : 
                        e.target.closest('[data-nav]');
        
        const view = navItem.dataset.nav;
        
        this.store.dispatch({
          type: 'SET_CURRENT_VIEW',
          payload: view
        });
        
        e.preventDefault();
      }
      
      // Handle logout click
      if (e.target.matches('[data-logout]') || e.target.closest('[data-logout]')) {
        this.handleLogout();
        e.preventDefault();
      }
      
      // Handle toggle sidebar
      if (e.target.matches('[data-toggle-sidebar]') || e.target.closest('[data-toggle-sidebar]')) {
        this.store.dispatch({
          type: 'TOGGLE_SIDEBAR'
        });
        e.preventDefault();
      }
    });
    
    // Form submission handling
    document.addEventListener('submit', (e) => {
      // Handle login form
      if (e.target.matches('#login-form')) {
        this.handleLogin(e);
      }
    });
  }
  
  /**
   * Handle user login
   */
  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    
    try {
      const response = await this.apiService.post('/api/auth/login', {
        email,
        password
      });
      
      // Store token
      localStorage.setItem('voiceai_token', response.token);
      
      // Set token in API service
      this.apiService.setAuthToken(response.token);
      
      // Update store
      this.store.dispatch({
        type: 'SET_USER',
        payload: response.user
      });
      
      this.store.dispatch({
        type: 'SET_AUTHENTICATED',
        payload: true
      });
      
      // Initialize socket
      this.initializeSocket(response.token);
      
      // Render app
      this.render();
    } catch (error) {
      console.error('Login error:', error);
      
      // Show error message
      const errorContainer = document.querySelector('#login-error');
      if (errorContainer) {
        errorContainer.textContent = error.response?.data?.message || 'Invalid credentials';
        errorContainer.style.display = 'block';
      }
    }
  }
  
  /**
   * Handle user logout
   */
  handleLogout() {
    // Clear token
    localStorage.removeItem('voiceai_token');
    
    // Disconnect socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Update store
    this.store.dispatch({
      type: 'SET_USER',
      payload: null
    });
    
    this.store.dispatch({
      type: 'SET_AUTHENTICATED',
      payload: false
    });
    
    // Render login view
    this.renderLoginView();
  }
  
  /**
   * Render the current view based on application state
   */
  render() {
    const state = this.store.getState();
    
    if (state.isLoading) {
      return; // Don't render during loading
    }
    
    if (!state.isAuthenticated) {
      this.renderLoginView();
      return;
    }
    
    // Render authenticated view
    this.renderAuthenticatedView();
  }
  
  /**
   * Render login view
   */
  renderLoginView() {
    const appContainer = document.getElementById('app');
    
    appContainer.innerHTML = `
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <h1>VoiceAI</h1>
            <p>Enterprise Voice Prospecting Platform</p>
          </div>
          
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" class="form-control" required>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" class="form-control" required>
            </div>
            
            <div id="login-error" class="error-message" style="display: none;"></div>
            
            <button type="submit" class="btn btn-primary btn-block">Login</button>
          </form>
        </div>
      </div>
    `;
  }
  
  /**
   * Render authenticated view
   */
  renderAuthenticatedView() {
    const state = this.store.getState();
    const appContainer = document.getElementById('app');
    
    // Add collapsed class if sidebar is collapsed
    const sidebarClass = state.isSidebarCollapsed ? 'sidebar-collapsed' : '';
    
    // Create main app structure
    appContainer.innerHTML = `
      <div class="app-container ${sidebarClass}">
        <aside class="sidebar">
          <div class="sidebar-header">
            <div class="logo">VoiceAI</div>
            <button class="toggle-btn" data-toggle-sidebar>
              <i data-feather="menu"></i>
            </button>
          </div>
          
          <nav class="sidebar-nav">
            <ul>
              <li class="nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" data-nav="dashboard">
                <i class="nav-icon" data-feather="home"></i>
                <span class="nav-text">Dashboard</span>
              </li>
              
              <li class="nav-item ${state.currentView === 'conversations' ? 'active' : ''}" data-nav="conversations">
                <i class="nav-icon" data-feather="message-circle"></i>
                <span class="nav-text">Conversations</span>
              </li>
              
              <li class="nav-item ${state.currentView === 'leadManagement' ? 'active' : ''}" data-nav="leadManagement">
                <i class="nav-icon" data-feather="users"></i>
                <span class="nav-text">Lead Management</span>
              </li>
              
              <li class="nav-item ${state.currentView === 'analytics' ? 'active' : ''}" data-nav="analytics">
                <i class="nav-icon" data-feather="bar-chart-2"></i>
                <span class="nav-text">Analytics</span>
              </li>
              
              <li class="nav-item ${state.currentView === 'flowBuilder' ? 'active' : ''}" data-nav="flowBuilder">
                <i class="nav-icon" data-feather="git-branch"></i>
                <span class="nav-text">Flow Builder</span>
              </li>
              
              <li class="nav-item ${state.currentView === 'settings' ? 'active' : ''}" data-nav="settings">
                <i class="nav-icon" data-feather="settings"></i>
                <span class="nav-text">Settings</span>
              </li>
            </ul>
          </nav>
          
          <div class="sidebar-footer">
            <div class="user-info">
              <div class="user-avatar">${state.user.name.charAt(0)}</div>
              <div class="user-details">
                <div class="user-name">${state.user.name}</div>
                <div class="user-role">${state.user.role}</div>
              </div>
            </div>
            
            <button class="logout-btn" data-logout>
              <i data-feather="log-out"></i>
              <span class="nav-text">Logout</span>
            </button>
          </div>
        </aside>
        
        <main class="main-content">
          <header class="app-header">
            <h1 class="app-title">
              ${this.getViewTitle(state.currentView)}
            </h1>
            
            <div class="header-actions">
              <div class="notifications-dropdown">
                <button class="notifications-btn">
                  <i data-feather="bell"></i>
                  ${state.notifications.filter(n => !n.read).length > 0 
                    ? `<span class="badge">${state.notifications.filter(n => !n.read).length}</span>` 
                    : ''}
                </button>
              </div>
              
              <div class="user-profile">
                <div class="user-avatar">${state.user.name.charAt(0)}</div>
                <span class="user-name">${state.user.name}</span>
              </div>
            </div>
          </header>
          
          <div id="view-container"></div>
        </main>
      </div>
    `;
    
    // Render the specific view
    this.renderCurrentView();
    
    // Initialize feather icons
    feather.replace();
  }
  
  /**
   * Render the current component view
   */
  renderCurrentView() {
    const state = this.store.getState();
    const viewContainer = document.getElementById('view-container');
    
    if (!viewContainer) return;
    
    // Render the appropriate component
    switch (state.currentView) {
      case 'dashboard':
        this.components.dashboard.render(viewContainer);
        break;
      case 'conversations':
        this.components.conversations.render(viewContainer);
        break;
      case 'leadManagement':
        this.components.leadManagement.render(viewContainer);
        break;
      case 'analytics':
        this.components.analytics.render(viewContainer);
        break;
      case 'flowBuilder':
        this.components.flowBuilder.render(viewContainer);
        break;
      case 'settings':
        this.components.settings.render(viewContainer);
        break;
      default:
        viewContainer.innerHTML = '<div class="error-view">View not found</div>';
    }
  }
  
  /**
   * Get the title for the current view
   */
  getViewTitle(view) {
    const titles = {
      dashboard: 'Dashboard',
      conversations: 'Conversations',
      leadManagement: 'Lead Management',
      analytics: 'Analytics & Reporting',
      flowBuilder: 'Conversation Flow Builder',
      settings: 'Settings'
    };
    
    return titles[view] || 'VoiceAI Platform';
  }
}

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new VoiceAIApp();
  app.init();
  
  // Request notification permission
  if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
});
