/**
 * Dashboard Component
 * Main dashboard with statistics, recent activities and insights
 */
class DashboardComponent {
  constructor(app) {
    this.app = app;
    this.store = app.store;
    this.apiService = app.apiService;
    this.stats = null;
    this.activities = null;
    this.leads = null;
    this.calls = null;
    this.charts = {};
  }
  
  /**
   * Fetch dashboard data from the API
   */
  async fetchDashboardData() {
    try {
      const data = await this.apiService.get('/dashboard');
      this.stats = data.stats;
      this.activities = data.activities;
      this.leads = data.leads;
      this.calls = data.calls;
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return null;
    }
  }
  
  /**
   * Render the dashboard component
   */
  async render(container) {
    // Show loading state
    container.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    `;
    
    // Fetch dashboard data
    await this.fetchDashboardData();
    
    // Render dashboard
    container.innerHTML = `
      <div class="dashboard-container">
        <!-- Stats Grid -->
        <div class="dashboard-grid">
          <div class="stats-card">
            <div class="stats-icon primary">
              <i data-feather="phone-call"></i>
            </div>
            <div class="stats-content">
              <div class="stats-value">${this.stats?.totalCalls || 0}</div>
              <div class="stats-label">Total Calls</div>
              <div class="stats-trend ${this.stats?.callsTrend > 0 ? 'trend-up' : 'trend-down'}">
                <i data-feather="${this.stats?.callsTrend > 0 ? 'trending-up' : 'trending-down'}"></i>
                <span>${Math.abs(this.stats?.callsTrend || 0)}% from last week</span>
              </div>
            </div>
          </div>
          
          <div class="stats-card">
            <div class="stats-icon secondary">
              <i data-feather="users"></i>
            </div>
            <div class="stats-content">
              <div class="stats-value">${this.stats?.totalLeads || 0}</div>
              <div class="stats-label">Total Leads</div>
              <div class="stats-trend ${this.stats?.leadsTrend > 0 ? 'trend-up' : 'trend-down'}">
                <i data-feather="${this.stats?.leadsTrend > 0 ? 'trending-up' : 'trending-down'}"></i>
                <span>${Math.abs(this.stats?.leadsTrend || 0)}% from last week</span>
              </div>
            </div>
          </div>
          
          <div class="stats-card">
            <div class="stats-icon tertiary">
              <i data-feather="check-circle"></i>
            </div>
            <div class="stats-content">
              <div class="stats-value">${this.stats?.qualifiedLeads || 0}</div>
              <div class="stats-label">Qualified Leads</div>
              <div class="stats-trend ${this.stats?.qualifiedLeadsTrend > 0 ? 'trend-up' : 'trend-down'}">
                <i data-feather="${this.stats?.qualifiedLeadsTrend > 0 ? 'trending-up' : 'trending-down'}"></i>
                <span>${Math.abs(this.stats?.qualifiedLeadsTrend || 0)}% from last week</span>
              </div>
            </div>
          </div>
          
          <div class="stats-card">
            <div class="stats-icon success">
              <i data-feather="dollar-sign"></i>
            </div>
            <div class="stats-content">
              <div class="stats-value">${this.stats?.conversionRate || 0}%</div>
              <div class="stats-label">Conversion Rate</div>
              <div class="stats-trend ${this.stats?.conversionRateTrend > 0 ? 'trend-up' : 'trend-down'}">
                <i data-feather="${this.stats?.conversionRateTrend > 0 ? 'trending-up' : 'trending-down'}"></i>
                <span>${Math.abs(this.stats?.conversionRateTrend || 0)}% from last week</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Charts and Tables -->
        <div class="dashboard-grid">
          <div class="card dashboard-grid-col-2">
            <div class="card-header">
              <h3 class="card-title">Call Volume Trend</h3>
              <div class="card-actions">
                <button class="btn btn-sm btn-outline">
                  <i data-feather="download"></i>
                  Export
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="callVolumeChart" height="250"></canvas>
              </div>
            </div>
          </div>
          
          <div class="card dashboard-grid-col-2">
            <div class="card-header">
              <h3 class="card-title">Lead Sources</h3>
              <div class="card-actions">
                <button class="btn btn-sm btn-outline">
                  <i data-feather="download"></i>
                  Export
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="leadSourcesChart" height="250"></canvas>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dashboard-grid">
          <div class="card dashboard-grid-col-2">
            <div class="card-header">
              <h3 class="card-title">Recent Leads</h3>
              <div class="card-actions">
                <button class="btn btn-sm btn-outline" id="view-all-leads">View All</button>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Lead Score</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.renderLeadsTable()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="card dashboard-grid-col-2">
            <div class="card-header">
              <h3 class="card-title">Recent Activities</h3>
              <div class="card-actions">
                <button class="btn btn-sm btn-outline">View All</button>
              </div>
            </div>
            <div class="card-body">
              <ul class="activity-feed">
                ${this.renderActivityFeed()}
              </ul>
            </div>
          </div>
        </div>
        
        <div class="dashboard-grid">
          <div class="card dashboard-grid-col-2">
            <div class="card-header">
              <h3 class="card-title">Recent Calls</h3>
              <div class="card-actions">
                <button class="btn btn-sm btn-outline">View All</button>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Contact</th>
                      <th>Direction</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Agent</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.renderCallsTable()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="card dashboard-grid-col-2">
            <div class="card-header">
              <h3 class="card-title">Agent Performance</h3>
              <div class="card-actions">
                <button class="btn btn-sm btn-outline">View Details</button>
              </div>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="agentPerformanceChart" height="250"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Initialize feather icons
    feather.replace();
    
    // Initialize charts
    this.initializeCharts();
    
    // Add event listeners
    document.getElementById('view-all-leads')?.addEventListener('click', () => {
      this.app.store.dispatch({ type: 'SET_CURRENT_VIEW', payload: 'leadManagement' });
    });
  }
  
