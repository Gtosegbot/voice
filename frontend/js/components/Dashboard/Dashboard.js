/**
 * Dashboard Component
 * Este componente renderiza o dashboard principal com estatísticas e gráficos
 */

/**
 * Inicializa o dashboard
 */
function initDashboard() {
    renderDashboard();
    setupDashboardEvents();
    loadDashboardData();
}

/**
 * Renderiza o HTML do dashboard
 */
function renderDashboard() {
    const dashboardPage = document.getElementById('dashboard-page');
    if (!dashboardPage) {
        console.error('Elemento dashboard-page não encontrado');
        return;
    }
    
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
                        <button class="btn btn-outline-secondary btn-sm" data-action="change-period" data-period="weekly" id="leads-chart-weekly">Semana</button>
                        <button class="btn btn-outline-primary btn-sm active" data-action="change-period" data-period="monthly" id="leads-chart-monthly">Mês</button>
                        <button class="btn btn-outline-secondary btn-sm" data-action="change-period" data-period="yearly" id="leads-chart-yearly">Ano</button>
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
                    <button class="btn btn-link" data-action="view-all-activities" id="view-all-activities">Ver Todos</button>
                </div>
                <div id="recent-activities">
                    <div class="recent-item" data-id="activity-1">
                        <div class="recent-item-icon">
                            <i class="fas fa-phone"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">Chamada para João Silva</div>
                            <div class="recent-item-subtitle">Duração: 5:23 | Resultado: Qualificado</div>
                        </div>
                        <div class="recent-item-time">Hoje, 14:32</div>
                    </div>
                    <div class="recent-item" data-id="activity-2">
                        <div class="recent-item-icon">
                            <i class="fas fa-comment"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">Mensagem enviada para Maria Oliveira</div>
                            <div class="recent-item-subtitle">Canal: WhatsApp | Status: Entregue</div>
                        </div>
                        <div class="recent-item-time">Hoje, 11:15</div>
                    </div>
                    <div class="recent-item" data-id="activity-3">
                        <div class="recent-item-icon">
                            <i class="fas fa-user-plus"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">Novo lead adicionado</div>
                            <div class="recent-item-subtitle">Carlos Pereira | Empresa ABC Ltda</div>
                        </div>
                        <div class="recent-item-time">Ontem, 16:47</div>
                    </div>
                    <div class="recent-item" data-id="activity-4">
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
                    <button class="btn btn-link" data-action="view-all-leads" id="view-all-leads">Ver Todos</button>
                </div>
                <div id="recent-leads">
                    <div class="recent-item" data-id="lead-1" data-lead-id="101">
                        <div class="recent-item-icon">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">João Silva</div>
                            <div class="recent-item-subtitle">Empresa XYZ | Pontuação: 85</div>
                        </div>
                        <div class="recent-item-actions">
                            <button class="btn btn-sm btn-outline-primary" data-action="call-lead" data-lead-id="101">
                                <i class="fas fa-phone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="recent-item" data-id="lead-2" data-lead-id="102">
                        <div class="recent-item-icon">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">Maria Oliveira</div>
                            <div class="recent-item-subtitle">Empresa ABC | Pontuação: 72</div>
                        </div>
                        <div class="recent-item-actions">
                            <button class="btn btn-sm btn-outline-primary" data-action="call-lead" data-lead-id="102">
                                <i class="fas fa-phone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="recent-item" data-id="lead-3" data-lead-id="103">
                        <div class="recent-item-icon">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">Carlos Pereira</div>
                            <div class="recent-item-subtitle">Empresa ABC | Pontuação: 68</div>
                        </div>
                        <div class="recent-item-actions">
                            <button class="btn btn-sm btn-outline-primary" data-action="call-lead" data-lead-id="103">
                                <i class="fas fa-phone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="recent-item" data-id="lead-4" data-lead-id="104">
                        <div class="recent-item-icon">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="recent-item-content">
                            <div class="recent-item-title">Ana Santos</div>
                            <div class="recent-item-subtitle">Empresa DEF | Pontuação: 91</div>
                        </div>
                        <div class="recent-item-actions">
                            <button class="btn btn-sm btn-outline-primary" data-action="call-lead" data-lead-id="104">
                                <i class="fas fa-phone"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Configura os event listeners do dashboard
 */
function setupDashboardEvents() {
    // Usar delegação de eventos para lidar com todos os cliques no dashboard
    const dashboardPage = document.getElementById('dashboard-page');
    if (!dashboardPage) return;
    
    dashboardPage.addEventListener('click', function(e) {
        // Checar botões com data-action
        if (e.target.hasAttribute('data-action') || e.target.closest('[data-action]')) {
            const actionElement = e.target.hasAttribute('data-action') ? e.target : e.target.closest('[data-action]');
            const action = actionElement.getAttribute('data-action');
            
            handleDashboardAction(action, actionElement);
        }
        
        // Checar itens recentes clicáveis
        if (e.target.closest('.recent-item')) {
            const item = e.target.closest('.recent-item');
            const id = item.getAttribute('data-id');
            
            // Não abrir detalhes se clicou em um botão dentro do item
            if (!e.target.closest('button')) {
                console.log(`Abrindo detalhes do item: ${id}`);
                
                if (id.startsWith('activity')) {
                    showActivityDetails(id);
                } else if (id.startsWith('lead')) {
                    showLeadDetails(item.getAttribute('data-lead-id'));
                }
            }
        }
    });
}

/**
 * Manipula ações do dashboard
 * @param {string} action - A ação a ser executada
 * @param {HTMLElement} element - O elemento que acionou a ação
 */
function handleDashboardAction(action, element) {
    console.log(`Ação do dashboard: ${action}`);
    
    switch (action) {
        case 'view-all-activities':
            navigateToSection('conversations');
            break;
            
        case 'view-all-leads':
            navigateToSection('leads');
            break;
            
        case 'change-period':
            const period = element.getAttribute('data-period');
            updateChartPeriod(period);
            break;
            
        case 'call-lead':
            const leadId = element.getAttribute('data-lead-id');
            startCallWithLead(leadId);
            break;
            
        default:
            console.log(`Ação não reconhecida: ${action}`);
    }
}

/**
 * Navega para outra seção do aplicativo
 * @param {string} section - Nome da seção
 */
function navigateToSection(section) {
    console.log(`Navegando para: ${section}`);
    
    // Usar a API de navegação do aplicativo se disponível
    if (typeof store !== 'undefined' && store.navigateTo) {
        store.navigateTo(section);
        if (typeof updateUI === 'function') {
            updateUI();
        }
    } else {
        // Fallback simples
        const sectionElement = document.getElementById(`${section}-content`);
        if (sectionElement) {
            document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
            sectionElement.classList.add('active');
            
            // Atualizar menu lateral
            document.querySelectorAll('.sidebar-nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-page') === section) {
                    item.classList.add('active');
                }
            });
        }
    }
}

