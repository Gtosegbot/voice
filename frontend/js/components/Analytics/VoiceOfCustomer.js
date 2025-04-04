/**
 * Voice of Customer Analytics Component
 * This component provides sentiment analysis and insights from call transcripts
 */

/**
 * Initialize the Voice of Customer Analytics page
 */
function initVoiceOfCustomer() {
    renderVoiceOfCustomerPage();
    setupVoiceOfCustomerEvents();
    loadSentimentAnalytics();
}

/**
 * Render the Voice of Customer Analytics page
 */
function renderVoiceOfCustomerPage() {
    const voiceOfCustomerPage = document.getElementById('voice-of-customer-page');
    
    voiceOfCustomerPage.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="page-title">Voice of Customer Analytics</h1>
            <div>
                <button class="btn btn-outline-primary me-2" id="export-insights-btn">
                    <i class="fas fa-file-export"></i> Exportar Relatório
                </button>
                <button class="btn btn-primary" id="refresh-analytics-btn">
                    <i class="fas fa-sync-alt"></i> Atualizar Dados
                </button>
            </div>
        </div>
        
        <!-- Time Period Filter -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row align-items-end">
                    <div class="col-md-3">
                        <label for="time-period" class="form-label">Período</label>
                        <select class="form-select" id="time-period">
                            <option value="7">Últimos 7 dias</option>
                            <option value="30" selected>Últimos 30 dias</option>
                            <option value="90">Últimos 90 dias</option>
                            <option value="180">Últimos 6 meses</option>
                            <option value="365">Último ano</option>
                            <option value="custom">Período personalizado</option>
                        </select>
                    </div>
                    <div class="col-md-3 custom-date-range" style="display: none;">
                        <label for="start-date" class="form-label">Data Inicial</label>
                        <input type="date" class="form-control" id="start-date">
                    </div>
                    <div class="col-md-3 custom-date-range" style="display: none;">
                        <label for="end-date" class="form-label">Data Final</label>
                        <input type="date" class="form-control" id="end-date">
                    </div>
                    <div class="col-md-3">
                        <label for="campaign-filter" class="form-label">Campanha</label>
                        <select class="form-select" id="campaign-filter">
                            <option value="all" selected>Todas as campanhas</option>
                            <!-- Will be populated dynamically -->
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-primary w-100" id="apply-filters-btn">
                            Aplicar Filtros
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- KPI Cards Row -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card border-left-primary h-100">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                    Conversas Analisadas
                                </div>
                                <div class="h5 mb-0 font-weight-bold" id="conversations-count">0</div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-comments fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-left-success h-100">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                    Sentimento Médio
                                </div>
                                <div class="h5 mb-0 font-weight-bold" id="average-sentiment">0%</div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-smile fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-left-info h-100">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                    Tópicos Identificados
                                </div>
                                <div class="h5 mb-0 font-weight-bold" id="topics-count">0</div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-tags fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-left-warning h-100">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                    Oportunidades de Melhoria
                                </div>
                                <div class="h5 mb-0 font-weight-bold" id="improvement-count">0</div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-lightbulb fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Sentiment Analysis & Topic Distribution Row -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="mb-0">Análise de Sentimento</h5>
                    </div>
                    <div class="card-body">
                        <div class="sentiment-summary mb-3">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <span class="badge bg-success">Positivo: <span id="positive-percentage">0%</span></span>
                                </div>
                                <div>
                                    <span class="badge bg-secondary">Neutro: <span id="neutral-percentage">0%</span></span>
                                </div>
                                <div>
                                    <span class="badge bg-danger">Negativo: <span id="negative-percentage">0%</span></span>
                                </div>
                            </div>
                        </div>
                        <canvas id="sentiment-chart" height="250"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="mb-0">Distribuição de Tópicos</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="topics-chart" height="250"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Trend Analysis & Keyword Frequency Row -->
        <div class="row mb-4">
            <div class="col-md-7">
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="mb-0">Tendência de Sentimento ao Longo do Tempo</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="sentiment-trend-chart" height="250"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-5">
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="mb-0">Frequência de Palavras-chave</h5>
                    </div>
                    <div class="card-body">
                        <div id="keyword-cloud" style="height: 250px;"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Improvement Opportunities Table -->
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Oportunidades de Melhoria Identificadas</h5>
                <button class="btn btn-sm btn-outline-primary" id="view-all-opportunities-btn">
                    Ver Todas
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Problema Identificado</th>
                                <th>Frequência</th>
                                <th>Impacto</th>
                                <th>Sentimento</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="opportunities-table-body">
                            <!-- Will be populated dynamically -->
                            <tr>
                                <td colspan="6" class="text-center">Carregando oportunidades...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Top Customer Verbatims -->
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">Principais Verbalizações de Clientes</h5>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="card bg-success text-white">
                            <div class="card-header">Comentários Positivos</div>
                            <div class="card-body">
                                <div class="verbatim-slider" id="positive-verbatims">
                                    <div class="verbatim-item">
                                        <p>Carregando comentários positivos...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-secondary text-white">
                            <div class="card-header">Sugestões de Melhorias</div>
                            <div class="card-body">
                                <div class="verbatim-slider" id="suggestion-verbatims">
                                    <div class="verbatim-item">
                                        <p>Carregando sugestões...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-danger text-white">
                            <div class="card-header">Pontos de Atenção</div>
                            <div class="card-body">
                                <div class="verbatim-slider" id="negative-verbatims">
                                    <div class="verbatim-item">
                                        <p>Carregando pontos de atenção...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Improvement Opportunity Detail Modal -->
        <div class="modal fade" id="opportunity-detail-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="opportunity-detail-title">Detalhes da Oportunidade</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <h6>Categoria</h6>
                                <p id="opportunity-category">Carregando...</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Impacto</h6>
                                <p id="opportunity-impact">Carregando...</p>
                            </div>
                        </div>
                        
                        <h6>Descrição do Problema</h6>
                        <p id="opportunity-description">Carregando...</p>
                        
                        <h6>Exemplos de Verbalizações</h6>
                        <div id="opportunity-verbatims">
                            <p>Carregando exemplos...</p>
                        </div>
                        
                        <h6>Estatísticas</h6>
                        <div class="row">
                            <div class="col-md-4">
                                <div class="card">
                                    <div class="card-body text-center">
                                        <h6 class="card-title">Frequência</h6>
                                        <p class="h4" id="opportunity-frequency">0</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card">
                                    <div class="card-body text-center">
                                        <h6 class="card-title">Sentimento</h6>
                                        <p class="h4" id="opportunity-sentiment">Neutro</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card">
                                    <div class="card-body text-center">
                                        <h6 class="card-title">Tendência</h6>
                                        <p class="h4" id="opportunity-trend">Estável</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <h6 class="mt-3">Recomendações</h6>
                        <div id="opportunity-recommendations">
                            <p>Carregando recomendações...</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        <button type="button" class="btn btn-primary" id="create-task-btn">Criar Tarefa</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Create Task Modal -->
        <div class="modal fade" id="create-task-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Criar Tarefa de Melhoria</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="create-task-form">
                            <div class="mb-3">
                                <label for="task-title" class="form-label">Título</label>
                                <input type="text" class="form-control" id="task-title" required>
                            </div>
                            <div class="mb-3">
                                <label for="task-description" class="form-label">Descrição</label>
                                <textarea class="form-control" id="task-description" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="task-priority" class="form-label">Prioridade</label>
                                <select class="form-select" id="task-priority" required>
                                    <option value="high">Alta</option>
                                    <option value="medium" selected>Média</option>
                                    <option value="low">Baixa</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="task-assignee" class="form-label">Responsável</label>
                                <select class="form-select" id="task-assignee" required>
                                    <option value="">-- Selecionar Responsável --</option>
                                    <!-- Will be populated dynamically -->
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="task-due-date" class="form-label">Data de Vencimento</label>
                                <input type="date" class="form-control" id="task-due-date" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="save-task-btn">Criar Tarefa</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load Chart.js if not already loaded
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js';
        document.head.appendChild(script);
    }
    
    // Load jQCloud for word cloud if not already loaded
    if (typeof $.fn.jQCloud === 'undefined') {
        const jQCloudCSS = document.createElement('link');
        jQCloudCSS.rel = 'stylesheet';
        jQCloudCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/jqcloud/1.0.4/jqcloud.min.css';
        document.head.appendChild(jQCloudCSS);
        
        const jQCloudScript = document.createElement('script');
        jQCloudScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jqcloud/1.0.4/jqcloud.min.js';
        document.head.appendChild(jQCloudScript);
    }
}

