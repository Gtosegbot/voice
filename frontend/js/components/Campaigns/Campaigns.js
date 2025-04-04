/**
 * Campaigns Component
 * This component renders the campaigns page with CSV upload functionality
 */

/**
 * Initialize the campaigns page
 */
function initCampaigns() {
    renderCampaigns();
    setupCampaignsEvents();
    loadCampaigns();
}

/**
 * Render the campaigns HTML
 */
function renderCampaigns() {
    const campaignsPage = document.getElementById('campaigns-page');
    
    campaignsPage.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="page-title">Campanhas de Prospecção</h1>
            <button class="btn btn-primary" id="new-campaign-btn">
                <i class="fas fa-plus"></i> Nova Campanha
            </button>
        </div>
        
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">Campanhas Ativas</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Status</th>
                                <th>Leads</th>
                                <th>Progresso</th>
                                <th>Conversões</th>
                                <th>Data Início</th>
                                <th>Data Fim</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="campaigns-table-body">
                            <tr>
                                <td colspan="8" class="text-center">Carregando campanhas...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- CSV Upload Card -->
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">Importar Leads via CSV</h5>
            </div>
            <div class="card-body">
                <form id="csv-upload-form" class="mb-3">
                    <div class="mb-3">
                        <label for="campaign-select" class="form-label">Selecione a Campanha</label>
                        <select class="form-select" id="campaign-select">
                            <option value="">-- Selecione uma Campanha --</option>
                            <!-- Will be populated dynamically -->
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="csv-file" class="form-label">Arquivo CSV</label>
                        <input class="form-control" type="file" id="csv-file" accept=".csv">
                        <div class="form-text">
                            O arquivo CSV deve conter as colunas: nome, empresa, telefone, email (opcional)
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="csv-delimiter" class="form-label">Delimitador</label>
                        <select class="form-select" id="csv-delimiter">
                            <option value="," selected>Vírgula (,)</option>
                            <option value=";">Ponto e vírgula (;)</option>
                            <option value="\t">Tab</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="has-header" checked>
                            <label class="form-check-label" for="has-header">
                                O arquivo tem linha de cabeçalho
                            </label>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary">Importar Leads</button>
                </form>
                
                <div id="csv-preview" style="display: none;">
                    <h6>Prévia dos Dados</h6>
                    <div class="table-responsive">
                        <table class="table table-sm" id="csv-preview-table">
                            <!-- Will be populated dynamically -->
                        </table>
                    </div>
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-secondary" id="cancel-import-btn">Cancelar</button>
                        <button class="btn btn-success" id="confirm-import-btn">Confirmar Importação</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Scheduled Callbacks Card -->
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">Agendamento de Retornos</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Lead</th>
                                <th>Telefone</th>
                                <th>Data/Hora</th>
                                <th>Agendado por</th>
                                <th>Notas</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="callbacks-table-body">
                            <!-- Will be populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- New Campaign Modal -->
        <div class="modal fade" id="new-campaign-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Nova Campanha</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="new-campaign-form">
                            <div class="mb-3">
                                <label for="campaign-name" class="form-label">Nome da Campanha</label>
                                <input type="text" class="form-control" id="campaign-name" required>
                            </div>
                            <div class="mb-3">
                                <label for="campaign-description" class="form-label">Descrição</label>
                                <textarea class="form-control" id="campaign-description" rows="3"></textarea>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="campaign-start-date" class="form-label">Data de Início</label>
                                    <input type="date" class="form-control" id="campaign-start-date">
                                </div>
                                <div class="col-md-6">
                                    <label for="campaign-end-date" class="form-label">Data de Término</label>
                                    <input type="date" class="form-control" id="campaign-end-date">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="campaign-target" class="form-label">Meta de Leads</label>
                                <input type="number" class="form-control" id="campaign-target" min="1">
                            </div>
                            <div class="mb-3">
                                <label for="campaign-script" class="form-label">Script de Chamada</label>
                                <textarea class="form-control" id="campaign-script" rows="4"></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="campaign-flow" class="form-label">Fluxo de Conversa</label>
                                <select class="form-select" id="campaign-flow">
                                    <option value="">-- Selecionar Fluxo --</option>
                                    <!-- Will be populated dynamically -->
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="campaign-voice" class="form-label">Voz ElevenLabs</label>
                                <select class="form-select" id="campaign-voice">
                                    <option value="">-- Nenhuma --</option>
                                    <option value="Adam">Adam (Masculina)</option>
                                    <option value="Bella">Bella (Feminina)</option>
                                    <option value="Charlie">Charlie (Masculina)</option>
                                    <option value="Daniela">Daniela (Feminina)</option>
                                </select>
                                <div class="form-text">
                                    Selecione uma voz para a síntese via ElevenLabs
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="save-campaign-btn">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Schedule Callback Modal -->
        <div class="modal fade" id="schedule-callback-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Agendar Retorno</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="schedule-callback-form">
                            <div class="mb-3">
                                <label for="callback-lead" class="form-label">Lead</label>
                                <select class="form-select" id="callback-lead" required>
                                    <option value="">-- Selecionar Lead --</option>
                                    <!-- Will be populated dynamically -->
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="callback-date" class="form-label">Data</label>
                                <input type="date" class="form-control" id="callback-date" required>
                            </div>
                            <div class="mb-3">
                                <label for="callback-time" class="form-label">Hora</label>
                                <input type="time" class="form-control" id="callback-time" required>
                            </div>
                            <div class="mb-3">
                                <label for="callback-notes" class="form-label">Notas</label>
                                <textarea class="form-control" id="callback-notes" rows="3"></textarea>
                            </div>
                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="send-reminder" checked>
                                    <label class="form-check-label" for="send-reminder">
                                        Enviar lembrete ao lead
                                    </label>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="reminder-time" class="form-label">Tempo do Lembrete</label>
                                <select class="form-select" id="reminder-time">
                                    <option value="15">15 minutos antes</option>
                                    <option value="30" selected>30 minutos antes</option>
                                    <option value="60">1 hora antes</option>
                                    <option value="120">2 horas antes</option>
                                    <option value="1440">1 dia antes</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="reminder-channel" class="form-label">Canal de Lembrete</label>
                                <select class="form-select" id="reminder-channel">
                                    <option value="whatsapp" selected>WhatsApp</option>
                                    <option value="sms">SMS</option>
                                    <option value="email">Email</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="save-callback-btn">Agendar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Set up campaigns event listeners
 */
function setupCampaignsEvents() {
    // New campaign button
    const newCampaignBtn = document.getElementById('new-campaign-btn');
    if (newCampaignBtn) {
        newCampaignBtn.addEventListener('click', () => {
            // Populate flow select
            populateFlowSelect();
            
            // Show modal
            const newCampaignModal = new bootstrap.Modal(document.getElementById('new-campaign-modal'));
            newCampaignModal.show();
        });
    }
    
    // Save campaign button
    const saveCampaignBtn = document.getElementById('save-campaign-btn');
    if (saveCampaignBtn) {
        saveCampaignBtn.addEventListener('click', () => {
            saveCampaign();
        });
    }
    
    // CSV upload form
    const csvUploadForm = document.getElementById('csv-upload-form');
    if (csvUploadForm) {
        csvUploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleCsvUpload();
        });
    }
    
    // Cancel import button
    const cancelImportBtn = document.getElementById('cancel-import-btn');
    if (cancelImportBtn) {
        cancelImportBtn.addEventListener('click', () => {
            document.getElementById('csv-preview').style.display = 'none';
            document.getElementById('csv-upload-form').style.display = 'block';
        });
    }
    
    // Confirm import button
    const confirmImportBtn = document.getElementById('confirm-import-btn');
    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', () => {
            importLeadsFromCsv();
        });
    }
    
    // Add callback button
    const addCallbackBtn = document.createElement('button');
    addCallbackBtn.className = 'btn btn-sm btn-primary mb-3';
    addCallbackBtn.innerHTML = '<i class="fas fa-plus"></i> Agendar Retorno';
    addCallbackBtn.addEventListener('click', () => {
        // Populate lead select
        populateCallbackLeadSelect();
        
        // Show modal
        const scheduleCallbackModal = new bootstrap.Modal(document.getElementById('schedule-callback-modal'));
        scheduleCallbackModal.show();
    });
    
    // Insert button above callbacks table
    const callbacksTable = document.querySelector('#callbacks-table-body');
    if (callbacksTable) {
        callbacksTable.parentNode.parentNode.insertBefore(addCallbackBtn, callbacksTable.parentNode);
    }
    
    // Save callback button
    const saveCallbackBtn = document.getElementById('save-callback-btn');
    if (saveCallbackBtn) {
        saveCallbackBtn.addEventListener('click', () => {
            saveCallback();
        });
    }
}