  /**
   * Render leads table
   */
  renderLeadsTable() {
    if (!this.leads || this.leads.length === 0) {
      return `
        <tr>
          <td colspan="6" class="text-center">No leads found</td>
        </tr>
      `;
    }
    
    return this.leads.slice(0, 5).map(lead => `
      <tr>
        <td>${lead.name}</td>
        <td>${lead.company || '-'}</td>
        <td>${lead.source || '-'}</td>
        <td>
          <span class="status-badge ${this.getLeadStatusClass(lead.status)}">
            ${lead.status}
          </span>
        </td>
        <td>${lead.score}</td>
        <td>${this.formatDate(lead.createdAt)}</td>
      </tr>
    `).join('');
  }
  
  /**
   * Render calls table
   */
  renderCallsTable() {
    if (!this.calls || this.calls.length === 0) {
      return `
        <tr>
          <td colspan="6" class="text-center">No calls found</td>
        </tr>
      `;
    }
    
    return this.calls.slice(0, 5).map(call => `
      <tr>
        <td>${call.leadName || call.phoneNumber}</td>
        <td>
          <span class="status-badge ${call.direction === 'inbound' ? 'info' : 'success'}">
            <i data-feather="${call.direction === 'inbound' ? 'phone-incoming' : 'phone-outgoing'}"></i>
            ${call.direction}
          </span>
        </td>
        <td>${this.formatDuration(call.duration)}</td>
        <td>
          <span class="status-badge ${this.getCallStatusClass(call.status)}">
            ${call.status}
          </span>
        </td>
        <td>${call.agentName || '-'}</td>
        <td>${this.formatTime(call.startTime)}</td>
      </tr>
    `).join('');
  }
  
