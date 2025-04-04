/**
 * Conversations Component
 * This component renders the conversations page
 */

/**
 * Initialize the conversations page
 */
function initConversations() {
    renderConversations();
    setupConversationsEvents();
    loadConversations();
}

/**
 * Render the conversations HTML
 */
function renderConversations() {
    const conversationsPage = document.getElementById('conversations-page');
    
    conversationsPage.innerHTML = `
        <div class="conversations-container">
            <div class="conversations-sidebar">
                <div class="p-3 d-flex justify-content-between align-items-center">
                    <h5 class="m-0">Conversas</h5>
                    <button class="btn btn-sm btn-primary" id="new-conversation-btn">
                        <i class="fas fa-plus"></i> Nova
                    </button>
                </div>
                
                <div class="p-2">
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                        <input type="text" class="form-control form-control-sm" placeholder="Buscar..." id="conversation-search">
                    </div>
                </div>
                
                <div id="conversations-list">
                    <!-- Conversation items will be loaded here -->
                    <div class="text-center p-3">
                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Carregando conversas...
                    </div>
                </div>
            </div>
            
            <div class="conversation-main">
                <div class="conversation-header">
                    <div class="d-flex align-items-center">
                        <img src="img/avatar-placeholder.jpg" alt="Lead Avatar" class="user-avatar">
                        <div class="ms-2">
                            <h5 class="m-0" id="current-conversation-name">Selecione uma conversa</h5>
                            <small class="text-muted" id="current-conversation-status"></small>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-2" id="call-contact-btn">
                            <i class="fas fa-phone"></i> Ligar
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" id="conversation-info-btn">
                            <i class="fas fa-info-circle"></i> Info
                        </button>
                    </div>
                </div>
                
                <div class="conversation-messages" id="messages-container">
                    <div class="text-center p-5">
                        <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                        <p>Selecione uma conversa ou inicie uma nova</p>
                    </div>
                </div>
                
                <div class="message-input-container">
                    <input type="text" class="message-input" id="message-input" placeholder="Digite sua mensagem..." disabled>
                    <button class="message-send-btn" id="send-message-btn" disabled>
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
                        <div class="mb-3">
                            <label class="form-label">Tipo de Contato</label>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="contact-type" id="existing-lead" value="existing" checked>
                                <label class="form-check-label" for="existing-lead">Lead Existente</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="contact-type" id="new-lead" value="new">
                                <label class="form-check-label" for="new-lead">Novo Lead</label>
                            </div>
                        </div>
                        
                        <div id="existing-lead-form">
                            <div class="mb-3">
                                <label for="lead-select" class="form-label">Selecionar Lead</label>
                                <select class="form-select" id="lead-select">
                                    <option value="">-- Selecione um Lead --</option>
                                    <!-- Will be populated dynamically -->
                                </select>
                            </div>
                        </div>
                        
                        <div id="new-lead-form" style="display: none;">
                            <div class="mb-3">
                                <label for="new-lead-name" class="form-label">Nome</label>
                                <input type="text" class="form-control" id="new-lead-name">
                            </div>
                            <div class="mb-3">
                                <label for="new-lead-company" class="form-label">Empresa</label>
                                <input type="text" class="form-control" id="new-lead-company">
                            </div>
                            <div class="mb-3">
                                <label for="new-lead-phone" class="form-label">Telefone</label>
                                <input type="tel" class="form-control" id="new-lead-phone">
                            </div>
                            <div class="mb-3">
                                <label for="new-lead-email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="new-lead-email">
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="channel-select" class="form-label">Canal</label>
                            <select class="form-select" id="channel-select">
                                <option value="whatsapp">WhatsApp</option>
                                <option value="sms">SMS</option>
                                <option value="voice">Voz</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="start-conversation-btn">Iniciar Conversa</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Conversation Info Modal -->
        <div class="modal fade" id="conversation-info-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Informações da Conversa</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="conversation-info-body">
                        <!-- Will be populated dynamically -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Set up conversations event listeners
 */
function setupConversationsEvents() {
    // New conversation button
    const newConversationBtn = document.getElementById('new-conversation-btn');
    if (newConversationBtn) {
        newConversationBtn.addEventListener('click', () => {
            const newConversationModal = new bootstrap.Modal(document.getElementById('new-conversation-modal'));
            newConversationModal.show();
            
            // Populate lead select with available leads
            populateLeadSelect();
        });
    }
    
    // Contact type radio buttons
    const contactTypeRadios = document.querySelectorAll('input[name="contact-type"]');
    contactTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const existingLeadForm = document.getElementById('existing-lead-form');
            const newLeadForm = document.getElementById('new-lead-form');
            
            if (radio.value === 'existing') {
                existingLeadForm.style.display = 'block';
                newLeadForm.style.display = 'none';
            } else {
                existingLeadForm.style.display = 'none';
                newLeadForm.style.display = 'block';
            }
        });
    });
    
    // Start conversation button
    const startConversationBtn = document.getElementById('start-conversation-btn');
    if (startConversationBtn) {
        startConversationBtn.addEventListener('click', startNewConversation);
    }
    
    // Call contact button
    const callContactBtn = document.getElementById('call-contact-btn');
    if (callContactBtn) {
        callContactBtn.addEventListener('click', () => {
            const currentConversation = store.getState().currentConversation;
            
            if (!currentConversation) {
                alert('Selecione uma conversa primeiro.');
                return;
            }
            
            const leads = store.getState().leads;
            const lead = leads.find(l => l.id === currentConversation.lead_id);
            
            if (!lead || !lead.phone) {
                alert('Este contato não possui um número de telefone válido.');
                return;
            }
            
            // Populate the call modal with lead info
            document.getElementById('active-call-lead-name').textContent = lead.name;
            document.getElementById('active-call-lead-company').textContent = lead.company || 'Sem empresa';
            document.getElementById('active-call-lead-phone').textContent = lead.phone;
            
            // Show the call modal
            const callModal = new bootstrap.Modal(document.getElementById('active-call-modal'));
            callModal.show();
            
            // Start the call timer
            startCallTimer();
        });
    }
    
    // Conversation info button
    const conversationInfoBtn = document.getElementById('conversation-info-btn');
    if (conversationInfoBtn) {
        conversationInfoBtn.addEventListener('click', showConversationInfo);
    }
    
    // Send message button and input
    const sendMessageBtn = document.getElementById('send-message-btn');
    const messageInput = document.getElementById('message-input');
    
    if (sendMessageBtn && messageInput) {
        sendMessageBtn.addEventListener('click', () => {
            sendMessage();
        });
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Conversation search input
    const conversationSearch = document.getElementById('conversation-search');
    if (conversationSearch) {
        conversationSearch.addEventListener('input', debounce(() => {
            const searchTerm = conversationSearch.value.trim();
            
            // Update filters in store and reload conversations
            store.setFilters('conversations', { search: searchTerm });
            loadConversations();
        }, 500));
    }
}

/**
 * Populate the lead select dropdown
 */
function populateLeadSelect() {
    const leadSelect = document.getElementById('lead-select');
    
    // Get leads from store
    const leads = store.getState().leads;
    
    // Clear existing options except the first one
    while (leadSelect.options.length > 1) {
        leadSelect.remove(1);
    }
    
    // Add options for each lead
    leads.forEach(lead => {
        const option = document.createElement('option');
        option.value = lead.id;
        option.textContent = `${lead.name} ${lead.company ? `(${lead.company})` : ''}`;
        leadSelect.appendChild(option);
    });
}

/**
 * Start a new conversation
 */
function startNewConversation() {
    const contactType = document.querySelector('input[name="contact-type"]:checked').value;
    const channel = document.getElementById('channel-select').value;
    
    let leadId, leadData;
    
    if (contactType === 'existing') {
        leadId = document.getElementById('lead-select').value;
        
        if (!leadId) {
            alert('Selecione um lead.');
            return;
        }
        
        // Find the lead in the store
        const leads = store.getState().leads;
        leadData = leads.find(l => l.id == leadId);
        
    } else {
        // Get new lead data
        const name = document.getElementById('new-lead-name').value.trim();
        const company = document.getElementById('new-lead-company').value.trim();
        const phone = document.getElementById('new-lead-phone').value.trim();
        const email = document.getElementById('new-lead-email').value.trim();
        
        if (!name) {
            alert('O nome do lead é obrigatório.');
            return;
        }
        
        // For demonstration, create a new lead
        leadData = {
            id: Date.now(), // Temporary ID for mock data
            name,
            company,
            phone,
            email,
            status: 'new',
            score: Math.floor(Math.random() * 100),
            source: 'manual',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
        };
        
        // Add the new lead to the store
        const currentLeads = store.getState().leads;
        store.setLeads([leadData, ...currentLeads]);
        
        leadId = leadData.id;
    }
    
    // For demonstration, create a new conversation
    const newConversation = {
        id: Date.now(), // Temporary ID for mock data
        lead_id: leadId,
        channel,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        lead: leadData
    };
    
    // Add the new conversation to the store
    const currentConversations = store.getState().conversations;
    store.setConversations([newConversation, ...currentConversations]);
    
    // Set as current conversation
    store.setCurrentConversation(newConversation);
    
    // Close the modal
    const newConversationModal = bootstrap.Modal.getInstance(document.getElementById('new-conversation-modal'));
    newConversationModal.hide();
    
    // Update UI
    renderConversationsList();
    selectConversation(newConversation.id);
    
    // Focus on message input
    document.getElementById('message-input').focus();
}

/**
 * Load conversations from API
 */
function loadConversations() {
    // Show loading state
    document.getElementById('conversations-list').innerHTML = `
        <div class="text-center p-3">
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Carregando conversas...
        </div>
    `;
    
    // For demonstration, we're using mock data
    // In a real application, you would fetch this data from your API
    
    const mockLeads = [
        {
            id: 1,
            name: 'João Silva',
            company: 'Empresa XYZ',
            email: 'joao.silva@empresa.com',
            phone: '(11) 98765-4321',
            status: 'qualified',
            score: 85
        },
        {
            id: 2,
            name: 'Maria Oliveira',
            company: 'Empresa ABC',
            email: 'maria.oliveira@empresa.com',
            phone: '(11) 98765-1234',
            status: 'contacted',
            score: 72
        },
        {
            id: 3,
            name: 'Carlos Pereira',
            company: 'Empresa ABC',
            email: 'carlos.pereira@empresa.com',
            phone: '(11) 91234-5678',
            status: 'new',
            score: 68
        },
        {
            id: 4,
            name: 'Ana Santos',
            company: 'Empresa DEF',
            email: 'ana.santos@empresa.com',
            phone: '(11) 97654-3210',
            status: 'opportunity',
            score: 91
        }
    ];
    
    // Update the leads in the store (if not already loaded)
    if (store.getState().leads.length === 0) {
        store.setLeads(mockLeads);
    }
    
    const mockConversations = [
        {
            id: 1,
            lead_id: 1,
            channel: 'whatsapp',
            status: 'active',
            created_at: '2023-03-15T10:30:00Z',
            updated_at: '2023-03-17T14:45:00Z',
            last_activity_at: '2023-03-17T14:45:00Z',
            lead: mockLeads[0]
        },
        {
            id: 2,
            lead_id: 2,
            channel: 'sms',
            status: 'active',
            created_at: '2023-03-14T09:20:00Z',
            updated_at: '2023-03-16T11:30:00Z',
            last_activity_at: '2023-03-16T11:30:00Z',
            lead: mockLeads[1]
        },
        {
            id: 3,
            lead_id: 3,
            channel: 'voice',
            status: 'closed',
            created_at: '2023-03-13T16:45:00Z',
            updated_at: '2023-03-13T17:15:00Z',
            last_activity_at: '2023-03-13T17:15:00Z',
            lead: mockLeads[2]
        },
        {
            id: 4,
            lead_id: 4,
            channel: 'whatsapp',
            status: 'active',
            created_at: '2023-03-12T11:15:00Z',
            updated_at: '2023-03-15T10:20:00Z',
            last_activity_at: '2023-03-15T10:20:00Z',
            lead: mockLeads[3]
        }
    ];
    
    // Mock messages for each conversation
    mockConversations.forEach(conversation => {
        conversation.messages = generateMockMessages(conversation.id);
    });
    
    // Apply filters from store
    const filters = store.getState().filters.conversations;
    let filteredConversations = [...mockConversations];
    
    // Filter by status
    if (filters.status && filters.status !== 'all') {
        filteredConversations = filteredConversations.filter(conversation => conversation.status === filters.status);
    }
    
    // Filter by search term
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredConversations = filteredConversations.filter(conversation => 
            conversation.lead.name.toLowerCase().includes(searchTerm) ||
            conversation.lead.company.toLowerCase().includes(searchTerm) ||
            conversation.lead.email.toLowerCase().includes(searchTerm) ||
            conversation.lead.phone.includes(searchTerm)
        );
    }
    
    // Sort conversations
    filteredConversations.sort((a, b) => {
        const sortBy = filters.sortBy || 'last_activity_at';
        const sortOrder = filters.sortOrder || 'desc';
        
        if (a[sortBy] < b[sortBy]) {
            return sortOrder === 'asc' ? -1 : 1;
        }
        if (a[sortBy] > b[sortBy]) {
            return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
    });
    
    // Update the store
    store.setConversations(filteredConversations, {
        page: 1,
        totalPages: 1,
        totalItems: filteredConversations.length,
        itemsPerPage: 10
    });
    
    // Render the conversations list
    renderConversationsList();
}

/**
 * Generate mock messages for a conversation
 * @param {number} conversationId - Conversation ID
 * @returns {array} Array of message objects
 */
function generateMockMessages(conversationId) {
    const messages = [];
    
    // Common message patterns
    const systemMessages = [
        'Conversa iniciada via WhatsApp.',
        'Conversa iniciada via SMS.',
        'Chamada iniciada pelo agente.',
        'Lead adicionado ao sistema.',
    ];
    
    const agentMessages = [
        'Olá! Como posso ajudar você hoje?',
        'Gostaria de saber mais sobre nossos produtos?',
        'Podemos agendar uma demonstração para a próxima semana?',
        'Quais são suas principais necessidades em relação a esse tipo de solução?',
        'Estou disponível para esclarecer qualquer dúvida que você tenha.',
        'Já utilizou algum sistema semelhante anteriormente?',
        'Qual seria o melhor horário para uma ligação?',
        'Posso enviar mais informações por email?'
    ];
    
    const leadMessages = [
        'Olá, gostaria de saber mais sobre o produto.',
        'Quanto custa o plano básico?',
        'Vocês oferecem suporte 24/7?',
        'Podemos agendar uma demonstração?',
        'Já uso um sistema similar, mas estou procurando alternativas.',
        'Qual a diferença do seu produto para os concorrentes?',
        'Vocês têm algum case de sucesso no meu segmento?',
        'Prefiro que entre em contato por email.',
        'Pode me ligar na terça-feira pela manhã?'
    ];
    
    // Add system message
    messages.push({
        id: Date.now() - 100000,
        conversation_id: conversationId,
        sender_type: 'system',
        sender_id: null,
        content: systemMessages[Math.floor(Math.random() * systemMessages.length)],
        message_type: 'text',
        created_at: new Date(Date.now() - 90000).toISOString()
    });
    
    // Add agent message
    messages.push({
        id: Date.now() - 80000,
        conversation_id: conversationId,
        sender_type: 'agent',
        sender_id: 1,
        content: agentMessages[Math.floor(Math.random() * agentMessages.length)],
        message_type: 'text',
        created_at: new Date(Date.now() - 70000).toISOString()
    });
    
    // Add lead message
    messages.push({
        id: Date.now() - 60000,
        conversation_id: conversationId,
        sender_type: 'lead',
        sender_id: null,
        content: leadMessages[Math.floor(Math.random() * leadMessages.length)],
        message_type: 'text',
        created_at: new Date(Date.now() - 50000).toISOString()
    });
    
    // Add another agent message
    messages.push({
        id: Date.now() - 40000,
        conversation_id: conversationId,
        sender_type: 'agent',
        sender_id: 1,
        content: agentMessages[Math.floor(Math.random() * agentMessages.length)],
        message_type: 'text',
        created_at: new Date(Date.now() - 30000).toISOString()
    });
    
    return messages;
}

/**
 * Render the conversations list
 */
function renderConversationsList() {
    const conversations = store.getState().conversations;
    const conversationsList = document.getElementById('conversations-list');
    
    if (!conversations || conversations.length === 0) {
        conversationsList.innerHTML = `
            <div class="text-center p-3">
                <p class="text-muted">Nenhuma conversa encontrada.</p>
                <button class="btn btn-sm btn-outline-primary" id="empty-new-conversation-btn">
                    Iniciar Nova Conversa
                </button>
            </div>
        `;
        
        // Add event listener to the empty state button
        const emptyNewConversationBtn = document.getElementById('empty-new-conversation-btn');
        if (emptyNewConversationBtn) {
            emptyNewConversationBtn.addEventListener('click', () => {
                const newConversationModal = new bootstrap.Modal(document.getElementById('new-conversation-modal'));
                newConversationModal.show();
                
                // Populate lead select with available leads
                populateLeadSelect();
            });
        }
        
        return;
    }
    
    const items = conversations.map(conversation => {
        // Format the last activity date
        const lastActivity = new Date(conversation.last_activity_at);
        let timeDisplay;
        
        const now = new Date();
        const diffTime = Math.abs(now - lastActivity);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            // Today, show time
            timeDisplay = lastActivity.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            // Yesterday
            timeDisplay = 'Ontem';
        } else if (diffDays < 7) {
            // This week, show day name
            const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            timeDisplay = days[lastActivity.getDay()];
        } else {
            // Older, show date
            timeDisplay = lastActivity.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        }
        
        // Get channel icon
        let channelIcon;
        switch (conversation.channel) {
            case 'whatsapp':
                channelIcon = '<i class="fab fa-whatsapp text-success"></i>';
                break;
            case 'sms':
                channelIcon = '<i class="fas fa-sms text-primary"></i>';
                break;
            case 'voice':
                channelIcon = '<i class="fas fa-phone text-danger"></i>';
                break;
            default:
                channelIcon = '<i class="fas fa-comment text-secondary"></i>';
        }
        
        // Get preview text from last message
        let previewText = 'Iniciar conversa';
        if (conversation.messages && conversation.messages.length > 0) {
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            previewText = lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '');
        }
        
        return `
            <div class="conversation-item" data-conversation-id="${conversation.id}">
                <div class="conversation-header">
                    <div class="conversation-name">
                        ${channelIcon} ${conversation.lead.name}
                    </div>
                    <div class="conversation-time">${timeDisplay}</div>
                </div>
                <div class="conversation-preview">${previewText}</div>
            </div>
        `;
    }).join('');
    
    conversationsList.innerHTML = items;
    
    // Add event listeners to conversation items
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', () => {
            const conversationId = parseInt(item.getAttribute('data-conversation-id'));
            selectConversation(conversationId);
        });
    });
}

/**
 * Select a conversation
 * @param {number} conversationId - Conversation ID
 */
function selectConversation(conversationId) {
    const conversations = store.getState().conversations;
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (!conversation) {
        return;
    }
    
    // Update current conversation in store
    store.setCurrentConversation(conversation);
    
    // Update UI
    updateConversationUI(conversation);
    
    // Add active class to selected conversation item
    document.querySelectorAll('.conversation-item').forEach(item => {
        const itemId = parseInt(item.getAttribute('data-conversation-id'));
        
        if (itemId === conversationId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Update conversation UI with selected conversation
 * @param {object} conversation - Conversation object
 */
function updateConversationUI(conversation) {
    // Update header
    document.getElementById('current-conversation-name').textContent = conversation.lead.name;
    
    let statusText;
    switch (conversation.status) {
        case 'active':
            statusText = 'Ativo';
            break;
        case 'closed':
            statusText = 'Encerrado';
            break;
        default:
            statusText = conversation.status;
    }
    
    document.getElementById('current-conversation-status').textContent = `${conversation.lead.company || ''} · ${statusText}`;
    
    // Enable message input and button
    const messageInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    
    messageInput.disabled = false;
    messageInput.placeholder = 'Digite sua mensagem...';
    messageInput.focus();
    
    sendMessageBtn.disabled = false;
    
    // Render messages
    renderMessages(conversation);
}

/**
 * Render messages for the selected conversation
 * @param {object} conversation - Conversation object
 */
function renderMessages(conversation) {
    const messagesContainer = document.getElementById('messages-container');
    
    if (!conversation.messages || conversation.messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="text-center p-5">
                <p class="text-muted">Nenhuma mensagem nesta conversa.</p>
                <p class="text-muted small">Digite uma mensagem para iniciar a conversa.</p>
            </div>
        `;
        return;
    }
    
    // Group messages by date
    const messagesByDate = groupMessagesByDate(conversation.messages);
    
    let messagesHTML = '';
    
    // For each date group
    Object.keys(messagesByDate).forEach(date => {
        messagesHTML += `<div class="message-date-separator"><span>${date}</span></div>`;
        
        // For each message in the group
        messagesByDate[date].forEach(message => {
            let messageClass = '';
            let senderName = '';
            
            switch (message.sender_type) {
                case 'agent':
                    messageClass = 'outgoing';
                    senderName = 'Você';
                    break;
                case 'lead':
                    messageClass = 'incoming';
                    senderName = conversation.lead.name;
                    break;
                case 'system':
                    messageClass = 'system';
                    senderName = 'Sistema';
                    break;
                case 'ai':
                    messageClass = 'ai';
                    senderName = 'IA Assistente';
                    break;
                default:
                    messageClass = '';
                    senderName = message.sender_type;
            }
            
            const messageTime = new Date(message.created_at).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            messagesHTML += `
                <div class="message ${messageClass}">
                    <div class="message-content">
                        ${messageClass === 'system' ? `<strong>${senderName}:</strong> ` : ''}
                        ${message.content}
                    </div>
                    <div class="message-time">${messageTime}</div>
                </div>
            `;
        });
    });
    
    messagesContainer.innerHTML = messagesHTML;
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Group messages by date
 * @param {array} messages - Array of message objects
 * @returns {object} Object with dates as keys and arrays of messages as values
 */
