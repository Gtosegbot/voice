/**
 * Lead Management Component
 * Manages leads, their details, and assignment
 */
class LeadManagementComponent {
  constructor(app) {
    this.app = app;
    this.store = app.store;
    this.apiService = app.apiService;
    this.leads = [];
    this.currentLead = null;
    this.isEditing = false;
    this.totalLeads = 0;
    this.totalPages = 1;
    this.filter = {
      status: 'all',
      source: 'all',
      score: 'all',
      campaign: 'all',
      assigned: 'all',
      search: '',
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortDir: 'desc'
    };
  }
  
  /**
   * Fetch leads from the API
   */
  async fetchLeads() {
    try {
      const queryParams = new URLSearchParams();
      
      // Add all filters to query params
      if (this.filter.status !== 'all') {
        queryParams.append('status', this.filter.status);
      }
      
      if (this.filter.source !== 'all') {
        queryParams.append('source', this.filter.source);
      }
      
      if (this.filter.score !== 'all') {
        queryParams.append('scoreRange', this.filter.score);
      }
      
      if (this.filter.campaign !== 'all') {
        queryParams.append('campaignId', this.filter.campaign);
      }
      
      if (this.filter.assigned !== 'all') {
        queryParams.append('assigned', this.filter.assigned);
      }
      
      if (this.filter.search) {
        queryParams.append('search', this.filter.search);
      }
      
      // Pagination and sorting
      queryParams.append('page', this.filter.page);
      queryParams.append('limit', this.filter.limit);
      queryParams.append('sortBy', this.filter.sortBy);
      queryParams.append('sortDir', this.filter.sortDir);
      
      const data = await this.apiService.get(`/api/leads?${queryParams.toString()}`);
      
      this.leads = data.leads;
      this.totalLeads = data.total;
      this.totalPages = Math.ceil(data.total / this.filter.limit);
      this.filterOptions = data.filterOptions || {};
      
      return data;
    } catch (error) {
      console.error('Error fetching leads:', error);
      return { leads: [], total: 0 };
    }
  }
  
