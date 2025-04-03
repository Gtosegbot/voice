/**
 * Lead Management Component
 * Manages leads, lead details, and lead actions
 */
class LeadManagementComponent {
  constructor(app) {
    this.app = app;
    this.store = app.store;
    this.apiService = app.apiService;
    this.leads = [];
    this.currentLead = null;
    this.isLoading = false;
    this.filter = {
      status: 'all',
      agent: 'all',
      campaign: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      searchQuery: ''
    };
    this.agents = [];
    this.campaigns = [];
    this.pagination = {
      page: 1,
      limit: 20,
      total: 0
    };
  }
  
  /**
   * Fetch leads from the API
   */
  async fetchLeads() {
    try {
      this.isLoading = true;
      
      const queryParams = new URLSearchParams();
      queryParams.append('page', this.pagination.page);
      queryParams.append('limit', this.pagination.limit);
      
      if (this.filter.status !== 'all') {
        queryParams.append('status', this.filter.status);
      }
      
      if (this.filter.agent !== 'all') {
        queryParams.append('agentId', this.filter.agent);
      }
      
      if (this.filter.campaign !== 'all') {
        queryParams.append('campaignId', this.filter.campaign);
      }
      
      if (this.filter.searchQuery) {
        queryParams.append('search', this.filter.searchQuery);
      }
      
      queryParams.append('sortBy', this.filter.sortBy);
      queryParams.append('sortOrder', this.filter.sortOrder);
      
      const data = await this.apiService.get(`/leads?${queryParams.toString()}`);
      
      this.leads = data.leads;
      this.pagination.total = data.total;
      this.isLoading = false;
      
      return data;
    } catch (error) {
      console.error('Error fetching leads:', error);
      this.isLoading = false;
      return null;
    }
  }
  
  /**
   * Fetch agents from the API
   */
  async fetchAgents() {
    try {
      const data = await this.apiService.get('/users?role=agent');
      this.agents = data.users;
      return data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      return null;
    }
  }
  
  /**
   * Fetch campaigns from the API
   */
  async fetchCampaigns() {
    try {
      const data = await this.apiService.get('/campaigns');
      this.campaigns = data.campaigns;
      return data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return null;
    }
  }
  
