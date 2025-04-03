/**
 * Flow Builder Component
 * Conversation flow designer for call and message automation
 */
class FlowBuilderComponent {
  constructor(app) {
    this.app = app;
    this.store = app.store;
    this.apiService = app.apiService;
    this.currentFlow = null;
    this.flows = [];
    this.selectedNode = null;
    this.draggedNode = null;
    this.dragStartPosition = { x: 0, y: 0 };
    this.canvasPosition = { x: 0, y: 0 };
    this.canvasScale = 1;
    this.isConnecting = false;
    this.connectionSource = null;
    this.connectionTarget = null;
    this.mousePosition = { x: 0, y: 0 };
    this.isEditing = false;
    this.undoStack = [];
    this.redoStack = [];
  }
  
  /**
   * Fetch flows from the API
   */
  async fetchFlows() {
    try {
      const data = await this.apiService.get('/api/flows');
      this.flows = data.flows;
      return data;
    } catch (error) {
      console.error('Error fetching flows:', error);
      return { flows: [] };
    }
  }
  
  /**
   * Fetch a specific flow by ID
   */
  async fetchFlow(id) {
    try {
      const flow = await this.apiService.get(`/api/flows/${id}`);
      this.currentFlow = flow;
      this.saveUndoState();
      return flow;
    } catch (error) {
      console.error(`Error fetching flow ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Render the flow builder component
   */
  async render(container) {
    // Show loading state
    container.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading flow builder...</p>
      </div>
    `;
    
    // Fetch flows
    await this.fetchFlows();
    
    // If current flow is set, fetch its details
    if (this.currentFlow?.id) {
      await this.fetchFlow(this.currentFlow.id);
    }
    
    // Render the flow builder
    container.innerHTML = `
      <div class="flow-builder-container">
        <div class="flow-sidebar">
          <div class="flow-sidebar-header">
            <h3>Conversation Flows</h3>
            <button class="btn btn-sm btn-primary" id="new-flow-btn">
              <i data-feather="plus"></i>
              New Flow
            </button>
          </div>
          
          <div class="flow-list">
            ${this.renderFlowList()}
          </div>
          
          <div class="flow-sidebar-section">
            <h4>Node Types</h4>
            <div class="node-palette">
              <div class="node-type" draggable="true" data-node-type="message">
                <i data-feather="message-square"></i>
                <span>Message</span>
              </div>
              
              <div class="node-type" draggable="true" data-node-type="question">
                <i data-feather="help-circle"></i>
                <span>Question</span>
              </div>
              
              <div class="node-type" draggable="true" data-node-type="condition">
                <i data-feather="git-branch"></i>
                <span>Condition</span>
              </div>
              
              <div class="node-type" draggable="true" data-node-type="api">
                <i data-feather="server"></i>
                <span>API Call</span>
              </div>
              
              <div class="node-type" draggable="true" data-node-type="delay">
                <i data-feather="clock"></i>
                <span>Delay</span>
              </div>
              
              <div class="node-type" draggable="true" data-node-type="end">
                <i data-feather="x-circle"></i>
                <span>End Flow</span>
              </div>
            </div>
          </div>
          
          ${this.currentFlow ? `
          <div class="flow-sidebar-section">
            <h4>Flow Settings</h4>
            <div class="flow-settings">
              <div class="form-group">
                <label>Trigger Type</label>
                <select id="flow-trigger-type" class="form-select">
                  <option value="inbound" ${this.currentFlow.triggerType === 'inbound' ? 'selected' : ''}>Inbound Call</option>
                  <option value="outbound" ${this.currentFlow.triggerType === 'outbound' ? 'selected' : ''}>Outbound Call</option>
                  <option value="message" ${this.currentFlow.triggerType === 'message' ? 'selected' : ''}>Message</option>
                  <option value="webhook" ${this.currentFlow.triggerType === 'webhook' ? 'selected' : ''}>Webhook</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Status</label>
                <select id="flow-status" class="form-select">
                  <option value="draft" ${this.currentFlow.status === 'draft' ? 'selected' : ''}>Draft</option>
                  <option value="active" ${this.currentFlow.status === 'active' ? 'selected' : ''}>Active</option>
                  <option value="inactive" ${this.currentFlow.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
              </div>
              
              <div class="form-actions">
                <button class="btn btn-primary" id="save-flow-btn">Save Flow</button>
                <button class="btn btn-outline" id="test-flow-btn">Test Flow</button>
              </div>
            </div>
          </div>
          ` : ''}
          
          <div class="flow-sidebar-actions">
            <button class="btn btn-sm btn-outline" id="undo-btn" ${this.undoStack.length === 0 ? 'disabled' : ''}>
              <i data-feather="corner-up-left"></i>
              Undo
            </button>
            
            <button class="btn btn-sm btn-outline" id="redo-btn" ${this.redoStack.length === 0 ? 'disabled' : ''}>
              <i data-feather="corner-up-right"></i>
              Redo
            </button>
            
            ${this.currentFlow ? `
            <button class="btn btn-sm btn-outline danger" id="delete-flow-btn">
              <i data-feather="trash-2"></i>
              Delete Flow
            </button>
            ` : ''}
          </div>
        </div>
        
        <div class="flow-main">
          <div class="flow-toolbar">
            ${this.currentFlow ? `
            <div class="flow-info">
              <h2 class="flow-title">${this.currentFlow.name}</h2>
              <span class="flow-status ${this.currentFlow.status}">${this.currentFlow.status}</span>
            </div>
            
            <div class="flow-tools">
              <button class="btn btn-sm btn-outline" id="zoom-in-btn" title="Zoom In">
                <i data-feather="zoom-in"></i>
              </button>
              
              <button class="btn btn-sm btn-outline" id="zoom-out-btn" title="Zoom Out">
                <i data-feather="zoom-out"></i>
              </button>
              
              <button class="btn btn-sm btn-outline" id="zoom-reset-btn" title="Reset Zoom">
                <i data-feather="maximize"></i>
              </button>
              
              <button class="btn btn-sm btn-outline" id="center-flow-btn" title="Center Flow">
                <i data-feather="move"></i>
              </button>
              
              <button class="btn btn-sm btn-outline" id="toggle-grid-btn" title="Toggle Grid">
                <i data-feather="grid"></i>
              </button>
            </div>
            ` : `
            <div class="flow-empty-message">
              Select a flow from the sidebar or create a new one to get started
            </div>
            `}
          </div>
          
          <div class="flow-canvas" id="flow-canvas">
            ${this.currentFlow ? this.renderFlowNodes() : ''}
          </div>
        </div>
        
        ${this.selectedNode ? `
        <div class="node-properties">
          <div class="properties-header">
            <h3>Node Properties</h3>
            <button class="properties-close" id="close-properties-btn">
              <i data-feather="x"></i>
            </button>
          </div>
          
          <div class="properties-content">
            ${this.renderNodeProperties()}
          </div>
        </div>
        ` : ''}
      </div>
    `;
    
    // Initialize feather icons
    feather.replace();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize canvas if flow is loaded
    if (this.currentFlow) {
      this.initializeCanvas();
    }
  }
  
  /**
   * Render flow list
   */
  renderFlowList() {
    if (!this.flows || this.flows.length === 0) {
      return `
        <div class="empty-list">
          <i data-feather="file" style="width: 24px; height: 24px; color: var(--text-secondary);"></i>
          <p>No flows found</p>
          <p class="empty-list-subtitle">Create a new flow to get started</p>
        </div>
      `;
    }
    
    return this.flows.map(flow => `
      <div class="flow-item ${this.currentFlow && flow.id === this.currentFlow.id ? 'active' : ''}" data-flow-id="${flow.id}">
        <div class="flow-item-icon">
          <i data-feather="${this.getFlowIcon(flow.triggerType)}"></i>
        </div>
        <div class="flow-item-info">
          <div class="flow-item-name">${flow.name}</div>
          <div class="flow-item-meta">
            <span class="flow-status ${flow.status}">${flow.status}</span>
            <span class="flow-date">${this.formatDate(flow.updatedAt)}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  /**
   * Render flow nodes
   */
  renderFlowNodes() {
    if (!this.currentFlow || !this.currentFlow.nodes || this.currentFlow.nodes.length === 0) {
      return `
        <div class="empty-canvas">
          <i data-feather="git-branch" style="width: 48px; height: 48px; color: var(--text-secondary);"></i>
          <p>This flow has no nodes</p>
          <p class="empty-canvas-subtitle">Drag node types from the sidebar to create your flow</p>
        </div>
      `;
    }
    
    return this.currentFlow.nodes.map(node => `
      <div class="flow-node ${node.type}" 
           data-node-id="${node.id}" 
           style="left: ${node.position.x}px; top: ${node.position.y}px;">
        <div class="node-header">
          <i data-feather="${this.getNodeIcon(node.type)}"></i>
          <span class="node-title">${node.name || this.getNodeTypeLabel(node.type)}</span>
          <div class="node-actions">
            <button class="node-action" data-action="edit" title="Edit Node">
              <i data-feather="edit-2" style="width: 12px; height: 12px;"></i>
            </button>
            <button class="node-action" data-action="delete" title="Delete Node">
              <i data-feather="trash-2" style="width: 12px; height: 12px;"></i>
            </button>
          </div>
        </div>
        <div class="node-content">
          ${this.renderNodeContent(node)}
        </div>
        <div class="node-connector input" data-connector-type="input" data-node-id="${node.id}"></div>
        <div class="node-connector output" data-connector-type="output" data-node-id="${node.id}"></div>
      </div>
    `).join('');
  }
  
  /**
   * Render node content based on type
   */
  renderNodeContent(node) {
    switch (node.type) {
      case 'message':
        return `<p class="node-text">${node.data?.message || 'No message content'}</p>`;
      case 'question':
        return `
          <p class="node-text">${node.data?.question || 'No question content'}</p>
          <div class="node-options">
            ${node.data?.options?.map(option => 
              `<div class="node-option">${option.text}</div>`
            ).join('') || '<div class="node-option">No options defined</div>'}
          </div>
        `;
      case 'condition':
        return `<p class="node-condition">${node.data?.condition || 'No condition defined'}</p>`;
      case 'api':
        return `<p class="node-api-endpoint">${node.data?.endpoint || 'No endpoint defined'}</p>`;
      case 'delay':
        return `<p class="node-delay">${node.data?.duration || '0'} ${node.data?.unit || 'seconds'}</p>`;
      case 'end':
        return `<p class="node-end-reason">${node.data?.reason || 'End of conversation'}</p>`;
      default:
        return '<p class="node-empty">Empty Node</p>';
    }
  }
  
  /**
   * Render node properties panel
   */
  renderNodeProperties() {
    if (!this.selectedNode) return '';
    
    const node = this.currentFlow.nodes.find(n => n.id === this.selectedNode);
    if (!node) return '';
    
    switch (node.type) {
      case 'message':
        return `
          <div class="form-group">
            <label>Node Name</label>
            <input type="text" class="form-control" id="node-name" value="${node.name || ''}">
          </div>
          
          <div class="form-group">
            <label>Message</label>
            <textarea class="form-control" id="node-message" rows="5">${node.data?.message || ''}</textarea>
          </div>
          
          <div class="form-group">
            <label>Voice</label>
            <select class="form-select" id="node-voice">
              <option value="default" ${node.data?.voice === 'default' ? 'selected' : ''}>Default</option>
              <option value="male" ${node.data?.voice === 'male' ? 'selected' : ''}>Male</option>
              <option value="female" ${node.data?.voice === 'female' ? 'selected' : ''}>Female</option>
            </select>
          </div>
          
          <div class="form-check">
            <input type="checkbox" class="form-check-input" id="node-collect-response" ${node.data?.collectResponse ? 'checked' : ''}>
            <label class="form-check-label" for="node-collect-response">Collect Response</label>
          </div>
          
          <div class="form-actions">
            <button class="btn btn-primary" id="save-node-btn">Save Changes</button>
            <button class="btn btn-outline" id="cancel-edit-btn">Cancel</button>
          </div>
        `;
      case 'question':
        return `
          <div class="form-group">
            <label>Node Name</label>
            <input type="text" class="form-control" id="node-name" value="${node.name || ''}">
          </div>
          
          <div class="form-group">
            <label>Question</label>
            <textarea class="form-control" id="node-question" rows="3">${node.data?.question || ''}</textarea>
          </div>
          
          <div class="form-group">
            <label>Options</label>
            <div id="options-container">
              ${(node.data?.options || []).map((option, index) => `
                <div class="option-item" data-option-index="${index}">
                  <input type="text" class="form-control option-text" value="${option.text || ''}">
                  <button class="btn btn-sm btn-outline remove-option">
                    <i data-feather="x"></i>
                  </button>
                </div>
              `).join('') || ''}
            </div>
            <button class="btn btn-sm btn-outline" id="add-option-btn">
              <i data-feather="plus"></i> Add Option
            </button>
          </div>
          
          <div class="form-actions">
            <button class="btn btn-primary" id="save-node-btn">Save Changes</button>
            <button class="btn btn-outline" id="cancel-edit-btn">Cancel</button>
          </div>
        `;
      default:
        return `
          <div class="form-group">
            <label>Node Name</label>
            <input type="text" class="form-control" id="node-name" value="${node.name || ''}">
          </div>
          
          <div class="form-message">
            This node type has no additional properties.
          </div>
          
          <div class="form-actions">
            <button class="btn btn-primary" id="save-node-btn">Save Changes</button>
            <button class="btn btn-outline" id="cancel-edit-btn">Cancel</button>
          </div>
        `;
    }
  }
  
  /**
   * Initialize canvas and set up interactions
   */
  initializeCanvas() {
    const canvas = document.getElementById('flow-canvas');
    if (!canvas) return;
    
    // Set up drag interactions for existing nodes
    document.querySelectorAll('.flow-node').forEach(node => {
      node.addEventListener('mousedown', this.startNodeDrag.bind(this));
    });
    
    // Set up connections
    this.renderConnections();
    
    // Set up canvas pan and zoom
    canvas.addEventListener('mousedown', this.startCanvasPan.bind(this));
    canvas.addEventListener('wheel', this.handleCanvasZoom.bind(this));
    
    // Track mouse movement for drawing connections
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mousePosition.x = e.clientX - rect.left;
      this.mousePosition.y = e.clientY - rect.top;
      
      if (this.isConnecting) {
        this.updateConnectionLine();
      }
    });
  }
  
  /**
   * Render connections between nodes
   */
  renderConnections() {
    const canvas = document.getElementById('flow-canvas');
    if (!canvas || !this.currentFlow?.connections) return;
    
    // Remove existing connections
    canvas.querySelectorAll('.flow-connection').forEach(conn => conn.remove());
    
    // Add connections
    this.currentFlow.connections.forEach(connection => {
      const sourceNode = document.querySelector(`.flow-node[data-node-id="${connection.sourceId}"]`);
      const targetNode = document.querySelector(`.flow-node[data-node-id="${connection.targetId}"]`);
      
      if (sourceNode && targetNode) {
        const sourceConnector = sourceNode.querySelector('.node-connector.output');
        const targetConnector = targetNode.querySelector('.node-connector.input');
        
        if (sourceConnector && targetConnector) {
          const sourceRect = sourceConnector.getBoundingClientRect();
          const targetRect = targetConnector.getBoundingClientRect();
          const canvasRect = canvas.getBoundingClientRect();
          
          const x1 = sourceRect.left + sourceRect.width / 2 - canvasRect.left;
          const y1 = sourceRect.top + sourceRect.height / 2 - canvasRect.top;
          const x2 = targetRect.left + targetRect.width / 2 - canvasRect.left;
          const y2 = targetRect.top + targetRect.height / 2 - canvasRect.top;
          
          this.createConnectionLine(x1, y1, x2, y2, connection.id);
        }
      }
    });
  }
  
  /**
   * Create a connection line between two points
   */
  createConnectionLine(x1, y1, x2, y2, id) {
    const canvas = document.getElementById('flow-canvas');
    if (!canvas) return;
    
    const connectionLine = document.createElement('div');
    connectionLine.className = 'flow-connection';
    if (id) connectionLine.dataset.connectionId = id;
    
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    connectionLine.style.width = `${length}px`;
    connectionLine.style.left = `${x1}px`;
    connectionLine.style.top = `${y1}px`;
    connectionLine.style.transform = `rotate(${angle}deg)`;
    
    canvas.appendChild(connectionLine);
  }
  
  /**
   * Set up event listeners for flow builder
   */
  setupEventListeners() {
    // Flow list item click
    document.querySelectorAll('.flow-item').forEach(item => {
      item.addEventListener('click', async () => {
        const flowId = item.dataset.flowId;
        await this.fetchFlow(flowId);
        this.render(document.getElementById('view-container'));
      });
    });
    
    // New flow button
    document.getElementById('new-flow-btn')?.addEventListener('click', () => {
      this.showNewFlowModal();
    });
    
    // Save flow button
    document.getElementById('save-flow-btn')?.addEventListener('click', async () => {
      await this.saveFlow();
    });
    
    // Node type drag start
    document.querySelectorAll('.node-type').forEach(nodeType => {
      nodeType.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('node-type', nodeType.dataset.nodeType);
      });
    });
    
    // Canvas drag over
    document.getElementById('flow-canvas')?.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    
    // Canvas drop
    document.getElementById('flow-canvas')?.addEventListener('drop', (e) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData('node-type');
      if (nodeType) {
        const canvas = document.getElementById('flow-canvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.addNode(nodeType, x, y);
      }
    });
    
    // Node connectors event listeners
    document.querySelectorAll('.node-connector').forEach(connector => {
      connector.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        
        const nodeId = connector.dataset.nodeId;
        const connectorType = connector.dataset.connectorType;
        
        if (connectorType === 'output') {
          this.startConnection(nodeId, 'output');
        } else if (connectorType === 'input') {
          this.startConnection(nodeId, 'input');
        }
      });
    });
    
    // Node editing
    document.querySelectorAll('.node-action[data-action="edit"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const node = e.target.closest('.flow-node');
        if (node) {
          this.selectedNode = node.dataset.nodeId;
          this.isEditing = true;
          this.render(document.getElementById('view-container'));
        }
      });
    });
    
    // Node deletion
    document.querySelectorAll('.node-action[data-action="delete"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const node = e.target.closest('.flow-node');
        if (node) {
          this.deleteNode(node.dataset.nodeId);
        }
      });
    });
    
    // Save node button
    document.getElementById('save-node-btn')?.addEventListener('click', () => {
      this.saveNodeProperties();
    });
    
    // Cancel edit button
    document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
      this.selectedNode = null;
      this.isEditing = false;
      this.render(document.getElementById('view-container'));
    });
    
    // Undo button
    document.getElementById('undo-btn')?.addEventListener('click', () => {
      this.undo();
    });
    
    // Redo button
    document.getElementById('redo-btn')?.addEventListener('click', () => {
      this.redo();
    });
    
    // Delete flow button
    document.getElementById('delete-flow-btn')?.addEventListener('click', () => {
      this.confirmDeleteFlow();
    });
  }
  
  /**
   * Add a new node to the flow
   */
  addNode(type, x, y) {
    if (!this.currentFlow) return;
    
    const newNode = {
      id: this.generateId(),
      type: type,
      name: this.getNodeTypeLabel(type),
      position: { x, y },
      data: this.getDefaultNodeData(type)
    };
    
    this.currentFlow.nodes.push(newNode);
    this.saveUndoState();
    this.render(document.getElementById('view-container'));
  }
  
  /**
   * Delete a node from the flow
   */
  deleteNode(nodeId) {
    if (!this.currentFlow) return;
    
    // Remove the node
    this.currentFlow.nodes = this.currentFlow.nodes.filter(node => node.id !== nodeId);
    
    // Remove any connections to or from this node
    this.currentFlow.connections = this.currentFlow.connections.filter(
      conn => conn.sourceId !== nodeId && conn.targetId !== nodeId
    );
    
    this.saveUndoState();
    this.render(document.getElementById('view-container'));
  }
  
  /**
   * Start dragging a node
   */
  startNodeDrag(e) {
    if (e.target.classList.contains('node-connector') || 
        e.target.classList.contains('node-action')) {
      return;
    }
    
    const node = e.target.closest('.flow-node');
    if (!node) return;
    
    this.draggedNode = node;
    this.dragStartPosition = {
      x: e.clientX,
      y: e.clientY
    };
    
    const nodePosition = {
      x: parseInt(node.style.left),
      y: parseInt(node.style.top)
    };
    
    // Add event listeners for dragging
    document.addEventListener('mousemove', this.handleNodeDrag);
    document.addEventListener('mouseup', this.endNodeDrag);
    
    // Helper function for node dragging
    this.handleNodeDrag = (e) => {
      if (!this.draggedNode) return;
      
      const deltaX = e.clientX - this.dragStartPosition.x;
      const deltaY = e.clientY - this.dragStartPosition.y;
      
      const newX = nodePosition.x + deltaX;
      const newY = nodePosition.y + deltaY;
      
      this.draggedNode.style.left = `${newX}px`;
      this.draggedNode.style.top = `${newY}px`;
      
      // Update connections
      this.renderConnections();
    };
    
    // Helper function for ending node drag
    this.endNodeDrag = () => {
      if (!this.draggedNode) return;
      
      // Update node position in flow data
      const nodeId = this.draggedNode.dataset.nodeId;
      const node = this.currentFlow.nodes.find(n => n.id === nodeId);
      
      if (node) {
        node.position = {
          x: parseInt(this.draggedNode.style.left),
          y: parseInt(this.draggedNode.style.top)
        };
        
        this.saveUndoState();
      }
      
      // Clean up
      document.removeEventListener('mousemove', this.handleNodeDrag);
      document.removeEventListener('mouseup', this.endNodeDrag);
      this.draggedNode = null;
    };
  }
  
  /**
   * Start a new connection
   */
  startConnection(nodeId, connectorType) {
    this.isConnecting = true;
    this.connectionSource = { nodeId, type: connectorType };
    
    // Create temporary connection line
    const canvas = document.getElementById('flow-canvas');
    const tempLine = document.createElement('div');
    tempLine.className = 'flow-connection temp';
    tempLine.id = 'temp-connection';
    canvas.appendChild(tempLine);
    
    // Add event listeners for connecting
    document.addEventListener('mouseup', this.endConnection);
    
    // Helper function for ending connection
    this.endConnection = (e) => {
      const targetElement = document.elementFromPoint(e.clientX, e.clientY);
      const connector = targetElement.closest('.node-connector');
      
      if (connector) {
        const targetNodeId = connector.dataset.nodeId;
        const targetType = connector.dataset.connectorType;
        
        // Check if valid connection (output to input)
        if (this.connectionSource.type !== targetType) {
          // Determine source and target based on connector types
          let sourceId, targetId;
          
          if (this.connectionSource.type === 'output') {
            sourceId = this.connectionSource.nodeId;
            targetId = targetNodeId;
          } else {
            sourceId = targetNodeId;
            targetId = this.connectionSource.nodeId;
          }
          
          // Check if connection already exists
          const existingConnection = this.currentFlow.connections.find(
            conn => conn.sourceId === sourceId && conn.targetId === targetId
          );
          
          if (!existingConnection && sourceId !== targetId) {
            // Add new connection
            if (!this.currentFlow.connections) {
              this.currentFlow.connections = [];
            }
            
            this.currentFlow.connections.push({
              id: this.generateId(),
              sourceId,
              targetId
            });
            
            this.saveUndoState();
            this.render(document.getElementById('view-container'));
          }
        }
      }
      
      // Clean up
      document.removeEventListener('mouseup', this.endConnection);
      document.getElementById('temp-connection')?.remove();
      this.isConnecting = false;
      this.connectionSource = null;
    };
  }
  
  /**
   * Update the temporary connection line
   */
  updateConnectionLine() {
    if (!this.isConnecting || !this.connectionSource) return;
    
    const canvas = document.getElementById('flow-canvas');
    const tempLine = document.getElementById('temp-connection');
    if (!canvas || !tempLine) return;
    
    const sourceNode = document.querySelector(`.flow-node[data-node-id="${this.connectionSource.nodeId}"]`);
    if (!sourceNode) return;
    
    const sourceConnector = sourceNode.querySelector(`.node-connector.${this.connectionSource.type}`);
    if (!sourceConnector) return;
    
    const sourceRect = sourceConnector.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    let x1, y1, x2, y2;
    
    if (this.connectionSource.type === 'output') {
      x1 = sourceRect.left + sourceRect.width / 2 - canvasRect.left;
      y1 = sourceRect.top + sourceRect.height / 2 - canvasRect.top;
      x2 = this.mousePosition.x;
      y2 = this.mousePosition.y;
    } else {
      x1 = this.mousePosition.x;
      y1 = this.mousePosition.y;
      x2 = sourceRect.left + sourceRect.width / 2 - canvasRect.left;
      y2 = sourceRect.top + sourceRect.height / 2 - canvasRect.top;
    }
    
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    tempLine.style.width = `${length}px`;
    tempLine.style.left = `${x1}px`;
    tempLine.style.top = `${y1}px`;
    tempLine.style.transform = `rotate(${angle}deg)`;
  }
  
  /**
   * Start canvas panning
   */
  startCanvasPan(e) {
    // Only pan if clicking directly on the canvas (not on nodes)
    if (e.target.id !== 'flow-canvas') return;
    
    this.isPanning = true;
    this.panStartPosition = {
      x: e.clientX,
      y: e.clientY
    };
    
    // Add event listeners for panning
    document.addEventListener('mousemove', this.handleCanvasPan);
    document.addEventListener('mouseup', this.endCanvasPan);
    
    // Helper function for canvas panning
    this.handleCanvasPan = (e) => {
      if (!this.isPanning) return;
      
      const deltaX = e.clientX - this.panStartPosition.x;
      const deltaY = e.clientY - this.panStartPosition.y;
      
      // Update all node positions
      document.querySelectorAll('.flow-node').forEach(node => {
        const currentX = parseInt(node.style.left);
        const currentY = parseInt(node.style.top);
        
        node.style.left = `${currentX + deltaX}px`;
        node.style.top = `${currentY + deltaY}px`;
      });
      
      // Update node positions in flow data
      if (this.currentFlow?.nodes) {
        this.currentFlow.nodes.forEach(node => {
          node.position.x += deltaX;
          node.position.y += deltaY;
        });
      }
      
      // Update connections
      this.renderConnections();
      
      // Reset start position for next move
      this.panStartPosition = {
        x: e.clientX,
        y: e.clientY
      };
    };
    
    // Helper function for ending canvas pan
    this.endCanvasPan = () => {
      this.isPanning = false;
      document.removeEventListener('mousemove', this.handleCanvasPan);
      document.removeEventListener('mouseup', this.endCanvasPan);
      
      if (this.currentFlow) {
        this.saveUndoState();
      }
    };
  }
  
  /**
   * Handle canvas zooming
   */
  handleCanvasZoom(e) {
    e.preventDefault();
    
    // Implement zoom functionality if needed
  }
  
  /**
   * Save node properties
   */
  saveNodeProperties() {
    if (!this.selectedNode || !this.currentFlow) return;
    
    const node = this.currentFlow.nodes.find(n => n.id === this.selectedNode);
    if (!node) return;
    
    // Get common properties
    node.name = document.getElementById('node-name')?.value || node.name;
    
    // Get type-specific properties
    switch (node.type) {
      case 'message':
        node.data = {
          ...node.data,
          message: document.getElementById('node-message')?.value || '',
          voice: document.getElementById('node-voice')?.value || 'default',
          collectResponse: document.getElementById('node-collect-response')?.checked || false
        };
        break;
      case 'question':
        const options = [];
        document.querySelectorAll('.option-item').forEach(optionItem => {
          const optionText = optionItem.querySelector('.option-text')?.value;
          if (optionText) {
            options.push({ text: optionText });
          }
        });
        
        node.data = {
          ...node.data,
          question: document.getElementById('node-question')?.value || '',
          options: options
        };
        break;
    }
    
    this.selectedNode = null;
    this.isEditing = false;
    this.saveUndoState();
    this.render(document.getElementById('view-container'));
  }
  
  /**
   * Save the current flow
   */
  async saveFlow() {
    if (!this.currentFlow) return;
    
    try {
      // Update flow settings
      this.currentFlow.triggerType = document.getElementById('flow-trigger-type')?.value || this.currentFlow.triggerType;
      this.currentFlow.status = document.getElementById('flow-status')?.value || this.currentFlow.status;
      
      // Save to API
      const response = await this.apiService.put(`/api/flows/${this.currentFlow.id}`, this.currentFlow);
      
      this.currentFlow = response;
      this.saveUndoState();
      
      // Show success message
      // TODO: Implement toast or notification
      
      return response;
    } catch (error) {
      console.error('Error saving flow:', error);
      // Show error message
      return null;
    }
  }
  
  /**
   * Show new flow modal
   */
  showNewFlowModal() {
    // TODO: Implement modal UI
    const flowName = prompt('Enter flow name:');
    if (flowName) {
      this.createNewFlow(flowName);
    }
  }
  
  /**
   * Create a new flow
   */
  async createNewFlow(name) {
    try {
      const newFlow = {
        name,
        triggerType: 'inbound',
        status: 'draft',
        nodes: [],
        connections: []
      };
      
      const response = await this.apiService.post('/api/flows', newFlow);
      
      this.currentFlow = response;
      this.flows.push(response);
      this.saveUndoState();
      this.render(document.getElementById('view-container'));
      
      return response;
    } catch (error) {
      console.error('Error creating flow:', error);
      return null;
    }
  }
  
  /**
   * Confirm flow deletion
   */
  confirmDeleteFlow() {
    if (!this.currentFlow) return;
    
    // TODO: Implement modal UI
    const confirm = window.confirm(`Are you sure you want to delete the flow "${this.currentFlow.name}"?`);
    if (confirm) {
      this.deleteFlow();
    }
  }
  
  /**
   * Delete the current flow
   */
  async deleteFlow() {
    if (!this.currentFlow) return;
    
    try {
      await this.apiService.delete(`/api/flows/${this.currentFlow.id}`);
      
      // Remove from flows array
      this.flows = this.flows.filter(flow => flow.id !== this.currentFlow.id);
      
      // Reset current flow
      this.currentFlow = null;
      this.selectedNode = null;
      
      this.render(document.getElementById('view-container'));
    } catch (error) {
      console.error('Error deleting flow:', error);
    }
  }
  
  /**
   * Save the current state for undo/redo
   */
  saveUndoState() {
    if (!this.currentFlow) return;
    
    // Avoid saving duplicate states
    if (this.undoStack.length > 0) {
      const lastState = this.undoStack[this.undoStack.length - 1];
      if (JSON.stringify(lastState) === JSON.stringify(this.currentFlow)) {
        return;
      }
    }
    
    // Save a deep copy of current flow to undo stack
    this.undoStack.push(JSON.parse(JSON.stringify(this.currentFlow)));
    
    // Clear redo stack when a new action is performed
    this.redoStack = [];
  }
  
  /**
   * Undo the last action
   */
  undo() {
    if (this.undoStack.length === 0) return;
    
    // Save current state to redo stack
    this.redoStack.push(JSON.parse(JSON.stringify(this.currentFlow)));
    
    // Pop the last state from undo stack
    this.currentFlow = this.undoStack.pop();
    
    this.render(document.getElementById('view-container'));
  }
  
  /**
   * Redo the last undone action
   */
  redo() {
    if (this.redoStack.length === 0) return;
    
    // Save current state to undo stack
    this.undoStack.push(JSON.parse(JSON.stringify(this.currentFlow)));
    
    // Pop the last state from redo stack
    this.currentFlow = this.redoStack.pop();
    
    this.render(document.getElementById('view-container'));
  }
  
  /**
   * Get default data for a new node
   */
  getDefaultNodeData(type) {
    switch (type) {
      case 'message':
        return { message: 'New message', voice: 'default', collectResponse: false };
      case 'question':
        return { question: 'New question', options: [{ text: 'Option 1' }] };
      case 'condition':
        return { condition: 'leadScore > 50' };
      case 'api':
        return { endpoint: '/api/example', method: 'GET' };
      case 'delay':
        return { duration: 5, unit: 'seconds' };
      case 'end':
        return { reason: 'End of conversation' };
      default:
        return {};
    }
  }
  
  /**
   * Get icon for a node type
   */
  getNodeIcon(type) {
    switch (type) {
      case 'message': return 'message-square';
      case 'question': return 'help-circle';
      case 'condition': return 'git-branch';
      case 'api': return 'server';
      case 'delay': return 'clock';
      case 'end': return 'x-circle';
      default: return 'circle';
    }
  }
  
  /**
   * Get icon for a flow type
   */
  getFlowIcon(triggerType) {
    switch (triggerType) {
      case 'inbound': return 'phone-incoming';
      case 'outbound': return 'phone-outgoing';
      case 'message': return 'message-square';
      case 'webhook': return 'server';
      default: return 'git-branch';
    }
  }
  
  /**
   * Get label for a node type
   */
  getNodeTypeLabel(type) {
    switch (type) {
      case 'message': return 'Message';
      case 'question': return 'Question';
      case 'condition': return 'Condition';
      case 'api': return 'API Call';
      case 'delay': return 'Delay';
      case 'end': return 'End Flow';
      default: return 'Node';
    }
  }
  
  /**
   * Generate a unique ID
   */
  generateId() {
    return 'node_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}