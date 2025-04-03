/**
 * VoiceAI Platform - Main Application Class
 */
class VoiceAIApp {
  constructor() {
    // Create a store for state management
    this.store = createStore((state = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: localStorage.getItem('token'),
      currentView: 'dashboard',
      conversations: [],
      leads: [],
      campaigns: [],
      settings: null,
      notifications: [],
      error: null
    }, action) => {
      switch (action.type) {
        case 'SET_USER':
          return { ...state, user: action.payload, isAuthenticated: !!action.payload };
        case 'SET_TOKEN':
          return { ...state, token: action.payload };
        case 'SET_LOADING':
          return { ...state, isLoading: action.payload };
        case 'SET_CURRENT_VIEW':
          return { ...state, currentView: action.payload };
        case 'SET_CONVERSATIONS':
          return { ...state, conversations: action.payload };
        case 'SET_LEADS':
          return { ...state, leads: action.payload };
        case 'SET_CAMPAIGNS':
          return { ...state, campaigns: action.payload };
        case 'SET_SETTINGS':
          return { ...state, settings: action.payload };
        case 'ADD_NOTIFICATION':
          return { ...state, notifications: [...state.notifications, action.payload] };
        case 'REMOVE_NOTIFICATION':
          return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
        case 'SET_ERROR':
          return { ...state, error: action.payload };
        case 'LOGOUT':
          return {
            ...state,
            user: null,
            isAuthenticated: false,
            token: null,
            currentView: 'dashboard'
          };
        default:
          return state;
      }
    });
    
    // API service
    this.apiService = {
      baseUrl: '/api',
      
      async request(method, url, data = null, options = {}) {
        const token = this.app.store.getState().token;
        
        const fetchOptions = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        };
        
        if (token) {
          fetchOptions.headers.Authorization = `Bearer ${token}`;
        }
        
        if (data && method !== 'GET') {
          fetchOptions.body = JSON.stringify(data);
        }
        
        try {
          const response = await fetch(`${this.baseUrl}${url}`, fetchOptions);
          
          // Check if response is JSON
          const contentType = response.headers.get('Content-Type');
          
          if (contentType && contentType.includes('application/json')) {
            const jsonResponse = await response.json();
            
            if (!response.ok) {
              throw {
                status: response.status,
                message: jsonResponse.message || 'An error occurred',
                data: jsonResponse
              };
            }
            
            return jsonResponse;
          } else if (options.responseType === 'blob') {
            return await response.blob();
          } else {
            return await response.text();
          }
        } catch (error) {
          console.error(`API Error (${method} ${url}):`, error);
          
          // Dispatch error
          this.app.store.dispatch({
            type: 'SET_ERROR',
            payload: {
              message: error.message || 'An error occurred',
              status: error.status || 500
            }
          });
          
          throw error;
        }
      },
      
      // HTTP methods
      async get(url, options = {}) {
        return this.request('GET', url, null, options);
      },
      
      async post(url, data, options = {}) {
        return this.request('POST', url, data, options);
      },
      
      async put(url, data, options = {}) {
        return this.request('PUT', url, data, options);
      },
      
