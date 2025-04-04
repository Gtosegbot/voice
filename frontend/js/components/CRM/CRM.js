/**
 * CRM Component
 * Mini CRM functionality for managing customer relationships
 */

import { API } from '../../services/api.js';
import { showToast } from '../../utils/toast.js';

// Main container for CRM component
let crmContainer;

/**
 * Initialize CRM component
 */
function initCRM() {
    // Create main container
    crmContainer = document.createElement('div');
    crmContainer.className = 'container-fluid';
    crmContainer.innerHTML = `
        <div class="d-sm-flex align-items-center justify-content-between mb-4">
            <h1 class="h3 mb-0 text-gray-800">Mini CRM</h1>
            <button class="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm" id="new-contact-btn">
                <i class="fas fa-plus fa-sm text-white-50 me-1"></i> Novo Contato
            </button>
        </div>

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
                                <a class="dropdown-item" href="#" id="export-contacts-btn">
                                    <i class="fas fa-file-export fa-sm fa-fw me-2 text-gray-400"></i>
                                    Exportar Contatos
                                </a>
                                <a class="dropdown-item" href="#" id="import-contacts-btn">
                                    <i class="fas fa-file-import fa-sm fa-fw me-2 text-gray-400"></i>
                                    Importar Contatos
                                </a>
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item" href="#" id="bulk-actions-btn">
                                    <i class="fas fa-cogs fa-sm fa-fw me-2 text-gray-400"></i>
                                    Ações em Massa
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
                                        <button class="btn btn-primary" type="button">
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
                                    <select class="form-select" id="filter-source">
                                        <option value="">Todas as Origens</option>
                                        <option value="site">Site</option>
                                        <option value="indicacao">Indicação</option>
                                        <option value="rede-social">Rede Social</option>
                                        <option value="evento">Evento</option>
                                        <option value="cold-call">Cold Call</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <select class="form-select" id="filter-agent">
                                        <option value="">Todos os Agentes</option>
                                        <option value="1">Ana Silva</option>
                                        <option value="2">Carlos Santos</option>
                                        <option value="3">Mariana Oliveira</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-outline-secondary w-100" id="clear-filters-btn">
                                        <i class="fas fa-times me-1"></i> Limpar Filtros
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
                                        <th>Telefone</th>
                                        <th>Email</th>
                                        <th>Origem</th>
                                        <th>Agente</th>
                                        <th>Última Atividade</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Sample data -->
                                    <tr>
                                        <td>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" value="1">
                                            </div>
                                        </td>
                                        <td><a href="#" class="contact-link" data-contact-id="1">João Silva</a></td>
                                        <td>Empresa ABC</td>
                                        <td><span class="badge bg-success">Qualificado</span></td>
                                        <td>(11) 98765-4321</td>
                                        <td>joao.silva@abc.com</td>
                                        <td>Site</td>
                                        <td>Ana Silva</td>
                                        <td>Hoje, 14:30</td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-primary contact-call-btn" data-contact-id="1" title="Ligar">
                                                    <i class="fas fa-phone"></i>
                                                </button>
                                                <button class="btn btn-outline-info contact-note-btn" data-contact-id="1" title="Adicionar Nota">
                                                    <i class="fas fa-sticky-note"></i>
                                                </button>
                                                <button class="btn btn-outline-secondary contact-edit-btn" data-contact-id="1" title="Editar">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" value="2">
                                            </div>
                                        </td>
                                        <td><a href="#" class="contact-link" data-contact-id="2">Maria Oliveira</a></td>
                                        <td>Tech Solutions</td>
                                        <td><span class="badge bg-warning">Proposta</span></td>
                                        <td>(21) 99876-5432</td>
                                        <td>maria@techsolutions.com</td>
                                        <td>Indicação</td>
                                        <td>Carlos Santos</td>
                                        <td>Ontem, 10:15</td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-primary contact-call-btn" data-contact-id="2" title="Ligar">
                                                    <i class="fas fa-phone"></i>
                                                </button>
                                                <button class="btn btn-outline-info contact-note-btn" data-contact-id="2" title="Adicionar Nota">
                                                    <i class="fas fa-sticky-note"></i>
                                                </button>
                                                <button class="btn btn-outline-secondary contact-edit-btn" data-contact-id="2" title="Editar">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" value="3">
                                            </div>
                                        </td>
                                        <td><a href="#" class="contact-link" data-contact-id="3">Carlos Santos</a></td>
                                        <td>Global Corp</td>
                                        <td><span class="badge bg-info">Novo</span></td>
                                        <td>(31) 97654-3210</td>
                                        <td>carlos@globalcorp.com</td>
                                        <td>Cold Call</td>
                                        <td>Mariana Oliveira</td>
                                        <td>01/04/2025</td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-primary contact-call-btn" data-contact-id="3" title="Ligar">
                                                    <i class="fas fa-phone"></i>
                                                </button>
                                                <button class="btn btn-outline-info contact-note-btn" data-contact-id="3" title="Adicionar Nota">
                                                    <i class="fas fa-sticky-note"></i>
                                                </button>
                                                <button class="btn btn-outline-secondary contact-edit-btn" data-contact-id="3" title="Editar">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <div>
                                Mostrando 1-3 de 42 contatos
                            </div>
                            <div>
                                <nav>
                                    <ul class="pagination">
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
                        <div class="activity-timeline">
                            <div class="activity-item">
                                <div class="activity-icon bg-primary">
                                    <i class="fas fa-phone text-white"></i>
                                </div>
                                <div class="activity-content">
                                    <div class="activity-header">
                                        <span class="activity-title">Ligação com João Silva</span>
                                        <span class="activity-time">Hoje, 14:30</span>
                                    </div>
                                    <div class="activity-description">
                                        Conversa sobre proposta comercial. Interessado em avançar para próxima etapa.
                                    </div>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon bg-info">
                                    <i class="fas fa-sticky-note text-white"></i>
                                </div>
                                <div class="activity-content">
                                    <div class="activity-header">
                                        <span class="activity-title">Nota adicionada em Maria Oliveira</span>
                                        <span class="activity-time">Ontem, 10:15</span>
                                    </div>
                                    <div class="activity-description">
                                        Cliente solicitou demonstração do produto para equipe de TI.
                                    </div>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon bg-success">
                                    <i class="fas fa-user-plus text-white"></i>
                                </div>
                                <div class="activity-content">
                                    <div class="activity-header">
                                        <span class="activity-title">Novo contato criado</span>
                                        <span class="activity-time">01/04/2025, 09:45</span>
                                    </div>
                                    <div class="activity-description">
                                        Carlos Santos da Global Corp adicionado como novo contato.
                                    </div>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon bg-warning">
                                    <i class="fas fa-file-contract text-white"></i>
                                </div>
                                <div class="activity-content">
                                    <div class="activity-header">
                                        <span class="activity-title">Proposta enviada</span>
                                        <span class="activity-time">31/03/2025, 16:20</span>
                                    </div>
                                    <div class="activity-description">
                                        Proposta comercial enviada para Maria Oliveira da Tech Solutions.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-6 col-lg-6">
                <div class="card shadow mb-4">
                    <div class="card-header py-3">
                        <h6 class="m-0 font-weight-bold text-primary">Tarefas Pendentes</h6>
                    </div>
                    <div class="card-body">
                        <div class="tasks-container">
                            <div class="task-item">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="task-1">
                                    <label class="form-check-label" for="task-1">
                                        <span class="task-title">Ligar para João Silva</span>
                                        <span class="task-due badge bg-danger ms-2">Hoje</span>
                                    </label>
                                </div>
                                <div class="task-meta">
                                    <span class="task-assignee">Ana Silva</span>
                                    <div class="task-actions">
                                        <button class="btn btn-sm btn-link">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-link text-danger">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="task-item">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="task-2">
                                    <label class="form-check-label" for="task-2">
                                        <span class="task-title">Enviar material adicional para Maria Oliveira</span>
                                        <span class="task-due badge bg-warning ms-2">Amanhã</span>
                                    </label>
                                </div>
                                <div class="task-meta">
                                    <span class="task-assignee">Carlos Santos</span>
                                    <div class="task-actions">
                                        <button class="btn btn-sm btn-link">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-link text-danger">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="task-item">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="task-3">
                                    <label class="form-check-label" for="task-3">
                                        <span class="task-title">Preparar proposta para Global Corp</span>
                                        <span class="task-due badge bg-info ms-2">05/04/2025</span>
                                    </label>
                                </div>
                                <div class="task-meta">
                                    <span class="task-assignee">Mariana Oliveira</span>
                                    <div class="task-actions">
                                        <button class="btn btn-sm btn-link">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-link text-danger">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="task-item">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="task-4">
                                    <label class="form-check-label" for="task-4">
                                        <span class="task-title">Agendar reunião de acompanhamento com leads qualificados</span>
                                        <span class="task-due badge bg-secondary ms-2">10/04/2025</span>
                                    </label>
                                </div>
                                <div class="task-meta">
                                    <span class="task-assignee">Ana Silva</span>
                                    <div class="task-actions">
                                        <button class="btn btn-sm btn-link">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-link text-danger">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="add-task-form mt-3">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Adicionar nova tarefa...">
                                <button class="btn btn-primary" type="button">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add CSS
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
    `;
    document.head.appendChild(style);

    // Add event listeners
    setupCRMEvents();

    return crmContainer;
}