/**
 * Setup Voice of Customer Analytics events
 */
function setupVoiceOfCustomerEvents() {
    // Time period filter change
    const timePeriodSelect = document.getElementById('time-period');
    if (timePeriodSelect) {
        timePeriodSelect.addEventListener('change', () => {
            const customDateRangeFields = document.querySelectorAll('.custom-date-range');
            if (timePeriodSelect.value === 'custom') {
                customDateRangeFields.forEach(field => {
                    field.style.display = 'block';
                });
            } else {
                customDateRangeFields.forEach(field => {
                    field.style.display = 'none';
                });
            }
        });
    }
    
    // Apply filters button
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            loadSentimentAnalytics();
        });
    }
    
    // Refresh analytics button
    const refreshAnalyticsBtn = document.getElementById('refresh-analytics-btn');
    if (refreshAnalyticsBtn) {
        refreshAnalyticsBtn.addEventListener('click', () => {
            refreshAnalyticsBtn.innerHTML = '<i class="fas fa-spin fa-spinner"></i> Atualizando...';
            refreshAnalyticsBtn.disabled = true;
            
            loadSentimentAnalytics(() => {
                refreshAnalyticsBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Dados';
                refreshAnalyticsBtn.disabled = false;
            });
        });
    }
    
    // Export insights button
    const exportInsightsBtn = document.getElementById('export-insights-btn');
    if (exportInsightsBtn) {
        exportInsightsBtn.addEventListener('click', () => {
            exportAnalyticsReport();
        });
    }
    
    // View all opportunities button
    const viewAllOpportunitiesBtn = document.getElementById('view-all-opportunities-btn');
    if (viewAllOpportunitiesBtn) {
        viewAllOpportunitiesBtn.addEventListener('click', () => {
            viewAllOpportunities();
        });
    }
    
    // Create task button in opportunity detail modal
    const createTaskBtn = document.getElementById('create-task-btn');
    if (createTaskBtn) {
        createTaskBtn.addEventListener('click', () => {
            const opportunityDetailModal = bootstrap.Modal.getInstance(document.getElementById('opportunity-detail-modal'));
            opportunityDetailModal.hide();
            
            const createTaskModal = new bootstrap.Modal(document.getElementById('create-task-modal'));
            createTaskModal.show();
            
            // Pre-fill task form with opportunity details
            const opportunityTitle = document.getElementById('opportunity-detail-title').textContent;
            const opportunityDescription = document.getElementById('opportunity-description').textContent;
            
            document.getElementById('task-title').value = `Melhoria: ${opportunityTitle}`;
            document.getElementById('task-description').value = `Oportunidade de melhoria identificada pela análise de Voice of Customer:\n\n${opportunityDescription}`;
            
            // Set default due date (2 weeks from now)
            const twoWeeksLater = new Date();
            twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
            document.getElementById('task-due-date').value = twoWeeksLater.toISOString().split('T')[0];
            
            // Load assignees
            loadTaskAssignees();
        });
    }
    
    // Save task button
    const saveTaskBtn = document.getElementById('save-task-btn');
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', () => {
            saveTask();
        });
    }
    
    // Add click event for opportunity detail buttons
    // These will be dynamically added, so we use event delegation
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('view-opportunity-btn')) {
            const opportunityId = e.target.getAttribute('data-opportunity-id');
            showOpportunityDetails(opportunityId);
        }
    });
}

