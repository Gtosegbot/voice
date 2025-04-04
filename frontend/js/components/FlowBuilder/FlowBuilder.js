/**
 * Flow Builder Component
 * This component renders the flow builder page
 */

/**
 * Initialize the flow builder
 */
function initFlowBuilder() {
    renderFlowBuilder();
    setupFlowBuilderEvents();
    loadFlows();
}

/**
 * Render the flow builder HTML
 */
function renderFlowBuilder() {
    const flowBuilderPage = document.getElementById('flow-builder-page');
    
    flowBuilderPage.innerHTML = `
        <div class="flow-builder-container">
            <div class="flow-builder-sidebar">
                <div class="p-3">
                    <h5>Construtor de Fluxo</h5>
                    <div class="mb-3">
                        <label class="form-label">Fluxo Ativo</label>
                        <select class="form-select" id="flow-select">
                            <option value="">Selecionar fluxo...</option>
                            <!-- Will be populated dynamically -->
                        </select>
                    </div>
                    <div class="mb-3">
                        <button class="btn btn-primary btn-sm w-100" id="new-flow-btn">
                            <i class="fas fa-plus"></i> Novo Fluxo
                        </button>
                    </div>
                    <hr>
                    <h6>Elementos</h6>
                    <p class="text-muted small">Arraste e solte no canvas</p>
                    
                    <div class="node-elements">
                        <div class="node-item" draggable="true" data-node-type="trigger">
                            <i class="fas fa-play-circle"></i> Gatilho
                        </div>
                        <div class="node-item" draggable="true" data-node-type="message">
                            <i class="fas fa-comment"></i> Mensagem
                        </div>
                        <div class="node-item" draggable="true" data-node-type="condition">
                            <i class="fas fa-code-branch"></i> Condição
                        </div>
                        <div class="node-item" draggable="true" data-node-type="delay">
                            <i class="fas fa-clock"></i> Delay
                        </div>
                        <div class="node-item" draggable="true" data-node-type="api">
                            <i class="fas fa-plug"></i> API
                        </div>
                        <div class="node-item" draggable="true" data-node-type="ai">
                            <i class="fas fa-robot"></i> IA
                        </div>
                    </div>
                    
                    <hr>
                    <div class="mb-3">
                        <button class="btn btn-success btn-sm w-100" id="save-flow-btn" disabled>
                            <i class="fas fa-save"></i> Salvar Fluxo
                        </button>
                    </div>
                    <div class="mb-3">
                        <button class="btn btn-outline-secondary btn-sm w-100" id="test-flow-btn" disabled>
                            <i class="fas fa-flask"></i> Testar Fluxo
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="flow-builder-canvas" id="flow-canvas">
                <div class="text-center p-5">
                    <i class="fas fa-sitemap fa-3x text-muted mb-3"></i>
                    <p>Selecione um fluxo existente ou crie um novo.</p>
                    <p class="small text-muted">Você pode arrastar elementos do painel lateral para o canvas.</p>
                </div>
            </div>
        </div>
        
        <!-- New Flow Modal -->
        <div class="modal fade" id="new-flow-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Novo Fluxo</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="new-flow-form">
                            <div class="mb-3">
                                <label for="flow-name" class="form-label">Nome do Fluxo</label>
                                <input type="text" class="form-control" id="flow-name" required>
                            </div>
                            <div class="mb-3">
                                <label for="flow-trigger-type" class="form-label">Tipo de Gatilho</label>
                                <select class="form-select" id="flow-trigger-type" required>
                                    <option value="">Selecionar...</option>
                                    <option value="inbound">Entrada (WhatsApp, SMS)</option>
                                    <option value="outbound">Saída (Campanhas)</option>
                                    <option value="webhook">Webhook</option>
                                    <option value="scheduled">Agendado</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="flow-campaign" class="form-label">Campanha (opcional)</label>
                                <select class="form-select" id="flow-campaign">
                                    <option value="">Nenhuma</option>
                                    <option value="1">Campanha de Vendas Q2</option>
                                    <option value="2">Reengajamento de Leads</option>
                                    <option value="3">Novos Produtos</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="create-flow-btn">Criar</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Node Config Modal -->
        <div class="modal fade" id="node-config-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="node-config-title">Configurar Nó</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="node-config-form">
                        <!-- Will be populated dynamically based on node type -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger me-auto" id="delete-node-btn">Excluir</button>
                        <button type="button" class="btn btn-primary" id="save-node-btn">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Set up flow builder event listeners
 */
function setupFlowBuilderEvents() {
    // New flow button
    const newFlowBtn = document.getElementById('new-flow-btn');
    if (newFlowBtn) {
        newFlowBtn.addEventListener('click', () => {
            const newFlowModal = new bootstrap.Modal(document.getElementById('new-flow-modal'));
            newFlowModal.show();
        });
    }
    
    // Create flow button
    const createFlowBtn = document.getElementById('create-flow-btn');
    if (createFlowBtn) {
        createFlowBtn.addEventListener('click', createNewFlow);
    }
    
    // Flow select
    const flowSelect = document.getElementById('flow-select');
    if (flowSelect) {
        flowSelect.addEventListener('change', () => {
            const flowId = flowSelect.value;
            if (flowId) {
                loadFlow(flowId);
            } else {
                resetCanvas();
            }
        });
    }
    
    // Save flow button
    const saveFlowBtn = document.getElementById('save-flow-btn');
    if (saveFlowBtn) {
        saveFlowBtn.addEventListener('click', saveFlow);
    }
    
    // Test flow button
    const testFlowBtn = document.getElementById('test-flow-btn');
    if (testFlowBtn) {
        testFlowBtn.addEventListener('click', testFlow);
    }
    
    // Drag and drop functionality for nodes
    setupDragAndDrop();
}

/**
 * Set up drag and drop functionality
 */
function setupDragAndDrop() {
    const nodeItems = document.querySelectorAll('.node-item');
    const canvas = document.getElementById('flow-canvas');
    
    // Drag start event for node items
    nodeItems.forEach(item => {
        item.addEventListener('dragstart', e => {
            e.dataTransfer.setData('nodeType', item.getAttribute('data-node-type'));
        });
    });
    
    // Drag over event for canvas
    canvas.addEventListener('dragover', e => {
        e.preventDefault();
    });
    
    // Drop event for canvas
    canvas.addEventListener('drop', e => {
        e.preventDefault();
        
        const nodeType = e.dataTransfer.getData('nodeType');
        
        // Get drop position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create a new node
        createNode(nodeType, x, y);
    });
}

/**
 * Create a new node on the canvas
 * @param {string} nodeType - Type of node to create
 * @param {number} x - X position on canvas
 * @param {number} y - Y position on canvas
 */
function createNode(nodeType, x, y) {
    // Check if a flow is selected
    const flowId = document.getElementById('flow-select').value;
    if (!flowId) {
        alert('Selecione um fluxo primeiro.');
        return;
    }
    
    // Enable save and test buttons
    document.getElementById('save-flow-btn').disabled = false;
    document.getElementById('test-flow-btn').disabled = false;
    
    // Generate a unique ID for the node
    const nodeId = `node-${Date.now()}`;
    
    // Get node title and icon based on type
    let nodeTitle, nodeIcon;
    switch (nodeType) {
        case 'trigger':
            nodeTitle = 'Gatilho';
            nodeIcon = 'play-circle';
            break;
        case 'message':
            nodeTitle = 'Mensagem';
            nodeIcon = 'comment';
            break;
        case 'condition':
            nodeTitle = 'Condição';
            nodeIcon = 'code-branch';
            break;
        case 'delay':
            nodeTitle = 'Delay';
            nodeIcon = 'clock';
            break;
        case 'api':
            nodeTitle = 'API';
            nodeIcon = 'plug';
            break;
        case 'ai':
            nodeTitle = 'IA';
            nodeIcon = 'robot';
            break;
        default:
            nodeTitle = 'Nó';
            nodeIcon = 'circle';
    }
    
    // Create the node element
    const nodeElement = document.createElement('div');
    nodeElement.id = nodeId;
    nodeElement.className = `flow-node ${nodeType}`;
    nodeElement.style.left = `${x}px`;
    nodeElement.style.top = `${y}px`;
    nodeElement.setAttribute('data-node-type', nodeType);
    
    nodeElement.innerHTML = `
        <div class="flow-node-title">
            <i class="fas fa-${nodeIcon}"></i> ${nodeTitle}
        </div>
        <div class="flow-node-content">
            <p class="text-muted">Clique para configurar</p>
        </div>
    `;
    
    // Add the node to the canvas
    document.getElementById('flow-canvas').appendChild(nodeElement);
    
    // Make the node draggable
    makeNodeDraggable(nodeElement);
    
    // Add click event to configure the node
    nodeElement.addEventListener('click', () => {
        configureNode(nodeId, nodeType);
    });
}

/**
 * Make a node draggable
 * @param {HTMLElement} nodeElement - The node element to make draggable
 */
function makeNodeDraggable(nodeElement) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    nodeElement.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Get the mouse cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Set the element's new position
        nodeElement.style.top = (nodeElement.offsetTop - pos2) + "px";
        nodeElement.style.left = (nodeElement.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

/**
 * Configure a node
 * @param {string} nodeId - ID of the node to configure
 * @param {string} nodeType - Type of the node
 */
function configureNode(nodeId, nodeType) {
    // Set the node ID and type as data attributes on the modal
    const modal = document.getElementById('node-config-modal');
    modal.setAttribute('data-node-id', nodeId);
    modal.setAttribute('data-node-type', nodeType);
    
    // Update the modal title
    let nodeTitle;
    switch (nodeType) {
        case 'trigger':
            nodeTitle = 'Configurar Gatilho';
            break;
        case 'message':
            nodeTitle = 'Configurar Mensagem';
            break;
        case 'condition':
            nodeTitle = 'Configurar Condição';
            break;
        case 'delay':
            nodeTitle = 'Configurar Delay';
            break;
        case 'api':
            nodeTitle = 'Configurar API';
            break;
        case 'ai':
            nodeTitle = 'Configurar IA';
            break;
        default:
            nodeTitle = 'Configurar Nó';
    }
    document.getElementById('node-config-title').textContent = nodeTitle;
    
    // Generate the form based on node type
    const formContent = generateNodeForm(nodeType);
    document.getElementById('node-config-form').innerHTML = formContent;
    
    // Set up delete button
    document.getElementById('delete-node-btn').addEventListener('click', () => {
        deleteNode(nodeId);
        bootstrap.Modal.getInstance(modal).hide();
    });
    
    // Set up save button
    document.getElementById('save-node-btn').addEventListener('click', () => {
        saveNodeConfig(nodeId, nodeType);
        bootstrap.Modal.getInstance(modal).hide();
    });
    
    // Show the modal
    const nodeModal = new bootstrap.Modal(modal);
    nodeModal.show();
}

/**
 * Generate form content based on node type
 * @param {string} nodeType - Type of the node
 * @returns {string} HTML content for the form
 */
function generateNodeForm(nodeType) {
    let formHTML = '';
    
    switch (nodeType) {
        case 'trigger':
            formHTML = `
                <div class="mb-3">
                    <label class="form-label">Tipo de Gatilho</label>
                    <select class="form-select" id="trigger-type">
                        <option value="inbound">Entrada (WhatsApp, SMS)</option>
                        <option value="outbound">Saída (Campanhas)</option>
                        <option value="webhook">Webhook</option>
                        <option value="scheduled">Agendado</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Condição de Ativação</label>
                    <input type="text" class="form-control" id="trigger-condition" placeholder="Ex: mensagem contém 'ajuda'">
                </div>
                <div class="mb-3">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-control" id="trigger-description" rows="2"></textarea>
                </div>
            `;
            break;
            
        case 'message':
            formHTML = `
                <div class="mb-3">
                    <label class="form-label">Canal</label>
                    <select class="form-select" id="message-channel">
                        <option value="whatsapp">WhatsApp</option>
                        <option value="sms">SMS</option>
                        <option value="voice">Voz</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Conteúdo da Mensagem</label>
                    <textarea class="form-control" id="message-content" rows="4" placeholder="Digite o texto da mensagem..."></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Personalização</label>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="message-personalize">
                        <label class="form-check-label" for="message-personalize">
                            Incluir nome do lead
                        </label>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Mídia (opcional)</label>
                    <select class="form-select" id="message-media-type">
                        <option value="none">Nenhuma</option>
                        <option value="image">Imagem</option>
                        <option value="document">Documento</option>
                        <option value="audio">Áudio</option>
                    </select>
                </div>
                <div class="mb-3" id="message-media-url-container" style="display: none;">
                    <label class="form-label">URL da Mídia</label>
                    <input type="text" class="form-control" id="message-media-url">
                </div>
            `;
            break;
            
        case 'condition':
            formHTML = `
                <div class="mb-3">
                    <label class="form-label">Tipo de Condição</label>
                    <select class="form-select" id="condition-type">
                        <option value="message">Conteúdo da Mensagem</option>
                        <option value="lead">Atributo do Lead</option>
                        <option value="time">Data/Hora</option>
                        <option value="custom">Personalizado</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Operador</label>
                    <select class="form-select" id="condition-operator">
                        <option value="contains">Contém</option>
                        <option value="equals">Igual a</option>
                        <option value="greater">Maior que</option>
                        <option value="less">Menor que</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Valor</label>
                    <input type="text" class="form-control" id="condition-value">
                </div>
                <div class="mb-3">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-control" id="condition-description" rows="2"></textarea>
                </div>
            `;
            break;
            
        case 'delay':
            formHTML = `
                <div class="mb-3">
                    <label class="form-label">Duração</label>
                    <div class="input-group">
                        <input type="number" class="form-control" id="delay-duration" min="1" value="1">
                        <select class="form-select" id="delay-unit">
                            <option value="minutes">Minutos</option>
                            <option value="hours">Horas</option>
                            <option value="days">Dias</option>
                        </select>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Tipo de Delay</label>
                    <select class="form-select" id="delay-type">
                        <option value="fixed">Fixo</option>
                        <option value="working-hours">Apenas Horário Comercial</option>
                        <option value="custom">Personalizado</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-control" id="delay-description" rows="2"></textarea>
                </div>
            `;
            break;
            
        case 'api':
            formHTML = `
                <div class="mb-3">
                    <label class="form-label">Endpoint URL</label>
                    <input type="text" class="form-control" id="api-url">
                </div>
                <div class="mb-3">
                    <label class="form-label">Método</label>
                    <select class="form-select" id="api-method">
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Headers (JSON)</label>
                    <textarea class="form-control" id="api-headers" rows="2" placeholder='{"Content-Type": "application/json"}'></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Payload (JSON)</label>
                    <textarea class="form-control" id="api-payload" rows="3" placeholder='{"key": "value"}'></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-control" id="api-description" rows="2"></textarea>
                </div>
            `;
            break;
            
        case 'ai':
            formHTML = `
                <div class="mb-3">
                    <label class="form-label">Tipo de IA</label>
                    <select class="form-select" id="ai-type">
                        <option value="text-generation">Geração de Texto</option>
                        <option value="intent-detection">Detecção de Intenção</option>
                        <option value="sentiment-analysis">Análise de Sentimento</option>
                        <option value="entity-extraction">Extração de Entidades</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Prompt</label>
                    <textarea class="form-control" id="ai-prompt" rows="3" placeholder="Instruções para a IA..."></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Variáveis de Contexto</label>
                    <input type="text" class="form-control" id="ai-variables" placeholder="lead.name, lead.company, etc.">
                </div>
                <div class="mb-3">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-control" id="ai-description" rows="2"></textarea>
                </div>
            `;
            break;
            
        default:
            formHTML = `
                <div class="mb-3">
                    <label class="form-label">Nome</label>
                    <input type="text" class="form-control" id="node-name">
                </div>
                <div class="mb-3">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-control" id="node-description" rows="3"></textarea>
                </div>
            `;
    }
    
    return formHTML;
}

/**
 * Save node configuration
 * @param {string} nodeId - ID of the node
 * @param {string} nodeType - Type of the node
 */
function saveNodeConfig(nodeId, nodeType) {
    const nodeElement = document.getElementById(nodeId);
    
    // Get the node content element
    const nodeContent = nodeElement.querySelector('.flow-node-content');
    
    // Update node content based on type
    switch (nodeType) {
        case 'trigger':
            const triggerType = document.getElementById('trigger-type').value;
            const triggerCondition = document.getElementById('trigger-condition').value;
            
            let triggerTypeText;
            switch (triggerType) {
                case 'inbound': triggerTypeText = 'Entrada'; break;
                case 'outbound': triggerTypeText = 'Saída'; break;
                case 'webhook': triggerTypeText = 'Webhook'; break;
                case 'scheduled': triggerTypeText = 'Agendado'; break;
                default: triggerTypeText = triggerType;
            }
            
            nodeContent.innerHTML = `
                <p><strong>${triggerTypeText}</strong></p>
                <p class="small">${triggerCondition || 'Sem condição'}</p>
            `;
            break;
            
        case 'message':
            const messageChannel = document.getElementById('message-channel').value;
            const messageContent = document.getElementById('message-content').value;
            
            let channelText;
            switch (messageChannel) {
                case 'whatsapp': channelText = 'WhatsApp'; break;
                case 'sms': channelText = 'SMS'; break;
                case 'voice': channelText = 'Voz'; break;
                default: channelText = messageChannel;
            }
            
            nodeContent.innerHTML = `
                <p><strong>${channelText}</strong></p>
                <p class="small">${messageContent.substring(0, 30)}${messageContent.length > 30 ? '...' : ''}</p>
            `;
            break;
            
        case 'condition':
            const conditionType = document.getElementById('condition-type').value;
            const conditionOperator = document.getElementById('condition-operator').value;
            const conditionValue = document.getElementById('condition-value').value;
            
            let condTypeText;
            switch (conditionType) {
                case 'message': condTypeText = 'Mensagem'; break;
                case 'lead': condTypeText = 'Lead'; break;
                case 'time': condTypeText = 'Data/Hora'; break;
                case 'custom': condTypeText = 'Custom'; break;
                default: condTypeText = conditionType;
            }
            
            let operatorText;
            switch (conditionOperator) {
                case 'contains': operatorText = 'contém'; break;
                case 'equals': operatorText = '='; break;
                case 'greater': operatorText = '>'; break;
                case 'less': operatorText = '<'; break;
                default: operatorText = conditionOperator;
            }
            
            nodeContent.innerHTML = `
                <p><strong>${condTypeText} ${operatorText}</strong></p>
                <p class="small">${conditionValue}</p>
            `;
            break;
            
        case 'delay':
            const delayDuration = document.getElementById('delay-duration').value;
            const delayUnit = document.getElementById('delay-unit').value;
            
            let unitText;
            switch (delayUnit) {
                case 'minutes': unitText = 'minutos'; break;
                case 'hours': unitText = 'horas'; break;
                case 'days': unitText = 'dias'; break;
                default: unitText = delayUnit;
            }
            
            nodeContent.innerHTML = `
                <p><strong>Esperar</strong></p>
                <p class="small">${delayDuration} ${unitText}</p>
            `;
            break;
            
        case 'api':
            const apiMethod = document.getElementById('api-method').value;
            const apiUrl = document.getElementById('api-url').value;
            
            nodeContent.innerHTML = `
                <p><strong>${apiMethod}</strong></p>
                <p class="small">${apiUrl}</p>
            `;
            break;
            
        case 'ai':
            const aiType = document.getElementById('ai-type').value;
            
            let aiTypeText;
            switch (aiType) {
                case 'text-generation': aiTypeText = 'Gerar Texto'; break;
                case 'intent-detection': aiTypeText = 'Detectar Intenção'; break;
                case 'sentiment-analysis': aiTypeText = 'Analisar Sentimento'; break;
                case 'entity-extraction': aiTypeText = 'Extrair Entidades'; break;
                default: aiTypeText = aiType;
            }
            
            nodeContent.innerHTML = `
                <p><strong>${aiTypeText}</strong></p>
                <p class="small">IA ${aiTypeText}</p>
            `;
            break;
            
        default:
            const nodeName = document.getElementById('node-name').value;
            const nodeDescription = document.getElementById('node-description').value;
            
            nodeContent.innerHTML = `
                <p><strong>${nodeName || 'Nó'}</strong></p>
                <p class="small">${nodeDescription || 'Sem descrição'}</p>
            `;
    }
}

/**
 * Delete a node
 * @param {string} nodeId - ID of the node to delete
 */
function deleteNode(nodeId) {
    const nodeElement = document.getElementById(nodeId);
    if (nodeElement) {
        nodeElement.remove();
    }
}

/**
 * Create a new flow
 */
function createNewFlow() {
    // Get form values
    const flowName = document.getElementById('flow-name').value.trim();
    const triggerType = document.getElementById('flow-trigger-type').value;
    const campaignId = document.getElementById('flow-campaign').value;
    
    if (!flowName || !triggerType) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Create a new flow object
    const newFlow = {
        id: Date.now(), // Temporary ID for mock data
        name: flowName,
        trigger_type: triggerType,
        status: 'draft',
        campaign_id: campaignId || null,
        nodes: '[]',
        connections: '[]',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    // Add the flow to the store
    const currentFlows = store.getState().flows;
    store.setFlows([...currentFlows, newFlow]);
    
    // Update the flow select
    updateFlowSelect();
    
    // Close the modal
    const newFlowModal = bootstrap.Modal.getInstance(document.getElementById('new-flow-modal'));
    newFlowModal.hide();
    
    // Reset the form
    document.getElementById('new-flow-form').reset();
    
    // Select the new flow
    document.getElementById('flow-select').value = newFlow.id;
    
    // Reset the canvas
    resetCanvas();
    
    // Show success message
    alert('Fluxo criado com sucesso! Agora você pode adicionar elementos ao canvas.');
}

/**
 * Load flows from API
 */
function loadFlows() {
    // For demonstration, we're using mock data
    // In a real application, you would fetch this data from your API
    
    const mockFlows = [
        {
            id: 1,
            name: 'Fluxo de Boas-vindas',
            trigger_type: 'inbound',
            status: 'active',
            campaign_id: null,
            nodes: '[]',
            connections: '[]',
            created_at: '2023-03-10T10:30:00Z',
            updated_at: '2023-03-15T14:45:00Z'
        },
        {
            id: 2,
            name: 'Campanha de Reengajamento',
            trigger_type: 'outbound',
            status: 'draft',
            campaign_id: 2,
            nodes: '[]',
            connections: '[]',
            created_at: '2023-03-12T09:20:00Z',
            updated_at: '2023-03-14T11:30:00Z'
        },
        {
            id: 3,
            name: 'Qualificação de Leads',
            trigger_type: 'inbound',
            status: 'active',
            campaign_id: null,
            nodes: '[]',
            connections: '[]',
            created_at: '2023-03-08T16:45:00Z',
            updated_at: '2023-03-09T10:15:00Z'
        }
    ];
    
    // Update the store
    store.setFlows(mockFlows);
    
    // Update the flow select
    updateFlowSelect();
}

/**
 * Update the flow select dropdown
 */
function updateFlowSelect() {
    const flows = store.getState().flows;
    const flowSelect = document.getElementById('flow-select');
    
    // Clear existing options except the first one
    while (flowSelect.options.length > 1) {
        flowSelect.remove(1);
    }
    
    // Add options for each flow
    flows.forEach(flow => {
        const option = document.createElement('option');
        option.value = flow.id;
        option.textContent = flow.name;
        flowSelect.appendChild(option);
    });
}

/**
 * Load a flow and display it on the canvas
 * @param {string} flowId - ID of the flow to load
 */
function loadFlow(flowId) {
    const flows = store.getState().flows;
    const flow = flows.find(f => f.id == flowId);
    
    if (!flow) {
        alert('Fluxo não encontrado.');
        return;
    }
    
    // Update current flow in store
    store.setCurrentFlow(flow);
    
    // Reset the canvas
    resetCanvas();
    
    // Enable save and test buttons
    document.getElementById('save-flow-btn').disabled = false;
    document.getElementById('test-flow-btn').disabled = false;
    
    // For demonstration, just show a placeholder message
    // In a real application, you would parse the nodes and connections from flow.nodes and flow.connections
    const canvas = document.getElementById('flow-canvas');
    canvas.innerHTML = `
        <div class="text-center p-3">
            <h5>${flow.name}</h5>
            <p class="small">Arraste elementos do painel lateral para começar a construir seu fluxo.</p>
        </div>
    `;
}

/**
 * Save the current flow
 */
function saveFlow() {
    const flowId = document.getElementById('flow-select').value;
    
    if (!flowId) {
        alert('Selecione um fluxo primeiro.');
        return;
    }
    
    // For demonstration, just show a success message
    // In a real application, you would serialize the nodes and connections on the canvas
    // and send them to your API
    alert('Fluxo salvo com sucesso!');
}

/**
 * Test the current flow
 */
function testFlow() {
    const flowId = document.getElementById('flow-select').value;
    
    if (!flowId) {
        alert('Selecione um fluxo primeiro.');
        return;
    }
    
    // For demonstration, just show a success message
    // In a real application, you would send a request to your API to test the flow
    alert('O teste do fluxo foi iniciado. Verifique o log para resultados.');
}

/**
 * Reset the canvas
 */
function resetCanvas() {
    const canvas = document.getElementById('flow-canvas');
    canvas.innerHTML = `
        <div class="text-center p-5">
            <i class="fas fa-sitemap fa-3x text-muted mb-3"></i>
            <p>Selecione um fluxo existente ou crie um novo.</p>
            <p class="small text-muted">Você pode arrastar elementos do painel lateral para o canvas.</p>
        </div>
    `;
    
    // Disable save and test buttons
    document.getElementById('save-flow-btn').disabled = true;
    document.getElementById('test-flow-btn').disabled = true;
}
