/**
 * CRM Component
 * CRM para gerenciamento de relacionamento com clientes
 */

// Variáveis globais do componente
let crmContainer;
let selectedContacts = new Set();
let bulkActionsManager = null;

/**
 * Initialize CRM component
 */
function initCRM() {
    // Criar container principal
    crmContainer = document.createElement('div');
    crmContainer.className = 'container-fluid';
    
    // Renderizar a estrutura básica do CRM
    renderCRMStructure();
    
    // Adicionar eventos
    setupCRMEvents();
    
    // Carregar dados iniciais
    loadContacts();
    loadRecentActivities();
    loadPendingTasks();
    
    // Inicializar gerenciador de ações em massa
    initBulkActionsManager();
    
    return crmContainer;
}

/**
 * Renderiza a estrutura básica do CRM
 */
function renderCRMStructure() {
    crmContainer.innerHTML = `
        <div class="d-sm-flex align-items-center justify-content-between mb-4">
            <h1 class="h3 mb-0 text-gray-800">CRM</h1>
            <div class="d-flex">
                <button class="btn btn-sm btn-primary shadow-sm me-2" id="new-contact-btn">
                    <i class="fas fa-plus fa-sm text-white-50 me-1"></i> Novo Contato
                </button>
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-primary dropdown-toggle" type="button" id="importExportDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-exchange-alt fa-sm me-1"></i> Importar/Exportar
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="importExportDropdown">
                        <li><a class="dropdown-item" href="#" id="export-contacts-btn">
                            <i class="fas fa-file-export fa-sm fa-fw me-2 text-gray-400"></i>
                            Exportar Contatos
                        </a></li>
                        <li><a class="dropdown-item" href="#" id="import-contacts-btn">
                            <i class="fas fa-file-import fa-sm fa-fw me-2 text-gray-400"></i>
                            Importar Contatos
                        </a></li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Container para ações em massa -->
        <div id="bulk-actions-container" class="mb-3"></div>

        <div class="row">
            <div class="col-xl-12 col-lg-12">
                <div class="card shadow mb-4">
                    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 class="m-0 font-weight-bold text-primary">Contatos</h6>
                        <div class="dropdown no-arrow">
                            <a class="dropdown-toggle" href="#" role="button" id="contactsDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="contactsDropdown">
                                <a class="dropdown-item" href="#" id="refresh-contacts-btn">
                                    <i class="fas fa-sync fa-sm fa-fw me-2 text-gray-400"></i>
                                    Atualizar Lista
                                </a>
                                <a class="dropdown-item" href="#" id="manage-tags-btn">
                                    <i class="fas fa-tags fa-sm fa-fw me-2 text-gray-400"></i>
                                    Gerenciar Tags
                                </a>
                                <a class="dropdown-item" href="#" id="manage-templates-btn">
                                    <i class="fas fa-file-alt fa-sm fa-fw me-2 text-gray-400"></i>
                                    Gerenciar Templates
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="contacts-filter mb-3">
                            <div class="row g-2">
                                <div class="col-md-3">
                                    <div class="input-group">
                                        <input type="text" class="form-control bg-light border-0 small" placeholder="Buscar contatos..." id="search-contacts">
                                        <button class="btn btn-primary" type="button" id="search-btn">
                                            <i class="fas fa-search fa-sm"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <select class="form-select" id="filter-status">
                                        <option value="">Todos os Status</option>
                                        <option value="novo">Novo</option>
                                        <option value="contato">Em Contato</option>
                                        <option value="qualificado">Qualificado</option>
                                        <option value="proposta">Proposta</option>
                                        <option value="ganho">Cliente</option>
                                        <option value="perdido">Perdido</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <select class="form-select" id="filter-tag">
                                        <option value="">Todas as Tags</option>
                                        <!-- Populado dinamicamente -->
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <select class="form-select" id="filter-temperature">
                                        <option value="">Temperatura</option>
                                        <option value="hot">Quente</option>
                                        <option value="warm">Morno</option>
                                        <option value="cold">Frio</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <select class="form-select" id="filter-follow-up">
                                        <option value="">Follow-up</option>
                                        <option value="today">Hoje</option>
                                        <option value="tomorrow">Amanhã</option>
                                        <option value="this_week">Esta Semana</option>
                                        <option value="overdue">Atrasado</option>
                                    </select>
                                </div>
                                <div class="col-md-1">
                                    <button class="btn btn-outline-secondary w-100" id="clear-filters-btn">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-bordered table-hover" id="contacts-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="select-all-contacts">
                                            </div>
                                        </th>
                                        <th>Nome</th>
                                        <th>Empresa</th>
                                        <th>Status</th>
                                        <th>Tags</th>
                                        <th>Temperatura</th>
                                        <th>Próx. Contato</th>
                                        <th>Telefone</th>
                                        <th>Email</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="contacts-tbody">
                                    <!-- Carregado via JavaScript -->
                                    <tr>
                                        <td colspan="10" class="text-center py-4">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Carregando...</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <div id="contacts-showing-info">
                                Carregando contatos...
                            </div>
                            <div>
                                <nav>
                                    <ul class="pagination" id="contacts-pagination">
                                        <!-- Paginação construída dinamicamente -->
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-xl-6 col-lg-6">
                <div class="card shadow mb-4">
                    <div class="card-header py-3">
                        <h6 class="m-0 font-weight-bold text-primary">Atividades Recentes</h6>
                    </div>
                    <div class="card-body">
                        <div class="activity-timeline" id="recent-activities">
                            <!-- Carregado via JavaScript -->
                            <div class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Carregando...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-6 col-lg-6">
                <div class="card shadow mb-4">
                    <div class="card-header py-3 d-flex justify-content-between align-items-center">
                        <h6 class="m-0 font-weight-bold text-primary">Próximos Contatos</h6>
                        <button class="btn btn-sm btn-outline-primary" id="add-task-btn">
                            <i class="fas fa-plus fa-sm"></i> Novo
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="tasks-container" id="pending-tasks">
                            <!-- Carregado via JavaScript -->
                            <div class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Carregando...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Adicionar CSS
    addCRMStyles();
}

/**
 * Adiciona estilos CSS necessários para o CRM
 */
function addCRMStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .contact-link {
            color: #4e73df;
            text-decoration: none;
            font-weight: 500;
        }
        
        .contact-link:hover {
            text-decoration: underline;
        }
        
        .activity-timeline {
            position: relative;
            padding-left: 30px;
        }
        
        .activity-timeline::before {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 14px;
            width: 2px;
            background-color: #e3e6f0;
        }
        
        .activity-item {
            position: relative;
            margin-bottom: 20px;
        }
        
        .activity-icon {
            position: absolute;
            left: -30px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
        }
        
        .activity-content {
            background-color: #f8f9fc;
            border-radius: 5px;
            padding: 10px 15px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .activity-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .activity-title {
            font-weight: 600;
        }
        
        .activity-time {
            font-size: 0.8rem;
            color: #858796;
        }
        
        .activity-description {
            font-size: 0.9rem;
        }
        
        .task-item {
            background-color: #f8f9fc;
            border-radius: 5px;
            padding: 10px 15px;
            margin-bottom: 10px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .task-meta {
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
            padding-left: 25px;
            font-size: 0.8rem;
            color: #858796;
        }
        
        .task-title {
            font-weight: 500;
        }
        
        .task-assignee {
            display: inline-block;
            margin-top: 5px;
        }
        
        .temperature-indicator {
            display: inline-flex;
            align-items: center;
            font-size: 0.85rem;
        }
        
        .temperature-indicator i {
            margin-right: 5px;
        }
        
        .contact-tag {
            display: inline-block;
            padding: 2px 8px;
            margin-right: 4px;
            margin-bottom: 4px;
            border-radius: 12px;
            font-size: 0.75rem;
            color: white;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Inicializa o gerenciador de ações em massa
 */
function initBulkActionsManager() {
    // Verificar se o componente já foi carregado
    if (typeof LeadBulkActions === 'undefined') {
        // Em produção, carregariamos dinamicamente o script
        console.error('LeadBulkActions não está disponível. Carregue o arquivo js/components/CRM/LeadBulkActions.js');
        return;
    }

    const container = document.getElementById('bulk-actions-container');
    if (!container) return;

    bulkActionsManager = new LeadBulkActions(container, {
        onSuccess: (message) => {
            showToast(message, 'success');
            loadContacts(); // Recarregar contatos após ação em massa
        },
        onError: (error) => {
            showToast(error, 'error');
        }
    });
}

/**
 * Configura eventos do CRM
 */
function setupCRMEvents() {
    // Evento de seleção de todos os contatos
    document.addEventListener('change', function(e) {
        if (e.target.id !== 'select-all-contacts') return;
        
        // Selecionar/deselecionar todos os checkboxes
        const checkboxes = document.querySelectorAll('#contacts-table tbody .form-check-input');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
            
            if (checkbox.value) {
                const contactId = parseInt(checkbox.value);
                if (e.target.checked) {
                    selectedContacts.add(contactId);
                } else {
                    selectedContacts.delete(contactId);
                }
            }
        });
        
        // Atualizar o gerenciador de ações em massa
        updateBulkActionSelection();
    });
    
    // Evento de seleção individual de contatos
    document.addEventListener('change', function(e) {
        if (!e.target.classList.contains('contact-checkbox')) return;
        
        const contactId = parseInt(e.target.value);
        if (e.target.checked) {
            selectedContacts.add(contactId);
        } else {
            selectedContacts.delete(contactId);
            // Desmarcar "selecionar todos" se algum for desmarcado
            document.getElementById('select-all-contacts').checked = false;
        }
        
        // Atualizar o gerenciador de ações em massa
        updateBulkActionSelection();
    });
    
    // Evento para novo contato
    document.addEventListener('click', function(e) {
        if (e.target.id === 'new-contact-btn' || e.target.closest('#new-contact-btn')) {
            e.preventDefault();
            showNewContactModal();
        }
    });
    
    // Evento para exportar contatos
    document.addEventListener('click', function(e) {
        if (e.target.id === 'export-contacts-btn' || e.target.closest('#export-contacts-btn')) {
            e.preventDefault();
            exportContacts();
        }
    });
    
    // Evento para importar contatos
    document.addEventListener('click', function(e) {
        if (e.target.id === 'import-contacts-btn' || e.target.closest('#import-contacts-btn')) {
            e.preventDefault();
            // Navegar para página de upload
            const fileUploadNavItem = document.querySelector('.sidebar-nav-item[data-page="file-upload"]');
            if (fileUploadNavItem) {
                fileUploadNavItem.click();
            }
        }
    });
    
    // Evento para atualizar lista de contatos
    document.addEventListener('click', function(e) {
        if (e.target.id === 'refresh-contacts-btn' || e.target.closest('#refresh-contacts-btn')) {
            e.preventDefault();
            loadContacts();
        }
    });
    
    // Evento para gerenciar tags
    document.addEventListener('click', function(e) {
        if (e.target.id === 'manage-tags-btn' || e.target.closest('#manage-tags-btn')) {
            e.preventDefault();
            showTagsModal();
        }
    });
    
    // Evento para gerenciar templates
    document.addEventListener('click', function(e) {
        if (e.target.id === 'manage-templates-btn' || e.target.closest('#manage-templates-btn')) {
            e.preventDefault();
            showTemplatesModal();
        }
    });
    
    // Evento de busca
    document.addEventListener('click', function(e) {
        if (e.target.id === 'search-btn' || e.target.closest('#search-btn')) {
            e.preventDefault();
            filterContacts();
        }
    });
    
    // Evento de tecla Enter na busca
    document.addEventListener('keypress', function(e) {
        if (e.target.id === 'search-contacts' && e.key === 'Enter') {
            filterContacts();
        }
    });
    
    // Evento para limpar filtros
    document.addEventListener('click', function(e) {
        if (e.target.id === 'clear-filters-btn' || e.target.closest('#clear-filters-btn')) {
            e.preventDefault();
            clearFilters();
        }
    });
    
    // Eventos para filtros de select
    ['filter-status', 'filter-tag', 'filter-temperature', 'filter-follow-up'].forEach(filterId => {
        document.addEventListener('change', function(e) {
            if (e.target.id === filterId) {
                filterContacts();
            }
        });
    });
    
    // Eventos de ações nos contatos (ver, ligar, enviar email, etc)
    setupContactActionEvents();
    
    // Evento para adicionar tarefa
    document.addEventListener('click', function(e) {
        if (e.target.id === 'add-task-btn' || e.target.closest('#add-task-btn')) {
            e.preventDefault();
            showAddTaskModal();
        }
    });
}

/**
 * Configura eventos para ações de contato
 */
function setupContactActionEvents() {
    // Evento de visualização de contato
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('contact-link') || e.target.closest('.contact-link')) {
            e.preventDefault();
            const link = e.target.classList.contains('contact-link') ? e.target : e.target.closest('.contact-link');
            const contactId = link.getAttribute('data-contact-id');
            showContactDetails(contactId);
        }
    });
    
    // Evento de ligação
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('contact-call-btn') || e.target.closest('.contact-call-btn')) {
            e.preventDefault();
            const btn = e.target.classList.contains('contact-call-btn') ? e.target : e.target.closest('.contact-call-btn');
            const contactId = btn.getAttribute('data-contact-id');
            initiateCall(contactId);
        }
    });
    
    // Evento de envio de email
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('contact-email-btn') || e.target.closest('.contact-email-btn')) {
            e.preventDefault();
            const btn = e.target.classList.contains('contact-email-btn') ? e.target : e.target.closest('.contact-email-btn');
            const contactId = btn.getAttribute('data-contact-id');
            showEmailModal(contactId);
        }
    });
    
    // Evento de envio de SMS
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('contact-sms-btn') || e.target.closest('.contact-sms-btn')) {
            e.preventDefault();
            const btn = e.target.classList.contains('contact-sms-btn') ? e.target : e.target.closest('.contact-sms-btn');
            const contactId = btn.getAttribute('data-contact-id');
            showSMSModal(contactId);
        }
    });
    
    // Evento de envio de WhatsApp
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('contact-whatsapp-btn') || e.target.closest('.contact-whatsapp-btn')) {
            e.preventDefault();
            const btn = e.target.classList.contains('contact-whatsapp-btn') ? e.target : e.target.closest('.contact-whatsapp-btn');
            const contactId = btn.getAttribute('data-contact-id');
            showWhatsAppModal(contactId);
        }
    });
    
    // Evento de adição de nota
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('contact-note-btn') || e.target.closest('.contact-note-btn')) {
            e.preventDefault();
            const btn = e.target.classList.contains('contact-note-btn') ? e.target : e.target.closest('.contact-note-btn');
            const contactId = btn.getAttribute('data-contact-id');
            showAddNoteModal(contactId);
        }
    });
    
    // Evento de edição de contato
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('contact-edit-btn') || e.target.closest('.contact-edit-btn')) {
            e.preventDefault();
            const btn = e.target.classList.contains('contact-edit-btn') ? e.target : e.target.closest('.contact-edit-btn');
            const contactId = btn.getAttribute('data-contact-id');
            showEditContactModal(contactId);
        }
    });
}

/**
 * Atualiza a seleção no gerenciador de ações em massa
 */
function updateBulkActionSelection() {
    if (bulkActionsManager) {
        bulkActionsManager.setSelectedLeads(Array.from(selectedContacts));
    }
}

/**
 * Carrega a lista de contatos
 */
function loadContacts() {
    const contactsBody = document.getElementById('contacts-tbody');
    if (!contactsBody) return;
    
    // Mostrar carregamento
    contactsBody.innerHTML = `
        <tr>
            <td colspan="10" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
            </td>
        </tr>
    `;
    
    // Obter filtros ativos
    const filters = {
        search: document.getElementById('search-contacts').value,
        status: document.getElementById('filter-status').value,
        tag: document.getElementById('filter-tag').value,
        temperature: document.getElementById('filter-temperature').value,
        follow_up: document.getElementById('filter-follow-up').value,
        page: 1, // Adicionar paginação depois
    };
    
    // Em produção, chamaríamos a API para obter contatos
    // Por enquanto, usar dados de exemplo
    setTimeout(() => {
        renderContacts(getSampleContacts());
    }, 500);
}

/**
 * Renderiza a lista de contatos na tabela
 * @param {Array} contacts - Lista de contatos
 */
function renderContacts(contacts) {
    const contactsBody = document.getElementById('contacts-tbody');
    if (!contactsBody) return;
    
    if (!contacts || contacts.length === 0) {
        contactsBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center py-4">
                    <div class="alert alert-info mb-0">
                        Nenhum contato encontrado. <a href="#" id="new-contact-btn" class="alert-link">Adicionar contato</a>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Limpar seleção atual
    selectedContacts.clear();
    
    // Criar linhas da tabela
    const rows = contacts.map(contact => {
        // Formatar próximo contato
        const nextContact = contact.next_follow_up ? formatDateRelative(contact.next_follow_up) : '-';
        
        // Renderizar tags
        const tagsHtml = contact.tags && contact.tags.length > 0 
            ? contact.tags.map(tag => 
                `<span class="contact-tag" style="background-color: ${tag.color}">${tag.name}</span>`
              ).join('')
            : '-';
        
        // Renderizar temperatura
        const tempHtml = getTemperatureHtml(contact.temperature);
        
        return `
            <tr>
                <td>
                    <div class="form-check">
                        <input class="form-check-input contact-checkbox" type="checkbox" value="${contact.id}">
                    </div>
                </td>
                <td><a href="#" class="contact-link" data-contact-id="${contact.id}">${contact.name}</a></td>
                <td>${contact.company || '-'}</td>
                <td><span class="badge ${getStatusBadgeClass(contact.status)}">${getStatusLabel(contact.status)}</span></td>
                <td>${tagsHtml}</td>
                <td>${tempHtml}</td>
                <td>${nextContact}</td>
                <td>${contact.phone || '-'}</td>
                <td>${contact.email || '-'}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary contact-call-btn" data-contact-id="${contact.id}" title="Ligar">
                            <i class="fas fa-phone"></i>
                        </button>
                        <button class="btn btn-outline-success contact-whatsapp-btn" data-contact-id="${contact.id}" title="WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                        <button class="btn btn-outline-info contact-email-btn" data-contact-id="${contact.id}" title="Email">
                            <i class="fas fa-envelope"></i>
                        </button>
                        <button class="btn btn-outline-secondary contact-note-btn" data-contact-id="${contact.id}" title="Adicionar Nota">
                            <i class="fas fa-sticky-note"></i>
                        </button>
                        <button class="btn btn-outline-dark contact-edit-btn" data-contact-id="${contact.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    contactsBody.innerHTML = rows;
    
    // Atualizar contador
    document.getElementById('contacts-showing-info').textContent = `Mostrando ${contacts.length} contatos`;
    
    // Atualizar paginação
    updatePagination(contacts.length, 42, 1); // Total fictício de 42 contatos
}

