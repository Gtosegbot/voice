/**
 * Conversations component for VoiceAI platform
 */

class Conversations {
    constructor() {
        this.element = document.getElementById('conversations-page');
        this.currentConversation = null;
        this.conversationsList = [];
        this.messages = [];
    }
    
    /**
     * Initialize conversations
     */
    async init() {
        if (!this.element) return;
        
        try {
            // Render conversations
            this.render();
            
            // Load conversations
            await this.loadConversations();
            
            // Set up event handlers
            this.setupEventHandlers();
        } catch (error) {
            console.error('Error initializing conversations:', error);
        }
    }
    
    /**
     * Render conversations
     */
    render() {
        this.element.innerHTML = `
            <div class="conversations-container">
                <div class="conversations-sidebar">
                    <div class="conversations-header">
                        <input type="text" class="conversations-search" placeholder="Buscar conversas...">
                    </div>
                    <div class="conversations-list" id="conversations-list">
                        <!-- Conversations will be loaded here -->
                        <div class="text-center p-3">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Carregando...</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="conversation-main">
                    <div class="conversation-info" id="conversation-info">
                        <div class="conversation-lead-info">
                            <h3>Selecione uma conversa</h3>
                            <p>Escolha uma conversa para ver as mensagens</p>
                        </div>
                        <div class="conversation-actions">
                            <!-- Actions will be loaded when a conversation is selected -->
                        </div>
                    </div>
                    
                    <div class="conversation-messages" id="conversation-messages">
                        <!-- Messages will be loaded when a conversation is selected -->
                        <div class="conversation-empty text-center p-5">
                            <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                            <p>Selecione uma conversa para ver as mensagens</p>
                        </div>
                    </div>
                    
                    <div class="message-input-container" id="message-input-container" style="display: none;">
                        <textarea class="message-input" id="message-input" placeholder="Digite sua mensagem..."></textarea>
                        <button class="btn btn-primary" id="send-message-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- New Conversation Modal -->
            <div class="modal fade" id="new-conversation-modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Nova Conversa</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="new-conversation-form">
                                <div class="mb-3">
                                    <label for="conversation-lead-select" class="form-label">Selecione um Lead</label>
                                    <select id="conversation-lead-select" class="form-select">
                                        <option value="">-- Selecione um Lead --</option>
                                        <!-- Will be populated dynamically -->
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="conversation-channel" class="form-label">Canal</label>
                                    <select id="conversation-channel" class="form-select">
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="voice">Voz</option>
                                        <option value="sms">SMS</option>
                                        <option value="email">Email</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="start-conversation-btn">Iniciar Conversa</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Add floating action button to the page
        this.addFloatingActionButton();
        
        // Message input
        const messageInput = document.getElementById('message-input');
        const sendMessageBtn = document.getElementById('send-message-btn');
        
        if (messageInput && sendMessageBtn) {
            // Send message on button click
            sendMessageBtn.addEventListener('click', () => {
                this.sendMessage();
            });
            
            // Send message on enter key
            messageInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Start conversation
        const startConversationBtn = document.getElementById('start-conversation-btn');
        if (startConversationBtn) {
            startConversationBtn.addEventListener('click', () => {
                this.startConversation();
            });
        }
    }
    
    /**
     * Add floating action button
     */
    addFloatingActionButton() {
        // Create floating action button
        const fab = document.createElement('button');
        fab.className = 'btn btn-primary btn-lg rounded-circle position-fixed';
        fab.id = 'new-conversation-fab';
        fab.innerHTML = '<i class="fas fa-plus"></i>';
        fab.style.cssText = 'bottom: 30px; right: 30px; width: 60px; height: 60px; z-index: 1000;';
        
        // Add event listener
        fab.addEventListener('click', () => {
            this.openNewConversationModal();
        });
        
        // Add to page
        document.body.appendChild(fab);
    }
    
    /**
     * Open new conversation modal
     */
    async openNewConversationModal() {
        try {
            // Get lead select element
            const leadSelect = document.getElementById('conversation-lead-select');
            
            if (leadSelect) {
                // Clear existing options
                leadSelect.innerHTML = '<option value="">-- Selecione um Lead --</option>';
                
                // Load leads
                const data = await ApiService.getLeads();
                
                // Add leads to select
                if (data.leads && data.leads.length > 0) {
                    data.leads.forEach(lead => {
                        const option = document.createElement('option');
                        option.value = lead.id;
                        option.textContent = lead.name;
                        leadSelect.appendChild(option);
                    });
                }
            }
            
            // Open modal
            const modal = document.getElementById('new-conversation-modal');
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
        } catch (error) {
            console.error('Error loading leads for new conversation:', error);
            window.store.setNotification('Erro ao carregar leads', 'danger');
        }
    }
    
    /**
     * Start new conversation
     */
    async startConversation() {
        try {
            // Get form data
            const leadId = document.getElementById('conversation-lead-select').value;
            const channel = document.getElementById('conversation-channel').value;
            
            // Validate form
            if (!leadId) {
                alert('Selecione um lead');
                return;
            }
            
            // Create conversation
            const conversation = await ApiService.createConversation({
                leadId,
                channel
            });
            
            // Close modal
            const modal = document.getElementById('new-conversation-modal');
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            
            // Reload conversations
            await this.loadConversations();
            
            // Select the new conversation
            this.selectConversation(conversation.id);
            
            // Show notification
            window.store.setNotification('Conversa iniciada com sucesso', 'success');
        } catch (error) {
            console.error('Error starting conversation:', error);
            window.store.setNotification('Erro ao iniciar conversa', 'danger');
        }
    }
    
    /**
     * Load conversations
     */
    async loadConversations() {
        try {
            // Get conversations list element
            const conversationsList = document.getElementById('conversations-list');
            
            if (!conversationsList) return;
            
            // Show loading
            conversationsList.innerHTML = `
                <div class="text-center p-3">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </div>
            `;
            
            // Load conversations from store
            const conversations = await window.store.loadConversations();
            this.conversationsList = conversations;
            
            // Update conversations list
            this.updateConversationsList();
        } catch (error) {
            console.error('Error loading conversations:', error);
            
            // Show error
            const conversationsList = document.getElementById('conversations-list');
            if (conversationsList) {
                conversationsList.innerHTML = `
                    <div class="text-center p-3 text-danger">
                        <i class="fas fa-exclamation-circle"></i> Erro ao carregar conversas. Tente novamente.
                    </div>
                `;
            }
        }
    }
    
    /**
     * Update conversations list
     */
    updateConversationsList() {
        const conversationsList = document.getElementById('conversations-list');
        if (!conversationsList) return;
        
        if (!this.conversationsList || this.conversationsList.length === 0) {
            conversationsList.innerHTML = `
                <div class="text-center p-3">
                    <p class="mb-2">Nenhuma conversa encontrada</p>
                    <button id="create-first-conversation-btn" class="btn btn-sm btn-primary">
                        Iniciar Nova Conversa
                    </button>
                </div>
            `;
            
            // Add event listener to create conversation button
            const createFirstConversationBtn = document.getElementById('create-first-conversation-btn');
            if (createFirstConversationBtn) {
                createFirstConversationBtn.addEventListener('click', () => {
                    this.openNewConversationModal();
                });
            }
            
            return;
        }
        
        // Generate list items
        let html = '';
        this.conversationsList.forEach(conversation => {
            const isActive = this.currentConversation && this.currentConversation.id === conversation.id;
            
            html += `
                <div class="conversation-item ${isActive ? 'active' : ''}" data-id="${conversation.id}">
                    <div class="conversation-lead">${conversation.leadName || 'Lead'}</div>
                    <div class="conversation-preview">${conversation.lastMessage || 'Nenhuma mensagem'}</div>
                    <div class="conversation-time">${this.formatDate(conversation.lastActivityAt)}</div>
                </div>
            `;
        });
        
        conversationsList.innerHTML = html;
        
        // Add event listeners
        const conversationItems = conversationsList.querySelectorAll('.conversation-item');
        conversationItems.forEach(item => {
            item.addEventListener('click', () => {
                const conversationId = item.getAttribute('data-id');
                this.selectConversation(conversationId);
            });
        });
    }
    
    /**
     * Select conversation
     */
    async selectConversation(conversationId) {
        try {
            // Deselect current conversation
            const currentItem = document.querySelector('.conversation-item.active');
            if (currentItem) {
                currentItem.classList.remove('active');
            }
            
            // Select new conversation
            const newItem = document.querySelector(`.conversation-item[data-id="${conversationId}"]`);
            if (newItem) {
                newItem.classList.add('active');
            }
            
            // Get conversation
            const conversation = await ApiService.getConversation(conversationId);
            this.currentConversation = conversation;
            
            // Update conversation info
            this.updateConversationInfo();
            
            // Load messages
            await this.loadMessages(conversationId);
            
            // Show message input
            const messageInputContainer = document.getElementById('message-input-container');
            if (messageInputContainer) {
                messageInputContainer.style.display = 'flex';
            }
        } catch (error) {
            console.error('Error selecting conversation:', error);
            window.store.setNotification('Erro ao carregar conversa', 'danger');
        }
    }
    
    /**
     * Update conversation info
     */
    updateConversationInfo() {
        const conversationInfo = document.getElementById('conversation-info');
        if (!conversationInfo) return;
        
        if (!this.currentConversation) {
            conversationInfo.innerHTML = `
                <div class="conversation-lead-info">
                    <h3>Selecione uma conversa</h3>
                    <p>Escolha uma conversa para ver as mensagens</p>
                </div>
            `;
            return;
        }
        
        // Get lead name and company
        const lead = this.currentConversation.lead || {};
        const leadName = lead.name || 'Lead';
        const leadCompany = lead.company || '';
        
        // Get channel icon
        let channelIcon = '';
        switch (this.currentConversation.channel) {
            case 'whatsapp':
                channelIcon = 'fa-whatsapp';
                break;
            case 'voice':
                channelIcon = 'fa-phone';
                break;
            case 'sms':
                channelIcon = 'fa-sms';
                break;
            case 'email':
                channelIcon = 'fa-envelope';
                break;
            default:
                channelIcon = 'fa-comment';
        }
        
        conversationInfo.innerHTML = `
            <div class="conversation-lead-info">
                <h3>${leadName}</h3>
                <p>
                    ${leadCompany ? `${leadCompany} • ` : ''}
                    <i class="fas ${channelIcon}"></i> ${this.getChannelLabel(this.currentConversation.channel)}
                </p>
            </div>
            <div class="conversation-actions">
                <button class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-phone"></i> Ligar
                </button>
                <button class="btn btn-sm btn-outline-secondary">
                    <i class="fas fa-user-edit"></i> Editar Lead
                </button>
            </div>
        `;
    }
    
    /**
     * Load messages
     */
    async loadMessages(conversationId) {
        try {
            const messagesContainer = document.getElementById('conversation-messages');
            
            if (!messagesContainer) return;
            
            // Show loading
            messagesContainer.innerHTML = `
                <div class="text-center p-3">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </div>
            `;
            
            // Load messages from store
            const messages = await window.store.loadMessages(conversationId);
            this.messages = messages;
            
            // Update messages container
            this.updateMessagesContainer();
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Error loading messages:', error);
            
            // Show error
            const messagesContainer = document.getElementById('conversation-messages');
            if (messagesContainer) {
                messagesContainer.innerHTML = `
                    <div class="text-center p-3 text-danger">
                        <i class="fas fa-exclamation-circle"></i> Erro ao carregar mensagens. Tente novamente.
                    </div>
                `;
            }
        }
    }
    
    /**
     * Update messages container
     */
    updateMessagesContainer() {
        const messagesContainer = document.getElementById('conversation-messages');
        if (!messagesContainer) return;
        
        if (!this.messages || this.messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="text-center p-3">
                    <p>Nenhuma mensagem encontrada</p>
                    <p class="text-muted small">Envie uma mensagem para iniciar a conversa</p>
                </div>
            `;
            return;
        }
        
