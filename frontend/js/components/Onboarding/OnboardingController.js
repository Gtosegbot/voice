/**
 * Onboarding Controller Component
 * Controls onboarding flow and user guidance for the VoiceAI platform
 */

// Import dependencies
import { InteractiveTutorial } from './InteractiveTutorial.js';
import { initQuickSetup } from './QuickSetup.js';

/**
 * Initialize the Onboarding Controller
 */
function initOnboardingController() {
    checkUserOnboardingStatus();
    initInteractiveTutorial();
    setupOnboardingEvents();
    
    // If url has #quick-setup, load the quick setup wizard
    if (window.location.hash.includes('quick-setup')) {
        setTimeout(() => {
            initQuickSetup();
        }, 500);
    }
}

/**
 * Check user onboarding status
 */
function checkUserOnboardingStatus() {
    // Check if user is new or returning
    const isFirstLogin = !localStorage.getItem('hasCompletedOnboarding');
    
    if (isFirstLogin) {
        // Set as new user
        localStorage.setItem('isNewUser', 'true');
        
        // Show welcome message for new users
        setTimeout(() => {
            showWelcomeMessage();
        }, 1000);
    } else {
        localStorage.setItem('isNewUser', 'false');
    }
}

/**
 * Show welcome message for new users
 */
function showWelcomeMessage() {
    // Create welcome overlay
    const overlay = document.createElement('div');
    overlay.id = 'welcome-overlay';
    overlay.className = 'onboarding-overlay';
    overlay.innerHTML = `
        <div class="onboarding-overlay-content">
            <div class="onboarding-overlay-header">
                <img src="/img/logo-large.svg" alt="VoiceAI Logo" height="60">
            </div>
            <div class="onboarding-overlay-body text-center">
                <h2>Bem-vindo à Plataforma de Prospecção por Voz!</h2>
                <p class="lead">Estamos felizes em tê-lo conosco. Vamos começar a transformar sua prospecção com IA.</p>
                
                <div class="welcome-options mt-4">
                    <div class="row g-4">
                        <div class="col-md-4">
                            <div class="welcome-option" data-option="tour">
                                <div class="welcome-option-icon">
                                    <i class="fas fa-route fa-3x"></i>
                                </div>
                                <h4>Tour Guiado</h4>
                                <p>Conheça as principais funcionalidades da plataforma com nosso assistente de IA.</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="welcome-option" data-option="setup">
                                <div class="welcome-option-icon">
                                    <i class="fas fa-cogs fa-3x"></i>
                                </div>
                                <h4>Configuração Rápida</h4>
                                <p>Configure sua primeira campanha e comece a prospectar em minutos.</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="welcome-option" data-option="explore">
                                <div class="welcome-option-icon">
                                    <i class="fas fa-compass fa-3x"></i>
                                </div>
                                <h4>Explorar Sozinho</h4>
                                <p>Pule o tour e explore a plataforma no seu próprio ritmo.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="onboarding-overlay-footer">
                <small class="text-muted">Você pode acessar o tour novamente a qualquer momento pelo menu de ajuda.</small>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add event listeners to welcome options
    const welcomeOptions = document.querySelectorAll('.welcome-option');
    welcomeOptions.forEach(option => {
        option.addEventListener('click', () => {
            handleWelcomeOption(option.getAttribute('data-option'));
            document.getElementById('welcome-overlay').remove();
        });
    });
    
    // Add CSS for welcome overlay
    const style = document.createElement('style');
    style.textContent = `
        .onboarding-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .onboarding-overlay-content {
            background: white;
            border-radius: 8px;
            max-width: 800px;
            width: 90%;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            animation: onboardingFadeIn 0.5s ease-out;
        }
        
        @keyframes onboardingFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .onboarding-overlay-header {
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: center;
        }
        
        .onboarding-overlay-body {
            padding: 30px;
        }
        
        .onboarding-overlay-footer {
            padding: 15px 20px;
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
            border-radius: 0 0 8px 8px;
            text-align: center;
        }
        
        .welcome-option {
            padding: 20px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            height: 100%;
        }
        
        .welcome-option:hover {
            border-color: #4e73df;
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .welcome-option-icon {
            margin-bottom: 15px;
            color: #4e73df;
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Handle welcome option selection
 * @param {string} option - Selected welcome option
 */
function handleWelcomeOption(option) {
    switch (option) {
        case 'tour':
            // Start interactive tutorial
            startTutorial('full');
            break;
        case 'setup':
            // Redirect to quick setup wizard
            window.location.hash = '#quick-setup';
            break;
        case 'explore':
            // Just mark onboarding as completed
            localStorage.setItem('hasCompletedOnboarding', 'true');
            localStorage.setItem('isNewUser', 'false');
            break;
    }
}

/**
 * Start tutorial with specified type
 * @param {string} tutorialType - Type of tutorial to start
 */
function startTutorial(tutorialType) {
    // In a real app, this would call the InteractiveTutorial methods
    const tutorialOptions = document.createElement('div');
    tutorialOptions.innerHTML = `
        <div class="tutorial-option">
            <input type="radio" name="tutorial-option" id="${tutorialType}-tutorial" value="${tutorialType}" checked>
        </div>
    `;
    document.body.appendChild(tutorialOptions);
    
    // Trigger tutorial start
    document.getElementById(`${tutorialType}-tutorial`).click();
    
    // Clean up
    setTimeout(() => {
        tutorialOptions.remove();
    }, 100);
}

/**
 * Setup onboarding events
 */
function setupOnboardingEvents() {
    // Add Help menu item for accessing tutorial
    const userMenu = document.querySelector('.user-menu .dropdown-menu');
    
    if (userMenu) {
        const helpMenuItem = document.createElement('a');
        helpMenuItem.href = '#';
        helpMenuItem.className = 'dropdown-item';
        helpMenuItem.id = 'help-menu-item';
        helpMenuItem.innerHTML = '<i class="fas fa-question-circle me-2"></i> Ajuda e Tutorial';
        
        userMenu.appendChild(helpMenuItem);
        
        helpMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            showTutorialWelcome();
        });
    }
}

/**
 * Show tutorial welcome menu
 */
function showTutorialWelcome() {
    // Create tutorial welcome overlay
    const overlay = document.createElement('div');
    overlay.id = 'tutorial-welcome-overlay';
    overlay.className = 'onboarding-overlay';
    overlay.innerHTML = `
        <div class="onboarding-overlay-content">
            <div class="onboarding-overlay-header">
                <img src="/img/logo-large.svg" alt="VoiceAI Logo" height="60">
            </div>
            <div class="onboarding-overlay-body text-center">
                <h3>Tutorial e Ajuda</h3>
                <p>Escolha o tipo de ajuda que você precisa:</p>
                
                <div class="tutorial-options mt-4">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="tutorial-option" data-tutorial="full">
                                <div class="tutorial-option-icon">
                                    <i class="fas fa-map fa-2x"></i>
                                </div>
                                <h5>Tour Completo</h5>
                                <p>Conheça todas as funcionalidades da plataforma.</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="tutorial-option" data-tutorial="campaign">
                                <div class="tutorial-option-icon">
                                    <i class="fas fa-bullhorn fa-2x"></i>
                                </div>
                                <h5>Criar Campanha</h5>
                                <p>Aprenda a criar e gerenciar campanhas de prospecção.</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="tutorial-option" data-tutorial="aiModel">
                                <div class="tutorial-option-icon">
                                    <i class="fas fa-robot fa-2x"></i>
                                </div>
                                <h5>Modelos de IA</h5>
                                <p>Personalize os modelos de IA para suas necessidades.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="onboarding-overlay-footer">
                <button class="btn btn-light" id="close-tutorial-welcome-btn">Fechar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add CSS for tutorial options
    const style = document.createElement('style');
    style.textContent = `
        .tutorial-options {
            margin: 20px 0;
        }
        
        .tutorial-option {
            padding: 20px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            height: 100%;
        }
        
        .tutorial-option:hover {
            border-color: #4e73df;
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .tutorial-option-icon {
            margin-bottom: 15px;
            color: #4e73df;
        }
    `;
    
    document.head.appendChild(style);
    
    // Add event listeners
    const tutorialOptions = document.querySelectorAll('.tutorial-option');
    tutorialOptions.forEach(option => {
        option.addEventListener('click', () => {
            const tutorialType = option.getAttribute('data-tutorial');
            startTutorial(tutorialType);
            document.getElementById('tutorial-welcome-overlay').remove();
            document.head.removeChild(style);
        });
    });
    
    // Add close button event
    document.getElementById('close-tutorial-welcome-btn').addEventListener('click', () => {
        document.getElementById('tutorial-welcome-overlay').remove();
        document.head.removeChild(style);
    });
}

// Export functions
export { 
    initOnboardingController, 
    showWelcomeMessage,
    showTutorialWelcome,
    startTutorial
};