function groupMessagesByDate(messages) {
    const groups = {};
    
    messages.forEach(message => {
        const date = new Date(message.created_at);
        const now = new Date();
        
        let dateString;
        
        if (
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        ) {
            dateString = 'Hoje';
        } else if (
            date.getDate() === now.getDate() - 1 &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        ) {
            dateString = 'Ontem';
        } else {
            dateString = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
        
        if (!groups[dateString]) {
            groups[dateString] = [];
        }
        
        groups[dateString].push(message);
    });
    
    return groups;
}

/**
 * Send a message
 */
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const content = messageInput.value.trim();
    
    if (!content) {
        return;
    }
    
    const conversation = store.getState().currentConversation;
    
    if (!conversation) {
        alert('Selecione uma conversa primeiro.');
        return;
    }
    
    // For demonstration, add a new message locally
    const newMessage = {
        id: Date.now(),
        conversation_id: conversation.id,
        sender_type: 'agent',
        sender_id: 1, // Current user ID
        content,
        message_type: 'text',
        created_at: new Date().toISOString()
    };
    
    // Add the message to the conversation
    if (!conversation.messages) {
        conversation.messages = [];
    }
    
    conversation.messages.push(newMessage);
    
    // Update the last activity time
    conversation.last_activity_at = new Date().toISOString();
    
    // Update the conversation in the store
    store.setCurrentConversation(conversation);
    
    // Update UI
    renderMessages(conversation);
    renderConversationsList();
    
    // Clear the input
    messageInput.value = '';
    messageInput.focus();
    
    // Simulate a response after a delay
    setTimeout(() => {
        simulateResponse(conversation);
    }, 2000);
}

