/**
 * Main Application JavaScript
 * This file initializes the application and handles the main functionality
 */

// When the DOM is fully loaded, initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    
    if (token) {
        // Try to verify token validity
        // In a real app, you would send a request to your API to verify the token
        initApp();
    } else {
        // Show login page
        showLoginPage();
    }
    
    // Set up event listeners for authentication forms
    setupAuthEvents();
    
    // Set up event listeners for page navigation
    setupNavigation();
});

/**
 * Initialize the application
 */
function initApp() {
    console.log('Initializing VoiceAI Platform...');
    
    // Hide auth pages
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'none';
    
    // Show main content
    document.querySelector('.app-container').style.display = 'flex';
    
    // Get current page from URL hash or default to dashboard
    const currentPage = window.location.hash.slice(1) || 'dashboard';
    
    // Update store with initial state
    store.navigateTo(currentPage);
    
    // Update UI based on current page
    updateUI();
    
    // Set current user info (would normally be fetched from API)
    document.getElementById('current-user-name').textContent = 'Demo User';
    document.getElementById('current-user-role').textContent = 'Administrador';
    
    // Initialize components based on current page
    initActivePage();
    
    // Initialize onboarding component
    initializeOnboarding();
    
    // Set up Socket.IO connection (would normally connect to server)
    // socketService.init(token);
    
    console.log('VoiceAI Platform initialized');
}

/**
 * Update the UI based on the current state
 */
function updateUI() {
    const state = store.getState();
    
    // Update sidebar navigation
    updateNavigation(state.currentPage);
    
    // Update page visibility
    updatePageVisibility(state.currentPage);
    
    // Update sidebar collapsed state
    if (state.sidebarCollapsed) {
        document.querySelector('.sidebar').classList.add('collapsed');
        document.querySelector('.main-content').classList.add('expanded');
    } else {
        document.querySelector('.sidebar').classList.remove('collapsed');
        document.querySelector('.main-content').classList.remove('expanded');
    }
    
    // Add hash to URL for deep linking
    window.location.hash = `#${state.currentPage}`;
}

/**
 * Update the navigation highlighting based on current page
 * @param {string} currentPage - Current page name
 */
function updateNavigation(currentPage) {
    // Remove active class from all nav items
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current page nav item
    let navItem;
    
    switch (currentPage) {
        case 'dashboard':
            navItem = document.querySelector('.sidebar-nav-item[data-page="dashboard"]');
            break;
        case 'leads':
            navItem = document.querySelector('.sidebar-nav-item[data-page="leads"]');
            break;
        case 'conversations':
            navItem = document.querySelector('.sidebar-nav-item[data-page="conversations"]');
            break;
        case 'analytics':
            navItem = document.querySelector('.sidebar-nav-item[data-page="analytics"]');
            break;
        case 'flow-builder':
            navItem = document.querySelector('.sidebar-nav-item[data-page="flow-builder"]');
            break;
        case 'settings':
            navItem = document.querySelector('.sidebar-nav-item[data-page="settings"]');
            break;
        default:
            navItem = document.querySelector('.sidebar-nav-item[data-page="dashboard"]');
    }
    
    if (navItem) {
        navItem.classList.add('active');
    }
}

/**
 * Update page visibility based on current page
 * @param {string} currentPage - Current page name
 */
function updatePageVisibility(currentPage) {
    // Hide all pages
    document.querySelectorAll('.content-page').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show current page
    let pageElement;
    
    switch (currentPage) {
        case 'dashboard':
            pageElement = document.getElementById('dashboard-page');
            break;
        case 'leads':
            pageElement = document.getElementById('leads-page');
            break;
        case 'conversations':
            pageElement = document.getElementById('conversations-page');
            break;
        case 'analytics':
            pageElement = document.getElementById('analytics-page');
            break;
        case 'flow-builder':
            pageElement = document.getElementById('flow-builder-page');
            break;
        case 'settings':
            pageElement = document.getElementById('settings-page');
            break;
        default:
            pageElement = document.getElementById('dashboard-page');
    }
    
    if (pageElement) {
        pageElement.style.display = 'block';
    }
}

/**
 * Initialize the active page
 */
function initActivePage() {
    const currentPage = store.getState().currentPage;
    
    switch (currentPage) {
        case 'dashboard':
            initDashboard();
            break;
        case 'leads':
            initLeadManagement();
            break;
        case 'conversations':
            initConversations();
            break;
        case 'analytics':
            initAnalytics();
            break;
        case 'flow-builder':
            initFlowBuilder();
            break;
        case 'settings':
            initSettings();
            break;
        default:
            initDashboard();
    }
}