/**
 * Load campaigns from API
 */
function loadCampaigns() {
    // Show loading state
    document.getElementById('campaigns-table-body').innerHTML = `
        <tr>
            <td colspan="8" class="text-center">Carregando campanhas...</td>
        </tr>
    `;
    
    // For demonstration, we're using mock data
    const mockCampaigns = [
        {
            id: 1,
            name: 'Prospecção Q2',
            status: 'active',
            leads_count: 120,
            progress: 65,
            conversions: 18,
            start_date: '2023-04-01',
            end_date: '2023-06-30',
            description: 'Campanha de prospecção para o segundo trimestre'
        },
        {
            id: 2,
            name: 'Reengajamento de Clientes',
            status: 'active',
            leads_count: 85,
            progress: 42,
            conversions: 7,
            start_date: '2023-03-15',
            end_date: '2023-05-15',
            description: 'Campanha para reengajar clientes inativos'
        },
        {
            id: 3,
            name: 'Novos Produtos',
            status: 'draft',
            leads_count: 0,
            progress: 0,
            conversions: 0,
            start_date: '2023-05-01',
            end_date: '2023-07-31',
            description: 'Campanha para divulgação de novos produtos'
        }
    ];
    
    // Populate campaign select
    const campaignSelect = document.getElementById('campaign-select');
    if (campaignSelect) {
        // Clear existing options except the first one
        while (campaignSelect.options.length > 1) {
            campaignSelect.remove(1);
        }
        
        // Add active campaigns
        const activeCampaigns = mockCampaigns.filter(c => c.status === 'active');
        activeCampaigns.forEach(campaign => {
            const option = document.createElement('option');
            option.value = campaign.id;
            option.textContent = campaign.name;
            campaignSelect.appendChild(option);
        });
    }
    
    // Render campaigns table
    renderCampaignsTable(mockCampaigns);
    
    // Load scheduled callbacks
    loadScheduledCallbacks();
}

