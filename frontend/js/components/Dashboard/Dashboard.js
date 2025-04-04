/**
 * Dashboard component for VoiceAI platform
 */

class Dashboard {
    constructor() {
        this.element = document.getElementById('dashboard-page');
        this.charts = {};
    }
    
    /**
     * Initialize dashboard
     */
    async init() {
        if (!this.element) return;
        
        try {
            // Render dashboard
            this.render();
            
            // Initialize charts after DOM is updated
            setTimeout(() => {
                this.initCharts();
            }, 0);
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    }
    
    /**
     * Render dashboard
     */
    render() {
        this.element.innerHTML = `
            <div class="dashboard-container">
                <h1 class="page-title">Dashboard</h1>
                
                <div class="stats-cards">
                    <div class="stat-card">
                        <div class="stat-card-title">Total Leads</div>
                        <div class="stat-card-value">258</div>
                        <div class="stat-card-change positive">
                            <i class="fas fa-arrow-up"></i> 15% vs last month
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-title">Qualified Leads</div>
                        <div class="stat-card-value">86</div>
                        <div class="stat-card-change positive">
                            <i class="fas fa-arrow-up"></i> 8% vs last month
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-title">Conversion Rate</div>
                        <div class="stat-card-value">12.5%</div>
                        <div class="stat-card-change positive">
                            <i class="fas fa-arrow-up"></i> 2.3% vs last month
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-title">Avg. Call Duration</div>
                        <div class="stat-card-value">4:32</div>
                        <div class="stat-card-change negative">
                            <i class="fas fa-arrow-down"></i> 0:18 vs last month
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-charts">
                    <div class="chart-container">
                        <div class="chart-title">Lead Activity</div>
                        <canvas id="lead-activity-chart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-title">Lead Sources</div>
                        <canvas id="lead-sources-chart"></canvas>
                    </div>
                </div>
                
                <div class="recent-activity">
                    <h2>Recent Activity</h2>
                    <div class="activity-list">
                        <div class="activity-item">
                            <div class="activity-icon">
                                <i class="fas fa-phone"></i>
                            </div>
                            <div class="activity-content">
                                <div class="activity-title">Call with João Silva</div>
                                <div class="activity-description">5 minutes ago</div>
                            </div>
                        </div>
                        
                        <div class="activity-item">
                            <div class="activity-icon">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <div class="activity-content">
                                <div class="activity-title">New lead added: Maria Oliveira</div>
                                <div class="activity-description">20 minutes ago</div>
                            </div>
                        </div>
                        
                        <div class="activity-item">
                            <div class="activity-icon">
                                <i class="fas fa-comments"></i>
                            </div>
                            <div class="activity-content">
                                <div class="activity-title">WhatsApp conversation with Carlos Mendes</div>
                                <div class="activity-description">1 hour ago</div>
                            </div>
                        </div>
                        
                        <div class="activity-item">
                            <div class="activity-icon">
                                <i class="fas fa-user-check"></i>
                            </div>
                            <div class="activity-content">
                                <div class="activity-title">Lead qualified: Ana Santos</div>
                                <div class="activity-description">3 hours ago</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Initialize charts
     */
    initCharts() {
        // Lead activity chart
        const leadActivityCtx = document.getElementById('lead-activity-chart');
        if (leadActivityCtx) {
            this.charts.leadActivity = new Chart(leadActivityCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'New Leads',
                            data: [65, 59, 80, 81, 56, 55],
                            borderColor: '#4a6fe9',
                            backgroundColor: 'rgba(74, 111, 233, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Qualified Leads',
                            data: [28, 48, 40, 19, 36, 27],
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
        
        // Lead sources chart
        const leadSourcesCtx = document.getElementById('lead-sources-chart');
        if (leadSourcesCtx) {
            this.charts.leadSources = new Chart(leadSourcesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Website', 'Referral', 'Email', 'Social Media', 'Other'],
                    datasets: [
                        {
                            data: [35, 20, 15, 20, 10],
                            backgroundColor: [
                                '#4a6fe9',
                                '#28a745',
                                '#ffc107',
                                '#17a2b8',
                                '#6c757d'
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
     * Update dashboard data
     */
    async updateData() {
        try {
            // Fetch dashboard data from API
            // const data = await ApiService.getDashboardData();
            
            // Update charts
            // this.updateCharts(data);
        } catch (error) {
            console.error('Error updating dashboard data:', error);
        }
    }
    
    /**
     * Update charts with new data
     */
    updateCharts(data) {
        // Update lead activity chart
        if (this.charts.leadActivity) {
            this.charts.leadActivity.data.datasets[0].data = data.leadActivity.newLeads;
            this.charts.leadActivity.data.datasets[1].data = data.leadActivity.qualifiedLeads;
            this.charts.leadActivity.update();
        }
        
        // Update lead sources chart
        if (this.charts.leadSources) {
            this.charts.leadSources.data.datasets[0].data = data.leadSources.values;
            this.charts.leadSources.update();
        }
    }
}

// Export the dashboard component
window.Dashboard = new Dashboard();