  /**
   * Render activity feed
   */
  renderActivityFeed() {
    if (!this.activities || this.activities.length === 0) {
      return `
        <li class="activity-item">
          <div class="activity-content">
            <div class="activity-title">No recent activities</div>
          </div>
        </li>
      `;
    }
    
    return this.activities.slice(0, 5).map(activity => `
      <li class="activity-item">
        <div class="activity-icon">
          <i data-feather="${this.getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-meta">
            <i data-feather="clock"></i>
            <span>${this.formatTimeAgo(activity.timestamp)}</span>
          </div>
        </div>
      </li>
    `).join('');
  }
  
  /**
   * Initialize charts
   */
  initializeCharts() {
    // Call Volume Chart
    const callVolumeCtx = document.getElementById('callVolumeChart')?.getContext('2d');
    if (callVolumeCtx && this.stats?.callVolumeData) {
      this.charts.callVolume = new Chart(callVolumeCtx, {
        type: 'line',
        data: {
          labels: this.stats.callVolumeData.labels,
          datasets: [
            {
              label: 'Inbound Calls',
              data: this.stats.callVolumeData.inbound,
              borderColor: '#3f51b5',
              backgroundColor: 'rgba(63, 81, 181, 0.1)',
              tension: 0.3,
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: '#3f51b5'
            },
            {
              label: 'Outbound Calls',
              data: this.stats.callVolumeData.outbound,
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
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    }
    
    // Lead Sources Chart
    const leadSourcesCtx = document.getElementById('leadSourcesChart')?.getContext('2d');
    if (leadSourcesCtx && this.stats?.leadSourcesData) {
      this.charts.leadSources = new Chart(leadSourcesCtx, {
        type: 'doughnut',
        data: {
          labels: this.stats.leadSourcesData.labels,
          datasets: [
            {
              data: this.stats.leadSourcesData.values,
              backgroundColor: [
                '#3f51b5',
                '#f50057',
                '#00bcd4',
                '#ff9800',
                '#4caf50',
                '#9c27b0'
              ]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      });
    }
    
    // Agent Performance Chart
    const agentPerformanceCtx = document.getElementById('agentPerformanceChart')?.getContext('2d');
    if (agentPerformanceCtx && this.stats?.agentPerformanceData) {
      this.charts.agentPerformance = new Chart(agentPerformanceCtx, {
        type: 'bar',
        data: {
          labels: this.stats.agentPerformanceData.agents,
          datasets: [
            {
              label: 'Calls Made',
              data: this.stats.agentPerformanceData.calls,
              backgroundColor: '#3f51b5'
            },
            {
              label: 'Leads Generated',
              data: this.stats.agentPerformanceData.leads,
              backgroundColor: '#f50057'
            },
            {
              label: 'Conversions',
              data: this.stats.agentPerformanceData.conversions,
              backgroundColor: '#4caf50'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
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
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    }
  }
  
  /**
   * Get status class for lead status
   */
  getLeadStatusClass(status) {
    switch (status) {
      case 'new':
        return 'info';
      case 'contacted':
        return 'warning';
      case 'qualified':
        return 'success';
      case 'unqualified':
        return 'danger';
      default:
        return 'info';
    }
  }
  
  /**
   * Get status class for call status
   */
  getCallStatusClass(status) {
    switch (status) {
      case 'completed':
        return 'success';
      case 'missed':
        return 'danger';
      case 'in-progress':
        return 'warning';
      case 'ringing':
        return 'info';
      default:
        return 'info';
    }
  }
  
  /**
   * Get icon for activity type
   */
  getActivityIcon(type) {
    switch (type) {
      case 'call':
        return 'phone';
      case 'message':
        return 'message-square';
      case 'lead':
        return 'user-plus';
      case 'note':
        return 'file-text';
      case 'task':
        return 'check-square';
      case 'meeting':
        return 'calendar';
      default:
        return 'activity';
    }
  }
  
  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  /**
   * Format time for display
   */
  formatTime(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  /**
   * Format duration in seconds to mm:ss
   */
  formatDuration(seconds) {
    if (!seconds) return '-';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Format time ago from timestamp
   */
  formatTimeAgo(timestamp) {
    if (!timestamp) return '-';
    
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  }
}