/**
 * Simulate a response from the lead
 * @param {object} conversation - Conversation object
 */
function simulateResponse(conversation) {
    // For demonstration, simulate a response based on the channel
    let responseContent = '';
    
    switch (conversation.channel) {
        case 'whatsapp':
            responseContent = 'Obrigado pelo contato. Pode me enviar mais informações sobre os planos disponíveis?';
            break;
        case 'sms':
            responseContent = 'Recebi sua mensagem. Podemos falar em horário comercial?';
            break;
        case 'voice':
            responseContent = 'Entendi sua explicação. Vou avaliar a proposta e retorno em breve.';
            break;
        default:
            responseContent = 'Obrigado pelo contato. Vou analisar as informações.';
    }
    
    const responseMessage = {
        id: Date.now(),
        conversation_id: conversation.id,
        sender_type: 'lead',
        sender_id: null,
        content: responseContent,
        message_type: 'text',
        created_at: new Date().toISOString()
    };
    
    // Add the message to the conversation
    conversation.messages.push(responseMessage);
    
    // Update the last activity time
    conversation.last_activity_at = new Date().toISOString();
    
    // Update the conversation in the store
    store.setCurrentConversation(conversation);
    
    // Update UI
    renderMessages(conversation);
    renderConversationsList();
}

/**
 * Show conversation info
 */