/**
 * Load sentiment analytics data
 * @param {Function} callback - Optional callback function
 */
function loadSentimentAnalytics(callback) {
    // Get filters
    const timePeriod = document.getElementById('time-period').value;
    let startDate, endDate;
    
    if (timePeriod === 'custom') {
        startDate = document.getElementById('start-date').value;
        endDate = document.getElementById('end-date').value;
    } else {
        // Calculate dates based on time period
        const today = new Date();
        endDate = today.toISOString().split('T')[0];
        
        const startDateObj = new Date();
        startDateObj.setDate(today.getDate() - parseInt(timePeriod));
        startDate = startDateObj.toISOString().split('T')[0];
    }
    
    const campaignId = document.getElementById('campaign-filter').value;
    
    // In a real app, you would fetch data from your API
    // Here we'll use mock data for demonstration
    setTimeout(() => {
        // Mock data for sentiment analysis
        const mockSentimentData = {
            conversations: 534,
            averageSentiment: 78,
            topics: 12,
            improvements: 8,
            sentimentDistribution: {
                positive: 65,
                neutral: 23,
                negative: 12
            },
            topicDistribution: [
                { topic: 'Preço', percentage: 28 },
                { topic: 'Qualidade', percentage: 23 },
                { topic: 'Atendimento', percentage: 19 },
                { topic: 'Entrega', percentage: 15 },
                { topic: 'Funcionalidades', percentage: 9 },
                { topic: 'Outros', percentage: 6 }
            ],
            sentimentTrend: [
                { date: '2023-03-01', positive: 60, neutral: 25, negative: 15 },
                { date: '2023-03-08', positive: 62, neutral: 24, negative: 14 },
                { date: '2023-03-15', positive: 64, neutral: 24, negative: 12 },
                { date: '2023-03-22', positive: 63, neutral: 25, negative: 12 },
                { date: '2023-03-29', positive: 65, neutral: 23, negative: 12 }
            ],
            keywordFrequency: [
                { text: 'preço', weight: 25 },
                { text: 'qualidade', weight: 18 },
                { text: 'atendimento', weight: 15 },
                { text: 'entrega', weight: 12 },
                { text: 'rápido', weight: 10 },
                { text: 'produto', weight: 10 },
                { text: 'funcionalidade', weight: 8 },
                { text: 'interface', weight: 8 },
                { text: 'dificuldade', weight: 7 },
                { text: 'suporte', weight: 7 },
                { text: 'problema', weight: 6 },
                { text: 'solução', weight: 6 },
                { text: 'integração', weight: 5 },
                { text: 'documentação', weight: 5 },
                { text: 'instalação', weight: 4 }
            ],
            improvementOpportunities: [
                {
                    id: 1,
                    category: 'Preço',
                    problem: 'Incompatibilidade entre preço e funcionalidades',
                    frequency: 28,
                    impact: 'Alto',
                    sentiment: 'Negativo',
                    description: 'Muitos clientes mencionam que o preço do produto é muito alto para o conjunto atual de funcionalidades oferecidas.',
                    verbatims: [
                        'O preço é muito alto para o que o produto entrega.',
                        'Não vejo valor no preço atual considerando as limitações do produto.',
                        'Precisaria de mais funcionalidades para justificar esse preço.'
                    ],
                    recommendations: [
                        'Revisar estratégia de preços para alinhar melhor com o valor percebido.',
                        'Considerar um modelo de preços por funcionalidades utilizadas.',
                        'Adicionar mais valor ao produto sem aumentar preço.'
                    ]
                },
                {
                    id: 2,
                    category: 'Interface',
                    problem: 'Dificuldade de navegação no painel de controle',
                    frequency: 24,
                    impact: 'Médio',
                    sentiment: 'Neutro',
                    description: 'Usuários relatam dificuldades para encontrar funcionalidades específicas no painel de controle devido à organização pouco intuitiva dos menus.',
                    verbatims: [
                        'Tenho dificuldade para encontrar as configurações que preciso no painel.',
                        'A interface é confusa e desorganizada.',
                        'Precisei de suporte para encontrar funcionalidades básicas.'
                    ],
                    recommendations: [
                        'Redesenhar a navegação do painel de controle com foco na usabilidade.',
                        'Realizar testes de usabilidade com usuários reais.',
                        'Implementar sistema de pesquisa para funcionalidades.'
                    ]
                },
                {
                    id: 3,
                    category: 'Funcionalidades',
                    problem: 'Ausência de integração com plataformas populares',
                    frequency: 19,
                    impact: 'Alto',
                    sentiment: 'Negativo',
                    description: 'Clientes frequentemente mencionam a falta de integração com ferramentas populares como fator limitante para adoção completa do produto.',
                    verbatims: [
                        'Precisamos de integração com o sistema X que usamos diariamente.',
                        'A falta de integração com Y nos obriga a fazer trabalho manual.',
                        'Já perguntei sobre integração com Z várias vezes e não tive resposta.'
                    ],
                    recommendations: [
                        'Priorizar desenvolvimento de integrações com sistemas mais solicitados.',
                        'Criar documentação clara para API para integrações personalizadas.',
                        'Estabelecer parcerias com fornecedores de sistemas complementares.'
                    ]
                },
                {
                    id: 4,
                    category: 'Suporte',
                    problem: 'Tempo de resposta do suporte técnico',
                    frequency: 17,
                    impact: 'Médio',
                    sentiment: 'Negativo',
                    description: 'Diversos clientes relatam demora no atendimento do suporte técnico, especialmente para problemas críticos que impedem o uso do sistema.',
                    verbatims: [
                        'Esperamos 48 horas por uma resposta sobre um problema crítico.',
                        'O suporte demora muito para responder questões técnicas.',
                        'Precisei escalar para gerência para conseguir suporte rápido.'
                    ],
                    recommendations: [
                        'Revisar processos e SLAs do suporte técnico.',
                        'Implementar sistema de priorização baseado na criticidade do problema.',
                        'Aumentar equipe de suporte técnico especializado.'
                    ]
                },
                {
                    id: 5,
                    category: 'Documentação',
                    problem: 'Documentação técnica insuficiente',
                    frequency: 15,
                    impact: 'Médio',
                    sentiment: 'Neutro',
                    description: 'Usuários técnicos reportam dificuldades com a implementação devido à documentação técnica incompleta ou desatualizada.',
                    verbatims: [
                        'A documentação não cobre cenários comuns de uso avançado.',
                        'Exemplos na documentação estão desatualizados.',
                        'Tive que descobrir sozinho como implementar uma função básica.'
                    ],
                    recommendations: [
                        'Revisar e atualizar toda a documentação técnica.',
                        'Adicionar mais exemplos práticos e casos de uso.',
                        'Criar vídeos tutoriais para implementações complexas.'
                    ]
                }
            ],
            verbatims: {
                positive: [
                    {
                        text: "A nova interface está muito mais intuitiva, facilitou bastante nosso trabalho.",
                        context: "Feedback sobre atualização recente"
                    },
                    {
                        text: "O suporte foi extremamente ágil e resolveu nosso problema em minutos.",
                        context: "Sobre experiência com suporte técnico"
                    },
                    {
                        text: "A funcionalidade de relatórios automatizados economiza horas do nosso tempo toda semana.",
                        context: "Sobre recursos de produtividade"
                    }
                ],
                suggestion: [
                    {
                        text: "Seria útil ter a opção de personalizar os campos do dashboard conforme nossas necessidades específicas.",
                        context: "Sugestão de melhoria para dashboard"
                    },
                    {
                        text: "Poderiam oferecer um plano intermediário entre o básico e o premium para empresas do nosso porte.",
                        context: "Sobre estrutura de preços"
                    },
                    {
                        text: "A integração com ferramentas de CRM seria uma adição valiosa para nosso fluxo de trabalho.",
                        context: "Sugestão de nova funcionalidade"
                    }
                ],
                negative: [
                    {
                        text: "Tivemos vários problemas de lentidão durante horários de pico, o que impactou nosso atendimento ao cliente.",
                        context: "Sobre problemas de desempenho"
                    },
                    {
                        text: "A curva de aprendizado é muito íngreme para novos usuários, perdemos tempo com treinamento que poderia ser evitado.",
                        context: "Sobre complexidade do sistema"
                    },
                    {
                        text: "O processo de exportação de dados frequentemente falha quando lidamos com volumes maiores.",
                        context: "Sobre problemas técnicos recorrentes"
                    }
                ]
            }
        };
        
        updateAnalyticsDashboard(mockSentimentData);
        
        if (callback && typeof callback === 'function') {
            callback();
        }
    }, 1500);
}

