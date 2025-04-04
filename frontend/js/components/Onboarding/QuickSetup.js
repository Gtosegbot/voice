/**
 * Quick Setup Component
 * Provides wizard-like interface for initial platform setup
 */

// Use apiRequest from window object instead of importing

/**
 * Initialize the Quick Setup wizard
 */
function initQuickSetup() {
    // Create wizard container if not exists
    if (!document.getElementById('quick-setup-container')) {
        createQuickSetupInterface();
    }
    
    // Set up event listeners
    setupQuickSetupEvents();
    
    // Show first step
    showSetupStep(1);
}

/**
 * Create Quick Setup interface
 */
function createQuickSetupInterface() {
    const container = document.createElement('div');
    container.id = 'quick-setup-container';
    container.className = 'quick-setup-container';
    
    container.innerHTML = `
        <div class="quick-setup-header">
            <h2>Configuração Rápida</h2>
            <p class="lead">Configure sua plataforma VoiceAI em poucos passos</p>
            <div class="setup-progress">
                <div class="setup-step active" data-step="1">
                    <div class="setup-step-number">1</div>
                    <div class="setup-step-label">Perfil</div>
                </div>
                <div class="setup-step" data-step="2">
                    <div class="setup-step-number">2</div>
                    <div class="setup-step-label">Integrações</div>
                </div>
                <div class="setup-step" data-step="3">
                    <div class="setup-step-number">3</div>
                    <div class="setup-step-label">Empresa</div>
                </div>
                <div class="setup-step" data-step="4">
                    <div class="setup-step-number">4</div>
                    <div class="setup-step-label">Concluir</div>
                </div>
            </div>
        </div>
        
        <div class="quick-setup-content">
            <!-- Step 1: Profile Setup -->
            <div class="setup-step-content" id="setup-step-1">
                <h3>Seu Perfil</h3>
                <p>Vamos configurar seu perfil na plataforma.</p>
                
                <form id="profile-setup-form" class="setup-form">
                    <div class="form-group mb-3">
                        <label for="profile-first-name">Primeiro Nome</label>
                        <input type="text" id="profile-first-name" class="form-control" required>
                    </div>
                    
                    <div class="form-group mb-3">
                        <label for="profile-last-name">Sobrenome</label>
                        <input type="text" id="profile-last-name" class="form-control" required>
                    </div>
                    
                    <div class="form-group mb-3">
                        <label for="profile-phone">Telefone</label>
                        <input type="tel" id="profile-phone" class="form-control" required>
                    </div>
                    
                    <div class="form-group mb-3">
                        <label for="profile-role">Cargo na Empresa</label>
                        <input type="text" id="profile-role" class="form-control" required>
                    </div>
                </form>
            </div>
            
            <!-- Step 2: Integrations Setup -->
            <div class="setup-step-content" id="setup-step-2" style="display: none;">
                <h3>Integrações</h3>
                <p>Configure as integrações com seus serviços existentes.</p>
                
                <form id="integrations-setup-form" class="setup-form">
                    <div class="form-group mb-4">
                        <label>Integrações CRM</label>
                        <div class="integration-option mb-2">
                            <input type="radio" name="crm-integration" id="crm-none" value="none" checked>
                            <label for="crm-none">
                                <span class="integration-icon"><i class="fas fa-times-circle"></i></span>
                                <span class="integration-name">Nenhum</span>
                            </label>
                        </div>
                        <div class="integration-option mb-2">
                            <input type="radio" name="crm-integration" id="crm-salesforce" value="salesforce">
                            <label for="crm-salesforce">
                                <span class="integration-icon"><i class="fas fa-cloud"></i></span>
                                <span class="integration-name">Salesforce</span>
                            </label>
                        </div>
                        <div class="integration-option mb-2">
                            <input type="radio" name="crm-integration" id="crm-hubspot" value="hubspot">
                            <label for="crm-hubspot">
                                <span class="integration-icon"><i class="fas fa-h-square"></i></span>
                                <span class="integration-name">HubSpot</span>
                            </label>
                        </div>
                        <div class="integration-option mb-2">
                            <input type="radio" name="crm-integration" id="crm-pipedrive" value="pipedrive">
                            <label for="crm-pipedrive">
                                <span class="integration-icon"><i class="fas fa-project-diagram"></i></span>
                                <span class="integration-name">Pipedrive</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group mb-4">
                        <label>Integrações de Comunicação</label>
                        <div class="integration-option mb-2">
                            <input type="checkbox" name="comm-integration" id="comm-whatsapp" value="whatsapp">
                            <label for="comm-whatsapp">
                                <span class="integration-icon"><i class="fab fa-whatsapp"></i></span>
                                <span class="integration-name">WhatsApp</span>
                            </label>
                        </div>
                        <div class="integration-option mb-2">
                            <input type="checkbox" name="comm-integration" id="comm-sms" value="sms">
                            <label for="comm-sms">
                                <span class="integration-icon"><i class="fas fa-sms"></i></span>
                                <span class="integration-name">SMS (Twilio)</span>
                            </label>
                        </div>
                        <div class="integration-option mb-2">
                            <input type="checkbox" name="comm-integration" id="comm-email" value="email">
                            <label for="comm-email">
                                <span class="integration-icon"><i class="fas fa-envelope"></i></span>
                                <span class="integration-name">Email Marketing</span>
                            </label>
                        </div>
                    </div>
                </form>
            </div>
            
            <!-- Step 3: Company Setup -->
            <div class="setup-step-content" id="setup-step-3" style="display: none;">
                <h3>Sua Empresa</h3>
                <p>Configure as informações da sua empresa.</p>
                
                <form id="company-setup-form" class="setup-form">
                    <div class="form-group mb-3">
                        <label for="company-name">Nome da Empresa</label>
                        <input type="text" id="company-name" class="form-control" required>
                    </div>
                    
                    <div class="form-group mb-3">
                        <label for="company-industry">Segmento</label>
                        <select id="company-industry" class="form-select" required>
                            <option value="">Selecione um segmento</option>
                            <option value="technology">Tecnologia</option>
                            <option value="finance">Finanças</option>
                            <option value="healthcare">Saúde</option>
                            <option value="education">Educação</option>
                            <option value="retail">Varejo</option>
                            <option value="manufacturing">Indústria</option>
                            <option value="services">Serviços</option>
                            <option value="other">Outro</option>
                        </select>
                    </div>
                    
                    <div class="form-group mb-3">
                        <label for="company-size">Tamanho da Empresa</label>
                        <select id="company-size" class="form-select" required>
                            <option value="">Selecione o tamanho</option>
                            <option value="1-10">1-10 funcionários</option>
                            <option value="11-50">11-50 funcionários</option>
                            <option value="51-200">51-200 funcionários</option>
                            <option value="201-500">201-500 funcionários</option>
                            <option value="501-1000">501-1000 funcionários</option>
                            <option value="1001+">Mais de 1000 funcionários</option>
                        </select>
                    </div>
                    
                    <div class="form-group mb-3">
                        <label for="company-website">Website</label>
                        <input type="url" id="company-website" class="form-control">
                    </div>
                </form>
            </div>
            
            <!-- Step 4: Completion -->
            <div class="setup-step-content" id="setup-step-4" style="display: none;">
                <div class="setup-completion">
                    <div class="setup-completion-icon">
                        <i class="fas fa-check-circle text-success fa-5x"></i>
                    </div>
                    <h3>Configuração Concluída!</h3>
                    <p>Sua plataforma VoiceAI está pronta para uso. Agora você pode começar a prospectar com IA.</p>
                    
                    <div class="setup-next-steps">
                        <h4>Próximos Passos Sugeridos:</h4>
                        <ul>
                            <li><a href="#" id="create-campaign-link"><i class="fas fa-bullhorn me-2"></i> Criar sua primeira campanha</a></li>
                            <li><a href="#" id="import-leads-link"><i class="fas fa-users me-2"></i> Importar seus leads</a></li>
                            <li><a href="#" id="customize-ai-link"><i class="fas fa-robot me-2"></i> Personalizar modelos de IA</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="quick-setup-footer">
            <button id="setup-back-btn" class="btn btn-light" style="display: none;">Voltar</button>
            <button id="setup-next-btn" class="btn btn-primary">Avançar</button>
            <button id="setup-finish-btn" class="btn btn-success" style="display: none;">Concluir</button>
        </div>
    `;
    
    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
        .quick-setup-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .quick-setup-header {
            padding: 20px 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            text-align: center;
        }
        
        .setup-progress {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding: 0 20px;
            position: relative;
        }
        
        .setup-progress::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 20px;
            right: 20px;
            height: 2px;
            background: #dee2e6;
            z-index: 1;
        }
        
        .setup-step {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 25%;
        }
        
        .setup-step-number {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: white;
            border: 2px solid #dee2e6;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            font-weight: bold;
            color: #6c757d;
            transition: all 0.3s;
        }
        
        .setup-step.active .setup-step-number,
        .setup-step.completed .setup-step-number {
            background: #4e73df;
            border-color: #4e73df;
            color: white;
        }
        
        .setup-step.completed .setup-step-number::after {
            content: '✓';
        }
        
        .setup-step-label {
            font-size: 12px;
            color: #6c757d;
        }
        
        .setup-step.active .setup-step-label {
            color: #4e73df;
            font-weight: bold;
        }
        
        .quick-setup-content {
            padding: 30px;
            min-height: 400px;
        }
        
        .quick-setup-footer {
            padding: 15px 30px;
            background: #f8f9fa;
            border-top: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
        }
        
        .integration-option {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .integration-option input {
            margin-right: 10px;
        }
        
        .integration-option label {
            display: flex;
            align-items: center;
            cursor: pointer;
        }
        
        .integration-icon {
            width: 30px;
            height: 30px;
            background: #f8f9fa;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
        }
        
        .setup-completion {
            text-align: center;
            padding: 20px 0;
        }
        
        .setup-completion-icon {
            margin-bottom: 20px;
        }
        
        .setup-next-steps {
            margin-top: 30px;
            text-align: left;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .setup-next-steps ul {
            list-style: none;
            padding: 0;
        }
        
        .setup-next-steps li {
            margin-bottom: 10px;
        }
        
        .setup-next-steps a {
            display: inline-block;
            padding: 8px 12px;
            background: #f8f9fa;
            border-radius: 5px;
            text-decoration: none;
            color: #4e73df;
            transition: all 0.2s;
        }
        
        .setup-next-steps a:hover {
            background: #e2e6ea;
        }
    `;
    
    document.head.appendChild(style);
    
    // Append to container
    const contentPage = document.getElementById('dashboard-page');
    if (contentPage) {
        contentPage.appendChild(container);
    } else {
        document.body.appendChild(container);
    }
}

/**
 * Setup event listeners for Quick Setup
 */
function setupQuickSetupEvents() {
    // Next button
    const nextBtn = document.getElementById('setup-next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const currentStep = getCurrentStep();
            if (validateStep(currentStep)) {
                showSetupStep(currentStep + 1);
            }
        });
    }
    
    // Back button
    const backBtn = document.getElementById('setup-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            const currentStep = getCurrentStep();
            showSetupStep(currentStep - 1);
        });
    }
    
    // Finish button
    const finishBtn = document.getElementById('setup-finish-btn');
    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            completeSetup();
        });
    }
    
    // Quick links in completion step
    const createCampaignLink = document.getElementById('create-campaign-link');
    if (createCampaignLink) {
        createCampaignLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = 'campaigns';
            // Clean up setup wizard
            const container = document.getElementById('quick-setup-container');
            if (container) {
                container.remove();
            }
        });
    }
    
    const importLeadsLink = document.getElementById('import-leads-link');
    if (importLeadsLink) {
        importLeadsLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = 'leads';
            // Clean up setup wizard
            const container = document.getElementById('quick-setup-container');
            if (container) {
                container.remove();
            }
        });
    }
    
    const customizeAiLink = document.getElementById('customize-ai-link');
    if (customizeAiLink) {
        customizeAiLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = 'ai-models';
            // Clean up setup wizard
            const container = document.getElementById('quick-setup-container');
            if (container) {
                container.remove();
            }
        });
    }
}

/**
 * Show a specific step in the setup wizard
 * @param {number} stepNumber - Step number to show
 */
function showSetupStep(stepNumber) {
    // Update progress indicator
    const steps = document.querySelectorAll('.setup-step');
    steps.forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        step.classList.remove('active');
        if (stepNum < stepNumber) {
            step.classList.add('completed');
        } else if (stepNum === stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('completed');
        }
    });
    
    // Hide all step content
    const stepContents = document.querySelectorAll('.setup-step-content');
    stepContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show current step content
    const currentStepContent = document.getElementById(`setup-step-${stepNumber}`);
    if (currentStepContent) {
        currentStepContent.style.display = 'block';
    }
    
    // Update buttons
    const backBtn = document.getElementById('setup-back-btn');
    const nextBtn = document.getElementById('setup-next-btn');
    const finishBtn = document.getElementById('setup-finish-btn');
    
    if (stepNumber === 1) {
        backBtn.style.display = 'none';
    } else {
        backBtn.style.display = 'block';
    }
    
    if (stepNumber === 4) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        finishBtn.style.display = 'none';
    }
}

/**
 * Get current step number
 * @returns {number} Current step number
 */
function getCurrentStep() {
    const activeStep = document.querySelector('.setup-step.active');
    if (activeStep) {
        return parseInt(activeStep.getAttribute('data-step'));
    }
    return 1;
}

/**
 * Validate current step inputs
 * @param {number} stepNumber - Step number to validate
 * @returns {boolean} Whether the step is valid
 */
function validateStep(stepNumber) {
    switch (stepNumber) {
        case 1:
            // Profile validation
            const firstName = document.getElementById('profile-first-name').value;
            const lastName = document.getElementById('profile-last-name').value;
            const phone = document.getElementById('profile-phone').value;
            
            if (!firstName || !lastName || !phone) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return false;
            }
            return true;
            
        case 2:
            // Integrations - no validation needed
            return true;
            
        case 3:
            // Company validation
            const companyName = document.getElementById('company-name').value;
            const industry = document.getElementById('company-industry').value;
            
            if (!companyName || !industry) {
                alert('Por favor, preencha os campos obrigatórios de empresa.');
                return false;
            }
            return true;
            
        default:
            return true;
    }
}

/**
 * Complete the setup process
 */
function completeSetup() {
    // Save all settings to storage or API
    const profileData = {
        firstName: document.getElementById('profile-first-name').value,
        lastName: document.getElementById('profile-last-name').value,
        phone: document.getElementById('profile-phone').value,
        role: document.getElementById('profile-role').value
    };
    
    const integrationData = {
        crm: document.querySelector('input[name="crm-integration"]:checked').value,
        communication: Array.from(document.querySelectorAll('input[name="comm-integration"]:checked')).map(el => el.value)
    };
    
    const companyData = {
        name: document.getElementById('company-name').value,
        industry: document.getElementById('company-industry').value,
        size: document.getElementById('company-size').value,
        website: document.getElementById('company-website').value
    };
    
    // Create payload
    const setupData = {
        profile: profileData,
        integrations: integrationData,
        company: companyData,
        completed: true
    };
    
    // Log data for development
    console.log('Quick Setup Data:', setupData);
    
    // In a real app, send this to the API
    // apiRequest('POST', '/api/onboarding/setup', setupData)
    
    // Mark onboarding as complete
    localStorage.setItem('hasCompletedOnboarding', 'true');
    localStorage.setItem('isNewUser', 'false');
}

// Expose functions to window object instead of using ES6 exports
window.initQuickSetup = initQuickSetup;