      async delete(url, options = {}) {
        return this.request('DELETE', url, null, options);
      }
    };
    
    // Set app reference in API service
    this.apiService.app = this;
    
    // Components
    this.components = {
      dashboard: null,
      conversations: null,
      leadManagement: null,
      analytics: null,
      flowBuilder: null,
      settings: null
    };
    
    // Bind methods
    this.render = this.render.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    
    // Subscribe to store changes to re-render
    this.store.subscribe(this.render);
  }
  
  /**
   * Initialize the application
   */
  async init() {
    // Initialize the UI
    this.render();
    
    // Check if user is authenticated
    const token = this.store.getState().token;
    if (token) {
      try {
        this.store.dispatch({ type: 'SET_LOADING', payload: true });
        
        // Fetch current user info
        const user = await this.apiService.get('/auth/me');
        
        this.store.dispatch({ type: 'SET_USER', payload: user });
        
        // Initialize WebSocket connection
        this.initializeSocket(token);
        
        // Initialize components
        this.initializeComponents();
      } catch (error) {
        console.error('Auth error:', error);
        
        // Clear token if invalid
        localStorage.removeItem('token');
        this.store.dispatch({ type: 'SET_TOKEN', payload: null });
      } finally {
        this.store.dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    
    // Setup event listeners
    this.initEventListeners();
  }
  
  /**
   * Initialize WebSocket connection
   */
  initializeSocket(token) {
    if (!token) return;
    
    this.socketService = new SocketService(token);
    
    // Handle incoming call notification
    this.socketService.on('incoming_call', this.handleIncomingCall.bind(this));
    
    // Handle new message notification
    this.socketService.on('new_message', (data) => {
      this.store.dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'message',
          title: 'New Message',
          message: `New message from ${data.sender}`,
          data: data
        }
      });
      
      // Update conversations if needed
      if (this.store.getState().currentView === 'conversations') {
        // Refresh conversations list
        this.components.conversations?.fetchConversations();
      }
    });
    
    // Handle lead assignment notification
    this.socketService.on('lead_assigned', (data) => {
      this.store.dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'lead',
          title: 'Lead Assigned',
          message: `New lead assigned: ${data.leadName}`,
          data: data
        }
      });
      
      // Update leads if needed
      if (this.store.getState().currentView === 'leadManagement') {
        // Refresh leads list
        this.components.leadManagement?.fetchLeads();
      }
    });
  }
  
  /**
   * Handle incoming call notification
   */
  handleIncomingCall(data) {
    // Show notification
    this.store.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now(),
        type: 'call',
        title: 'Incoming Call',
        message: `Incoming call from ${data.callerName || data.phoneNumber}`,
        data: data
      }
    });
    
    // Show incoming call UI
    // TODO: Implement incoming call UI
    
    // Play ringtone
    const ringtone = new Audio('/audio/ringtone.mp3');
    ringtone.loop = true;
    ringtone.play().catch(e => console.error('Error playing ringtone:', e));
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" id="incoming-call-modal">
        <div class="modal-header">
          <h3 class="modal-title">Incoming Call</h3>
          <button class="modal-close" id="call-reject">
            <i data-feather="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="incoming-call-container">
            <div class="caller-avatar">
              <i data-feather="user" style="width: 48px; height: 48px;"></i>
            </div>
            <div class="caller-info">
              <div class="caller-name">${data.callerName || 'Unknown Caller'}</div>
              <div class="caller-number">${data.phoneNumber || ''}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger" id="call-reject-btn">
            <i data-feather="phone-off"></i>
            Reject
          </button>
          <button class="btn btn-success" id="call-accept-btn">
            <i data-feather="phone"></i>
            Accept
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize feather icons
    feather.replace();
    
    // Handle call actions
    document.getElementById('call-reject-btn')?.addEventListener('click', () => {
      ringtone.pause();
      modal.remove();
      
      // Reject call via API
      this.apiService.post(`/calls/${data.callId}/reject`);
    });
    
    document.getElementById('call-accept-btn')?.addEventListener('click', () => {
      ringtone.pause();
      modal.remove();
      
      // Accept call via API
      this.apiService.post(`/calls/${data.callId}/accept`);
      
      // Navigate to conversation view
      this.store.dispatch({ type: 'SET_CURRENT_VIEW', payload: 'conversations' });
      
      // TODO: Open specific conversation
    });
    
    document.getElementById('call-reject')?.addEventListener('click', () => {
      ringtone.pause();
      modal.remove();
      
      // Reject call via API
      this.apiService.post(`/calls/${data.callId}/reject`);
    });
  }
  
  /**
   * Initialize components
   */
  initializeComponents() {
    // Initialize all components
    this.components.dashboard = new DashboardComponent(this);
    this.components.conversations = new ConversationsComponent(this);
    this.components.leadManagement = new LeadManagementComponent(this);
    this.components.analytics = new AnalyticsComponent(this);
    this.components.flowBuilder = new FlowBuilderComponent(this);
    this.components.settings = new SettingsComponent(this);
  }
  
  /**
   * Initialize application event listeners
   */
  initEventListeners() {
    // Login form submission
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'login-form') {
        e.preventDefault();
        this.handleLogin(e);
      }
    });
    
    // Navigation click events
    document.addEventListener('click', (e) => {
      // Handle navigation item clicks
      if (e.target.closest('.nav-item')) {
        const navItem = e.target.closest('.nav-item');
        const view = navItem.dataset.view;
        
        if (view) {
          this.store.dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
        }
      }
      
      // Handle logout button click
      if (e.target.closest('#logout-btn')) {
        this.handleLogout();
      }
      
      // Handle notification dismiss
      if (e.target.closest('.notification-dismiss')) {
        const notificationId = e.target.closest('.notification-item').dataset.id;
        this.store.dispatch({ type: 'REMOVE_NOTIFICATION', payload: parseInt(notificationId) });
      }
    });
  }
  
  /**
   * Handle user login
   */
  async handleLogin(e) {
    const form = e.target;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    
    if (!email || !password) {
      return;
    }
    
    try {
      this.store.dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await this.apiService.post('/auth/login', { email, password });
      
      // Save token to localStorage and store
      localStorage.setItem('token', response.token);
      this.store.dispatch({ type: 'SET_TOKEN', payload: response.token });
      this.store.dispatch({ type: 'SET_USER', payload: response.user });
      
      // Initialize WebSocket connection
      this.initializeSocket(response.token);
      
      // Initialize components
      this.initializeComponents();
    } catch (error) {
      console.error('Login error:', error);
      
      // Show error message
      const errorElement = form.querySelector('.login-error');
      if (errorElement) {
        errorElement.textContent = error.message || 'Invalid email or password';
        errorElement.style.display = 'block';
      }
    } finally {
      this.store.dispatch({ type: 'SET_LOADING', payload: false });
    }
  }
  
  /**
   * Handle user logout
   */
  handleLogout() {
    // Clear token from localStorage and store
    localStorage.removeItem('token');
    
    // Disconnect WebSocket
    if (this.socketService) {
      this.socketService.disconnect();
    }
    
    // Dispatch logout action
    this.store.dispatch({ type: 'LOGOUT' });
  }
  
  /**
   * Render the current view based on application state
   */
  render() {
    const state = this.store.getState();
    const appContainer = document.getElementById('app');
    
    // Show loading spinner if loading
    if (state.isLoading) {
      appContainer.innerHTML = `
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Loading...</p>
        </div>
      `;
      return;
    }
    
    // Render login view if not authenticated
    if (!state.isAuthenticated) {
      this.renderLoginView(appContainer);
      return;
    }
    
    // Render authenticated view
    this.renderAuthenticatedView(appContainer);
    
    // Initialize feather icons
    feather.replace();
  }
  
  /**
   * Render login view
   */
  renderLoginView(container) {
    container.innerHTML = `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h1 class="auth-title">VoiceAI Platform</h1>
            <p class="auth-subtitle">Sign in to your account</p>
          </div>
          
          <form id="login-form" class="auth-form">
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input type="email" id="email" class="form-control" placeholder="Enter your email" required>
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input type="password" id="password" class="form-control" placeholder="Enter your password" required>
            </div>
            
            <div class="login-error" style="display: none; color: red; margin-bottom: 1rem;"></div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%;">Sign In</button>
          </form>
          
          <div class="auth-footer">
            <p>Don't have an account? Contact your administrator</p>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render authenticated view
   */
  renderAuthenticatedView(container) {
    const state = this.store.getState();
    const currentView = state.currentView;
    
    container.innerHTML = `
      <div class="app-layout">
        <div class="sidebar">
          <div class="sidebar-header">
            <a href="#" class="sidebar-brand">
              <i data-feather="phone"></i>
              <span>VoiceAI</span>
            </a>
          </div>
          
          <div class="sidebar-nav">
            <a href="#" class="nav-item ${currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
              <i data-feather="grid"></i>
              <span>Dashboard</span>
            </a>
            
            <a href="#" class="nav-item ${currentView === 'conversations' ? 'active' : ''}" data-view="conversations">
              <i data-feather="message-square"></i>
              <span>Conversations</span>
            </a>
            
            <a href="#" class="nav-item ${currentView === 'leadManagement' ? 'active' : ''}" data-view="leadManagement">
              <i data-feather="users"></i>
              <span>Lead Management</span>
            </a>
            
            <div class="nav-section-title">Tools</div>
            
            <a href="#" class="nav-item ${currentView === 'analytics' ? 'active' : ''}" data-view="analytics">
              <i data-feather="bar-chart-2"></i>
              <span>Analytics</span>
            </a>
            
            <a href="#" class="nav-item ${currentView === 'flowBuilder' ? 'active' : ''}" data-view="flowBuilder">
              <i data-feather="git-branch"></i>
              <span>Flow Builder</span>
            </a>
            
            <div class="nav-section-title">System</div>
            
            <a href="#" class="nav-item ${currentView === 'settings' ? 'active' : ''}" data-view="settings">
              <i data-feather="settings"></i>
              <span>Settings</span>
            </a>
            
            <a href="#" class="nav-item" id="logout-btn">
              <i data-feather="log-out"></i>
              <span>Logout</span>
            </a>
          </div>
        </div>
        
        <div class="main-content">
          <div class="header">
            <div class="header-left">
              <button class="menu-toggle">
                <i data-feather="menu"></i>
              </button>
              
              <div class="search-bar">
                <i data-feather="search"></i>
                <input type="text" placeholder="Search...">
              </div>
            </div>
            
            <div class="header-center">
              <h2 class="view-title">${this.getViewTitle(currentView)}</h2>
            </div>
            
            <div class="header-right">
              <div class="notifications">
                <i data-feather="bell"></i>
                ${state.notifications.length > 0 ? `<div class="notifications-count">${state.notifications.length}</div>` : ''}
              </div>
              
              <div class="user-menu">
                <div class="user-avatar">
                  ${state.user?.name?.substr(0, 1) || 'U'}
                </div>
              </div>
            </div>
          </div>
          
          <div class="view-container" id="view-container">
            <!-- Current view will be rendered here -->
          </div>
        </div>
      </div>
    `;
    
    // Render the current component
    this.renderCurrentView();
  }
  
  /**
   * Render the current component view
   */
  renderCurrentView() {
    const viewContainer = document.getElementById('view-container');
    const currentView = this.store.getState().currentView;
    
    if (!viewContainer) return;
    
    switch (currentView) {
      case 'dashboard':
        this.components.dashboard?.render(viewContainer);
        break;
      case 'conversations':
        this.components.conversations?.render(viewContainer);
        break;
      case 'leadManagement':
        this.components.leadManagement?.render(viewContainer);
        break;
      case 'analytics':
        this.components.analytics?.render(viewContainer);
        break;
      case 'flowBuilder':
        this.components.flowBuilder?.render(viewContainer);
        break;
      case 'settings':
        this.components.settings?.render(viewContainer);
        break;
      default:
        viewContainer.innerHTML = '<div class="error-state"><h3>View not found</h3></div>';
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
      analytics: 'Analytics',
      flowBuilder: 'Flow Builder',
      settings: 'Settings'
    };
    
    return titles[view] || 'VoiceAI Platform';
  }
}
