/**
 * Conversations Component
 * Manages active and past conversations with leads
 */
class ConversationsComponent {
  constructor(app) {
    this.app = app;
    this.store = app.store;
    this.apiService = app.apiService;
    this.socket = app.socket;
    this.conversations = [];
    this.activeConversation = null;
    this.activeCall = null;
    this.isRecording = false;
    this.filter = {
      type: 'all',
      status: 'all',
      search: '',
      date: {
        from: null,
        to: null
      },
      page: 1,
      limit: 10
    };
  }
  
  /**
   * Fetch conversations from the API
   */
  async fetchConversations() {
    try {
      const queryParams = new URLSearchParams();
      
      if (this.filter.type !== 'all') {
        queryParams.append('type', this.filter.type);
      }
      
      if (this.filter.status !== 'all') {
        queryParams.append('status', this.filter.status);
      }
      
      if (this.filter.search) {
        queryParams.append('search', this.filter.search);
      }
      
      if (this.filter.date.from) {
        queryParams.append('fromDate', this.filter.date.from);
      }
      
      if (this.filter.date.to) {
        queryParams.append('toDate', this.filter.date.to);
      }
      
      queryParams.append('page', this.filter.page);
      queryParams.append('limit', this.filter.limit);
      
      const data = await this.apiService.get(`/api/conversations?${queryParams.toString()}`);
      
      this.conversations = data.conversations;
      this.totalConversations = data.total;
      this.totalPages = Math.ceil(data.total / this.filter.limit);
      
      return data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { conversations: [], total: 0 };
    }
  }
  
