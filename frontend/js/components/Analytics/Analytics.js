/**
 * Analytics Component
 * Displays reports, charts and analytics data
 */
class AnalyticsComponent {
  constructor(app) {
    this.app = app;
    this.store = app.store;
    this.apiService = app.apiService;
    this.currentReport = 'overview';
    this.timeframe = 'month';
    this.charts = {};
    this.reportData = null;
  }
  
  /**
   * Fetch analytics data from the API
   */
  async fetchAnalyticsData() {
    try {
      const data = await this.apiService.get(`/api/analytics?report=${this.currentReport}&timeframe=${this.timeframe}`);
      this.reportData = data;
      return data;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      return null;
    }
  }
  
  /**
   * Render the analytics component
   */
  async render(container) {
    // Show loading state
    container.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    `;
    
    // Fetch analytics data
    await this.fetchAnalyticsData();
    
    if (!this.reportData) {
      container.innerHTML = `
        <div class="error-state">
          <i data-feather="alert-circle" style="width: 48px; height: 48px; color: var(--danger-color);"></i>
          <h3>Failed to load analytics data</h3>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
          <button class="btn btn-primary retry-btn" id="retry-analytics">Retry</button>
        </div>
      `;
      
      feather.replace();
      
      // Add retry event listener
      document.getElementById('retry-analytics').addEventListener('click', () => {
        this.render(container);
      });
      
      return;
    }
    
    // Render the analytics view
    container.innerHTML = `
      <div class="analytics-container">
        <div class="analytics-header">
          <div class="report-selector">
            <select id="report-type" class="form-select">
              <option value="overview" ${this.currentReport === 'overview' ? 'selected' : ''}>Overview</option>
              <option value="calls" ${this.currentReport === 'calls' ? 'selected' : ''}>Call Metrics</option>
              <option value="leads" ${this.currentReport === 'leads' ? 'selected' : ''}>Lead Performance</option>
              <option value="campaigns" ${this.currentReport === 'campaigns' ? 'selected' : ''}>Campaign Analysis</option>
              <option value="agents" ${this.currentReport === 'agents' ? 'selected' : ''}>Agent Performance</option>
              <option value="conversions" ${this.currentReport === 'conversions' ? 'selected' : ''}>Conversion Analysis</option>
            </select>
          </div>
          
          <div class="timeframe-selector">
            <button class="btn ${this.timeframe === 'week' ? 'btn-primary' : 'btn-outline'}" data-timeframe="week">Week</button>
            <button class="btn ${this.timeframe === 'month' ? 'btn-primary' : 'btn-outline'}" data-timeframe="month">Month</button>
            <button class="btn ${this.timeframe === 'quarter' ? 'btn-primary' : 'btn-outline'}" data-timeframe="quarter">Quarter</button>
            <button class="btn ${this.timeframe === 'year' ? 'btn-primary' : 'btn-outline'}" data-timeframe="year">Year</button>
          </div>
          
          <div class="report-actions">
            <button class="btn btn-outline" id="export-report-btn">
              <i data-feather="download"></i>
              Export Report
            </button>
            
            <button class="btn btn-outline" id="print-report-btn">
              <i data-feather="printer"></i>
              Print
            </button>
          </div>
        </div>
        
        <div class="report-content">
          ${this.renderReportContent()}
        </div>
      </div>
    `;
    
    // Initialize feather icons
    feather.replace();
    
    // Initialize charts
    this.initializeCharts();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Render the report content based on the current report type
   */
  renderReportContent() {
    switch (this.currentReport) {
      case 'overview':
        return this.renderOverviewReport();
      case 'calls':
        return this.renderCallsReport();
      case 'leads':
        return this.renderLeadsReport();
      case 'campaigns':
        return this.renderCampaignsReport();
      case 'agents':
        return this.renderAgentsReport();
      case 'conversions':
        return this.renderConversionsReport();
      default:
        return this.renderOverviewReport();
    }
  }
  
  /**
   * Render overview report
   */
  renderOverviewReport() {
    const data = this.reportData;
    
    return `
      <div class="report-section">
        <h2 class="report-title">Performance Overview</h2>
        <p class="report-description">Summary of key metrics for the selected period</p>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-header">
              <i data-feather="phone-call"></i>
              <span>Total Calls</span>
            </div>
            <div class="metric-value">${data.totalCalls}</div>
            <div class="metric-trend ${data.callsTrend > 0 ? 'trend-up' : 'trend-down'}">
              <i data-feather="${data.callsTrend > 0 ? 'trending-up' : 'trending-down'}"></i>
              <span>${Math.abs(data.callsTrend)}% from previous period</span>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-header">
              <i data-feather="users"></i>
              <span>New Leads</span>
            </div>
            <div class="metric-value">${data.newLeads}</div>
            <div class="metric-trend ${data.leadsTrend > 0 ? 'trend-up' : 'trend-down'}">
              <i data-feather="${data.leadsTrend > 0 ? 'trending-up' : 'trending-down'}"></i>
              <span>${Math.abs(data.leadsTrend)}% from previous period</span>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-header">
              <i data-feather="check-circle"></i>
              <span>Qualified Leads</span>
            </div>
            <div class="metric-value">${data.qualifiedLeads}</div>
            <div class="metric-trend ${data.qualifiedLeadsTrend > 0 ? 'trend-up' : 'trend-down'}">
              <i data-feather="${data.qualifiedLeadsTrend > 0 ? 'trending-up' : 'trending-down'}"></i>
              <span>${Math.abs(data.qualifiedLeadsTrend)}% from previous period</span>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-header">
              <i data-feather="dollar-sign"></i>
              <span>Conversion Rate</span>
            </div>
            <div class="metric-value">${data.conversionRate}%</div>
            <div class="metric-trend ${data.conversionRateTrend > 0 ? 'trend-up' : 'trend-down'}">
              <i data-feather="${data.conversionRateTrend > 0 ? 'trending-up' : 'trending-down'}"></i>
              <span>${Math.abs(data.conversionRateTrend)}% from previous period</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="report-section">
        <h2 class="report-title">Call Volume Trends</h2>
        <div class="chart-container">
          <canvas id="callVolumeChart" height="300"></canvas>
        </div>
      </div>
      
      <div class="report-row">
        <div class="report-section half">
          <h2 class="report-title">Lead Sources</h2>
          <div class="chart-container">
            <canvas id="leadSourcesChart" height="300"></canvas>
          </div>
        </div>
        
        <div class="report-section half">
          <h2 class="report-title">Qualification Rate by Channel</h2>
          <div class="chart-container">
            <canvas id="qualificationRateChart" height="300"></canvas>
          </div>
        </div>
      </div>
      
      <div class="report-section">
        <h2 class="report-title">Top Performing Campaigns</h2>
        <div class="table-responsive">
          <table class="data-table analytics-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Leads</th>
                <th>Calls</th>
                <th>Contacts</th>
                <th>Qualified</th>
                <th>Conversion Rate</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              ${data.topCampaigns.map(campaign => `
                <tr>
                  <td>${campaign.name}</td>
                  <td>${campaign.leads}</td>
                  <td>${campaign.calls}</td>
                  <td>${campaign.contacts}</td>
                  <td>${campaign.qualified}</td>
                  <td>${campaign.conversionRate}%</td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress" style="width: ${campaign.performance}%"></div>
                      <span class="progress-text">${campaign.performance}%</span>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
  
  /**
   * Render calls report
   */
  renderCallsReport() {
    // Implementation for calls report
    return `<div class="placeholder">Call Metrics Report Content</div>`;
  }
  
  /**
   * Render leads report
   */
  renderLeadsReport() {
    // Implementation for leads report
    return `<div class="placeholder">Lead Performance Report Content</div>`;
  }
  
  /**
   * Render campaigns report
   */
  renderCampaignsReport() {
    // Implementation for campaigns report
    return `<div class="placeholder">Campaign Analysis Report Content</div>`;
  }
  
  /**
   * Render agents report
   */
  renderAgentsReport() {
    // Implementation for agents report
    return `<div class="placeholder">Agent Performance Report Content</div>`;
  }
  
  /**
   * Render conversions report
   */
  renderConversionsReport() {
    // Implementation for conversions report
    return `<div class="placeholder">Conversion Analysis Report Content</div>`;
  }
  
  /**
   * Initialize charts
   */
  initializeCharts() {
    if (this.currentReport === 'overview') {
      // Call Volume Chart
      const callVolumeCtx = document.getElementById('callVolumeChart')?.getContext('2d');
      if (callVolumeCtx) {
        this.charts.callVolume = new Chart(callVolumeCtx, {
          type: 'line',
          data: {
            labels: this.reportData.callVolumeChart.labels,
            datasets: [
              {
                label: 'Outbound Calls',
                data: this.reportData.callVolumeChart.outbound,
                borderColor: '#3f51b5',
                backgroundColor: 'rgba(63, 81, 181, 0.1)',
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#3f51b5'
              },
              {
                label: 'Inbound Calls',
                data: this.reportData.callVolumeChart.inbound,
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
      }
      
      // Lead Sources Chart
      const leadSourcesCtx = document.getElementById('leadSourcesChart')?.getContext('2d');
      if (leadSourcesCtx) {
        this.charts.leadSources = new Chart(leadSourcesCtx, {
          type: 'doughnut',
          data: {
            labels: this.reportData.leadSourcesChart.labels,
            datasets: [
              {
                data: this.reportData.leadSourcesChart.data,
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
      
      // Qualification Rate Chart
      const qualificationRateCtx = document.getElementById('qualificationRateChart')?.getContext('2d');
      if (qualificationRateCtx) {
        this.charts.qualificationRate = new Chart(qualificationRateCtx, {
          type: 'bar',
          data: {
            labels: this.reportData.qualificationRateChart.labels,
            datasets: [
              {
                label: 'Qualification Rate (%)',
                data: this.reportData.qualificationRateChart.data,
                backgroundColor: [
                  '#3f51b5',
                  '#f50057',
                  '#00bcd4',
                  '#ff9800'
                ]
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
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
                max: 100,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              }
            }
          }
        });
      }
    }
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Report type selector
    document.getElementById('report-type')?.addEventListener('change', (e) => {
      this.currentReport = e.target.value;
      this.render(document.getElementById('view-container'));
    });
    
    // Timeframe selector
    document.querySelectorAll('[data-timeframe]').forEach(button => {
      button.addEventListener('click', (e) => {
        this.timeframe = e.target.dataset.timeframe;
        this.render(document.getElementById('view-container'));
      });
    });
    
    // Export report button
    document.getElementById('export-report-btn')?.addEventListener('click', () => {
      this.exportReport();
    });
    
    // Print report button
    document.getElementById('print-report-btn')?.addEventListener('click', () => {
      window.print();
    });
  }
  
  /**
   * Export report to PDF or CSV
   */
  async exportReport() {
    try {
      const response = await this.apiService.get(`/api/analytics/export?report=${this.currentReport}&timeframe=${this.timeframe}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${this.currentReport}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  }
}