/**
 * Update analytics dashboard with data
 * @param {Object} data - Analytics data
 */
function updateAnalyticsDashboard(data) {
    // Update KPI cards
    document.getElementById('conversations-count').textContent = data.conversations;
    document.getElementById('average-sentiment').textContent = `${data.averageSentiment}%`;
    document.getElementById('topics-count').textContent = data.topics;
    document.getElementById('improvement-count').textContent = data.improvements;
    
    // Update sentiment percentages
    document.getElementById('positive-percentage').textContent = `${data.sentimentDistribution.positive}%`;
    document.getElementById('neutral-percentage').textContent = `${data.sentimentDistribution.neutral}%`;
    document.getElementById('negative-percentage').textContent = `${data.sentimentDistribution.negative}%`;
    
    // Render sentiment distribution chart
    renderSentimentChart(data.sentimentDistribution);
    
    // Render topic distribution chart
    renderTopicChart(data.topicDistribution);
    
    // Render sentiment trend chart
    renderSentimentTrendChart(data.sentimentTrend);
    
    // Render keyword cloud
    renderKeywordCloud(data.keywordFrequency);
    
    // Render improvement opportunities table
    renderOpportunitiesTable(data.improvementOpportunities);
    
    // Render verbatims sliders
    renderVerbatims(data.verbatims);
}