  /**
   * Render the lead management component
   */
  async render(container) {
    // Show loading state
    container.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading leads data...</p>
      </div>
    `;
    
    // Fetch data
    await Promise.all([
      this.fetchLeads(),
      this.fetchAgents(),
      this.fetchCampaigns()
    ]);
    
    // Render the lead management
    container.innerHTML = `
      <div class="lead-management-container">
        <!-- Toolbar -->
        <div class="lead-toolbar">
          <div class="lead-filter">
            <div class="form-group">
              <input type="text" class="form-control" id="lead-search" placeholder="Search leads..." value="${this.filter.searchQuery}">
            </div>
            
            <div class="form-group">
              <select class="form-select" id="status-filter">
                <option value="all" ${this.filter.status === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="new" ${this.filter.status === 'new' ? 'selected' : ''}>New</option>
                <option value="contacted" ${this.filter.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                <option value="qualified" ${this.filter.status === 'qualified' ? 'selected' : ''}>Qualified</option>
                <option value="unqualified" ${this.filter.status === 'unqualified' ? 'selected' : ''}>Unqualified</option>
              </select>
            </div>
            
            <div class="form-group">
              <select class="form-select" id="agent-filter">
                <option value="all" ${this.filter.agent === 'all' ? 'selected' : ''}>All Agents</option>
                ${this.agents.map(agent => `
                  <option value="${agent.id}" ${this.filter.agent === agent.id.toString() ? 'selected' : ''}>
                    ${agent.name}
                  </option>
                `).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <select class="form-select" id="campaign-filter">
                <option value="all" ${this.filter.campaign === 'all' ? 'selected' : ''}>All Campaigns</option>
                ${this.campaigns.map(campaign => `
                  <option value="${campaign.id}" ${this.filter.campaign === campaign.id.toString() ? 'selected' : ''}>
                    ${campaign.name}
                  </option>
                `).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <button class="btn btn-primary" id="apply-filters">
                <i data-feather="filter"></i>
                Apply Filters
              </button>
            </div>
          </div>
          
          <div class="lead-actions">
            <button class="btn btn-outline" id="export-leads">
              <i data-feather="download"></i>
              Export
            </button>
            
            <button class="btn btn-primary" id="add-lead">
              <i data-feather="user-plus"></i>
              Add Lead
            </button>
          </div>
        </div>
        
        <!-- Leads Table -->
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>
                      <div class="sort-header" data-sort="name">
                        <span>Name</span>
                        <i data-feather="${this.getSortIcon('name')}"></i>
                      </div>
                    </th>
                    <th>
                      <div class="sort-header" data-sort="company">
                        <span>Company</span>
                        <i data-feather="${this.getSortIcon('company')}"></i>
                      </div>
                    </th>
                    <th>
                      <div class="sort-header" data-sort="email">
                        <span>Email</span>
                        <i data-feather="${this.getSortIcon('email')}"></i>
                      </div>
                    </th>
                    <th>
                      <div class="sort-header" data-sort="phone">
                        <span>Phone</span>
                        <i data-feather="${this.getSortIcon('phone')}"></i>
                      </div>
                    </th>
                    <th>
                      <div class="sort-header" data-sort="status">
                        <span>Status</span>
                        <i data-feather="${this.getSortIcon('status')}"></i>
                      </div>
                    </th>
                    <th>
                      <div class="sort-header" data-sort="score">
                        <span>Score</span>
                        <i data-feather="${this.getSortIcon('score')}"></i>
                      </div>
                    </th>
                    <th>
                      <div class="sort-header" data-sort="source">
                        <span>Source</span>
                        <i data-feather="${this.getSortIcon('source')}"></i>
                      </div>
                    </th>
                    <th>
                      <div class="sort-header" data-sort="assignedTo">
                        <span>Assigned To</span>
                        <i data-feather="${this.getSortIcon('assignedTo')}"></i>
                      </div>
                    </th>
                    <th>
                      <div class="sort-header" data-sort="createdAt">
                        <span>Created</span>
                        <i data-feather="${this.getSortIcon('createdAt')}"></i>
                      </div>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.renderLeadsTable()}
                </tbody>
              </table>
            </div>
            
            <!-- Pagination -->
            <div class="pagination-container">
              <div class="pagination-info">
                Showing ${Math.min(1 + (this.pagination.page - 1) * this.pagination.limit, this.pagination.total)} to 
                ${Math.min(this.pagination.page * this.pagination.limit, this.pagination.total)} of 
                ${this.pagination.total} leads
              </div>
              
              <div class="pagination">
                ${this.renderPagination()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Initialize feather icons
    feather.replace();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Render leads table
   */
  renderLeadsTable() {
    if (this.isLoading) {
      return `
        <tr>
          <td colspan="10" class="text-center">
            <div class="spinner-sm"></div>
            Loading leads...
          </td>
        </tr>
      `;
    }
    
    if (!this.leads || this.leads.length === 0) {
      return `
        <tr>
          <td colspan="10" class="text-center">
            No leads found matching your filters
          </td>
        </tr>
      `;
    }
    
    return this.leads.map(lead => `
      <tr>
        <td>
          <a href="#" class="lead-name" data-lead-id="${lead.id}">${lead.name}</a>
        </td>
        <td>${lead.company || '-'}</td>
        <td>${lead.email || '-'}</td>
        <td>${lead.phone || '-'}</td>
        <td>
          <span class="status-badge ${this.getLeadStatusClass(lead.status)}">
            ${lead.status}
          </span>
        </td>
        <td>${lead.score}</td>
        <td>${lead.source || '-'}</td>
        <td>${lead.assignedTo || '-'}</td>
        <td>${this.formatDate(lead.createdAt)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-outline" data-action="view" data-lead-id="${lead.id}" title="View Details">
              <i data-feather="eye" style="width: 16px; height: 16px;"></i>
            </button>
            <button class="btn btn-sm btn-outline" data-action="edit" data-lead-id="${lead.id}" title="Edit Lead">
              <i data-feather="edit" style="width: 16px; height: 16px;"></i>
            </button>
            <button class="btn btn-sm btn-outline" data-action="call" data-lead-id="${lead.id}" title="Call Lead">
              <i data-feather="phone" style="width: 16px; height: 16px;"></i>
            </button>
            <button class="btn btn-sm btn-outline danger" data-action="delete" data-lead-id="${lead.id}" title="Delete Lead">
              <i data-feather="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }
  
  /**
   * Render pagination
   */
  renderPagination() {
    const totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
    
    if (totalPages <= 1) {
      return '';
    }
    
    let pages = [];
    const currentPage = this.pagination.page;
    
    // Previous page
    pages.push(`
      <div class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a href="#" class="page-link" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
          <i data-feather="chevron-left" style="width: 16px; height: 16px;"></i>
        </a>
      </div>
    `);
    
    // First page
    pages.push(`
      <div class="page-item ${currentPage === 1 ? 'active' : ''}">
        <a href="#" class="page-link" data-page="1">1</a>
      </div>
    `);
    
    // Ellipsis after first page
    if (currentPage > 3) {
      pages.push(`
        <div class="page-item disabled">
          <span class="page-link">...</span>
        </div>
      `);
    }
    
    // Pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue;
      
      pages.push(`
        <div class="page-item ${currentPage === i ? 'active' : ''}">
          <a href="#" class="page-link" data-page="${i}">${i}</a>
        </div>
      `);
    }
    
    // Ellipsis before last page
    if (currentPage < totalPages - 2) {
      pages.push(`
        <div class="page-item disabled">
          <span class="page-link">...</span>
        </div>
      `);
    }
    
    // Last page
    if (totalPages > 1) {
      pages.push(`
        <div class="page-item ${currentPage === totalPages ? 'active' : ''}">
          <a href="#" class="page-link" data-page="${totalPages}">${totalPages}</a>
        </div>
      `);
    }
    
    // Next page
    pages.push(`
      <div class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a href="#" class="page-link" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
          <i data-feather="chevron-right" style="width: 16px; height: 16px;"></i>
        </a>
      </div>
    `);
    
    return pages.join('');
  }
  
  /**
   * Render lead details modal
   */
  renderLeadDetailsModal(lead) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'lead-details-modal';
    
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Lead Details</h3>
          <button class="modal-close" id="close-lead-details">
            <i data-feather="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="lead-details">
            <div class="lead-header">
              <h2 class="lead-name">${lead.name}</h2>
              <span class="lead-company">${lead.company || '-'}</span>
              <div class="lead-score">${lead.score}</div>
            </div>
            
            <div class="lead-contact-info">
              <div class="info-item">
                <i data-feather="mail"></i>
                <span>${lead.email || '-'}</span>
              </div>
              <div class="info-item">
                <i data-feather="phone"></i>
                <span>${lead.phone || '-'}</span>
              </div>
            </div>
            
            <div class="lead-info-grid">
              <div class="info-group">
                <label>Status</label>
                <div class="info-value">
                  <span class="status-badge ${this.getLeadStatusClass(lead.status)}">
                    ${lead.status}
                  </span>
                </div>
              </div>
              
              <div class="info-group">
                <label>Source</label>
                <div class="info-value">${lead.source || '-'}</div>
              </div>
              
              <div class="info-group">
                <label>Assigned To</label>
                <div class="info-value">${lead.assignedTo || '-'}</div>
              </div>
              
              <div class="info-group">
                <label>Campaign</label>
                <div class="info-value">${lead.campaign || '-'}</div>
              </div>
              
              <div class="info-group">
                <label>Created</label>
                <div class="info-value">${this.formatDate(lead.createdAt)}</div>
              </div>
              
              <div class="info-group">
                <label>Last Activity</label>
                <div class="info-value">${this.formatDate(lead.lastActivity)}</div>
              </div>
            </div>
            
            <div class="lead-tabs">
              <div class="tabs">
                <div class="tab-item active" data-tab="conversations">Conversations</div>
                <div class="tab-item" data-tab="notes">Notes</div>
                <div class="tab-item" data-tab="tasks">Tasks</div>
              </div>
              
              <div class="tab-content">
                <div class="tab-pane active" id="conversations-tab">
                  <div class="empty-state">
                    <i data-feather="message-square"></i>
                    <h3>No Conversations Yet</h3>
                    <p>Start a conversation with this lead via call or message</p>
                    <div class="empty-state-actions">
                      <button class="btn btn-primary">
                        <i data-feather="phone"></i>
                        Call
                      </button>
                      <button class="btn btn-outline">
                        <i data-feather="message-square"></i>
                        Message
                      </button>
                    </div>
                  </div>
                </div>
                
                <div class="tab-pane" id="notes-tab" style="display: none;">
                  <div class="empty-state">
                    <i data-feather="file-text"></i>
                    <h3>No Notes Yet</h3>
                    <p>Add notes about this lead to keep track of important information</p>
                    <div class="empty-state-actions">
                      <button class="btn btn-primary">
                        <i data-feather="plus"></i>
                        Add Note
                      </button>
                    </div>
                  </div>
                </div>
                
                <div class="tab-pane" id="tasks-tab" style="display: none;">
                  <div class="empty-state">
                    <i data-feather="check-square"></i>
                    <h3>No Tasks Yet</h3>
                    <p>Create tasks to organize your follow-ups with this lead</p>
                    <div class="empty-state-actions">
                      <button class="btn btn-primary">
                        <i data-feather="plus"></i>
                        Add Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="edit-lead-btn" data-lead-id="${lead.id}">
            <i data-feather="edit"></i>
            Edit Lead
          </button>
          <button class="btn btn-primary" id="call-lead-btn" data-lead-id="${lead.id}">
            <i data-feather="phone"></i>
            Call Lead
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize feather icons
    feather.replace();
    
    // Set up event listeners for modal
    document.getElementById('close-lead-details')?.addEventListener('click', () => {
      modal.remove();
    });
    
    document.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show the corresponding tab pane
        const tabName = tab.dataset.tab;
        document.querySelectorAll('.tab-pane').forEach(pane => {
          pane.style.display = 'none';
          pane.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).style.display = 'block';
        document.getElementById(`${tabName}-tab`).classList.add('active');
      });
    });
    
    document.getElementById('edit-lead-btn')?.addEventListener('click', () => {
      modal.remove();
      this.showEditLeadModal(lead);
    });
    
    document.getElementById('call-lead-btn')?.addEventListener('click', () => {
      modal.remove();
      this.callLead(lead.id);
    });
  }
  
  /**
   * Render add/edit lead modal
   */
  showAddEditLeadModal(lead = null) {
    const isEdit = !!lead;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'add-edit-lead-modal';
    
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit Lead' : 'Add New Lead'}</h3>
          <button class="modal-close" id="close-add-edit-lead">
            <i data-feather="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="lead-form">
            <div class="form-group">
              <label for="lead-name" class="form-label">Name *</label>
              <input type="text" id="lead-name" class="form-control" value="${isEdit ? lead.name : ''}" required>
            </div>
            
            <div class="form-group">
              <label for="lead-company" class="form-label">Company</label>
              <input type="text" id="lead-company" class="form-control" value="${isEdit ? lead.company || '' : ''}">
            </div>
            
            <div class="form-group">
              <label for="lead-email" class="form-label">Email</label>
              <input type="email" id="lead-email" class="form-control" value="${isEdit ? lead.email || '' : ''}">
            </div>
            
            <div class="form-group">
              <label for="lead-phone" class="form-label">Phone</label>
              <input type="tel" id="lead-phone" class="form-control" value="${isEdit ? lead.phone || '' : ''}">
            </div>
            
            <div class="form-group">
              <label for="lead-status" class="form-label">Status</label>
              <select id="lead-status" class="form-select">
                <option value="new" ${isEdit && lead.status === 'new' ? 'selected' : ''}>New</option>
                <option value="contacted" ${isEdit && lead.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                <option value="qualified" ${isEdit && lead.status === 'qualified' ? 'selected' : ''}>Qualified</option>
                <option value="unqualified" ${isEdit && lead.status === 'unqualified' ? 'selected' : ''}>Unqualified</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="lead-source" class="form-label">Source</label>
              <select id="lead-source" class="form-select">
                <option value="">-- Select Source --</option>
                <option value="website" ${isEdit && lead.source === 'website' ? 'selected' : ''}>Website</option>
                <option value="referral" ${isEdit && lead.source === 'referral' ? 'selected' : ''}>Referral</option>
                <option value="social_media" ${isEdit && lead.source === 'social_media' ? 'selected' : ''}>Social Media</option>
                <option value="email" ${isEdit && lead.source === 'email' ? 'selected' : ''}>Email Campaign</option>
                <option value="cold_call" ${isEdit && lead.source === 'cold_call' ? 'selected' : ''}>Cold Call</option>
                <option value="event" ${isEdit && lead.source === 'event' ? 'selected' : ''}>Event</option>
                <option value="other" ${isEdit && lead.source === 'other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="lead-agent" class="form-label">Assign To</label>
              <select id="lead-agent" class="form-select">
                <option value="">-- Unassigned --</option>
                ${this.agents.map(agent => `
                  <option value="${agent.id}" ${isEdit && lead.assignedTo === agent.name ? 'selected' : ''}>
                    ${agent.name}
                  </option>
                `).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label for="lead-campaign" class="form-label">Campaign</label>
              <select id="lead-campaign" class="form-select">
                <option value="">-- No Campaign --</option>
                ${this.campaigns.map(campaign => `
                  <option value="${campaign.id}" ${isEdit && lead.campaign === campaign.name ? 'selected' : ''}>
                    ${campaign.name}
                  </option>
                `).join('')}
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="cancel-lead-btn">Cancel</button>
          <button class="btn btn-primary" id="save-lead-btn">
            ${isEdit ? 'Update Lead' : 'Add Lead'}
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize feather icons
    feather.replace();
    
    // Set up event listeners for modal
    document.getElementById('close-add-edit-lead')?.addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('cancel-lead-btn')?.addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('save-lead-btn')?.addEventListener('click', () => {
      this.saveLead(isEdit ? lead.id : null);
    });
  }
  
  /**
   * Save lead (add or update)
   */
  async saveLead(leadId = null) {
    const isEdit = !!leadId;
    
    // Get form values
    const name = document.getElementById('lead-name')?.value;
    const company = document.getElementById('lead-company')?.value;
    const email = document.getElementById('lead-email')?.value;
    const phone = document.getElementById('lead-phone')?.value;
    const status = document.getElementById('lead-status')?.value;
    const source = document.getElementById('lead-source')?.value;
    const agentId = document.getElementById('lead-agent')?.value;
    const campaignId = document.getElementById('lead-campaign')?.value;
    
    if (!name) {
      alert('Lead name is required');
      return;
    }
    
    // Prepare lead data
    const leadData = {
      name,
      company,
      email,
      phone,
      status,
      source,
      agentId: agentId || null,
      campaignId: campaignId || null
    };
    
    try {
      let response;
      
      if (isEdit) {
        // Update existing lead
        response = await this.apiService.put(`/leads/${leadId}`, leadData);
      } else {
        // Create new lead
        response = await this.apiService.post('/leads', leadData);
      }
      
      // Show success message
      // TODO: Implement toast notification
      
      // Close modal
      document.getElementById('add-edit-lead-modal')?.remove();
      
      // Refresh leads
      await this.fetchLeads();
      this.render(document.getElementById('view-container'));
    } catch (error) {
      console.error('Error saving lead:', error);
      alert(`Failed to ${isEdit ? 'update' : 'add'} lead: ${error.message}`);
    }
  }
  
  /**
   * Delete lead
   */
  async deleteLead(leadId) {
    if (!leadId) return;
    
    const confirmed = confirm('Are you sure you want to delete this lead?');
    if (!confirmed) return;
    
    try {
      await this.apiService.delete(`/leads/${leadId}`);
      
      // Show success message
      // TODO: Implement toast notification
      
      // Refresh leads
      await this.fetchLeads();
      this.render(document.getElementById('view-container'));
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert(`Failed to delete lead: ${error.message}`);
    }
  }
  
  /**
   * Call a lead
   */
  async callLead(leadId) {
    if (!leadId) return;
    
    try {
      // Initiate call via API
      const response = await this.apiService.post(`/calls/outbound`, {
        leadId
      });
      
      // TODO: Implement call UI
      alert(`Calling lead... (Call ID: ${response.callId})`);
      
      // Navigate to conversation view
      this.app.store.dispatch({ type: 'SET_CURRENT_VIEW', payload: 'conversations' });
    } catch (error) {
      console.error('Error calling lead:', error);
      alert(`Failed to initiate call: ${error.message}`);
    }
  }
  
  /**
   * Export leads
   */
  async exportLeads() {
    try {
      const queryParams = new URLSearchParams();
      
      if (this.filter.status !== 'all') {
        queryParams.append('status', this.filter.status);
      }
      
      if (this.filter.agent !== 'all') {
        queryParams.append('agentId', this.filter.agent);
      }
      
      if (this.filter.campaign !== 'all') {
        queryParams.append('campaignId', this.filter.campaign);
      }
      
      if (this.filter.searchQuery) {
        queryParams.append('search', this.filter.searchQuery);
      }
      
      const response = await this.apiService.get(`/leads/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting leads:', error);
      alert(`Failed to export leads: ${error.message}`);
    }
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Apply filters button
    document.getElementById('apply-filters')?.addEventListener('click', () => {
      this.filter.status = document.getElementById('status-filter')?.value || 'all';
      this.filter.agent = document.getElementById('agent-filter')?.value || 'all';
      this.filter.campaign = document.getElementById('campaign-filter')?.value || 'all';
      this.filter.searchQuery = document.getElementById('lead-search')?.value || '';
      this.pagination.page = 1;
      
      this.fetchLeads().then(() => {
        this.render(document.getElementById('view-container'));
      });
    });
    
    // Lead search input
    document.getElementById('lead-search')?.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.filter.searchQuery = e.target.value;
        this.pagination.page = 1;
        
        this.fetchLeads().then(() => {
          this.render(document.getElementById('view-container'));
        });
      }
    });
    
    // Sort headers
    document.querySelectorAll('.sort-header').forEach(header => {
      header.addEventListener('click', () => {
        const sortBy = header.dataset.sort;
        
        if (this.filter.sortBy === sortBy) {
          // Toggle sort order
          this.filter.sortOrder = this.filter.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          // New sort field
          this.filter.sortBy = sortBy;
          this.filter.sortOrder = 'asc';
        }
        
        this.fetchLeads().then(() => {
          this.render(document.getElementById('view-container'));
        });
      });
    });
    
    // Pagination
    document.querySelectorAll('.page-link').forEach(link => {
      if (link.hasAttribute('disabled')) return;
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(link.dataset.page);
        if (page === this.pagination.page) return;
        
        this.pagination.page = page;
        
        this.fetchLeads().then(() => {
          this.render(document.getElementById('view-container'));
        });
      });
    });
    
    // Lead name click
    document.querySelectorAll('.lead-name').forEach(leadName => {
      leadName.addEventListener('click', (e) => {
        e.preventDefault();
        const leadId = leadName.dataset.leadId;
        const lead = this.leads.find(l => l.id === parseInt(leadId));
        
        if (lead) {
          this.renderLeadDetailsModal(lead);
        }
      });
    });
    
    // Lead action buttons
    document.querySelectorAll('[data-action]').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        const leadId = button.dataset.leadId;
        const lead = this.leads.find(l => l.id === parseInt(leadId));
        
        switch (action) {
          case 'view':
            if (lead) {
              this.renderLeadDetailsModal(lead);
            }
            break;
          case 'edit':
            if (lead) {
              this.showAddEditLeadModal(lead);
            }
            break;
          case 'call':
            this.callLead(leadId);
            break;
          case 'delete':
            this.deleteLead(leadId);
            break;
        }
      });
    });
    
    // Add lead button
    document.getElementById('add-lead')?.addEventListener('click', () => {
      this.showAddEditLeadModal();
    });
    
    // Export leads button
    document.getElementById('export-leads')?.addEventListener('click', () => {
      this.exportLeads();
    });
  }
  
  /**
   * Get sort icon based on sort field and order
   */
  getSortIcon(field) {
    if (field !== this.filter.sortBy) {
      return 'chevrons-up-down';
    }
    
    return this.filter.sortOrder === 'asc' ? 'chevron-up' : 'chevron-down';
  }
  
  /**
   * Get status class for lead status
   */
  getLeadStatusClass(status) {
    switch (status) {
      case 'new':
        return 'info';
      case 'contacted':
        return 'warning';
      case 'qualified':
        return 'success';
      case 'unqualified':
        return 'danger';
      default:
        return 'info';
    }
  }
  
  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