/**
 * Setup CRM event listeners
 */
function setupCRMEvents() {
    // New contact button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'new-contact-btn' && !e.target.closest('#new-contact-btn')) return;
        
        showNewContactModal();
    });

    // Export contacts button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'export-contacts-btn' && !e.target.closest('#export-contacts-btn')) return;
        
        // Show toast message
        showToast('Exportando contatos...', 'info');
        
        // In a real application, you would make an API call to export contacts
        setTimeout(() => {
            showToast('Contatos exportados com sucesso!', 'success');
        }, 1500);
    });

    // Import contacts button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'import-contacts-btn' && !e.target.closest('#import-contacts-btn')) return;
        
        // Navigate to file upload page
        const fileUploadNavItem = document.querySelector('.sidebar-nav-item[data-page="file-upload"]');
        if (fileUploadNavItem) {
            fileUploadNavItem.click();
        }
    });

    // Clear filters button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'clear-filters-btn' && !e.target.closest('#clear-filters-btn')) return;
        
        // Clear all filter inputs
        document.getElementById('search-contacts').value = '';
        document.getElementById('filter-status').value = '';
        document.getElementById('filter-source').value = '';
        document.getElementById('filter-agent').value = '';
        
        // Show toast message
        showToast('Filtros limpos', 'info');
    });

    // Select all contacts
    document.addEventListener('change', function(e) {
        if (e.target.id !== 'select-all-contacts') return;
        
        // Get all checkboxes in the table
        const checkboxes = document.querySelectorAll('#contacts-table tbody .form-check-input');
        
        // Set all checkboxes to the same state as the "select all" checkbox
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });

    // Contact link (view contact details)
    document.addEventListener('click', function(e) {
        if (!e.target.classList.contains('contact-link')) return;
        e.preventDefault();
        
        const contactId = e.target.getAttribute('data-contact-id');
        
        // In a real application, you would fetch contact details and show them
        showToast(`Visualizando detalhes do contato ID: ${contactId}`, 'info');
    });

    // Call contact button
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.contact-call-btn')) return;
        
        const btn = e.target.closest('.contact-call-btn');
        const contactId = btn.getAttribute('data-contact-id');
        
        // In a real application, you would initiate a call
        showToast(`Iniciando chamada para contato ID: ${contactId}`, 'info');
    });

    // Add note button
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.contact-note-btn')) return;
        
        const btn = e.target.closest('.contact-note-btn');
        const contactId = btn.getAttribute('data-contact-id');
        
        showAddNoteModal(contactId);
    });

    // Edit contact button
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.contact-edit-btn')) return;
        
        const btn = e.target.closest('.contact-edit-btn');
        const contactId = btn.getAttribute('data-contact-id');
        
        showEditContactModal(contactId);
    });
}

