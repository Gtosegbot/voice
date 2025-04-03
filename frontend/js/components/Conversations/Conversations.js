/**
 * Conversations Component
 * Manages conversations, messages, and call interactions
 */
class ConversationsComponent {
  constructor(app) {
    this.app = app;
    this.store = app.store;
    this.apiService = app.apiService;
    this.socketService = app.socketService;
    this.conversations = [];
    this.currentConversation = null;
    this.messages = [];
    this.isLoading = false;
    this.isLoadingMessages = false;
    this.filter = {
      status: 'all',
      channel: 'all',
      searchQuery: ''
    };
  }
  
  /**
   * Fetch conversations from the API
   */
  async fetchConversations() {
    try {
      this.isLoading = true;
      
      const queryParams = new URLSearchParams();
      
      if (this.filter.status !== 'all') {
        queryParams.append('status', this.filter.status);
      }
      
      if (this.filter.channel !== 'all') {
        queryParams.append('channel', this.filter.channel);
      }
      
      if (this.filter.searchQuery) {
        queryParams.append('search', this.filter.searchQuery);
      }
      
      const data = await this.apiService.get(`/conversations?${queryParams.toString()}`);
      this.conversations = data.conversations;
      this.isLoading = false;
      
      return data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      this.isLoading = false;
      return null;
    }
  }
  