/**
 * Set up navigation event listeners
 */
function setupNavigation() {
    // Sidebar toggle button
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            store.toggleSidebar();
            updateUI();
        });
    }
    
    // Sidebar navigation items
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            store.navigateTo(page);
            updateUI();
            initActivePage();
        });
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
    
    // New call button
    const newCallBtn = document.getElementById('new-call-btn');
    if (newCallBtn) {
        newCallBtn.addEventListener('click', () => {
            const newCallModal = new bootstrap.Modal(document.getElementById('new-call-modal'));
            newCallModal.show();
            
            // Populate lead select with available leads
            populateCallLeadSelect();
        });
    }
    
    // Start call button
    const startCallBtn = document.getElementById('start-call-btn');
    if (startCallBtn) {
        startCallBtn.addEventListener('click', () => {
            startNewCall();
        });
    }
}

/**
 * Populate the lead select in the call modal
 */
function populateCallLeadSelect() {
    const leadSelect = document.getElementById('call-lead-select');
    
    // Get leads from store
    const leads = store.getState().leads;
    
    // If leads are not loaded yet, load them
    if (leads.length === 0) {
        // In a real app, you would fetch leads from your API
        // For demonstration, we'll manually call the leads loading function
        // from the LeadManagement component
        loadLeads();
        return;
    }
    
    // Clear existing options except the first one
    while (leadSelect.options.length > 1) {
        leadSelect.remove(1);
    }
    
    // Add options for each lead
    leads.forEach(lead => {
        const option = document.createElement('option');
        option.value = lead.id;
        option.textContent = `${lead.name} ${lead.company ? `(${lead.company})` : ''}`;
        leadSelect.appendChild(option);
    });
}

/**
 * Start a new call
 */
function startNewCall() {
    const leadId = document.getElementById('call-lead-select').value;
    const phoneNumber = document.getElementById('call-phone').value;
    
    if (!leadId && !phoneNumber) {
        alert('Selecione um lead ou digite um número de telefone.');
        return;
    }
    
    // For demonstration, show the call modal
    // In a real app, you would initiate a call through your API
    
    let leadName = 'Novo Contato';
    let leadCompany = '';
    
    if (leadId) {
        // Find the lead in the store
        const leads = store.getState().leads;
        const lead = leads.find(l => l.id == leadId);
        
        if (lead) {
            leadName = lead.name;
            leadCompany = lead.company || '';
            
            // Use lead's phone if no number was entered
            if (!phoneNumber && lead.phone) {
                phoneNumber = lead.phone;
            }
        }
    }
    
    if (!phoneNumber) {
        alert('Número de telefone é obrigatório.');
        return;
    }
    
    // Close the new call modal
    const newCallModal = bootstrap.Modal.getInstance(document.getElementById('new-call-modal'));
    newCallModal.hide();
    
    // Populate the active call modal
    document.getElementById('active-call-lead-name').textContent = leadName;
    document.getElementById('active-call-lead-company').textContent = leadCompany;
    document.getElementById('active-call-lead-phone').textContent = phoneNumber;
    
    // Reset call timer
    document.getElementById('call-timer').textContent = '00:00';
    
    // Show the active call modal
    const activeCallModal = new bootstrap.Modal(document.getElementById('active-call-modal'));
    activeCallModal.show();
    
    // Start the call timer
    startCallTimer();
    
    // Reset the new call form
    document.getElementById('call-lead-select').value = '';
    document.getElementById('call-phone').value = '';
}

/**
 * Start the call timer
 */
