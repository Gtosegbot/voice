/**
 * Dashboard Component
 * Main dashboard view with statistics and overview of system activity
 */
class DashboardComponent {
  constructor(app) {
    this.app = app;
    this.store = app.store;
    this.apiService = app.apiService;
    this.dashboardData = null;
  }
  
  /**
   * Fetch dashboard data from the API
   */
  async fetchDashboardData() {
    try {
      this.dashboardData = await this.apiService.get('/api/dashboard');
      return this.dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return null;
    }
  }
  
  /**
   * Render the dashboard view
   */
  async render(container) {
    // Show loading state
    container.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    `;
    
    // Fetch data
    await this.fetchDashboardData();
    
    if (!this.dashboardData) {
      container.innerHTML = `
        <div class="error-state">
          <i data-feather="alert-circle" style="width: 48px; height: 48px; color: var(--danger-color);"></i>
          <h3>Failed to load dashboard data</h3>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
          <button class="btn btn-primary retry-btn" id="retry-dashboard">Retry</button>
        </div>
      `;
      
      feather.replace();
      
      // Add retry event listener
      document.getElementById('retry-dashboard').addEventListener('click', () => {
        this.render(container);
      });
      
      return;
    }
    
    const data = this.dashboardData;
    
    // Render the dashboard
    container.innerHTML = `
      <div class="dashboard-container">
        <!-- Stats Overview -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Performance Overview</h2>
            <div class="period-selector">
              <select id="stats-period">
                <option value="today">Today</option>
                <option value="week" selected>This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-header">
                <i data-feather="phone-call"></i>
                <span>Outbound Calls</span>
              </div>
              <div class="stat-value">${data.stats.outboundCalls}</div>
              <div class="stat-trend ${data.trends.outboundCalls > 0 ? 'trend-up' : 'trend-down'}">
                <i data-feather="${data.trends.outboundCalls > 0 ? 'trending-up' : 'trending-down'}"></i>
                <span>${Math.abs(data.trends.outboundCalls)}% from previous period</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-header">
                <i data-feather="phone-incoming"></i>
                <span>Inbound Calls</span>
              </div>
              <div class="stat-value">${data.stats.inboundCalls}</div>
              <div class="stat-trend ${data.trends.inboundCalls > 0 ? 'trend-up' : 'trend-down'}">
                <i data-feather="${data.trends.inboundCalls > 0 ? 'trending-up' : 'trending-down'}"></i>
                <span>${Math.abs(data.trends.inboundCalls)}% from previous period</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-header">
                <i data-feather="check-circle"></i>
                <span>Qualified Leads</span>
              </div>
              <div class="stat-value">${data.stats.qualifiedLeads}</div>
              <div class="stat-trend ${data.trends.qualifiedLeads > 0 ? 'trend-up' : 'trend-down'}">
                <i data-feather="${data.trends.qualifiedLeads > 0 ? 'trending-up' : 'trending-down'}"></i>
                <span>${Math.abs(data.trends.qualifiedLeads)}% from previous period</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-header">
                <i data-feather="calendar"></i>
                <span>Appointments Set</span>
              </div>
              <div class="stat-value">${data.stats.appointmentsSet}</div>
              <div class="stat-trend ${data.trends.appointmentsSet > 0 ? 'trend-up' : 'trend-down'}">
                <i data-feather="${data.trends.appointmentsSet > 0 ? 'trending-up' : 'trending-down'}"></i>
                <span>${Math.abs(data.trends.appointmentsSet)}% from previous period</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Activities and Call Chart -->
        <div class="dashboard-two-columns">
          <div class="card" style="flex: 2;">
            <div class="card-header">
              <h2 class="card-title">Call Volume Trend</h2>
              <div class="chart-controls">
                <select id="chart-type">
                  <option value="daily">Daily</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
            </div>
            
            <div class="chart-container">
              <canvas id="callVolumeChart" height="250"></canvas>
            </div>
          </div>
          
          <div class="card" style="flex: 1;">
            <div class="card-header">
              <h2 class="card-title">Recent Activity</h2>
              <a href="#" class="view-all" data-nav="leadManagement">View All</a>
            </div>
            
            <div class="activity-list">
              ${this.renderActivityList(data.recentActivities)}
            </div>
          </div>
        </div>
        
        <!-- Agent Performance -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Agent Performance</h2>
            <button class="btn btn-sm btn-outline" id="exportAgentData">
              <i data-feather="download"></i> Export
            </button>
          </div>
          
          <div class="table-responsive">
            <table class="table agent-performance-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Calls Handled</th>
                  <th>Talk Time</th>
                  <th>Avg. Call Duration</th>
                  <th>Lead Conversion</th>
                  <th>Customer Satisfaction</th>
                </tr>
              </thead>
              <tbody>
                ${this.renderAgentPerformanceRows(data.agentPerformance)}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Active Campaigns -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Active Campaigns</h2>
            <button class="btn btn-primary btn-sm" id="newCampaignBtn">
              <i data-feather="plus"></i> New Campaign
            </button>
          </div>
          
          <div class="campaign-list">
            ${this.renderCampaignList(data.activeCampaigns)}
          </div>
        </div>
      </div>
    `;
    
    // Initialize chart after rendering
    this.initializeCallVolumeChart(data.callVolume);
    
    // Initialize feather icons
    feather.replace();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Render the activity list HTML
   */
  renderActivityList(activities) {
    if (!activities || activities.length === 0) {
      return `<div class="empty-state">No recent activities found</div>`;
    }
    
    return activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon ${this.getActivityIconClass(activity.type)}">
          <i data-feather="${this.getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-description">${activity.description}</div>
          <div class="activity-time">${this.formatTimeAgo(activity.timestamp)}</div>
        </div>
      </div>
    `).join('');
  }
  
  /**
   * Render agent performance table rows
   */
  renderAgentPerformanceRows(agents) {
    if (!agents || agents.length === 0) {
      return `
        <tr>
          <td colspan="6" class="empty-state">No agent data available</td>
        </tr>
      `;
    }
    
    return agents.map(agent => `
      <tr>
        <td>
          <div class="agent-info">
            <div class="agent-avatar">${agent.name.charAt(0)}</div>
            <div class="agent-name">${agent.name}</div>
          </div>
        </td>
        <td>${agent.callsHandled}</td>
        <td>${this.formatMinutes(agent.talkTime)}</td>
        <td>${this.formatMinutes(agent.avgCallDuration)}</td>
        <td>
          <div class="progress-bar">
            <div class="progress" style="width: ${agent.leadConversion}%"></div>
            <span class="progress-text">${agent.leadConversion}%</span>
          </div>
        </td>
        <td>
          <div class="satisfaction-score" title="Customer Satisfaction">
            ${this.renderSatisfactionStars(agent.satisfaction)}
          </div>
        </td>
      </tr>
    `).join('');
  }
  
  /**
   * Render campaign list
   */
  renderCampaignList(campaigns) {
    if (!campaigns || campaigns.length === 0) {
      return `<div class="empty-state">No active campaigns found</div>`;
    }
    
    return campaigns.map(campaign => `
      <div class="campaign-card">
        <div class="campaign-header">
          <h3 class="campaign-name">${campaign.name}</h3>
          <div class="campaign-status ${campaign.status.toLowerCase()}">${campaign.status}</div>
        </div>
        
        <div class="campaign-stats">
          <div class="campaign-stat">
            <div class="stat-label">Target Leads</div>
            <div class="stat-value">${campaign.targetLeads}</div>
          </div>
          
          <div class="campaign-stat">
            <div class="stat-label">Contacted</div>
            <div class="stat-value">${campaign.contacted}</div>
          </div>
          
          <div class="campaign-stat">
            <div class="stat-label">Qualified</div>
            <div class="stat-value">${campaign.qualified}</div>
          </div>
          
          <div class="campaign-stat">
            <div class="stat-label">Conversion</div>
            <div class="stat-value">${(campaign.qualified / campaign.contacted * 100 || 0).toFixed(1)}%</div>
          </div>
        </div>
        
        <div class="campaign-progress">
          <div class="progress-label">Progress (${Math.floor(campaign.contacted / campaign.targetLeads * 100 || 0)}%)</div>
          <div class="progress-bar">
            <div class="progress" style="width: ${campaign.contacted / campaign.targetLeads * 100 || 0}%"></div>
          </div>
        </div>
        
        <div class="campaign-actions">
          <button class="btn btn-sm btn-outline campaign-action" data-campaign-id="${campaign.id}" data-action="edit">
            <i data-feather="edit"></i> Edit
          </button>
          <button class="btn btn-sm btn-outline campaign-action" data-campaign-id="${campaign.id}" data-action="pause">
            ${campaign.status === 'Active' ? '<i data-feather="pause"></i> Pause' : '<i data-feather="play"></i> Resume'}
          </button>
          <button class="btn btn-sm btn-outline campaign-action" data-campaign-id="${campaign.id}" data-action="view">
            <i data-feather="eye"></i> View
          </button>
        </div>
      </div>
    `).join('');
  }
  
  /**
   * Initialize the call volume chart
   */
  initializeCallVolumeChart(data) {
    const ctx = document.getElementById('callVolumeChart').getContext('2d');
    
    // Create the chart
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Outbound Calls',
            data: data.outbound,
            borderColor: '#3f51b5',
            backgroundColor: 'rgba(63, 81, 181, 0.1)',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#3f51b5'
          },
          {
            label: 'Inbound Calls',
            data: data.inbound,
            borderColor: '#f50057',
            backgroundColor: 'rgba(245, 0, 87, 0.1)',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#f50057'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false
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
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    });
    
    // Store the chart instance
    this.callVolumeChart = chart;
    
    // Add chart type change event listener
    document.getElementById('chart-type').addEventListener('change', (e) => {
      const chartType = e.target.value;
      this.updateChartData(chartType);
    });
  }
  
  /**
   * Update chart data based on selected type
   */
  async updateChartData(chartType) {
    try {
      const chartData = await this.apiService.get(`/api/dashboard/call-volume?type=${chartType}`);
      
      this.callVolumeChart.data.labels = chartData.labels;
      this.callVolumeChart.data.datasets[0].data = chartData.outbound;
      this.callVolumeChart.data.datasets[1].data = chartData.inbound;
      
      this.callVolumeChart.update();
    } catch (error) {
      console.error('Error updating chart data:', error);
    }
  }
  
  /**
   * Set up event listeners for dashboard elements
   */
  setupEventListeners() {
    // Stats period selector
    document.getElementById('stats-period').addEventListener('change', async (e) => {
      const period = e.target.value;
      try {
        const newData = await this.apiService.get(`/api/dashboard/stats?period=${period}`);
        // Update stats without full page reload
        this.updateStatsCards(newData.stats, newData.trends);
      } catch (error) {
        console.error('Error updating stats:', error);
      }
    });
    
    // Export agent data button
    document.getElementById('exportAgentData').addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const response = await this.apiService.get('/api/dashboard/agent-performance/export', {
          responseType: 'blob'
        });
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'agent_performance.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error('Error exporting data:', error);
      }
    });
    
    // New campaign button
    document.getElementById('newCampaignBtn').addEventListener('click', (e) => {
      e.preventDefault();
      // Navigate to campaign creation view
      this.app.store.dispatch({
        type: 'SET_CURRENT_VIEW',
        payload: 'settings'
      });
    });
    
    // Campaign action buttons
    document.querySelectorAll('.campaign-action').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const campaignId = button.dataset.campaignId;
        const action = button.dataset.action;
        
        try {
          switch (action) {
            case 'edit':
              // Navigate to campaign edit view
              this.app.store.dispatch({
                type: 'SET_EDIT_CAMPAIGN',
                payload: campaignId
              });
              this.app.store.dispatch({
                type: 'SET_CURRENT_VIEW',
                payload: 'settings'
              });
              break;
              
            case 'pause':
            case 'resume':
              // Toggle campaign status
              const newStatus = action === 'pause' ? 'paused' : 'active';
              await this.apiService.put(`/api/campaigns/${campaignId}/status`, {
                status: newStatus
              });
              
              // Refresh dashboard data
              await this.fetchDashboardData();
              const container = document.querySelector('.dashboard-container');
              if (container) {
                this.render(container.parentNode);
              }
              break;
              
            case 'view':
              // Navigate to campaign detail view
              this.app.store.dispatch({
                type: 'SET_VIEW_CAMPAIGN',
                payload: campaignId
              });
              this.app.store.dispatch({
                type: 'SET_CURRENT_VIEW',
                payload: 'analytics'
              });
              break;
          }
        } catch (error) {
          console.error(`Error performing campaign action (${action}):`, error);
        }
      });
    });
  }
  
  /**
   * Update stats cards with new data
   */
  updateStatsCards(stats, trends) {
    // Get all stat cards
    const outboundElement = document.querySelector('.stat-card:nth-child(1) .stat-value');
    const outboundTrendElement = document.querySelector('.stat-card:nth-child(1) .stat-trend');
    
    const inboundElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
    const inboundTrendElement = document.querySelector('.stat-card:nth-child(2) .stat-trend');
    
    const qualifiedElement = document.querySelector('.stat-card:nth-child(3) .stat-value');
    const qualifiedTrendElement = document.querySelector('.stat-card:nth-child(3) .stat-trend');
    
    const appointmentsElement = document.querySelector('.stat-card:nth-child(4) .stat-value');
    const appointmentsTrendElement = document.querySelector('.stat-card:nth-child(4) .stat-trend');
    
    // Update values
    if (outboundElement) outboundElement.textContent = stats.outboundCalls;
    if (inboundElement) inboundElement.textContent = stats.inboundCalls;
    if (qualifiedElement) qualifiedElement.textContent = stats.qualifiedLeads;
    if (appointmentsElement) appointmentsElement.textContent = stats.appointmentsSet;
    
    // Update trend indicators
    if (outboundTrendElement) {
      outboundTrendElement.className = `stat-trend ${trends.outboundCalls > 0 ? 'trend-up' : 'trend-down'}`;
      outboundTrendElement.innerHTML = `
        <i data-feather="${trends.outboundCalls > 0 ? 'trending-up' : 'trending-down'}"></i>
        <span>${Math.abs(trends.outboundCalls)}% from previous period</span>
      `;
    }
    
    if (inboundTrendElement) {
      inboundTrendElement.className = `stat-trend ${trends.inboundCalls > 0 ? 'trend-up' : 'trend-down'}`;
      inboundTrendElement.innerHTML = `
        <i data-feather="${trends.inboundCalls > 0 ? 'trending-up' : 'trending-down'}"></i>
        <span>${Math.abs(trends.inboundCalls)}% from previous period</span>
      `;
    }
    
    if (qualifiedTrendElement) {
      qualifiedTrendElement.className = `stat-trend ${trends.qualifiedLeads > 0 ? 'trend-up' : 'trend-down'}`;
      qualifiedTrendElement.innerHTML = `
        <i data-feather="${trends.qualifiedLeads > 0 ? 'trending-up' : 'trending-down'}"></i>
        <span>${Math.abs(trends.qualifiedLeads)}% from previous period</span>
      `;
    }
    
    if (appointmentsTrendElement) {
      appointmentsTrendElement.className = `stat-trend ${trends.appointmentsSet > 0 ? 'trend-up' : 'trend-down'}`;
      appointmentsTrendElement.innerHTML = `
        <i data-feather="${trends.appointmentsSet > 0 ? 'trending-up' : 'trending-down'}"></i>
        <span>${Math.abs(trends.appointmentsSet)}% from previous period</span>
      `;
    }
    
    // Refresh feather icons
    feather.replace();
  }
  
  /**
   * Get the appropriate icon for an activity type
   */
  getActivityIcon(type) {
    const icons = {
      'call': 'phone',
      'message': 'message-square',
      'lead': 'user-plus',
      'appointment': 'calendar',
      'campaign': 'send',
      'system': 'settings'
    };
    
    return icons[type] || 'activity';
  }
  
  /**
   * Get the CSS class for activity icon background
   */
  getActivityIconClass(type) {
    const classes = {
      'call': 'icon-blue',
      'message': 'icon-green',
      'lead': 'icon-purple',
      'appointment': 'icon-orange',
      'campaign': 'icon-red',
      'system': 'icon-gray'
    };
    
    return classes[type] || 'icon-blue';
  }
  
  /**
   * Format minutes into hours and minutes
   */
  formatMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  }
  
  /**
   * Render star rating for customer satisfaction
   */
  renderSatisfactionStars(satisfaction) {
    const fullStars = Math.floor(satisfaction);
    const halfStar = satisfaction % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars += '<i data-feather="star" class="star-filled"></i>';
    }
    
    // Half star
    if (halfStar) {
      stars += '<i data-feather="star" class="star-half"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i data-feather="star" class="star-empty"></i>';
    }
    
    return stars;
  }
  
  /**
   * Format time into relative time (e.g. "2 hours ago")
   */
  formatTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) {
      return 'just now';
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}