  /**
   * Fetch messages for a conversation
   */
  async fetchMessages(conversationId) {
    if (!conversationId) return null;
    
    try {
      this.isLoadingMessages = true;
      
      const data = await this.apiService.get(`/conversations/${conversationId}/messages`);
      this.messages = data.messages;
      this.isLoadingMessages = false;
      
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      this.isLoadingMessages = false;
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
    
    // Fetch conversations
    await this.fetchConversations();
    
    // If a conversation is selected, fetch its messages
    if (this.currentConversation) {
      await this.fetchMessages(this.currentConversation.id);
    }
    
    // Render the conversation interface
    container.innerHTML = `
      <div class="conversation-container">
        <!-- Conversation Sidebar -->
        <div class="conversation-sidebar">
          <div class="conversation-header">
            <div class="conversation-filter">
              <input type="text" class="form-control" id="conversation-search" placeholder="Search conversations..." value="${this.filter.searchQuery}">
            </div>
            
            <div class="conversation-actions">
              <button class="btn btn-sm btn-outline" id="filter-conversations" title="Filter">
                <i data-feather="filter"></i>
              </button>
              
              <button class="btn btn-sm btn-primary" id="new-conversation" title="New Conversation">
                <i data-feather="plus"></i>
              </button>
            </div>
          </div>
          
          <div class="conversation-list">
            ${this.renderConversationList()}
          </div>
        </div>
        
        <!-- Conversation Main Area -->
        <div class="conversation-main">
          ${this.currentConversation ? this.renderConversationContent() : this.renderEmptyConversation()}
        </div>
      </div>
    `;
    
    // Initialize feather icons
    feather.replace();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Scroll to bottom of messages if a conversation is active
    if (this.currentConversation) {
      const messagesContainer = document.querySelector('.conversation-messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }
  
  /**
   * Render conversation list
   */
  renderConversationList() {
    if (this.isLoading) {
      return `
        <div class="loading-container">
          <div class="spinner-sm"></div>
          <p>Loading...</p>
        </div>
      `;
    }
    
    if (!this.conversations || this.conversations.length === 0) {
      return `
        <div class="empty-list">
          <i data-feather="message-circle" style="width: 24px; height: 24px; color: var(--text-secondary);"></i>
          <p>No conversations found</p>
          <p class="empty-list-subtitle">Start a new conversation using the button above</p>
        </div>
      `;
    }
    
    return this.conversations.map(conversation => `
      <div class="conversation-item ${this.currentConversation?.id === conversation.id ? 'active' : ''}" data-conversation-id="${conversation.id}">
        <div class="conversation-item-header">
          <div class="conversation-contact">${conversation.contactName || 'Unknown'}</div>
          <div class="conversation-time">${this.formatTime(conversation.lastActivityAt)}</div>
        </div>
        <div class="conversation-preview">
          ${conversation.lastMessage ? this.truncateText(conversation.lastMessage, 50) : 'No messages'}
        </div>
        <div class="conversation-meta">
          <span class="conversation-channel">
            <i data-feather="${this.getChannelIcon(conversation.channel)}"></i>
            ${conversation.channel}
          </span>
          ${conversation.isNew ? '<span class="conversation-new">New</span>' : ''}
        </div>
      </div>
    `).join('');
  }
  
  /**
   * Render conversation content
   */
  renderConversationContent() {
    return `
      <div class="conversation-header">
        <div class="conversation-info">
          <div class="conversation-contact-name">${this.currentConversation.contactName || 'Unknown'}</div>
          <div class="conversation-status">${this.currentConversation.status}</div>
        </div>
        
        <div class="conversation-tools">
          <button class="btn btn-sm btn-outline" id="call-contact" title="Call">
            <i data-feather="phone"></i>
          </button>
          
          <button class="btn btn-sm btn-outline" id="contact-info" title="Contact Info">
            <i data-feather="info"></i>
          </button>
          
          <button class="btn btn-sm btn-outline" id="more-options" title="More Options">
            <i data-feather="more-vertical"></i>
          </button>
        </div>
      </div>
      
      <div class="conversation-messages">
        ${this.renderMessages()}
      </div>
      
      <div class="message-input">
        <form class="message-form" id="message-form">
          <input type="text" class="message-input-field" id="message-text" placeholder="Type your message...">
          <button type="submit" class="message-send-btn">
            <i data-feather="send"></i>
          </button>
        </form>
      </div>
    `;
  }
  
  /**
   * Render empty conversation state
   */
  renderEmptyConversation() {
    return `
      <div class="empty-conversation">
        <div class="empty-state">
          <i data-feather="message-square" style="width: 48px; height: 48px; color: var(--text-secondary);"></i>
          <h3>No Conversation Selected</h3>
          <p>Select a conversation from the list or start a new one</p>
          <button class="btn btn-primary" id="start-new-conversation">
            <i data-feather="plus"></i>
            New Conversation
          </button>
        </div>
      </div>
    `;
  }
  
  /**
   * Render messages
   */
  renderMessages() {
    if (this.isLoadingMessages) {
      return `
        <div class="loading-container">
          <div class="spinner-sm"></div>
          <p>Loading messages...</p>
        </div>
      `;
    }
    
    if (!this.messages || this.messages.length === 0) {
      return `
        <div class="empty-messages">
          <div class="empty-state">
            <i data-feather="message-circle" style="width: 32px; height: 32px; color: var(--text-secondary);"></i>
            <h3>No Messages Yet</h3>
            <p>Start the conversation by sending a message</p>
          </div>
        </div>
      `;
    }
    
    return this.messages.map(message => `
      <div class="message-item ${this.getMessageAlignment(message.senderType)}">
        <div class="message-bubble">
          ${message.content}
        </div>
        <div class="message-meta">
          ${this.formatTime(message.createdAt)}
        </div>
      </div>
    `).join('');
  }
  
  /**
   * Render new conversation modal
   */
  renderNewConversationModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'new-conversation-modal';
    
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">New Conversation</h3>
          <button class="modal-close" id="close-new-conversation">
            <i data-feather="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="new-conversation-form">
            <div class="form-group">
              <label for="contact-type" class="form-label">Contact Type</label>
              <select class="form-select" id="contact-type">
                <option value="existing">Existing Lead</option>
                <option value="new">New Lead</option>
              </select>
            </div>
            
            <div id="existing-lead-form">
              <div class="form-group">
                <label for="lead-select" class="form-label">Select Lead</label>
                <select class="form-select" id="lead-select">
                  <option value="">-- Select a Lead --</option>
                  <!-- Leads will be populated dynamically -->
                </select>
              </div>
            </div>
            
            <div id="new-lead-form" style="display: none;">
              <div class="form-group">
                <label for="lead-name" class="form-label">Name *</label>
                <input type="text" id="lead-name" class="form-control" required>
              </div>
              
              <div class="form-group">
                <label for="lead-company" class="form-label">Company</label>
                <input type="text" id="lead-company" class="form-control">
              </div>
              
              <div class="form-group">
                <label for="lead-email" class="form-label">Email</label>
                <input type="email" id="lead-email" class="form-control">
              </div>
              
              <div class="form-group">
                <label for="lead-phone" class="form-label">Phone</label>
                <input type="tel" id="lead-phone" class="form-control">
              </div>
            </div>
            
            <div class="form-group">
              <label for="channel-select" class="form-label">Channel</label>
              <select class="form-select" id="channel-select">
                <option value="call">Voice Call</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="cancel-conversation-btn">Cancel</button>
          <button class="btn btn-primary" id="start-conversation-btn">Start Conversation</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize feather icons
    feather.replace();
    
    // Fetch leads for the select dropdown
    this.fetchLeadsForSelect();
    
    // Set up event listeners
    document.getElementById('close-new-conversation')?.addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('cancel-conversation-btn')?.addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('contact-type')?.addEventListener('change', (e) => {
      const contactType = e.target.value;
      
      if (contactType === 'existing') {
        document.getElementById('existing-lead-form').style.display = 'block';
        document.getElementById('new-lead-form').style.display = 'none';
      } else {
        document.getElementById('existing-lead-form').style.display = 'none';
        document.getElementById('new-lead-form').style.display = 'block';
      }
    });
    
    document.getElementById('start-conversation-btn')?.addEventListener('click', () => {
      this.startNewConversation();
    });
  }
  
  /**
   * Fetch leads for the select dropdown
   */
  async fetchLeadsForSelect() {
    try {
      const data = await this.apiService.get('/leads');
      const leadSelect = document.getElementById('lead-select');
      
      if (!leadSelect || !data.leads) return;
      
      // Clear existing options except the first placeholder
      while (leadSelect.options.length > 1) {
        leadSelect.remove(1);
      }
      
      // Add leads to the select
      data.leads.forEach(lead => {
        const option = document.createElement('option');
        option.value = lead.id;
        option.textContent = `${lead.name} - ${lead.company || 'No Company'}`;
        leadSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error fetching leads for select:', error);
    }
  }
  
  /**
   * Start a new conversation
   */
  async startNewConversation() {
    const contactType = document.getElementById('contact-type')?.value;
    const channel = document.getElementById('channel-select')?.value;
    
    let leadId;
    let leadData;
    
    if (contactType === 'existing') {
      leadId = document.getElementById('lead-select')?.value;
      
      if (!leadId) {
        alert('Please select a lead');
        return;
      }
    } else {
      // Create new lead
      const name = document.getElementById('lead-name')?.value;
      const company = document.getElementById('lead-company')?.value;
      const email = document.getElementById('lead-email')?.value;
      const phone = document.getElementById('lead-phone')?.value;
      
      if (!name) {
        alert('Lead name is required');
        return;
      }
      
      leadData = {
        name,
        company,
        email,
        phone,
        status: 'new'
      };
    }
    
    try {
      let conversation;
      
      if (contactType === 'existing') {
        // Start conversation with existing lead
        conversation = await this.apiService.post('/conversations', {
          leadId,
          channel
        });
      } else {
        // Create lead and start conversation
        conversation = await this.apiService.post('/conversations/with-new-lead', {
          lead: leadData,
          channel
        });
      }
      
      // Close modal
      document.getElementById('new-conversation-modal')?.remove();
      
      // Update current conversation
      this.currentConversation = conversation;
      
      // Fetch messages for the new conversation
      await this.fetchMessages(conversation.id);
      
      // Refresh conversations list
      await this.fetchConversations();
      
      // Re-render component
      this.render(document.getElementById('view-container'));
      
      // If channel is call, start the call
      if (channel === 'call') {
        this.initiateCall(conversation.id, conversation.leadId);
      }
    } catch (error) {
      console.error('Error starting new conversation:', error);
      alert(`Failed to start conversation: ${error.message}`);
    }
  }
  
  /**
   * Send a message
   */
  async sendMessage(content) {
    if (!this.currentConversation || !content) return;
    
    try {
      // Optimistically add message to UI
      const tempMessageId = 'temp-' + Date.now();
      const tempMessage = {
        id: tempMessageId,
        conversationId: this.currentConversation.id,
        senderType: 'agent',
        senderId: this.store.getState().user.id,
        content,
        messageType: 'text',
        createdAt: new Date().toISOString()
      };
      
      this.messages.push(tempMessage);
      
      // Update UI
      const messagesContainer = document.querySelector('.conversation-messages');
      if (messagesContainer) {
        messagesContainer.innerHTML = this.renderMessages();
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
      
      // Send message to API
      const response = await this.apiService.post(`/conversations/${this.currentConversation.id}/messages`, {
        content,
        messageType: 'text'
      });
      
      // Replace temp message with actual message
      const index = this.messages.findIndex(m => m.id === tempMessageId);
      if (index !== -1) {
        this.messages[index] = response.message;
      }
      
      // Update conversation list
      await this.fetchConversations();
      
      // Only update conversation list in UI, not the whole component
      const conversationList = document.querySelector('.conversation-list');
      if (conversationList) {
        conversationList.innerHTML = this.renderConversationList();
        
        // Re-attach event listeners
        document.querySelectorAll('.conversation-item').forEach(item => {
          item.addEventListener('click', () => {
            const conversationId = item.dataset.conversationId;
            this.selectConversation(conversationId);
          });
        });
        
        // Initialize feather icons
        feather.replace();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove temp message on error
      const tempMessageId = 'temp-' + Date.now();
      this.messages = this.messages.filter(m => m.id !== tempMessageId);
      
      // Update UI
      const messagesContainer = document.querySelector('.conversation-messages');
      if (messagesContainer) {
        messagesContainer.innerHTML = this.renderMessages();
      }
      
      alert(`Failed to send message: ${error.message}`);
    }
  }
  
  /**
   * Initiate a call
   */
  async initiateCall(conversationId, leadId) {
    try {
      // Initiate call via API
      const response = await this.apiService.post(`/calls/outbound`, {
        conversationId,
        leadId
      });
      
      // Show call UI
      this.showCallUI(response.callId);
    } catch (error) {
      console.error('Error initiating call:', error);
      alert(`Failed to initiate call: ${error.message}`);
    }
  }
  
  /**
   * Show call UI
   */
  showCallUI(callId) {
    // TODO: Implement call UI
    alert(`Call initiated (Call ID: ${callId})`);
  }
  
  /**
   * Select a conversation
   */
  async selectConversation(conversationId) {
    if (!conversationId) return;
    
    // Find conversation in list
    const conversation = this.conversations.find(c => c.id === parseInt(conversationId));
    if (!conversation) return;
    
    // Set current conversation
    this.currentConversation = conversation;
    
    // Fetch messages for the conversation
    await this.fetchMessages(conversationId);
    
    // Re-render the component
    this.render(document.getElementById('view-container'));
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Conversation list items
    document.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', () => {
        const conversationId = item.dataset.conversationId;
        this.selectConversation(conversationId);
      });
    });
    
    // New conversation button
    document.getElementById('new-conversation')?.addEventListener('click', () => {
      this.renderNewConversationModal();
    });
    
    // Start new conversation button (empty state)
    document.getElementById('start-new-conversation')?.addEventListener('click', () => {
      this.renderNewConversationModal();
    });
    
    // Message form
    document.getElementById('message-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const messageInput = document.getElementById('message-text');
      const content = messageInput.value.trim();
      
      if (content) {
        this.sendMessage(content);
        messageInput.value = '';
      }
    });
    
    // Call contact button
    document.getElementById('call-contact')?.addEventListener('click', () => {
      if (this.currentConversation) {
        this.initiateCall(this.currentConversation.id, this.currentConversation.leadId);
      }
    });
    
    // Filter conversations button
    document.getElementById('filter-conversations')?.addEventListener('click', () => {
      this.showFilterModal();
    });
    
    // Conversation search input
    document.getElementById('conversation-search')?.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.filter.searchQuery = e.target.value;
        
        this.fetchConversations().then(() => {
          this.render(document.getElementById('view-container'));
        });
      }
    });
  }
  
  /**
   * Show filter modal
   */
  showFilterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'filter-modal';
    
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Filter Conversations</h3>
          <button class="modal-close" id="close-filter-modal">
            <i data-feather="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="filter-form">
            <div class="form-group">
              <label for="filter-status" class="form-label">Status</label>
              <select class="form-select" id="filter-status">
                <option value="all" ${this.filter.status === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="active" ${this.filter.status === 'active' ? 'selected' : ''}>Active</option>
                <option value="closed" ${this.filter.status === 'closed' ? 'selected' : ''}>Closed</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="filter-channel" class="form-label">Channel</label>
              <select class="form-select" id="filter-channel">
                <option value="all" ${this.filter.channel === 'all' ? 'selected' : ''}>All Channels</option>
                <option value="call" ${this.filter.channel === 'call' ? 'selected' : ''}>Call</option>
                <option value="sms" ${this.filter.channel === 'sms' ? 'selected' : ''}>SMS</option>
                <option value="email" ${this.filter.channel === 'email' ? 'selected' : ''}>Email</option>
                <option value="whatsapp" ${this.filter.channel === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="reset-filters-btn">Reset Filters</button>
          <button class="btn btn-primary" id="apply-filters-btn">Apply Filters</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize feather icons
    feather.replace();
    
    // Set up event listeners
    document.getElementById('close-filter-modal')?.addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
      document.getElementById('filter-status').value = 'all';
      document.getElementById('filter-channel').value = 'all';
    });
    
    document.getElementById('apply-filters-btn')?.addEventListener('click', () => {
      this.filter.status = document.getElementById('filter-status').value;
      this.filter.channel = document.getElementById('filter-channel').value;
      
      this.fetchConversations().then(() => {
        this.render(document.getElementById('view-container'));
        modal.remove();
      });
    });
  }
  
  /**
   * Get message alignment based on sender type
   */
  getMessageAlignment(senderType) {
    return (senderType === 'agent' || senderType === 'system') ? 'outgoing' : 'incoming';
  }
  
  /**
   * Get icon for channel type
   */
  getChannelIcon(channel) {
    switch (channel) {
      case 'call':
        return 'phone';
      case 'sms':
        return 'message-square';
      case 'email':
        return 'mail';
      case 'whatsapp':
        return 'message-circle';
      default:
        return 'message-square';
    }
  }
  
  /**
   * Format time for display
   */
  formatTime(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffSeconds < 604800) {
      const days = Math.floor(diffSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
  
  /**
   * Truncate text to specified length
   */
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }
}