/**
 * Render sentiment distribution chart
 * @param {Object} sentimentData - Sentiment distribution data
 */
function renderSentimentChart(sentimentData) {
    // Wait for Chart.js to load
    if (typeof Chart === 'undefined') {
        setTimeout(() => renderSentimentChart(sentimentData), 100);
        return;
    }
    
    const ctx = document.getElementById('sentiment-chart').getContext('2d');
    
    // Destroy existing chart if any
    if (window.sentimentChart) {
        window.sentimentChart.destroy();
    }
    
    window.sentimentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positivo', 'Neutro', 'Negativo'],
            datasets: [{
                data: [sentimentData.positive, sentimentData.neutral, sentimentData.negative],
                backgroundColor: ['#28a745', '#6c757d', '#dc3545'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Render topic distribution chart
 * @param {Array} topicData - Topic distribution data
 */
function renderTopicChart(topicData) {
    // Wait for Chart.js to load
    if (typeof Chart === 'undefined') {
        setTimeout(() => renderTopicChart(topicData), 100);
        return;
    }
    
    const ctx = document.getElementById('topics-chart').getContext('2d');
    
    // Destroy existing chart if any
    if (window.topicChart) {
        window.topicChart.destroy();
    }
    
    // Prepare data
    const labels = topicData.map(item => item.topic);
    const data = topicData.map(item => item.percentage);
    
    // Generate random colors
    const colors = [];
    for (let i = 0; i < topicData.length; i++) {
        const r = Math.floor(Math.random() * 200);
        const g = Math.floor(Math.random() * 200);
        const b = Math.floor(Math.random() * 200);
        colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
    }
    
    window.topicChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribuição por Tópico (%)',
                data: data,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Render sentiment trend chart
 * @param {Array} trendData - Sentiment trend data
 */
function renderSentimentTrendChart(trendData) {
    // Wait for Chart.js to load
    if (typeof Chart === 'undefined') {
        setTimeout(() => renderSentimentTrendChart(trendData), 100);
        return;
    }
    
    const ctx = document.getElementById('sentiment-trend-chart').getContext('2d');
    
    // Destroy existing chart if any
    if (window.trendChart) {
        window.trendChart.destroy();
    }
    
    // Prepare data
    const labels = trendData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
    });
    
    const positiveData = trendData.map(item => item.positive);
    const neutralData = trendData.map(item => item.neutral);
    const negativeData = trendData.map(item => item.negative);
    
    window.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Positivo',
                    data: positiveData,
                    backgroundColor: 'rgba(40, 167, 69, 0.2)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Neutro',
                    data: neutralData,
                    backgroundColor: 'rgba(108, 117, 125, 0.2)',
                    borderColor: 'rgba(108, 117, 125, 1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Negativo',
                    data: negativeData,
                    backgroundColor: 'rgba(220, 53, 69, 0.2)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Percentual (%)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Render keyword cloud
 * @param {Array} keywordData - Keyword frequency data
 */
function renderKeywordCloud(keywordData) {
    // Wait for jQCloud to load
    if (typeof $.fn.jQCloud === 'undefined') {
        setTimeout(() => renderKeywordCloud(keywordData), 100);
        return;
    }
    
    // Clear previous word cloud
    $('#keyword-cloud').empty();
    
    // Create word cloud
    $('#keyword-cloud').jQCloud(keywordData, {
        width: $('#keyword-cloud').width(),
        height: 250,
        colors: ["#66C2A5", "#FC8D62", "#8DA0CB", "#E78AC3", "#A6D854", "#FFD92F", "#E5C494", "#B3B3B3"],
        fontSize: {
            from: 0.1,
            to: 0.02
        }
    });
}

/**
 * Render improvement opportunities table
 * @param {Array} opportunities - Improvement opportunities data
 */
function renderOpportunitiesTable(opportunities) {
    const tableBody = document.getElementById('opportunities-table-body');
    
    if (!opportunities || opportunities.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Nenhuma oportunidade de melhoria identificada.</td>
            </tr>
        `;
        return;
    }
    
    // Sort opportunities by frequency (descending)
    opportunities.sort((a, b) => b.frequency - a.frequency);
    
    // Take only top 5 for the main table
    const topOpportunities = opportunities.slice(0, 5);
    
    const rows = topOpportunities.map(opportunity => {
        // Determine sentiment badge color
        let sentimentBadgeClass = 'bg-secondary';
        if (opportunity.sentiment === 'Positivo') {
            sentimentBadgeClass = 'bg-success';
        } else if (opportunity.sentiment === 'Negativo') {
            sentimentBadgeClass = 'bg-danger';
        }
        
        // Determine impact badge color
        let impactBadgeClass = 'bg-secondary';
        if (opportunity.impact === 'Alto') {
            impactBadgeClass = 'bg-danger';
        } else if (opportunity.impact === 'Médio') {
            impactBadgeClass = 'bg-warning text-dark';
        } else if (opportunity.impact === 'Baixo') {
            impactBadgeClass = 'bg-info';
        }
        
        return `
            <tr>
                <td>${opportunity.category}</td>
                <td>${opportunity.problem}</td>
                <td>${opportunity.frequency}</td>
                <td><span class="badge ${impactBadgeClass}">${opportunity.impact}</span></td>
                <td><span class="badge ${sentimentBadgeClass}">${opportunity.sentiment}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-opportunity-btn" data-opportunity-id="${opportunity.id}">
                        <i class="fas fa-eye"></i> Detalhes
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = rows;
}

/**
 * Render verbatims sliders
 * @param {Object} verbatimsData - Verbatims data
 */
function renderVerbatims(verbatimsData) {
    // Render positive verbatims
    const positiveVerbatims = document.getElementById('positive-verbatims');
    positiveVerbatims.innerHTML = verbatimsData.positive.map(item => `
        <div class="verbatim-item">
            <p class="mb-1">"${item.text}"</p>
            <small class="text-muted">${item.context}</small>
        </div>
    `).join('');
    
    // Render suggestion verbatims
    const suggestionVerbatims = document.getElementById('suggestion-verbatims');
    suggestionVerbatims.innerHTML = verbatimsData.suggestion.map(item => `
        <div class="verbatim-item">
            <p class="mb-1">"${item.text}"</p>
            <small class="text-muted">${item.context}</small>
        </div>
    `).join('');
    
    // Render negative verbatims
    const negativeVerbatims = document.getElementById('negative-verbatims');
    negativeVerbatims.innerHTML = verbatimsData.negative.map(item => `
        <div class="verbatim-item">
            <p class="mb-1">"${item.text}"</p>
            <small class="text-muted">${item.context}</small>
        </div>
    `).join('');
    
    // Initialize verbatim sliders (in a real implementation, you would use a carousel library)
    initVerbatimSliders();
}

/**
 * Initialize verbatim sliders
 */
function initVerbatimSliders() {
    // In a real implementation, you would initialize a carousel or slider library here
    // For this example, we'll implement a simple auto-rotation
    
    const verbatimContainers = document.querySelectorAll('.verbatim-slider');
    
    verbatimContainers.forEach(container => {
        const verbatimItems = container.querySelectorAll('.verbatim-item');
        if (verbatimItems.length <= 1) return;
        
        let currentIndex = 0;
        
        // Show only the first verbatim initially
        verbatimItems.forEach((item, index) => {
            if (index === 0) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Set interval to rotate verbatims
        setInterval(() => {
            verbatimItems[currentIndex].style.display = 'none';
            currentIndex = (currentIndex + 1) % verbatimItems.length;
            verbatimItems[currentIndex].style.display = 'block';
        }, 5000);
    });
}

/**
 * Show opportunity details
 * @param {string} opportunityId - Opportunity ID
 */
function showOpportunityDetails(opportunityId) {
    // In a real app, you would fetch opportunity details from your API
    // Here we'll use mock data for demonstration
    
    // Find opportunity in the mock data (simulating API call)
    // You would replace this with an actual API call
    const opportunity = mockOpportunities.find(o => o.id === parseInt(opportunityId));
    
    if (!opportunity) {
        alert('Opportunity not found');
        return;
    }
    
    // Update modal content
    document.getElementById('opportunity-detail-title').textContent = opportunity.problem;
    document.getElementById('opportunity-category').textContent = opportunity.category;
    document.getElementById('opportunity-impact').textContent = opportunity.impact;
    document.getElementById('opportunity-description').textContent = opportunity.description;
    
    // Render verbatims
    const verbatimsContainer = document.getElementById('opportunity-verbatims');
    verbatimsContainer.innerHTML = opportunity.verbatims.map(verbatim => `
        <div class="alert alert-light">
            "${verbatim}"
        </div>
    `).join('');
    
    // Update statistics
    document.getElementById('opportunity-frequency').textContent = opportunity.frequency;
    document.getElementById('opportunity-sentiment').textContent = opportunity.sentiment;
    
    // Determine trend icon and text based on frequency pattern (in a real app, you would use actual trend data)
    let trendIcon, trendText;
    if (opportunity.frequency > 20) {
        trendIcon = '<i class="fas fa-arrow-up text-danger"></i>';
        trendText = 'Crescente';
    } else if (opportunity.frequency < 10) {
        trendIcon = '<i class="fas fa-arrow-down text-success"></i>';
        trendText = 'Decrescente';
    } else {
        trendIcon = '<i class="fas fa-equals text-secondary"></i>';
        trendText = 'Estável';
    }
    document.getElementById('opportunity-trend').innerHTML = `${trendIcon} ${trendText}`;
    
    // Render recommendations
    const recommendationsContainer = document.getElementById('opportunity-recommendations');
    recommendationsContainer.innerHTML = opportunity.recommendations.map(recommendation => `
        <div class="alert alert-info">
            ${recommendation}
        </div>
    `).join('');
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('opportunity-detail-modal'));
    modal.show();
}

/**
 * View all improvement opportunities
 */
function viewAllOpportunities() {
    // In a real app, you would redirect to a detailed opportunities page
    // or show a modal with all opportunities
    // Here we'll simply alert for demonstration
    alert('Esta funcionalidade levaria a uma página detalhada com todas as oportunidades de melhoria identificadas.');
}

/**
 * Export analytics report
 */
function exportAnalyticsReport() {
    // In a real app, you would generate and download a report
    // Here we'll simply alert for demonstration
    alert('Relatório de análise de Voice of Customer exportado com sucesso!');
}

/**
 * Load task assignees
 */
function loadTaskAssignees() {
    // In a real app, you would fetch users from your API
    // Here we'll use mock data for demonstration
    const mockUsers = [
        { id: 1, name: 'João Silva' },
        { id: 2, name: 'Maria Santos' },
        { id: 3, name: 'Pedro Almeida' },
        { id: 4, name: 'Ana Oliveira' },
        { id: 5, name: 'Carlos Pereira' }
    ];
    
    const assigneeSelect = document.getElementById('task-assignee');
    
    // Clear existing options except the first one
    while (assigneeSelect.options.length > 1) {
        assigneeSelect.remove(1);
    }
    
    // Add options for each user
    mockUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        assigneeSelect.appendChild(option);
    });
}

/**
 * Save task
 */
function saveTask() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const priority = document.getElementById('task-priority').value;
    const assignee = document.getElementById('task-assignee').value;
    const dueDate = document.getElementById('task-due-date').value;
    
    if (!title || !description || !assignee || !dueDate) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // In a real app, you would send this data to your API
    console.log('New task:', {
        title,
        description,
        priority,
        assignee,
        dueDate
    });
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('create-task-modal'));
    modal.hide();
    
    // Show success message
    alert('Tarefa criada com sucesso!');
    
    // Reset form
    document.getElementById('create-task-form').reset();
}

// Mock data for opportunities (simulating database data)
const mockOpportunities = [
    {
        id: 1,
        category: 'Preço',
        problem: 'Incompatibilidade entre preço e funcionalidades',
        frequency: 28,
        impact: 'Alto',
        sentiment: 'Negativo',
        description: 'Muitos clientes mencionam que o preço do produto é muito alto para o conjunto atual de funcionalidades oferecidas.',
        verbatims: [
            'O preço é muito alto para o que o produto entrega.',
            'Não vejo valor no preço atual considerando as limitações do produto.',
            'Precisaria de mais funcionalidades para justificar esse preço.'
        ],
        recommendations: [
            'Revisar estratégia de preços para alinhar melhor com o valor percebido.',
            'Considerar um modelo de preços por funcionalidades utilizadas.',
            'Adicionar mais valor ao produto sem aumentar preço.'
        ]
    },
    {
        id: 2,
        category: 'Interface',
        problem: 'Dificuldade de navegação no painel de controle',
        frequency: 24,
        impact: 'Médio',
        sentiment: 'Neutro',
        description: 'Usuários relatam dificuldades para encontrar funcionalidades específicas no painel de controle devido à organização pouco intuitiva dos menus.',
        verbatims: [
            'Tenho dificuldade para encontrar as configurações que preciso no painel.',
            'A interface é confusa e desorganizada.',
            'Precisei de suporte para encontrar funcionalidades básicas.'
        ],
        recommendations: [
            'Redesenhar a navegação do painel de controle com foco na usabilidade.',
            'Realizar testes de usabilidade com usuários reais.',
            'Implementar sistema de pesquisa para funcionalidades.'
        ]
    },
    {
        id: 3,
        category: 'Funcionalidades',
        problem: 'Ausência de integração com plataformas populares',
        frequency: 19,
        impact: 'Alto',
        sentiment: 'Negativo',
        description: 'Clientes frequentemente mencionam a falta de integração com ferramentas populares como fator limitante para adoção completa do produto.',
        verbatims: [
            'Precisamos de integração com o sistema X que usamos diariamente.',
            'A falta de integração com Y nos obriga a fazer trabalho manual.',
            'Já perguntei sobre integração com Z várias vezes e não tive resposta.'
        ],
        recommendations: [
            'Priorizar desenvolvimento de integrações com sistemas mais solicitados.',
            'Criar documentação clara para API para integrações personalizadas.',
            'Estabelecer parcerias com fornecedores de sistemas complementares.'
        ]
    },
    {
        id: 4,
        category: 'Suporte',
        problem: 'Tempo de resposta do suporte técnico',
        frequency: 17,
        impact: 'Médio',
        sentiment: 'Negativo',
        description: 'Diversos clientes relatam demora no atendimento do suporte técnico, especialmente para problemas críticos que impedem o uso do sistema.',
        verbatims: [
            'Esperamos 48 horas por uma resposta sobre um problema crítico.',
            'O suporte demora muito para responder questões técnicas.',
            'Precisei escalar para gerência para conseguir suporte rápido.'
        ],
        recommendations: [
            'Revisar processos e SLAs do suporte técnico.',
            'Implementar sistema de priorização baseado na criticidade do problema.',
            'Aumentar equipe de suporte técnico especializado.'
        ]
    },
    {
        id: 5,
        category: 'Documentação',
        problem: 'Documentação técnica insuficiente',
        frequency: 15,
        impact: 'Médio',
        sentiment: 'Neutro',
        description: 'Usuários técnicos reportam dificuldades com a implementação devido à documentação técnica incompleta ou desatualizada.',
        verbatims: [
            'A documentação não cobre cenários comuns de uso avançado.',
            'Exemplos na documentação estão desatualizados.',
            'Tive que descobrir sozinho como implementar uma função básica.'
        ],
        recommendations: [
            'Revisar e atualizar toda a documentação técnica.',
            'Adicionar mais exemplos práticos e casos de uso.',
            'Criar vídeos tutoriais para implementações complexas.'
        ]
    }
];