  /**
   * Fetch a specific lead by ID
   */
  async fetchLead(id) {
    try {
      const lead = await this.apiService.get(`/api/leads/${id}`);
      this.currentLead = lead;
      return lead;
    } catch (error) {
      console.error(`Error fetching lead ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Render the leads management component
   */
  async render(container) {
    // Show loading state
    container.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading leads...</p>
      </div>
    `;
    
    // Fetch leads data
    await this.fetchLeads();
    
    // If current lead is set, fetch its details
    if (this.currentLead?.id) {
      await this.fetchLead(this.currentLead.id);
    }
    
    // Render the component
    container.innerHTML = `
      <div class="lead-management-container">
        <div class="lead-management-header">
          <div class="header-actions">
            <button class="btn btn-primary" id="create-lead-btn">
              <i data-feather="user-plus"></i>
              New Lead
            </button>
            
            <button class="btn btn-outline" id="import-leads-btn">
              <i data-feather="upload"></i>
              Import Leads
            </button>
            
            <button class="btn btn-outline" id="export-leads-btn">
              <i data-feather="download"></i>
              Export
            </button>
            
            <div class="dropdown">
              <button class="btn btn-outline dropdown-toggle" id="bulk-actions-btn">
                <i data-feather="more-horizontal"></i>
                Bulk Actions
              </button>
              <div class="dropdown-menu" id="bulk-actions-menu" style="display: none;">
                <a href="#" class="dropdown-item" id="bulk-assign">Assign to Agent</a>
                <a href="#" class="dropdown-item" id="bulk-change-status">Change Status</a>
                <a href="#" class="dropdown-item" id="bulk-add-to-campaign">Add to Campaign</a>
                <a href="#" class="dropdown-item" id="bulk-delete">Delete Selected</a>
              </div>
            </div>
          </div>
          
          <div class="search-filter-section">
            <div class="search-container">
              <input type="text" id="lead-search" class="search-input" placeholder="Search leads..." value="${this.filter.search}">
              <button class="search-button">
                <i data-feather="search"></i>
              </button>
            </div>
            
            <button class="btn btn-sm btn-outline" id="toggle-filters-btn">
              <i data-feather="filter"></i>
              Filters
            </button>
          </div>
        </div>
        
        <div class="filters-panel" style="display: none;">
          <div class="filters-form">
            <div class="filter-group">
              <label>Lead Status</label>
              <select id="filter-status" class="filter-select">
                <option value="all">All Statuses</option>
                <option value="new" ${this.filter.status === 'new' ? 'selected' : ''}>New</option>
                <option value="contacted" ${this.filter.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                <option value="qualified" ${this.filter.status === 'qualified' ? 'selected' : ''}>Qualified</option>
                <option value="not-qualified" ${this.filter.status === 'not-qualified' ? 'selected' : ''}>Not Qualified</option>
                <option value="converted" ${this.filter.status === 'converted' ? 'selected' : ''}>Converted</option>
                <option value="nurturing" ${this.filter.status === 'nurturing' ? 'selected' : ''}>Nurturing</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Lead Source</label>
              <select id="filter-source" class="filter-select">
                <option value="all">All Sources</option>
                ${this.renderSourceOptions()}
              </select>
            </div>
            
            <div class="filter-group">
              <label>Lead Score</label>
              <select id="filter-score" class="filter-select">
                <option value="all">All Scores</option>
                <option value="high" ${this.filter.score === 'high' ? 'selected' : ''}>High (80-100)</option>
                <option value="medium" ${this.filter.score === 'medium' ? 'selected' : ''}>Medium (50-79)</option>
                <option value="low" ${this.filter.score === 'low' ? 'selected' : ''}>Low (0-49)</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Campaign</label>
              <select id="filter-campaign" class="filter-select">
                <option value="all">All Campaigns</option>
                ${this.renderCampaignOptions()}
              </select>
            </div>
            
            <div class="filter-group">
              <label>Assignment</label>
              <select id="filter-assigned" class="filter-select">
                <option value="all">All Leads</option>
                <option value="assigned" ${this.filter.assigned === 'assigned' ? 'selected' : ''}>Assigned</option>
                <option value="unassigned" ${this.filter.assigned === 'unassigned' ? 'selected' : ''}>Unassigned</option>
                <option value="me" ${this.filter.assigned === 'me' ? 'selected' : ''}>Assigned to Me</option>
              </select>
            </div>
          </div>
          
          <div class="filters-actions">
            <button id="apply-filters" class="btn btn-primary">Apply Filters</button>
            <button id="reset-filters" class="btn btn-outline">Reset</button>
          </div>
        </div>
        
        <div class="lead-management-content">
          <div class="leads-table-container">
            <table class="data-table leads-table">
              <thead>
                <tr>
                  <th width="40px">
                    <input type="checkbox" id="select-all-leads">
                  </th>
                  <th class="sortable" data-sort="name">Name</th>
                  <th class="sortable" data-sort="company">Company</th>
                  <th class="sortable" data-sort="phone">Phone</th>
                  <th class="sortable" data-sort="email">Email</th>
                  <th class="sortable" data-sort="status">Status</th>
                  <th class="sortable" data-sort="score">Score</th>
                  <th class="sortable" data-sort="source">Source</th>
                  <th class="sortable" data-sort="assignedTo">Assigned To</th>
                  <th class="sortable" data-sort="lastActivity">Last Activity</th>
                  <th width="100px">Actions</th>
                </tr>
              </thead>
              <tbody id="leads-table-body">
                ${this.renderLeadRows()}
              </tbody>
            </table>
            
            <div class="table-footer">
              <div class="pagination">
                <button id="prev-page" class="pagination-button" ${this.filter.page <= 1 ? 'disabled' : ''}>
                  <i data-feather="chevron-left"></i>
                </button>
                <span class="pagination-info">Page ${this.filter.page} of ${this.totalPages || 1}</span>
                <button id="next-page" class="pagination-button" ${this.filter.page >= this.totalPages ? 'disabled' : ''}>
                  <i data-feather="chevron-right"></i>
                </button>
              </div>
              
              <div class="page-size">
                <span>Show</span>
                <select id="page-size-select">
                  <option value="10" ${this.filter.limit === 10 ? 'selected' : ''}>10</option>
                  <option value="20" ${this.filter.limit === 20 ? 'selected' : ''}>20</option>
                  <option value="50" ${this.filter.limit === 50 ? 'selected' : ''}>50</option>
                  <option value="100" ${this.filter.limit === 100 ? 'selected' : ''}>100</option>
                </select>
                <span>per page</span>
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
   * Render lead table rows
   */
  renderLeadRows() {
    if (!this.leads || this.leads.length === 0) {
      return `
        <tr>
          <td colspan="11" class="empty-table-message">
            <i data-feather="users" style="width: 36px; height: 36px; opacity: 0.5;"></i>
            <p>No leads found</p>
            <p class="empty-table-subtext">Try adjusting your filters or create a new lead</p>
          </td>
        </tr>
      `;
    }
    
    return this.leads.map(lead => `
      <tr data-lead-id="${lead.id}" class="${lead.isNew ? 'new-row' : ''}">
        <td>
          <input type="checkbox" class="lead-checkbox" data-id="${lead.id}">
        </td>
        <td class="lead-name-cell">
          <div class="lead-avatar">${this.getInitials(lead.name)}</div>
          <div class="lead-name">
            <a href="#" class="view-lead-link" data-id="${lead.id}">${lead.name}</a>
            ${lead.isNew ? '<span class="badge new-badge">New</span>' : ''}
          </div>
        </td>
        <td>${lead.company || '-'}</td>
        <td>${lead.phone || '-'}</td>
        <td>${lead.email || '-'}</td>
        <td>
          <span class="status-badge status-${lead.status || 'new'}">${this.getStatusLabel(lead.status || 'new')}</span>
        </td>
        <td>
          <div class="lead-score-display">
            <div class="score-bar">
              <div class="score-fill" style="width: ${lead.score || 0}%"></div>
            </div>
            <span class="score-value">${lead.score || 0}</span>
          </div>
        </td>
        <td>${lead.source || '-'}</td>
        <td>
          ${lead.assignedTo ? 
            `<div class="assigned-user">
              <div class="user-avatar small">${this.getInitials(lead.assignedTo)}</div>
              <span>${lead.assignedTo}</span>
            </div>` : 
            '<span class="unassigned">Unassigned</span>'}
        </td>
        <td>${this.formatTimeAgo(lead.lastActivity)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-icon btn-sm" data-action="call" data-id="${lead.id}" title="Call Lead">
              <i data-feather="phone"></i>
            </button>
            <button class="btn btn-icon btn-sm" data-action="message" data-id="${lead.id}" title="Message Lead">
              <i data-feather="message-circle"></i>
            </button>
            <div class="dropdown">
              <button class="btn btn-icon btn-sm" data-action="more" title="More Actions">
                <i data-feather="more-vertical"></i>
              </button>
              <div class="dropdown-menu" style="display: none;">
                <a href="#" class="dropdown-item" data-action="edit" data-id="${lead.id}">Edit</a>
                <a href="#" class="dropdown-item" data-action="convert" data-id="${lead.id}">Convert</a>
                <a href="#" class="dropdown-item" data-action="assign" data-id="${lead.id}">Assign</a>
                <a href="#" class="dropdown-item text-danger" data-action="delete" data-id="${lead.id}">Delete</a>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `).join('');
  }
  
  /**
   * Render lead source options for filter dropdown
   */
  renderSourceOptions() {
    if (!this.filterOptions || !this.filterOptions.sources) {
      return '';
    }
    
    return this.filterOptions.sources.map(source => 
      `<option value="${source.value}" ${this.filter.source === source.value ? 'selected' : ''}>${source.label}</option>`
    ).join('');
  }
  
  /**
   * Render campaign options for filter dropdown
   */
  renderCampaignOptions() {
    if (!this.filterOptions || !this.filterOptions.campaigns) {
      return '';
    }
    
    return this.filterOptions.campaigns.map(campaign => 
      `<option value="${campaign.id}" ${this.filter.campaign === campaign.id ? 'selected' : ''}>${campaign.name}</option>`
    ).join('');
  }
  
  /**
   * Render the lead detail view
   */
  renderLeadDetail(lead) {
    const detailContainer = document.createElement('div');
    detailContainer.className = 'lead-detail-container';
    
    detailContainer.innerHTML = `
      <div class="lead-detail-header">
        <div class="lead-basic-info">
          <div class="lead-avatar large">${this.getInitials(lead.name)}</div>
          <div class="lead-header-info">
            <h2 class="lead-name">${lead.name}</h2>
            <div class="lead-subtitle">
              ${lead.position ? `<span class="lead-position">${lead.position}</span>` : ''}
              ${lead.company ? `<span class="lead-company">${lead.company}</span>` : ''}
            </div>
            <div class="lead-status-line">
              <span class="status-badge status-${lead.status || 'new'}">${this.getStatusLabel(lead.status || 'new')}</span>
              <span class="score-badge">Score: ${lead.score || 0}/100</span>
            </div>
          </div>
        </div>
        
        <div class="lead-header-actions">
          <button class="btn btn-primary" id="call-lead-btn">
            <i data-feather="phone"></i>
            Call
          </button>
          
          <button class="btn btn-outline" id="message-lead-btn">
            <i data-feather="message-circle"></i>
            Message
          </button>
          
          <button class="btn btn-outline" id="edit-lead-btn">
            <i data-feather="edit"></i>
            Edit
          </button>
          
          <div class="dropdown">
            <button class="btn btn-outline dropdown-toggle" id="lead-actions-btn">
              <i data-feather="more-horizontal"></i>
              More
            </button>
            <div class="dropdown-menu" id="lead-actions-menu" style="display: none;">
              <a href="#" class="dropdown-item" id="schedule-action">Schedule Task</a>
              <a href="#" class="dropdown-item" id="add-note-action">Add Note</a>
              <a href="#" class="dropdown-item" id="assign-action">Assign Lead</a>
              <a href="#" class="dropdown-item" id="add-to-campaign-action">Add to Campaign</a>
              <a href="#" class="dropdown-item" id="merge-action">Merge Lead</a>
              <a href="#" class="dropdown-item text-danger" id="delete-action">Delete Lead</a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="lead-detail-content">
        <div class="lead-detail-main">
          <div class="card lead-info-card">
            <div class="card-header">
              <h3 class="card-title">Contact Information</h3>
            </div>
            <div class="card-body lead-contact-info">
              <div class="info-grid">
                ${lead.phone ? `
                  <div class="info-item">
                    <div class="info-icon"><i data-feather="phone"></i></div>
                    <div class="info-content">
                      <div class="info-label">Phone</div>
                      <div class="info-value">${lead.phone}</div>
                    </div>
                  </div>
                ` : ''}
                
                ${lead.email ? `
                  <div class="info-item">
                    <div class="info-icon"><i data-feather="mail"></i></div>
                    <div class="info-content">
                      <div class="info-label">Email</div>
                      <div class="info-value">${lead.email}</div>
                    </div>
                  </div>
                ` : ''}
                
                ${lead.website ? `
                  <div class="info-item">
                    <div class="info-icon"><i data-feather="globe"></i></div>
                    <div class="info-content">
                      <div class="info-label">Website</div>
                      <div class="info-value">${lead.website}</div>
                    </div>
                  </div>
                ` : ''}
                
                ${lead.address ? `
                  <div class="info-item">
                    <div class="info-icon"><i data-feather="map-pin"></i></div>
                    <div class="info-content">
                      <div class="info-label">Address</div>
                      <div class="info-value">${lead.address}</div>
                    </div>
                  </div>
                ` : ''}
                
                ${lead.social?.linkedin ? `
                  <div class="info-item">
                    <div class="info-icon"><i data-feather="linkedin"></i></div>
                    <div class="info-content">
                      <div class="info-label">LinkedIn</div>
                      <div class="info-value">${lead.social.linkedin}</div>
                    </div>
                  </div>
                ` : ''}
                
                ${lead.social?.twitter ? `
                  <div class="info-item">
                    <div class="info-icon"><i data-feather="twitter"></i></div>
                    <div class="info-content">
                      <div class="info-label">Twitter</div>
                      <div class="info-value">${lead.social.twitter}</div>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
          
          <div class="card lead-qualification-card">
            <div class="card-header">
              <h3 class="card-title">Lead Qualification</h3>
            </div>
            <div class="card-body">
              <div class="qualification-meters">
                <div class="qualification-meter">
                  <div class="meter-label">Budget Fit</div>
                  <div class="meter-bar">
                    <div class="meter-fill" style="width: ${lead.qualification?.budget || 0}%"></div>
                  </div>
                  <div class="meter-value">${lead.qualification?.budget || 0}/100</div>
                </div>
                
                <div class="qualification-meter">
                  <div class="meter-label">Authority</div>
                  <div class="meter-bar">
                    <div class="meter-fill" style="width: ${lead.qualification?.authority || 0}%"></div>
                  </div>
                  <div class="meter-value">${lead.qualification?.authority || 0}/100</div>
                </div>
                
                <div class="qualification-meter">
                  <div class="meter-label">Need</div>
                  <div class="meter-bar">
                    <div class="meter-fill" style="width: ${lead.qualification?.need || 0}%"></div>
                  </div>
                  <div class="meter-value">${lead.qualification?.need || 0}/100</div>
                </div>
                
                <div class="qualification-meter">
                  <div class="meter-label">Timeline</div>
                  <div class="meter-bar">
                    <div class="meter-fill" style="width: ${lead.qualification?.timeline || 0}%"></div>
                  </div>
                  <div class="meter-value">${lead.qualification?.timeline || 0}/100</div>
                </div>
              </div>
              
              <div class="qualification-notes">
                <h4>Qualification Notes</h4>
                <p>${lead.qualification?.notes || 'No qualification notes available'}</p>
              </div>
            </div>
          </div>
          
          <div class="card conversations-card">
            <div class="card-header">
              <h3 class="card-title">Recent Conversations</h3>
              <a href="#" class="view-all" id="view-all-conversations">View All</a>
            </div>
            <div class="card-body">
              ${this.renderConversationsList(lead.conversations || [])}
            </div>
          </div>
          
          <div class="card notes-card">
            <div class="card-header">
              <h3 class="card-title">Notes & Activities</h3>
              <button class="btn btn-sm btn-outline" id="add-note-btn">
                <i data-feather="plus"></i>
                Add Note
              </button>
            </div>
            <div class="card-body">
              ${this.renderNotesList(lead.notes || [])}
            </div>
          </div>
        </div>
        
        <div class="lead-detail-sidebar">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Lead Details</h3>
            </div>
            <div class="card-body">
              <div class="details-list">
                <div class="detail-item">
                  <div class="detail-label">Source</div>
                  <div class="detail-value">${lead.source || 'Unknown'}</div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-label">Lead Owner</div>
                  <div class="detail-value">
                    ${lead.assignedTo ? 
                      `<div class="assigned-user">
                        <div class="user-avatar small">${this.getInitials(lead.assignedTo)}</div>
                        <span>${lead.assignedTo}</span>
                      </div>` : 
                      '<span class="unassigned">Unassigned</span>'}
                  </div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-label">Campaign</div>
                  <div class="detail-value">${lead.campaign?.name || 'Not in campaign'}</div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-label">Created Date</div>
                  <div class="detail-value">${this.formatDate(lead.createdAt)}</div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-label">Last Activity</div>
                  <div class="detail-value">${this.formatTimeAgo(lead.lastActivity)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Upcoming Tasks</h3>
              <button class="btn btn-sm btn-outline" id="schedule-task-btn">
                <i data-feather="plus"></i>
                New Task
              </button>
            </div>
            <div class="card-body">
              ${this.renderTasksList(lead.tasks || [])}
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Files</h3>
              <button class="btn btn-sm btn-outline" id="upload-file-btn">
                <i data-feather="upload"></i>
                Upload
              </button>
            </div>
            <div class="card-body">
              ${this.renderFilesList(lead.files || [])}
            </div>
          </div>
        </div>
      </div>
    `;
    
    return detailContainer;
  }
  
  /**
   * Render conversations list for lead detail
   */
  renderConversationsList(conversations) {
    if (!conversations || conversations.length === 0) {
      return `<div class="empty-list">No conversations with this lead yet</div>`;
    }
    
    return `
      <div class="conversations-list">
        ${conversations.map(conversation => `
          <div class="conversation-item">
            <div class="conversation-icon ${this.getChannelIconClass(conversation.channel)}">
              <i data-feather="${this.getChannelIcon(conversation.channel)}"></i>
            </div>
            <div class="conversation-info">
              <div class="conversation-meta">
                <span class="conversation-time">${this.formatTimeAgo(conversation.timestamp)}</span>
                <span class="conversation-agent">${conversation.agentName}</span>
              </div>
              <div class="conversation-preview">${conversation.preview}</div>
            </div>
            <a href="#" class="view-conversation-btn" data-id="${conversation.id}">
              <i data-feather="chevron-right"></i>
            </a>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  /**
   * Render notes list for lead detail
   */
  renderNotesList(notes) {
    if (!notes || notes.length === 0) {
      return `<div class="empty-list">No notes or activities recorded</div>`;
    }
    
    return `
      <div class="notes-timeline">
        ${notes.map(note => `
          <div class="note-item">
            <div class="note-icon ${this.getNoteIconClass(note.type)}">
              <i data-feather="${this.getNoteIcon(note.type)}"></i>
            </div>
            <div class="note-content">
              <div class="note-header">
                <div class="note-user">${note.createdBy}</div>
                <div class="note-time">${this.formatTimeAgo(note.createdAt)}</div>
              </div>
              <div class="note-text">${note.content}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  /**
   * Render tasks list for lead detail
   */
  renderTasksList(tasks) {
    if (!tasks || tasks.length === 0) {
      return `<div class="empty-list">No upcoming tasks</div>`;
    }
    
    return `
      <div class="tasks-list">
        ${tasks.map(task => `
          <div class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-checkbox">
              <input type="checkbox" class="task-check" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
            </div>
            <div class="task-content">
              <div class="task-title">${task.title}</div>
              <div class="task-meta">
                ${task.dueDate ? `<span class="task-due-date">Due: ${this.formatDate(task.dueDate)}</span>` : ''}
                ${task.assignedTo ? `<span class="task-assignee">Assigned to: ${task.assignedTo}</span>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  /**
   * Render files list for lead detail
   */
  renderFilesList(files) {
    if (!files || files.length === 0) {
      return `<div class="empty-list">No files uploaded</div>`;
    }
    
    return `
      <div class="files-list">
        ${files.map(file => `
          <div class="file-item">
            <div class="file-icon">
              <i data-feather="${this.getFileIcon(file.type)}"></i>
            </div>
            <div class="file-info">
              <div class="file-name">${file.name}</div>
              <div class="file-meta">
                <span class="file-size">${this.formatFileSize(file.size)}</span>
                <span class="file-date">${this.formatDate(file.uploadedAt)}</span>
              </div>
            </div>
            <div class="file-actions">
              <button class="btn btn-icon btn-sm" data-action="download" data-id="${file.id}" title="Download">
                <i data-feather="download"></i>
              </button>
              <button class="btn btn-icon btn-sm" data-action="delete-file" data-id="${file.id}" title="Delete">
                <i data-feather="trash-2"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  /**
   * Set up event listeners for the lead management component
   */
  setupEventListeners() {
    // Toggle filters panel
    const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
    const filtersPanel = document.querySelector('.filters-panel');
    
    if (toggleFiltersBtn && filtersPanel) {
      toggleFiltersBtn.addEventListener('click', () => {
        filtersPanel.style.display = filtersPanel.style.display === 'none' ? 'block' : 'none';
      });
    }
    
    // Apply filters
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', () => {
        this.filter.status = document.getElementById('filter-status').value;
        this.filter.source = document.getElementById('filter-source').value;
        this.filter.score = document.getElementById('filter-score').value;
        this.filter.campaign = document.getElementById('filter-campaign').value;
        this.filter.assigned = document.getElementById('filter-assigned').value;
        this.filter.page = 1; // Reset to first page when applying filters
        
        // Refresh leads
        this.fetchLeads().then(() => {
          const tableBody = document.getElementById('leads-table-body');
          if (tableBody) {
            tableBody.innerHTML = this.renderLeadRows();
            feather.replace();
          }
        });
        
        // Hide filters panel
        filtersPanel.style.display = 'none';
      });
    }
    
    // Reset filters
    const resetFiltersBtn = document.getElementById('reset-filters');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        // Reset filter values in the form
        document.getElementById('filter-status').value = 'all';
        document.getElementById('filter-source').value = 'all';
        document.getElementById('filter-score').value = 'all';
        document.getElementById('filter-campaign').value = 'all';
        document.getElementById('filter-assigned').value = 'all';
        document.getElementById('lead-search').value = '';
        
        // Reset filter object
        this.filter = {
          status: 'all',
          source: 'all',
          score: 'all',
          campaign: 'all',
          assigned: 'all',
          search: '',
          page: 1,
          limit: 20,
          sortBy: 'createdAt',
          sortDir: 'desc'
        };
        
        // Refresh leads
        this.fetchLeads().then(() => {
          const tableBody = document.getElementById('leads-table-body');
          if (tableBody) {
            tableBody.innerHTML = this.renderLeadRows();
            feather.replace();
          }
        });
        
        // Hide filters panel
        filtersPanel.style.display = 'none';
      });
    }
    
    // Search input
    const searchInput = document.getElementById('lead-search');
    if (searchInput) {
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          this.filter.search = searchInput.value;
          this.filter.page = 1; // Reset to first page
          
          // Refresh leads
          this.fetchLeads().then(() => {
            const tableBody = document.getElementById('leads-table-body');
            if (tableBody) {
              tableBody.innerHTML = this.renderLeadRows();
              feather.replace();
            }
          });
        }
      });
    }
    
    // Pagination
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        if (this.filter.page > 1) {
          this.filter.page--;
          
          // Refresh leads
          this.fetchLeads().then(() => {
            const tableBody = document.getElementById('leads-table-body');
            if (tableBody) {
              tableBody.innerHTML = this.renderLeadRows();
              feather.replace();
            }
          });
        }
      });
    }
    
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        if (this.filter.page < this.totalPages) {
          this.filter.page++;
          
          // Refresh leads
          this.fetchLeads().then(() => {
            const tableBody = document.getElementById('leads-table-body');
            if (tableBody) {
              tableBody.innerHTML = this.renderLeadRows();
              feather.replace();
            }
          });
        }
      });
    }
    
    // Page size select
    const pageSizeSelect = document.getElementById('page-size-select');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', () => {
        this.filter.limit = parseInt(pageSizeSelect.value);
        this.filter.page = 1; // Reset to first page
        
        // Refresh leads
        this.fetchLeads().then(() => {
          const tableBody = document.getElementById('leads-table-body');
          if (tableBody) {
            tableBody.innerHTML = this.renderLeadRows();
            feather.replace();
          }
        });
      });
    }
    
    // Table sorting
    const sortHeaders = document.querySelectorAll('.sortable');
    sortHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const sortBy = header.dataset.sort;
        
        // Toggle sort direction if already sorting by this column
        if (this.filter.sortBy === sortBy) {
          this.filter.sortDir = this.filter.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          this.filter.sortBy = sortBy;
          this.filter.sortDir = 'asc';
        }
        
        // Update UI to show sort direction
        sortHeaders.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
        header.classList.add(`sort-${this.filter.sortDir}`);
        
        // Refresh leads
        this.fetchLeads().then(() => {
          const tableBody = document.getElementById('leads-table-body');
          if (tableBody) {
            tableBody.innerHTML = this.renderLeadRows();
            feather.replace();
          }
        });
      });
    });
    
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('select-all-leads');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', () => {
        const checkboxes = document.querySelectorAll('.lead-checkbox');
        checkboxes.forEach(checkbox => {
          checkbox.checked = selectAllCheckbox.checked;
        });
        
        // Show/hide bulk actions based on selection
        const bulkActionsBtn = document.getElementById('bulk-actions-btn');
        if (bulkActionsBtn) {
          bulkActionsBtn.classList.toggle('active', selectAllCheckbox.checked);
        }
      });
    }
    
    // Lead checkboxes
    document.querySelectorAll('.lead-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        // Check if any checkboxes are selected
        const anySelected = Array.from(document.querySelectorAll('.lead-checkbox')).some(cb => cb.checked);
        
        // Show/hide bulk actions based on selection
        const bulkActionsBtn = document.getElementById('bulk-actions-btn');
        if (bulkActionsBtn) {
          bulkActionsBtn.classList.toggle('active', anySelected);
        }
        
        // Update select all checkbox
        const allSelected = Array.from(document.querySelectorAll('.lead-checkbox')).every(cb => cb.checked);
        const selectAllCheckbox = document.getElementById('select-all-leads');
        if (selectAllCheckbox) {
          selectAllCheckbox.checked = allSelected;
        }
      });
    });
    
    // New lead button
    const createLeadBtn = document.getElementById('create-lead-btn');
    if (createLeadBtn) {
      createLeadBtn.addEventListener('click', () => {
        this.showLeadForm();
      });
    }
    
    // Import leads button
    const importLeadsBtn = document.getElementById('import-leads-btn');
    if (importLeadsBtn) {
      importLeadsBtn.addEventListener('click', () => {
        this.showImportModal();
      });
    }
    
    // Export leads button
    const exportLeadsBtn = document.getElementById('export-leads-btn');
    if (exportLeadsBtn) {
      exportLeadsBtn.addEventListener('click', () => {
        this.exportLeads();
      });
    }
    
    // Bulk actions dropdown toggle
    const bulkActionsBtn = document.getElementById('bulk-actions-btn');
    const bulkActionsMenu = document.getElementById('bulk-actions-menu');
    
    if (bulkActionsBtn && bulkActionsMenu) {
      bulkActionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        bulkActionsMenu.style.display = bulkActionsMenu.style.display === 'none' ? 'block' : 'none';
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        bulkActionsMenu.style.display = 'none';
      });
      
      // Prevent closing when clicking inside the dropdown
      bulkActionsMenu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
    
    // Bulk action handlers
    const bulkAssignBtn = document.getElementById('bulk-assign');
    const bulkChangeStatusBtn = document.getElementById('bulk-change-status');
    const bulkAddToCampaignBtn = document.getElementById('bulk-add-to-campaign');
    const bulkDeleteBtn = document.getElementById('bulk-delete');
    
    if (bulkAssignBtn) {
      bulkAssignBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedIds = this.getSelectedLeadIds();
        if (selectedIds.length > 0) {
          this.showBulkAssignModal(selectedIds);
        }
      });
    }
    
    if (bulkChangeStatusBtn) {
      bulkChangeStatusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedIds = this.getSelectedLeadIds();
        if (selectedIds.length > 0) {
          this.showBulkStatusModal(selectedIds);
        }
      });
    }
    
    if (bulkAddToCampaignBtn) {
      bulkAddToCampaignBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedIds = this.getSelectedLeadIds();
        if (selectedIds.length > 0) {
          this.showBulkCampaignModal(selectedIds);
        }
      });
    }
    
    if (bulkDeleteBtn) {
      bulkDeleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedIds = this.getSelectedLeadIds();
        if (selectedIds.length > 0) {
          this.confirmBulkDelete(selectedIds);
        }
      });
    }
    
    // Lead row actions
    document.querySelectorAll('.view-lead-link').forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const leadId = link.dataset.id;
        await this.showLeadDetail(leadId);
      });
    });
    
    // Lead action buttons
    document.querySelectorAll('[data-action]').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const action = button.dataset.action;
        const leadId = button.dataset.id;
        
        switch (action) {
          case 'call':
            this.initiateCall(leadId);
            break;
          case 'message':
            this.initiateMessage(leadId);
            break;
          case 'edit':
            this.showLeadForm(leadId);
            break;
          case 'convert':
            this.convertLead(leadId);
            break;
          case 'assign':
            this.showAssignModal(leadId);
            break;
          case 'delete':
            this.confirmDelete(leadId);
            break;
          case 'more':
            // Toggle dropdown
            const dropdown = button.nextElementSibling;
            if (dropdown) {
              dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            }
            break;
        }
      });
    });
  }
  
  /**
   * Show lead detail view
   */
  async showLeadDetail(leadId) {
    try {
      // Fetch lead data
      const lead = await this.fetchLead(leadId);
      
      if (!lead) {
        console.error('Lead not found');
        return;
      }
      
      // Create modal for lead detail
      const modal = document.createElement('div');
      modal.className = 'modal lead-detail-modal';
      modal.style.display = 'block';
      
      modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content large">
          <div class="modal-header">
            <h2>Lead Details</h2>
            <button class="close-btn" id="close-lead-detail">
              <i data-feather="x"></i>
            </button>
          </div>
          <div class="modal-body" id="lead-detail-container">
            <!-- Lead detail will be inserted here -->
          </div>
        </div>
      `;
      
      // Add modal to DOM
      document.body.appendChild(modal);
      
      // Add lead detail to modal
      const detailContainer = document.getElementById('lead-detail-container');
      if (detailContainer) {
        detailContainer.appendChild(this.renderLeadDetail(lead));
      }
      
      // Initialize feather icons
      feather.replace();
      
      // Set up event listeners for the modal
      const closeBtn = document.getElementById('close-lead-detail');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          document.body.removeChild(modal);
        });
      }
      
      // Close modal when clicking on backdrop
      const backdrop = modal.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', () => {
          document.body.removeChild(modal);
        });
      }
      
      // Set up action buttons in lead detail
      this.setupLeadDetailEventListeners(lead);
      
    } catch (error) {
      console.error('Error showing lead detail:', error);
    }
  }
  
  /**
   * Set up event listeners for lead detail view
   */
  setupLeadDetailEventListeners(lead) {
    // Call lead button
    const callLeadBtn = document.getElementById('call-lead-btn');
    if (callLeadBtn) {
      callLeadBtn.addEventListener('click', () => {
        this.initiateCall(lead.id);
      });
    }
    
    // Message lead button
    const messageLeadBtn = document.getElementById('message-lead-btn');
    if (messageLeadBtn) {
      messageLeadBtn.addEventListener('click', () => {
        this.initiateMessage(lead.id);
      });
    }
    
    // Edit lead button
    const editLeadBtn = document.getElementById('edit-lead-btn');
    if (editLeadBtn) {
      editLeadBtn.addEventListener('click', () => {
        this.showLeadForm(lead.id);
      });
    }
    
    // Lead actions dropdown
    const leadActionsBtn = document.getElementById('lead-actions-btn');
    const leadActionsMenu = document.getElementById('lead-actions-menu');
    
    if (leadActionsBtn && leadActionsMenu) {
      leadActionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        leadActionsMenu.style.display = leadActionsMenu.style.display === 'none' ? 'block' : 'none';
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        leadActionsMenu.style.display = 'none';
      });
    }
    
    // Add note button
    const addNoteBtn = document.getElementById('add-note-btn');
    if (addNoteBtn) {
      addNoteBtn.addEventListener('click', () => {
        this.showAddNoteModal(lead.id);
      });
    }
    
    // Schedule task button
    const scheduleTaskBtn = document.getElementById('schedule-task-btn');
    if (scheduleTaskBtn) {
      scheduleTaskBtn.addEventListener('click', () => {
        this.showScheduleTaskModal(lead.id);
      });
    }
    
    // Upload file button
    const uploadFileBtn = document.getElementById('upload-file-btn');
    if (uploadFileBtn) {
      uploadFileBtn.addEventListener('click', () => {
        this.showUploadFileModal(lead.id);
      });
    }
    
    // View all conversations link
    const viewAllConversationsBtn = document.getElementById('view-all-conversations');
    if (viewAllConversationsBtn) {
      viewAllConversationsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Navigate to conversations view filtered for this lead
        this.app.store.dispatch({
          type: 'SET_CURRENT_VIEW',
          payload: 'conversations'
        });
        
        this.app.store.dispatch({
          type: 'SET_CONVERSATION_FILTER',
          payload: {
            leadId: lead.id
          }
        });
      });
    }
    
    // View conversation buttons
    document.querySelectorAll('.view-conversation-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const conversationId = button.dataset.id;
        
        // Navigate to conversation detail
        this.app.store.dispatch({
          type: 'SET_CURRENT_VIEW',
          payload: 'conversations'
        });
        
        this.app.store.dispatch({
          type: 'SET_ACTIVE_CONVERSATION',
          payload: conversationId
        });
      });
    });
    
    // Task checkboxes
    document.querySelectorAll('.task-check').forEach(checkbox => {
      checkbox.addEventListener('change', async () => {
        const taskId = checkbox.dataset.id;
        const completed = checkbox.checked;
        
        try {
          // Update task status
          await this.apiService.put(`/api/leads/${lead.id}/tasks/${taskId}`, {
            completed
          });
          
          // Update UI
          const taskItem = checkbox.closest('.task-item');
          if (taskItem) {
            taskItem.classList.toggle('completed', completed);
          }
        } catch (error) {
          console.error('Error updating task:', error);
          
          // Revert checkbox state if error
          checkbox.checked = !completed;
        }
      });
    });
    
    // File actions
    document.querySelectorAll('[data-action="download"]').forEach(button => {
      button.addEventListener('click', async () => {
        const fileId = button.dataset.id;
        this.downloadFile(lead.id, fileId);
      });
    });
    
    document.querySelectorAll('[data-action="delete-file"]').forEach(button => {
      button.addEventListener('click', async () => {
        const fileId = button.dataset.id;
        this.confirmDeleteFile(lead.id, fileId);
      });
    });
  }
  
  /**
   * Show lead form for creating or editing a lead
   */
  async showLeadForm(leadId = null) {
    let lead = null;
    
    // If leadId is provided, fetch lead data for editing
    if (leadId) {
      lead = await this.fetchLead(leadId);
      if (!lead) {
        console.error('Lead not found');
        return;
      }
    }
    
    // Create modal for lead form
    const modal = document.createElement('div');
    modal.className = 'modal lead-form-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content medium">
        <div class="modal-header">
          <h2>${lead ? 'Edit Lead' : 'Create New Lead'}</h2>
          <button class="close-btn" id="close-lead-form">
            <i data-feather="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="lead-form">
            <div class="form-tabs">
              <button type="button" class="tab-button active" data-tab="basic-info">Basic Info</button>
              <button type="button" class="tab-button" data-tab="contact-info">Contact Details</button>
              <button type="button" class="tab-button" data-tab="company-info">Company</button>
              <button type="button" class="tab-button" data-tab="qualification">Qualification</button>
            </div>
            
            <div class="tab-content active" id="basic-info">
              <div class="form-row">
                <div class="form-group">
                  <label for="lead-name">Full Name *</label>
                  <input type="text" id="lead-name" class="form-control" value="${lead?.name || ''}" required>
                </div>
                
                <div class="form-group">
                  <label for="lead-position">Position</label>
                  <input type="text" id="lead-position" class="form-control" value="${lead?.position || ''}">
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="lead-status">Status</label>
                  <select id="lead-status" class="form-control">
                    <option value="new" ${lead?.status === 'new' || !lead ? 'selected' : ''}>New</option>
                    <option value="contacted" ${lead?.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="qualified" ${lead?.status === 'qualified' ? 'selected' : ''}>Qualified</option>
                    <option value="not-qualified" ${lead?.status === 'not-qualified' ? 'selected' : ''}>Not Qualified</option>
                    <option value="converted" ${lead?.status === 'converted' ? 'selected' : ''}>Converted</option>
                    <option value="nurturing" ${lead?.status === 'nurturing' ? 'selected' : ''}>Nurturing</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="lead-source">Source</label>
                  <select id="lead-source" class="form-control">
                    <option value="website" ${lead?.source === 'website' ? 'selected' : ''}>Website</option>
                    <option value="referral" ${lead?.source === 'referral' ? 'selected' : ''}>Referral</option>
                    <option value="social_media" ${lead?.source === 'social_media' ? 'selected' : ''}>Social Media</option>
                    <option value="email_campaign" ${lead?.source === 'email_campaign' ? 'selected' : ''}>Email Campaign</option>
                    <option value="cold_call" ${lead?.source === 'cold_call' ? 'selected' : ''}>Cold Call</option>
                    <option value="event" ${lead?.source === 'event' ? 'selected' : ''}>Event</option>
                    <option value="other" ${lead?.source === 'other' ? 'selected' : ''}>Other</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label for="lead-campaign">Campaign</label>
                <select id="lead-campaign" class="form-control">
                  <option value="">Not Assigned</option>
                  ${this.renderCampaignDropdownOptions(lead?.campaign?.id || '')}
                </select>
              </div>
              
              <div class="form-group">
                <label for="lead-owner">Lead Owner</label>
                <select id="lead-owner" class="form-control">
                  <option value="">Unassigned</option>
                  ${this.renderUserDropdownOptions(lead?.assignedTo || '')}
                </select>
              </div>
            </div>
            
            <div class="tab-content" id="contact-info">
              <div class="form-row">
                <div class="form-group">
                  <label for="lead-phone">Phone</label>
                  <input type="tel" id="lead-phone" class="form-control" value="${lead?.phone || ''}">
                </div>
                
                <div class="form-group">
                  <label for="lead-email">Email</label>
                  <input type="email" id="lead-email" class="form-control" value="${lead?.email || ''}">
                </div>
              </div>
              
              <div class="form-group">
                <label for="lead-address">Address</label>
                <textarea id="lead-address" class="form-control" rows="3">${lead?.address || ''}</textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="lead-linkedin">LinkedIn</label>
                  <input type="text" id="lead-linkedin" class="form-control" value="${lead?.social?.linkedin || ''}">
                </div>
                
                <div class="form-group">
                  <label for="lead-twitter">Twitter</label>
                  <input type="text" id="lead-twitter" class="form-control" value="${lead?.social?.twitter || ''}">
                </div>
              </div>
            </div>
            
            <div class="tab-content" id="company-info">
              <div class="form-row">
                <div class="form-group">
                  <label for="lead-company">Company Name</label>
                  <input type="text" id="lead-company" class="form-control" value="${lead?.company || ''}">
                </div>
                
                <div class="form-group">
                  <label for="lead-industry">Industry</label>
                  <select id="lead-industry" class="form-control">
                    <option value="">Select Industry</option>
                    <option value="technology" ${lead?.industry === 'technology' ? 'selected' : ''}>Technology</option>
                    <option value="healthcare" ${lead?.industry === 'healthcare' ? 'selected' : ''}>Healthcare</option>
                    <option value="finance" ${lead?.industry === 'finance' ? 'selected' : ''}>Finance</option>
                    <option value="education" ${lead?.industry === 'education' ? 'selected' : ''}>Education</option>
                    <option value="manufacturing" ${lead?.industry === 'manufacturing' ? 'selected' : ''}>Manufacturing</option>
                    <option value="retail" ${lead?.industry === 'retail' ? 'selected' : ''}>Retail</option>
                    <option value="real_estate" ${lead?.industry === 'real_estate' ? 'selected' : ''}>Real Estate</option>
                    <option value="other" ${lead?.industry === 'other' ? 'selected' : ''}>Other</option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="lead-company-size">Company Size</label>
                  <select id="lead-company-size" class="form-control">
                    <option value="">Select Size</option>
                    <option value="1-10" ${lead?.companySize === '1-10' ? 'selected' : ''}>1-10 employees</option>
                    <option value="11-50" ${lead?.companySize === '11-50' ? 'selected' : ''}>11-50 employees</option>
                    <option value="51-200" ${lead?.companySize === '51-200' ? 'selected' : ''}>51-200 employees</option>
                    <option value="201-500" ${lead?.companySize === '201-500' ? 'selected' : ''}>201-500 employees</option>
                    <option value="501-1000" ${lead?.companySize === '501-1000' ? 'selected' : ''}>501-1000 employees</option>
                    <option value="1001+" ${lead?.companySize === '1001+' ? 'selected' : ''}>1001+ employees</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="lead-revenue">Annual Revenue</label>
                  <select id="lead-revenue" class="form-control">
                    <option value="">Select Revenue</option>
                    <option value="<1M" ${lead?.revenue === '<1M' ? 'selected' : ''}>Less than $1M</option>
                    <option value="1M-10M" ${lead?.revenue === '1M-10M' ? 'selected' : ''}>$1M - $10M</option>
                    <option value="10M-50M" ${lead?.revenue === '10M-50M' ? 'selected' : ''}>$10M - $50M</option>
                    <option value="50M-100M" ${lead?.revenue === '50M-100M' ? 'selected' : ''}>$50M - $100M</option>
                    <option value="100M+" ${lead?.revenue === '100M+' ? 'selected' : ''}>$100M+</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label for="lead-website">Website</label>
                <input type="url" id="lead-website" class="form-control" value="${lead?.website || ''}">
              </div>
            </div>
            
            <div class="tab-content" id="qualification">
              <div class="form-group">
                <label for="budget-score">Budget Fit (${lead?.qualification?.budget || 0})</label>
                <input type="range" id="budget-score" class="form-range" min="0" max="100" value="${lead?.qualification?.budget || 0}">
              </div>
              
              <div class="form-group">
                <label for="authority-score">Authority (${lead?.qualification?.authority || 0})</label>
                <input type="range" id="authority-score" class="form-range" min="0" max="100" value="${lead?.qualification?.authority || 0}">
              </div>
              
              <div class="form-group">
                <label for="need-score">Need (${lead?.qualification?.need || 0})</label>
                <input type="range" id="need-score" class="form-range" min="0" max="100" value="${lead?.qualification?.need || 0}">
              </div>
              
              <div class="form-group">
                <label for="timeline-score">Timeline (${lead?.qualification?.timeline || 0})</label>
                <input type="range" id="timeline-score" class="form-range" min="0" max="100" value="${lead?.qualification?.timeline || 0}">
              </div>
              
              <div class="form-group">
                <label for="qualification-notes">Qualification Notes</label>
                <textarea id="qualification-notes" class="form-control" rows="4">${lead?.qualification?.notes || ''}</textarea>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-outline" id="cancel-lead-form">Cancel</button>
              <button type="submit" class="btn btn-primary">${lead ? 'Save Changes' : 'Create Lead'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Add modal to DOM
    document.body.appendChild(modal);
    
    // Initialize feather icons
    feather.replace();
    
    // Set up event listeners for the modal
    const closeBtn = document.getElementById('close-lead-form');
    const cancelBtn = document.getElementById('cancel-lead-form');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    }
    
    // Close modal when clicking on backdrop
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    }
    
    // Tab navigation
    const tabButtons = modal.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        modal.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to current tab
        button.classList.add('active');
        const tabId = button.dataset.tab;
        const tabContent = modal.querySelector(`#${tabId}`);
        if (tabContent) {
          tabContent.classList.add('active');
        }
      });
    });
    
    // Range input value display
    ['budget', 'authority', 'need', 'timeline'].forEach(item => {
      const rangeInput = document.getElementById(`${item}-score`);
      if (rangeInput) {
        rangeInput.addEventListener('input', () => {
          const label = rangeInput.previousElementSibling;
          if (label) {
            label.textContent = `${label.textContent.split('(')[0]}(${rangeInput.value})`;
          }
        });
      }
    });
    
    // Form submission
    const form = document.getElementById('lead-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
          name: document.getElementById('lead-name').value,
          position: document.getElementById('lead-position').value,
          status: document.getElementById('lead-status').value,
          source: document.getElementById('lead-source').value,
          campaign: document.getElementById('lead-campaign').value,
          assignedTo: document.getElementById('lead-owner').value,
          phone: document.getElementById('lead-phone').value,
          email: document.getElementById('lead-email').value,
          address: document.getElementById('lead-address').value,
          social: {
            linkedin: document.getElementById('lead-linkedin').value,
            twitter: document.getElementById('lead-twitter').value
          },
          company: document.getElementById('lead-company').value,
          industry: document.getElementById('lead-industry').value,
          companySize: document.getElementById('lead-company-size').value,
          revenue: document.getElementById('lead-revenue').value,
          website: document.getElementById('lead-website').value,
          qualification: {
            budget: parseInt(document.getElementById('budget-score').value),
            authority: parseInt(document.getElementById('authority-score').value),
            need: parseInt(document.getElementById('need-score').value),
            timeline: parseInt(document.getElementById('timeline-score').value),
            notes: document.getElementById('qualification-notes').value
          }
        };
        
        try {
          if (lead) {
            // Update existing lead
            await this.apiService.put(`/api/leads/${lead.id}`, formData);
          } else {
            // Create new lead
            await this.apiService.post('/api/leads', formData);
          }
          
          // Refresh leads
          await this.fetchLeads();
          const tableBody = document.getElementById('leads-table-body');
          if (tableBody) {
            tableBody.innerHTML = this.renderLeadRows();
            feather.replace();
          }
          
          // Close modal
          document.body.removeChild(modal);
          
        } catch (error) {
          console.error('Error saving lead:', error);
          
          // Show error in modal
          const formActions = form.querySelector('.form-actions');
          if (formActions) {
            const errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.textContent = 'Error saving lead. Please try again.';
            formActions.prepend(errorElement);
          }
        }
      });
    }
  }
  
  /**
   * Initiate a call to a lead
   */
  async initiateCall(leadId) {
    try {
      const response = await this.apiService.post(`/api/telephony/call`, {
        leadId,
        direction: 'outbound'
      });
      
      // Navigate to conversation detail if call was initiated
      if (response.conversationId) {
        this.app.store.dispatch({
          type: 'SET_CURRENT_VIEW',
          payload: 'conversations'
        });
        
        this.app.store.dispatch({
          type: 'SET_ACTIVE_CONVERSATION',
          payload: response.conversationId
        });
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      
      // Show error modal
      this.showErrorModal('Call Error', 'Unable to initiate call. Please check if telephony system is available and try again.');
    }
  }
  
  /**
   * Initiate a message to a lead
   */
  async initiateMessage(leadId) {
    try {
      const lead = await this.fetchLead(leadId);
      
      if (!lead) {
        console.error('Lead not found');
        return;
      }
      
      // Show channel selection modal if lead has multiple contact methods
      const hasWhatsApp = !!lead.phone;
      const hasSMS = !!lead.phone;
      const hasEmail = !!lead.email;
      
      if (hasWhatsApp || hasSMS || hasEmail) {
        this.showMessageChannelModal(lead);
      } else {
        // Show error if no contact methods available
        this.showErrorModal('No Contact Method', 'This lead has no phone number or email address for messaging.');
      }
    } catch (error) {
      console.error('Error preparing message:', error);
    }
  }
  
  /**
   * Show modal for selecting message channel
   */
  showMessageChannelModal(lead) {
    const modal = document.createElement('div');
    modal.className = 'modal message-channel-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content small">
        <div class="modal-header">
          <h2>Send Message</h2>
          <button class="close-btn" id="close-channel-modal">
            <i data-feather="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Select a channel to message ${lead.name}:</p>
          
          <div class="channel-buttons">
            ${lead.phone ? `
              <button class="btn btn-channel" data-channel="whatsapp">
                <div class="channel-icon whatsapp">
                  <i data-feather="message-circle"></i>
                </div>
                <div class="channel-name">WhatsApp</div>
                <div class="channel-info">${lead.phone}</div>
              </button>
              
              <button class="btn btn-channel" data-channel="sms">
                <div class="channel-icon sms">
                  <i data-feather="message-square"></i>
                </div>
                <div class="channel-name">SMS</div>
                <div class="channel-info">${lead.phone}</div>
              </button>
            ` : ''}
            
            ${lead.email ? `
              <button class="btn btn-channel" data-channel="email">
                <div class="channel-icon email">
                  <i data-feather="mail"></i>
                </div>
                <div class="channel-name">Email</div>
                <div class="channel-info">${lead.email}</div>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    // Add modal to DOM
    document.body.appendChild(modal);
    
    // Initialize feather icons
    feather.replace();
    
    // Set up event listeners
    const closeBtn = document.getElementById('close-channel-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    }
    
    // Close modal when clicking on backdrop
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    }
    
    // Channel selection buttons
    const channelButtons = modal.querySelectorAll('.btn-channel');
    channelButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const channel = button.dataset.channel;
        
        try {
          // Create conversation with selected channel
          const response = await this.apiService.post('/api/conversations', {
            leadId: lead.id,
            channel
          });
          
          // Close modal
          document.body.removeChild(modal);
          
          // Navigate to conversation detail
          if (response.conversationId) {
            this.app.store.dispatch({
              type: 'SET_CURRENT_VIEW',
              payload: 'conversations'
            });
            
            this.app.store.dispatch({
              type: 'SET_ACTIVE_CONVERSATION',
              payload: response.conversationId
            });
          }
        } catch (error) {
          console.error('Error creating conversation:', error);
          
          // Show error in modal
          const modalBody = modal.querySelector('.modal-body');
          if (modalBody) {
            const errorElement = document.createElement('div');
            errorElement.className = 'modal-error';
            errorElement.textContent = 'Error creating conversation. Please try again.';
            modalBody.appendChild(errorElement);
          }
        }
      });
    });
  }
  
  /**
   * Convert a lead to a customer
   */
  async convertLead(leadId) {
    try {
      const lead = await this.fetchLead(leadId);
      
      if (!lead) {
        console.error('Lead not found');
        return;
      }
      
      // Show conversion modal
      this.showConversionModal(lead);
    } catch (error) {
      console.error('Error preparing lead conversion:', error);
    }
  }
  
  /**
   * Show modal for lead conversion
   */
  showConversionModal(lead) {
    const modal = document.createElement('div');
    modal.className = 'modal conversion-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content medium">
        <div class="modal-header">
          <h2>Convert Lead to Customer</h2>
          <button class="close-btn" id="close-conversion-modal">
            <i data-feather="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>You're about to convert <strong>${lead.name}</strong> from a lead to a customer.</p>
          
          <form id="conversion-form">
            <div class="form-group">
              <label for="opportunity-name">Opportunity Name</label>
              <input type="text" id="opportunity-name" class="form-control" value="${lead.company ? `${lead.company} - New Deal` : `${lead.name} - New Deal`}" required>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="opportunity-value">Deal Value</label>
                <input type="number" id="opportunity-value" class="form-control" required>
              </div>
              
              <div class="form-group">
                <label for="opportunity-currency">Currency</label>
                <select id="opportunity-currency" class="form-control">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="BRL">BRL (R$)</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="opportunity-stage">Stage</label>
                <select id="opportunity-stage" class="form-control">
                  <option value="discovery">Discovery</option>
                  <option value="proposal" selected>Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed_won">Closed Won</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="opportunity-close-date">Expected Close Date</label>
                <input type="date" id="opportunity-close-date" class="form-control" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="opportunity-description">Description</label>
              <textarea id="opportunity-description" class="form-control" rows="3"></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-outline" id="cancel-conversion">Cancel</button>
              <button type="submit" class="btn btn-primary">Convert Lead</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Add modal to DOM
    document.body.appendChild(modal);
    
    // Initialize feather icons
    feather.replace();
    
    // Set default close date (30 days from now)
    const closeDateInput = document.getElementById('opportunity-close-date');
    if (closeDateInput) {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      closeDateInput.value = date.toISOString().split('T')[0];
    }
    
    // Set up event listeners
    const closeBtn = document.getElementById('close-conversion-modal');
    const cancelBtn = document.getElementById('cancel-conversion');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    }
    
    // Close modal when clicking on backdrop
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    }
    
    // Form submission
    const form = document.getElementById('conversion-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
          opportunityName: document.getElementById('opportunity-name').value,
          value: document.getElementById('opportunity-value').value,
          currency: document.getElementById('opportunity-currency').value,
          stage: document.getElementById('opportunity-stage').value,
          closeDate: document.getElementById('opportunity-close-date').value,
          description: document.getElementById('opportunity-description').value
        };
        
        try {
          // Convert lead
          await this.apiService.post(`/api/leads/${lead.id}/convert`, formData);
          
          // Refresh leads
          await this.fetchLeads();
          const tableBody = document.getElementById('leads-table-body');
          if (tableBody) {
            tableBody.innerHTML = this.renderLeadRows();
            feather.replace();
          }
          
          // Close modal
          document.body.removeChild(modal);
          
          // Show success message
          this.showSuccessModal('Lead Converted', `${lead.name} has been successfully converted to a customer.`);
        } catch (error) {
          console.error('Error converting lead:', error);
          
          // Show error in modal
          const formActions = form.querySelector('.form-actions');
          if (formActions) {
            const errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.textContent = 'Error converting lead. Please try again.';
            formActions.prepend(errorElement);
          }
        }
      });
    }
  }
  
  /**
   * Show modal for assigning a lead to an agent
   */
  showAssignModal(leadId) {
    // Implementation for assign modal
  }
  
  /**
   * Show modal for adding a note to a lead
   */
  showAddNoteModal(leadId) {
    // Implementation for add note modal
  }
  
  /**
   * Show modal for scheduling a task for a lead
   */
  showScheduleTaskModal(leadId) {
    // Implementation for schedule task modal
  }
  
  /**
   * Show modal for uploading a file for a lead
   */
  showUploadFileModal(leadId) {
    // Implementation for upload file modal
  }
  
  /**
   * Show confirmation dialog for deleting a lead
   */
  confirmDelete(leadId) {
    // Implementation for delete confirmation
  }
  
  /**
   * Show confirmation dialog for deleting a file
   */
  confirmDeleteFile(leadId, fileId) {
    // Implementation for file delete confirmation
  }
  
  /**
   * Download a file
   */
  async downloadFile(leadId, fileId) {
    // Implementation for file download
  }
  
  /**
   * Show modal for importing leads
   */
  showImportModal() {
    // Implementation for import modal
  }
  
  /**
   * Export leads to CSV
   */
  async exportLeads() {
    // Implementation for leads export
  }
  
  /**
   * Show modal for bulk assigning leads
   */
  showBulkAssignModal(leadIds) {
    // Implementation for bulk assign modal
  }
  
  /**
   * Show modal for bulk status update
   */
  showBulkStatusModal(leadIds) {
    // Implementation for bulk status modal
  }
  
  /**
   * Show modal for bulk adding to campaign
   */
  showBulkCampaignModal(leadIds) {
    // Implementation for bulk campaign modal
  }
  
  /**
   * Show confirmation dialog for bulk deleting leads
   */
  confirmBulkDelete(leadIds) {
    // Implementation for bulk delete confirmation
  }
  
  /**
   * Show success modal
   */
  showSuccessModal(title, message) {
    const modal = document.createElement('div');
    modal.className = 'modal success-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content small">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="close-btn" id="close-success-modal">
            <i data-feather="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="success-icon">
            <i data-feather="check-circle"></i>
          </div>
          <p>${message}</p>
          <div class="modal-actions">
            <button class="btn btn-primary" id="confirm-success-modal">OK</button>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to DOM
    document.body.appendChild(modal);
    
    // Initialize feather icons
    feather.replace();
    
    // Set up event listeners
    const closeBtn = document.getElementById('close-success-modal');
    const confirmBtn = document.getElementById('confirm-success-modal');
    
    const closeModal = () => {
      document.body.removeChild(modal);
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (confirmBtn) confirmBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking on backdrop
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeModal);
  }
  
  /**
   * Show error modal
   */
  showErrorModal(title, message) {
    const modal = document.createElement('div');
    modal.className = 'modal error-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content small">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="close-btn" id="close-error-modal">
            <i data-feather="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="error-icon">
            <i data-feather="alert-circle"></i>
          </div>
          <p>${message}</p>
          <div class="modal-actions">
            <button class="btn btn-primary" id="confirm-error-modal">OK</button>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to DOM
    document.body.appendChild(modal);
    
    // Initialize feather icons
    feather.replace();
    
    // Set up event listeners
    const closeBtn = document.getElementById('close-error-modal');
    const confirmBtn = document.getElementById('confirm-error-modal');
    
    const closeModal = () => {
      document.body.removeChild(modal);
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (confirmBtn) confirmBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking on backdrop
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeModal);
  }
  
  /**
   * Get the selected lead IDs from checkboxes
   */
  getSelectedLeadIds() {
    const checkboxes = document.querySelectorAll('.lead-checkbox:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.dataset.id);
  }
  
  /**
   * Render campaign options for dropdown
   */
  renderCampaignDropdownOptions(selectedId = '') {
    if (!this.filterOptions || !this.filterOptions.campaigns) {
      return '';
    }
    
    return this.filterOptions.campaigns.map(campaign => 
      `<option value="${campaign.id}" ${selectedId === campaign.id ? 'selected' : ''}>${campaign.name}</option>`
    ).join('');
  }
  
  /**
   * Render user options for dropdown
   */
  renderUserDropdownOptions(selectedUser = '') {
    if (!this.filterOptions || !this.filterOptions.users) {
      return '';
    }
    
    return this.filterOptions.users.map(user => 
      `<option value="${user.id}" ${selectedUser === user.id ? 'selected' : ''}>${user.name}</option>`
    ).join('');
  }
  
  /**
   * Get initials from a name
   */
  getInitials(name) {
    if (!name) return '?';
    
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  
  /**
   * Get appropriate label for lead status
   */
  getStatusLabel(status) {
    const labels = {
      'new': 'New',
      'contacted': 'Contacted',
      'qualified': 'Qualified',
      'not-qualified': 'Not Qualified',
      'converted': 'Converted',
      'nurturing': 'Nurturing'
    };
    
    return labels[status] || status;
  }
  
  /**
   * Get appropriate icon for channel type
   */
  getChannelIcon(channel) {
    const icons = {
      'voice': 'phone',
      'whatsapp': 'message-circle',
      'sms': 'message-square',
      'email': 'mail'
    };
    
    return icons[channel] || 'message-circle';
  }
  
  /**
   * Get CSS class for channel icon
   */
  getChannelIconClass(channel) {
    const classes = {
      'voice': 'channel-voice',
      'whatsapp': 'channel-whatsapp',
      'sms': 'channel-sms',
      'email': 'channel-email'
    };
    
    return classes[channel] || '';
  }
  
  /**
   * Get appropriate icon for note type
   */
  getNoteIcon(type) {
    const icons = {
      'note': 'file-text',
      'call': 'phone',
      'meeting': 'users',
      'task': 'check-square',
      'email': 'mail',
      'system': 'settings'
    };
    
    return icons[type] || 'file-text';
  }
  
  /**
   * Get CSS class for note icon
   */
  getNoteIconClass(type) {
    const classes = {
      'note': 'icon-note',
      'call': 'icon-call',
      'meeting': 'icon-meeting',
      'task': 'icon-task',
      'email': 'icon-email',
      'system': 'icon-system'
    };
    
    return classes[type] || 'icon-note';
  }
  
  /**
   * Get appropriate icon for file type
   */
  getFileIcon(type) {
    const icons = {
      'pdf': 'file-text',
      'doc': 'file-text',
      'docx': 'file-text',
      'xls': 'file',
      'xlsx': 'file',
      'ppt': 'file',
      'pptx': 'file',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'mp3': 'music',
      'mp4': 'video',
      'zip': 'archive'
    };
    
    return icons[type.toLowerCase()] || 'file';
  }
  
  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  /**
   * Format time into relative time (e.g. "2 hours ago")
   */
  formatTimeAgo(timestamp) {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) {
      return 'just now';
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}