  /**
   * Fetch a specific conversation by ID
   */
  async fetchConversation(id) {
    try {
      const conversation = await this.apiService.get(`/api/conversations/${id}`);
      this.activeConversation = conversation;
      return conversation;
    } catch (error) {
      console.error(`Error fetching conversation ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Render the conversations component
   */
  async render(container) {
    // Show loading state
    container.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading conversations...</p>
      </div>
    `;
    
    // Fetch conversations data
    await this.fetchConversations();
    
    // If active conversation is set, fetch its details
    if (this.activeConversation?.id) {
      await this.fetchConversation(this.activeConversation.id);
    }
    
    // Render the component
    container.innerHTML = this.renderConversationsLayout();
    
    // Initialize conversation list
    this.renderConversationList();
    
    // Render conversation detail if active
    if (this.activeConversation) {
      this.renderConversationDetail();
    } else {
      this.renderEmptyState();
    }
    
    // Initialize feather icons
    feather.replace();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Render the main conversations layout
   */
  renderConversationsLayout() {
    return `
      <div class="conversations-container">
        <div class="conversations-sidebar">
          <div class="conversations-header">
            <div class="search-container">
              <input type="text" id="conversation-search" class="search-input" placeholder="Search conversations..." value="${this.filter.search}">
              <button class="search-button">
                <i data-feather="search"></i>
              </button>
            </div>
            
            <div class="filter-container">
              <button class="filter-button" id="toggle-filters">
                <i data-feather="filter"></i>
                Filters
              </button>
            </div>
          </div>
          
          <div class="filters-panel" style="display: none;">
            <div class="filter-group">
              <label>Channel Type</label>
              <select id="filter-type" class="filter-select">
                <option value="all" ${this.filter.type === 'all' ? 'selected' : ''}>All Channels</option>
                <option value="voice" ${this.filter.type === 'voice' ? 'selected' : ''}>Voice Calls</option>
                <option value="whatsapp" ${this.filter.type === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
                <option value="sms" ${this.filter.type === 'sms' ? 'selected' : ''}>SMS</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Status</label>
              <select id="filter-status" class="filter-select">
                <option value="all" ${this.filter.status === 'all' ? 'selected' : ''}>All Status</option>
                <option value="active" ${this.filter.status === 'active' ? 'selected' : ''}>Active</option>
                <option value="completed" ${this.filter.status === 'completed' ? 'selected' : ''}>Completed</option>
                <option value="qualified" ${this.filter.status === 'qualified' ? 'selected' : ''}>Qualified</option>
                <option value="not-qualified" ${this.filter.status === 'not-qualified' ? 'selected' : ''}>Not Qualified</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Date Range</label>
              <div class="date-range">
                <input type="date" id="filter-date-from" class="date-input" value="${this.filter.date.from || ''}">
                <span>to</span>
                <input type="date" id="filter-date-to" class="date-input" value="${this.filter.date.to || ''}">
              </div>
            </div>
            
            <div class="filter-actions">
              <button id="apply-filters" class="btn btn-primary">Apply Filters</button>
              <button id="reset-filters" class="btn btn-outline">Reset</button>
            </div>
          </div>
          
          <div class="conversation-tabs">
            <button class="tab-button ${this.filter.status === 'active' ? 'active' : ''}" data-status="active">
              <i data-feather="phone-call"></i>
              Active
            </button>
            <button class="tab-button ${this.filter.status === 'all' && this.filter.type === 'all' ? 'active' : ''}" data-status="all" data-type="all">
              <i data-feather="inbox"></i>
              All
            </button>
            <button class="tab-button ${this.filter.status === 'qualified' ? 'active' : ''}" data-status="qualified">
              <i data-feather="check-circle"></i>
              Qualified
            </button>
          </div>
          
          <div class="conversations-list" id="conversation-list">
            <!-- Conversation list items will be inserted here -->
          </div>
          
          <div class="pagination-controls">
            <button id="prev-page" class="pagination-button" ${this.filter.page <= 1 ? 'disabled' : ''}>
              <i data-feather="chevron-left"></i>
            </button>
            <span class="pagination-info">Page ${this.filter.page} of ${this.totalPages || 1}</span>
            <button id="next-page" class="pagination-button" ${this.filter.page >= this.totalPages ? 'disabled' : ''}>
              <i data-feather="chevron-right"></i>
            </button>
          </div>
        </div>
        
        <div class="conversation-detail" id="conversation-detail">
          <!-- Conversation detail will be inserted here -->
        </div>
      </div>
    `;
  }
  
  /**
   * Render the conversation list
   */
  renderConversationList() {
    const listContainer = document.getElementById('conversation-list');
    
    if (!listContainer) return;
    
    if (this.conversations.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-list">
          <i data-feather="inbox" style="width: 48px; height: 48px; color: var(--text-secondary);"></i>
          <p>No conversations found</p>
          <p class="empty-list-subtitle">Try adjusting your filters</p>
        </div>
      `;
      feather.replace();
      return;
    }
    
    const conversationItems = this.conversations.map(conversation => {
      const isActive = this.activeConversation && conversation.id === this.activeConversation.id;
      
      return `
        <div class="conversation-item ${isActive ? 'active' : ''}" data-id="${conversation.id}">
          <div class="conversation-icon ${this.getChannelIconClass(conversation.channel)}">
            <i data-feather="${this.getChannelIcon(conversation.channel)}"></i>
          </div>
          
          <div class="conversation-info">
            <div class="conversation-name">
              ${conversation.contactName || 'Unknown'}
              ${conversation.isNew ? '<span class="new-badge">New</span>' : ''}
            </div>
            <div class="conversation-preview">${conversation.lastMessage || 'No messages'}</div>
          </div>
          
          <div class="conversation-meta">
            <div class="conversation-time">${this.formatDate(conversation.lastActivityAt)}</div>
            <div class="conversation-status ${conversation.status}">${this.getStatusLabel(conversation.status)}</div>
          </div>
        </div>
      `;
    }).join('');
    
    listContainer.innerHTML = conversationItems;
    
    // Re-initialize feather icons
    feather.replace();
  }
  
  /**
   * Render empty state when no conversation is selected
   */
  renderEmptyState() {
    const detailContainer = document.getElementById('conversation-detail');
    
    if (!detailContainer) return;
    
    detailContainer.innerHTML = `
      <div class="empty-conversation">
        <div class="empty-illustration">
          <i data-feather="message-square" style="width: 64px; height: 64px; color: var(--text-secondary);"></i>
        </div>
        <h3>No Conversation Selected</h3>
        <p>Select a conversation from the list or start a new one</p>
        <button class="btn btn-primary" id="new-conversation-btn">
          <i data-feather="plus"></i>
          New Conversation
        </button>
      </div>
    `;
    
    // Re-initialize feather icons
    feather.replace();
    
    // Add event listener for new conversation button
    document.getElementById('new-conversation-btn').addEventListener('click', () => {
      this.showNewConversationModal();
    });
  }
  
  /**
   * Render the conversation detail view
   */
  renderConversationDetail() {
    const detailContainer = document.getElementById('conversation-detail');
    
    if (!detailContainer || !this.activeConversation) return;
    
    const conversation = this.activeConversation;
    const messages = conversation.messages || [];
    const contact = conversation.contact || {};
    const isActiveCall = conversation.channel === 'voice' && conversation.status === 'active';
    
    detailContainer.innerHTML = `
      <div class="conversation-detail-header">
        <div class="contact-info">
          <div class="contact-avatar ${this.getChannelIconClass(conversation.channel)}">
            ${contact.name ? contact.name.charAt(0).toUpperCase() : '<i data-feather="user"></i>'}
          </div>
          
          <div class="contact-details">
            <div class="contact-name">${contact.name || 'Unknown Contact'}</div>
            <div class="contact-channel">
              <i data-feather="${this.getChannelIcon(conversation.channel)}"></i>
              ${contact.phone || contact.email || 'No contact info'}
            </div>
          </div>
        </div>
        
        <div class="conversation-actions">
          ${isActiveCall ? `
            <button class="btn btn-icon btn-danger" id="end-call-btn" title="End Call">
              <i data-feather="phone-off"></i>
            </button>
            
            <button class="btn btn-icon ${this.isRecording ? 'btn-danger' : 'btn-outline'}" id="record-call-btn" title="${this.isRecording ? 'Stop Recording' : 'Record Call'}">
              <i data-feather="mic"></i>
            </button>
            
            <button class="btn btn-icon btn-outline" id="transfer-call-btn" title="Transfer Call">
              <i data-feather="repeat"></i>
            </button>
          ` : ''}
          
          <button class="btn btn-icon btn-outline" id="view-contact-btn" title="View Contact">
            <i data-feather="user"></i>
          </button>
          
          <button class="btn btn-icon btn-outline" id="conversation-options-btn" title="More Options">
            <i data-feather="more-vertical"></i>
          </button>
        </div>
      </div>
      
      <div class="conversation-timeline">
        <!-- Timeline showing conversation events -->
        ${this.renderConversationTimeline(conversation)}
      </div>
      
      <div class="conversation-messages" id="conversation-messages">
        <!-- Messages will be rendered here -->
        ${this.renderMessages(messages)}
      </div>
      
      ${isActiveCall ? this.renderActiveCallInterface(conversation) : this.renderMessageInput(conversation)}
      
      <div class="conversation-sidebar">
        <div class="sidebar-section">
          <h3 class="sidebar-title">Lead Information</h3>
          <div class="lead-score">
            <div class="score-label">Qualification Score</div>
            <div class="score-value">${conversation.leadScore || 0}/100</div>
            <div class="score-bar">
              <div class="score-progress" style="width: ${conversation.leadScore || 0}%"></div>
            </div>
          </div>
          
          <div class="lead-details">
            <div class="lead-detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value lead-status ${conversation.leadStatus || 'new'}">${this.getLeadStatusLabel(conversation.leadStatus || 'new')}</div>
            </div>
            
            <div class="lead-detail-item">
              <div class="detail-label">Source</div>
              <div class="detail-value">${conversation.leadSource || 'Unknown'}</div>
            </div>
            
            <div class="lead-detail-item">
              <div class="detail-label">Campaign</div>
              <div class="detail-value">${conversation.campaign?.name || 'Not Assigned'}</div>
            </div>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3 class="sidebar-title">Contact Information</h3>
          <div class="contact-details">
            ${this.renderContactDetails(contact)}
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3 class="sidebar-title">AI Insights</h3>
          <div class="insights-container">
            ${this.renderAIInsights(conversation.insights || {})}
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3 class="sidebar-title">Actions</h3>
          <div class="action-buttons">
            <button class="btn btn-primary btn-block" id="schedule-appointment-btn">
              <i data-feather="calendar"></i>
              Schedule Appointment
            </button>
            
            <button class="btn btn-outline btn-block" id="update-lead-status-btn">
              <i data-feather="edit-2"></i>
              Update Lead Status
            </button>
            
            <button class="btn btn-outline btn-block" id="add-notes-btn">
              <i data-feather="file-text"></i>
              Add Notes
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Scroll to the latest message
    const messagesContainer = document.getElementById('conversation-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Re-initialize feather icons
    feather.replace();
  }
  
  /**
   * Render conversation timeline
   */
  renderConversationTimeline(conversation) {
    const events = conversation.events || [];
    
    if (events.length === 0) {
      return `<div class="timeline-empty">No events recorded</div>`;
    }
    
    return `
      <div class="timeline">
        ${events.map(event => `
          <div class="timeline-item">
            <div class="timeline-icon ${this.getEventIconClass(event.type)}">
              <i data-feather="${this.getEventIcon(event.type)}"></i>
            </div>
            <div class="timeline-content">
              <div class="timeline-time">${this.formatDate(event.timestamp)}</div>
              <div class="timeline-title">${event.title}</div>
              ${event.description ? `<div class="timeline-description">${event.description}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  /**
   * Render messages in the conversation
   */
  renderMessages(messages) {
    if (!messages || messages.length === 0) {
      return `<div class="messages-empty">No messages in this conversation</div>`;
    }
    
    return messages.map(message => {
      const isIncoming = message.direction === 'incoming';
      const messageClass = isIncoming ? 'message-incoming' : 'message-outgoing';
      
      return `
        <div class="message ${messageClass}">
          <div class="message-content">
            ${message.content}
            <div class="message-time">${this.formatTime(message.timestamp)}</div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  /**
   * Render active call interface
   */
  renderActiveCallInterface(conversation) {
    const callDuration = this.formatCallDuration(conversation.callStartTime);
    
    return `
      <div class="active-call-interface">
        <div class="call-status">
          <div class="call-type">
            ${conversation.direction === 'outgoing' ? 'Outbound Call' : 'Inbound Call'}
          </div>
          <div class="call-duration" id="call-duration">${callDuration}</div>
        </div>
        
        <div class="call-waveform">
          <canvas id="audio-visualizer"></canvas>
        </div>
        
        <div class="ai-assistance-panel">
          <div class="panel-header">
            <h3>AI Assistance</h3>
            <button class="panel-toggle" id="toggle-ai-panel">
              <i data-feather="chevron-up"></i>
            </button>
          </div>
          
          <div class="ai-suggestions">
            <div class="suggestion-item">
              <div class="suggestion-text">The customer seems concerned about pricing. Consider mentioning our flexible payment options.</div>
              <button class="use-suggestion-btn"><i data-feather="corner-down-right"></i></button>
            </div>
            
            <div class="suggestion-item">
              <div class="suggestion-text">Good opportunity to ask about their timeline for implementation.</div>
              <button class="use-suggestion-btn"><i data-feather="corner-down-right"></i></button>
            </div>
            
            <div class="suggestion-item">
              <div class="suggestion-text">Customer sentiment is positive. Good time to discuss next steps.</div>
              <button class="use-suggestion-btn"><i data-feather="corner-down-right"></i></button>
            </div>
          </div>
          
          <div class="detected-intents">
            <div class="intent-tag intent-positive">Interested</div>
            <div class="intent-tag intent-neutral">Needs more info</div>
            <div class="intent-tag intent-concern">Price sensitivity</div>
          </div>
        </div>
        
        <div class="call-controls">
          <button class="call-control-btn" id="mute-btn">
            <i data-feather="mic"></i>
            <span>Mute</span>
          </button>
          
          <button class="call-control-btn" id="hold-btn">
            <i data-feather="pause"></i>
            <span>Hold</span>
          </button>
          
          <button class="call-control-btn" id="transfer-btn">
            <i data-feather="repeat"></i>
            <span>Transfer</span>
          </button>
          
          <button class="call-control-btn call-end-btn" id="hangup-btn">
            <i data-feather="phone-off"></i>
            <span>End Call</span>
          </button>
        </div>
      </div>
    `;
  }
  
  /**
   * Render message input for non-call conversations
   */
  renderMessageInput(conversation) {
    // Don't show input for completed conversations
    if (conversation.status === 'completed') {
      return `
        <div class="conversation-closed">
          <i data-feather="lock"></i>
          <span>This conversation is closed</span>
        </div>
      `;
    }
    
    return `
      <div class="message-input-container">
        <div class="message-input-toolbar">
          <button class="toolbar-btn" id="emoji-btn" title="Insert Emoji">
            <i data-feather="smile"></i>
          </button>
          
          <button class="toolbar-btn" id="template-btn" title="Message Templates">
            <i data-feather="file-text"></i>
          </button>
          
          <button class="toolbar-btn" id="attachment-btn" title="Add Attachment">
            <i data-feather="paperclip"></i>
          </button>
        </div>
        
        <div class="message-input-wrapper">
          <textarea id="message-input" class="message-input" placeholder="Type a message..."></textarea>
          
          <button class="send-button" id="send-message-btn">
            <i data-feather="send"></i>
          </button>
        </div>
      </div>
    `;
  }
  
  /**
   * Render contact details in the sidebar
   */
  renderContactDetails(contact) {
    if (!contact || Object.keys(contact).length === 0) {
      return `<div class="no-contact-info">No contact information available</div>`;
    }
    
    return `
      <div class="contact-detail-list">
        ${contact.phone ? `
          <div class="contact-detail-item">
            <div class="detail-icon"><i data-feather="phone"></i></div>
            <div class="detail-info">
              <div class="detail-label">Phone</div>
              <div class="detail-value">${contact.phone}</div>
            </div>
          </div>
        ` : ''}
        
        ${contact.email ? `
          <div class="contact-detail-item">
            <div class="detail-icon"><i data-feather="mail"></i></div>
            <div class="detail-info">
              <div class="detail-label">Email</div>
              <div class="detail-value">${contact.email}</div>
            </div>
          </div>
        ` : ''}
        
        ${contact.company ? `
          <div class="contact-detail-item">
            <div class="detail-icon"><i data-feather="briefcase"></i></div>
            <div class="detail-info">
              <div class="detail-label">Company</div>
              <div class="detail-value">${contact.company}</div>
            </div>
          </div>
        ` : ''}
        
        ${contact.position ? `
          <div class="contact-detail-item">
            <div class="detail-icon"><i data-feather="user"></i></div>
            <div class="detail-info">
              <div class="detail-label">Position</div>
              <div class="detail-value">${contact.position}</div>
            </div>
          </div>
        ` : ''}
        
        ${contact.location ? `
          <div class="contact-detail-item">
            <div class="detail-icon"><i data-feather="map-pin"></i></div>
            <div class="detail-info">
              <div class="detail-label">Location</div>
              <div class="detail-value">${contact.location}</div>
            </div>
          </div>
        ` : ''}
      </div>
      
      <button class="btn btn-sm btn-outline btn-block" id="edit-contact-btn">
        <i data-feather="edit"></i>
        Edit Contact
      </button>
    `;
  }
  
  /**
   * Render AI insights in the sidebar
   */
  renderAIInsights(insights) {
    if (!insights || Object.keys(insights).length === 0) {
      return `<div class="no-insights">No insights available yet</div>`;
    }
    
    return `
      <div class="insights-list">
        ${insights.sentiment ? `
          <div class="insight-item">
            <div class="insight-header">
              <div class="insight-icon"><i data-feather="activity"></i></div>
              <div class="insight-title">Sentiment Analysis</div>
            </div>
            <div class="sentiment-meter">
              <div class="sentiment-bar">
                <div class="sentiment-indicator" style="left: ${(insights.sentiment.score + 1) * 50}%"></div>
              </div>
              <div class="sentiment-labels">
                <span>Negative</span>
                <span>Neutral</span>
                <span>Positive</span>
              </div>
            </div>
            <div class="sentiment-trend">
              ${insights.sentiment.trend === 'improving' ? 
                '<i data-feather="trending-up" class="trend-positive"></i> Improving' : 
                insights.sentiment.trend === 'declining' ? 
                '<i data-feather="trending-down" class="trend-negative"></i> Declining' : 
                '<i data-feather="minus"></i> Stable'}
            </div>
          </div>
        ` : ''}
        
        ${insights.topics && insights.topics.length > 0 ? `
          <div class="insight-item">
            <div class="insight-header">
              <div class="insight-icon"><i data-feather="list"></i></div>
              <div class="insight-title">Key Topics</div>
            </div>
            <div class="topics-list">
              ${insights.topics.map(topic => `
                <div class="topic-tag">${topic}</div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${insights.intent ? `
          <div class="insight-item">
            <div class="insight-header">
              <div class="insight-icon"><i data-feather="target"></i></div>
              <div class="insight-title">Customer Intent</div>
            </div>
            <div class="intent-analysis">
              <div class="intent-primary">${insights.intent.primary}</div>
              ${insights.intent.secondary ? `<div class="intent-secondary">${insights.intent.secondary}</div>` : ''}
            </div>
            <div class="intent-confidence">Confidence: ${insights.intent.confidence}%</div>
          </div>
        ` : ''}
        
        ${insights.questions && insights.questions.length > 0 ? `
          <div class="insight-item">
            <div class="insight-header">
              <div class="insight-icon"><i data-feather="help-circle"></i></div>
              <div class="insight-title">Key Questions</div>
            </div>
            <ul class="questions-list">
              ${insights.questions.map(question => `
                <li class="question-item">${question}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${insights.nextBestAction ? `
          <div class="insight-item">
            <div class="insight-header">
              <div class="insight-icon"><i data-feather="compass"></i></div>
              <div class="insight-title">Next Best Action</div>
            </div>
            <div class="next-action">
              ${insights.nextBestAction}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  /**
   * Set up event listeners for the conversations component
   */
  setupEventListeners() {
    // Toggle filters panel
    const toggleFiltersBtn = document.getElementById('toggle-filters');
    const filtersPanel = document.querySelector('.filters-panel');
    
    if (toggleFiltersBtn && filtersPanel) {
      toggleFiltersBtn.addEventListener('click', () => {
        filtersPanel.style.display = filtersPanel.style.display === 'none' ? 'block' : 'none';
      });
    }
    
    // Apply filters
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', () => {
        this.filter.type = document.getElementById('filter-type').value;
        this.filter.status = document.getElementById('filter-status').value;
        this.filter.date.from = document.getElementById('filter-date-from').value || null;
        this.filter.date.to = document.getElementById('filter-date-to').value || null;
        this.filter.page = 1; // Reset to first page when applying filters
        
        // Refresh conversations
        this.fetchConversations().then(() => {
          this.renderConversationList();
          
          // Reset active conversation if needed
          if (this.activeConversation) {
            const stillExists = this.conversations.some(c => c.id === this.activeConversation.id);
            if (!stillExists) {
              this.activeConversation = null;
              this.renderEmptyState();
            }
          }
        });
        
        // Hide filters panel
        filtersPanel.style.display = 'none';
      });
    }
    
    // Reset filters
    const resetFiltersBtn = document.getElementById('reset-filters');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        // Reset filter values in the form
        document.getElementById('filter-type').value = 'all';
        document.getElementById('filter-status').value = 'all';
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';
        document.getElementById('conversation-search').value = '';
        
        // Reset filter object
        this.filter = {
          type: 'all',
          status: 'all',
          search: '',
          date: {
            from: null,
            to: null
          },
          page: 1,
          limit: 10
        };
        
        // Refresh conversations
        this.fetchConversations().then(() => {
          this.renderConversationList();
        });
        
        // Hide filters panel
        filtersPanel.style.display = 'none';
      });
    }
    
    // Search input
    const searchInput = document.getElementById('conversation-search');
    if (searchInput) {
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          this.filter.search = searchInput.value;
          this.filter.page = 1; // Reset to first page
          
          // Refresh conversations
          this.fetchConversations().then(() => {
            this.renderConversationList();
          });
        }
      });
    }
    
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update filter
        const status = button.dataset.status;
        const type = button.dataset.type || this.filter.type;
        
        this.filter.status = status;
        this.filter.type = type;
        this.filter.page = 1; // Reset to first page
        
        // Update active tab
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Refresh conversations
        this.fetchConversations().then(() => {
          this.renderConversationList();
        });
      });
    });
    