/**
 * Show new contact modal
 */
function showNewContactModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'new-contact-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'new-contact-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="new-contact-modal-label">
                        <i class="fas fa-user-plus me-2"></i>
                        Novo Contato
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="new-contact-form">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="contact-name" class="form-label">Nome *</label>
                                <input type="text" class="form-control" id="contact-name" required>
                            </div>
                            <div class="col-md-6">
                                <label for="contact-company" class="form-label">Empresa</label>
                                <input type="text" class="form-control" id="contact-company">
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="contact-email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="contact-email">
                            </div>
                            <div class="col-md-6">
                                <label for="contact-phone" class="form-label">Telefone *</label>
                                <input type="tel" class="form-control" id="contact-phone" required>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="contact-status" class="form-label">Status</label>
                                <select class="form-select" id="contact-status">
                                    <option value="novo">Novo</option>
                                    <option value="contato">Em Contato</option>
                                    <option value="qualificado">Qualificado</option>
                                    <option value="proposta">Proposta</option>
                                    <option value="ganho">Cliente</option>
                                    <option value="perdido">Perdido</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="contact-source" class="form-label">Origem</label>
                                <select class="form-select" id="contact-source">
                                    <option value="site">Site</option>
                                    <option value="indicacao">Indicação</option>
                                    <option value="rede-social">Rede Social</option>
                                    <option value="evento">Evento</option>
                                    <option value="cold-call">Cold Call</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="contact-agent" class="form-label">Agente Responsável</label>
                                <select class="form-select" id="contact-agent">
                                    <option value="1">Ana Silva</option>
                                    <option value="2">Carlos Santos</option>
                                    <option value="3">Mariana Oliveira</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="contact-score" class="form-label">Pontuação</label>
                                <input type="number" class="form-control" id="contact-score" min="0" max="100" value="0">
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="contact-notes" class="form-label">Notas Iniciais</label>
                            <textarea class="form-control" id="contact-notes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="save-contact-btn">Salvar Contato</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    const bootstrapModal = new bootstrap.Modal(document.getElementById('new-contact-modal'));
    bootstrapModal.show();
    
    // Save contact button
    document.getElementById('save-contact-btn').addEventListener('click', function() {
        // Get form data
        const name = document.getElementById('contact-name').value;
        const phone = document.getElementById('contact-phone').value;
        
        // Simple validation
        if (!name || !phone) {
            showToast('Por favor, preencha os campos obrigatórios.', 'error');
            return;
        }
        
        // In a real application, you would send the data to the API
        showToast('Contato salvo com sucesso!', 'success');
        
        // Close modal
        bootstrapModal.hide();
    });
    
    // Remove modal from DOM when hidden
    document.getElementById('new-contact-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Show add note modal
 * @param {string} contactId - ID of the contact
 */
function showAddNoteModal(contactId) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'add-note-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'add-note-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="add-note-modal-label">
                        <i class="fas fa-sticky-note me-2"></i>
                        Adicionar Nota
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="add-note-form">
                        <input type="hidden" id="note-contact-id" value="${contactId}">
                        
                        <div class="mb-3">
                            <label for="note-type" class="form-label">Tipo de Nota</label>
                            <select class="form-select" id="note-type">
                                <option value="general">Geral</option>
                                <option value="call">Chamada</option>
                                <option value="meeting">Reunião</option>
                                <option value="task">Tarefa</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="note-content" class="form-label">Conteúdo</label>
                            <textarea class="form-control" id="note-content" rows="5" required></textarea>
                        </div>
                        
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="note-follow-up">
                            <label class="form-check-label" for="note-follow-up">
                                Adicionar follow-up
                            </label>
                        </div>
                        
                        <div class="follow-up-container d-none" id="follow-up-container">
                            <div class="mb-3">
                                <label for="follow-up-date" class="form-label">Data de Follow-up</label>
                                <input type="date" class="form-control" id="follow-up-date">
                            </div>
                            
                            <div class="mb-3">
                                <label for="follow-up-type" class="form-label">Tipo de Follow-up</label>
                                <select class="form-select" id="follow-up-type">
                                    <option value="call">Chamada</option>
                                    <option value="meeting">Reunião</option>
                                    <option value="email">Email</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="save-note-btn">Salvar Nota</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Toggle follow-up container
    document.getElementById('note-follow-up').addEventListener('change', function() {
        const followUpContainer = document.getElementById('follow-up-container');
        
        if (this.checked) {
            followUpContainer.classList.remove('d-none');
        } else {
            followUpContainer.classList.add('d-none');
        }
    });
    
    // Show modal
    const bootstrapModal = new bootstrap.Modal(document.getElementById('add-note-modal'));
    bootstrapModal.show();
    
    // Save note button
    document.getElementById('save-note-btn').addEventListener('click', function() {
        // Get form data
        const content = document.getElementById('note-content').value;
        
        // Simple validation
        if (!content) {
            showToast('Por favor, preencha o conteúdo da nota.', 'error');
            return;
        }
        
        // In a real application, you would send the data to the API
        showToast('Nota adicionada com sucesso!', 'success');
        
        // Close modal
        bootstrapModal.hide();
    });
    
    // Remove modal from DOM when hidden
    document.getElementById('add-note-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Show edit contact modal
 * @param {string} contactId - ID of the contact
 */
function showEditContactModal(contactId) {
    // In a real application, you would fetch contact details from the API
    // For demo, we'll use sample data
    
    const contactData = {
        name: 'João Silva',
        company: 'Empresa ABC',
        email: 'joao.silva@abc.com',
        phone: '(11) 98765-4321',
        status: 'qualificado',
        source: 'site',
        agent_id: '1',
        score: 75,
        notes: 'Cliente interessado em nossos serviços de automação.'
    };
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'edit-contact-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'edit-contact-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="edit-contact-modal-label">
                        <i class="fas fa-user-edit me-2"></i>
                        Editar Contato
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="edit-contact-form">
                        <input type="hidden" id="edit-contact-id" value="${contactId}">
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="edit-contact-name" class="form-label">Nome *</label>
                                <input type="text" class="form-control" id="edit-contact-name" value="${contactData.name}" required>
                            </div>
                            <div class="col-md-6">
                                <label for="edit-contact-company" class="form-label">Empresa</label>
                                <input type="text" class="form-control" id="edit-contact-company" value="${contactData.company}">
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="edit-contact-email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="edit-contact-email" value="${contactData.email}">
                            </div>
                            <div class="col-md-6">
                                <label for="edit-contact-phone" class="form-label">Telefone *</label>
                                <input type="tel" class="form-control" id="edit-contact-phone" value="${contactData.phone}" required>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="edit-contact-status" class="form-label">Status</label>
                                <select class="form-select" id="edit-contact-status">
                                    <option value="novo" ${contactData.status === 'novo' ? 'selected' : ''}>Novo</option>
                                    <option value="contato" ${contactData.status === 'contato' ? 'selected' : ''}>Em Contato</option>
                                    <option value="qualificado" ${contactData.status === 'qualificado' ? 'selected' : ''}>Qualificado</option>
                                    <option value="proposta" ${contactData.status === 'proposta' ? 'selected' : ''}>Proposta</option>
                                    <option value="ganho" ${contactData.status === 'ganho' ? 'selected' : ''}>Cliente</option>
                                    <option value="perdido" ${contactData.status === 'perdido' ? 'selected' : ''}>Perdido</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="edit-contact-source" class="form-label">Origem</label>
                                <select class="form-select" id="edit-contact-source">
                                    <option value="site" ${contactData.source === 'site' ? 'selected' : ''}>Site</option>
                                    <option value="indicacao" ${contactData.source === 'indicacao' ? 'selected' : ''}>Indicação</option>
                                    <option value="rede-social" ${contactData.source === 'rede-social' ? 'selected' : ''}>Rede Social</option>
                                    <option value="evento" ${contactData.source === 'evento' ? 'selected' : ''}>Evento</option>
                                    <option value="cold-call" ${contactData.source === 'cold-call' ? 'selected' : ''}>Cold Call</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="edit-contact-agent" class="form-label">Agente Responsável</label>
                                <select class="form-select" id="edit-contact-agent">
                                    <option value="1" ${contactData.agent_id === '1' ? 'selected' : ''}>Ana Silva</option>
                                    <option value="2" ${contactData.agent_id === '2' ? 'selected' : ''}>Carlos Santos</option>
                                    <option value="3" ${contactData.agent_id === '3' ? 'selected' : ''}>Mariana Oliveira</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="edit-contact-score" class="form-label">Pontuação</label>
                                <input type="number" class="form-control" id="edit-contact-score" min="0" max="100" value="${contactData.score}">
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="edit-contact-notes" class="form-label">Notas</label>
                            <textarea class="form-control" id="edit-contact-notes" rows="3">${contactData.notes}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger me-auto" id="delete-contact-btn">Excluir Contato</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="update-contact-btn">Atualizar Contato</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    const bootstrapModal = new bootstrap.Modal(document.getElementById('edit-contact-modal'));
    bootstrapModal.show();
    
    // Update contact button
    document.getElementById('update-contact-btn').addEventListener('click', function() {
        // Get form data
        const name = document.getElementById('edit-contact-name').value;
        const phone = document.getElementById('edit-contact-phone').value;
        
        // Simple validation
        if (!name || !phone) {
            showToast('Por favor, preencha os campos obrigatórios.', 'error');
            return;
        }
        
        // In a real application, you would send the data to the API
        showToast('Contato atualizado com sucesso!', 'success');
        
        // Close modal
        bootstrapModal.hide();
    });
    
    // Delete contact button
    document.getElementById('delete-contact-btn').addEventListener('click', function() {
        // Confirm deletion
        if (!confirm('Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        // In a real application, you would send a delete request to the API
        showToast('Contato excluído com sucesso!', 'success');
        
        // Close modal
        bootstrapModal.hide();
    });
    
    // Remove modal from DOM when hidden
    document.getElementById('edit-contact-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

export { initCRM };