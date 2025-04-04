/**
 * Lead Management component for VoiceAI platform
 */

class LeadManagement {
    constructor() {
        this.element = document.getElementById('leads-page');
        this.currentPage = 1;
        this.perPage = 10;
        this.currentFilters = {
            status: '',
            source: '',
            search: ''
        };
    }
    
    /**
     * Initialize lead management
     */
    async init() {
        if (!this.element) return;
        
        try {
            // Render lead management
            this.render();
            
            // Load leads
            await this.loadLeads();
            
            // Set up event handlers
            this.setupEventHandlers();
        } catch (error) {
            console.error('Error initializing lead management:', error);
        }
    }
    
    /**
     * Render lead management
     */
    render() {
        this.element.innerHTML = `
            <div class="lead-management-container">
                <h1 class="page-title">Gerenciar Leads</h1>
                
                <div class="table-toolbar">
                    <div class="table-filters">
                        <select id="status-filter" class="form-select">
                            <option value="">Todos os Status</option>
                            <option value="new">Novo</option>
                            <option value="contacted">Contatado</option>
                            <option value="qualified">Qualificado</option>
                            <option value="unqualified">Não Qualificado</option>
                        </select>
                        
                        <select id="source-filter" class="form-select">
                            <option value="">Todas as Fontes</option>
                            <option value="website">Website</option>
                            <option value="referral">Indicação</option>
                            <option value="email">Email</option>
                            <option value="social">Mídia Social</option>
                            <option value="manual">Manual</option>
                        </select>
                        
                        <div class="search-container">
                            <input type="text" id="leads-search" class="form-control" placeholder="Buscar leads...">
                            <button id="search-btn" class="btn btn-primary">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="table-actions">
                        <button id="export-leads-btn" class="btn btn-secondary">
                            <i class="fas fa-download"></i> Exportar
                        </button>
                        
                        <button id="new-lead-btn" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Novo Lead
                        </button>
                    </div>
                </div>
                
                <div class="leads-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Empresa</th>
                                <th>Email</th>
                                <th>Telefone</th>
                                <th>Status</th>
                                <th>Score</th>
                                <th>Fonte</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="leads-table-body">
                            <!-- Leads will be loaded here -->
                            <tr>
                                <td colspan="8" class="text-center">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Carregando...</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="pagination" id="leads-pagination">
                    <!-- Pagination will be loaded here -->
                </div>
            </div>
            
            <!-- Add/Edit Lead Modal -->
            <div class="modal fade" id="lead-modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="lead-modal-title">Novo Lead</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="lead-form">
                                <input type="hidden" id="lead-id">
                                
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
                                    <label for="lead-status" class="form-label">Status</label>
                                    <select class="form-select" id="lead-status">
                                        <option value="new">Novo</option>
                                        <option value="contacted">Contatado</option>
                                        <option value="qualified">Qualificado</option>
                                        <option value="unqualified">Não Qualificado</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="lead-source" class="form-label">Fonte</label>
                                    <select class="form-select" id="lead-source">
                                        <option value="website">Website</option>
                                        <option value="referral">Indicação</option>
                                        <option value="email">Email</option>
                                        <option value="social">Mídia Social</option>
                                        <option value="manual">Manual</option>
                                    </select>
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
        `;
    }
    
    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.currentFilters.status = statusFilter.value;
                this.currentPage = 1;
                this.loadLeads();
            });
        }
        
        // Source filter
        const sourceFilter = document.getElementById('source-filter');
        if (sourceFilter) {
            sourceFilter.addEventListener('change', () => {
                this.currentFilters.source = sourceFilter.value;
                this.currentPage = 1;
                this.loadLeads();
            });
        }
        
        // Search
        const searchBtn = document.getElementById('search-btn');
        const leadsSearch = document.getElementById('leads-search');
        if (searchBtn && leadsSearch) {
            searchBtn.addEventListener('click', () => {
                this.currentFilters.search = leadsSearch.value;
                this.currentPage = 1;
                this.loadLeads();
            });
            
            // Search on enter key
            leadsSearch.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    this.currentFilters.search = leadsSearch.value;
                    this.currentPage = 1;
                    this.loadLeads();
                }
            });
        }
        
        // Export leads
        const exportLeadsBtn = document.getElementById('export-leads-btn');
        if (exportLeadsBtn) {
            exportLeadsBtn.addEventListener('click', () => {
                this.exportLeads();
            });
        }
        
        // New lead
        const newLeadBtn = document.getElementById('new-lead-btn');
        if (newLeadBtn) {
            newLeadBtn.addEventListener('click', () => {
                this.openLeadModal();
            });
        }
        
        // Save lead
        const saveLeadBtn = document.getElementById('save-lead-btn');
        if (saveLeadBtn) {
            saveLeadBtn.addEventListener('click', () => {
                this.saveLead();
            });
        }
    }
    
    /**
     * Load leads
     */
    async loadLeads() {
        try {
            const leadsTableBody = document.getElementById('leads-table-body');
            if (!leadsTableBody) return;
            
            // Show loading
            leadsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Carregando...</span>
                        </div>
                    </td>
                </tr>
            `;
            
            // Load leads from store
            const params = {
                page: this.currentPage,
                perPage: this.perPage,
                ...this.currentFilters
            };
            
            const data = await window.store.loadLeads(params);
            
            // Update leads table
            this.updateLeadsTable(data.leads);
            
            // Update pagination
            this.updatePagination(data.pagination);
        } catch (error) {
            console.error('Error loading leads:', error);
            
            // Show error
            const leadsTableBody = document.getElementById('leads-table-body');
            if (leadsTableBody) {
                leadsTableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center text-danger">
                            <i class="fas fa-exclamation-circle"></i> Erro ao carregar leads. Tente novamente.
                        </td>
                    </tr>
                `;
            }
        }
    }
    
    /**
     * Update leads table
     */
    updateLeadsTable(leads) {
        const leadsTableBody = document.getElementById('leads-table-body');
        if (!leadsTableBody) return;
        
        if (!leads || leads.length === 0) {
            leadsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        Nenhum lead encontrado. 
                        <button id="create-first-lead-btn" class="btn btn-link">Criar seu primeiro lead</button>
                    </td>
                </tr>
            `;
            
            // Add event listener to create lead button
            const createFirstLeadBtn = document.getElementById('create-first-lead-btn');
            if (createFirstLeadBtn) {
                createFirstLeadBtn.addEventListener('click', () => {
                    this.openLeadModal();
                });
            }
            
            return;
        }
        
        // Generate table rows
        let html = '';
        leads.forEach(lead => {
            html += `
                <tr>
                    <td>${lead.name}</td>
                    <td>${lead.company || '-'}</td>
                    <td>${lead.email || '-'}</td>
                    <td>${lead.phone || '-'}</td>
                    <td>
                        <span class="status-badge ${lead.status}">
                            ${this.getStatusLabel(lead.status)}
                        </span>
                    </td>
                    <td>${lead.score}</td>
                    <td>${this.getSourceLabel(lead.source)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-lead" data-id="${lead.id}" title="Visualizar">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-lead" data-id="${lead.id}" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn call-lead" data-id="${lead.id}" title="Ligar">
                                <i class="fas fa-phone"></i>
                            </button>
                            <button class="action-btn delete-lead" data-id="${lead.id}" title="Excluir">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        leadsTableBody.innerHTML = html;
        
        // Add event listeners to action buttons
        this.setupActionButtons();
    }
    
    /**
     * Update pagination
     */
    updatePagination(pagination) {
        const paginationElement = document.getElementById('leads-pagination');
        if (!paginationElement) return;
        
        const { page, pages, total } = pagination;
        
        if (pages <= 1) {
            paginationElement.innerHTML = '';
            return;
        }
        
        // Generate pagination links
        let html = `
            <div class="pagination-info">
                Mostrando ${(page - 1) * this.perPage + 1} a ${Math.min(page * this.perPage, total)} de ${total} leads
            </div>
            <ul class="pagination-links">
        `;
        
        // Previous button
        html += `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <button class="page-link" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>
            </li>
        `;
        
        // Page links
        const maxPages = 5;
        const halfMaxPages = Math.floor(maxPages / 2);
        let startPage = Math.max(1, page - halfMaxPages);
        let endPage = Math.min(pages, startPage + maxPages - 1);
        
        if (endPage - startPage + 1 < maxPages) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === page ? 'active' : ''}">
                    <button class="page-link" data-page="${i}">${i}</button>
                </li>
            `;
        }
        
        // Next button
        html += `
            <li class="page-item ${page === pages ? 'disabled' : ''}">
                <button class="page-link" data-page="${page + 1}" ${page === pages ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </li>
        `;
        
        html += '</ul>';
        
        paginationElement.innerHTML = html;
        
        // Add event listeners to pagination links
        const pageLinks = paginationElement.querySelectorAll('.page-link:not([disabled])');
        pageLinks.forEach(link => {
            link.addEventListener('click', () => {
                const page = parseInt(link.getAttribute('data-page'));
                if (page) {
                    this.currentPage = page;
                    this.loadLeads();
                }
            });
        });
    }
    
    /**
     * Set up action buttons
     */
    setupActionButtons() {
        // View lead
        const viewButtons = document.querySelectorAll('.view-lead');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const leadId = button.getAttribute('data-id');
                this.viewLead(leadId);
            });
        });
        
        // Edit lead
        const editButtons = document.querySelectorAll('.edit-lead');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const leadId = button.getAttribute('data-id');
                this.editLead(leadId);
            });
        });
        
        // Call lead
        const callButtons = document.querySelectorAll('.call-lead');
        callButtons.forEach(button => {
            button.addEventListener('click', () => {
                const leadId = button.getAttribute('data-id');
                this.callLead(leadId);
            });
        });
        
        // Delete lead
        const deleteButtons = document.querySelectorAll('.delete-lead');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const leadId = button.getAttribute('data-id');
                this.deleteLead(leadId);
            });
        });
    }
    
    /**
     * Open lead modal
     */
    openLeadModal(lead = null) {
        // Get modal elements
        const modal = document.getElementById('lead-modal');
        const modalTitle = document.getElementById('lead-modal-title');
        const leadId = document.getElementById('lead-id');
        const leadName = document.getElementById('lead-name');
        const leadCompany = document.getElementById('lead-company');
        const leadEmail = document.getElementById('lead-email');
        const leadPhone = document.getElementById('lead-phone');
        const leadStatus = document.getElementById('lead-status');
        const leadSource = document.getElementById('lead-source');
        
        // Set modal title and form fields
        if (lead) {
            modalTitle.textContent = 'Editar Lead';
            leadId.value = lead.id;
            leadName.value = lead.name;
            leadCompany.value = lead.company || '';
            leadEmail.value = lead.email || '';
            leadPhone.value = lead.phone || '';
            leadStatus.value = lead.status;
            leadSource.value = lead.source;
        } else {
            modalTitle.textContent = 'Novo Lead';
            leadId.value = '';
            leadName.value = '';
            leadCompany.value = '';
            leadEmail.value = '';
            leadPhone.value = '';
            leadStatus.value = 'new';
            leadSource.value = 'manual';
        }
        
        // Open modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }
    
    /**
     * Save lead
     */
    async saveLead() {
        try {
            // Get form data
            const leadId = document.getElementById('lead-id').value;
            const leadName = document.getElementById('lead-name').value;
            const leadCompany = document.getElementById('lead-company').value;
            const leadEmail = document.getElementById('lead-email').value;
            const leadPhone = document.getElementById('lead-phone').value;
            const leadStatus = document.getElementById('lead-status').value;
            const leadSource = document.getElementById('lead-source').value;
            
            // Validate form
            if (!leadName) {
                alert('Nome é obrigatório');
                return;
            }
            
            // Prepare lead data
            const leadData = {
                name: leadName,
                company: leadCompany,
                email: leadEmail,
                phone: leadPhone,
                status: leadStatus,
                source: leadSource
            };
            
            let response;
            
            if (leadId) {
                // Update existing lead
                response = await ApiService.updateLead(leadId, leadData);
                window.store.setNotification('Lead atualizado com sucesso', 'success');
            } else {
                // Create new lead
                response = await ApiService.createLead(leadData);
                window.store.setNotification('Lead criado com sucesso', 'success');
            }
            
            // Close modal
            const modal = document.getElementById('lead-modal');
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            
            // Reload leads
            this.loadLeads();
        } catch (error) {
            console.error('Error saving lead:', error);
            window.store.setNotification('Erro ao salvar lead', 'danger');
        }
    }
    
    /**
     * View lead
     */
    async viewLead(leadId) {
        try {
            // Load lead details
            const lead = await ApiService.getLead(leadId);
            
            // TODO: Show lead details
        } catch (error) {
            console.error('Error viewing lead:', error);
            window.store.setNotification('Erro ao carregar detalhes do lead', 'danger');
        }
    }
    
    /**
     * Edit lead
     */
    async editLead(leadId) {
        try {
            // Load lead details
            const lead = await ApiService.getLead(leadId);
            
            // Open lead modal with lead data
            this.openLeadModal(lead);
        } catch (error) {
            console.error('Error editing lead:', error);
            window.store.setNotification('Erro ao carregar detalhes do lead', 'danger');
        }
    }
    
    /**
     * Call lead
     */
    callLead(leadId) {
        // Show new call modal
        const modal = document.getElementById('new-call-modal');
        const leadSelect = document.getElementById('call-lead-select');
        
        // Select the lead in the dropdown
        if (leadSelect) {
            leadSelect.value = leadId;
        }
        
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }
    
    /**
     * Delete lead
     */
    async deleteLead(leadId) {
        // Confirm deletion
        if (!confirm('Tem certeza que deseja excluir este lead?')) {
            return;
        }
        
        try {
            // Delete lead
            await ApiService.deleteLead(leadId);
            
            // Show notification
            window.store.setNotification('Lead excluído com sucesso', 'success');
            
            // Reload leads
            this.loadLeads();
        } catch (error) {
            console.error('Error deleting lead:', error);
            window.store.setNotification('Erro ao excluir lead', 'danger');
        }
    }
    
    /**
     * Export leads
     */
    exportLeads() {
        try {
            // Export leads
            ApiService.exportLeads(this.currentFilters);
            
            // Show notification
            window.store.setNotification('Exportação iniciada. O download começará em breve.', 'info');
        } catch (error) {
            console.error('Error exporting leads:', error);
            window.store.setNotification('Erro ao exportar leads', 'danger');
        }
    }
    
    /**
     * Get status label
     */
    getStatusLabel(status) {
        switch (status) {
            case 'new':
                return 'Novo';
            case 'contacted':
                return 'Contatado';
            case 'qualified':
                return 'Qualificado';
            case 'unqualified':
                return 'Não Qualificado';
            default:
                return status;
        }
    }
    
    /**
     * Get source label
     */
    getSourceLabel(source) {
        switch (source) {
            case 'website':
                return 'Website';
            case 'referral':
                return 'Indicação';
            case 'email':
                return 'Email';
            case 'social':
                return 'Mídia Social';
            case 'manual':
                return 'Manual';
            default:
                return source;
        }
    }
}

// Export the lead management component
window.LeadManagement = new LeadManagement();
