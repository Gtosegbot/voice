/**
 * Dashboard Component
 * This component renders the main dashboard with statistics and charts
 */

/**
 * Initialize the dashboard
 */
function initDashboard() {
    renderDashboard();
    setupDashboardEvents();
    loadDashboardData();
}

/**
 * Render the dashboard HTML
 */
function renderDashboard() {
    const dashboardPage = document.getElementById('dashboard-page');
    
    dashboardPage.innerHTML = `
        <h1 class="page-title">Dashboard</h1>
        
        <div class="dashboard-stats">
            <div class="stat-card">
                <div class="stat-title">Total Leads</div>
                <div class="stat-value" id="total-leads-stat">0</div>
                <div class="stat-change positive" id="leads-change">+0% Últimos 30 dias</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Conversões</div>
                <div class="stat-value" id="conversions-stat">0%</div>
                <div class="stat-change positive" id="conversion-change">+0% Últimos 30 dias</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Chamadas Realizadas</div>
                <div class="stat-value" id="calls-stat">0</div>
                <div class="stat-change positive" id="calls-change">+0% Últimos 30 dias</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Tempo Médio de Chamada</div>
                <div class="stat-value" id="avg-call-time-stat">0:00</div>
                <div class="stat-change positive" id="call-time-change">+0% Últimos 30 dias</div>
            </div>
        </div>
        
        <div class="dashboard-charts">
            <div class="chart-container">
                <div class="chart-header">
                    <div class="chart-title">Desempenho de Leads</div>
                    <div class="chart-actions">
                        <button class="btn btn-outline-secondary btn-sm" id="leads-chart-weekly">Semana</button>
                        <button class="btn btn-outline-primary btn-sm active" id="leads-chart-monthly">Mês</button>
                        <button class="btn btn-outline-secondary btn-sm" id="leads-chart-yearly">Ano</button>
                    </div>
                </div>
                <canvas id="leads-chart" height="250"></canvas>
            </div>
            <div class="chart-container">
                <div class="chart-header">
                    <div class="chart-title">Distribuição de Leads</div>
                </div>
                <canvas id="leads-distribution-chart" height="250"></canvas>
            </div>
        </div>
        
        <div class="dashboard-recent">
            <div class="chart-container">
                <div class="chart-header">
                    <div class="chart-title">Atividades Recentes</div>
                    <button class="btn btn-link" id="view-all-activities">Ver Todos</button>
                </div>
                <div id="recent-activities">
                    <div class="recent-item">
                        <div class="recent-item-icon">
                            <i class="fas fa-phone"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">Chamada para João Silva</div>
                            <div class="recent-item-subtitle">Duração: 5:23 | Resultado: Qualificado</div>
                        </div>
                        <div class="recent-item-time">Hoje, 14:32</div>
                    </div>
                    <div class="recent-item">
                        <div class="recent-item-icon">
                            <i class="fas fa-comment"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">Mensagem enviada para Maria Oliveira</div>
                            <div class="recent-item-subtitle">Canal: WhatsApp | Status: Entregue</div>
                        </div>
                        <div class="recent-item-time">Hoje, 11:15</div>
                    </div>
                    <div class="recent-item">
                        <div class="recent-item-icon">
                            <i class="fas fa-user-plus"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">Novo lead adicionado</div>
                            <div class="recent-item-subtitle">Carlos Pereira | Empresa ABC Ltda</div>
                        </div>
                        <div class="recent-item-time">Ontem, 16:47</div>
                    </div>
                    <div class="recent-item">
                        <div class="recent-item-icon">
                            <i class="fas fa-phone-slash"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">Chamada perdida de Ana Santos</div>
                            <div class="recent-item-subtitle">Duração: 0:12 | Tentativa: 2</div>
                        </div>
                        <div class="recent-item-time">Ontem, 10:23</div>
                    </div>
                </div>
            </div>
            <div class="chart-container">
                <div class="chart-header">
                    <div class="chart-title">Leads Recentes</div>
                    <button class="btn btn-link" id="view-all-leads">Ver Todos</button>
                </div>
                <div id="recent-leads">
                    <div class="recent-item">
                        <div class="recent-item-icon">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">João Silva</div>
                            <div class="recent-item-subtitle">Empresa XYZ | Pontuação: 85</div>
                        </div>
                        <div class="recent-item-time">Hoje, 14:32</div>
                    </div>
                    <div class="recent-item">
                        <div class="recent-item-icon">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">Maria Oliveira</div>
                            <div class="recent-item-subtitle">Empresa ABC | Pontuação: 72</div>
                        </div>
                        <div class="recent-item-time">Hoje, 11:15</div>
                    </div>
                    <div class="recent-item">
                        <div class="recent-item-icon">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">Carlos Pereira</div>
                            <div class="recent-item-subtitle">Empresa ABC | Pontuação: 68</div>
                        </div>
                        <div class="recent-item-time">Ontem, 16:47</div>
                    </div>
                    <div class="recent-item">
                        <div class="recent-item-icon">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">Ana Santos</div>
                            <div class="recent-item-subtitle">Empresa DEF | Pontuação: 91</div>
                        </div>
                        <div class="recent-item-time">Ontem, 10:23</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Set up dashboard event listeners
 */
function setupDashboardEvents() {
    // View all activities button
    const viewAllActivitiesBtn = document.getElementById('view-all-activities');
    if (viewAllActivitiesBtn) {
        viewAllActivitiesBtn.addEventListener('click', () => {
            store.navigateTo('conversations');
            updateUI();
        });
    }
    
    // View all leads button
    const viewAllLeadsBtn = document.getElementById('view-all-leads');
    if (viewAllLeadsBtn) {
        viewAllLeadsBtn.addEventListener('click', () => {
            store.navigateTo('leads');
            updateUI();
        });
    }
    
    // Chart period toggles
    const chartPeriodButtons = document.querySelectorAll('.chart-actions button');
    chartPeriodButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            chartPeriodButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            // Refresh chart data based on selected period
            if (e.target.id === 'leads-chart-weekly') {
                updateLeadsChart('weekly');
            } else if (e.target.id === 'leads-chart-monthly') {
                updateLeadsChart('monthly');
            } else if (e.target.id === 'leads-chart-yearly') {
                updateLeadsChart('yearly');
            }
        });
    });
}

/**
 * Load dashboard data from API
 */
function loadDashboardData() {
    // For demonstration, we're using mock data
    // In a real application, you would fetch this data from your API
    
    // Update stat cards
    document.getElementById('total-leads-stat').textContent = '248';
    document.getElementById('leads-change').textContent = '+12% Últimos 30 dias';
    
    document.getElementById('conversions-stat').textContent = '18%';
    document.getElementById('conversion-change').textContent = '+3% Últimos 30 dias';
    
    document.getElementById('calls-stat').textContent = '156';
    document.getElementById('calls-change').textContent = '+8% Últimos 30 dias';
    
    document.getElementById('avg-call-time-stat').textContent = '4:12';
    document.getElementById('call-time-change').textContent = '+5% Últimos 30 dias';
    
    // Initialize charts
    initLeadsChart();
    initLeadsDistributionChart();
}

/**
 * Initialize the leads chart
 */
function initLeadsChart() {
    const ctx = document.getElementById('leads-chart').getContext('2d');
    
    // Mock data - in a real app you would get this from your API
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Novos Leads',
                data: [18, 25, 30, 22, 17, 28, 32, 35, 30, 28, 32, 38],
                backgroundColor: 'rgba(74, 111, 233, 0.2)',
                borderColor: 'rgba(74, 111, 233, 1)',
                borderWidth: 2,
                tension: 0.4
            },
            {
                label: 'Leads Qualificados',
                data: [12, 15, 18, 14, 10, 16, 20, 22, 18, 16, 20, 25],
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 2,
                tension: 0.4
            }
        ]
    };
    
    window.leadsChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Update the leads chart with new data
 * @param {string} period - Data period (weekly, monthly, yearly)
 */
function updateLeadsChart(period) {
    // Mock data for different periods
    // In a real app, you would fetch this from your API
    
    let data;
    
    if (period === 'weekly') {
        data = {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            datasets: [
                {
                    label: 'Novos Leads',
                    data: [8, 10, 12, 9, 11, 5, 3],
                    backgroundColor: 'rgba(74, 111, 233, 0.2)',
                    borderColor: 'rgba(74, 111, 233, 1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Leads Qualificados',
                    data: [5, 7, 8, 6, 7, 3, 1],
                    backgroundColor: 'rgba(40, 167, 69, 0.2)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        };
    } else if (period === 'yearly') {
        data = {
            labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
            datasets: [
                {
                    label: 'Novos Leads',
                    data: [180, 220, 250, 300, 350, 248],
                    backgroundColor: 'rgba(74, 111, 233, 0.2)',
                    borderColor: 'rgba(74, 111, 233, 1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Leads Qualificados',
                    data: [90, 110, 130, 160, 190, 156],
                    backgroundColor: 'rgba(40, 167, 69, 0.2)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        };
    } else {
        // Monthly (default)
        data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Novos Leads',
                    data: [18, 25, 30, 22, 17, 28, 32, 35, 30, 28, 32, 38],
                    backgroundColor: 'rgba(74, 111, 233, 0.2)',
                    borderColor: 'rgba(74, 111, 233, 1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Leads Qualificados',
                    data: [12, 15, 18, 14, 10, 16, 20, 22, 18, 16, 20, 25],
                    backgroundColor: 'rgba(40, 167, 69, 0.2)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        };
    }
    
    window.leadsChart.data = data;
    window.leadsChart.update();
}

/**
 * Initialize the leads distribution chart
 */
function initLeadsDistributionChart() {
    const ctx = document.getElementById('leads-distribution-chart').getContext('2d');
    
    // Mock data
    const data = {
        labels: ['Novos', 'Em Contato', 'Qualificados', 'Oportunidade', 'Convertidos', 'Perdidos'],
        datasets: [{
            data: [30, 25, 20, 15, 8, 12],
            backgroundColor: [
                'rgba(74, 111, 233, 0.7)',
                'rgba(255, 193, 7, 0.7)',
                'rgba(40, 167, 69, 0.7)',
                'rgba(23, 162, 184, 0.7)',
                'rgba(220, 53, 69, 0.7)',
                'rgba(108, 117, 125, 0.7)'
            ],
            borderWidth: 1
        }]
    };
    
    window.distributionChart = new Chart(ctx, {
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