/**
 * Atualiza o período dos gráficos
 * @param {string} period - Período (weekly, monthly, yearly)
 */
function updateChartPeriod(period) {
    console.log(`Atualizando período do gráfico para: ${period}`);
    
    // Atualizar UI dos botões
    const periodButtons = document.querySelectorAll('.chart-actions button');
    periodButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-period') === period) {
            btn.classList.add('active');
        }
    });
    
    // Atualizar dados do gráfico
    updateLeadsChart(period);
}

/**
 * Inicia uma chamada com um lead
 * @param {string} leadId - ID do lead
 */
function startCallWithLead(leadId) {
    console.log(`Iniciando chamada para lead ID: ${leadId}`);
    
    // Mostrar feedback ao usuário
    if (typeof showToast === 'function') {
        showToast('info', 'Iniciando chamada...');
    } else {
        alert('Iniciando chamada...');
    }
    
    // Em um cenário real, aqui você redirecionaria para a interface de chamada
    // com o ID do lead pré-configurado
    setTimeout(() => {
        window.location.href = `/voz/?lead=${leadId}`;
    }, 1000);
}

/**
 * Mostra detalhes de uma atividade
 * @param {string} activityId - ID da atividade
 */
function showActivityDetails(activityId) {
    console.log(`Mostrando detalhes da atividade ID: ${activityId}`);
    
    // Simulação - em um app real, isso abriria um modal ou navegaria para uma página de detalhes
    if (typeof showToast === 'function') {
        showToast('info', `Visualizando detalhes da atividade`);
    } else {
        alert(`Visualizando detalhes da atividade`);
    }
}