    // Pagination
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        if (this.filter.page > 1) {
          this.filter.page--;
          
          // Refresh conversations
          this.fetchConversations().then(() => {
            this.renderConversationList();
          });
        }
      });
    }
    
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        if (this.filter.page < this.totalPages) {
          this.filter.page++;
          
          // Refresh conversations
          this.fetchConversations().then(() => {
            this.renderConversationList();
          });
        }
      });
    }
    
    // Conversation item click
    const conversationItems = document.querySelectorAll('.conversation-item');
    conversationItems.forEach(item => {
      item.addEventListener('click', async () => {
        const conversationId = item.dataset.id;
        
        // Fetch conversation detail
        await this.fetchConversation(conversationId);
        
        // Update UI
        conversationItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Mark as read if new
        if (item.querySelector('.new-badge')) {
          await this.apiService.put(`/api/conversations/${conversationId}/read`);
          item.querySelector('.new-badge').remove();
        }
        
        // Render detail view
        this.renderConversationDetail();
      });
    });
    
    // Message input and send button
    const messageInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    
    if (messageInput && sendMessageBtn && this.activeConversation) {
      sendMessageBtn.addEventListener('click', () => {
        this.sendMessage(messageInput.value);
      });
      
      messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage(messageInput.value);
        }
      });
    }
    
    // Call control buttons
    if (this.activeConversation && this.activeConversation.channel === 'voice' && this.activeConversation.status === 'active') {
      // Mute button
      const muteBtn = document.getElementById('mute-btn');
      if (muteBtn) {
        muteBtn.addEventListener('click', () => {
          this.toggleMute();
          muteBtn.classList.toggle('active');
        });
      }
      
      // Hold button
      const holdBtn = document.getElementById('hold-btn');
      if (holdBtn) {
        holdBtn.addEventListener('click', () => {
          this.toggleHold();
          holdBtn.classList.toggle('active');
        });
      }
      
      // Transfer button
      const transferBtn = document.getElementById('transfer-btn');
      if (transferBtn) {
        transferBtn.addEventListener('click', () => {
          this.showTransferModal();
        });
      }
      
      // End call button
      const hangupBtn = document.getElementById('hangup-btn');
      if (hangupBtn) {
        hangupBtn.addEventListener('click', () => {
          this.endCall();
        });
      }
      
      // Toggle AI panel
      const toggleAIPanel = document.getElementById('toggle-ai-panel');
      if (toggleAIPanel) {
        toggleAIPanel.addEventListener('click', () => {
          const panel = document.querySelector('.ai-assistance-panel');
          const isExpanded = panel.classList.contains('collapsed');
          
          if (isExpanded) {
            panel.classList.remove('collapsed');
            toggleAIPanel.innerHTML = '<i data-feather="chevron-up"></i>';
          } else {
            panel.classList.add('collapsed');
            toggleAIPanel.innerHTML = '<i data-feather="chevron-down"></i>';
          }
          
          feather.replace();
        });
      }
      
      // Use suggestion buttons
      document.querySelectorAll('.use-suggestion-btn').forEach(button => {
        button.addEventListener('click', () => {
          const suggestionText = button.previousElementSibling.textContent;
          this.useSuggestion(suggestionText);
        });
      });
      
      // Start call duration timer
      this.startCallDurationTimer();
      
      // Initialize audio visualizer
      this.initializeAudioVisualizer();
    }
    
    // Schedule appointment button
    const scheduleBtn = document.getElementById('schedule-appointment-btn');
    if (scheduleBtn) {
      scheduleBtn.addEventListener('click', () => {
        this.showScheduleAppointmentModal();
      });
    }
    
    // Update lead status button
    const updateStatusBtn = document.getElementById('update-lead-status-btn');
    if (updateStatusBtn) {
      updateStatusBtn.addEventListener('click', () => {
        this.showUpdateLeadStatusModal();
      });
    }
    
    // Add notes button
    const addNotesBtn = document.getElementById('add-notes-btn');
    if (addNotesBtn) {
      addNotesBtn.addEventListener('click', () => {
        this.showAddNotesModal();
      });
    }
    
    // Edit contact button
    const editContactBtn = document.getElementById('edit-contact-btn');
    if (editContactBtn) {
      editContactBtn.addEventListener('click', () => {
        this.showEditContactModal();
      });
    }
  }
  
  /**
   * Send a message in the conversation
   */
  async sendMessage(content) {
    if (!content || !content.trim() || !this.activeConversation) {
      return;
    }
    
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.value = '';
    }
    
    try {
      // Optimistic UI update - add message to UI immediately
      const messagesContainer = document.getElementById('conversation-messages');
      const tempId = `msg-${Date.now()}`;
      const messageHTML = `
        <div class="message message-outgoing" id="${tempId}">
          <div class="message-content">
            ${content}
            <div class="message-time">sending...</div>
          </div>
        </div>
      `;
      
      if (messagesContainer) {
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
      
      // Send message to API
      const response = await this.apiService.post(`/api/conversations/${this.activeConversation.id}/messages`, {
        content,
        type: 'text',
        channel: this.activeConversation.channel
      });
      
      // Update the message with the actual data
      const tempMessage = document.getElementById(tempId);
      if (tempMessage && response.message) {
        tempMessage.querySelector('.message-time').textContent = this.formatTime(response.message.timestamp);
        tempMessage.id = `msg-${response.message.id}`;
      }
      
      // Update conversation in the list
      this.updateConversationInList({
        id: this.activeConversation.id,
        lastMessage: content,
        lastActivityAt: new Date()
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error in the message
      const tempMessage = document.getElementById(`msg-${Date.now()}`);
      if (tempMessage) {
        tempMessage.classList.add('message-error');
        tempMessage.querySelector('.message-time').textContent = 'Failed to send';
      }
    }
  }
  
  /**
   * Toggle mute state for an active call
   */
  async toggleMute() {
    if (!this.activeConversation || this.activeConversation.channel !== 'voice') {
      return;
    }
    
    try {
      await this.apiService.post(`/api/telephony/calls/${this.activeConversation.callId}/mute`, {
        mute: !this.activeConversation.isMuted
      });
      
      // Update local state
      this.activeConversation.isMuted = !this.activeConversation.isMuted;
      
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  }
  
  /**
   * Toggle hold state for an active call
   */
  async toggleHold() {
    if (!this.activeConversation || this.activeConversation.channel !== 'voice') {
      return;
    }
    
    try {
      await this.apiService.post(`/api/telephony/calls/${this.activeConversation.callId}/hold`, {
        hold: !this.activeConversation.isOnHold
      });
      
      // Update local state
      this.activeConversation.isOnHold = !this.activeConversation.isOnHold;
      
    } catch (error) {
      console.error('Error toggling hold:', error);
    }
  }
  
  /**
   * End the active call
   */
  async endCall() {
    if (!this.activeConversation || this.activeConversation.channel !== 'voice') {
      return;
    }
    
    try {
      await this.apiService.post(`/api/telephony/calls/${this.activeConversation.callId}/hangup`);
      
      // Call will be updated via socket event
      
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }
  
  /**
   * Show modal for transferring a call
   */
  showTransferModal() {
    // Implementation for transfer modal
  }
  
  /**
   * Show modal for scheduling an appointment
   */
  showScheduleAppointmentModal() {
    // Implementation for appointment scheduling modal
  }
  
  /**
   * Show modal for updating lead status
   */
  showUpdateLeadStatusModal() {
    // Implementation for updating lead status
  }
  
  /**
   * Show modal for adding notes
   */
  showAddNotesModal() {
    // Implementation for adding notes
  }
  
  /**
   * Show modal for editing contact information
   */
  showEditContactModal() {
    // Implementation for editing contact
  }
  
  /**
   * Show modal for creating a new conversation
   */
  showNewConversationModal() {
    // Implementation for new conversation modal
  }
  
  /**
   * Use an AI suggestion during a call
   */
  useSuggestion(text) {
    // Implementation for using a suggestion
    console.log('Using suggestion:', text);
  }
  
  /**
   * Start the call duration timer
   */
  startCallDurationTimer() {
    if (this.callDurationInterval) {
      clearInterval(this.callDurationInterval);
    }
    
    const updateDuration = () => {
      const durationElement = document.getElementById('call-duration');
      if (durationElement && this.activeConversation && this.activeConversation.callStartTime) {
        durationElement.textContent = this.formatCallDuration(this.activeConversation.callStartTime);
      } else {
        clearInterval(this.callDurationInterval);
      }
    };
    
    // Update immediately and then every second
    updateDuration();
    this.callDurationInterval = setInterval(updateDuration, 1000);
  }
  
  /**
   * Initialize audio visualizer for active call
   */
  initializeAudioVisualizer() {
    const canvas = document.getElementById('audio-visualizer');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Mock visualization for demo purposes
    const visualize = () => {
      if (!canvas) return;
      
      // Adjust canvas size to container
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = 60;
      
      // Draw visualization
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barCount = 40;
      const barWidth = canvas.width / barCount - 2;
      
      for (let i = 0; i < barCount; i++) {
        const height = Math.random() * 50;
        
        ctx.fillStyle = `rgba(63, 81, 181, ${0.5 + height / 100})`;
        ctx.fillRect(i * (barWidth + 2), canvas.height - height, barWidth, height);
      }
      
      this.visualizerAnimationFrame = requestAnimationFrame(visualize);
    };
    
    visualize();
  }
  
  /**
   * Update a conversation in the list without reloading
   */
  updateConversationInList(updatedData) {
    const { id, lastMessage, lastActivityAt, status } = updatedData;
    
    // Find conversation item in the DOM
    const conversationItem = document.querySelector(`.conversation-item[data-id="${id}"]`);
    if (!conversationItem) return;
    
    // Update preview text
    const previewElement = conversationItem.querySelector('.conversation-preview');
    if (previewElement && lastMessage) {
      previewElement.textContent = lastMessage;
    }
    
    // Update time
    const timeElement = conversationItem.querySelector('.conversation-time');
    if (timeElement && lastActivityAt) {
      timeElement.textContent = this.formatDate(lastActivityAt);
    }
    
    // Update status
    const statusElement = conversationItem.querySelector('.conversation-status');
    if (statusElement && status) {
      statusElement.className = `conversation-status ${status}`;
      statusElement.textContent = this.getStatusLabel(status);
    }
  }
  
  /**
   * Get appropriate icon for channel type
   */
  getChannelIcon(channel) {
    const icons = {
      'voice': 'phone',
      'whatsapp': 'message-circle',
      'sms': 'message-square',
      'email': 'mail'
    };
    
    return icons[channel] || 'message-circle';
  }
  
  /**
   * Get CSS class for channel icon
   */
  getChannelIconClass(channel) {
    const classes = {
      'voice': 'channel-voice',
      'whatsapp': 'channel-whatsapp',
      'sms': 'channel-sms',
      'email': 'channel-email'
    };
    
    return classes[channel] || '';
  }
  
  /**
   * Get label for conversation status
   */
  getStatusLabel(status) {
    const labels = {
      'active': 'Active',
      'pending': 'Pending',
      'completed': 'Completed',
      'failed': 'Failed',
      'qualified': 'Qualified',
      'not-qualified': 'Not Qualified'
    };
    
    return labels[status] || status;
  }
  
  /**
   * Get label for lead status
   */
  getLeadStatusLabel(status) {
    const labels = {
      'new': 'New',
      'contacted': 'Contacted',
      'qualified': 'Qualified',
      'not-qualified': 'Not Qualified',
      'converted': 'Converted',
      'nurturing': 'Nurturing'
    };
    
    return labels[status] || status;
  }
  
  /**
   * Get appropriate icon for event type
   */
  getEventIcon(type) {
    const icons = {
      'call-started': 'phone-outgoing',
      'call-ended': 'phone-off',
      'message-sent': 'send',
      'message-received': 'message-square',
      'status-changed': 'refresh-cw',
      'lead-qualified': 'check-circle',
      'lead-disqualified': 'x-circle',
      'appointment-scheduled': 'calendar',
      'note-added': 'file-text'
    };
    
    return icons[type] || 'activity';
  }
  
  /**
   * Get CSS class for event icon
   */
  getEventIconClass(type) {
    const classes = {
      'call-started': 'event-call-started',
      'call-ended': 'event-call-ended',
      'message-sent': 'event-message-sent',
      'message-received': 'event-message-received',
      'status-changed': 'event-status-changed',
      'lead-qualified': 'event-lead-qualified',
      'lead-disqualified': 'event-lead-disqualified',
      'appointment-scheduled': 'event-appointment',
      'note-added': 'event-note'
    };
    
    return classes[type] || 'event-default';
  }
  
  /**
   * Format date for display
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Show full date for older dates
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  }
  
  /**
   * Format time for message timestamps
   */
  formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  /**
   * Format call duration from start time
   */
  formatCallDuration(startTimeString) {
    const startTime = new Date(startTimeString);
    const now = new Date();
    const durationMs = now - startTime;
    
    const seconds = Math.floor(durationMs / 1000) % 60;
    const minutes = Math.floor(durationMs / (1000 * 60)) % 60;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }
}
