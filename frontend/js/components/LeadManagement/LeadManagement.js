/**
 * Lead Management Component
 * This component renders the lead management page
 */

/**
 * Initialize the lead management page
 */
function initLeadManagement() {
    renderLeadManagement();
    setupLeadManagementEvents();
    loadLeads();
}

/**
 * Render the lead management HTML
 */
function renderLeadManagement() {
    const leadsPage = document.getElementById('leads-page');
    
    leadsPage.innerHTML = `
        <div class="leads-header">
            <h1 class="page-title">Gerenciamento de Leads</h1>
            <button class="btn btn-primary" id="new-lead-btn">
                <i class="fas fa-plus"></i> Novo Lead
            </button>
        </div>
        
        <div class="leads-filters">
            <div class="input-group">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input type="text" class="form-control" placeholder="Buscar leads..." id="leads-search">
            </div>
            
            <select class="form-select" id="lead-status-filter">
                <option value="all">Todos os Status</option>
                <option value="new">Novo</option>
                <option value="contacted">Em Contato</option>
                <option value="qualified">Qualificado</option>
                <option value="opportunity">Oportunidade</option>
                <option value="customer">Cliente</option>
                <option value="lost">Perdido</option>
            </select>
            
            <select class="form-select" id="lead-sort">
                <option value="created_at,desc">Mais Recentes</option>
                <option value="created_at,asc">Mais Antigos</option>
                <option value="name,asc">Nome (A-Z)</option>
                <option value="name,desc">Nome (Z-A)</option>
                <option value="score,desc">Maior Pontuação</option>
                <option value="score,asc">Menor Pontuação</option>
            </select>
        </div>
        
        <div class="table-responsive">
            <table class="table leads-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Empresa</th>
                        <th>Email</th>
                        <th>Telefone</th>
                        <th>Status</th>
                        <th>Pontuação</th>
                        <th>Origem</th>
                        <th>Última Atividade</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="leads-table-body">
                    <tr>
                        <td colspan="9" class="text-center">Carregando leads...</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <nav aria-label="Paginação de leads">
            <ul class="pagination justify-content-center" id="leads-pagination">
                <li class="page-item disabled">
                    <a class="page-link" href="#" tabindex="-1">Anterior</a>
                </li>
                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                <li class="page-item"><a class="page-link" href="#">2</a></li>
                <li class="page-item"><a class="page-link" href="#">3</a></li>
                <li class="page-item">
                    <a class="page-link" href="#">Próximo</a>
                </li>
            </ul>
        </nav>
        
        <!-- New Lead Modal -->
        <div class="modal fade" id="new-lead-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Novo Lead</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="new-lead-form">
                            <div class="mb-3">
                                <label for="lead-name" class="form-label">Nome</label>
                                <input type="text" class="form-control" id="lead-name" required>
                            </div>
                            <div class="mb-3">
                                <label for="lead-company" class="form-label">Empresa</label>
                                <input type="text" class="form-control" id="lead-company">
                            </div>
                            <div class="mb-3">
                                <label for="lead-email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="lead-email">
                            </div>
                            <div class="mb-3">
                                <label for="lead-phone" class="form-label">Telefone</label>
                                <input type="tel" class="form-control" id="lead-phone">
                            </div>
                            <div class="mb-3">
                                <label for="lead-source" class="form-label">Origem</label>
                                <select class="form-select" id="lead-source">
                                    <option value="">Selecionar...</option>
                                    <option value="website">Website</option>
                                    <option value="referral">Indicação</option>
                                    <option value="social">Redes Sociais</option>
                                    <option value="email">Email Marketing</option>
                                    <option value="event">Evento</option>
                                    <option value="other">Outro</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="lead-notes" class="form-label">Notas</label>
                                <textarea class="form-control" id="lead-notes" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="save-lead-btn">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Lead Details Modal -->
        <div class="modal fade" id="lead-details-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detalhes do Lead</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="lead-details-body">
                        <!-- Will be populated dynamically -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        <button type="button" class="btn btn-primary" id="edit-lead-btn">Editar</button>
                        <button type="button" class="btn btn-success" id="call-lead-btn">
                            <i class="fas fa-phone"></i> Ligar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Set up lead management event listeners
 */
function setupLeadManagementEvents() {
    // New lead button
    const newLeadBtn = document.getElementById('new-lead-btn');
    if (newLeadBtn) {
        newLeadBtn.addEventListener('click', () => {
            const newLeadModal = new bootstrap.Modal(document.getElementById('new-lead-modal'));
            newLeadModal.show();
        });
    }
    
    // Save lead button
    const saveLeadBtn = document.getElementById('save-lead-btn');
    if (saveLeadBtn) {
        saveLeadBtn.addEventListener('click', createNewLead);
    }
    
    // Lead search input
    const leadSearchInput = document.getElementById('leads-search');
    if (leadSearchInput) {
        leadSearchInput.addEventListener('input', debounce(() => {
            const searchTerm = leadSearchInput.value.trim();
            
            // Update filters in store and reload leads
            store.setFilters('leads', { search: searchTerm });
            loadLeads();
        }, 500));
    }
    
    // Lead status filter
    const statusFilter = document.getElementById('lead-status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            const status = statusFilter.value;
            
            // Update filters in store and reload leads
            store.setFilters('leads', { status });
            loadLeads();
        });
    }
    
    // Lead sort
    const leadSort = document.getElementById('lead-sort');
    if (leadSort) {
        leadSort.addEventListener('change', () => {
            const [sortBy, sortOrder] = leadSort.value.split(',');
            
            // Update filters in store and reload leads
            store.setFilters('leads', { sortBy, sortOrder });
            loadLeads();
        });
    }
}

/**
 * Create a new lead
 */
function createNewLead() {
    const name = document.getElementById('lead-name').value.trim();
    const company = document.getElementById('lead-company').value.trim();
    const email = document.getElementById('lead-email').value.trim();
    const phone = document.getElementById('lead-phone').value.trim();
    const source = document.getElementById('lead-source').value;
    const notes = document.getElementById('lead-notes').value.trim();
    
    if (!name) {
        alert('O nome do lead é obrigatório.');
        return;
    }
    
    // For demonstration, we're using mock data
    // In a real application, you would send this data to your API
    
    const newLead = {
        id: Date.now(), // Temporary ID for mock data
        name,
        company,
        email,
        phone,
        status: 'new',
        score: Math.floor(Math.random() * 100),
        source,
        agent_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
    };
    
    // Add the new lead to the store
    const currentLeads = store.getState().leads;
    store.setLeads([newLead, ...currentLeads]);
    
    // Update the UI
    renderLeadTable();
    
    // Close the modal
    const newLeadModal = bootstrap.Modal.getInstance(document.getElementById('new-lead-modal'));
    newLeadModal.hide();
    
    // Reset the form
    document.getElementById('new-lead-form').reset();
    
    // Show success notification
    alert('Lead criado com sucesso!');
}

/**
 * Load leads from API
 */
function loadLeads() {
    // Show loading state
    document.getElementById('leads-table-body').innerHTML = `
        <tr>
            <td colspan="9" class="text-center">Carregando leads...</td>
        </tr>
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
            score: 85,
            source: 'website',
            agent_id: 1,
            created_at: '2023-03-15T10:30:00Z',
            updated_at: '2023-03-17T14:45:00Z',
            last_activity: '2023-03-17T14:45:00Z'
        },
        {
            id: 2,
            name: 'Maria Oliveira',
            company: 'Empresa ABC',
            email: 'maria.oliveira@empresa.com',
            phone: '(11) 98765-1234',
            status: 'contacted',
            score: 72,
            source: 'email',
            agent_id: 1,
            created_at: '2023-03-14T09:20:00Z',
            updated_at: '2023-03-16T11:30:00Z',
            last_activity: '2023-03-16T11:30:00Z'
        },
        {
            id: 3,
            name: 'Carlos Pereira',
            company: 'Empresa ABC',
            email: 'carlos.pereira@empresa.com',
            phone: '(11) 91234-5678',
            status: 'new',
            score: 68,
            source: 'social',
            agent_id: null,
            created_at: '2023-03-13T16:45:00Z',
            updated_at: '2023-03-13T16:45:00Z',
            last_activity: '2023-03-13T16:45:00Z'
        },
        {
            id: 4,
            name: 'Ana Santos',
            company: 'Empresa DEF',
            email: 'ana.santos@empresa.com',
            phone: '(11) 97654-3210',
            status: 'opportunity',
            score: 91,
            source: 'referral',
            agent_id: 1,
            created_at: '2023-03-12T11:15:00Z',
            updated_at: '2023-03-15T10:20:00Z',
            last_activity: '2023-03-15T10:20:00Z'
        },
        {
            id: 5,
            name: 'Pedro Costa',
            company: 'Empresa GHI',
            email: 'pedro.costa@empresa.com',
            phone: '(11) 98888-7777',
            status: 'lost',
            score: 45,
            source: 'event',
            agent_id: 2,
            created_at: '2023-03-10T14:30:00Z',
            updated_at: '2023-03-14T09:15:00Z',
            last_activity: '2023-03-14T09:15:00Z'
        },
        {
            id: 6,
            name: 'Julia Almeida',
            company: 'Empresa JKL',
            email: 'julia.almeida@empresa.com',
            phone: '(11) 99999-8888',
            status: 'new',
            score: 62,
            source: 'website',
            agent_id: null,
            created_at: '2023-03-09T10:45:00Z',
            updated_at: '2023-03-09T10:45:00Z',
            last_activity: '2023-03-09T10:45:00Z'
        },
        {
            id: 7,
            name: 'Roberto Martins',
            company: 'Empresa MNO',
            email: 'roberto.martins@empresa.com',
            phone: '(11) 97777-6666',
            status: 'contacted',
            score: 78,
            source: 'referral',
            agent_id: 2,
            created_at: '2023-03-08T15:30:00Z',
            updated_at: '2023-03-13T11:20:00Z',
            last_activity: '2023-03-13T11:20:00Z'
        },
        {
            id: 8,
            name: 'Fernanda Lima',
            company: 'Empresa PQR',
            email: 'fernanda.lima@empresa.com',
            phone: '(11) 96666-5555',
            status: 'customer',
            score: 95,
            source: 'email',
            agent_id: 1,
            created_at: '2023-03-07T09:15:00Z',
            updated_at: '2023-03-12T14:30:00Z',
            last_activity: '2023-03-12T14:30:00Z'
        }
    ];
    
    // Apply filters from store
    const filters = store.getState().filters.leads;
    let filteredLeads = [...mockLeads];
    
    // Filter by status
    if (filters.status && filters.status !== 'all') {
        filteredLeads = filteredLeads.filter(lead => lead.status === filters.status);
    }
    
    // Filter by search term
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredLeads = filteredLeads.filter(lead => 
            lead.name.toLowerCase().includes(searchTerm) ||
            lead.company.toLowerCase().includes(searchTerm) ||
            lead.email.toLowerCase().includes(searchTerm) ||
            lead.phone.includes(searchTerm)
        );
    }
    
    // Sort leads
    filteredLeads.sort((a, b) => {
        const sortBy = filters.sortBy || 'created_at';
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
    store.setLeads(filteredLeads, {
        page: 1,
        totalPages: 1,
        totalItems: filteredLeads.length,
        itemsPerPage: 10
    });
    
    // Render the leads table
    renderLeadTable();
}

/**
 * Render the leads table
 */
function renderLeadTable() {
    const leads = store.getState().leads;
    const tableBody = document.getElementById('leads-table-body');
    
    if (!leads || leads.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">Nenhum lead encontrado.</td>
            </tr>
        `;
        return;
    }
    
    const rows = leads.map(lead => {
        // Format the last activity date
        const lastActivity = new Date(lead.last_activity);
        const formattedDate = lastActivity.toLocaleDateString('pt-BR');
        const formattedTime = lastActivity.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Get the status class
        let statusClass = '';
        let statusText = '';
        
        switch (lead.status) {
            case 'new':
                statusClass = 'new';
                statusText = 'Novo';
                break;
            case 'contacted':
                statusClass = 'contacted';
                statusText = 'Em Contato';
                break;
            case 'qualified':
                statusClass = 'qualified';
                statusText = 'Qualificado';
                break;
            case 'opportunity':
                statusClass = 'opportunity';
                statusText = 'Oportunidade';
                break;
            case 'customer':
                statusClass = 'customer';
                statusText = 'Cliente';
                break;
            case 'lost':
                statusClass = 'lost';
                statusText = 'Perdido';
                break;
            default:
                statusClass = '';
                statusText = lead.status;
        }
        
        return `
            <tr>
                <td>${lead.name}</td>
                <td>${lead.company || '-'}</td>
                <td>${lead.email || '-'}</td>
                <td>${lead.phone || '-'}</td>
                <td><span class="lead-status ${statusClass}">${statusText}</span></td>
                <td class="lead-score">${lead.score}</td>
                <td>${lead.source || '-'}</td>
                <td>${formattedDate} ${formattedTime}</td>
                <td class="lead-actions">
                    <button class="lead-details-btn" data-lead-id="${lead.id}" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="lead-edit-btn" data-lead-id="${lead.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="lead-call-btn" data-lead-id="${lead.id}" title="Ligar">
                        <i class="fas fa-phone"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = rows;
    
    // Add event listeners to the action buttons
    document.querySelectorAll('.lead-details-btn').forEach(button => {
        button.addEventListener('click', () => {
            const leadId = parseInt(button.getAttribute('data-lead-id'));
            showLeadDetails(leadId);
        });
    });
    
    document.querySelectorAll('.lead-edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            const leadId = parseInt(button.getAttribute('data-lead-id'));
            editLead(leadId);
        });
    });
    
    document.querySelectorAll('.lead-call-btn').forEach(button => {
        button.addEventListener('click', () => {
            const leadId = parseInt(button.getAttribute('data-lead-id'));
            callLead(leadId);
        });
    });
    
    // Update pagination
    updatePagination();
}