/**
 * Mostra detalhes de um lead
 * @param {string} leadId - ID do lead
 */
function showLeadDetails(leadId) {
    console.log(`Mostrando detalhes do lead ID: ${leadId}`);
    
    // Simulação - em um app real, isso abriria um modal ou navegaria para uma página de detalhes
    if (typeof showToast === 'function') {
        showToast('info', `Visualizando perfil do lead`);
    } else {
        alert(`Visualizando perfil do lead`);
    }
}

/**
 * Carrega dados do dashboard da API
 */
function loadDashboardData() {
    console.log('Carregando dados do dashboard...');
    
    // Tentar usar API real se disponível
    if (typeof api !== 'undefined' && api.getDashboardStats) {
        try {
            api.getDashboardStats()
                .then(data => {
                    updateDashboardStats(data);
                })
                .catch(error => {
                    console.error('Erro ao carregar dados do dashboard:', error);
                    loadMockDashboardData(); // Fallback para dados mock
                });
        } catch (error) {
            console.error('Erro ao chamar API:', error);
            loadMockDashboardData(); // Fallback para dados mock
        }
    } else {
        // Sem API disponível, usar dados mock para demonstração
        loadMockDashboardData();
    }
}

/**
 * Carrega dados mock para o dashboard
 */
function loadMockDashboardData() {
    console.log('Carregando dados mock do dashboard');
    
    // Atualizar cartões de estatísticas
    updateDashboardStats({
        totalLeads: 248,
        leadsChange: 12,
        conversionRate: 18,
        conversionChange: 3,
        totalCalls: 156,
        callsChange: 8,
        avgCallTime: '4:12',
        callTimeChange: 5
    });
    
    // Inicializar gráficos com dados mock
    initLeadsChart();
    initLeadsDistributionChart();
}

/**
 * Atualiza estatísticas no dashboard
 * @param {Object} stats - Objeto com estatísticas
 */
function updateDashboardStats(stats) {
    // Atualizar valores nos elementos HTML
    if (document.getElementById('total-leads-stat')) {
        document.getElementById('total-leads-stat').textContent = stats.totalLeads;
        document.getElementById('leads-change').textContent = `+${stats.leadsChange}% Últimos 30 dias`;
        
        // Ajustar classe conforme valor
        if (stats.leadsChange > 0) {
            document.getElementById('leads-change').className = 'stat-change positive';
        } else if (stats.leadsChange < 0) {
            document.getElementById('leads-change').className = 'stat-change negative';
        } else {
            document.getElementById('leads-change').className = 'stat-change neutral';
        }
    }
    
    if (document.getElementById('conversions-stat')) {
        document.getElementById('conversions-stat').textContent = `${stats.conversionRate}%`;
        document.getElementById('conversion-change').textContent = `+${stats.conversionChange}% Últimos 30 dias`;
        
        // Ajustar classe conforme valor
        if (stats.conversionChange > 0) {
            document.getElementById('conversion-change').className = 'stat-change positive';
        } else if (stats.conversionChange < 0) {
            document.getElementById('conversion-change').className = 'stat-change negative';
        } else {
            document.getElementById('conversion-change').className = 'stat-change neutral';
        }
    }
    
    if (document.getElementById('calls-stat')) {
        document.getElementById('calls-stat').textContent = stats.totalCalls;
        document.getElementById('calls-change').textContent = `+${stats.callsChange}% Últimos 30 dias`;
        
        // Ajustar classe conforme valor
        if (stats.callsChange > 0) {
            document.getElementById('calls-change').className = 'stat-change positive';
        } else if (stats.callsChange < 0) {
            document.getElementById('calls-change').className = 'stat-change negative';
        } else {
            document.getElementById('calls-change').className = 'stat-change neutral';
        }
    }
    
    if (document.getElementById('avg-call-time-stat')) {
        document.getElementById('avg-call-time-stat').textContent = stats.avgCallTime;
        document.getElementById('call-time-change').textContent = `+${stats.callTimeChange}% Últimos 30 dias`;
        
        // Ajustar classe conforme valor
        if (stats.callTimeChange > 0) {
            document.getElementById('call-time-change').className = 'stat-change positive';
        } else if (stats.callTimeChange < 0) {
            document.getElementById('call-time-change').className = 'stat-change negative';
        } else {
            document.getElementById('call-time-change').className = 'stat-change neutral';
        }
    }
}

