/**
 * Admin Component
 * Superadmin functionality for managing the VoiceAI platform
 */

// Função de toast para mensagens
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '5000';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Set toast background color based on type
    let bgColor, iconClass;
    
    switch (type) {
        case 'success':
            bgColor = 'bg-success text-white';
            iconClass = 'fa-check-circle';
            break;
        case 'error':
            bgColor = 'bg-danger text-white';
            iconClass = 'fa-exclamation-circle';
            break;
        case 'warning':
            bgColor = 'bg-warning text-dark';
            iconClass = 'fa-exclamation-triangle';
            break;
        case 'info':
        default:
            bgColor = 'bg-info text-white';
            iconClass = 'fa-info-circle';
            break;
    }
    
    // Create toast content
    toast.innerHTML = `
        <div class="toast-header ${bgColor}">
            <i class="fas ${iconClass} me-2"></i>
            <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
            <small>Agora</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Initialize Bootstrap toast
    try {
        const bootstrapToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 5000
        });
        
        // Show toast
        bootstrapToast.show();
    } catch (error) {
        console.error('Error initializing Bootstrap toast:', error);
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            toast.remove();
        }, 5000);
    }
    
    // Remove toast from DOM after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
        
        // Remove container if it's empty
        if (toastContainer.children.length === 0) {
            toastContainer.remove();
        }
    });
}

// Main container for Admin component
let adminContainer;

/**
 * Initialize Admin component
 */
function initAdmin() {
    // Create main container
    adminContainer = document.createElement('div');
    adminContainer.className = 'container-fluid';
    adminContainer.innerHTML = `
        <div class="d-sm-flex align-items-center justify-content-between mb-4">
            <h1 class="h3 mb-0 text-gray-800">Superadmin</h1>
            <button class="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm" id="system-logs-btn">
                <i class="fas fa-file-alt fa-sm text-white-50 me-1"></i> Baixar Logs do Sistema
            </button>
        </div>

        <div class="row">
            <div class="col-xl-12 col-lg-12">
                <div class="card shadow mb-4">
                    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 class="m-0 font-weight-bold text-primary">Usuários do Sistema</h6>
                        <button class="btn btn-sm btn-primary" id="add-user-btn">
                            <i class="fas fa-user-plus fa-sm me-1"></i> Adicionar Usuário
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-hover" id="users-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nome</th>
                                        <th>Email</th>
                                        <th>Função</th>
                                        <th>Status</th>
                                        <th>Último Login</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Sample data -->
                                    <tr>
                                        <td>1</td>
                                        <td>Admin Sistema</td>
                                        <td>admin@voiceai.com</td>
                                        <td><span class="badge bg-danger">Superadmin</span></td>
                                        <td><span class="badge bg-success">Ativo</span></td>
                                        <td>04/04/2025, 09:30</td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-secondary user-edit-btn" data-user-id="1" title="Editar">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-outline-info user-impersonate-btn" data-user-id="1" title="Login como Usuário">
                                                    <i class="fas fa-user-secret"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Ana Silva</td>
                                        <td>ana.silva@voiceai.com</td>
                                        <td><span class="badge bg-primary">Agente</span></td>
                                        <td><span class="badge bg-success">Ativo</span></td>
                                        <td>04/04/2025, 08:15</td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-secondary user-edit-btn" data-user-id="2" title="Editar">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-outline-info user-impersonate-btn" data-user-id="2" title="Login como Usuário">
                                                    <i class="fas fa-user-secret"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td>Carlos Santos</td>
                                        <td>carlos.santos@voiceai.com</td>
                                        <td><span class="badge bg-primary">Agente</span></td>
                                        <td><span class="badge bg-success">Ativo</span></td>
                                        <td>03/04/2025, 17:45</td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-secondary user-edit-btn" data-user-id="3" title="Editar">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-outline-info user-impersonate-btn" data-user-id="3" title="Login como Usuário">
                                                    <i class="fas fa-user-secret"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-xl-6 col-lg-6">
                <div class="card shadow mb-4">
                    <div class="card-header py-3">
                        <h6 class="m-0 font-weight-bold text-primary">Configurações do Sistema</h6>
                    </div>
                    <div class="card-body">
                        <div class="system-settings">
                            <form id="system-settings-form">
                                <div class="mb-3">
                                    <label for="system-name" class="form-label">Nome do Sistema</label>
                                    <input type="text" class="form-control" id="system-name" value="VoiceAI Platform">
                                </div>
                                
                                <div class="mb-3">
                                    <label for="system-url" class="form-label">URL do Sistema</label>
                                    <input type="url" class="form-control" id="system-url" value="https://app.voiceai.com">
                                </div>
                                
                                <div class="mb-3">
                                    <label for="system-email" class="form-label">Email do Sistema</label>
                                    <input type="email" class="form-control" id="system-email" value="system@voiceai.com">
                                </div>
                                
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="system-timezone" class="form-label">Fuso Horário</label>
                                        <select class="form-select" id="system-timezone">
                                            <option value="America/Sao_Paulo" selected>América/São Paulo</option>
                                            <option value="America/Recife">América/Recife</option>
                                            <option value="America/Manaus">América/Manaus</option>
                                            <option value="America/Rio_Branco">América/Rio Branco</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="system-language" class="form-label">Idioma Padrão</label>
                                        <select class="form-select" id="system-language">
                                            <option value="pt-BR" selected>Português (Brasil)</option>
                                            <option value="en-US">Inglês (EUA)</option>
                                            <option value="es-ES">Espanhol</option>
                                            <option value="fr-FR">Francês</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Opções do Sistema</label>
                                    <div class="form-check mb-2">
                                        <input class="form-check-input" type="checkbox" id="system-maintenance-mode">
                                        <label class="form-check-label" for="system-maintenance-mode">
                                            Modo de Manutenção
                                        </label>
                                    </div>
                                    <div class="form-check mb-2">
                                        <input class="form-check-input" type="checkbox" id="system-debug-mode">
                                        <label class="form-check-label" for="system-debug-mode">
                                            Modo de Depuração
                                        </label>
                                    </div>
                                    <div class="form-check mb-2">
                                        <input class="form-check-input" type="checkbox" id="system-registration-enabled" checked>
                                        <label class="form-check-label" for="system-registration-enabled">
                                            Permitir Registro de Usuários
                                        </label>
                                    </div>
                                </div>
                                
                                <button type="button" class="btn btn-primary" id="save-system-settings-btn">
                                    Salvar Configurações
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-6 col-lg-6">
                <div class="card shadow mb-4">
                    <div class="card-header py-3">
                        <h6 class="m-0 font-weight-bold text-primary">Estado do Sistema</h6>
                    </div>
                    <div class="card-body">
                        <div class="system-status">
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <div class="status-item">
                                        <div class="status-label">Estado do Servidor</div>
                                        <div class="status-value">
                                            <span class="badge bg-success">Online</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="status-item">
                                        <div class="status-label">Uso de CPU</div>
                                        <div class="status-value">
                                            <div class="progress">
                                                <div class="progress-bar" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <div class="status-item">
                                        <div class="status-label">Uso de Memória</div>
                                        <div class="status-value">
                                            <div class="progress">
                                                <div class="progress-bar bg-info" role="progressbar" style="width: 40%;" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100">40%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="status-item">
                                        <div class="status-label">Uso de Disco</div>
                                        <div class="status-value">
                                            <div class="progress">
                                                <div class="progress-bar bg-warning" role="progressbar" style="width: 65%;" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100">65%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <div class="status-item">
                                        <div class="status-label">Serviço Asterisk</div>
                                        <div class="status-value">
                                            <span class="badge bg-success">Operacional</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="status-item">
                                        <div class="status-label">Serviço WhatsApp</div>
                                        <div class="status-value">
                                            <span class="badge bg-success">Operacional</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <div class="status-item">
                                        <div class="status-label">Serviço ElevenLabs</div>
                                        <div class="status-value">
                                            <span class="badge bg-success">Operacional</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="status-item">
                                        <div class="status-label">Banco de Dados</div>
                                        <div class="status-value">
                                            <span class="badge bg-success">Operacional</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="system-info mb-4">
                                <table class="table table-sm">
                                    <tbody>
                                        <tr>
                                            <td>Versão do Sistema</td>
                                            <td>v1.2.5</td>
                                        </tr>
                                        <tr>
                                            <td>Última Atualização</td>
                                            <td>01/04/2025</td>
                                        </tr>
                                        <tr>
                                            <td>Tempo Online</td>
                                            <td>3 dias, 7 horas</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-info" id="check-for-updates-btn">
                                    <i class="fas fa-sync-alt me-1"></i> Verificar Atualizações
                                </button>
                                <button class="btn btn-warning" id="restart-services-btn">
                                    <i class="fas fa-redo me-1"></i> Reiniciar Serviços
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
        .status-item {
            margin-bottom: 15px;
        }
        
        .status-label {
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .system-info table {
            margin-bottom: 0;
        }
        
        .system-info td:first-child {
            font-weight: 600;
            width: 40%;
        }
    `;
    document.head.appendChild(style);

    // Add event listeners
    setupAdminEvents();

    return adminContainer;
}

/**
 * Setup Admin event listeners
 */
function setupAdminEvents() {
    // Add user button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'add-user-btn' && !e.target.closest('#add-user-btn')) return;
        
        showAddUserModal();
    });

    // Edit user button
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-edit-btn')) return;
        
        const btn = e.target.closest('.user-edit-btn');
        const userId = btn.getAttribute('data-user-id');
        
        showEditUserModal(userId);
    });

    // Impersonate user button
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-impersonate-btn')) return;
        
        const btn = e.target.closest('.user-impersonate-btn');
        const userId = btn.getAttribute('data-user-id');
        
        // Confirm impersonation
        if (confirm('Tem certeza que deseja fazer login como este usuário? Você será desconectado da sua sessão atual.')) {
            // In a real application, you would make an API call to impersonate the user
            showToast('Iniciando login como outro usuário...', 'info');
            
            // Simulate a page reload
            setTimeout(() => {
                showToast('Login como outro usuário realizado com sucesso!', 'success');
            }, 1500);
        }
    });

    // System logs button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'system-logs-btn' && !e.target.closest('#system-logs-btn')) return;
        
        // In a real application, you would generate and download logs
        showToast('Gerando logs do sistema...', 'info');
        
        // Simulate a download delay
        setTimeout(() => {
            showToast('Logs do sistema baixados com sucesso!', 'success');
        }, 1500);
    });

    // Save system settings button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'save-system-settings-btn') return;
        
        // In a real application, you would save the settings to the API
        showToast('Salvando configurações do sistema...', 'info');
        
        // Simulate a save delay
        setTimeout(() => {
            showToast('Configurações do sistema salvas com sucesso!', 'success');
        }, 1000);
    });

    // Check for updates button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'check-for-updates-btn' && !e.target.closest('#check-for-updates-btn')) return;
        
        // In a real application, you would check for updates
        showToast('Verificando atualizações...', 'info');
        
        // Simulate a check delay
        setTimeout(() => {
            showToast('Sistema está atualizado!', 'success');
        }, 1500);
    });

    // Restart services button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'restart-services-btn' && !e.target.closest('#restart-services-btn')) return;
        
        // Confirm restart
        if (confirm('Tem certeza que deseja reiniciar todos os serviços? Isso pode afetar os usuários ativos.')) {
            // In a real application, you would restart the services
            showToast('Reiniciando serviços...', 'warning');
            
            // Simulate a restart delay
            setTimeout(() => {
                showToast('Serviços reiniciados com sucesso!', 'success');
            }, 3000);
        }
    });
}

/**
 * Show add user modal
 */
function showAddUserModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'add-user-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'add-user-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="add-user-modal-label">
                        <i class="fas fa-user-plus me-2"></i>
                        Adicionar Usuário
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="add-user-form">
                        <div class="mb-3">
                            <label for="user-name" class="form-label">Nome Completo *</label>
                            <input type="text" class="form-control" id="user-name" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="user-email" class="form-label">Email *</label>
                            <input type="email" class="form-control" id="user-email" required>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="user-password" class="form-label">Senha *</label>
                                <input type="password" class="form-control" id="user-password" required>
                            </div>
                            <div class="col-md-6">
                                <label for="user-confirm-password" class="form-label">Confirmar Senha *</label>
                                <input type="password" class="form-control" id="user-confirm-password" required>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="user-role" class="form-label">Função *</label>
                                <select class="form-select" id="user-role" required>
                                    <option value="agent">Agente</option>
                                    <option value="manager">Gerente</option>
                                    <option value="admin">Administrador</option>
                                    <option value="superadmin">Superadmin</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="user-status" class="form-label">Status *</label>
                                <select class="form-select" id="user-status" required>
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                    <option value="suspended">Suspenso</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="user-phone" class="form-label">Telefone</label>
                            <input type="tel" class="form-control" id="user-phone">
                        </div>
                        
                        <div class="mb-3">
                            <label for="user-job-title" class="form-label">Cargo</label>
                            <input type="text" class="form-control" id="user-job-title">
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Permissões</label>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="perm-leads" checked>
                                        <label class="form-check-label" for="perm-leads">
                                            Gerenciar Leads
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="perm-campaigns" checked>
                                        <label class="form-check-label" for="perm-campaigns">
                                            Gerenciar Campanhas
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="perm-calls" checked>
                                        <label class="form-check-label" for="perm-calls">
                                            Fazer Chamadas
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="perm-analytics">
                                        <label class="form-check-label" for="perm-analytics">
                                            Ver Análises
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="perm-settings">
                                        <label class="form-check-label" for="perm-settings">
                                            Alterar Configurações
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="perm-users">
                                        <label class="form-check-label" for="perm-users">
                                            Gerenciar Usuários
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="save-user-btn">Salvar Usuário</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    try {
        const bootstrapModal = new bootstrap.Modal(document.getElementById('add-user-modal'));
        bootstrapModal.show();
    } catch (error) {
        console.error('Error showing modal:', error);
        // Fallback if bootstrap is not available
        const modal = document.getElementById('add-user-modal');
        modal.classList.add('show');
        modal.style.display = 'block';
    }
    
    // Role change event to update permissions
    document.getElementById('user-role').addEventListener('change', function() {
        const role = this.value;
        
        // Reset all permissions
        document.querySelectorAll('[id^="perm-"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Set permissions based on role
        switch (role) {
            case 'superadmin':
                document.querySelectorAll('[id^="perm-"]').forEach(checkbox => {
                    checkbox.checked = true;
                });
                break;
            case 'admin':
                document.getElementById('perm-leads').checked = true;
                document.getElementById('perm-campaigns').checked = true;
                document.getElementById('perm-calls').checked = true;
                document.getElementById('perm-analytics').checked = true;
                document.getElementById('perm-settings').checked = true;
                break;
            case 'manager':
                document.getElementById('perm-leads').checked = true;
                document.getElementById('perm-campaigns').checked = true;
                document.getElementById('perm-calls').checked = true;
                document.getElementById('perm-analytics').checked = true;
                break;
            case 'agent':
                document.getElementById('perm-leads').checked = true;
                document.getElementById('perm-campaigns').checked = true;
                document.getElementById('perm-calls').checked = true;
                break;
        }
    });
    
    // Save user button
    document.getElementById('save-user-btn').addEventListener('click', function() {
        // Get form data
        const name = document.getElementById('user-name').value;
        const email = document.getElementById('user-email').value;
        const password = document.getElementById('user-password').value;
        const confirmPassword = document.getElementById('user-confirm-password').value;
        
        // Simple validation
        if (!name || !email || !password || !confirmPassword) {
            showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showToast('As senhas não coincidem.', 'error');
            return;
        }
        
        // In a real application, you would send the data to the API
        showToast('Usuário criado com sucesso!', 'success');
        
        // Close modal
        try { bootstrapModal.hide(); } catch(e) { console.error("Error hiding modal:", e); }
    });
    
    // Remove modal from DOM when hidden
    document.getElementById('add-user-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

/**
 * Show edit user modal
 * @param {string} userId - ID of the user
 */
function showEditUserModal(userId) {
    // In a real application, you would fetch user details from the API
    // For demo, we'll use sample data
    
    let userData;
    
    // Get user data based on ID
    switch (userId) {
        case '1':
            userData = {
                name: 'Admin Sistema',
                email: 'admin@voiceai.com',
                role: 'superadmin',
                status: 'active',
                phone: '(11) 91234-5678',
                job_title: 'Administrador do Sistema'
            };
            break;
        case '2':
            userData = {
                name: 'Ana Silva',
                email: 'ana.silva@voiceai.com',
                role: 'agent',
                status: 'active',
                phone: '(11) 98765-4321',
                job_title: 'Agente de Vendas'
            };
            break;
        case '3':
            userData = {
                name: 'Carlos Santos',
                email: 'carlos.santos@voiceai.com',
                role: 'agent',
                status: 'active',
                phone: '(11) 97654-3210',
                job_title: 'Agente de Vendas'
            };
            break;
        default:
            userData = {
                name: 'Usuário Desconhecido',
                email: 'usuario@voiceai.com',
                role: 'agent',
                status: 'active',
                phone: '',
                job_title: ''
            };
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'edit-user-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'edit-user-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="edit-user-modal-label">
                        <i class="fas fa-user-edit me-2"></i>
                        Editar Usuário
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="edit-user-form">
                        <input type="hidden" id="edit-user-id" value="${userId}">
                        
                        <div class="mb-3">
                            <label for="edit-user-name" class="form-label">Nome Completo *</label>
                            <input type="text" class="form-control" id="edit-user-name" value="${userData.name}" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="edit-user-email" class="form-label">Email *</label>
                            <input type="email" class="form-control" id="edit-user-email" value="${userData.email}" required>
                        </div>
                        
                        <div class="mb-3">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="edit-user-change-password">
                                <label class="form-check-label" for="edit-user-change-password">
                                    Alterar senha
                                </label>
                            </div>
                        </div>
                        
                        <div class="password-fields d-none">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="edit-user-password" class="form-label">Nova Senha</label>
                                    <input type="password" class="form-control" id="edit-user-password">
                                </div>
                                <div class="col-md-6">
                                    <label for="edit-user-confirm-password" class="form-label">Confirmar Nova Senha</label>
                                    <input type="password" class="form-control" id="edit-user-confirm-password">
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="edit-user-role" class="form-label">Função *</label>
                                <select class="form-select" id="edit-user-role" required>
                                    <option value="agent" ${userData.role === 'agent' ? 'selected' : ''}>Agente</option>
                                    <option value="manager" ${userData.role === 'manager' ? 'selected' : ''}>Gerente</option>
                                    <option value="admin" ${userData.role === 'admin' ? 'selected' : ''}>Administrador</option>
                                    <option value="superadmin" ${userData.role === 'superadmin' ? 'selected' : ''}>Superadmin</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="edit-user-status" class="form-label">Status *</label>
                                <select class="form-select" id="edit-user-status" required>
                                    <option value="active" ${userData.status === 'active' ? 'selected' : ''}>Ativo</option>
                                    <option value="inactive" ${userData.status === 'inactive' ? 'selected' : ''}>Inativo</option>
                                    <option value="suspended" ${userData.status === 'suspended' ? 'selected' : ''}>Suspenso</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="edit-user-phone" class="form-label">Telefone</label>
                            <input type="tel" class="form-control" id="edit-user-phone" value="${userData.phone}">
                        </div>
                        
                        <div class="mb-3">
                            <label for="edit-user-job-title" class="form-label">Cargo</label>
                            <input type="text" class="form-control" id="edit-user-job-title" value="${userData.job_title}">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger me-auto" id="delete-user-btn">Excluir Usuário</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="update-user-btn">Atualizar Usuário</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Toggle password fields
    document.getElementById('edit-user-change-password').addEventListener('change', function() {
        const passwordFields = document.querySelector('.password-fields');
        
        if (this.checked) {
            passwordFields.classList.remove('d-none');
        } else {
            passwordFields.classList.add('d-none');
        }
    });
    
    // Show modal
    try {
        const bootstrapModal = new bootstrap.Modal(document.getElementById('edit-user-modal'));
        bootstrapModal.show();
        
        // Store reference to modal for use in event handlers
        window.currentEditModal = bootstrapModal;
    } catch (error) {
        console.error('Error showing edit user modal:', error);
        // Fallback if bootstrap is not available
        const modalElement = document.getElementById('edit-user-modal');
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
        // Create simple modal close function for non-bootstrap fallback
        window.currentEditModal = {
            hide: function() {
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
                document.body.removeChild(modal);
            }
        };
    }
    
    // Update user button
    document.getElementById('update-user-btn').addEventListener('click', function() {
        // Get form data
        const name = document.getElementById('edit-user-name').value;
        const email = document.getElementById('edit-user-email').value;
        const changePassword = document.getElementById('edit-user-change-password').checked;
        
        // Simple validation
        if (!name || !email) {
            showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        if (changePassword) {
            const password = document.getElementById('edit-user-password').value;
            const confirmPassword = document.getElementById('edit-user-confirm-password').value;
            
            if (!password || !confirmPassword) {
                showToast('Por favor, preencha os campos de senha.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('As senhas não coincidem.', 'error');
                return;
            }
        }
        
        // In a real application, you would send the data to the API
        showToast('Usuário atualizado com sucesso!', 'success');
        
        // Close modal
        try { window.currentEditModal.hide(); } catch(e) { console.error("Error hiding edit modal:", e); }
    });
    
    // Delete user button
    document.getElementById('delete-user-btn').addEventListener('click', function() {
        // Confirm deletion
        if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        // In a real application, you would send a delete request to the API
        showToast('Usuário excluído com sucesso!', 'success');
        
        // Close modal
        try { window.currentEditModal.hide(); } catch(e) { console.error("Error hiding edit modal:", e); }
    });
    
    // Remove modal from DOM when hidden
    document.getElementById('edit-user-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

// Expose the function to the window object to avoid ESM issues
window.initAdmin = initAdmin;