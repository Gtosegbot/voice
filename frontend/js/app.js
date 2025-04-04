/**
 * Main application script for VoiceAI platform
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize application
    initApp();
});

/**
 * Initialize application
 */
function initApp() {
    // Set up event handlers
    setupEventHandlers();
    
    // Check authentication
    checkAuth();
}

/**
 * Set up event handlers
 */
function setupEventHandlers() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            toggleSidebar();
        });
    }
    
    // Sidebar navigation
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            navigateTo(page);
        });
    });
    
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', event => {
            event.preventDefault();
            handleLogin();
        });
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', event => {
            event.preventDefault();
            handleRegister();
        });
    }
    
    // Auth links
    const registerLink = document.getElementById('register-link');
    if (registerLink) {
        registerLink.addEventListener('click', event => {
            event.preventDefault();
            showAuthPage('register');
        });
    }
    
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
        loginLink.addEventListener('click', event => {
            event.preventDefault();
            showAuthPage('login');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            handleLogout();
        });
    }
    
    // New call button
    const newCallBtn = document.getElementById('new-call-btn');
    if (newCallBtn) {
        newCallBtn.addEventListener('click', () => {
            openNewCallModal();
        });
    }
    
    // Start call button
    const startCallBtn = document.getElementById('start-call-btn');
    if (startCallBtn) {
        startCallBtn.addEventListener('click', () => {
            startCall();
        });
    }
    
    // End call button
    const endCallBtn = document.getElementById('end-call-btn');
    if (endCallBtn) {
        endCallBtn.addEventListener('click', () => {
            endCall();
        });
    }
    
    // Subscribe to store changes
    window.store.subscribe(state => {
        updateUI(state);
    });
}

/**
 * Check authentication
 */
function checkAuth() {
    const isAuthenticated = window.store.state.isAuthenticated;
    
    if (isAuthenticated) {
        // User is authenticated
        showApp();
        
        // Initialize components
        initComponents();
        
        // Connect to WebSocket
        connectWebSocket();
    } else {
        // User is not authenticated
        showAuthPage('login');
    }
}

/**
 * Connect to WebSocket
 */
function connectWebSocket() {
    const token = ApiService.getAuthToken();
    if (token) {
        window.socketService.connect(token);
        window.socketService.startPingInterval();
    }
}

/**
 * Show authentication page
 */
function showAuthPage(page) {
    // Hide app container
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.style.display = 'none';
    }
    
    // Hide all auth pages
    const authPages = document.querySelectorAll('.auth-page');
    authPages.forEach(page => {
        page.style.display = 'none';
    });
    
    // Show specified auth page
    const authPage = document.getElementById(`${page}-page`);
    if (authPage) {
        authPage.style.display = 'flex';
    }
}

/**
 * Show application
 */
function showApp() {
    // Hide auth pages
    const authPages = document.querySelectorAll('.auth-page');
    authPages.forEach(page => {
        page.style.display = 'none';
    });
    
    // Show app container
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.style.display = 'flex';
    }
    
    // Update user info in sidebar
    updateUserInfo();
}

/**
 * Initialize components
 */
function initComponents() {
    // Get current page
    const activePage = document.querySelector('.sidebar-nav-item.active');
    let page = 'dashboard';
    
    if (activePage) {
        page = activePage.getAttribute('data-page');
    }
    
    // Navigate to current page
    navigateTo(page);
}

/**
 * Navigate to page
 */
function navigateTo(page) {
    // Update active nav item
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Hide all pages
    const contentPages = document.querySelectorAll('.content-page');
    contentPages.forEach(page => {
        page.style.display = 'none';
    });
    
    // Show selected page
    const selectedPage = document.getElementById(`${page}-page`);
    if (selectedPage) {
        selectedPage.style.display = 'block';
    }
    
    // Initialize page component
    switch (page) {
        case 'dashboard':
            window.Dashboard.init();
            break;
        case 'leads':
            window.LeadManagement.init();
            break;
        case 'conversations':
            window.Conversations.init();
            break;
        case 'analytics':
            window.Analytics.init();
            break;
        case 'flow-builder':
            window.FlowBuilder.init();
            break;
        case 'settings':
            window.Settings.init();
            break;
    }
}