/**
 * Inicializa o gráfico de leads
 */
function initLeadsChart() {
    const ctx = document.getElementById('leads-chart');
    if (!ctx) {
        console.error('Elemento leads-chart não encontrado');
        return;
    }
    
    try {
        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            console.error('Chart.js não está disponível');
            return;
        }
        
        // Verificar se já existe um gráfico neste canvas
        if (window.leadsChart instanceof Chart) {
            window.leadsChart.destroy();
        }
        
        // Dados para o gráfico
        const data = {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
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
        
        // Criar o gráfico
        window.leadsChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 10
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grace: '5%',
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    } catch (error) {
        console.error('Erro ao inicializar gráfico de leads:', error);
    }
}

/**
 * Atualiza o gráfico de leads com novos dados baseado no período
 * @param {string} period - Período (weekly, monthly, yearly)
 */
function updateLeadsChart(period) {
    // Verificar se o gráfico existe
    if (!window.leadsChart) {
        console.error('Gráfico de leads não está inicializado');
        return;
    }
    
    // Dados para diferentes períodos
    let labels, newLeadsData, qualifiedLeadsData;
    
    if (period === 'weekly') {
        labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        newLeadsData = [8, 10, 12, 9, 11, 5, 3];
        qualifiedLeadsData = [5, 7, 8, 6, 7, 3, 1];
    } else if (period === 'yearly') {
        labels = ['2019', '2020', '2021', '2022', '2023', '2024'];
        newLeadsData = [180, 220, 250, 300, 350, 248];
        qualifiedLeadsData = [90, 110, 130, 160, 190, 156];
    } else {
        // Monthly (default)
        labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        newLeadsData = [18, 25, 30, 22, 17, 28, 32, 35, 30, 28, 32, 38];
        qualifiedLeadsData = [12, 15, 18, 14, 10, 16, 20, 22, 18, 16, 20, 25];
    }
    
    // Atualizar dados do gráfico
    window.leadsChart.data.labels = labels;
    window.leadsChart.data.datasets[0].data = newLeadsData;
    window.leadsChart.data.datasets[1].data = qualifiedLeadsData;
    
    // Atualizar o gráfico
    window.leadsChart.update();
}

/**
 * Inicializa o gráfico de distribuição de leads
 */
function initLeadsDistributionChart() {
    const ctx = document.getElementById('leads-distribution-chart');
    if (!ctx) {
        console.error('Elemento leads-distribution-chart não encontrado');
        return;
    }
    
    try {
        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            console.error('Chart.js não está disponível');
            return;
        }
        
        // Verificar se já existe um gráfico neste canvas
        if (window.distributionChart instanceof Chart) {
            window.distributionChart.destroy();
        }
        
        // Dados para o gráfico
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
                borderColor: [
                    'rgba(74, 111, 233, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(40, 167, 69, 1)',
                    'rgba(23, 162, 184, 1)',
                    'rgba(220, 53, 69, 1)',
                    'rgba(108, 117, 125, 1)'
                ],
                borderWidth: 1
            }]
        };
        
        // Criar o gráfico
        window.distributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    } catch (error) {
        console.error('Erro ao inicializar gráfico de distribuição de leads:', error);
    }
}

// Se este arquivo for carregado diretamente (não como módulo),
// iniciar o dashboard automaticamente
if (typeof module === 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        // Verificar se estamos na página do dashboard antes de inicializar
        if (document.getElementById('dashboard-page')) {
            initDashboard();
        }
    });
}

// Exportar funções (para uso como módulo ES ou CommonJS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initDashboard,
        updateDashboardStats,
        updateLeadsChart
    };
} else if (typeof window !== 'undefined') {
    // Anexar ao objeto global para uso direto no navegador
    window.dashboard = {
        init: initDashboard,
        updateStats: updateDashboardStats,
        updateChart: updateLeadsChart
    };
}
