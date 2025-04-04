/**
 * Analytics Component
 * This component renders the analytics page
 */

/**
 * Initialize the analytics page
 */
function initAnalytics() {
    renderAnalytics();
    setupAnalyticsEvents();
    loadAnalyticsData();
}

/**
 * Render the analytics HTML
 */
function renderAnalytics() {
    const analyticsPage = document.getElementById('analytics-page');
    
    analyticsPage.innerHTML = `
        <h1 class="page-title">Análise de Desempenho</h1>
        
        <div class="row mb-4">
            <div class="col-md-9">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">Desempenho de Prospecção</h5>
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="chart-week-btn">Semana</button>
                            <button type="button" class="btn btn-sm btn-outline-primary active" id="chart-month-btn">Mês</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="chart-quarter-btn">Trimestre</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="chart-year-btn">Ano</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <canvas id="performance-chart" height="280"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Métricas Chave</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-4">
                            <h6 class="text-muted">Taxa de Conversão</h6>
                            <h2 id="conversion-rate">18.3%</h2>
                            <div class="progress" style="height: 6px;">
                                <div class="progress-bar bg-success" style="width: 18%"></div>
                            </div>
                        </div>
                        <div class="mb-4">
                            <h6 class="text-muted">Média de Chamadas/Dia</h6>
                            <h2 id="daily-calls">24</h2>
                            <div class="progress" style="height: 6px;">
                                <div class="progress-bar bg-primary" style="width: 60%"></div>
                            </div>
                        </div>
                        <div>
                            <h6 class="text-muted">Duração Média</h6>
                            <h2 id="avg-duration">4:12</h2>
                            <div class="progress" style="height: 6px;">
                                <div class="progress-bar bg-info" style="width: 70%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Distribuição de Status de Leads</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="lead-status-chart" height="250"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Origem de Leads</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="lead-source-chart" height="250"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">Desempenho de Agentes</h5>
                        <select class="form-select form-select-sm w-auto" id="agent-period-select">
                            <option value="week">Esta Semana</option>
                            <option value="month" selected>Este Mês</option>
                            <option value="quarter">Este Trimestre</option>
                        </select>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Agente</th>
                                        <th>Chamadas</th>
                                        <th>Leads Qualificados</th>
                                        <th>Taxa de Conversão</th>
                                        <th>Tempo Médio de Chamada</th>
                                        <th>Pontuação</th>
                                    </tr>
                                </thead>
                                <tbody id="agent-performance-table">
                                    <tr>
                                        <td>Carregando dados...</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Set up analytics event listeners
 */
function setupAnalyticsEvents() {
    // Chart period buttons
    document.getElementById('chart-week-btn').addEventListener('click', function() {
        setActiveButton(this);
        updatePerformanceChart('week');
    });
    
    document.getElementById('chart-month-btn').addEventListener('click', function() {
        setActiveButton(this);
        updatePerformanceChart('month');
    });
    
    document.getElementById('chart-quarter-btn').addEventListener('click', function() {
        setActiveButton(this);
        updatePerformanceChart('quarter');
    });
    
    document.getElementById('chart-year-btn').addEventListener('click', function() {
        setActiveButton(this);
        updatePerformanceChart('year');
    });
    
    // Agent period select
    document.getElementById('agent-period-select').addEventListener('change', function() {
        updateAgentTable(this.value);
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
 * Load analytics data
 */
function loadAnalyticsData() {
    // Initialize charts
    initPerformanceChart();
    initLeadStatusChart();
    initLeadSourceChart();
    
    // Load agent performance data
    updateAgentTable('month');
}

/**
 * Initialize the performance chart
 */
function initPerformanceChart() {
    const ctx = document.getElementById('performance-chart').getContext('2d');
    
    // Mock data for the monthly view
    const data = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [
            {
                label: 'Chamadas',
                data: [420, 460, 520, 480, 510, 550, 590, 620, 580, 610, 650, 690],
                backgroundColor: 'rgba(74, 111, 233, 0.1)',
                borderColor: 'rgba(74, 111, 233, 1)',
                borderWidth: 2,
                tension: 0.4
            },
            {
                label: 'Leads Qualificados',
                data: [150, 165, 180, 170, 190, 210, 230, 250, 240, 260, 280, 300],
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 2,
                tension: 0.4
            },
            {
                label: 'Conversões',
                data: [50, 55, 65, 60, 70, 75, 85, 90, 85, 95, 100, 110],
                backgroundColor: 'rgba(255, 112, 67, 0.1)',
                borderColor: 'rgba(255, 112, 67, 1)',
                borderWidth: 2,
                tension: 0.4
            }
        ]
    };
    
    window.performanceChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

/**
 * Update the performance chart with new data
 * @param {string} period - Data period (week, month, quarter, year)
 */
function updatePerformanceChart(period) {
    let labels, callsData, leadsData, conversionsData;
    
    switch (period) {
        case 'week':
            labels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
            callsData = [85, 95, 90, 105, 110, 65, 30];
            leadsData = [35, 40, 38, 45, 48, 25, 12];
            conversionsData = [12, 14, 13, 15, 16, 8, 4];
            break;
            
        case 'quarter':
            labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5', 'Semana 6', 
                    'Semana 7', 'Semana 8', 'Semana 9', 'Semana 10', 'Semana 11', 'Semana 12'];
            callsData = [480, 510, 520, 490, 530, 550, 570, 590, 580, 610, 630, 650];
            leadsData = [170, 180, 190, 175, 200, 210, 220, 230, 225, 240, 250, 260];
            conversionsData = [60, 65, 70, 62, 72, 75, 80, 82, 80, 85, 90, 95];
            break;
            
        case 'year':
            labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            callsData = [420, 460, 520, 480, 510, 550, 590, 620, 580, 610, 650, 690];
            leadsData = [150, 165, 180, 170, 190, 210, 230, 250, 240, 260, 280, 300];
            conversionsData = [50, 55, 65, 60, 70, 75, 85, 90, 85, 95, 100, 110];
            break;
            
        default: // month
            labels = ['1', '5', '10', '15', '20', '25', '30'];
            callsData = [15, 25, 22, 28, 20, 24, 18];
            leadsData = [6, 10, 8, 12, 7, 9, 7];
            conversionsData = [2, 4, 3, 5, 2, 3, 2];
    }
    
    window.performanceChart.data.labels = labels;
    window.performanceChart.data.datasets[0].data = callsData;
    window.performanceChart.data.datasets[1].data = leadsData;
    window.performanceChart.data.datasets[2].data = conversionsData;
    
    window.performanceChart.update();
}

/**
 * Initialize the lead status chart
 */
function initLeadStatusChart() {
    const ctx = document.getElementById('lead-status-chart').getContext('2d');
    
    const data = {
        labels: ['Novos', 'Contatados', 'Qualificados', 'Oportunidade', 'Clientes', 'Perdidos'],
        datasets: [{
            data: [30, 25, 20, 15, 10, 15],
            backgroundColor: [
                'rgba(74, 111, 233, 0.7)',
                'rgba(255, 193, 7, 0.7)',
                'rgba(40, 167, 69, 0.7)',
                'rgba(23, 162, 184, 0.7)',
                'rgba(32, 201, 151, 0.7)',
                'rgba(220, 53, 69, 0.7)'
            ],
            borderWidth: 1
        }]
    };
    
    window.leadStatusChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

/**
 * Initialize the lead source chart
 */
function initLeadSourceChart() {
    const ctx = document.getElementById('lead-source-chart').getContext('2d');
    
    const data = {
        labels: ['Website', 'Indicação', 'Redes Sociais', 'Email Marketing', 'Eventos', 'Outros'],
        datasets: [{
            data: [35, 20, 15, 12, 10, 8],
            backgroundColor: [
                'rgba(74, 111, 233, 0.7)',
                'rgba(255, 112, 67, 0.7)',
                'rgba(255, 193, 7, 0.7)',
                'rgba(23, 162, 184, 0.7)',
                'rgba(40, 167, 69, 0.7)',
                'rgba(108, 117, 125, 0.7)'
            ],
            borderWidth: 1
        }]
    };
    
    window.leadSourceChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

/**
 * Update the agent performance table
 * @param {string} period - Data period (week, month, quarter)
 */
function updateAgentTable(period) {
    const table = document.getElementById('agent-performance-table');
    
    // Mock data
    const agentData = [
        {
            name: 'Ana Silva',
            calls: period === 'week' ? 85 : (period === 'month' ? 320 : 950),
            qualified: period === 'week' ? 32 : (period === 'month' ? 125 : 370),
            conversion: period === 'week' ? 14.1 : (period === 'month' ? 15.6 : 15.8),
            avgTime: period === 'week' ? '4:05' : (period === 'month' ? '4:12' : '4:08'),
            score: period === 'week' ? 92 : (period === 'month' ? 94 : 93)
        },
        {
            name: 'Carlos Oliveira',
            calls: period === 'week' ? 78 : (period === 'month' ? 295 : 880),
            qualified: period === 'week' ? 29 : (period === 'month' ? 110 : 330),
            conversion: period === 'week' ? 12.8 : (period === 'month' ? 13.5 : 13.6),
            avgTime: period === 'week' ? '3:50' : (period === 'month' ? '3:55' : '3:52'),
            score: period === 'week' ? 86 : (period === 'month' ? 87 : 88)
        },
        {
            name: 'Juliana Santos',
            calls: period === 'week' ? 92 : (period === 'month' ? 350 : 1050),
            qualified: period === 'week' ? 38 : (period === 'month' ? 145 : 430),
            conversion: period === 'week' ? 16.3 : (period === 'month' ? 17.1 : 16.9),
            avgTime: period === 'week' ? '4:20' : (period === 'month' ? '4:25' : '4:22'),
            score: period === 'week' ? 96 : (period === 'month' ? 97 : 96)
        },
        {
            name: 'Pedro Almeida',
            calls: period === 'week' ? 70 : (period === 'month' ? 265 : 790),
            qualified: period === 'week' ? 24 : (period === 'month' ? 90 : 270),
            conversion: period === 'week' ? 11.4 : (period === 'month' ? 11.7 : 11.6),
            avgTime: period === 'week' ? '3:40' : (period === 'month' ? '3:45' : '3:42'),
            score: period === 'week' ? 82 : (period === 'month' ? 83 : 82)
        },
        {
            name: 'Fernanda Costa',
            calls: period === 'week' ? 88 : (period === 'month' ? 335 : 1000),
            qualified: period === 'week' ? 35 : (period === 'month' ? 135 : 400),
            conversion: period === 'week' ? 15.9 : (period === 'month' ? 16.4 : 16.2),
            avgTime: period === 'week' ? '4:15' : (period === 'month' ? '4:18' : '4:16'),
            score: period === 'week' ? 94 : (period === 'month' ? 95 : 94)
        }
    ];
    
    // Generate table HTML
    const tableHTML = agentData.map(agent => `
        <tr>
            <td>${agent.name}</td>
            <td>${agent.calls}</td>
            <td>${agent.qualified}</td>
            <td>${agent.conversion.toFixed(1)}%</td>
            <td>${agent.avgTime}</td>
            <td>
                <div class="progress" style="height: 6px;">
                    <div class="progress-bar bg-success" style="width: ${agent.score}%"></div>
                </div>
                <small class="text-muted">${agent.score}/100</small>
            </td>
        </tr>
    `).join('');
    
    table.innerHTML = tableHTML;
}