/**
 * Render campaigns table
 * @param {Array} campaigns - List of campaigns
 */
function renderCampaignsTable(campaigns) {
    const tableBody = document.getElementById('campaigns-table-body');
    
    if (!campaigns || campaigns.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">Nenhuma campanha encontrada.</td>
            </tr>
        `;
        return;
    }
    
    const rows = campaigns.map(campaign => {
        // Format dates
        const startDate = new Date(campaign.start_date).toLocaleDateString('pt-BR');
        const endDate = new Date(campaign.end_date).toLocaleDateString('pt-BR');
        
        // Status badge
        let statusBadge;
        switch (campaign.status) {
            case 'active':
                statusBadge = '<span class="badge bg-success">Ativa</span>';
                break;
            case 'draft':
                statusBadge = '<span class="badge bg-secondary">Rascunho</span>';
                break;
            case 'completed':
                statusBadge = '<span class="badge bg-primary">Concluída</span>';
                break;
            case 'paused':
                statusBadge = '<span class="badge bg-warning text-dark">Pausada</span>';
                break;
            default:
                statusBadge = `<span class="badge bg-secondary">${campaign.status}</span>`;
        }
        
        // Progress bar
        const progressBar = `
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${campaign.progress}%;" 
                    aria-valuenow="${campaign.progress}" aria-valuemin="0" aria-valuemax="100">
                    ${campaign.progress}%
                </div>
            </div>
        `;
        
        return `
            <tr>
                <td>${campaign.name}</td>
                <td>${statusBadge}</td>
                <td>${campaign.leads_count}</td>
                <td>${progressBar}</td>
                <td>${campaign.conversions}</td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary view-campaign-btn" data-campaign-id="${campaign.id}" title="Ver detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary edit-campaign-btn" data-campaign-id="${campaign.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-campaign-btn" data-campaign-id="${campaign.id}" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = rows;
    
    // Add event listeners to buttons
    document.querySelectorAll('.view-campaign-btn').forEach(button => {
        button.addEventListener('click', () => {
            const campaignId = button.getAttribute('data-campaign-id');
            viewCampaign(campaignId);
        });
    });
    
    document.querySelectorAll('.edit-campaign-btn').forEach(button => {
        button.addEventListener('click', () => {
            const campaignId = button.getAttribute('data-campaign-id');
            editCampaign(campaignId);
        });
    });
    
    document.querySelectorAll('.delete-campaign-btn').forEach(button => {
        button.addEventListener('click', () => {
            const campaignId = button.getAttribute('data-campaign-id');
            deleteCampaign(campaignId);
        });
    });
}

/**
 * Handle CSV file upload
 */
function handleCsvUpload() {
    const file = document.getElementById('csv-file').files[0];
    const campaignId = document.getElementById('campaign-select').value;
    
    if (!file) {
        alert('Por favor, selecione um arquivo CSV para upload.');
        return;
    }
    
    if (!campaignId) {
        alert('Por favor, selecione uma campanha.');
        return;
    }
    
    const delimiter = document.getElementById('csv-delimiter').value;
    const hasHeader = document.getElementById('has-header').checked;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const contents = e.target.result;
        const lines = contents.split('\\n');
        
        if (lines.length === 0) {
            alert('O arquivo CSV está vazio.');
            return;
        }
        
        // Parse CSV
        let startIndex = 0;
        let headers = ['nome', 'empresa', 'telefone', 'email'];
        
        if (hasHeader) {
            // Use first line as headers
            headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
            startIndex = 1;
        }
        
        // Generate preview (up to 5 rows)
        const previewRows = [];
        for (let i = startIndex; i < Math.min(startIndex + 5, lines.length); i++) {
            if (lines[i].trim() === '') continue;
            
            const values = lines[i].split(delimiter);
            const row = {};
            
            headers.forEach((header, index) => {
                if (index < values.length) {
                    row[header] = values[index].trim();
                } else {
                    row[header] = '';
                }
            });
            
            previewRows.push(row);
        }
        
        // Show preview
        showCsvPreview(headers, previewRows);
        
        // Store parsed data for later use
        window.csvData = {
            campaignId,
            headers,
            lines: lines.slice(startIndex).filter(line => line.trim() !== '')
        };
    };
    
    reader.onerror = function() {
        alert('Erro ao ler o arquivo CSV.');
    };
    
    reader.readAsText(file);
}

/**
 * Show CSV preview
 * @param {Array} headers - CSV headers
 * @param {Array} rows - CSV rows for preview
 */
function showCsvPreview(headers, rows) {
    const previewTable = document.getElementById('csv-preview-table');
    
    // Generate header row
    let headerHtml = '<thead><tr>';
    headers.forEach(header => {
        headerHtml += `<th>${header}</th>`;
    });
    headerHtml += '</tr></thead>';
    
    // Generate body rows
    let bodyHtml = '<tbody>';
    rows.forEach(row => {
        bodyHtml += '<tr>';
        headers.forEach(header => {
            bodyHtml += `<td>${row[header] || ''}</td>`;
        });
        bodyHtml += '</tr>';
    });
    bodyHtml += '</tbody>';
    
    previewTable.innerHTML = headerHtml + bodyHtml;
    
    // Show preview, hide form
    document.getElementById('csv-preview').style.display = 'block';
    document.getElementById('csv-upload-form').style.display = 'none';
}

/**
 * Import leads from CSV
 */
function importLeadsFromCsv() {
    if (!window.csvData) {
        alert('Nenhum dado CSV disponível para importação.');
        return;
    }
    
    const { campaignId, headers, lines } = window.csvData;
    const delimiter = document.getElementById('csv-delimiter').value;
    
    // In a real app, you would send this data to your API
    // Here we'll simulate processing
    
    // Show loading message
    document.getElementById('csv-preview').innerHTML = `
        <div class="text-center py-3">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <p>Importando leads, por favor aguarde...</p>
        </div>
    `;
    
    // Simulate API call delay
    setTimeout(() => {
        const totalRows = lines.length;
        const successMessage = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> ${totalRows} leads foram importados com sucesso para a campanha.
            </div>
            <button class="btn btn-primary" id="return-to-form-btn">Retornar</button>
        `;
        
        document.getElementById('csv-preview').innerHTML = successMessage;
        
        // Add event listener to return button
        document.getElementById('return-to-form-btn').addEventListener('click', () => {
            document.getElementById('csv-preview').style.display = 'none';
            document.getElementById('csv-upload-form').style.display = 'block';
            document.getElementById('csv-upload-form').reset();
        });
        
        // Reset csvData
        window.csvData = null;
        
        // Refresh campaigns data
        loadCampaigns();
    }, 2000);
}

/**
 * Populate flow select dropdown
 */
function populateFlowSelect() {
    const flowSelect = document.getElementById('campaign-flow');
    
    // Clear existing options except the first one
    while (flowSelect.options.length > 1) {
        flowSelect.remove(1);
    }
    
    // Add mock flows
    const mockFlows = [
        { id: 1, name: 'Fluxo de Boas-vindas' },
        { id: 2, name: 'Qualificação de Leads' },
        { id: 3, name: 'Apresentação de Produto' }
    ];
    
    mockFlows.forEach(flow => {
        const option = document.createElement('option');
        option.value = flow.id;
        option.textContent = flow.name;
        flowSelect.appendChild(option);
    });
}

/**
 * Save new campaign
 */
function saveCampaign() {
    const name = document.getElementById('campaign-name').value.trim();
    const description = document.getElementById('campaign-description').value.trim();
    const startDate = document.getElementById('campaign-start-date').value;
    const endDate = document.getElementById('campaign-end-date').value;
    const target = document.getElementById('campaign-target').value;
    const script = document.getElementById('campaign-script').value.trim();
    const flowId = document.getElementById('campaign-flow').value;
    const voice = document.getElementById('campaign-voice').value;
    
    if (!name) {
        alert('Por favor, informe o nome da campanha.');
        return;
    }
    
    // In a real app, you would send this data to your API
    console.log('Nova campanha:', {
        name,
        description,
        startDate,
        endDate,
        target,
        script,
        flowId,
        voice
    });
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('new-campaign-modal'));
    modal.hide();
    
    // Show success message
    alert('Campanha criada com sucesso!');
    
    // Reset form
    document.getElementById('new-campaign-form').reset();
    
    // Refresh campaigns data
    loadCampaigns();
}

/**
 * View campaign details
 * @param {string} campaignId - Campaign ID
 */
function viewCampaign(campaignId) {
    alert(`Ver detalhes da campanha ${campaignId} - Funcionalidade a ser implementada.`);
}

/**
 * Edit campaign
 * @param {string} campaignId - Campaign ID
 */
function editCampaign(campaignId) {
    alert(`Editar campanha ${campaignId} - Funcionalidade a ser implementada.`);
}

/**
 * Delete campaign
 * @param {string} campaignId - Campaign ID
 */
function deleteCampaign(campaignId) {
    if (confirm(`Tem certeza que deseja excluir a campanha ${campaignId}?`)) {
        alert('Campanha excluída com sucesso.');
        loadCampaigns();
    }
}

/**
 * Load scheduled callbacks
 */
function loadScheduledCallbacks() {
    const tableBody = document.getElementById('callbacks-table-body');
    
    // For demonstration, we're using mock data
    const mockCallbacks = [
        {
            id: 1,
            lead: {
                id: 101,
                name: 'João Silva',
                company: 'Empresa XYZ',
                phone: '(11) 98765-4321'
            },
            datetime: '2023-04-05T14:30:00',
            agent: {
                id: 1,
                name: 'Ana Oliveira'
            },
            notes: 'Cliente solicitou mais informações sobre o plano Premium.',
            status: 'scheduled',
            reminder: {
                time: 30,
                channel: 'whatsapp'
            }
        },
        {
            id: 2,
            lead: {
                id: 102,
                name: 'Maria Santos',
                company: 'Empresa ABC',
                phone: '(11) 97654-3210'
            },
            datetime: '2023-04-06T10:00:00',
            agent: {
                id: 2,
                name: 'Carlos Pereira'
            },
            notes: 'Demonstração do produto.',
            status: 'scheduled',
            reminder: {
                time: 60,
                channel: 'sms'
            }
        },
        {
            id: 3,
            lead: {
                id: 103,
                name: 'Pedro Almeida',
                company: 'Empresa DEF',
                phone: '(11) 91234-5678'
            },
            datetime: '2023-04-03T16:00:00',
            agent: {
                id: 1,
                name: 'Ana Oliveira'
            },
            notes: 'Retorno sobre proposta enviada.',
            status: 'completed',
            reminder: {
                time: 30,
                channel: 'email'
            }
        }
    ];
    
    const rows = mockCallbacks.map(callback => {
        // Format datetime
        const datetime = new Date(callback.datetime);
        const formattedDate = datetime.toLocaleDateString('pt-BR');
        const formattedTime = datetime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Status badge
        let statusBadge;
        switch (callback.status) {
            case 'scheduled':
                statusBadge = '<span class="badge bg-primary">Agendado</span>';
                break;
            case 'completed':
                statusBadge = '<span class="badge bg-success">Concluído</span>';
                break;
            case 'missed':
                statusBadge = '<span class="badge bg-danger">Perdido</span>';
                break;
            case 'canceled':
                statusBadge = '<span class="badge bg-secondary">Cancelado</span>';
                break;
            default:
                statusBadge = `<span class="badge bg-secondary">${callback.status}</span>`;
        }
        
        return `
            <tr>
                <td>${callback.lead.name}<br><small class="text-muted">${callback.lead.company}</small></td>
                <td>${callback.lead.phone}</td>
                <td>${formattedDate}<br>${formattedTime}</td>
                <td>${callback.agent.name}</td>
                <td>${callback.notes || '-'}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary call-now-btn" data-callback-id="${callback.id}" title="Ligar agora">
                            <i class="fas fa-phone"></i>
                        </button>
                        <button class="btn btn-outline-secondary edit-callback-btn" data-callback-id="${callback.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger cancel-callback-btn" data-callback-id="${callback.id}" title="Cancelar">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = rows || '<tr><td colspan="7" class="text-center">Nenhum retorno agendado.</td></tr>';
    
    // Add event listeners to buttons
    document.querySelectorAll('.call-now-btn').forEach(button => {
        button.addEventListener('click', () => {
            const callbackId = button.getAttribute('data-callback-id');
            initiateCallbackCall(callbackId);
        });
    });
    
    document.querySelectorAll('.edit-callback-btn').forEach(button => {
        button.addEventListener('click', () => {
            const callbackId = button.getAttribute('data-callback-id');
            editCallback(callbackId);
        });
    });
    
    document.querySelectorAll('.cancel-callback-btn').forEach(button => {
        button.addEventListener('click', () => {
            const callbackId = button.getAttribute('data-callback-id');
            cancelCallback(callbackId);
        });
    });
}

/**
 * Populate callback lead select
 */
function populateCallbackLeadSelect() {
    const leadSelect = document.getElementById('callback-lead');
    
    // Clear existing options except the first one
    while (leadSelect.options.length > 1) {
        leadSelect.remove(1);
    }
    
    // Get leads from store
    const leads = store.getState().leads;
    
    // If leads are not loaded yet, load them
    if (!leads || leads.length === 0) {
        // In a real app, you would fetch leads from your API
        // For demonstration, we'll use mock data
        const mockLeads = [
            { id: 101, name: 'João Silva', company: 'Empresa XYZ' },
            { id: 102, name: 'Maria Santos', company: 'Empresa ABC' },
            { id: 103, name: 'Pedro Almeida', company: 'Empresa DEF' },
            { id: 104, name: 'Ana Oliveira', company: 'Empresa GHI' },
            { id: 105, name: 'Carlos Pereira', company: 'Empresa JKL' }
        ];
        
        mockLeads.forEach(lead => {
            const option = document.createElement('option');
            option.value = lead.id;
            option.textContent = `${lead.name} (${lead.company})`;
            leadSelect.appendChild(option);
        });
        
        return;
    }
    
    // Add options for each lead
    leads.forEach(lead => {
        const option = document.createElement('option');
        option.value = lead.id;
        option.textContent = `${lead.name} ${lead.company ? `(${lead.company})` : ''}`;
        leadSelect.appendChild(option);
    });
}

/**
 * Save callback
 */
function saveCallback() {
    const leadId = document.getElementById('callback-lead').value;
    const callbackDate = document.getElementById('callback-date').value;
    const callbackTime = document.getElementById('callback-time').value;
    const notes = document.getElementById('callback-notes').value.trim();
    const sendReminder = document.getElementById('send-reminder').checked;
    const reminderTime = document.getElementById('reminder-time').value;
    const reminderChannel = document.getElementById('reminder-channel').value;
    
    if (!leadId || !callbackDate || !callbackTime) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // In a real app, you would send this data to your API
    console.log('Novo retorno agendado:', {
        leadId,
        callbackDate,
        callbackTime,
        notes,
        sendReminder,
        reminderTime,
        reminderChannel
    });
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('schedule-callback-modal'));
    modal.hide();
    
    // Show success message
    alert('Retorno agendado com sucesso!');
    
    // Reset form
    document.getElementById('schedule-callback-form').reset();
    
    // Refresh callbacks data
    loadScheduledCallbacks();
}

/**
 * Initiate call for a scheduled callback
 * @param {string} callbackId - Callback ID
 */
function initiateCallbackCall(callbackId) {
    // In a real app, you would send this request to your API
    alert(`Iniciando chamada para o retorno agendado ${callbackId}.`);
}

/**
 * Edit scheduled callback
 * @param {string} callbackId - Callback ID
 */
function editCallback(callbackId) {
    alert(`Editar retorno agendado ${callbackId} - Funcionalidade a ser implementada.`);
}

/**
 * Cancel scheduled callback
 * @param {string} callbackId - Callback ID
 */
function cancelCallback(callbackId) {
    if (confirm(`Tem certeza que deseja cancelar o retorno agendado ${callbackId}?`)) {
        alert('Retorno agendado cancelado com sucesso.');
        loadScheduledCallbacks();
    }
}

// Expose component initialization to window object
window.initCampaigns = initCampaigns;

// Store for component elements
let campaignsContainer;

/**
 * Campaigns component that handles marketing campaigns
 */
// Expose component functions to window object
window.initCampaigns = initCampaigns;

// Adding other Campaigns functions to window object as well
window.Campaigns = {
    /**
     * Initialize the Campaigns component
     * @param {HTMLElement} container - Container element where the component will be rendered
     */
    init: function(container) {
        console.log('Initializing Campaigns component');
        
        // Set campaigns container
        campaignsContainer = container;
        
        // Initialize the component
        initCampaigns();
        
        return container;
    },
    
    /**
     * Clean up the component
     */
    destroy: function() {
        // Clean up any event listeners or resources
        console.log('Destroying Campaigns component');
        
        if (campaignsContainer) {
            // Reset content
            campaignsContainer.innerHTML = '';
        }
    }
};