/**
 * Atualiza a paginação
 * @param {number} showing - Número de contatos exibidos
 * @param {number} total - Total de contatos
 * @param {number} page - Página atual
 */
function updatePagination(showing, total, page) {
    const pagination = document.getElementById('contacts-pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(total / 20); // 20 por página
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Botão Anterior
    html += `
        <li class="page-item ${page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${page-1}">&laquo; Anterior</a>
        </li>
    `;
    
    // Páginas
    for (let i = 1; i <= totalPages; i++) {
        if (i === page) {
            html += `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>`;
        } else {
            html += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }
    }
    
    // Botão Próximo
    html += `
        <li class="page-item ${page === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${page+1}">Próximo &raquo;</a>
        </li>
    `;
    
    pagination.innerHTML = html;
    
    // Adicionar eventos de clique
    pagination.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (this.parentElement.classList.contains('disabled')) return;
            
            const pageNum = parseInt(this.getAttribute('data-page'));
            if (!isNaN(pageNum)) {
                // Em produção, carregaria a página específica
                console.log(`Navegando para página ${pageNum}`);
            }
        });
    });
}

/**
 * Carrega atividades recentes
 */
function loadRecentActivities() {
    const container = document.getElementById('recent-activities');
    if (!container) return;
    
    // Em produção, chamaríamos a API para obter atividades
    // Por enquanto, usar dados de exemplo
    setTimeout(() => {
        const activities = [
            {
                type: 'call',
                title: 'Ligação com João Silva',
                time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
                description: 'Conversa sobre proposta comercial. Interessado em avançar para próxima etapa.'
            },
            {
                type: 'note',
                title: 'Nota adicionada em Maria Oliveira',
                time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
                description: 'Cliente solicitou demonstração do produto para equipe de TI.'
            },
            {
                type: 'new_contact',
                title: 'Novo contato criado',
                time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
                description: 'Carlos Santos da Global Corp adicionado como novo contato.'
            },
            {
                type: 'proposal',
                title: 'Proposta enviada',
                time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
                description: 'Proposta comercial enviada para Maria Oliveira da Tech Solutions.'
            }
        ];
        
        renderActivities(activities);
    }, 700);
}

