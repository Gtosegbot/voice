/**
 * Voice of Customer Analytics Component
 * This component renders the voice analytics interface for customer insights
 */

/**
 * Initialize Voice of Customer Analytics
 */
function initVoiceAnalytics() {
    renderVoiceAnalytics();
    setupVoiceAnalyticsEvents();
    loadVoiceAnalyticsData();
}

/**
 * Render the Voice of Customer Analytics HTML
 */
function renderVoiceAnalytics() {
    const analyticsContainer = document.getElementById('voice-analytics-container');
    
    if (!analyticsContainer) {
        console.error('Voice analytics container not found');
        return;
    }
    
    analyticsContainer.innerHTML = `
        <h2 class="section-title mb-4">Voice of Customer Analytics</h2>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">Customer Sentiment Trend</h5>
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="sentiment-daily-btn">Daily</button>
                            <button type="button" class="btn btn-sm btn-outline-primary active" id="sentiment-weekly-btn">Weekly</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="sentiment-monthly-btn">Monthly</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <canvas id="sentiment-trend-chart" height="250"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Feedback Categories</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="feedback-categories-chart" height="250"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">Top Customer Pain Points</h5>
                        <button class="btn btn-sm btn-primary" id="refresh-pain-points-btn">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Pain Point</th>
                                        <th>Frequency</th>
                                        <th>Impact</th>
                                        <th>Average Sentiment</th>
                                        <th>Trend</th>
                                        <th>Related Themes</th>
                                    </tr>
                                </thead>
                                <tbody id="pain-points-table">
                                    <tr>
                                        <td colspan="6" class="text-center">Loading data...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Improvement Opportunities</h5>
                    </div>
                    <div class="card-body">
                        <div id="improvement-opportunities">
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">Top Emerging Themes</h5>
                        <select class="form-select form-select-sm w-auto" id="themes-period-select">
                            <option value="weekly" selected>Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                    <div class="card-body">
                        <div id="emerging-themes-container">
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Set up Voice of Customer Analytics event listeners
 */
function setupVoiceAnalyticsEvents() {
    // Sentiment chart period buttons
    document.getElementById('sentiment-daily-btn').addEventListener('click', function() {
        setActiveButton(this);
        loadSentimentTrendData('daily');
    });
    
    document.getElementById('sentiment-weekly-btn').addEventListener('click', function() {
        setActiveButton(this);
        loadSentimentTrendData('weekly');
    });
    
    document.getElementById('sentiment-monthly-btn').addEventListener('click', function() {
        setActiveButton(this);
        loadSentimentTrendData('monthly');
    });
    
    // Refresh pain points button
    document.getElementById('refresh-pain-points-btn').addEventListener('click', function() {
        loadPainPointsData();
    });
    
    // Themes period select
    document.getElementById('themes-period-select').addEventListener('change', function() {
        loadEmergingThemesData(this.value);
    });
}

/**
 * Set active button in a button group
 * @param {HTMLElement} button - Button to set as active
 */
function setActiveButton(button) {
    // Remove active class from all buttons in the group
    button.parentNode.querySelectorAll('.btn').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-secondary');
    });
    
    // Add active class to the clicked button
    button.classList.add('active');
    button.classList.remove('btn-outline-secondary');
    button.classList.add('btn-outline-primary');
}

/**
 * Load Voice of Customer Analytics data
 */
function loadVoiceAnalyticsData() {
    // Initialize sentiment trend chart
    initSentimentTrendChart();
    
    // Initialize feedback categories chart
    initFeedbackCategoriesChart();
    
    // Load pain points data
    loadPainPointsData();
    
    // Load improvement opportunities
    loadImprovementOpportunities();
    
    // Load emerging themes
    loadEmergingThemesData('weekly');
}

/**
 * Initialize the sentiment trend chart
 */
function initSentimentTrendChart() {
    const ctx = document.getElementById('sentiment-trend-chart').getContext('2d');
    
    // Initial data
    const data = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Positive',
                data: [0.65, 0.68, 0.72, 0.70],
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 2,
                tension: 0.4
            },
            {
                label: 'Neutral',
                data: [0.25, 0.22, 0.18, 0.20],
                backgroundColor: 'rgba(108, 117, 125, 0.1)',
                borderColor: 'rgba(108, 117, 125, 1)',
                borderWidth: 2,
                tension: 0.4
            },
            {
                label: 'Negative',
                data: [0.10, 0.10, 0.10, 0.10],
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 2,
                tension: 0.4
            }
        ]
    };
    
    window.sentimentTrendChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Percentage of Calls'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + (context.raw * 100).toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
    
    // Load real data for weekly view
    loadSentimentTrendData('weekly');
}

/**
 * Load sentiment trend data and update chart
 * @param {string} period - Data period (daily, weekly, monthly)
 */
function loadSentimentTrendData(period) {
    // In a real app, we would fetch this data from the API
    // For now, we'll use mock data
    let labels, positiveData, neutralData, negativeData;
    
    // Try to get data from API first
    apiGetSentimentTrend(period)
        .then(data => {
            if (data && data.labels) {
                // Update chart with API data
                window.sentimentTrendChart.data.labels = data.labels;
                window.sentimentTrendChart.data.datasets[0].data = data.positive;
                window.sentimentTrendChart.data.datasets[1].data = data.neutral;
                window.sentimentTrendChart.data.datasets[2].data = data.negative;
                window.sentimentTrendChart.update();
            } else {
                // Fall back to mock data if API call fails
                useMockSentimentData(period);
            }
        })
        .catch(error => {
            console.error('Error fetching sentiment trend data:', error);
            useMockSentimentData(period);
        });
}

/**
 * Use mock sentiment data when API is not available
 * @param {string} period - Data period (daily, weekly, monthly)
 */
function useMockSentimentData(period) {
    let labels, positiveData, neutralData, negativeData;
    
    switch (period) {
        case 'daily':
            labels = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'];
            positiveData = [0.70, 0.65, 0.68, 0.72, 0.74, 0.71, 0.69, 0.67, 0.70];
            neutralData = [0.20, 0.25, 0.22, 0.18, 0.16, 0.19, 0.21, 0.23, 0.20];
            negativeData = [0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10];
            break;
            
        case 'monthly':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            positiveData = [0.62, 0.64, 0.68, 0.70, 0.72, 0.74];
            neutralData = [0.28, 0.26, 0.22, 0.20, 0.18, 0.16];
            negativeData = [0.10, 0.10, 0.10, 0.10, 0.10, 0.10];
            break;
            
        default: // weekly
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            positiveData = [0.65, 0.68, 0.72, 0.70];
            neutralData = [0.25, 0.22, 0.18, 0.20];
            negativeData = [0.10, 0.10, 0.10, 0.10];
    }
    
    window.sentimentTrendChart.data.labels = labels;
    window.sentimentTrendChart.data.datasets[0].data = positiveData;
    window.sentimentTrendChart.data.datasets[1].data = neutralData;
    window.sentimentTrendChart.data.datasets[2].data = negativeData;
    
    window.sentimentTrendChart.update();
}

/**
 * Initialize the feedback categories chart
 */
function initFeedbackCategoriesChart() {
    const ctx = document.getElementById('feedback-categories-chart').getContext('2d');
    
    // Try to get data from API first
    apiGetFeedbackCategories()
        .then(data => {
            if (data && data.labels && data.values) {
                createFeedbackCategoriesChart(ctx, data.labels, data.values);
            } else {
                // Fall back to mock data if API call fails
                useMockFeedbackCategoriesData(ctx);
            }
        })
        .catch(error => {
            console.error('Error fetching feedback categories data:', error);
            useMockFeedbackCategoriesData(ctx);
        });
}

/**
 * Create feedback categories chart with data
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} labels - Category labels
 * @param {Array} values - Category values
 */
function createFeedbackCategoriesChart(ctx, labels, values) {
    const data = {
        labels: labels,
        datasets: [{
            data: values,
            backgroundColor: [
                'rgba(40, 167, 69, 0.7)',
                'rgba(255, 193, 7, 0.7)',
                'rgba(23, 162, 184, 0.7)',
                'rgba(74, 111, 233, 0.7)',
                'rgba(255, 112, 67, 0.7)',
                'rgba(108, 117, 125, 0.7)'
            ],
            borderWidth: 1
        }]
    };
    
    window.feedbackCategoriesChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Mentions'
                    }
                }
            }
        }
    });
}

/**
 * Use mock feedback categories data when API is not available
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
function useMockFeedbackCategoriesData(ctx) {
    const labels = ['Product Features', 'User Experience', 'Customer Service', 'Price', 'Technical Issues', 'Documentation'];
    const values = [45, 32, 28, 22, 18, 12];
    
    createFeedbackCategoriesChart(ctx, labels, values);
}

/**
 * Load pain points data
 */
function loadPainPointsData() {
    const table = document.getElementById('pain-points-table');
    table.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner-border spinner-border-sm text-primary" role="status"></div> Loading...</td></tr>';
    
    // Try to get data from API first
    apiGetPainPoints()
        .then(data => {
            if (data && data.length > 0) {
                renderPainPointsTable(data);
            } else {
                // Fall back to mock data if API call fails
                useMockPainPointsData();
            }
        })
        .catch(error => {
            console.error('Error fetching pain points data:', error);
            useMockPainPointsData();
        });
}

/**
 * Render pain points table with data
 * @param {Array} painPoints - Pain points data
 */
function renderPainPointsTable(painPoints) {
    const table = document.getElementById('pain-points-table');
    
    if (painPoints.length === 0) {
        table.innerHTML = '<tr><td colspan="6" class="text-center">No pain points data available</td></tr>';
        return;
    }
    
    let html = '';
    
    painPoints.forEach(point => {
        // Determine trend icon and color
        let trendIcon, trendColor;
        if (point.trend > 0.1) {
            trendIcon = 'fa-arrow-up';
            trendColor = 'text-danger';
        } else if (point.trend < -0.1) {
            trendIcon = 'fa-arrow-down';
            trendColor = 'text-success';
        } else {
            trendIcon = 'fa-equals';
            trendColor = 'text-secondary';
        }
        
        // Determine sentiment color
        let sentimentColor;
        if (point.sentiment >= 0.5) {
            sentimentColor = 'text-success';
        } else if (point.sentiment <= -0.5) {
            sentimentColor = 'text-danger';
        } else {
            sentimentColor = 'text-secondary';
        }
        
        html += `
            <tr>
                <td>${point.name}</td>
                <td>${point.frequency}</td>
                <td>
                    <div class="progress" style="height: 6px;">
                        <div class="progress-bar bg-primary" style="width: ${point.impact * 100}%"></div>
                    </div>
                </td>
                <td class="${sentimentColor}">${point.sentiment.toFixed(2)}</td>
                <td><i class="fas ${trendIcon} ${trendColor}"></i> ${Math.abs(point.trend).toFixed(2)}</td>
                <td>${point.themes.join(', ')}</td>
            </tr>
        `;
    });
    
    table.innerHTML = html;
}

/**
 * Use mock pain points data when API is not available
 */
function useMockPainPointsData() {
    const mockData = [
        {
            name: 'Dificuldade em configurar integrações',
            frequency: 42,
            impact: 0.85,
            sentiment: -0.68,
            trend: 0.15,
            themes: ['Configuração', 'Integrações', 'Complexidade']
        },
        {
            name: 'Interface do usuário confusa',
            frequency: 38,
            impact: 0.72,
            sentiment: -0.55,
            trend: -0.12,
            themes: ['UI/UX', 'Usabilidade', 'Design']
        },
        {
            name: 'Falta de tutoriais detalhados',
            frequency: 35,
            impact: 0.65,
            sentiment: -0.42,
            trend: 0.08,
            themes: ['Documentação', 'Onboarding', 'Suporte']
        },
        {
            name: 'Problemas de performance em chamadas longas',
            frequency: 30,
            impact: 0.78,
            sentiment: -0.72,
            trend: 0.22,
            themes: ['Performance', 'Estabilidade', 'Recursos']
        },
        {
            name: 'Preço elevado para pequenas empresas',
            frequency: 28,
            impact: 0.60,
            sentiment: -0.48,
            trend: -0.05,
            themes: ['Preço', 'Planos', 'ROI']
        }
    ];
    
    renderPainPointsTable(mockData);
}

/**
 * Load improvement opportunities
 */
function loadImprovementOpportunities() {
    const container = document.getElementById('improvement-opportunities');
    
    // Try to get data from API first
    apiGetImprovementOpportunities()
        .then(data => {
            if (data && data.length > 0) {
                renderImprovementOpportunities(data);
            } else {
                // Fall back to mock data if API call fails
                useMockImprovementOpportunities();
            }
        })
        .catch(error => {
            console.error('Error fetching improvement opportunities data:', error);
            useMockImprovementOpportunities();
        });
}

/**
 * Render improvement opportunities
 * @param {Array} opportunities - Improvement opportunities data
 */
function renderImprovementOpportunities(opportunities) {
    const container = document.getElementById('improvement-opportunities');
    
    if (opportunities.length === 0) {
        container.innerHTML = '<div class="text-center">No improvement opportunities available</div>';
        return;
    }
    
    let html = '<div class="list-group">';
    
    opportunities.forEach((opportunity, index) => {
        const priorityClass = 
            opportunity.priority === 'high' ? 'border-danger' : 
            opportunity.priority === 'medium' ? 'border-warning' : 'border-info';
            
        const priorityBadge = 
            opportunity.priority === 'high' ? '<span class="badge bg-danger">Alta</span>' : 
            opportunity.priority === 'medium' ? '<span class="badge bg-warning text-dark">Média</span>' : 
            '<span class="badge bg-info text-dark">Baixa</span>';
        
        html += `
            <div class="list-group-item list-group-item-action border-start border-4 ${priorityClass} mb-2">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${opportunity.title}</h6>
                    ${priorityBadge}
                </div>
                <p class="mb-1 small">${opportunity.description}</p>
                <div class="d-flex w-100 justify-content-between">
                    <small class="text-muted">Impacto: ${opportunity.impact}</small>
                    <small class="text-muted">Benefício: ${opportunity.benefit}</small>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Use mock improvement opportunities when API is not available
 */
function useMockImprovementOpportunities() {
    const mockData = [
        {
            title: 'Simplificar processo de integração',
            description: 'Desenvolver assistentes guiados para integração com CRMs e outras ferramentas populares.',
            priority: 'high',
            impact: 'Redução de 85% no tempo de setup',
            benefit: 'Aumento de 30% na adoção'
        },
        {
            title: 'Redesenhar interface de campanhas',
            description: 'Simplificar e modernizar a interface de gerenciamento de campanhas para melhorar usabilidade.',
            priority: 'high',
            impact: 'Melhoria de 60% na eficiência',
            benefit: 'Redução de 40% nas solicitações de suporte'
        },
        {
            title: 'Expandir biblioteca de tutoriais',
            description: 'Criar mais tutoriais em vídeo e documentação interativa para novos usuários.',
            priority: 'medium',
            impact: 'Aumento de 45% na autonomia do usuário',
            benefit: 'Redução de 25% em tickets de suporte'
        },
        {
            title: 'Otimizar performance para chamadas longas',
            description: 'Implementar melhorias técnicas para chamadas com mais de 30 minutos.',
            priority: 'medium',
            impact: 'Redução de 90% em quedas de chamadas longas',
            benefit: 'Aumento de 15% na satisfação'
        },
        {
            title: 'Criar plano para pequenas empresas',
            description: 'Desenvolver uma opção de preço mais acessível com recursos essenciais para pequenas empresas.',
            priority: 'low',
            impact: 'Acesso a novo segmento de mercado',
            benefit: 'Aumento de 20% na base de clientes'
        }
    ];
    
    renderImprovementOpportunities(mockData);
}

/**
 * Load emerging themes data
 * @param {string} period - Data period (weekly, monthly)
 */
function loadEmergingThemesData(period) {
    const container = document.getElementById('emerging-themes-container');
    container.innerHTML = `
        <div class="d-flex justify-content-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    // Try to get data from API first
    apiGetEmergingThemes(period)
        .then(data => {
            if (data && data.new_themes && data.growing_themes) {
                renderEmergingThemes(data);
            } else {
                // Fall back to mock data if API call fails
                useMockEmergingThemesData(period);
            }
        })
        .catch(error => {
            console.error('Error fetching emerging themes data:', error);
            useMockEmergingThemesData(period);
        });
}

/**
 * Render emerging themes
 * @param {Object} data - Emerging themes data
 */
function renderEmergingThemes(data) {
    const container = document.getElementById('emerging-themes-container');
    
    let html = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="fw-bold">Novos Temas</h6>
                <ul class="list-group">
    `;
    
    // Check if there are new themes
    if (data.new_themes && data.new_themes.length > 0) {
        data.new_themes.forEach(theme => {
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${theme}
                    <span class="badge bg-primary rounded-pill">Novo</span>
                </li>
            `;
        });
    } else {
        html += `
            <li class="list-group-item text-center">Nenhum novo tema detectado</li>
        `;
    }
    
    html += `
                </ul>
            </div>
            <div class="col-md-6">
                <h6 class="fw-bold">Temas em Crescimento</h6>
                <ul class="list-group">
    `;
    
    // Check if there are growing themes
    if (data.growing_themes && data.growing_themes.length > 0) {
        data.growing_themes.forEach(theme => {
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${theme.theme}
                    <span class="badge bg-success rounded-pill">+${theme.growth}</span>
                </li>
            `;
        });
    } else {
        html += `
            <li class="list-group-item text-center">Nenhum tema em crescimento detectado</li>
        `;
    }
    
    html += `
                </ul>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Use mock emerging themes data when API is not available
 * @param {string} period - Data period (weekly, monthly)
 */
function useMockEmergingThemesData(period) {
    let mockData;
    
    if (period === 'weekly') {
        mockData = {
            new_themes: ['API Webhook', 'Integração com Teams', 'Voice Biometrics'],
            growing_themes: [
                { theme: 'Mobile App', growth: 8 },
                { theme: 'Relatórios Personalizados', growth: 6 },
                { theme: 'Automação de Fluxos', growth: 5 },
                { theme: 'Multi-idioma', growth: 3 }
            ]
        };
    } else { // monthly
        mockData = {
            new_themes: ['API Webhook', 'Integração com Teams', 'Voice Biometrics', 'GPT-4 Support', 'Speech Analytics'],
            growing_themes: [
                { theme: 'Mobile App', growth: 32 },
                { theme: 'Relatórios Personalizados', growth: 24 },
                { theme: 'Automação de Fluxos', growth: 18 },
                { theme: 'Multi-idioma', growth: 15 },
                { theme: 'Compliance', growth: 12 }
            ]
        };
    }
    
    renderEmergingThemes(mockData);
}

// API Functions
async function apiGetSentimentTrend(period) {
    try {
        const response = await window.apiRequest('GET', `/api/analytics/voice/sentiment-trend?period=${period}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

async function apiGetFeedbackCategories() {
    try {
        const response = await window.apiRequest('GET', '/api/analytics/voice/feedback-categories');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

async function apiGetPainPoints() {
    try {
        const response = await window.apiRequest('GET', '/api/analytics/voice/pain-points');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

async function apiGetImprovementOpportunities() {
    try {
        const response = await window.apiRequest('GET', '/api/analytics/voice/improvement-opportunities');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

async function apiGetEmergingThemes(period) {
    try {
        const response = await window.apiRequest('GET', `/api/analytics/voice/emerging-themes?period=${period}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// Export functions
window.initVoiceAnalytics = initVoiceAnalytics;