function startCallTimer() {
    let seconds = 0;
    const timerElement = document.getElementById('call-timer');
    
    // Clear any existing timer
    if (window.callTimerInterval) {
        clearInterval(window.callTimerInterval);
    }
    
    // Start a new timer
    window.callTimerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
        
        // Simulate call transcript and AI insights after a few seconds
        if (seconds === 5) {
            updateCallTranscript('Você: Olá, estou ligando da VoiceAI. Gostaria de falar sobre nossa solução de prospecção por voz.');
        } else if (seconds === 10) {
            updateCallTranscript('Cliente: Bom dia! Pode me explicar mais sobre isso?');
        } else if (seconds === 15) {
            updateCallTranscript('Você: Claro! Nossa plataforma utiliza inteligência artificial para automatizar o processo de prospecção de leads por telefone.');
            updateCallInsights();
        } else if (seconds === 20) {
            updateCallTranscript('Cliente: Interessante. Quais são os principais benefícios?');
        } else if (seconds === 25) {
            updateCallTranscript('Você: Aumento de eficiência, qualificação automática de leads e integração com seu CRM existente.');
        } else if (seconds === 30) {
            updateCallTranscript('Cliente: E quanto custa?');
            updateCallInsights(true);
        }
    }, 1000);
    
    // Set up end call button
    document.getElementById('end-call-btn').addEventListener('click', () => {
        clearInterval(window.callTimerInterval);
        
        const callModal = bootstrap.Modal.getInstance(document.getElementById('active-call-modal'));
        callModal.hide();
        
        // Reset call transcript and insights
        document.getElementById('call-transcript').innerHTML = '<p><em>A transcrição aparecerá aqui durante a chamada...</em></p>';
        document.getElementById('ai-lead-score').textContent = '--';
        document.getElementById('ai-pain-points').textContent = '--';
        document.getElementById('ai-objections').textContent = '--';
        document.getElementById('ai-next-steps').textContent = '--';
    });
}

/**
 * Update call transcript
 * @param {string} message - Message to add to transcript
 */
function updateCallTranscript(message) {
    const transcriptElement = document.getElementById('call-transcript');
    
    // Remove placeholder text if present
    if (transcriptElement.innerHTML.includes('A transcrição aparecerá aqui')) {
        transcriptElement.innerHTML = '';
    }
    
    // Add new message
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    transcriptElement.appendChild(messageElement);
    
    // Scroll to bottom
    transcriptElement.scrollTop = transcriptElement.scrollHeight;
}

/**
 * Update call AI insights
 * @param {boolean} improved - Whether insights have improved
 */
function updateCallInsights(improved = false) {
    document.getElementById('ai-lead-score').textContent = improved ? '78' : '65';
    document.getElementById('ai-pain-points').textContent = improved ? 'Eficiência, Custo, Automação' : 'Eficiência';
    document.getElementById('ai-objections').textContent = improved ? 'Preço' : 'Nenhuma ainda';
    document.getElementById('ai-next-steps').textContent = improved ? 'Agendar demonstração, Enviar proposta' : 'Explicar benefícios';
}

/**
 * Set up authentication forms event listeners
 */
function setupAuthEvents() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // In a real app, you would send a request to your API
            // For demonstration, we'll simulate a successful login
            if (email && password) {
                // Simulate JWT token
                const token = 'demo_token_' + Date.now();
                localStorage.setItem('token', token);
                
                initApp();
            } else {
                alert('Por favor, preencha todos os campos.');
            }
        });
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            // Simple validation
            if (!name || !email || !password || !confirmPassword) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }
            
            // In a real app, you would send a request to your API
            // For demonstration, we'll simulate a successful registration
            const token = 'demo_token_' + Date.now();
            localStorage.setItem('token', token);
            
            initApp();
        });
    }
    
    // Register link
    const registerLink = document.getElementById('register-link');
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterPage();
        });
    }
    
    // Login link
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginPage();
        });
    }
    
    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Funcionalidade de recuperação de senha será implementada em breve.');
        });
    }
}

/**
 * Show the login page
 */
function showLoginPage() {
    // Hide app container
    document.querySelector('.app-container').style.display = 'none';
    
    // Hide register page
    document.getElementById('register-page').style.display = 'none';
    
    // Show login page
    document.getElementById('login-page').style.display = 'flex';
    
    // Reset form
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').reset();
    }
}

/**
 * Show the register page
 */
function showRegisterPage() {
    // Hide app container
    document.querySelector('.app-container').style.display = 'none';
    
    // Hide login page
    document.getElementById('login-page').style.display = 'none';
    
    // Show register page
    document.getElementById('register-page').style.display = 'flex';
    
    // Reset form
    if (document.getElementById('register-form')) {
        document.getElementById('register-form').reset();
    }
}

/**
 * Log out the user
 */
function logout() {
    // Clear token
    localStorage.removeItem('token');
    
    // Show login page
    showLoginPage();
}

/**
 * Initialize the onboarding component
 */
function initializeOnboarding() {
    // Import onboarding module using ESM approach
    import('/js/components/Onboarding/OnboardingController.js')
        .then(module => {
            // Initialize the onboarding controller
            setTimeout(() => {
                module.initOnboardingController();
            }, 1000); // Delay to ensure UI is ready
        })
        .catch(error => {
            console.warn('Onboarding component not found or not properly loaded:', error);
        });
}