/**
 * Renderiza atividades recentes
 * @param {Array} activities - Lista de atividades
 */
function renderActivities(activities) {
    const container = document.getElementById('recent-activities');
    if (!container) return;
    
    if (!activities || activities.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <div class="alert alert-info mb-0">
                    Nenhuma atividade recente encontrada.
                </div>
            </div>
        `;
        return;
    }
    
    const html = activities.map(activity => {
        // Definir ícone e cor com base no tipo
        let iconClass = 'fas fa-comment';
        let bgColor = 'bg-info';
        
        switch (activity.type) {
            case 'call':
                iconClass = 'fas fa-phone';
                bgColor = 'bg-primary';
                break;
            case 'note':
                iconClass = 'fas fa-sticky-note';
                bgColor = 'bg-info';
                break;
            case 'new_contact':
                iconClass = 'fas fa-user-plus';
                bgColor = 'bg-success';
                break;
            case 'proposal':
                iconClass = 'fas fa-file-contract';
                bgColor = 'bg-warning';
                break;
            case 'email':
                iconClass = 'fas fa-envelope';
                bgColor = 'bg-info';
                break;
            case 'sms':
                iconClass = 'fas fa-sms';
                bgColor = 'bg-secondary';
                break;
            case 'whatsapp':
                iconClass = 'fab fa-whatsapp';
                bgColor = 'bg-success';
                break;
        }
        
        return `
            <div class="activity-item">
                <div class="activity-icon ${bgColor}">
                    <i class="${iconClass} text-white"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-header">
                        <span class="activity-title">${activity.title}</span>
                        <span class="activity-time">${formatDateRelative(activity.time)}</span>
                    </div>
                    <div class="activity-description">
                        ${activity.description}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

/**
 * Carrega tarefas pendentes
 */
function loadPendingTasks() {
    const container = document.getElementById('pending-tasks');
    if (!container) return;
    
    // Em produção, chamaríamos a API para obter tarefas
    // Por enquanto, usar dados de exemplo
    setTimeout(() => {
        const tasks = [
            {
                id: 1,
                title: 'Ligar para João Silva',
                due: new Date(),
                assignee: 'Ana Silva',
                contact_id: 1
            },
            {
                id: 2,
                title: 'Enviar material adicional para Maria Oliveira',
                due: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
                assignee: 'Carlos Santos',
                contact_id: 2
            },
            {
                id: 3,
                title: 'Preparar proposta para Global Corp',
                due: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 dias
                assignee: 'Mariana Oliveira',
                contact_id: 3
            },
            {
                id: 4,
                title: 'Agendar reunião de acompanhamento com leads qualificados',
                due: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 dias
                assignee: 'Ana Silva',
                contact_id: null
            }
        ];
        
        renderTasks(tasks);
    }, 800);
}

/**
 * Renderiza tarefas pendentes
 * @param {Array} tasks - Lista de tarefas
 */
function renderTasks(tasks) {
    const container = document.getElementById('pending-tasks');
    if (!container) return;
    
    if (!tasks || tasks.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <div class="alert alert-info mb-0">
                    Nenhuma tarefa pendente.
                </div>
            </div>
        `;
        return;
    }
    
    const html = tasks.map(task => {
        // Formatação da data
        const dueDate = formatDateRelative(task.due);
        
        // Classe para data (vermelho se for hoje)
        const dueDateClass = isToday(task.due) ? 'bg-danger' : 
                             isTomorrow(task.due) ? 'bg-warning' : 'bg-info';
        
        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="form-check">
                    <input class="form-check-input task-checkbox" type="checkbox" id="task-${task.id}" data-task-id="${task.id}">
                    <label class="form-check-label" for="task-${task.id}">
                        <span class="task-title">${task.title}</span>
                        <span class="task-due badge ${dueDateClass} ms-2">${dueDate}</span>
                    </label>
                </div>
                <div class="task-meta">
                    <span class="task-assignee">${task.assignee}</span>
                    <div class="task-actions">
                        ${task.contact_id ? `
                            <button class="btn btn-sm btn-link task-call-btn" data-contact-id="${task.contact_id}">
                                <i class="fas fa-phone"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-link task-edit-btn" data-task-id="${task.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-link text-danger task-delete-btn" data-task-id="${task.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
    
    // Adicionar evento para completar tarefa
    container.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                const taskId = this.getAttribute('data-task-id');
                completeTask(taskId);
            }
        });
    });
    
    // Adicionar evento para ligar para contato da tarefa
    container.querySelectorAll('.task-call-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const contactId = this.getAttribute('data-contact-id');
            initiateCall(contactId);
        });
    });
    
    // Adicionar evento para editar tarefa
    container.querySelectorAll('.task-edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');
            showEditTaskModal(taskId);
        });
    });
    
    // Adicionar evento para excluir tarefa
    container.querySelectorAll('.task-delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');
            if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                deleteTask(taskId);
            }
        });
    });
}

/**
 * Filtra contatos com base nos critérios de filtro
 */
function filterContacts() {
    // Obter valores dos filtros
    const filters = {
        search: document.getElementById('search-contacts').value,
        status: document.getElementById('filter-status').value,
        tag: document.getElementById('filter-tag').value,
        temperature: document.getElementById('filter-temperature').value,
        follow_up: document.getElementById('filter-follow-up').value
    };
    
    console.log('Filtros aplicados:', filters);
    
    // Em produção, enviaríamos esses filtros para a API
    // Por enquanto, apenas recarregar os dados de exemplo
    loadContacts();
}

/**
 * Limpa todos os filtros
 */
function clearFilters() {
    // Resetar campos de filtro
    document.getElementById('search-contacts').value = '';
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-tag').value = '';
    document.getElementById('filter-temperature').value = '';
    document.getElementById('filter-follow-up').value = '';
    
    // Recarregar contatos
    loadContacts();
}

/**
 * Exibe modal para gerenciar tags
 */
