// frontend/js/components/CRM/LeadBulkActions.js
// Adicione este componente ao seu CRM existente

class LeadBulkActions {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            onSuccess: () => {},
            onError: () => {},
            ...options
        };
        
        this.selectedLeads = [];
        this.init();
    }
    
    init() {
        this.render();
        this.loadResources();
        this.setupListeners();
    }
    
    setSelectedLeads(leads) {
        this.selectedLeads = leads;
        this.updateButtonState();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="bulk-actions-container mb-3">
                <div class="btn-group">
                    <button id="bulk-action-btn" class="btn btn-primary dropdown-toggle" 
                            data-bs-toggle="dropdown" disabled>
                        Ações em massa <span id="selected-count"></span>
                    </button>
                    <ul class="dropdown-menu">
                        <li><h6 class="dropdown-header">Marcações</h6></li>
                        <li><a class="dropdown-item" href="#" data-action="tag">Adicionar Tag</a></li>
                        <li><a class="dropdown-item" href="#" data-action="remove_tag">Remover Tag</a></li>
                        <li><a class="dropdown-item" href="#" data-action="temperature">Definir Temperatura</a></li>
                        <li><div class="dropdown-divider"></div></li>
                        <li><h6 class="dropdown-header">Comunicação</h6></li>
                        <li><a class="dropdown-item" href="#" data-action="call">Ligar com IA</a></li>
                        <li><a class="dropdown-item" href="#" data-action="email">Enviar Email</a></li>
                        <li><a class="dropdown-item" href="#" data-action="sms">Enviar SMS</a></li>
                    </ul>
                </div>
            </div>
            
            <!-- Modais -->
            <div class="modal fade" id="tag-modal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Adicionar Tag</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Selecione a Tag:</label>
                                <select id="tag-select" class="form-select">
                                    <option value="">Carregando...</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="confirm-tag-btn">Aplicar</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal fade" id="temperature-modal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Definir Temperatura</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Selecione a Temperatura:</label>
                                <select id="temperature-select" class="form-select">
                                    <option value="hot">Quente (Hot)</option>
                                    <option value="warm">Morno (Warm)</option>
                                    <option value="cold">Frio (Cold)</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="confirm-temperature-btn">Aplicar</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal fade" id="call-modal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Agendar Ligações</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Script de Chamada:</label>
                                <select id="call-template-select" class="form-select">
                                    <option value="">Carregando...</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Data e Hora:</label>
                                <input type="datetime-local" id="call-datetime" class="form-control">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="confirm-call-btn">Agendar</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal fade" id="email-modal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Enviar Emails</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Template de Email:</label>
                                <select id="email-template-select" class="form-select">
                                    <option value="">Carregando...</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="confirm-email-btn">Enviar</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal fade" id="sms-modal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Enviar SMS</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Template de SMS:</label>
                                <select id="sms-template-select" class="form-select">
                                    <option value="">Carregando...</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="confirm-sms-btn">Enviar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    updateButtonState() {
        const btn = document.getElementById('bulk-action-btn');
        const countSpan = document.getElementById('selected-count');
        
        if (this.selectedLeads.length > 0) {
            btn.removeAttribute('disabled');
            countSpan.textContent = ` (${this.selectedLeads.length})`;
        } else {
            btn.setAttribute('disabled', 'disabled');
            countSpan.textContent = '';
        }
    }
    
    async loadResources() {
        try {
            // Carregar tags
            const tagsResponse = await fetch('/api/automations/tags', {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            
            if (tagsResponse.ok) {
                const tags = await tagsResponse.json();
                
                const tagSelect = document.getElementById('tag-select');
                tagSelect.innerHTML = tags.map(tag => 
                    `<option value="${tag.id}">${tag.name}</option>`
                ).join('');
            }
            
            // Carregar templates de chamada
            const callTemplatesResponse = await fetch('/api/automations/templates?type=call', {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            
            if (callTemplatesResponse.ok) {
                const templates = await callTemplatesResponse.json();
                
                const templateSelect = document.getElementById('call-template-select');
                templateSelect.innerHTML = templates.map(template => 
                    `<option value="${template.id}">${template.name}</option>`
                ).join('');
                
                if (templates.length === 0) {
                    templateSelect.innerHTML = '<option value="">Nenhum script disponível</option>';
                }
            }
            
            // Carregar templates de email
            const emailTemplatesResponse = await fetch('/api/automations/templates?type=email', {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            
            if (emailTemplatesResponse.ok) {
                const templates = await emailTemplatesResponse.json();
                
                const templateSelect = document.getElementById('email-template-select');
                templateSelect.innerHTML = templates.map(template => 
                    `<option value="${template.id}">${template.name} - ${template.subject}</option>`
                ).join('');
                
                if (templates.length === 0) {
                    templateSelect.innerHTML = '<option value="">Nenhum template disponível</option>';
                }
            }
            
            // Carregar templates de SMS
            const smsTemplatesResponse = await fetch('/api/automations/templates?type=sms', {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            
            if (smsTemplatesResponse.ok) {
                const templates = await smsTemplatesResponse.json();
                
                const templateSelect = document.getElementById('sms-template-select');
                templateSelect.innerHTML = templates.map(template => 
                    `<option value="${template.id}">${template.name}</option>`
                ).join('');
                
                if (templates.length === 0) {
                    templateSelect.innerHTML = '<option value="">Nenhum template disponível</option>';
                }
            }
            
        } catch (error) {
            console.error('Erro ao carregar recursos:', error);
            this.options.onError('Erro ao carregar recursos. Por favor, recarregue a página.');
        }
    }
    
    setupListeners() {
        // Botões de ações
        document.querySelectorAll('[data-action]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const action = e.target.dataset.action;
                this.handleAction(action);
            });
        });
        
        // Botões de confirmação de modais
        document.getElementById('confirm-tag-btn').addEventListener('click', () => {
            this.executeBulkAction('tag', {
                tag_id: document.getElementById('tag-select').value
            });
        });
        
        document.getElementById('confirm-temperature-btn').addEventListener('click', () => {
            this.executeBulkAction('temperature', {
                temperature: document.getElementById('temperature-select').value
            });
        });
        
        document.getElementById('confirm-call-btn').addEventListener('click', () => {
            this.executeBulkAction('call', {
                template_id: document.getElementById('call-template-select').value,
                scheduled_for: document.getElementById('call-datetime').value
            });
        });
        
        document.getElementById('confirm-email-btn').addEventListener('click', () => {
            this.executeBulkAction('email', {
                template_id: document.getElementById('email-template-select').value
            });
        });
        
        document.getElementById('confirm-sms-btn').addEventListener('click', () => {
            this.executeBulkAction('sms', {
                template_id: document.getElementById('sms-template-select').value
            });
        });
    }
    
    handleAction(action) {
        if (this.selectedLeads.length === 0) {
            this.options.onError('Selecione pelo menos um lead');
            return;
        }
        
        switch (action) {
            case 'tag':
                this.openModal('tag-modal');
                break;
            case 'remove_tag':
                this.openModal('tag-modal', 'Remover Tag');
                break;
            case 'temperature':
                this.openModal('temperature-modal');
                break;
            case 'call':
                this.openModal('call-modal');
                this.setDefaultDateTime();
                break;
            case 'email':
                this.openModal('email-modal');
                break;
            case 'sms':
                this.openModal('sms-modal');
                break;
        }
    }
    
    openModal(modalId, customTitle = null) {
        const modal = document.getElementById(modalId);
        
        if (customTitle) {
            modal.querySelector('.modal-title').textContent = customTitle;
        }
        
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }
    
    setDefaultDateTime() {
        // Definir data/hora padrão para daqui a 30 minutos
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30);
        
        const dateTimeInput = document.getElementById('call-datetime');
        dateTimeInput.value = now.toISOString().slice(0, 16);
    }
    
    async executeBulkAction(action, params) {
        try {
            const response = await fetch('/api/automations/bulk-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    action,
                    leads: this.selectedLeads,
                    ...params
                })
            });
            
            const data = await response.json();
            
            // Fechar todos os modais
            document.querySelectorAll('.modal').forEach(modal => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            });
            
            if (response.ok) {
                this.options.onSuccess(data.message);
            } else {
                this.options.onError(data.error || 'Erro ao executar ação');
            }
            
        } catch (error) {
            console.error('Erro na ação em massa:', error);
            this.options.onError('Falha na comunicação com o servidor');
        }
    }
}

// Usage example:
/*
const bulkActions = new LeadBulkActions(
    document.getElementById('bulk-actions-container'), 
    {
        onSuccess: (message) => { 
            showToast('success', message);
            reloadLeads();
        },
        onError: (error) => {
            showToast('error', error);
        }
    }
);

// When leads are selected:
bulkActions.setSelectedLeads([1, 2, 3]);
*/
