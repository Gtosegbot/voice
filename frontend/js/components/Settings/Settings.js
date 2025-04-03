/**
 * Settings Component
 * Manages user, system and integration settings
 */
class SettingsComponent {
  constructor(app) {
    this.app = app;
    this.store = app.store;
    this.apiService = app.apiService;
    this.currentSection = 'profile';
    this.settings = null;
    this.isLoading = true;
    this.isSaving = false;
    this.saveSuccess = false;
    this.saveError = null;
  }
  
  /**
   * Fetch settings from the API
   */
  async fetchSettings() {
    try {
      this.isLoading = true;
      const data = await this.apiService.get('/api/settings');
      this.settings = data;
      this.isLoading = false;
      return data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      this.isLoading = false;
      return null;
    }
  }
  
  /**
   * Render the settings component
   */
  async render(container) {
    // Show loading state
    container.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading settings...</p>
      </div>
    `;
    
    // Fetch settings
    await this.fetchSettings();
    
    if (!this.settings) {
      container.innerHTML = `
        <div class="error-state">
          <i data-feather="alert-circle" style="width: 48px; height: 48px; color: var(--danger-color);"></i>
          <h3>Failed to load settings</h3>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
          <button class="btn btn-primary retry-btn" id="retry-settings">Retry</button>
        </div>
      `;
      
      feather.replace();
      
      // Add retry event listener
      document.getElementById('retry-settings').addEventListener('click', () => {
        this.render(container);
      });
      
      return;
    }
    
    // Render the settings
    container.innerHTML = `
      <div class="settings-container">
        <div class="settings-sidebar">
          <div class="settings-nav">
            <div class="section-header">Account</div>
            <ul class="nav-items">
              <li class="nav-item ${this.currentSection === 'profile' ? 'active' : ''}" data-section="profile">
                <i data-feather="user"></i>
                <span>Profile</span>
              </li>
              <li class="nav-item ${this.currentSection === 'security' ? 'active' : ''}" data-section="security">
                <i data-feather="shield"></i>
                <span>Security</span>
              </li>
              <li class="nav-item ${this.currentSection === 'preferences' ? 'active' : ''}" data-section="preferences">
                <i data-feather="sliders"></i>
                <span>Preferences</span>
              </li>
              <li class="nav-item ${this.currentSection === 'notifications' ? 'active' : ''}" data-section="notifications">
                <i data-feather="bell"></i>
                <span>Notifications</span>
              </li>
            </ul>
            
            <div class="section-header">System</div>
            <ul class="nav-items">
              <li class="nav-item ${this.currentSection === 'general' ? 'active' : ''}" data-section="general">
                <i data-feather="settings"></i>
                <span>General</span>
              </li>
              <li class="nav-item ${this.currentSection === 'users' ? 'active' : ''}" data-section="users">
                <i data-feather="users"></i>
                <span>Users & Teams</span>
              </li>
              <li class="nav-item ${this.currentSection === 'roles' ? 'active' : ''}" data-section="roles">
                <i data-feather="key"></i>
                <span>Roles & Permissions</span>
              </li>
              <li class="nav-item ${this.currentSection === 'campaigns' ? 'active' : ''}" data-section="campaigns">
                <i data-feather="target"></i>
                <span>Campaigns</span>
              </li>
            </ul>
            
            <div class="section-header">Integrations</div>
            <ul class="nav-items">
              <li class="nav-item ${this.currentSection === 'ai' ? 'active' : ''}" data-section="ai">
                <i data-feather="cpu"></i>
                <span>AI Settings</span>
              </li>
              <li class="nav-item ${this.currentSection === 'telephony' ? 'active' : ''}" data-section="telephony">
                <i data-feather="phone"></i>
                <span>Telephony</span>
              </li>
              <li class="nav-item ${this.currentSection === 'messaging' ? 'active' : ''}" data-section="messaging">
                <i data-feather="message-circle"></i>
                <span>Messaging</span>
              </li>
              <li class="nav-item ${this.currentSection === 'webhooks' ? 'active' : ''}" data-section="webhooks">
                <i data-feather="link"></i>
                <span>Webhooks</span>
              </li>
              <li class="nav-item ${this.currentSection === 'crm' ? 'active' : ''}" data-section="crm">
                <i data-feather="database"></i>
                <span>CRM</span>
              </li>
              <li class="nav-item ${this.currentSection === 'api' ? 'active' : ''}" data-section="api">
                <i data-feather="code"></i>
                <span>API</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="settings-content">
          <div class="settings-header">
            <h2 class="section-title">${this.getSectionTitle()}</h2>
            
            ${this.saveSuccess ? `
            <div class="save-success">
              <i data-feather="check-circle"></i>
              <span>Settings saved successfully</span>
            </div>
            ` : ''}
            
            ${this.saveError ? `
            <div class="save-error">
              <i data-feather="alert-circle"></i>
              <span>${this.saveError}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="settings-body">
            ${this.renderSettingsSection()}
          </div>
        </div>
      </div>
    `;
    
    // Initialize feather icons
    feather.replace();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Render the current settings section
   */
  renderSettingsSection() {
    switch (this.currentSection) {
      case 'profile':
        return this.renderProfileSection();
      case 'security':
        return this.renderSecuritySection();
      case 'preferences':
        return this.renderPreferencesSection();
      case 'notifications':
        return this.renderNotificationsSection();
      case 'general':
        return this.renderGeneralSection();
      case 'users':
        return this.renderUsersSection();
      case 'roles':
        return this.renderRolesSection();
      case 'campaigns':
        return this.renderCampaignsSection();
      case 'ai':
        return this.renderAISection();
      case 'telephony':
        return this.renderTelephonySection();
      case 'messaging':
        return this.renderMessagingSection();
      case 'webhooks':
        return this.renderWebhooksSection();
      case 'crm':
        return this.renderCRMSection();
      case 'api':
        return this.renderAPISection();
      default:
        return this.renderProfileSection();
    }
  }
  
  /**
   * Render profile settings section
   */
  renderProfileSection() {
    const profileSettings = this.settings.profile;
    
    return `
      <div class="settings-section">
        <div class="settings-form">
          <div class="form-group">
            <label for="profile-name">Name</label>
            <input type="text" id="profile-name" class="form-control" value="${profileSettings.name}">
          </div>
          
          <div class="form-group">
            <label for="profile-email">Email</label>
            <input type="email" id="profile-email" class="form-control" value="${profileSettings.email}">
          </div>
          
          <div class="form-group">
            <label for="profile-phone">Phone</label>
            <input type="tel" id="profile-phone" class="form-control" value="${profileSettings.phone || ''}">
          </div>
          
          <div class="form-group">
            <label for="profile-job-title">Job Title</label>
            <input type="text" id="profile-job-title" class="form-control" value="${profileSettings.jobTitle || ''}">
          </div>
          
          <div class="form-group">
            <label for="profile-timezone">Timezone</label>
            <select id="profile-timezone" class="form-select">
              <option value="UTC" ${profileSettings.timezone === 'UTC' ? 'selected' : ''}>UTC</option>
              <option value="America/New_York" ${profileSettings.timezone === 'America/New_York' ? 'selected' : ''}>Eastern Time (ET)</option>
              <option value="America/Chicago" ${profileSettings.timezone === 'America/Chicago' ? 'selected' : ''}>Central Time (CT)</option>
              <option value="America/Denver" ${profileSettings.timezone === 'America/Denver' ? 'selected' : ''}>Mountain Time (MT)</option>
              <option value="America/Los_Angeles" ${profileSettings.timezone === 'America/Los_Angeles' ? 'selected' : ''}>Pacific Time (PT)</option>
              <option value="Europe/London" ${profileSettings.timezone === 'Europe/London' ? 'selected' : ''}>London (GMT)</option>
              <option value="Europe/Paris" ${profileSettings.timezone === 'Europe/Paris' ? 'selected' : ''}>Paris (CET)</option>
              <option value="Asia/Tokyo" ${profileSettings.timezone === 'Asia/Tokyo' ? 'selected' : ''}>Tokyo (JST)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="profile-language">Language</label>
            <select id="profile-language" class="form-select">
              <option value="en-US" ${profileSettings.language === 'en-US' ? 'selected' : ''}>English (US)</option>
              <option value="en-GB" ${profileSettings.language === 'en-GB' ? 'selected' : ''}>English (UK)</option>
              <option value="es" ${profileSettings.language === 'es' ? 'selected' : ''}>Spanish</option>
              <option value="fr" ${profileSettings.language === 'fr' ? 'selected' : ''}>French</option>
              <option value="de" ${profileSettings.language === 'de' ? 'selected' : ''}>German</option>
              <option value="pt" ${profileSettings.language === 'pt' ? 'selected' : ''}>Portuguese</option>
              <option value="ja" ${profileSettings.language === 'ja' ? 'selected' : ''}>Japanese</option>
              <option value="zh" ${profileSettings.language === 'zh' ? 'selected' : ''}>Chinese</option>
            </select>
          </div>
        </div>
        
        <div class="form-actions">
          <button class="btn btn-primary" id="save-profile-btn">
            ${this.isSaving ? '<div class="spinner-sm"></div> Saving...' : 'Save Changes'}
          </button>
          <button class="btn btn-outline" id="reset-profile-btn">Reset</button>
        </div>
      </div>
    `;
  }
  
  /**
   * Render security settings section
   */
  renderSecuritySection() {
    return `
      <div class="settings-section">
        <div class="settings-form">
          <h3 class="settings-subsection">Change Password</h3>
          
          <div class="form-group">
            <label for="current-password">Current Password</label>
            <input type="password" id="current-password" class="form-control">
          </div>
          
          <div class="form-group">
            <label for="new-password">New Password</label>
            <input type="password" id="new-password" class="form-control">
            <div class="password-requirements">
              <p>Password must:</p>
              <ul>
                <li>Be at least 8 characters long</li>
                <li>Include at least one uppercase letter</li>
                <li>Include at least one number</li>
                <li>Include at least one special character</li>
              </ul>
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirm-password">Confirm New Password</label>
            <input type="password" id="confirm-password" class="form-control">
          </div>
          
          <div class="form-actions">
            <button class="btn btn-primary" id="change-password-btn">Change Password</button>
          </div>
          
          <hr>
          
          <h3 class="settings-subsection">Two-Factor Authentication</h3>
          
          <div class="toggle-setting">
            <div class="toggle-info">
              <strong>Enable Two-Factor Authentication</strong>
              <p>Adds an extra layer of security to your account</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="enable-2fa" ${this.settings.security.twoFactorEnabled ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="form-actions" id="save-2fa-container" style="display: none;">
            <button class="btn btn-primary" id="save-2fa-btn">Save Changes</button>
          </div>
          
          <hr>
          
          <h3 class="settings-subsection">Login Sessions</h3>
          
          <div class="sessions-list">
            ${this.settings.security.sessions.map(session => `
              <div class="session-item">
                <div class="session-info">
                  <div class="session-device">
                    <i data-feather="${this.getDeviceIcon(session.device)}"></i>
                    <span>${session.deviceName}</span>
                  </div>
                  <div class="session-details">
                    <div>${session.location} · ${session.ip}</div>
                    <div>Last active: ${this.formatDate(session.lastActive)}</div>
                  </div>
                </div>
                <div class="session-actions">
                  ${session.current ? 
                    '<span class="current-session">Current Session</span>' : 
                    `<button class="btn btn-sm btn-danger" data-session-id="${session.id}">
                      <i data-feather="log-out"></i> Logout
                    </button>`
                  }
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="form-actions">
            <button class="btn btn-danger" id="logout-all-btn">Logout All Other Devices</button>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render preferences settings section
   */
  renderPreferencesSection() {
    const preferences = this.settings.preferences;
    
    return `
      <div class="settings-section">
        <div class="settings-form">
          <h3 class="settings-subsection">Theme</h3>
          
          <div class="theme-selector">
            <div class="theme-option ${preferences.theme === 'light' ? 'selected' : ''}" data-theme="light">
              <div class="theme-preview light"></div>
              <span>Light</span>
            </div>
            
            <div class="theme-option ${preferences.theme === 'dark' ? 'selected' : ''}" data-theme="dark">
              <div class="theme-preview dark"></div>
              <span>Dark</span>
            </div>
            
            <div class="theme-option ${preferences.theme === 'system' ? 'selected' : ''}" data-theme="system">
              <div class="theme-preview system"></div>
              <span>System Default</span>
            </div>
          </div>
          
          <hr>
          
          <h3 class="settings-subsection">Dashboard</h3>
          
          <div class="form-group">
            <label for="default-view">Default View</label>
            <select id="default-view" class="form-select">
              <option value="dashboard" ${preferences.defaultView === 'dashboard' ? 'selected' : ''}>Dashboard</option>
              <option value="conversations" ${preferences.defaultView === 'conversations' ? 'selected' : ''}>Conversations</option>
              <option value="leadManagement" ${preferences.defaultView === 'leadManagement' ? 'selected' : ''}>Lead Management</option>
              <option value="analytics" ${preferences.defaultView === 'analytics' ? 'selected' : ''}>Analytics</option>
            </select>
          </div>
          
          <div class="toggle-setting">
            <div class="toggle-info">
              <strong>Show Notifications</strong>
              <p>Display notification popups in the dashboard</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="show-notifications" ${preferences.showNotifications ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="toggle-setting">
            <div class="toggle-info">
              <strong>Show Real-time Updates</strong>
              <p>Update dashboard data in real-time</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="realtime-updates" ${preferences.realtimeUpdates ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <hr>
          
          <h3 class="settings-subsection">Date & Time</h3>
          
          <div class="form-group">
            <label for="date-format">Date Format</label>
            <select id="date-format" class="form-select">
              <option value="MM/DD/YYYY" ${preferences.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
              <option value="DD/MM/YYYY" ${preferences.dateFormat === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY</option>
              <option value="YYYY-MM-DD" ${preferences.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="time-format">Time Format</label>
            <select id="time-format" class="form-select">
              <option value="12h" ${preferences.timeFormat === '12h' ? 'selected' : ''}>12-hour (AM/PM)</option>
              <option value="24h" ${preferences.timeFormat === '24h' ? 'selected' : ''}>24-hour</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button class="btn btn-primary" id="save-preferences-btn">
              ${this.isSaving ? '<div class="spinner-sm"></div> Saving...' : 'Save Changes'}
            </button>
            <button class="btn btn-outline" id="reset-preferences-btn">Reset to Defaults</button>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render notifications settings section
   */
  renderNotificationsSection() {
    const notifications = this.settings.notifications;
    
    return `
      <div class="settings-section">
        <div class="settings-form">
          <h3 class="settings-subsection">Email Notifications</h3>
          
          <div class="toggle-setting">
            <div class="toggle-info">
              <strong>New Lead Notifications</strong>
              <p>Receive email notifications when new leads are added</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="email-new-leads" ${notifications.email.newLeads ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="toggle-setting">
            <div class="toggle-info">
              <strong>Lead Assignment Notifications</strong>
              <p>Receive email notifications when leads are assigned to you</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="email-lead-assignments" ${notifications.email.leadAssignments ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="toggle-setting">
            <div class="toggle-info">
              <strong>Task Reminders</strong>
              <p>Receive email reminders for upcoming tasks</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="email-task-reminders" ${notifications.email.taskReminders ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="toggle-setting">
            <div class="toggle-info">
              <strong>Campaign Reports</strong>
              <p>Receive weekly campaign performance reports</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="email-campaign-reports" ${notifications.email.campaignReports ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <hr>
          
          <h3 class="settings-subsection">System Notifications</h3>
          
          <div class="toggle-setting">
            <div class="toggle-info">
              <strong>Incoming Call Notifications</strong>
              <p>Show desktop notifications for incoming calls</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="system-incoming-calls" ${notifications.system.incomingCalls ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="toggle-setting">
            <div class="toggle-info">
              <strong>New Message Notifications</strong>
              <p>Show desktop notifications for new messages</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="system-new-messages" ${notifications.system.newMessages ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="toggle-setting">
            <div class="toggle-info">
              <strong>Task Due Notifications</strong>
              <p>Show desktop notifications for tasks due today</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="system-task-due" ${notifications.system.taskDue ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="toggle-setting">
            <div class="toggle-info">
              <strong>Lead Assignment Notifications</strong>
              <p>Show desktop notifications when leads are assigned to you</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="system-lead-assignments" ${notifications.system.leadAssignments ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="form-actions">
            <button class="btn btn-primary" id="save-notifications-btn">
              ${this.isSaving ? '<div class="spinner-sm"></div> Saving...' : 'Save Changes'}
            </button>
            <button class="btn btn-outline" id="reset-notifications-btn">Reset to Defaults</button>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render general settings section
   */
  renderGeneralSection() {
    // Implementation for general settings section
    return `<div class="placeholder">General Settings Content</div>`;
  }
  
  /**
   * Render users settings section
   */
  renderUsersSection() {
    // Implementation for users settings section
    return `<div class="placeholder">Users & Teams Settings Content</div>`;
  }
  
  /**
   * Render roles settings section
   */
  renderRolesSection() {
    // Implementation for roles settings section
    return `<div class="placeholder">Roles & Permissions Settings Content</div>`;
  }
  
  /**
   * Render campaigns settings section
   */
  renderCampaignsSection() {
    // Implementation for campaigns settings section
    return `<div class="placeholder">Campaigns Settings Content</div>`;
  }
  
  /**
   * Render AI settings section
   */
  renderAISection() {
    // Implementation for AI settings section
    return `<div class="placeholder">AI Settings Content</div>`;
  }
  
  /**
   * Render telephony settings section
   */
  renderTelephonySection() {
    const telephony = this.settings.integrations.telephony;
    
    return `
      <div class="settings-section">
        <div class="settings-form">
          <h3 class="settings-subsection">Asterisk SIP Configuration</h3>
          
          <div class="form-group">
            <label for="sip-server">SIP Server</label>
            <input type="text" id="sip-server" class="form-control" value="${telephony.sipServer || ''}">
          </div>
          
          <div class="form-group">
            <label for="sip-username">SIP Username</label>
            <input type="text" id="sip-username" class="form-control" value="${telephony.sipUsername || ''}">
          </div>
          
          <div class="form-group">
            <label for="sip-password">SIP Password</label>
            <input type="password" id="sip-password" class="form-control" value="${telephony.sipPassword ? '••••••••' : ''}">
          </div>
          
          <div class="form-group">
            <label for="sip-domain">SIP Domain</label>
            <input type="text" id="sip-domain" class="form-control" value="${telephony.sipDomain || ''}">
          </div>
          
          <hr>
          
          <h3 class="settings-subsection">Telephony Trunks</h3>
          
          <div class="trunk-list">
            ${telephony.trunks.map((trunk, index) => `
              <div class="trunk-item">
                <div class="trunk-header">
                  <div class="trunk-name">Trunk #${index + 1}: ${trunk.name}</div>
                  <div class="trunk-status ${trunk.status}">${trunk.status}</div>
                </div>
                <div class="trunk-details">
                  <div class="trunk-detail">
                    <span class="detail-label">Provider:</span>
                    <span class="detail-value">${trunk.provider}</span>
                  </div>
                  <div class="trunk-detail">
                    <span class="detail-label">Number:</span>
                    <span class="detail-value">${trunk.number}</span>
                  </div>
                  <div class="trunk-detail">
                    <span class="detail-label">Capacity:</span>
                    <span class="detail-value">${trunk.capacity} concurrent calls</span>
                  </div>
                </div>
                <div class="trunk-actions">
                  <button class="btn btn-sm btn-outline" data-trunk-id="${trunk.id}" data-action="edit-trunk">
                    <i data-feather="edit"></i> Edit
                  </button>
                  <button class="btn btn-sm btn-outline danger" data-trunk-id="${trunk.id}" data-action="delete-trunk">
                    <i data-feather="trash-2"></i> Delete
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="form-actions trunk-actions">
            <button class="btn btn-primary" id="add-trunk-btn">
              <i data-feather="plus"></i> Add New Trunk
            </button>
          </div>
          
          <hr>
          
          <h3 class="settings-subsection">Call Settings</h3>
          
          <div class="form-group">
            <label for="call-recording">Call Recording</label>
            <select id="call-recording" class="form-select">
              <option value="all" ${telephony.callRecording === 'all' ? 'selected' : ''}>Record All Calls</option>
              <option value="inbound" ${telephony.callRecording === 'inbound' ? 'selected' : ''}>Record Inbound Calls Only</option>
              <option value="outbound" ${telephony.callRecording === 'outbound' ? 'selected' : ''}>Record Outbound Calls Only</option>
              <option value="none" ${telephony.callRecording === 'none' ? 'selected' : ''}>Do Not Record Calls</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="voicemail-email">Voicemail Email</label>
            <input type="email" id="voicemail-email" class="form-control" value="${telephony.voicemailEmail || ''}">
            <small class="form-text">Voicemail recordings will be sent to this email address</small>
          </div>
          
          <div class="toggle-setting">
            <div class="toggle-info">
              <strong>Enable Call Queues</strong>
              <p>Set up call queues for handling multiple incoming calls</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="enable-call-queues" ${telephony.enableCallQueues ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="toggle-setting">
            <div class="toggle-info">
              <strong>Call Transcription</strong>
              <p>Automatically transcribe calls using AI</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="enable-transcription" ${telephony.enableTranscription ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="form-actions">
            <button class="btn btn-primary" id="save-telephony-btn">
              ${this.isSaving ? '<div class="spinner-sm"></div> Saving...' : 'Save Changes'}
            </button>
            <button class="btn btn-outline" id="test-connection-btn">Test Connection</button>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render messaging settings section
   */
  renderMessagingSection() {
    // Implementation for messaging settings section
    return `<div class="placeholder">Messaging Settings Content</div>`;
  }
  
  /**
   * Render webhooks settings section
   */
  renderWebhooksSection() {
    // Implementation for webhooks settings section
    return `<div class="placeholder">Webhooks Settings Content</div>`;
  }
  
  /**
   * Render CRM settings section
   */
  renderCRMSection() {
    // Implementation for CRM settings section
    return `<div class="placeholder">CRM Settings Content</div>`;
  }
  
  /**
   * Render API settings section
   */
  renderAPISection() {
    // Implementation for API settings section
    return `<div class="placeholder">API Settings Content</div>`;
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Section navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        this.currentSection = item.dataset.section;
        this.render(document.getElementById('view-container'));
      });
    });
    
    // Save profile button
    document.getElementById('save-profile-btn')?.addEventListener('click', () => {
      this.saveProfileSettings();
    });
    
    // Save preferences button
    document.getElementById('save-preferences-btn')?.addEventListener('click', () => {
      this.savePreferencesSettings();
    });
    
    // Save notifications button
    document.getElementById('save-notifications-btn')?.addEventListener('click', () => {
      this.saveNotificationsSettings();
    });
    
    // Save telephony button
    document.getElementById('save-telephony-btn')?.addEventListener('click', () => {
      this.saveTelephonySettings();
    });
    
    // Change password button
    document.getElementById('change-password-btn')?.addEventListener('click', () => {
      this.changePassword();
    });
    
    // Two-factor authentication toggle
    document.getElementById('enable-2fa')?.addEventListener('change', (e) => {
      document.getElementById('save-2fa-container').style.display = 'block';
    });
    
    // Save 2FA button
    document.getElementById('save-2fa-btn')?.addEventListener('click', () => {
      this.saveTwoFactorSettings();
    });
    
    // Logout all sessions button
    document.getElementById('logout-all-btn')?.addEventListener('click', () => {
      this.logoutAllSessions();
    });
    
    // Session logout buttons
    document.querySelectorAll('.session-actions .btn-danger').forEach(button => {
      button.addEventListener('click', () => {
        const sessionId = button.dataset.sessionId;
        this.logoutSession(sessionId);
      });
    });
    
    // Theme selector
    document.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
      });
    });
    
    // Add trunk button
    document.getElementById('add-trunk-btn')?.addEventListener('click', () => {
      this.showAddTrunkModal();
    });
    
    // Edit trunk buttons
    document.querySelectorAll('[data-action="edit-trunk"]').forEach(button => {
      button.addEventListener('click', () => {
        const trunkId = button.dataset.trunkId;
        this.showEditTrunkModal(trunkId);
      });
    });
    
    // Delete trunk buttons
    document.querySelectorAll('[data-action="delete-trunk"]').forEach(button => {
      button.addEventListener('click', () => {
        const trunkId = button.dataset.trunkId;
        this.confirmDeleteTrunk(trunkId);
      });
    });
  }
  
  /**
   * Save profile settings
   */
  async saveProfileSettings() {
    this.isSaving = true;
    this.render(document.getElementById('view-container'));
    
    try {
      const profileData = {
        name: document.getElementById('profile-name')?.value,
        email: document.getElementById('profile-email')?.value,
        phone: document.getElementById('profile-phone')?.value,
        jobTitle: document.getElementById('profile-job-title')?.value,
        timezone: document.getElementById('profile-timezone')?.value,
        language: document.getElementById('profile-language')?.value
      };
      
      const response = await this.apiService.put('/api/settings/profile', profileData);
      
      this.settings.profile = response;
      this.saveSuccess = true;
      this.saveError = null;
    } catch (error) {
      console.error('Error saving profile settings:', error);
      this.saveSuccess = false;
      this.saveError = 'Failed to save profile settings. Please try again.';
    }
    
    this.isSaving = false;
    this.render(document.getElementById('view-container'));
    
    // Clear success message after a delay
    setTimeout(() => {
      this.saveSuccess = false;
      this.saveError = null;
      this.render(document.getElementById('view-container'));
    }, 3000);
  }
  
  /**
   * Save preferences settings
   */
  async savePreferencesSettings() {
    this.isSaving = true;
    this.render(document.getElementById('view-container'));
    
    try {
      // Get selected theme
      const selectedTheme = document.querySelector('.theme-option.selected')?.dataset.theme;
      
      const preferencesData = {
        theme: selectedTheme,
        defaultView: document.getElementById('default-view')?.value,
        showNotifications: document.getElementById('show-notifications')?.checked,
        realtimeUpdates: document.getElementById('realtime-updates')?.checked,
        dateFormat: document.getElementById('date-format')?.value,
        timeFormat: document.getElementById('time-format')?.value
      };
      
      const response = await this.apiService.put('/api/settings/preferences', preferencesData);
      
      this.settings.preferences = response;
      this.saveSuccess = true;
      this.saveError = null;
    } catch (error) {
      console.error('Error saving preferences settings:', error);
      this.saveSuccess = false;
      this.saveError = 'Failed to save preferences settings. Please try again.';
    }
    
    this.isSaving = false;
    this.render(document.getElementById('view-container'));
    
    // Clear success message after a delay
    setTimeout(() => {
      this.saveSuccess = false;
      this.saveError = null;
      this.render(document.getElementById('view-container'));
    }, 3000);
  }
  
  /**
   * Save notifications settings
   */
  async saveNotificationsSettings() {
    this.isSaving = true;
    this.render(document.getElementById('view-container'));
    
    try {
      const notificationsData = {
        email: {
          newLeads: document.getElementById('email-new-leads')?.checked,
          leadAssignments: document.getElementById('email-lead-assignments')?.checked,
          taskReminders: document.getElementById('email-task-reminders')?.checked,
          campaignReports: document.getElementById('email-campaign-reports')?.checked
        },
        system: {
          incomingCalls: document.getElementById('system-incoming-calls')?.checked,
          newMessages: document.getElementById('system-new-messages')?.checked,
          taskDue: document.getElementById('system-task-due')?.checked,
          leadAssignments: document.getElementById('system-lead-assignments')?.checked
        }
      };
      
      const response = await this.apiService.put('/api/settings/notifications', notificationsData);
      
      this.settings.notifications = response;
      this.saveSuccess = true;
      this.saveError = null;
    } catch (error) {
      console.error('Error saving notifications settings:', error);
      this.saveSuccess = false;
      this.saveError = 'Failed to save notifications settings. Please try again.';
    }
    
    this.isSaving = false;
    this.render(document.getElementById('view-container'));
    
    // Clear success message after a delay
    setTimeout(() => {
      this.saveSuccess = false;
      this.saveError = null;
      this.render(document.getElementById('view-container'));
    }, 3000);
  }
  
  /**
   * Save telephony settings
   */
  async saveTelephonySettings() {
    this.isSaving = true;
    this.render(document.getElementById('view-container'));
    
    try {
      const telephonyData = {
        sipServer: document.getElementById('sip-server')?.value,
        sipUsername: document.getElementById('sip-username')?.value,
        sipDomain: document.getElementById('sip-domain')?.value,
        callRecording: document.getElementById('call-recording')?.value,
        voicemailEmail: document.getElementById('voicemail-email')?.value,
        enableCallQueues: document.getElementById('enable-call-queues')?.checked,
        enableTranscription: document.getElementById('enable-transcription')?.checked
      };
      
      // Only update password if it's been changed
      const sipPassword = document.getElementById('sip-password')?.value;
      if (sipPassword && sipPassword !== '••••••••') {
        telephonyData.sipPassword = sipPassword;
      }
      
      const response = await this.apiService.put('/api/settings/integrations/telephony', telephonyData);
      
      this.settings.integrations.telephony = {
        ...this.settings.integrations.telephony,
        ...response,
        trunks: this.settings.integrations.telephony.trunks // Keep existing trunks
      };
      
      this.saveSuccess = true;
      this.saveError = null;
    } catch (error) {
      console.error('Error saving telephony settings:', error);
      this.saveSuccess = false;
      this.saveError = 'Failed to save telephony settings. Please try again.';
    }
    
    this.isSaving = false;
    this.render(document.getElementById('view-container'));
    
    // Clear success message after a delay
    setTimeout(() => {
      this.saveSuccess = false;
      this.saveError = null;
      this.render(document.getElementById('view-container'));
    }, 3000);
  }
  
  /**
   * Change password
   */
  async changePassword() {
    const currentPassword = document.getElementById('current-password')?.value;
    const newPassword = document.getElementById('new-password')?.value;
    const confirmPassword = document.getElementById('confirm-password')?.value;
    
    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      this.saveError = 'All password fields are required';
      this.render(document.getElementById('view-container'));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      this.saveError = 'New password and confirmation do not match';
      this.render(document.getElementById('view-container'));
      return;
    }
    
    // Validate password strength
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(newPassword)) {
      this.saveError = 'New password does not meet the requirements';
      this.render(document.getElementById('view-container'));
      return;
    }
    
    this.isSaving = true;
    this.render(document.getElementById('view-container'));
    
    try {
      await this.apiService.put('/api/settings/security/password', {
        currentPassword,
        newPassword
      });
      
      // Clear password fields
      document.getElementById('current-password').value = '';
      document.getElementById('new-password').value = '';
      document.getElementById('confirm-password').value = '';
      
      this.saveSuccess = true;
      this.saveError = null;
    } catch (error) {
      console.error('Error changing password:', error);
      this.saveSuccess = false;
      this.saveError = 'Failed to change password. Please check your current password and try again.';
    }
    
    this.isSaving = false;
    this.render(document.getElementById('view-container'));
    
    // Clear success message after a delay
    setTimeout(() => {
      this.saveSuccess = false;
      this.saveError = null;
      this.render(document.getElementById('view-container'));
    }, 3000);
  }
  
  /**
   * Save two-factor authentication settings
   */
  async saveTwoFactorSettings() {
    const enable2FA = document.getElementById('enable-2fa')?.checked;
    
    this.isSaving = true;
    this.render(document.getElementById('view-container'));
    
    try {
      await this.apiService.put('/api/settings/security/2fa', {
        enabled: enable2FA
      });
      
      this.settings.security.twoFactorEnabled = enable2FA;
      this.saveSuccess = true;
      this.saveError = null;
    } catch (error) {
      console.error('Error saving 2FA settings:', error);
      this.saveSuccess = false;
      this.saveError = 'Failed to save two-factor authentication settings. Please try again.';
    }
    
    this.isSaving = false;
    this.render(document.getElementById('view-container'));
    
    // Hide save 2FA container
    document.getElementById('save-2fa-container').style.display = 'none';
    
    // Clear success message after a delay
    setTimeout(() => {
      this.saveSuccess = false;
      this.saveError = null;
      this.render(document.getElementById('view-container'));
    }, 3000);
  }
  
  /**
   * Logout all sessions except current
   */
  async logoutAllSessions() {
    try {
      await this.apiService.post('/api/settings/security/logout-all');
      
      // Update sessions list (keep only current session)
      this.settings.security.sessions = this.settings.security.sessions.filter(session => session.current);
      
      this.saveSuccess = true;
      this.saveError = null;
      this.render(document.getElementById('view-container'));
    } catch (error) {
      console.error('Error logging out all sessions:', error);
      this.saveSuccess = false;
      this.saveError = 'Failed to logout all sessions. Please try again.';
      this.render(document.getElementById('view-container'));
    }
    
    // Clear success message after a delay
    setTimeout(() => {
      this.saveSuccess = false;
      this.saveError = null;
      this.render(document.getElementById('view-container'));
    }, 3000);
  }
  
  /**
   * Logout specific session
   */
  async logoutSession(sessionId) {
    try {
      await this.apiService.post(`/api/settings/security/logout-session/${sessionId}`);
      
      // Remove session from the list
      this.settings.security.sessions = this.settings.security.sessions.filter(session => session.id !== sessionId);
      
      this.saveSuccess = true;
      this.saveError = null;
      this.render(document.getElementById('view-container'));
    } catch (error) {
      console.error('Error logging out session:', error);
      this.saveSuccess = false;
      this.saveError = 'Failed to logout session. Please try again.';
      this.render(document.getElementById('view-container'));
    }
    
    // Clear success message after a delay
    setTimeout(() => {
      this.saveSuccess = false;
      this.saveError = null;
      this.render(document.getElementById('view-container'));
    }, 3000);
  }
  
  /**
   * Show modal for adding a new trunk
   */
  showAddTrunkModal() {
    // TODO: Implement modal UI
    alert('Add trunk modal would show here');
  }
  
  /**
   * Show modal for editing a trunk
   */
  showEditTrunkModal(trunkId) {
    // TODO: Implement modal UI
    alert(`Edit trunk modal for trunk ${trunkId} would show here`);
  }
  
  /**
   * Confirm trunk deletion
   */
  confirmDeleteTrunk(trunkId) {
    // TODO: Implement modal UI
    const confirm = window.confirm('Are you sure you want to delete this trunk?');
    if (confirm) {
      this.deleteTrunk(trunkId);
    }
  }
  
  /**
   * Delete a trunk
   */
  async deleteTrunk(trunkId) {
    try {
      await this.apiService.delete(`/api/settings/integrations/telephony/trunks/${trunkId}`);
      
      // Remove trunk from the list
      this.settings.integrations.telephony.trunks = this.settings.integrations.telephony.trunks.filter(trunk => trunk.id !== trunkId);
      
      this.saveSuccess = true;
      this.saveError = null;
      this.render(document.getElementById('view-container'));
    } catch (error) {
      console.error('Error deleting trunk:', error);
      this.saveSuccess = false;
      this.saveError = 'Failed to delete trunk. Please try again.';
      this.render(document.getElementById('view-container'));
    }
    
    // Clear success message after a delay
    setTimeout(() => {
      this.saveSuccess = false;
      this.saveError = null;
      this.render(document.getElementById('view-container'));
    }, 3000);
  }
  
  /**
   * Get section title based on current section
   */
  getSectionTitle() {
    const titles = {
      profile: 'Profile Settings',
      security: 'Security Settings',
      preferences: 'Preferences',
      notifications: 'Notification Settings',
      general: 'General Settings',
      users: 'Users & Teams',
      roles: 'Roles & Permissions',
      campaigns: 'Campaign Settings',
      ai: 'AI Integration Settings',
      telephony: 'Telephony Settings',
      messaging: 'Messaging Integration',
      webhooks: 'Webhooks',
      crm: 'CRM Integration',
      api: 'API Settings'
    };
    
    return titles[this.currentSection] || 'Settings';
  }
  
  /**
   * Get appropriate icon for device type
   */
  getDeviceIcon(device) {
    switch (device.toLowerCase()) {
      case 'desktop':
      case 'pc':
      case 'mac':
      case 'computer':
        return 'monitor';
      case 'mobile':
      case 'phone':
      case 'iphone':
      case 'android':
        return 'smartphone';
      case 'tablet':
      case 'ipad':
        return 'tablet';
      default:
        return 'device-desktop';
    }
  }
  
  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    
    // Less than a minute ago
    if (diffSeconds < 60) {
      return 'Just now';
    }
    
    // Less than an hour ago
    if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Less than a day ago
    if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Less than a week ago
    if (diffSeconds < 604800) {
      const days = Math.floor(diffSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    
    // Format as date
    return date.toLocaleDateString();
  }
}