function showTagsModal() {
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'tags-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'tags-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="tags-modal-label">
                        <i class="fas fa-tags me-2"></i> Gerenciar Tags
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-3">
                        <div class="col-md-8">
                            <input type="text" class="form-control" id="new-tag-name" placeholder="Nome da nova tag">
                        </div>
                        <div class="col-md-2">
                            <input type="color" class="form-control form-control-color" id="new-tag-color" value="#4e73df">
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-primary w-100" id="add-tag-btn">Adicionar</button>
                        </div>
                    </div>
                    
                    <hr>
                    
                    <div class="table-responsive">
                        <table class="table table-hover" id="tags-table">
                            <thead>
                                <tr>
                                    <th>Tag</th>
                                    <th>Cor</th>
                                    <th>Contatos</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Exemplo -->
                                <tr>
                                    <td>Cliente VIP</td>
                                    <td><span class="badge" style="background-color: #4e73df">Cliente VIP</span></td>
                                    <td>12</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-secondary edit-tag-btn" data-tag-id="1">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger delete-tag-btn" data-tag-id="1">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Novo Lead</td>
                                    <td><span class="badge" style="background-color: #1cc88a">Novo Lead</span></td>
                                    <td>23</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-secondary edit-tag-btn" data-tag-id="2">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger delete-tag-btn" data-tag-id="2">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Follow-up Pendente</td>
                                    <td><span class="badge" style="background-color: #f6c23e">Follow-up Pendente</span></td>
                                    <td>8</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-secondary edit-tag-btn" data-tag-id="3">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger delete-tag-btn" data-tag-id="3">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Oportunidade</td>
                                    <td><span class="badge" style="background-color: #e74a3b">Oportunidade</span></td>
                                    <td>5</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-secondary edit-tag-btn" data-tag-id="4">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger delete-tag-btn" data-tag-id="4">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar evento para adicionar tag
    document.getElementById('add-tag-btn').addEventListener('click', function() {
        const tagName = document.getElementById('new-tag-name').value.trim();
        const tagColor = document.getElementById('new-tag-color').value;
        
        if (!tagName) {
            showToast('Nome da tag é obrigatório', 'error');
            return;
        }
        
        // Em produção, enviaríamos para a API
        console.log('Adicionando tag:', { name: tagName, color: tagColor });
        showToast(`Tag "${tagName}" adicionada`, 'success');
        
        // Limpar campo
        document.getElementById('new-tag-name').value = '';
    });
    
    // Adicionar eventos para editar e excluir tags
    document.querySelectorAll('.edit-tag-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tagId = this.getAttribute('data-tag-id');
            // Em produção, abriria modal de edição
            showToast(`Editando tag ID ${tagId}`, 'info');
        });
    });
    
    document.querySelectorAll('.delete-tag-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tagId = this.getAttribute('data-tag-id');
            if (confirm('Tem certeza que deseja excluir esta tag?')) {
                // Em produção, enviaríamos para a API
                showToast(`Tag excluída`, 'success');
            }
        });
    });
    
    // Mostrar o modal
    const modalInstance = new bootstrap.Modal(document.getElementById('tags-modal'));
    modalInstance.show();
    
    // Remover do DOM quando fechado
    document.getElementById('tags-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Exibe modal para gerenciar templates
 */
function showTemplatesModal() {
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'templates-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'templates-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="templates-modal-label">
                        <i class="fas fa-file-alt me-2"></i> Gerenciar Templates
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ul class="nav nav-tabs" id="templatesTab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="call-tab" data-bs-toggle="tab" data-bs-target="#call-templates" type="button" role="tab" aria-controls="call-templates" aria-selected="true">Chamadas</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="email-tab" data-bs-toggle="tab" data-bs-target="#email-templates" type="button" role="tab" aria-controls="email-templates" aria-selected="false">Emails</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="sms-tab" data-bs-toggle="tab" data-bs-target="#sms-templates" type="button" role="tab" aria-controls="sms-templates" aria-selected="false">SMS</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="whatsapp-tab" data-bs-toggle="tab" data-bs-target="#whatsapp-templates" type="button" role="tab" aria-controls="whatsapp-templates" aria-selected="false">WhatsApp</button>
                        </li>
                    </ul>
                    <div class="tab-content p-3" id="templatesTabContent">
                        <div class="tab-pane fade show active" id="call-templates" role="tabpanel" aria-labelledby="call-tab">
                            <div class="d-flex justify-content-end mb-3">
                                <button class="btn btn-primary" id="new-call-template-btn">
                                    <i class="fas fa-plus me-1"></i> Novo Script
                                </button>
                            </div>
                            <div class="list-group">
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">Apresentação Inicial</h6>
                                        <p class="mb-1 text-muted small">Olá {{name}}, como vai? Sou da empresa ABC e gostaria de apresentar...</p>
                                    </div>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-secondary" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" title="Excluir">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">Follow-up de Proposta</h6>
                                        <p class="mb-1 text-muted small">Olá {{name}}, estou ligando para verificar se recebeu nossa proposta...</p>
                                    </div>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-secondary" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" title="Excluir">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="email-templates" role="tabpanel" aria-labelledby="email-tab">
                            <div class="d-flex justify-content-end mb-3">
                                <button class="btn btn-primary" id="new-email-template-btn">
                                    <i class="fas fa-plus me-1"></i> Novo Email
                                </button>
                            </div>
                            <div class="list-group">
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">Boas-vindas</h6>
                                        <small class="text-muted">Assunto: Bem-vindo à nossa comunidade, {{name}}!</small>
                                        <p class="mb-1 text-muted small">Olá {{name}}, seja bem-vindo! Estamos muito felizes em ter você...</p>
                                    </div>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-secondary" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" title="Excluir">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">Envio de Proposta</h6>
                                        <small class="text-muted">Assunto: Proposta Comercial - {{company}}</small>
                                        <p class="mb-1 text-muted small">Prezado(a) {{name}}, Conforme combinado, envio anexo a proposta comercial...</p>
                                    </div>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-secondary" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" title="Excluir">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="sms-templates" role="tabpanel" aria-labelledby="sms-tab">
                            <div class="d-flex justify-content-end mb-3">
                                <button class="btn btn-primary" id="new-sms-template-btn">
                                    <i class="fas fa-plus me-1"></i> Novo SMS
                                </button>
                            </div>
                            <div class="list-group">
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">Confirmação de Agendamento</h6>
                                        <p class="mb-1 text-muted small">Olá {{name}}, confirmamos seu agendamento para {{date}} às {{time}}. Atenciosamente, Empresa ABC.</p>
                                    </div>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-secondary" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" title="Excluir">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">Lembrete de Pagamento</h6>
                                        <p class="mb-1 text-muted small">Olá {{name}}, lembramos que sua fatura vence em {{days}} dias. Acesse: link.com.br/pagamento</p>
                                    </div>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-secondary" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" title="Excluir">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="whatsapp-templates" role="tabpanel" aria-labelledby="whatsapp-tab">
                            <div class="d-flex justify-content-end mb-3">
                                <button class="btn btn-primary" id="new-whatsapp-template-btn">
                                    <i class="fas fa-plus me-1"></i> Novo Template
                                </button>
                            </div>
                            <div class="list-group">
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">Boas-vindas WhatsApp</h6>
                                        <p class="mb-1 text-muted small">Olá {{name}}! 👋 Bem-vindo ao nosso WhatsApp. Como podemos ajudar hoje?</p>
                                    </div>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-secondary" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" title="Excluir">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">Follow-up de Cotação</h6>
                                        <p class="mb-1 text-muted small">Olá {{name}}! Enviamos a cotação por email. Podemos conversar sobre ela? Estou à disposição.</p>
                                    </div>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-secondary" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" title="Excluir">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-3 p-3 border-top">
                        <h6>Variáveis Disponíveis</h6>
                        <div class="row">
                            <div class="col-md-4">
                                <ul class="list-unstyled">
                                    <li><code>{{name}}</code> - Nome do contato</li>
                                    <li><code>{{first_name}}</code> - Primeiro nome</li>
                                    <li><code>{{last_name}}</code> - Sobrenome</li>
                                </ul>
                            </div>
                            <div class="col-md-4">
                                <ul class="list-unstyled">
                                    <li><code>{{email}}</code> - Email</li>
                                    <li><code>{{phone}}</code> - Telefone</li>
                                    <li><code>{{company}}</code> - Empresa</li>
                                </ul>
                            </div>
                            <div class="col-md-4">
                                <ul class="list-unstyled">
                                    <li><code>{{date}}</code> - Data atual</li>
                                    <li><code>{{time}}</code> - Hora atual</li>
                                    <li><code>{{agent}}</code> - Nome do agente</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar eventos para criar novos templates
    document.getElementById('new-call-template-btn').addEventListener('click', function() {
        showNewTemplateModal('call');
    });
    
    document.getElementById('new-email-template-btn').addEventListener('click', function() {
        showNewTemplateModal('email');
    });
    
    document.getElementById('new-sms-template-btn').addEventListener('click', function() {
        showNewTemplateModal('sms');
    });
    
    document.getElementById('new-whatsapp-template-btn').addEventListener('click', function() {
        showNewTemplateModal('whatsapp');
    });
    
    // Mostrar o modal
    const modalInstance = new bootstrap.Modal(document.getElementById('templates-modal'));
    modalInstance.show();
    
    // Remover do DOM quando fechado
    document.getElementById('templates-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Exibe modal para criar novo template
 * @param {string} type - Tipo de template (call, email, sms, whatsapp)
 */
function showNewTemplateModal(type) {
    let title, fields;
    
    // Configurar título e campos com base no tipo
    switch (type) {
        case 'call':
            title = 'Novo Script de Chamada';
            fields = `
                <div class="mb-3">
                    <label for="template-name" class="form-label">Nome do Script</label>
                    <input type="text" class="form-control" id="template-name" required>
                </div>
                <div class="mb-3">
                    <label for="template-voice" class="form-label">Voz (para IA)</label>
                    <select class="form-select" id="template-voice">
                        <option value="">Selecione uma voz</option>
                        <option value="pt-BR-Standard-A">Português BR - Feminina A</option>
                        <option value="pt-BR-Standard-B">Português BR - Masculina B</option>
                        <option value="pt-BR-Wavenet-A">Português BR - Feminina Wavenet</option>
                        <option value="pt-BR-Wavenet-B">Português BR - Masculina Wavenet</option>
                    </select>
                    <div class="form-text">Selecione uma voz para chamadas automatizadas com IA</div>
                </div>
                <div class="mb-3">
                    <label for="template-content" class="form-label">Script</label>
                    <textarea class="form-control" id="template-content" rows="10" required></textarea>
                    <div class="form-text">Use as variáveis disponíveis para personalizar: {{name}}, {{company}}, etc.</div>
                </div>
            `;
            break;
        case 'email':
            title = 'Novo Template de Email';
            fields = `
                <div class="mb-3">
                    <label for="template-name" class="form-label">Nome do Template</label>
                    <input type="text" class="form-control" id="template-name" required>
                </div>
                <div class="mb-3">
                    <label for="template-subject" class="form-label">Assunto</label>
                    <input type="text" class="form-control" id="template-subject" required>
                </div>
                <div class="mb-3">
                    <label for="template-content" class="form-label">Conteúdo</label>
                    <textarea class="form-control" id="template-content" rows="10" required></textarea>
                    <div class="form-text">Use HTML para formatação e as variáveis disponíveis: {{name}}, {{company}}, etc.</div>
                </div>
            `;
            break;
        case 'sms':
            title = 'Novo Template de SMS';
            fields = `
                <div class="mb-3">
                    <label for="template-name" class="form-label">Nome do Template</label>
                    <input type="text" class="form-control" id="template-name" required>
                </div>
                <div class="mb-3">
                    <label for="template-content" class="form-label">Conteúdo</label>
                    <textarea class="form-control" id="template-content" rows="5" maxlength="160" required></textarea>
                    <div class="form-text">
                        <span id="sms-char-count">0</span>/160 caracteres. 
                        Use as variáveis disponíveis: {{name}}, {{company}}, etc.
                    </div>
                </div>
            `;
            break;
        case 'whatsapp':
            title = 'Novo Template de WhatsApp';
            fields = `
                <div class="mb-3">
                    <label for="template-name" class="form-label">Nome do Template</label>
                    <input type="text" class="form-control" id="template-name" required>
                </div>
                <div class="mb-3">
                    <label for="template-content" class="form-label">Conteúdo</label>
                    <textarea class="form-control" id="template-content" rows="7" required></textarea>
                    <div class="form-text">
                        Use emojis e as variáveis disponíveis: {{name}}, {{company}}, etc.
                    </div>
                </div>
                <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="include-media">
                    <label class="form-check-label" for="include-media">Incluir Mídia</label>
                </div>
                <div class="mb-3 d-none" id="media-options">
                    <label for="media-type" class="form-label">Tipo de Mídia</label>
                    <select class="form-select" id="media-type">
                        <option value="image">Imagem</option>
                        <option value="document">Documento</option>
                        <option value="video">Vídeo</option>
                    </select>
                </div>
            `;
            break;
        default:
            title = 'Novo Template';
            fields = `
                <div class="mb-3">
                    <label for="template-name" class="form-label">Nome do Template</label>
                    <input type="text" class="form-control" id="template-name" required>
                </div>
                <div class="mb-3">
                    <label for="template-content" class="form-label">Conteúdo</label>
                    <textarea class="form-control" id="template-content" rows="5" required></textarea>
                </div>
            `;
    }
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'new-template-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'new-template-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="new-template-modal-label">
                        <i class="fas fa-file-alt me-2"></i> ${title}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="new-template-form">
                        <input type="hidden" id="template-type" value="${type}">
                        ${fields}
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="save-template-btn">Salvar Template</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Configurar contagem de caracteres para SMS
    if (type === 'sms') {
        const contentTextarea = document.getElementById('template-content');
        const charCount = document.getElementById('sms-char-count');
        
        contentTextarea.addEventListener('input', function() {
            charCount.textContent = this.value.length;
            if (this.value.length > 160) {
                charCount.classList.add('text-danger');
            } else {
                charCount.classList.remove('text-danger');
            }
        });
    }
    
    // Configurar opções de mídia para WhatsApp
    if (type === 'whatsapp') {
        const includeMediaCheckbox = document.getElementById('include-media');
        const mediaOptions = document.getElementById('media-options');
        
        includeMediaCheckbox.addEventListener('change', function() {
            if (this.checked) {
                mediaOptions.classList.remove('d-none');
            } else {
                mediaOptions.classList.add('d-none');
            }
        });
    }
    
    // Adicionar evento para salvar template
    document.getElementById('save-template-btn').addEventListener('click', function() {
        // Validar campos obrigatórios
        const name = document.getElementById('template-name').value;
        const content = document.getElementById('template-content').value;
        
        if (!name || !content) {
            showToast('Preencha todos os campos obrigatórios', 'error');
            return;
        }
        
        // Coletar dados do formulário
        const templateData = {
            type: type,
            name: name,
            content: content
        };
        
        // Adicionar campos específicos por tipo
        if (type === 'call') {
            templateData.voice = document.getElementById('template-voice').value;
        } else if (type === 'email') {
            templateData.subject = document.getElementById('template-subject').value;
            if (!templateData.subject) {
                showToast('Preencha o assunto do email', 'error');
                return;
            }
        } else if (type === 'whatsapp' && document.getElementById('include-media').checked) {
            templateData.media_type = document.getElementById('media-type').value;
        }
        
        // Em produção, enviaríamos para a API
        console.log('Salvando template:', templateData);
        showToast(`Template "${name}" criado com sucesso`, 'success');
        
        // Fechar modal
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('new-template-modal'));
        modalInstance.hide();
    });
    
    // Mostrar o modal
    const newTemplateModal = new bootstrap.Modal(document.getElementById('new-template-modal'));
    newTemplateModal.show();
    
    // Remover do DOM quando fechado
    document.getElementById('new-template-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Inicia uma chamada para um contato
 * @param {string} contactId - ID do contato
 */
function initiateCall(contactId) {
    // Em produção, isso integra com o serviço VoIP
    
    // Obter dados do contato
    const contact = getSampleContacts().find(c => c.id === parseInt(contactId));
    if (!contact) {
        showToast('Contato não encontrado', 'error');
        return;
    }
    
    // Verificar se o contato tem telefone
    if (!contact.phone) {
        showToast('Este contato não possui telefone cadastrado', 'error');
        return;
    }
    
    // Criar modal para confirmar chamada
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'call-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'call-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="call-modal-label">
                        <i class="fas fa-phone-alt me-2"></i> Ligar para ${contact.name}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-4">
                        <div class="d-flex align-items-center mb-3">
                            <div class="avatar-circle me-3 bg-primary text-white">
                                ${contact.name.substring(0, 1)}
                            </div>
                            <div>
                                <h5 class="mb-0">${contact.name}</h5>
                                <div>${contact.phone}</div>
                                ${contact.company ? `<div class="text-muted small">${contact.company}</div>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="call-type" class="form-label">Tipo de Chamada</label>
                        <select class="form-select" id="call-type">
                            <option value="manual">Manual (você fala)</option>
                            <option value="ai">IA (usar script automatizado)</option>
                        </select>
                    </div>
                    
                    <div id="ai-call-options" class="d-none">
                        <div class="mb-3">
                            <label for="call-script" class="form-label">Script</label>
                            <select class="form-select" id="call-script">
                                <option value="">Selecione um script</option>
                                <option value="1">Apresentação Inicial</option>
                                <option value="2">Follow-up de Proposta</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="ambient-sound" class="form-label">Som Ambiente</label>
                            <select class="form-select" id="ambient-sound">
                                <option value="">Sem som ambiente</option>
                                <option value="call_center_busy">Call Center Ocupado</option>
                                <option value="office_talk">Conversas de Escritório</option>
                                <option value="keyboard_typing">Digitação de Teclado</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="record-call" checked>
                            <label class="form-check-label" for="record-call">
                                Gravar chamada
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="detect-voicemail" checked>
                        <label class="form-check-label" for="detect-voicemail">
                            Detectar caixa postal
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="start-call-btn">Iniciar Chamada</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar evento para trocar tipo de chamada
    document.getElementById('call-type').addEventListener('change', function() {
        const aiOptions = document.getElementById('ai-call-options');
        if (this.value === 'ai') {
            aiOptions.classList.remove('d-none');
        } else {
            aiOptions.classList.add('d-none');
        }
    });
    
    // Evento para iniciar chamada
    document.getElementById('start-call-btn').addEventListener('click', function() {
        const callType = document.getElementById('call-type').value;
        const recordCall = document.getElementById('record-call').checked;
        const detectVoicemail = document.getElementById('detect-voicemail').checked;
        
        // Opções específicas para chamada com IA
        let script = null;
        let ambientSound = null;
        
        if (callType === 'ai') {
            script = document.getElementById('call-script').value;
            ambientSound = document.getElementById('ambient-sound').value;
            
            if (!script) {
                showToast('Selecione um script para chamada com IA', 'error');
                return;
            }
        }
        
        // Fechar modal
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('call-modal'));
        modalInstance.hide();
        
        // Em produção, isso iniciaria a chamada real
        showToast(`Iniciando chamada para ${contact.name}...`, 'info');
        
        // Redirecionar para a interface de chamada
        setTimeout(() => {
            // Montar parâmetros da URL
            const params = new URLSearchParams();
            params.append('contact_id', contactId);
            params.append('type', callType);
            
            if (recordCall) params.append('record', 'true');
            if (detectVoicemail) params.append('detect_voicemail', 'true');
            if (script) params.append('script_id', script);
            if (ambientSound) params.append('ambient', ambientSound);
            
            // Redirecionar
            window.location.href = `/voz/?${params.toString()}`;
        }, 1000);
    });
    
    // Mostrar o modal
    const callModal = new bootstrap.Modal(document.getElementById('call-modal'));
    callModal.show();
    
    // Remover do DOM quando fechado
    document.getElementById('call-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
    
    // Adicionar estilos necessários para o avatar
    const style = document.createElement('style');
    style.textContent = `
        .avatar-circle {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Exibe modal para envio de email
 * @param {string} contactId - ID do contato
 */
function showEmailModal(contactId) {
    // Obter dados do contato
    const contact = getSampleContacts().find(c => c.id === parseInt(contactId));
    if (!contact) {
        showToast('Contato não encontrado', 'error');
        return;
    }
    
    // Verificar se o contato tem email
    if (!contact.email) {
        showToast('Este contato não possui email cadastrado', 'error');
        return;
    }
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'email-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'email-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="email-modal-label">
                        <i class="fas fa-envelope me-2"></i> Enviar Email
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="email-template" class="form-label">Template</label>
                        <select class="form-select" id="email-template">
                            <option value="">Selecione um template</option>
                            <option value="1">Boas-vindas</option>
                            <option value="2">Envio de Proposta</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label for="email-to" class="form-label">Para</label>
                        <input type="email" class="form-control" id="email-to" value="${contact.email}" readonly>
                    </div>
                    
                    <div class="mb-3">
                        <label for="email-subject" class="form-label">Assunto</label>
                        <input type="text" class="form-control" id="email-subject" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="email-content" class="form-label">Conteúdo</label>
                        <textarea class="form-control" id="email-content" rows="10" required></textarea>
                    </div>
                    
                    <div class="mb-3">
                        <label for="email-attachment" class="form-label">Anexo</label>
                        <input type="file" class="form-control" id="email-attachment">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="send-email-btn">Enviar Email</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar evento para trocar template
    document.getElementById('email-template').addEventListener('change', function() {
        const subject = document.getElementById('email-subject');
        const content = document.getElementById('email-content');
        
        if (this.value === '1') {
            // Template de boas-vindas
            subject.value = `Bem-vindo à nossa comunidade, ${contact.name}!`;
            content.value = `Olá ${contact.name},\n\nSeja bem-vindo! Estamos muito felizes em ter você conosco.\n\nAtenciosamente,\nEquipe ABC`;
        } else if (this.value === '2') {
            // Template de proposta
            subject.value = `Proposta Comercial - ${contact.company || 'Sua Empresa'}`;
            content.value = `Prezado(a) ${contact.name},\n\nConforme combinado, envio anexo a proposta comercial para sua avaliação.\n\nFico à disposição para esclarecimentos.\n\nAtenciosamente,\nEquipe ABC`;
        } else if (this.value === 'custom') {
            // Template personalizado
            subject.value = '';
            content.value = '';
        }
    });
    
    // Evento para enviar email
    document.getElementById('send-email-btn').addEventListener('click', function() {
        const subject = document.getElementById('email-subject').value;
        const content = document.getElementById('email-content').value;
        
        if (!subject || !content) {
            showToast('Preencha todos os campos obrigatórios', 'error');
            return;
        }
        
        // Em produção, isso enviaria o email
        showToast(`Email enviado com sucesso para ${contact.name}`, 'success');
        
        // Fechar modal
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('email-modal'));
        modalInstance.hide();
    });
    
    // Mostrar o modal
    const emailModal = new bootstrap.Modal(document.getElementById('email-modal'));
    emailModal.show();
    
    // Remover do DOM quando fechado
    document.getElementById('email-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Exibe modal para envio de SMS
 * @param {string} contactId - ID do contato
 */
function showSMSModal(contactId) {
    // Obter dados do contato
    const contact = getSampleContacts().find(c => c.id === parseInt(contactId));
    if (!contact) {
        showToast('Contato não encontrado', 'error');
        return;
    }
    
    // Verificar se o contato tem telefone
    if (!contact.phone) {
        showToast('Este contato não possui telefone cadastrado', 'error');
        return;
    }
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'sms-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'sms-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="sms-modal-label">
                        <i class="fas fa-sms me-2"></i> Enviar SMS
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="sms-template" class="form-label">Template</label>
                        <select class="form-select" id="sms-template">
                            <option value="">Selecione um template</option>
                            <option value="1">Confirmação de Agendamento</option>
                            <option value="2">Lembrete de Pagamento</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label for="sms-to" class="form-label">Para</label>
                        <input type="tel" class="form-control" id="sms-to" value="${contact.phone}" readonly>
                    </div>
                    
                    <div class="mb-3">
                        <label for="sms-content" class="form-label">Mensagem</label>
                        <textarea class="form-control" id="sms-content" rows="5" maxlength="160" required></textarea>
                        <div class="form-text">
                            <span id="sms-char-count">0</span>/160 caracteres
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="send-sms-btn">Enviar SMS</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Configurar contagem de caracteres
    const contentTextarea = document.getElementById('sms-content');
    const charCount = document.getElementById('sms-char-count');
    
    contentTextarea.addEventListener('input', function() {
        charCount.textContent = this.value.length;
        if (this.value.length > 160) {
            charCount.classList.add('text-danger');
        } else {
            charCount.classList.remove('text-danger');
        }
    });
    
    // Adicionar evento para trocar template
    document.getElementById('sms-template').addEventListener('change', function() {
        const content = document.getElementById('sms-content');
        
        if (this.value === '1') {
            // Template de confirmação de agendamento
            content.value = `Olá ${contact.name}, confirmamos seu agendamento para amanhã às 14:30. Atenciosamente, Empresa ABC.`;
        } else if (this.value === '2') {
            // Template de lembrete de pagamento
            content.value = `Olá ${contact.name}, lembramos que sua fatura vence em 5 dias. Acesse: link.com.br/pagamento`;
        } else if (this.value === 'custom') {
            // Template personalizado
            content.value = '';
        }
        
        // Atualizar contagem de caracteres
        charCount.textContent = content.value.length;
    });
    
    // Evento para enviar SMS
    document.getElementById('send-sms-btn').addEventListener('click', function() {
        const content = document.getElementById('sms-content').value;
        
        if (!content) {
            showToast('Preencha a mensagem', 'error');
            return;
        }
        
        if (content.length > 160) {
            showToast('A mensagem excede o limite de 160 caracteres', 'error');
            return;
        }
        
        // Em produção, isso enviaria o SMS
        showToast(`SMS enviado com sucesso para ${contact.name}`, 'success');
        
        // Fechar modal
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('sms-modal'));
        modalInstance.hide();
    });
    
    // Mostrar o modal
    const smsModal = new bootstrap.Modal(document.getElementById('sms-modal'));
    smsModal.show();
    
    // Remover do DOM quando fechado
    document.getElementById('sms-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Exibe modal para envio de WhatsApp
 * @param {string} contactId - ID do contato
 */
function showWhatsAppModal(contactId) {
    // Obter dados do contato
    const contact = getSampleContacts().find(c => c.id === parseInt(contactId));
    if (!contact) {
        showToast('Contato não encontrado', 'error');
        return;
    }
    
    // Verificar se o contato tem telefone
    if (!contact.phone) {
        showToast('Este contato não possui telefone cadastrado', 'error');
        return;
    }
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'whatsapp-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'whatsapp-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="whatsapp-modal-label">
                        <i class="fab fa-whatsapp me-2"></i> Enviar WhatsApp
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ul class="nav nav-tabs mb-3" id="whatsappTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="direct-tab" data-bs-toggle="tab" data-bs-target="#direct-tab-pane" type="button" role="tab" aria-controls="direct-tab-pane" aria-selected="true">Direto</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="api-tab" data-bs-toggle="tab" data-bs-target="#api-tab-pane" type="button" role="tab" aria-controls="api-tab-pane" aria-selected="false">API Oficial</button>
                        </li>
                    </ul>
                    
                    <div class="tab-content" id="whatsappTabContent">
                        <div class="tab-pane fade show active" id="direct-tab-pane" role="tabpanel" aria-labelledby="direct-tab" tabindex="0">
                            <div class="mb-3">
                                <label for="whatsapp-template" class="form-label">Template</label>
                                <select class="form-select" id="whatsapp-template">
                                    <option value="">Selecione um template</option>
                                    <option value="1">Boas-vindas WhatsApp</option>
                                    <option value="2">Follow-up de Cotação</option>
                                    <option value="custom">Personalizado</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label for="whatsapp-to" class="form-label">Para</label>
                                <input type="tel" class="form-control" id="whatsapp-to" value="${contact.phone}" readonly>
                            </div>
                            
                            <div class="mb-3">
                                <label for="whatsapp-content" class="form-label">Mensagem</label>
                                <textarea class="form-control" id="whatsapp-content" rows="5" required></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="whatsapp-media">
                                    <label class="form-check-label" for="whatsapp-media">
                                        Incluir mídia
                                    </label>
                                </div>
                            </div>
                            
                            <div id="whatsapp-media-options" class="mb-3 d-none">
                                <label for="whatsapp-media-type" class="form-label">Tipo de mídia</label>
                                <select class="form-select mb-2" id="whatsapp-media-type">
                                    <option value="image">Imagem</option>
                                    <option value="document">Documento</option>
                                </select>
                                <input type="file" class="form-control" id="whatsapp-media-file">
                            </div>
                        </div>
                        
                        <div class="tab-pane fade" id="api-tab-pane" role="tabpanel" aria-labelledby="api-tab" tabindex="0">
                            <div class="mb-3">
                                <label for="whatsapp-account" class="form-label">Conta WhatsApp Business</label>
                                <select class="form-select" id="whatsapp-account">
                                    <option value="1">Conta Principal (Vendas)</option>
                                    <option value="2">Conta Secundária (Suporte)</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label for="whatsapp-api-template" class="form-label">Template Aprovado</label>
                                <select class="form-select" id="whatsapp-api-template">
                                    <option value="">Selecione um template</option>
                                    <option value="welcome_message">Boas-vindas</option>
                                    <option value="order_confirmation">Confirmação de Pedido</option>
                                    <option value="appointment_reminder">Lembrete de Agendamento</option>
                                </select>
                                <div class="form-text">Apenas templates aprovados pela Meta podem ser usados via API oficial</div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="whatsapp-api-to" class="form-label">Para</label>
                                <input type="tel" class="form-control" id="whatsapp-api-to" value="${contact.phone}" readonly>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Parâmetros</label>
                                <div id="whatsapp-api-params">
                                    <div class="input-group mb-2">
                                        <span class="input-group-text">Parâmetro 1</span>
                                        <input type="text" class="form-control" placeholder="Valor" value="${contact.name}">
                                    </div>
                                    <div class="input-group mb-2">
                                        <span class="input-group-text">Parâmetro 2</span>
                                        <input type="text" class="form-control" placeholder="Valor">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-success" id="send-whatsapp-btn">Enviar WhatsApp</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar evento para trocar template (tab direto)
    document.getElementById('whatsapp-template').addEventListener('change', function() {
        const content = document.getElementById('whatsapp-content');
        
        if (this.value === '1') {
            // Template de boas-vindas
            content.value = `Olá ${contact.name}! 👋 Bem-vindo ao nosso WhatsApp. Como podemos ajudar hoje?`;
        } else if (this.value === '2') {
            // Template de follow-up
            content.value = `Olá ${contact.name}! Enviamos a cotação por email. Podemos conversar sobre ela? Estou à disposição.`;
        } else if (this.value === 'custom') {
            // Template personalizado
            content.value = '';
        }
    });
    
    // Adicionar evento para mostrar/ocultar opções de mídia
    document.getElementById('whatsapp-media').addEventListener('change', function() {
        const mediaOptions = document.getElementById('whatsapp-media-options');
        if (this.checked) {
            mediaOptions.classList.remove('d-none');
        } else {
            mediaOptions.classList.add('d-none');
        }
    });
    
    // Adicionar evento para trocar template da API
    document.getElementById('whatsapp-api-template').addEventListener('change', function() {
        const paramsContainer = document.getElementById('whatsapp-api-params');
        
        // Em um caso real, você obteria os parâmetros do template selecionado da API
        if (this.value === 'welcome_message') {
            paramsContainer.innerHTML = `
                <div class="input-group mb-2">
                    <span class="input-group-text">Nome</span>
                    <input type="text" class="form-control" value="${contact.name}">
                </div>
            `;
        } else if (this.value === 'order_confirmation') {
            paramsContainer.innerHTML = `
                <div class="input-group mb-2">
                    <span class="input-group-text">Nome</span>
                    <input type="text" class="form-control" value="${contact.name}">
                </div>
                <div class="input-group mb-2">
                    <span class="input-group-text">Número do Pedido</span>
                    <input type="text" class="form-control" value="ORD-12345">
                </div>
                <div class="input-group mb-2">
                    <span class="input-group-text">Valor</span>
                    <input type="text" class="form-control" value="R$ 150,00">
                </div>
            `;
        } else if (this.value === 'appointment_reminder') {
            paramsContainer.innerHTML = `
                <div class="input-group mb-2">
                    <span class="input-group-text">Nome</span>
                    <input type="text" class="form-control" value="${contact.name}">
                </div>
                <div class="input-group mb-2">
                    <span class="input-group-text">Data</span>
                    <input type="text" class="form-control" value="10/04/2025">
                </div>
                <div class="input-group mb-2">
                    <span class="input-group-text">Hora</span>
                    <input type="text" class="form-control" value="14:30">
                </div>
            `;
        } else {
            paramsContainer.innerHTML = '';
        }
    });
    
    // Evento para enviar WhatsApp
    document.getElementById('send-whatsapp-btn').addEventListener('click', function() {
        const activeTab = document.querySelector('.tab-pane.active');
        const isDirectTab = activeTab.id === 'direct-tab-pane';
        
        if (isDirectTab) {
            const content = document.getElementById('whatsapp-content').value;
            if (!content) {
                showToast('Preencha a mensagem', 'error');
                return;
            }
            
            // Verificar se tem mídia
            const hasMídia = document.getElementById('whatsapp-media').checked;
            if (hasMídia) {
                const mediaFile = document.getElementById('whatsapp-media-file').files[0];
                if (!mediaFile) {
                    showToast('Selecione um arquivo para a mídia', 'error');
                    return;
                }
            }
            
            // Em produção, isso enviaria a mensagem direta
            showToast(`WhatsApp enviado com sucesso para ${contact.name}`, 'success');
        } else {
            // Tab da API oficial
            const template = document.getElementById('whatsapp-api-template').value;
            if (!template) {
                showToast('Selecione um template', 'error');
                return;
            }
            
            // Em produção, isso enviaria via API oficial
            showToast(`WhatsApp enviado via API para ${contact.name}`, 'success');
        }
        
        // Fechar modal
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('whatsapp-modal'));
        modalInstance.hide();
    });
    
    // Mostrar o modal
    const whatsappModal = new bootstrap.Modal(document.getElementById('whatsapp-modal'));
    whatsappModal.show();
    
    // Remover do DOM quando fechado
    document.getElementById('whatsapp-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Formata data relativa (hoje, ontem, etc)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada
 */
function formatDateRelative(date) {
    if (!date) return '-';
    
    // Converter para objeto Date se for string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Data atual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Ontem
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Amanhã
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Data do parâmetro sem horas
    const dateOnly = new Date(dateObj);
    dateOnly.setHours(0, 0, 0, 0);
    
    // Formatação da hora
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    // Comparar datas
    if (dateOnly.getTime() === today.getTime()) {
        return `Hoje, ${timeStr}`;
    } else if (dateOnly.getTime() === yesterday.getTime()) {
        return `Ontem, ${timeStr}`;
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
        return `Amanhã, ${timeStr}`;
    } else {
        // Formatação completa
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        
        return `${day}/${month}/${year}, ${timeStr}`;
    }
}

/**
 * Verifica se uma data é hoje
 * @param {Date|string} date - Data a verificar
 * @returns {boolean} Se é hoje
 */
function isToday(date) {
    if (!date) return false;
    
    // Converter para objeto Date se for string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Data atual
    const today = new Date();
    
    // Comparar ano, mês e dia
    return dateObj.getDate() === today.getDate() &&
           dateObj.getMonth() === today.getMonth() &&
           dateObj.getFullYear() === today.getFullYear();
}

/**
 * Verifica se uma data é amanhã
 * @param {Date|string} date - Data a verificar
 * @returns {boolean} Se é amanhã
 */
function isTomorrow(date) {
    if (!date) return false;
    
    // Converter para objeto Date se for string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Data de amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Comparar ano, mês e dia
    return dateObj.getDate() === tomorrow.getDate() &&
           dateObj.getMonth() === tomorrow.getMonth() &&
           dateObj.getFullYear() === tomorrow.getFullYear();
}

/**
 * Retorna a classe de badge para um status
 * @param {string} status - Status do contato
 * @returns {string} Classe CSS
 */
function getStatusBadgeClass(status) {
    switch (status) {
        case 'novo': return 'bg-info';
        case 'contato': return 'bg-primary';
        case 'qualificado': return 'bg-success';
        case 'proposta': return 'bg-warning';
        case 'ganho': return 'bg-success';
        case 'perdido': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

/**
 * Retorna o rótulo para um status
 * @param {string} status - Status do contato
 * @returns {string} Rótulo
 */
function getStatusLabel(status) {
    switch (status) {
        case 'novo': return 'Novo';
        case 'contato': return 'Em Contato';
        case 'qualificado': return 'Qualificado';
        case 'proposta': return 'Proposta';
        case 'ganho': return 'Cliente';
        case 'perdido': return 'Perdido';
        default: return status;
    }
}

/**
 * Retorna o HTML para indicador de temperatura
 * @param {string} temperature - Temperatura (hot, warm, cold)
 * @returns {string} HTML para indicador
 */
function getTemperatureHtml(temperature) {
    if (!temperature) return '-';
    
    const colors = {
        hot: '#dc3545',
        warm: '#fd7e14',
        cold: '#0d6efd'
    };
    
    const icons = {
        hot: 'fire',
        warm: 'temperature-high',
        cold: 'snowflake'
    };
    
    const labels = {
        hot: 'Quente',
        warm: 'Morno',
        cold: 'Frio'
    };
    
    const color = colors[temperature] || '#6c757d';
    const icon = icons[temperature] || 'question';
    const label = labels[temperature] || temperature;
    
    return `
        <span class="temperature-indicator" style="color: ${color}">
            <i class="fas fa-${icon}"></i>
            ${label}
        </span>
    `;
}

/**
 * Retorna contatos de exemplo
 * @returns {Array} Lista de contatos
 */
function getSampleContacts() {
    return [
        {
            id: 1,
            name: 'João Silva',
            company: 'Empresa ABC',
            status: 'qualificado',
            tags: [
                { id: 1, name: 'Cliente VIP', color: '#4e73df' }
            ],
            temperature: 'hot',
            next_follow_up: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas no futuro
            phone: '(11) 98765-4321',
            email: 'joao.silva@abc.com'
        },
        {
            id: 2,
            name: 'Maria Oliveira',
            company: 'Tech Solutions',
            status: 'proposta',
            tags: [
                { id: 3, name: 'Follow-up Pendente', color: '#f6c23e' }
            ],
            temperature: 'warm',
            next_follow_up: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 dia no futuro
            phone: '(21) 99876-5432',
            email: 'maria@techsolutions.com'
        },
        {
            id: 3,
            name: 'Carlos Santos',
            company: 'Global Corp',
            status: 'novo',
            tags: [
                { id: 2, name: 'Novo Lead', color: '#1cc88a' }
            ],
            temperature: 'cold',
            next_follow_up: null,
            phone: '(31) 97654-3210',
            email: 'carlos@globalcorp.com'
        }
    ];
}

/**
 * Completa uma tarefa
 * @param {string} taskId - ID da tarefa
 */
function completeTask(taskId) {
    // Em produção, isso marcaria a tarefa como concluída na API
    console.log(`Tarefa ${taskId} concluída`);
    
    // Animar remoção da tarefa
    const taskItem = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
    if (taskItem) {
        taskItem.style.transition = 'all 0.5s ease';
        taskItem.style.opacity = '0';
        taskItem.style.height = '0';
        taskItem.style.marginBottom = '0';
        taskItem.style.padding = '0';
        taskItem.style.overflow = 'hidden';
        
        setTimeout(() => {
            taskItem.remove();
            
            // Verificar se não há mais tarefas
            const tasksContainer = document.getElementById('pending-tasks');
            if (tasksContainer && !tasksContainer.querySelector('.task-item')) {
                tasksContainer.innerHTML = `
                    <div class="text-center py-4">
                        <div class="alert alert-success mb-0">
                            Nenhuma tarefa pendente. Bom trabalho!
                        </div>
                    </div>
                `;
            }
        }, 500);
    }
    
    // Mostrar toast
    showToast('Tarefa concluída com sucesso!', 'success');
}

/**
 * Exibe modal para editar tarefa
 * @param {string} taskId - ID da tarefa
 */
function showEditTaskModal(taskId) {
    // Em produção, isso buscaria os dados da tarefa na API
    console.log(`Editando tarefa ${taskId}`);
    showToast('Edição de tarefa em desenvolvimento', 'info');
}

/**
 * Exclui uma tarefa
 * @param {string} taskId - ID da tarefa
 */
function deleteTask(taskId) {
    // Em produção, isso excluiria a tarefa na API
    console.log(`Excluindo tarefa ${taskId}`);
    
    // Animar remoção da tarefa
    const taskItem = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
    if (taskItem) {
        taskItem.style.transition = 'all 0.5s ease';
        taskItem.style.opacity = '0';
        taskItem.style.height = '0';
        taskItem.style.marginBottom = '0';
        taskItem.style.padding = '0';
        taskItem.style.overflow = 'hidden';
        
        setTimeout(() => {
            taskItem.remove();
            
            // Verificar se não há mais tarefas
            const tasksContainer = document.getElementById('pending-tasks');
            if (tasksContainer && !tasksContainer.querySelector('.task-item')) {
                tasksContainer.innerHTML = `
                    <div class="text-center py-4">
                        <div class="alert alert-success mb-0">
                            Nenhuma tarefa pendente.
                        </div>
                    </div>
                `;
            }
        }, 500);
    }
    
    // Mostrar toast
    showToast('Tarefa excluída com sucesso!', 'success');
}

/**
 * Exibe modal para adicionar nova tarefa
 */
function showAddTaskModal() {
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'add-task-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'add-task-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="add-task-modal-label">
                        <i class="fas fa-tasks me-2"></i> Nova Tarefa
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="add-task-form">
                        <div class="mb-3">
                            <label for="task-title" class="form-label">Título</label>
                            <input type="text" class="form-control" id="task-title" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="task-description" class="form-label">Descrição</label>
                            <textarea class="form-control" id="task-description" rows="3"></textarea>
                        </div>
                        
                        <div class="mb-3">
                            <label for="task-contact" class="form-label">Contato Relacionado</label>
                            <select class="form-select" id="task-contact">
                                <option value="">Nenhum</option>
                                <option value="1">João Silva</option>
                                <option value="2">Maria Oliveira</option>
                                <option value="3">Carlos Santos</option>
                            </select>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="task-date" class="form-label">Data</label>
                                <input type="date" class="form-control" id="task-date" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="task-time" class="form-label">Hora</label>
                                <input type="time" class="form-control" id="task-time" required>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="task-type" class="form-label">Tipo</label>
                            <select class="form-select" id="task-type">
                                <option value="call">Ligação</option>
                                <option value="email">Email</option>
                                <option value="meeting">Reunião</option>
                                <option value="other">Outro</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="task-assignee" class="form-label">Responsável</label>
                            <select class="form-select" id="task-assignee">
                                <option value="1">Ana Silva</option>
                                <option value="2">Carlos Santos</option>
                                <option value="3">Mariana Oliveira</option>
                            </select>
                        </div>
                        
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="task-reminder">
                            <label class="form-check-label" for="task-reminder">Enviar lembrete</label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="save-task-btn">Salvar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Definir data padrão (hoje)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    
    document.getElementById('task-date').value = `${yyyy}-${mm}-${dd}`;
    
    // Evento para salvar tarefa
    document.getElementById('save-task-btn').addEventListener('click', function() {
        const title = document.getElementById('task-title').value;
        const date = document.getElementById('task-date').value;
        const time = document.getElementById('task-time').value;
        
        if (!title || !date || !time) {
            showToast('Preencha todos os campos obrigatórios', 'error');
            return;
        }
        
        // Em produção, isso salvaria a tarefa na API
        console.log('Salvando tarefa:', {
            title,
            description: document.getElementById('task-description').value,
            contact_id: document.getElementById('task-contact').value,
            date,
            time,
            type: document.getElementById('task-type').value,
            assignee: document.getElementById('task-assignee').value,
            reminder: document.getElementById('task-reminder').checked
        });
        
        // Fechar modal
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('add-task-modal'));
        modalInstance.hide();
        
        // Mostrar toast
        showToast('Tarefa adicionada com sucesso!', 'success');
        
        // Em produção, recarregaria as tarefas
        // Por enquanto, apenas recarregar com o mesmo conjunto de dados
        loadPendingTasks();
    });
    
    // Mostrar o modal
    const taskModal = new bootstrap.Modal(document.getElementById('add-task-modal'));
    taskModal.show();
    
    // Remover do DOM quando fechado
    document.getElementById('add-task-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Exibe modal para detalhes do contato
 * @param {string} contactId - ID do contato
 */
function showContactDetails(contactId) {
    // Obter dados do contato
    const contact = getSampleContacts().find(c => c.id === parseInt(contactId));
    if (!contact) {
        showToast('Contato não encontrado', 'error');
        return;
    }
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'contact-details-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'contact-details-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    // Formatar tags
    const tagsHtml = contact.tags && contact.tags.length > 0 
        ? contact.tags.map(tag => 
            `<span class="badge me-1" style="background-color: ${tag.color}">${tag.name}</span>`
          ).join('')
        : '<span class="text-muted">Nenhuma tag</span>';
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="contact-details-modal-label">
                        <i class="fas fa-user me-2"></i> ${contact.name}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">Informações Básicas</h5>
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item d-flex justify-content-between">
                                            <span class="text-muted">Nome:</span>
                                            <span>${contact.name}</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between">
                                            <span class="text-muted">Empresa:</span>
                                            <span>${contact.company || '-'}</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between">
                                            <span class="text-muted">Email:</span>
                                            <span>${contact.email || '-'}</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between">
                                            <span class="text-muted">Telefone:</span>
                                            <span>${contact.phone || '-'}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">Status e Classificação</h5>
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item d-flex justify-content-between">
                                            <span class="text-muted">Status:</span>
                                            <span class="badge ${getStatusBadgeClass(contact.status)}">${getStatusLabel(contact.status)}</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between">
                                            <span class="text-muted">Temperatura:</span>
                                            <span>${getTemperatureHtml(contact.temperature)}</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between">
                                            <span class="text-muted">Próximo Contato:</span>
                                            <span>${contact.next_follow_up ? formatDateRelative(contact.next_follow_up) : '-'}</span>
                                        </li>
                                        <li class="list-group-item">
                                            <span class="text-muted">Tags:</span>
                                            <div class="mt-1">
                                                ${tagsHtml}
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <ul class="nav nav-tabs" id="contactDetailsTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="notes-tab" data-bs-toggle="tab" data-bs-target="#notes-tab-content" type="button" role="tab" aria-controls="notes-tab-content" aria-selected="true">Notas</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="activities-tab" data-bs-toggle="tab" data-bs-target="#activities-tab-content" type="button" role="tab" aria-controls="activities-tab-content" aria-selected="false">Atividades</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="tasks-tab" data-bs-toggle="tab" data-bs-target="#tasks-tab-content" type="button" role="tab" aria-controls="tasks-tab-content" aria-selected="false">Tarefas</button>
                        </li>
                    </ul>
                    
                    <div class="tab-content p-3 border border-top-0 rounded-bottom" id="contactDetailsTabsContent">
                        <div class="tab-pane fade show active" id="notes-tab-content" role="tabpanel" aria-labelledby="notes-tab" tabindex="0">
                            <div class="d-flex justify-content-end mb-3">
                                <button class="btn btn-sm btn-primary" id="add-note-btn" data-contact-id="${contact.id}">
                                    <i class="fas fa-plus me-1"></i> Adicionar Nota
                                </button>
                            </div>
                            
                            <div class="list-group">
                                <div class="list-group-item list-group-item-action">
                                    <div class="d-flex justify-content-between">
                                        <h6 class="mb-1">Reunião Inicial</h6>
                                        <small class="text-muted">01/04/2023</small>
                                    </div>
                                    <p class="mb-1">Cliente interessado em nossos serviços de automação. Solicita proposta comercial detalhada.</p>
                                    <small class="text-muted">Por: Ana Silva</small>
                                </div>
                                <div class="list-group-item list-group-item-action">
                                    <div class="d-flex justify-content-between">
                                        <h6 class="mb-1">Follow-up telefônico</h6>
                                        <small class="text-muted">15/04/2023</small>
                                    </div>
                                    <p class="mb-1">Cliente avaliando proposta. Precisa de mais tempo para análise interna.</p>
                                    <small class="text-muted">Por: Carlos Santos</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane fade" id="activities-tab-content" role="tabpanel" aria-labelledby="activities-tab" tabindex="0">
                            <div class="activity-timeline">
                                <div class="activity-item">
                                    <div class="activity-icon bg-primary">
                                        <i class="fas fa-phone text-white"></i>
                                    </div>
                                    <div class="activity-content">
                                        <div class="activity-header">
                                            <span class="activity-title">Chamada Realizada</span>
                                            <span class="activity-time">01/04/2023, 14:30</span>
                                        </div>
                                        <div class="activity-description">
                                            Duração: 5:23 | Agente: Ana Silva | Resultado: Positivo
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="activity-item">
                                    <div class="activity-icon bg-info">
                                        <i class="fas fa-envelope text-white"></i>
                                    </div>
                                    <div class="activity-content">
                                        <div class="activity-header">
                                            <span class="activity-title">Email Enviado</span>
                                            <span class="activity-time">05/04/2023, 10:15</span>
                                        </div>
                                        <div class="activity-description">
                                            Assunto: Proposta Comercial | Status: Entregue | Aberto: Sim
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="activity-item">
                                    <div class="activity-icon bg-warning">
                                        <i class="fas fa-file-contract text-white"></i>
                                    </div>
                                    <div class="activity-content">
                                        <div class="activity-header">
                                            <span class="activity-title">Proposta Enviada</span>
                                            <span class="activity-time">05/04/2023, 11:20</span>
                                        </div>
                                        <div class="activity-description">
                                            Valor: R$ 12.500,00 | Produtos: Automação Completa
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane fade" id="tasks-tab-content" role="tabpanel" aria-labelledby="tasks-tab" tabindex="0">
                            <div class="d-flex justify-content-end mb-3">
                                <button class="btn btn-sm btn-primary" id="add-contact-task-btn" data-contact-id="${contact.id}">
                                    <i class="fas fa-plus me-1"></i> Nova Tarefa
                                </button>
                            </div>
                            
                            <div class="list-group">
                                <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1">Agendar reunião de follow-up</h6>
                                            <small class="text-danger">Amanhã</small>
                                        </div>
                                        <small class="text-muted">Responsável: Ana Silva | Tipo: Ligação</small>
                                    </div>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-success" title="Concluir">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button class="btn btn-outline-danger" title="Excluir">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1">Enviar documentação técnica</h6>
                                            <small class="text-info">20/04/2023</small>
                                        </div>
                                        <small class="text-muted">Responsável: Carlos Santos | Tipo: Email</small>
                                    </div>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-success" title="Concluir">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button class="btn btn-outline-danger" title="Excluir">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="btn-group">
                        <button class="btn btn-primary contact-call-btn" data-contact-id="${contact.id}">
                            <i class="fas fa-phone me-1"></i> Ligar
                        </button>
                        <button class="btn btn-success contact-whatsapp-btn" data-contact-id="${contact.id}">
                            <i class="fab fa-whatsapp me-1"></i> WhatsApp
                        </button>
                        <button class="btn btn-info text-white contact-email-btn" data-contact-id="${contact.id}">
                            <i class="fas fa-envelope me-1"></i> Email
                        </button>
                        <button class="btn btn-secondary contact-edit-btn" data-contact-id="${contact.id}">
                            <i class="fas fa-edit me-1"></i> Editar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar evento para adicionar nota
    document.getElementById('add-note-btn').addEventListener('click', function() {
        // Fechar modal de detalhes
        const detailsModal = bootstrap.Modal.getInstance(document.getElementById('contact-details-modal'));
        detailsModal.hide();
        
        // Abrir modal de nota
        setTimeout(() => {
            showAddNoteModal(contact.id);
        }, 500);
    });
    
    // Adicionar evento para adicionar tarefa
    document.getElementById('add-contact-task-btn').addEventListener('click', function() {
        // Fechar modal de detalhes
        const detailsModal = bootstrap.Modal.getInstance(document.getElementById('contact-details-modal'));
        detailsModal.hide();
        
        // Abrir modal de tarefa
        setTimeout(() => {
            showAddTaskModal();
            // Pré-selecionar o contato no formulário
            document.getElementById('task-contact').value = contact.id;
        }, 500);
    });
    
    // Mostrar o modal
    const detailsModal = new bootstrap.Modal(document.getElementById('contact-details-modal'));
    detailsModal.show();
    
    // Remover do DOM quando fechado
    document.getElementById('contact-details-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Exporta contatos
 */
function exportContacts() {
    // Em produção, isso faria o download real de um arquivo
    
    // Mostrar toast
    showToast('Exportando contatos...', 'info');
    
    // Simular processamento
    setTimeout(() => {
        showToast('Contatos exportados com sucesso!', 'success');
        
        // Simular download
        const link = document.createElement('a');
        link.href = 'data:text/csv;charset=utf-8,Nome,Empresa,Status,Telefone,Email\nJoão Silva,Empresa ABC,Qualificado,(11) 98765-4321,joao.silva@abc.com\nMaria Oliveira,Tech Solutions,Proposta,(21) 99876-5432,maria@techsolutions.com\nCarlos Santos,Global Corp,Novo,(31) 97654-3210,carlos@globalcorp.com';
        link.download = 'contatos.csv';
        link.click();
    }, 1500);
}

// Expor componente para o contexto global
window.initCRM = initCRM;
window.CRM = {
    init: initCRM,
    loadContacts,
    filterContacts,
    initiateCall,
    showEmailModal,
    showSMSModal,
    showWhatsAppModal
};