/**
 * Toggle sidebar
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar && mainContent) {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }
}

/**
 * Update user info in sidebar
 */
function updateUserInfo() {
    const currentUser = window.store.state.currentUser;
    
    if (currentUser) {
        // Update user name and role
        const userNameElement = document.getElementById('current-user-name');
        const userRoleElement = document.getElementById('current-user-role');
        
        if (userNameElement) {
            userNameElement.textContent = currentUser.name;
        }
        
        if (userRoleElement) {
            userRoleElement.textContent = getRoleLabel(currentUser.role);
        }
    }
}

/**
 * Get role label
 */
function getRoleLabel(role) {
    switch (role) {
        case 'admin':
            return 'Administrador';
        case 'manager':
            return 'Gerente';
        case 'agent':
            return 'Agente';
        default:
            return role;
    }
}

/**
 * Handle login
 */
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Validate inputs
    if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    try {
        // Login via store
        await window.store.login(email, password);
        
        // Show app
        showApp();
        
        // Initialize components
        initComponents();
        
        // Connect to WebSocket
        connectWebSocket();
    } catch (error) {
        console.error('Login error:', error);
        alert('Erro ao fazer login. Verifique suas credenciais.');
    }
}

/**
 * Handle register
 */
async function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('As senhas não coincidem.');
        return;
    }
    
    try {
        // Register via store
        await window.store.register(name, email, password);
        
        // Show app
        showApp();
        
        // Initialize components
        initComponents();
        
        // Connect to WebSocket
        connectWebSocket();
    } catch (error) {
        console.error('Register error:', error);
        alert('Erro ao criar conta. Verifique os dados e tente novamente.');
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        // Disconnect from WebSocket
        window.socketService.disconnect();
        window.socketService.stopPingInterval();
        
        // Logout via store
        await window.store.logout();
        
        // Show login page
        showAuthPage('login');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

/**
 * Open new call modal
 */
async function openNewCallModal() {
    try {
        // Get leads for dropdown
        const data = await ApiService.getLeads();
        
        // Populate lead select
        const leadSelect = document.getElementById('call-lead-select');
        if (leadSelect) {
            // Clear existing options
            leadSelect.innerHTML = '<option value="">-- Selecione um Lead --</option>';
            
            // Add leads to select
            if (data.leads && data.leads.length > 0) {
                data.leads.forEach(lead => {
                    const option = document.createElement('option');
                    option.value = lead.id;
                    option.textContent = lead.name;
                    option.setAttribute('data-phone', lead.phone || '');
                    leadSelect.appendChild(option);
                });
            }
            
            // Add change event
            leadSelect.addEventListener('change', () => {
                const selectedOption = leadSelect.options[leadSelect.selectedIndex];
                const phone = selectedOption.getAttribute('data-phone') || '';
                
                const phoneInput = document.getElementById('call-phone');
                if (phoneInput) {
                    phoneInput.value = phone;
                }
            });
        }
        
        // Show modal
        const modal = document.getElementById('new-call-modal');
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    } catch (error) {
        console.error('Error loading leads for call:', error);
    }
}

/**
 * Start call
 */
async function startCall() {
    try {
        // Get form values
        const leadId = document.getElementById('call-lead-select').value;
        const phone = document.getElementById('call-phone').value;
        
        // Validate inputs
        if (!phone) {
            alert('Por favor, informe o número de telefone.');
            return;
        }
        
        // Close new call modal
        const newCallModal = document.getElementById('new-call-modal');
        const newCallModalInstance = bootstrap.Modal.getInstance(newCallModal);
        newCallModalInstance.hide();
        
        // Show loading indicator
        window.store.setNotification('Iniciando chamada...', 'info');
        
        // Start call (in a real app, this would be an API call)
        // const callData = await ApiService.startCall(leadId, phone);
        
        // Mock call data
        const callData = {
            id: 'call-' + Date.now(),
            leadId: leadId,
            phone: phone,
            startTime: new Date().toISOString(),
            status: 'ringing'
        };
        
        // Update store with active call
        window.store.setActiveCall(callData);
        
        // Show active call modal
        const activeCallModal = document.getElementById('active-call-modal');
        const activeCallModalInstance = new bootstrap.Modal(activeCallModal);
        activeCallModalInstance.show();
        
        // Update call info
        updateCallInfo(callData);
        
        // Start call timer
        startCallTimer();
        
        // Mock call connection after 2 seconds
        setTimeout(() => {
            const updatedCallData = { ...callData, status: 'in-progress' };
            window.store.setActiveCall(updatedCallData);
            updateCallInfo(updatedCallData);
        }, 2000);
    } catch (error) {
        console.error('Error starting call:', error);
        window.store.setNotification('Erro ao iniciar chamada', 'danger');
    }
}

/**
 * End call
 */
async function endCall() {
    try {
        const activeCall = window.store.state.activeCall;
        
        if (!activeCall) {
            return;
        }
        
        // End call (in a real app, this would be an API call)
        // await ApiService.endCall(activeCall.id);
        
        // Stop call timer
        stopCallTimer();
        
        // Clear active call
        window.store.clearActiveCall();
        
        // Close active call modal
        const activeCallModal = document.getElementById('active-call-modal');
        const activeCallModalInstance = bootstrap.Modal.getInstance(activeCallModal);
        activeCallModalInstance.hide();
        
        // Show notification
        window.store.setNotification('Chamada finalizada', 'success');
    } catch (error) {
        console.error('Error ending call:', error);
        window.store.setNotification('Erro ao finalizar chamada', 'danger');
    }
}

/**
 * Update call info
 */
function updateCallInfo(callData) {
    // Update lead info
    const leadName = document.getElementById('active-call-lead-name');
    const leadCompany = document.getElementById('active-call-lead-company');
    const leadPhone = document.getElementById('active-call-lead-phone');
    
    // Get lead by ID (in a real app, this would be from the store or API)
    const lead = {
        name: 'Lead',
        company: 'Empresa',
        phone: callData.phone
    };
    
    if (leadName) leadName.textContent = lead.name;
    if (leadCompany) leadCompany.textContent = lead.company;
    if (leadPhone) leadPhone.textContent = lead.phone;
    
    // Update call status
    const callStatus = document.getElementById('call-status');
    if (callStatus) {
        switch (callData.status) {
            case 'ringing':
                callStatus.textContent = 'Chamando...';
                break;
            case 'in-progress':
                callStatus.textContent = 'Em andamento';
                break;
            case 'ended':
                callStatus.textContent = 'Finalizada';
                break;
            default:
                callStatus.textContent = callData.status;
        }
    }
}

/**
 * Start call timer
 */
function startCallTimer() {
    // Clear existing timer
    if (window.callTimer) {
        clearInterval(window.callTimer);
    }
    
    // Initialize timer variables
    window.callStartTime = new Date();
    
    // Start timer
    window.callTimer = setInterval(() => {
        updateCallTimer();
    }, 1000);
    
    // Initial update
    updateCallTimer();
}

/**
 * Stop call timer
 */
function stopCallTimer() {
    if (window.callTimer) {
        clearInterval(window.callTimer);
        window.callTimer = null;
    }
}

/**
 * Update call timer
 */
function updateCallTimer() {
    if (!window.callStartTime) return;
    
    const now = new Date();
    const elapsed = Math.floor((now - window.callStartTime) / 1000);
    
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    
    const timerElement = document.getElementById('call-timer');
    if (timerElement) {
        timerElement.textContent = `${minutes}:${seconds}`;
    }
}

/**
 * Update UI based on state changes
 */
function updateUI(state) {
    // Update notification
    updateNotification(state.notification);
}

/**
 * Update notification
 */
function updateNotification(notification) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    if (!notification) return;
    
    // Create notification element
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification-toast toast show bg-${notification.type}`;
    notificationElement.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
    
    // Add content
    notificationElement.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">VoiceAI</strong>
            <button type="button" class="btn-close" aria-label="Close"></button>
        </div>
        <div class="toast-body text-${notification.type === 'danger' ? 'white' : 'dark'}">
            ${notification.message}
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notificationElement);
    
    // Add close button event
    const closeButton = notificationElement.querySelector('.btn-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            notificationElement.remove();
            window.store.clearNotification();
        });
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notificationElement)) {
            notificationElement.remove();
        }
    }, 5000);
}