        // Generate messages
        let html = '';
        this.messages.forEach(message => {
            const isOutgoing = message.senderType === 'agent' || message.senderType === 'system';
            
            html += `
                <div class="message ${isOutgoing ? 'outgoing' : 'incoming'}">
                    <div class="message-sender">${this.getSenderLabel(message.senderType)}</div>
                    <div class="message-content">${message.content}</div>
                    <div class="message-time">${this.formatTime(message.createdAt)}</div>
                </div>
            `;
        });
        
        messagesContainer.innerHTML = html;
    }
    
    /**
     * Send message
     */
    async sendMessage() {
        if (!this.currentConversation) return;
        
        // Get message input
        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;
        
        // Get message content
        const content = messageInput.value.trim();
        if (!content) return;
        
        try {
            // Clear input
            messageInput.value = '';
            
            // Send message
            await window.store.sendMessage(this.currentConversation.id, content);
            
            // Scroll to bottom
            const messagesContainer = document.getElementById('conversation-messages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        } catch (error) {
            console.error('Error sending message:', error);
            window.store.setNotification('Erro ao enviar mensagem', 'danger');
        }
    }
    
    /**
     * Format date
     */
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            // Today
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            // Yesterday
            return 'Ontem';
        } else if (diffDays < 7) {
            // This week
            const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            return days[date.getDay()];
        } else {
            // Earlier
            return date.toLocaleDateString();
        }
    }
    
    /**
     * Format time
     */
    formatTime(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    /**
     * Get channel label
     */
    getChannelLabel(channel) {
        switch (channel) {
            case 'whatsapp':
                return 'WhatsApp';
            case 'voice':
                return 'Voz';
            case 'sms':
                return 'SMS';
            case 'email':
                return 'Email';
            default:
                return channel;
        }
    }
    
    /**
     * Get sender label
     */
    getSenderLabel(senderType) {
        switch (senderType) {
            case 'agent':
                return 'Agente';
            case 'lead':
                return 'Lead';
            case 'system':
                return 'Sistema';
            case 'ai':
                return 'IA';
            default:
                return senderType;
        }
    }
}

// Export the conversations component
window.Conversations = new Conversations();
