/**
 * File Upload Component
 * Handles importing client data from various file formats
 */

// Use global API and showToast function
// Removed imports to avoid ES module errors

// Main container for file upload component
let fileUploadContainer;

// File types supported
const supportedFileTypes = {
    csv: {
        icon: 'fas fa-file-csv',
        name: 'CSV',
        description: 'Arquivo CSV com dados dos clientes'
    },
    xlsx: {
        icon: 'fas fa-file-excel',
        name: 'Excel',
        description: 'Planilha Excel com dados dos clientes'
    },
    json: {
        icon: 'fas fa-file-code',
        name: 'JSON',
        description: 'Arquivo JSON com dados dos clientes'
    },
    vcf: {
        icon: 'fas fa-address-card',
        name: 'vCard',
        description: 'Arquivo de contatos vCard'
    }
};

// Sample data mapping template
const defaultMappingTemplate = {
    name: 'Nome',
    company: 'Empresa',
    phone: 'Telefone',
    email: 'Email',
    position: 'Cargo',
    source: 'Origem'
};

/**
 * Initialize file upload component
 */
function initFileUpload() {
    // Create main container
    fileUploadContainer = document.createElement('div');
    fileUploadContainer.className = 'container-fluid';
    fileUploadContainer.innerHTML = `
        <div class="d-sm-flex align-items-center justify-content-between mb-4">
            <h1 class="h3 mb-0 text-gray-800">Importação de Clientes</h1>
            <button class="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm" id="help-import-btn">
                <i class="fas fa-question-circle fa-sm text-white-50 me-1"></i> Ajuda
            </button>
        </div>

        <div class="row">
            <div class="col-xl-12 col-lg-12">
                <div class="card shadow mb-4">
                    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 class="m-0 font-weight-bold text-primary">Importar Contatos</h6>
                    </div>
                    <div class="card-body">
                        <div class="file-upload-steps">
                            <!-- Step 1: Select file type -->
                            <div class="file-upload-step active" id="step-select-type">
                                <h5>Passo 1: Selecione o tipo de arquivo</h5>
                                <div class="row file-types mt-4">
                                    ${Object.entries(supportedFileTypes).map(([type, info]) => `
                                        <div class="col-md-3 mb-4">
                                            <div class="file-type-card" data-type="${type}">
                                                <div class="file-type-icon">
                                                    <i class="${info.icon} fa-3x"></i>
                                                </div>
                                                <div class="file-type-name">${info.name}</div>
                                                <div class="file-type-desc">${info.description}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="step-buttons mt-4">
                                    <button class="btn btn-primary disabled" id="next-to-upload">Próximo</button>
                                </div>
                            </div>

                            <!-- Step 2: Upload file -->
                            <div class="file-upload-step" id="step-upload-file">
                                <h5>Passo 2: Carregar arquivo</h5>
                                <div class="drop-zone mt-4">
                                    <div class="drop-zone-prompt">
                                        <i class="fas fa-cloud-upload-alt fa-3x mb-3"></i>
                                        <p>Arraste e solte seu arquivo aqui ou</p>
                                        <button class="btn btn-outline-primary" id="select-file-btn">Selecionar arquivo</button>
                                        <input type="file" id="file-input" class="d-none" />
                                    </div>
                                    <div class="drop-zone-preview d-none">
                                        <div class="preview-file-icon">
                                            <i class="fas fa-file fa-2x"></i>
                                        </div>
                                        <div class="preview-file-info">
                                            <div class="preview-file-name">filename.csv</div>
                                            <div class="preview-file-size">32KB</div>
                                        </div>
                                        <button class="btn btn-sm btn-link preview-file-remove">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="step-buttons mt-4">
                                    <button class="btn btn-secondary" id="back-to-type">Voltar</button>
                                    <button class="btn btn-primary disabled" id="next-to-mapping">Próximo</button>
                                </div>
                            </div>

                            <!-- Step 3: Map fields -->
                            <div class="file-upload-step" id="step-map-fields">
                                <h5>Passo 3: Mapear campos</h5>
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle"></i> Faça a correspondência entre as colunas do seu arquivo e os campos do sistema.
                                </div>
                                <div class="mapping-container mt-4">
                                    <div class="row mapping-headers">
                                        <div class="col-md-5">Campo no arquivo</div>
                                        <div class="col-md-5">Campo no sistema</div>
                                        <div class="col-md-2">Obrigatório</div>
                                    </div>
                                    <div id="mapping-fields-container">
                                        <!-- Will be populated dynamically -->
                                    </div>
                                </div>
                                <div class="step-buttons mt-4">
                                    <button class="btn btn-secondary" id="back-to-upload">Voltar</button>
                                    <button class="btn btn-primary" id="next-to-campaign">Próximo</button>
                                </div>
                            </div>

                            <!-- Step 4: Select campaign -->
                            <div class="file-upload-step" id="step-select-campaign">
                                <h5>Passo 4: Selecionar campanha</h5>
                                <div class="campaign-selector mt-4">
                                    <div class="form-group">
                                        <label for="campaign-select">Escolha a campanha para associar estes contatos</label>
                                        <select class="form-control" id="campaign-select">
                                            <option value="">-- Selecionar Campanha --</option>
                                            <!-- Will be populated dynamically -->
                                        </select>
                                    </div>
                                    <div class="form-group mt-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="create-new-campaign">
                                            <label class="form-check-label" for="create-new-campaign">
                                                Criar nova campanha
                                            </label>
                                        </div>
                                    </div>
                                    <div class="new-campaign-form mt-3 d-none">
                                        <div class="form-group">
                                            <label for="new-campaign-name">Nome da nova campanha</label>
                                            <input type="text" class="form-control" id="new-campaign-name" placeholder="Digite o nome da campanha">
                                        </div>
                                        <div class="form-group mt-3">
                                            <label for="new-campaign-desc">Descrição</label>
                                            <textarea class="form-control" id="new-campaign-desc" rows="3" placeholder="Descrição da campanha"></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div class="step-buttons mt-4">
                                    <button class="btn btn-secondary" id="back-to-mapping">Voltar</button>
                                    <button class="btn btn-primary" id="next-to-confirm">Próximo</button>
                                </div>
                            </div>

                            <!-- Step 5: Review and import -->
                            <div class="file-upload-step" id="step-confirm-import">
                                <h5>Passo 5: Revisar e importar</h5>
                                <div class="import-summary mt-4">
                                    <div class="card mb-4">
                                        <div class="card-body">
                                            <h6 class="font-weight-bold">Resumo da importação</h6>
                                            <div class="row mt-3">
                                                <div class="col-md-6">
                                                    <div class="summary-item">
                                                        <span class="summary-label">Tipo de arquivo:</span>
                                                        <span class="summary-value" id="summary-file-type">CSV</span>
                                                    </div>
                                                    <div class="summary-item">
                                                        <span class="summary-label">Nome do arquivo:</span>
                                                        <span class="summary-value" id="summary-file-name">clientes.csv</span>
                                                    </div>
                                                    <div class="summary-item">
                                                        <span class="summary-label">Registros encontrados:</span>
                                                        <span class="summary-value" id="summary-record-count">157</span>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <div class="summary-item">
                                                        <span class="summary-label">Campanha:</span>
                                                        <span class="summary-value" id="summary-campaign">Campanha Q2 2025</span>
                                                    </div>
                                                    <div class="summary-item">
                                                        <span class="summary-label">Campos mapeados:</span>
                                                        <span class="summary-value" id="summary-mapped-fields">6</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="preview-table">
                                        <h6 class="font-weight-bold">Visualização prévia</h6>
                                        <div class="table-responsive">
                                            <table class="table table-bordered" id="preview-data-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <!-- Will be populated dynamically -->
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <!-- Will be populated dynamically -->
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="preview-table-footer">
                                            <span>Mostrando 5 de <span id="total-records">157</span> registros</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="step-buttons mt-4">
                                    <button class="btn btn-secondary" id="back-to-campaign">Voltar</button>
                                    <button class="btn btn-success" id="start-import-btn">
                                        <i class="fas fa-file-import me-1"></i> Iniciar Importação
                                    </button>
                                </div>
                            </div>

                            <!-- Step 6: Import progress -->
                            <div class="file-upload-step" id="step-import-progress">
                                <h5>Importando contatos...</h5>
                                <div class="import-progress-container mt-4 text-center">
                                    <div class="progress-circle">
                                        <div class="progress-circle-inner">
                                            <span id="progress-percentage">0%</span>
                                        </div>
                                    </div>
                                    <div class="progress-status mt-3">
                                        <div class="progress-text" id="progress-text">Processando registros...</div>
                                        <div class="progress-count">
                                            <span id="processed-count">0</span> de <span id="total-count">157</span> registros processados
                                        </div>
                                    </div>
                                    <div class="progress-bar-container mt-3">
                                        <div class="progress">
                                            <div class="progress-bar progress-bar-striped progress-bar-animated" id="import-progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="step-buttons mt-4">
                                    <button class="btn btn-secondary disabled" id="cancel-import-btn">Cancelar</button>
                                </div>
                            </div>

                            <!-- Step 7: Import complete -->
                            <div class="file-upload-step" id="step-import-complete">
                                <div class="import-complete-container text-center mt-4">
                                    <div class="complete-icon success">
                                        <i class="fas fa-check-circle fa-5x"></i>
                                    </div>
                                    <h4 class="mt-4">Importação Concluída com Sucesso!</h4>
                                    <p class="complete-summary">
                                        <span id="success-count">157</span> contatos foram importados com sucesso para a campanha <span id="success-campaign">Campanha Q2 2025</span>.
                                    </p>
                                    <div class="complete-actions mt-4">
                                        <button class="btn btn-primary" id="view-imported-leads-btn">
                                            <i class="fas fa-list me-1"></i> Ver Contatos Importados
                                        </button>
                                        <button class="btn btn-outline-primary" id="import-another-btn">
                                            <i class="fas fa-file-import me-1"></i> Importar Outro Arquivo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-xl-12 col-lg-12">
                <div class="card shadow mb-4">
                    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 class="m-0 font-weight-bold text-primary">Histórico de Importações</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered" id="import-history-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Arquivo</th>
                                        <th>Campanha</th>
                                        <th>Contatos</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Will be populated dynamically -->
                                    <tr>
                                        <td>03/04/2025 14:32</td>
                                        <td>clientes-q1.csv</td>
                                        <td>Campanha Q1 2025</td>
                                        <td>143</td>
                                        <td><span class="badge bg-success">Concluído</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>28/03/2025 09:15</td>
                                        <td>leads-março.xlsx</td>
                                        <td>Campanha Março 2025</td>
                                        <td>86</td>
                                        <td><span class="badge bg-success">Concluído</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
        .file-upload-steps {
            position: relative;
        }
        
        .file-upload-step {
            display: none;
        }
        
        .file-upload-step.active {
            display: block;
        }
        
        .file-types {
            display: flex;
            flex-wrap: wrap;
        }
        
        .file-type-card {
            border: 2px solid #e3e6f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            height: 100%;
        }
        
        .file-type-card:hover {
            border-color: #4e73df;
            transform: translateY(-5px);
        }
        
        .file-type-card.selected {
            border-color: #4e73df;
            background-color: #f8f9fc;
        }
        
        .file-type-icon {
            margin-bottom: 15px;
            color: #4e73df;
        }
        
        .file-type-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .file-type-desc {
            font-size: 0.8rem;
            color: #858796;
        }
        
        .drop-zone {
            border: 2px dashed #d1d3e2;
            border-radius: 8px;
            padding: 40px;
            text-align: center;
            transition: all 0.2s;
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .drop-zone.dragover {
            border-color: #4e73df;
            background-color: #f8f9fc;
        }
        
        .drop-zone-preview {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            border: 1px solid #e3e6f0;
            border-radius: 5px;
            width: 100%;
        }
        
        .preview-file-icon {
            color: #4e73df;
            margin-right: 15px;
        }
        
        .preview-file-name {
            font-weight: bold;
        }
        
        .preview-file-size {
            font-size: 0.8rem;
            color: #858796;
        }
        
        .step-buttons {
            display: flex;
            justify-content: space-between;
        }
        
        .step-buttons button:only-child {
            margin-left: auto;
        }
        
        .mapping-headers {
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e3e6f0;
        }
        
        .mapping-row {
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 5px;
            background-color: #f8f9fc;
        }
        
        .summary-item {
            margin-bottom: 10px;
        }
        
        .summary-label {
            font-weight: bold;
            margin-right: 5px;
        }
        
        .preview-table-footer {
            font-size: 0.8rem;
            color: #858796;
            margin-top: 10px;
        }
        
        .progress-circle {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: conic-gradient(#4e73df 0% var(--progress, 0%), #e3e6f0 var(--progress, 0%) 100%);
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        
        .progress-circle-inner {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #progress-percentage {
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .complete-icon {
            color: #1cc88a;
        }
        
        .complete-icon.error {
            color: #e74a3b;
        }
    `;
    document.head.appendChild(style);

    // Add event listeners
    setupFileUploadEvents();

    return fileUploadContainer;
}

/**
 * Setup file upload event listeners
 */
function setupFileUploadEvents() {
    // Step 1: Select file type
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.file-type-card')) return;
        
        const fileTypeCard = e.target.closest('.file-type-card');
        const fileType = fileTypeCard.getAttribute('data-type');
        
        // Remove selection from all cards
        document.querySelectorAll('.file-type-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select the clicked card
        fileTypeCard.classList.add('selected');
        
        // Enable the next button
        document.getElementById('next-to-upload').classList.remove('disabled');
    });

    // Next button: Type to Upload
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'next-to-upload') return;
        if (e.target.classList.contains('disabled')) return;
        
        showStep('step-upload-file');
    });

    // Back button: Upload to Type
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'back-to-type') return;
        
        showStep('step-select-type');
    });

    // Select file button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'select-file-btn') return;
        
        document.getElementById('file-input').click();
    });

    // File input change
    document.addEventListener('change', function(e) {
        if (e.target.id !== 'file-input') return;
        
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            showFilePreview(file);
        }
    });

    // Remove file button
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.preview-file-remove')) return;
        
        hideFilePreview();
    });

    // Next button: Upload to Mapping
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'next-to-mapping') return;
        if (e.target.classList.contains('disabled')) return;
        
        // In a real app, we would parse the file here to extract headers
        // For demo, we'll use sample data
        populateMappingFields(['Nome', 'Empresa', 'Email', 'Telefone', 'Cargo', 'Origem', 'Observações', 'Data Cadastro']);
        
        showStep('step-map-fields');
    });

    // Back button: Mapping to Upload
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'back-to-upload') return;
        
        showStep('step-upload-file');
    });

    // Next button: Mapping to Campaign
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'next-to-campaign') return;
        
        // In a real app, we would fetch campaigns from the API
        // For demo, we'll use sample data
        populateCampaigns([
            { id: 1, name: 'Campanha Q2 2025' },
            { id: 2, name: 'Campanha Abril 2025' },
            { id: 3, name: 'Leads Tecnologia' }
        ]);
        
        showStep('step-select-campaign');
    });

    // Back button: Campaign to Mapping
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'back-to-mapping') return;
        
        showStep('step-map-fields');
    });

    // Create new campaign checkbox
    document.addEventListener('change', function(e) {
        if (e.target.id !== 'create-new-campaign') return;
        
        const newCampaignForm = document.querySelector('.new-campaign-form');
        const campaignSelect = document.getElementById('campaign-select');
        
        if (e.target.checked) {
            newCampaignForm.classList.remove('d-none');
            campaignSelect.disabled = true;
        } else {
            newCampaignForm.classList.add('d-none');
            campaignSelect.disabled = false;
        }
    });

    // Next button: Campaign to Confirm
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'next-to-confirm') return;
        
        // In a real app, we would parse the file and show preview
        // For demo, we'll use sample data
        populatePreviewTable();
        
        showStep('step-confirm-import');
    });

    // Back button: Confirm to Campaign
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'back-to-campaign') return;
        
        showStep('step-select-campaign');
    });

    // Start import button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'start-import-btn') return;
        
        showStep('step-import-progress');
        simulateImportProgress();
    });

    // Import another button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'import-another-btn') return;
        
        resetImport();
        showStep('step-select-type');
    });

    // View imported leads button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'view-imported-leads-btn') return;
        
        // In a real app, we would navigate to the leads page with a filter
        // For demo, we'll just show a message
        showToast('Redirecionando para lista de contatos importados...', 'info');
    });

    // Help button
    document.addEventListener('click', function(e) {
        if (e.target.id !== 'help-import-btn') return;
        
        showImportHelp();
    });
}

/**
 * Show a specific step
 * @param {string} stepId - ID of the step to show
 */
function showStep(stepId) {
    // Hide all steps
    document.querySelectorAll('.file-upload-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show the requested step
    document.getElementById(stepId).classList.add('active');
}

/**
 * Show file preview
 * @param {File} file - The selected file
 */
function showFilePreview(file) {
    const dropZone = document.querySelector('.drop-zone');
    const dropZonePrompt = document.querySelector('.drop-zone-prompt');
    const dropZonePreview = document.querySelector('.drop-zone-preview');
    const fileNameEl = document.querySelector('.preview-file-name');
    const fileSizeEl = document.querySelector('.preview-file-size');
    
    // Update preview
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatFileSize(file.size);
    
    // Show preview
    dropZonePrompt.classList.add('d-none');
    dropZonePreview.classList.remove('d-none');
    
    // Enable next button
    document.getElementById('next-to-mapping').classList.remove('disabled');
}

/**
 * Hide file preview
 */
function hideFilePreview() {
    const dropZonePrompt = document.querySelector('.drop-zone-prompt');
    const dropZonePreview = document.querySelector('.drop-zone-preview');
    
    // Clear file input
    document.getElementById('file-input').value = '';
    
    // Hide preview
    dropZonePrompt.classList.remove('d-none');
    dropZonePreview.classList.add('d-none');
    
    // Disable next button
    document.getElementById('next-to-mapping').classList.add('disabled');
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Populate mapping fields
 * @param {string[]} fileHeaders - Headers from the file
 */
function populateMappingFields(fileHeaders) {
    const container = document.getElementById('mapping-fields-container');
    container.innerHTML = '';
    
    fileHeaders.forEach((header, index) => {
        const row = document.createElement('div');
        row.className = 'row mapping-row align-items-center';
        
        const matchedField = Object.entries(defaultMappingTemplate).find(([key, value]) => {
            return value.toLowerCase() === header.toLowerCase();
        });
        
        row.innerHTML = `
            <div class="col-md-5">
                <strong>${header}</strong>
            </div>
            <div class="col-md-5">
                <select class="form-control mapping-select" data-file-header="${header}">
                    <option value="">-- Não importar --</option>
                    ${Object.entries(defaultMappingTemplate).map(([key, value]) => `
                        <option value="${key}" ${matchedField && matchedField[0] === key ? 'selected' : ''}>${value}</option>
                    `).join('')}
                </select>
            </div>
            <div class="col-md-2">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" ${(matchedField && ['name', 'phone'].includes(matchedField[0])) ? 'checked' : ''} 
                        ${!matchedField ? 'disabled' : ''} id="required-${index}">
                </div>
            </div>
        `;
        
        container.appendChild(row);
    });
    
    // Add event listeners to mapping selects
    document.querySelectorAll('.mapping-select').forEach(select => {
        select.addEventListener('change', function() {
            const checkbox = this.closest('.mapping-row').querySelector('.form-check-input');
            
            if (this.value === '') {
                checkbox.checked = false;
                checkbox.disabled = true;
            } else {
                checkbox.disabled = false;
                
                if (['name', 'phone'].includes(this.value)) {
                    checkbox.checked = true;
                }
            }
        });
    });
}

/**
 * Populate campaign select
 * @param {Object[]} campaigns - List of campaigns
 */
function populateCampaigns(campaigns) {
    const select = document.getElementById('campaign-select');
    
    // Keep the default option
    const defaultOption = select.options[0];
    select.innerHTML = '';
    select.appendChild(defaultOption);
    
    campaigns.forEach(campaign => {
        const option = document.createElement('option');
        option.value = campaign.id;
        option.textContent = campaign.name;
        select.appendChild(option);
    });
}

/**
 * Populate preview table
 */
function populatePreviewTable() {
    // Update summary
    document.getElementById('summary-file-type').textContent = 'CSV';
    document.getElementById('summary-file-name').textContent = 'clientes.csv';
    document.getElementById('summary-record-count').textContent = '157';
    document.getElementById('total-records').textContent = '157';
    
    const campaignSelect = document.getElementById('campaign-select');
    const campaignValue = campaignSelect.options[campaignSelect.selectedIndex].text;
    document.getElementById('summary-campaign').textContent = campaignValue;
    
    const mappedFieldsCount = document.querySelectorAll('.mapping-select').length;
    document.getElementById('summary-mapped-fields').textContent = mappedFieldsCount;
    
    // Sample data for preview
    const previewFields = ['Nome', 'Empresa', 'Email', 'Telefone'];
    const previewData = [
        ['João Silva', 'Empresa ABC', 'joao.silva@abc.com', '(11) 98765-4321'],
        ['Maria Oliveira', 'XYZ Tecnologia', 'maria.oliveira@xyz.com', '(21) 91234-5678'],
        ['Carlos Santos', 'Tech Solutions', 'carlos.santos@tech.com', '(31) 99876-5432'],
        ['Ana Costa', 'Inova Digital', 'ana.costa@inova.com', '(41) 92345-6789'],
        ['Pedro Lima', 'Future Systems', 'pedro.lima@future.com', '(51) 93456-7890']
    ];
    
    // Update table headers
    const tableHead = document.querySelector('#preview-data-table thead tr');
    tableHead.innerHTML = '<th>#</th>';
    
    previewFields.forEach(field => {
        const th = document.createElement('th');
        th.textContent = field;
        tableHead.appendChild(th);
    });
    
    // Update table rows
    const tableBody = document.querySelector('#preview-data-table tbody');
    tableBody.innerHTML = '';
    
    previewData.forEach((row, index) => {
        const tr = document.createElement('tr');
        
        // Add row number
        const tdNum = document.createElement('td');
        tdNum.textContent = index + 1;
        tr.appendChild(tdNum);
        
        // Add data cells
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    });
}

/**
 * Simulate import progress
 */
function simulateImportProgress() {
    const progressBar = document.getElementById('import-progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressText = document.getElementById('progress-text');
    const processedCount = document.getElementById('processed-count');
    const totalCount = document.getElementById('total-count');
    
    const totalRecords = 157; // Example value
    totalCount.textContent = totalRecords;
    
    let processedRecords = 0;
    const interval = setInterval(() => {
        if (processedRecords >= totalRecords) {
            clearInterval(interval);
            
            // Show complete step after a delay
            setTimeout(() => {
                showStep('step-import-complete');
                
                // Update success info
                document.getElementById('success-count').textContent = totalRecords;
                const campaignSelect = document.getElementById('campaign-select');
                const campaignValue = campaignSelect.options[campaignSelect.selectedIndex].text;
                document.getElementById('success-campaign').textContent = campaignValue;
            }, 1000);
            
            return;
        }
        
        // Increment processed records (add a random amount between 1 and 5)
        const increment = Math.floor(Math.random() * 5) + 1;
        processedRecords = Math.min(processedRecords + increment, totalRecords);
        
        // Calculate progress percentage
        const percentage = Math.floor((processedRecords / totalRecords) * 100);
        
        // Update UI
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
        progressPercentage.textContent = `${percentage}%`;
        document.querySelector('.progress-circle').style.setProperty('--progress', `${percentage}%`);
        processedCount.textContent = processedRecords;
        
        // Update text based on progress
        if (percentage < 33) {
            progressText.textContent = 'Analisando dados...';
        } else if (percentage < 66) {
            progressText.textContent = 'Processando registros...';
        } else {
            progressText.textContent = 'Finalizando importação...';
        }
    }, 200);
}

/**
 * Reset import process
 */
function resetImport() {
    // Reset file selection
    document.querySelectorAll('.file-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('next-to-upload').classList.add('disabled');
    
    // Reset file upload
    hideFilePreview();
    
    // Reset mapping fields
    document.getElementById('mapping-fields-container').innerHTML = '';
    
    // Reset campaign selection
    document.getElementById('campaign-select').selectedIndex = 0;
    document.getElementById('create-new-campaign').checked = false;
    document.querySelector('.new-campaign-form').classList.add('d-none');
    document.getElementById('campaign-select').disabled = false;
    document.getElementById('new-campaign-name').value = '';
    document.getElementById('new-campaign-desc').value = '';
    
    // Reset progress
    const progressBar = document.getElementById('import-progress-bar');
    progressBar.style.width = '0%';
    progressBar.setAttribute('aria-valuenow', 0);
    document.getElementById('progress-percentage').textContent = '0%';
    document.querySelector('.progress-circle').style.setProperty('--progress', '0%');
    document.getElementById('processed-count').textContent = '0';
    document.getElementById('progress-text').textContent = 'Processando registros...';
}

/**
 * Show import help
 */
function showImportHelp() {
    // Create help modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'import-help-modal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'import-help-modal-label');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="import-help-modal-label">Ajuda: Importação de Contatos</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="accordion" id="import-help-accordion">
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#help-formats" aria-expanded="true" aria-controls="help-formats">
                                    Formatos de arquivo suportados
                                </button>
                            </h2>
                            <div id="help-formats" class="accordion-collapse collapse show" data-bs-parent="#import-help-accordion">
                                <div class="accordion-body">
                                    <p>A plataforma VoiceAI suporta os seguintes formatos:</p>
                                    <ul>
                                        <li><strong>CSV</strong> - Comma-Separated Values</li>
                                        <li><strong>XLSX</strong> - Microsoft Excel</li>
                                        <li><strong>JSON</strong> - JavaScript Object Notation</li>
                                        <li><strong>VCF</strong> - vCard (Virtual Contact File)</li>
                                    </ul>
                                    <p>Recomendamos o formato CSV para a maioria dos casos.</p>
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help-structure" aria-expanded="false" aria-controls="help-structure">
                                    Estrutura recomendada
                                </button>
                            </h2>
                            <div id="help-structure" class="accordion-collapse collapse" data-bs-parent="#import-help-accordion">
                                <div class="accordion-body">
                                    <p>Para obter melhores resultados, seu arquivo deve conter, no mínimo, estas colunas:</p>
                                    <ul>
                                        <li><strong>Nome</strong> - Nome completo do contato</li>
                                        <li><strong>Telefone</strong> - Número de telefone (preferencialmente com DDD)</li>
                                    </ul>
                                    <p>Colunas adicionais recomendadas:</p>
                                    <ul>
                                        <li><strong>Empresa</strong> - Nome da empresa</li>
                                        <li><strong>Email</strong> - Endereço de e-mail</li>
                                        <li><strong>Cargo</strong> - Cargo/função na empresa</li>
                                        <li><strong>Origem</strong> - De onde veio o contato (ex: LinkedIn, Feira, Indicação)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help-mapping" aria-expanded="false" aria-controls="help-mapping">
                                    Mapeamento de campos
                                </button>
                            </h2>
                            <div id="help-mapping" class="accordion-collapse collapse" data-bs-parent="#import-help-accordion">
                                <div class="accordion-body">
                                    <p>No passo de mapeamento, você precisa fazer a correspondência entre as colunas do seu arquivo e os campos do sistema VoiceAI.</p>
                                    <p>Campos obrigatórios:</p>
                                    <ul>
                                        <li><strong>Nome</strong> - Nome do contato</li>
                                        <li><strong>Telefone</strong> - Número de telefone para contato</li>
                                    </ul>
                                    <p>Se seu arquivo tiver nomes de coluna parecidos, o sistema tentará fazer a correspondência automática.</p>
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help-campaigns" aria-expanded="false" aria-controls="help-campaigns">
                                    Campanhas
                                </button>
                            </h2>
                            <div id="help-campaigns" class="accordion-collapse collapse" data-bs-parent="#import-help-accordion">
                                <div class="accordion-body">
                                    <p>Cada importação deve estar associada a uma campanha. Você pode:</p>
                                    <ul>
                                        <li>Selecionar uma campanha existente</li>
                                        <li>Criar uma nova campanha durante a importação</li>
                                    </ul>
                                    <p>Associar contatos a campanhas ajuda a organizar e segmentar seus leads, além de permitir análises mais detalhadas.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    const bootstrapModal = new bootstrap.Modal(document.getElementById('import-help-modal'));
    bootstrapModal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('import-help-modal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

// Expose functions to window object instead of using ES6 exports
window.initFileUpload = initFileUpload;