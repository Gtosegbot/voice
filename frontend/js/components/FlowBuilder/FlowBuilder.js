/**
 * Flow Builder component for VoiceAI platform
 */

class FlowBuilder {
    constructor() {
        this.element = document.getElementById('flow-builder-page');
        this.nodes = [];
        this.connections = [];
        this.draggedNode = null;
        this.selectedNode = null;
        this.nodeCounter = 0;
        this.canvas = null;
        this.ctx = null;
    }
    
    /**
     * Initialize flow builder
     */
    async init() {
        if (!this.element) return;
        
        try {
            // Render flow builder
            this.render();
            
            // Initialize canvas
            this.initCanvas();
            
            // Set up event handlers
            this.setupEventHandlers();
            
            // Add initial trigger node
            this.addNode('trigger', 'Gatilho de Início', 100, 100);
        } catch (error) {
            console.error('Error initializing flow builder:', error);
        }
    }
    
    /**
     * Render flow builder
     */
    render() {
        this.element.innerHTML = `
            <div class="flow-builder-container">
                <div class="flow-builder-sidebar">
                    <h2>Construtor de Fluxo</h2>
                    
                    <div class="flow-header">
                        <div class="form-group mb-3">
                            <label for="flow-name">Nome do Fluxo</label>
                            <input type="text" id="flow-name" class="form-control" placeholder="Meu Fluxo">
                        </div>
                        
                        <div class="form-group mb-3">
                            <label for="flow-trigger">Tipo de Gatilho</label>
                            <select id="flow-trigger" class="form-select">
                                <option value="inbound">Chamada Recebida</option>
                                <option value="outbound">Chamada Realizada</option>
                                <option value="message">Mensagem Recebida</option>
                                <option value="webhook">Webhook</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="flow-toolbox">
                        <h4>Componentes</h4>
                        
                        <div class="toolbox-group">
                            <h5>Mensagens</h5>
                            <div class="toolbox-item" draggable="true" data-node-type="message">
                                <i class="fas fa-comment"></i> Mensagem
                            </div>
                            <div class="toolbox-item" draggable="true" data-node-type="question">
                                <i class="fas fa-question-circle"></i> Pergunta
                            </div>
                        </div>
                        
                        <div class="toolbox-group">
                            <h5>Lógica</h5>
                            <div class="toolbox-item" draggable="true" data-node-type="condition">
                                <i class="fas fa-code-branch"></i> Condição
                            </div>
                            <div class="toolbox-item" draggable="true" data-node-type="delay">
                                <i class="fas fa-clock"></i> Espera
                            </div>
                        </div>
                        
                        <div class="toolbox-group">
                            <h5>Integrações</h5>
                            <div class="toolbox-item" draggable="true" data-node-type="api">
                                <i class="fas fa-plug"></i> API
                            </div>
                            <div class="toolbox-item" draggable="true" data-node-type="ai">
                                <i class="fas fa-robot"></i> IA
                            </div>
                        </div>
                        
                        <div class="toolbox-group">
                            <h5>Ações</h5>
                            <div class="toolbox-item" draggable="true" data-node-type="call">
                                <i class="fas fa-phone"></i> Chamada
                            </div>
                            <div class="toolbox-item" draggable="true" data-node-type="end">
                                <i class="fas fa-flag-checkered"></i> Fim
                            </div>
                        </div>
                    </div>
                    
                    <div class="flow-actions">
                        <button id="save-flow-btn" class="btn btn-primary">Salvar Fluxo</button>
                        <button id="test-flow-btn" class="btn btn-secondary">Testar Fluxo</button>
                    </div>
                </div>
                
                <div class="flow-builder-canvas" id="flow-canvas">
                    <canvas id="connections-canvas"></canvas>
                    <!-- Nodes will be added dynamically -->
                </div>
            </div>
            
            <!-- Node Properties Modal -->
            <div class="modal fade" id="node-properties-modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="node-properties-title">Propriedades do Nó</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="node-properties-body">
                            <!-- Properties form will be added dynamically -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="save-node-properties-btn">Salvar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Initialize canvas
     */
    initCanvas() {
        this.canvas = document.getElementById('connections-canvas');
        if (!this.canvas) return;
        
        // Set canvas size
        const container = document.getElementById('flow-canvas');
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            
            // Update canvas size on window resize
            window.addEventListener('resize', () => {
                this.canvas.width = container.clientWidth;
                this.canvas.height = container.clientHeight;
                this.drawConnections();
            });
        }
        
        this.ctx = this.canvas.getContext('2d');
    }
    
    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Drag and drop handlers for toolbox items
        const toolboxItems = document.querySelectorAll('.toolbox-item');
        toolboxItems.forEach(item => {
            item.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('nodeType', item.getAttribute('data-node-type'));
            });
        });
        
        // Canvas drag and drop handlers
        const canvas = document.getElementById('flow-canvas');
        if (canvas) {
            canvas.addEventListener('dragover', (event) => {
                event.preventDefault();
            });
            
            canvas.addEventListener('drop', (event) => {
                event.preventDefault();
                
                const nodeType = event.dataTransfer.getData('nodeType');
                if (nodeType) {
                    // Add node at drop position
                    const rect = canvas.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    
                    this.addNode(nodeType, this.getNodeTitle(nodeType), x, y);
                }
            });
            
            // Mouse events for node selection and dragging
            canvas.addEventListener('mousedown', (event) => {
                const rect = canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                
                // Check if clicked on a node
                for (let i = this.nodes.length - 1; i >= 0; i--) {
                    const node = this.nodes[i];
                    if (x >= node.x && x <= node.x + node.width &&
                        y >= node.y && y <= node.y + node.height) {
                        
                        // Select node
                        this.selectNode(node);
                        
                        // Start dragging
                        this.draggedNode = node;
                        this.dragOffsetX = x - node.x;
                        this.dragOffsetY = y - node.y;
                        
                        break;
                    }
                }
            });
            
            canvas.addEventListener('mousemove', (event) => {
                if (this.draggedNode) {
                    const rect = canvas.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    
                    // Update node position
                    this.draggedNode.x = x - this.dragOffsetX;
                    this.draggedNode.y = y - this.dragOffsetY;
                    
                    // Update node element position
                    const nodeElement = document.getElementById(`node-${this.draggedNode.id}`);
                    if (nodeElement) {
                        nodeElement.style.left = `${this.draggedNode.x}px`;
                        nodeElement.style.top = `${this.draggedNode.y}px`;
                    }
                    
                    // Redraw connections
                    this.drawConnections();
                }
            });
            
            canvas.addEventListener('mouseup', () => {
                this.draggedNode = null;
            });
        }
        
        // Save node properties
        const saveNodePropertiesBtn = document.getElementById('save-node-properties-btn');
        if (saveNodePropertiesBtn) {
            saveNodePropertiesBtn.addEventListener('click', () => {
                this.saveNodeProperties();
            });
        }
        
        // Save flow
        const saveFlowBtn = document.getElementById('save-flow-btn');
        if (saveFlowBtn) {
            saveFlowBtn.addEventListener('click', () => {
                this.saveFlow();
            });
        }
        
        // Test flow
        const testFlowBtn = document.getElementById('test-flow-btn');
        if (testFlowBtn) {
            testFlowBtn.addEventListener('click', () => {
                this.testFlow();
            });
        }
    }
    
    /**
     * Add node to the canvas
     */
    addNode(type, title, x, y) {
        const id = ++this.nodeCounter;
        
        // Create node data
        const node = {
            id,
            type,
            title,
            x,
            y,
            width: 180,
            height: 80,
            data: {}
        };
        
        // Add to nodes array
        this.nodes.push(node);
        
        // Create node element
        const nodeElement = document.createElement('div');
        nodeElement.id = `node-${id}`;
        nodeElement.className = `flow-node node-${type}`;
        nodeElement.style.left = `${x}px`;
        nodeElement.style.top = `${y}px`;
        
        // Add node content
        nodeElement.innerHTML = `
            <div class="flow-node-header">
                <span class="node-title">${title}</span>
                <div class="node-actions">
                    <button class="node-edit-btn" title="Editar">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="node-delete-btn" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="flow-node-content">
                ${this.getNodeContent(type)}
            </div>
            <div class="node-connectors">
                <div class="node-input-connector" data-node-id="${id}"></div>
                <div class="node-output-connector" data-node-id="${id}"></div>
            </div>
        `;
        
        // Add to canvas
        const canvas = document.getElementById('flow-canvas');
        canvas.appendChild(nodeElement);
        
        // Add event listeners
        const editBtn = nodeElement.querySelector('.node-edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.openNodeProperties(node);
            });
        }
        
        const deleteBtn = nodeElement.querySelector('.node-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.deleteNode(node);
            });
        }
        
        // Add connector event listeners
        const outputConnector = nodeElement.querySelector('.node-output-connector');
        if (outputConnector) {
            outputConnector.addEventListener('mousedown', (event) => {
                event.stopPropagation();
                this.startConnectionDrag(node);
            });
        }
        
        const inputConnector = nodeElement.querySelector('.node-input-connector');
        if (inputConnector) {
            inputConnector.addEventListener('mouseup', (event) => {
                event.stopPropagation();
                this.endConnectionDrag(node);
            });
        }
        
        return node;
    }
    
    /**
     * Get node title based on type
     */
    getNodeTitle(type) {
        switch (type) {
            case 'trigger':
                return 'Gatilho de Início';
            case 'message':
                return 'Enviar Mensagem';
            case 'question':
                return 'Fazer Pergunta';
            case 'condition':
                return 'Condição';
            case 'delay':
                return 'Esperar';
            case 'api':
                return 'Chamada de API';
            case 'ai':
                return 'Processamento de IA';
            case 'call':
                return 'Realizar Chamada';
            case 'end':
                return 'Fim do Fluxo';
            default:
                return 'Nó';
        }
    }
    
    /**
     * Get node content HTML based on type
     */
    getNodeContent(type) {
        switch (type) {
            case 'trigger':
                return '<p><small>Início do fluxo</small></p>';
            case 'message':
                return '<p><small>Enviar uma mensagem ao lead</small></p>';
            case 'question':
                return '<p><small>Perguntar e capturar resposta</small></p>';
            case 'condition':
                return '<p><small>Ramificar baseado em condição</small></p>';
            case 'delay':
                return '<p><small>Aguardar por um período</small></p>';
            case 'api':
                return '<p><small>Integração com sistema externo</small></p>';
            case 'ai':
                return '<p><small>Análise com Inteligência Artificial</small></p>';
            case 'call':
                return '<p><small>Iniciar uma chamada telefônica</small></p>';
            case 'end':
                return '<p><small>Finalizar fluxo</small></p>';
            default:
                return '';
        }
    }
    
    /**
     * Start connection drag
     */
    startConnectionDrag(node) {
        this.connectionSource = node;
        
        // Add mousemove and mouseup handlers
        const canvas = document.getElementById('flow-canvas');
        if (canvas) {
            this.tempConnectionHandler = (event) => {
                const rect = canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                
                // Draw temporary connection
                this.drawTempConnection(node.x + node.width / 2, node.y + node.height / 2, x, y);
            };
            
            this.tempConnectionEndHandler = () => {
                // Clear temp connection
                this.drawConnections();
                
                // Remove handlers
                canvas.removeEventListener('mousemove', this.tempConnectionHandler);
                canvas.removeEventListener('mouseup', this.tempConnectionEndHandler);
            };
            
            canvas.addEventListener('mousemove', this.tempConnectionHandler);
            canvas.addEventListener('mouseup', this.tempConnectionEndHandler);
        }
    }
    
    /**
     * End connection drag
     */
    endConnectionDrag(node) {
        if (this.connectionSource && node.id !== this.connectionSource.id) {
            // Create connection
            this.connections.push({
                source: this.connectionSource.id,
                target: node.id,
                label: ''
            });
            
            // Redraw connections
            this.drawConnections();
        }
        
        this.connectionSource = null;
    }
    
    /**
     * Draw connections
     */
    drawConnections() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections
        this.connections.forEach(connection => {
            const sourceNode = this.findNodeById(connection.source);
            const targetNode = this.findNodeById(connection.target);
            
            if (sourceNode && targetNode) {
                const sourceX = sourceNode.x + sourceNode.width / 2;
                const sourceY = sourceNode.y + sourceNode.height / 2;
                const targetX = targetNode.x + targetNode.width / 2;
                const targetY = targetNode.y + targetNode.height / 2;
                
                this.drawConnection(sourceX, sourceY, targetX, targetY, connection.label);
            }
        });
    }
    
    /**
     * Draw temporary connection
     */
    drawTempConnection(sourceX, sourceY, targetX, targetY) {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw existing connections
        this.drawConnections();
        
        // Draw temporary connection
        this.drawConnection(sourceX, sourceY, targetX, targetY, '');
    }
    
    /**
     * Draw a connection line
     */
    drawConnection(sourceX, sourceY, targetX, targetY, label) {
        if (!this.ctx) return;
        
        // Calculate control points for curve
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const controlX1 = sourceX + dx / 2;
        const controlY1 = sourceY;
        const controlX2 = sourceX + dx / 2;
        const controlY2 = targetY;
        
        // Draw curve
        this.ctx.beginPath();
        this.ctx.moveTo(sourceX, sourceY);
        this.ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, targetX, targetY);
        this.ctx.strokeStyle = '#4a6fe9';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw arrow
        const angle = Math.atan2(targetY - controlY2, targetX - controlX2);
        const arrowSize = 10;
        
        this.ctx.beginPath();
        this.ctx.moveTo(targetX, targetY);
        this.ctx.lineTo(
            targetX - arrowSize * Math.cos(angle - Math.PI / 6),
            targetY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            targetX - arrowSize * Math.cos(angle + Math.PI / 6),
            targetY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fillStyle = '#4a6fe9';
        this.ctx.fill();
        
        // Draw label
        if (label) {
            const labelX = sourceX + dx / 2;
            const labelY = sourceY + dy / 2 - 10;
            
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(labelX - 20, labelY - 10, 40, 20);
            
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#333';
            this.ctx.fillText(label, labelX, labelY);
        }
    }
    
    /**
     * Find node by ID
     */
    findNodeById(id) {
        return this.nodes.find(node => node.id === id);
    }
    
    /**
     * Select a node
     */
    selectNode(node) {
        // Deselect current selection
        if (this.selectedNode) {
            const element = document.getElementById(`node-${this.selectedNode.id}`);
            if (element) {
                element.classList.remove('selected');
            }
        }
        
        // Select new node
        this.selectedNode = node;
        
        // Highlight selected node
        const element = document.getElementById(`node-${node.id}`);
        if (element) {
            element.classList.add('selected');
        }
    }
    
    /**
     * Open node properties modal
     */
    openNodeProperties(node) {
        const modal = document.getElementById('node-properties-modal');
        const modalTitle = document.getElementById('node-properties-title');
        const modalBody = document.getElementById('node-properties-body');
        
        if (!modal || !modalTitle || !modalBody) return;
        
        // Set modal title
        modalTitle.textContent = `Propriedades: ${node.title}`;
        
        // Generate properties form based on node type
        modalBody.innerHTML = this.getNodePropertiesForm(node);
        
        // Set form values
        Object.keys(node.data).forEach(key => {
            const input = modalBody.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = node.data[key];
            }
        });
        
        // Store current node
        this.editingNode = node;
        
        // Show modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }
    
    /**
     * Get node properties form HTML
     */
    getNodePropertiesForm(node) {
        switch (node.type) {
            case 'trigger':
                return `
                    <div class="mb-3">
                        <label class="form-label">Tipo de Gatilho</label>
                        <select name="triggerType" class="form-select">
                            <option value="inbound" ${node.data.triggerType === 'inbound' ? 'selected' : ''}>Chamada Recebida</option>
                            <option value="outbound" ${node.data.triggerType === 'outbound' ? 'selected' : ''}>Chamada Realizada</option>
                            <option value="message" ${node.data.triggerType === 'message' ? 'selected' : ''}>Mensagem Recebida</option>
                            <option value="webhook" ${node.data.triggerType === 'webhook' ? 'selected' : ''}>Webhook</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Descrição</label>
                        <textarea name="description" class="form-control" rows="3">${node.data.description || ''}</textarea>
                    </div>
                `;
            
            case 'message':
                return `
                    <div class="mb-3">
                        <label class="form-label">Mensagem</label>
                        <textarea name="message" class="form-control" rows="3">${node.data.message || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Canal</label>
                        <select name="channel" class="form-select">
                            <option value="voice" ${node.data.channel === 'voice' ? 'selected' : ''}>Voz</option>
                            <option value="whatsapp" ${node.data.channel === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
                            <option value="sms" ${node.data.channel === 'sms' ? 'selected' : ''}>SMS</option>
                            <option value="email" ${node.data.channel === 'email' ? 'selected' : ''}>Email</option>
                        </select>
                    </div>
                `;
            
            case 'question':
                return `
                    <div class="mb-3">
                        <label class="form-label">Pergunta</label>
                        <textarea name="question" class="form-control" rows="3">${node.data.question || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Variável para Armazenar Resposta</label>
                        <input type="text" name="variable" class="form-control" value="${node.data.variable || ''}">
                    </div>
                `;
            
            case 'condition':
                return `
                    <div class="mb-3">
                        <label class="form-label">Condição</label>
                        <textarea name="condition" class="form-control" rows="3">${node.data.condition || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Descrição</label>
                        <input type="text" name="description" class="form-control" value="${node.data.description || ''}">
                    </div>
                `;
            
            case 'delay':
                return `
                    <div class="mb-3">
                        <label class="form-label">Duração (segundos)</label>
                        <input type="number" name="duration" class="form-control" value="${node.data.duration || 0}">
                    </div>
                `;
            
            case 'api':
                return `
                    <div class="mb-3">
                        <label class="form-label">URL da API</label>
                        <input type="text" name="url" class="form-control" value="${node.data.url || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Método</label>
                        <select name="method" class="form-select">
                            <option value="GET" ${node.data.method === 'GET' ? 'selected' : ''}>GET</option>
                            <option value="POST" ${node.data.method === 'POST' ? 'selected' : ''}>POST</option>
                            <option value="PUT" ${node.data.method === 'PUT' ? 'selected' : ''}>PUT</option>
                            <option value="DELETE" ${node.data.method === 'DELETE' ? 'selected' : ''}>DELETE</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Payload</label>
                        <textarea name="payload" class="form-control" rows="3">${node.data.payload || ''}</textarea>
                    </div>
                `;
            
            case 'ai':
                return `
                    <div class="mb-3">
                        <label class="form-label">Tipo de Análise</label>
                        <select name="aiType" class="form-select">
                            <option value="sentiment" ${node.data.aiType === 'sentiment' ? 'selected' : ''}>Análise de Sentimento</option>
                            <option value="intent" ${node.data.aiType === 'intent' ? 'selected' : ''}>Detecção de Intenção</option>
                            <option value="entity" ${node.data.aiType === 'entity' ? 'selected' : ''}>Reconhecimento de Entidade</option>
                            <option value="custom" ${node.data.aiType === 'custom' ? 'selected' : ''}>Personalizado</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Variável de Entrada</label>
                        <input type="text" name="inputVariable" class="form-control" value="${node.data.inputVariable || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Variável de Saída</label>
                        <input type="text" name="outputVariable" class="form-control" value="${node.data.outputVariable || ''}">
                    </div>
                `;
            
            case 'call':
                return `
                    <div class="mb-3">
                        <label class="form-label">Número de Telefone</label>
                        <input type="text" name="phoneNumber" class="form-control" value="${node.data.phoneNumber || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Roteiro</label>
                        <textarea name="script" class="form-control" rows="3">${node.data.script || ''}</textarea>
                    </div>
                `;
            
            case 'end':
                return `
                    <div class="mb-3">
                        <label class="form-label">Motivo do Fim</label>
                        <select name="endReason" class="form-select">
                            <option value="completed" ${node.data.endReason === 'completed' ? 'selected' : ''}>Fluxo Completo</option>
                            <option value="success" ${node.data.endReason === 'success' ? 'selected' : ''}>Sucesso</option>
                            <option value="failure" ${node.data.endReason === 'failure' ? 'selected' : ''}>Falha</option>
                            <option value="timeout" ${node.data.endReason === 'timeout' ? 'selected' : ''}>Tempo Esgotado</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Mensagem Final</label>
                        <textarea name="message" class="form-control" rows="3">${node.data.message || ''}</textarea>
                    </div>
                `;
            
            default:
                return `
                    <div class="mb-3">
                        <label class="form-label">Nome</label>
                        <input type="text" name="name" class="form-control" value="${node.data.name || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Descrição</label>
                        <textarea name="description" class="form-control" rows="3">${node.data.description || ''}</textarea>
                    </div>
                `;
        }
    }
    
    /**
     * Save node properties
     */
    saveNodeProperties() {
        if (!this.editingNode) return;
        
        // Get form data
        const form = document.getElementById('node-properties-body');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, textarea, select');
        const data = {};
        
        inputs.forEach(input => {
            data[input.name] = input.value;
        });
        
        // Update node data
        this.editingNode.data = data;
        
        // Close modal
        const modal = document.getElementById('node-properties-modal');
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        
        this.editingNode = null;
    }
    
    /**
     * Delete node
     */
    deleteNode(node) {
        // Confirm deletion
        if (!confirm(`Tem certeza que deseja excluir o nó "${node.title}"?`)) {
            return;
        }
        
        // Remove node from array
        this.nodes = this.nodes.filter(n => n.id !== node.id);
        
        // Remove node element
        const nodeElement = document.getElementById(`node-${node.id}`);
        if (nodeElement) {
            nodeElement.remove();
        }
        
        // Remove connections to/from node
        this.connections = this.connections.filter(conn => conn.source !== node.id && conn.target !== node.id);
        
        // Redraw connections
        this.drawConnections();
    }
    
    /**
     * Save flow
     */
    async saveFlow() {
        try {
            const flowName = document.getElementById('flow-name').value;
            const flowTrigger = document.getElementById('flow-trigger').value;
            
            if (!flowName) {
                alert('Por favor, dê um nome ao fluxo.');
                return;
            }
            
            const flowData = {
                name: flowName,
                trigger_type: flowTrigger,
                nodes: JSON.stringify(this.nodes),
                connections: JSON.stringify(this.connections)
            };
            
            // In a real application, you would save this to the API
            // await ApiService.saveFlow(flowData);
            
            window.store.setNotification('Fluxo salvo com sucesso', 'success');
        } catch (error) {
            console.error('Error saving flow:', error);
            window.store.setNotification('Erro ao salvar fluxo', 'danger');
        }
    }
    
    /**
     * Test flow
     */
    testFlow() {
        try {
            window.store.setNotification('Modo de teste não disponível no momento', 'info');
        } catch (error) {
            console.error('Error testing flow:', error);
        }
    }
}

// Export the flow builder component
window.FlowBuilder = new FlowBuilder();