/**
 * Show lead details
 * @param {number} leadId - Lead ID
 */
function showLeadDetails(leadId) {
    const leads = store.getState().leads;
    const lead = leads.find(l => l.id === leadId);
    
    if (!lead) {
        alert('Lead não encontrado.');
        return;
    }
    
    // Update the current lead in the store
    store.setCurrentLead(lead);
    
    // Get status text
    let statusText = '';
    switch (lead.status) {
        case 'new': statusText = 'Novo'; break;
        case 'contacted': statusText = 'Em Contato'; break;
        case 'qualified': statusText = 'Qualificado'; break;
        case 'opportunity': statusText = 'Oportunidade'; break;
        case 'customer': statusText = 'Cliente'; break;
        case 'lost': statusText = 'Perdido'; break;
        default: statusText = lead.status;
    }
    
    // Get source text
    let sourceText = '';
    switch (lead.source) {
        case 'website': sourceText = 'Website'; break;
        case 'referral': sourceText = 'Indicação'; break;
        case 'social': sourceText = 'Redes Sociais'; break;
        case 'email': sourceText = 'Email Marketing'; break;
        case 'event': sourceText = 'Evento'; break;
        default: sourceText = lead.source || '-';
    }
    
    // Format dates
    const createdAt = new Date(lead.created_at);
    const formattedCreatedAt = `${createdAt.toLocaleDateString('pt-BR')} ${createdAt.toLocaleTimeString('pt-BR')}`;
    
    const lastActivity = new Date(lead.last_activity);
    const formattedLastActivity = `${lastActivity.toLocaleDateString('pt-BR')} ${lastActivity.toLocaleTimeString('pt-BR')}`;
    
    // Populate the details modal
    const detailsBody = document.getElementById('lead-details-body');
    detailsBody.innerHTML = `
        <div class="lead-details-header">
            <h3>${lead.name}</h3>
            <div class="lead-company">${lead.company || '-'}</div>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-6">
                <h5>Informações de Contato</h5>
                <table class="table">
                    <tr>
                        <th>Email:</th>
                        <td>${lead.email || '-'}</td>
                    </tr>
                    <tr>
                        <th>Telefone:</th>
                        <td>${lead.phone || '-'}</td>
                    </tr>
                </table>
            </div>
            <div class="col-md-6">
                <h5>Informações do Lead</h5>
                <table class="table">
                    <tr>
                        <th>Status:</th>
                        <td><span class="lead-status ${lead.status}">${statusText}</span></td>
                    </tr>
                    <tr>
                        <th>Pontuação:</th>
                        <td>${lead.score}/100</td>
                    </tr>
                    <tr>
                        <th>Origem:</th>
                        <td>${sourceText}</td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div class="row mt-3">
            <div class="col-12">
                <h5>Histórico</h5>
                <table class="table">
                    <tr>
                        <th>Criado em:</th>
                        <td>${formattedCreatedAt}</td>
                    </tr>
                    <tr>
                        <th>Última atividade:</th>
                        <td>${formattedLastActivity}</td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div class="row mt-3">
            <div class="col-12">
                <h5>Notas</h5>
                <p>Não há notas para este lead.</p>
            </div>
        </div>
    `;
    
    // Show the modal
    const detailsModal = new bootstrap.Modal(document.getElementById('lead-details-modal'));
    detailsModal.show();
    
    // Set up button events
    document.getElementById('edit-lead-btn').addEventListener('click', () => {
        detailsModal.hide();
        editLead(leadId);
    });
    
    document.getElementById('call-lead-btn').addEventListener('click', () => {
        detailsModal.hide();
        callLead(leadId);
    });
}

/**
 * Edit a lead
 * @param {number} leadId - Lead ID
 */
function editLead(leadId) {
    // In a real app, you would implement this functionality
    alert('Funcionalidade de edição de lead será implementada em breve.');
}

/**
 * Call a lead
 * @param {number} leadId - Lead ID
 */
function callLead(leadId) {
    const leads = store.getState().leads;
    const lead = leads.find(l => l.id === leadId);
    
    if (!lead) {
        alert('Lead não encontrado.');
        return;
    }
    
    if (!lead.phone) {
        alert('Este lead não possui um número de telefone.');
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
 * Update pagination
 */
function updatePagination() {
    // In a real app, you would implement proper pagination based on API data
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
