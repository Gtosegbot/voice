/**
 * Analytics component for VoiceAI platform
 */

class Analytics {
    constructor() {
        this.element = document.getElementById('analytics-page');
        this.charts = {};
        this.dateRange = 'month'; // 'week', 'month', 'quarter', 'year'
    }
    
    /**
     * Initialize analytics
     */
    async init() {
        if (!this.element) return;
        
        try {
            // Render analytics
            this.render();
            
            // Initialize charts after DOM is updated
            setTimeout(() => {
                this.initCharts();
            }, 0);
            
            // Set up event handlers
            this.setupEventHandlers();
        } catch (error) {
            console.error('Error initializing analytics:', error);
        }
    }
    
    /**
     * Render analytics
     */
    render() {
        this.element.innerHTML = `
            <div class="analytics-container">
                <h1 class="page-title">Análise de Desempenho</h1>
                
                <div class="analytics-filters">
                    <div class="date-range-filter">
                        <label for="date-range">Período:</label>
                        <select id="date-range" class="form-select">
                            <option value="week">Última Semana</option>
                            <option value="month" selected>Último Mês</option>
                            <option value="quarter">Último Trimestre</option>
                            <option value="year">Último Ano</option>
                        </select>
                    </div>
                    
                    <div class="agent-filter">
                        <label for="agent-select">Agente:</label>
                        <select id="agent-select" class="form-select">
                            <option value="all">Todos os Agentes</option>
                            <option value="1">João Silva</option>
                            <option value="2">Maria Oliveira</option>
                            <option value="3">Carlos Santos</option>
                        </select>
                    </div>
                    
                    <div class="campaign-filter">
                        <label for="campaign-select">Campanha:</label>
                        <select id="campaign-select" class="form-select">
                            <option value="all">Todas as Campanhas</option>
                            <option value="1">Prospecção Q2</option>
                            <option value="2">Lançamento Produto X</option>
                            <option value="3">Reconquista de Clientes</option>
                        </select>
                    </div>
                </div>
                
                <div class="stats-cards">
                    <div class="stat-card">
                        <div class="stat-card-title">Total de Chamadas</div>
                        <div class="stat-card-value">427</div>
                        <div class="stat-card-change positive">
                            <i class="fas fa-arrow-up"></i> 8% vs período anterior
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-title">Duração Média</div>
                        <div class="stat-card-value">4:32</div>
                        <div class="stat-card-change positive">
                            <i class="fas fa-arrow-up"></i> 12% vs período anterior
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-title">Taxa de Conversão</div>
                        <div class="stat-card-value">18.5%</div>
                        <div class="stat-card-change positive">
                            <i class="fas fa-arrow-up"></i> 3.2% vs período anterior
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-title">Taxa de Contato</div>
                        <div class="stat-card-value">64%</div>
                        <div class="stat-card-change negative">
                            <i class="fas fa-arrow-down"></i> 2% vs período anterior
                        </div>
                    </div>
                </div>
                
                <div class="analytics-charts">
                    <div class="chart-container">
                        <div class="chart-title">Desempenho de Chamadas</div>
                        <canvas id="calls-performance-chart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-title">Leads por Status</div>
                        <canvas id="leads-status-chart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-title">Desempenho por Agente</div>
                        <canvas id="agent-performance-chart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-title">Distribuição de Canais</div>
                        <canvas id="channel-distribution-chart"></canvas>
                    </div>
                </div>
                
                <div class="analytics-insights">
                    <h2>Insights de IA</h2>
                    
                    <div class="insights-container">
                        <div class="insight-card">
                            <div class="insight-icon">
                                <i class="fas fa-lightbulb"></i>
                            </div>
                            <div class="insight-content">
                                <h3>Melhor Horário para Contato</h3>
                                <p>Chamadas realizadas entre 14h e 16h têm uma taxa de contato 32% maior que em outros horários.</p>
                            </div>
                        </div>
                        
                        <div class="insight-card">
                            <div class="insight-icon">
                                <i class="fas fa-comment-dots"></i>
                            </div>
                            <div class="insight-content">
                                <h3>Frases de Maior Sucesso</h3>
                                <p>Apresentações que incluem "benefícios específicos" têm uma taxa de conversão 27% maior.</p>
                            </div>
                        </div>
                        
                        <div class="insight-card">
                            <div class="insight-icon">
                                <i class="fas fa-user-check"></i>
                            </div>
                            <div class="insight-content">
                                <h3>Perfil de Lead Ideal</h3>
                                <p>Leads do setor de tecnologia com mais de 50 funcionários têm uma probabilidade 3x maior de conversão.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Date range filter
        const dateRange = document.getElementById('date-range');
        if (dateRange) {
            dateRange.addEventListener('change', () => {
                this.dateRange = dateRange.value;
                this.updateData();
            });
        }
        
        // Agent filter
        const agentSelect = document.getElementById('agent-select');
        if (agentSelect) {
            agentSelect.addEventListener('change', () => {
                this.updateData();
            });
        }
        
        // Campaign filter
        const campaignSelect = document.getElementById('campaign-select');
        if (campaignSelect) {
            campaignSelect.addEventListener('change', () => {
                this.updateData();
            });
        }
    }
    
    /**
     * Initialize charts
     */
    initCharts() {
        // Calls performance chart
        const callsPerformanceCtx = document.getElementById('calls-performance-chart');
        if (callsPerformanceCtx) {
            this.charts.callsPerformance = new Chart(callsPerformanceCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Total de Chamadas',
                            data: [65, 72, 78, 74, 82, 88],
                            borderColor: '#4a6fe9',
                            backgroundColor: 'rgba(74, 111, 233, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Chamadas Atendidas',
                            data: [42, 48, 53, 48, 56, 59],
                            borderColor: '#28a745',
                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        // Leads status chart
        const leadsStatusCtx = document.getElementById('leads-status-chart');
        if (leadsStatusCtx) {
            this.charts.leadsStatus = new Chart(leadsStatusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Novos', 'Contatados', 'Qualificados', 'Não Qualificados'],
                    datasets: [
                        {
                            data: [35, 40, 15, 10],
                            backgroundColor: [
                                '#4a6fe9',
                                '#ffc107',
                                '#28a745',
                                '#dc3545'
                            ]
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
        }
        
        // Agent performance chart
        const agentPerformanceCtx = document.getElementById('agent-performance-chart');
        if (agentPerformanceCtx) {
            this.charts.agentPerformance = new Chart(agentPerformanceCtx, {
                type: 'bar',
                data: {
                    labels: ['João Silva', 'Maria Oliveira', 'Carlos Santos'],
                    datasets: [
                        {
                            label: 'Chamadas Realizadas',
                            data: [150, 120, 80],
                            backgroundColor: '#4a6fe9'
                        },
                        {
                            label: 'Leads Qualificados',
                            data: [45, 30, 25],
                            backgroundColor: '#28a745'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        // Channel distribution chart
        const channelDistributionCtx = document.getElementById('channel-distribution-chart');
        if (channelDistributionCtx) {
            this.charts.channelDistribution = new Chart(channelDistributionCtx, {
                type: 'pie',
                data: {
                    labels: ['Voz', 'WhatsApp', 'SMS', 'Email'],
                    datasets: [
                        {
                            data: [50, 30, 15, 5],
                            backgroundColor: [
                                '#4a6fe9',
                                '#25D366',
                                '#ffc107',
                                '#17a2b8'
                            ]
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
        }
    }
    
    /**
     * Update data based on filters
     */
    async updateData() {
        try {
            // Get filter values
            const agentId = document.getElementById('agent-select').value;
            const campaignId = document.getElementById('campaign-select').value;
            
            // In a real application, you would fetch data from the API based on these filters
            // const data = await ApiService.getAnalyticsData(this.dateRange, agentId, campaignId);
            
            // For now, just update the charts with mock data
            this.updateCharts();
        } catch (error) {
            console.error('Error updating analytics data:', error);
        }
    }
    
    /**
     * Update charts with new data
     */
    updateCharts() {
        // In a real application, you would update the charts with real data
        // For now, let's just update with random data
        
        // Calls performance chart
        if (this.charts.callsPerformance) {
            // Generate data based on date range
            let labels = [];
            let totalCalls = [];
            let answeredCalls = [];
            
            switch (this.dateRange) {
                case 'week':
                    labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
                    totalCalls = [15, 18, 20, 22, 19, 8, 5];
                    answeredCalls = [10, 12, 15, 14, 13, 5, 3];
                    break;
                case 'month':
                    labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
                    totalCalls = [65, 72, 78, 82];
                    answeredCalls = [42, 48, 53, 56];
                    break;
                case 'quarter':
                    labels = ['Jan', 'Fev', 'Mar'];
                    totalCalls = [180, 210, 195];
                    answeredCalls = [125, 140, 130];
                    break;
                case 'year':
                    labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                    totalCalls = [65, 72, 78, 74, 82, 88, 90, 85, 92, 95, 88, 93];
                    answeredCalls = [42, 48, 53, 48, 56, 59, 62, 58, 63, 64, 60, 65];
                    break;
            }
            
            this.charts.callsPerformance.data.labels = labels;
            this.charts.callsPerformance.data.datasets[0].data = totalCalls;
            this.charts.callsPerformance.data.datasets[1].data = answeredCalls;
            this.charts.callsPerformance.update();
        }
    }
}

// Export the analytics component
window.Analytics = new Analytics();