function showConversationInfo() {
    const conversation = store.getState().currentConversation;
    
    if (!conversation) {
        alert('Selecione uma conversa primeiro.');
        return;
    }
    
    // Get channel text
    let channelText = '';
    switch (conversation.channel) {
        case 'whatsapp':
            channelText = 'WhatsApp';
            break;
        case 'sms':
            channelText = 'SMS';
            break;
        case 'voice':
            channelText = 'Voz';
            break;
        default:
            channelText = conversation.channel;
    }
    
    // Get status text
    let statusText = '';
    switch (conversation.status) {
        case 'active':
            statusText = 'Ativo';
            break;
        case 'closed':
            statusText = 'Encerrado';
            break;
        default:
            statusText = conversation.status;
    }
    
    // Format dates
    const createdAt = new Date(conversation.created_at);
    const formattedCreatedAt = `${createdAt.toLocaleDateString('pt-BR')} ${createdAt.toLocaleTimeString('pt-BR')}`;
    
    const lastActivity = new Date(conversation.last_activity_at);
    const formattedLastActivity = `${lastActivity.toLocaleDateString('pt-BR')} ${lastActivity.toLocaleTimeString('pt-BR')}`;
    
    // Populate the info modal
    const infoBody = document.getElementById('conversation-info-body');
    infoBody.innerHTML = `
        <h5>${conversation.lead.name}</h5>
        <p>${conversation.lead.company || 'Sem empresa'}</p>
        
        <div class="mt-3">
            <h6>Informações da Conversa</h6>
            <table class="table">
                <tr>
                    <th>Canal:</th>
                    <td>${channelText}</td>
                </tr>
                <tr>
                    <th>Status:</th>
                    <td>${statusText}</td>
                </tr>
                <tr>
                    <th>Iniciada em:</th>
                    <td>${formattedCreatedAt}</td>
                </tr>
                <tr>
                    <th>Última atividade:</th>
                    <td>${formattedLastActivity}</td>
                </tr>
            </table>
        </div>
        
        <div class="mt-3">
            <h6>Informações do Lead</h6>
            <table class="table">
                <tr>
                    <th>Email:</th>
                    <td>${conversation.lead.email || '-'}</td>
                </tr>
                <tr>
                    <th>Telefone:</th>
                    <td>${conversation.lead.phone || '-'}</td>
                </tr>
                <tr>
                    <th>Status:</th>
                    <td>${conversation.lead.status || '-'}</td>
                </tr>
                <tr>
                    <th>Pontuação:</th>
                    <td>${conversation.lead.score || '-'}/100</td>
                </tr>
            </table>
        </div>
    `;
    
    // Show the modal
    const infoModal = new bootstrap.Modal(document.getElementById('conversation-info-modal'));
    infoModal.show();
}

/**
 * Start the call timer
 */
function startCallTimer() {
    let seconds = 0;
    const timerElement = document.getElementById('call-timer');
    
    // Clear any existing timer
    if (window.callTimerInterval) {
        clearInterval(window.callTimerInterval);
    }
    
    // Start a new timer
    window.callTimerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }, 1000);
    
    // Set up end call button
    document.getElementById('end-call-btn').addEventListener('click', () => {
        clearInterval(window.callTimerInterval);
        
        const callModal = bootstrap.Modal.getInstance(document.getElementById('active-call-modal'));
        callModal.hide();
    });
}

/**
 * Debounce function for search input
 * @param {function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {function} Debounced function
 */
function debounce(func, delay) {
    let timeoutId;
    
    return function() {
        const context = this;
        const args = arguments;
        
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}
