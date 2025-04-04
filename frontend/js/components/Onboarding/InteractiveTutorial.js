/**
 * Interactive Onboarding Tutorial Component
 * This component provides a step-by-step AI-guided tutorial for new users
 */

/**
 * Initialize the Interactive Tutorial
 */
function initInteractiveTutorial() {
    initTutorialData();
    setupTutorialEvents();
}

/**
 * Initialize tutorial data and state
 */
function initTutorialData() {
    // Store tutorial state in session storage to persist across page refreshes
    if (!sessionStorage.getItem('tutorialActive')) {
        sessionStorage.setItem('tutorialActive', 'false');
        sessionStorage.setItem('tutorialStep', '0');
        sessionStorage.setItem('tutorialComplete', 'false');
    }
}

/**
 * Setup tutorial events
 */
function setupTutorialEvents() {
    // Listen for tutorial triggers
    document.addEventListener('DOMContentLoaded', () => {
        // Check if user is new and should see the tutorial welcome
        const isNewUser = localStorage.getItem('isNewUser') === 'true';
        const tutorialComplete = sessionStorage.getItem('tutorialComplete') === 'true';
        
        if (isNewUser && !tutorialComplete) {
            setTimeout(() => {
                showTutorialWelcome();
            }, 1000);
        }
        
        // Add triggers to help menu
        const helpMenuItem = document.getElementById('help-menu-item');
        if (helpMenuItem) {
            helpMenuItem.addEventListener('click', (e) => {
                e.preventDefault();
                showTutorialWelcome();
            });
        }
    });
    
    // Handle page navigation and resume tutorial if needed
    window.addEventListener('hashchange', () => {
        const tutorialActive = sessionStorage.getItem('tutorialActive') === 'true';
        if (tutorialActive) {
            resumeTutorial();
        }
    });
}

/**
 * Show tutorial welcome overlay
 */
function showTutorialWelcome() {
    // Create welcome overlay
    const overlay = document.createElement('div');
    overlay.id = 'tutorial-welcome-overlay';
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = `
        <div class="tutorial-overlay-content">
            <div class="tutorial-overlay-header">
                <img src="/img/ai-assistant.png" alt="AI Assistant" class="ai-assistant-avatar">
                <h3>Bem-vindo à Plataforma de Prospecção por Voz!</h3>
            </div>
            <div class="tutorial-overlay-body">
                <p>Olá! Sou seu assistente de IA e estou aqui para guiá-lo pelo sistema. 
                   Gostaria de começar um tour interativo para conhecer as principais funcionalidades?</p>
                
                <div class="tutorial-options">
                    <div class="tutorial-option">
                        <input type="radio" name="tutorial-option" id="full-tutorial" value="full" checked>
                        <label for="full-tutorial">
                            <i class="fas fa-graduation-cap"></i>
                            <span>Tour Completo</span>
                            <small>Aprenda todos os recursos (~10 min)</small>
                        </label>
                    </div>
                    
                    <div class="tutorial-option">
                        <input type="radio" name="tutorial-option" id="quick-tutorial" value="quick">
                        <label for="quick-tutorial">
                            <i class="fas fa-bolt"></i>
                            <span>Tour Rápido</span>
                            <small>Apenas recursos essenciais (~4 min)</small>
                        </label>
                    </div>
                    
                    <div class="tutorial-option">
                        <input type="radio" name="tutorial-option" id="specific-feature" value="specific">
                        <label for="specific-feature">
                            <i class="fas fa-list-alt"></i>
                            <span>Funcionalidade Específica</span>
                            <small>Escolha o que aprender</small>
                        </label>
                    </div>
                </div>
                
                <div id="specific-features-dropdown" style="display: none;">
                    <select id="feature-selector" class="form-select mt-3">
                        <option value="">Selecione uma funcionalidade</option>
                        <option value="campaigns">Gerenciamento de Campanhas</option>
                        <option value="calls">Chamadas e Prospecção</option>
                        <option value="leads">Gerenciamento de Leads</option>
                        <option value="analytics">Analytics e Relatórios</option>
                        <option value="ai-models">Modelos de IA</option>
                        <option value="integrations">Integrações</option>
                    </select>
                </div>
            </div>
            <div class="tutorial-overlay-footer">
                <button class="btn btn-outline-secondary" id="tutorial-skip-btn">Pular Tutorial</button>
                <button class="btn btn-primary" id="tutorial-start-btn">Começar Tour</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add event listeners
    document.getElementById('tutorial-skip-btn').addEventListener('click', () => {
        sessionStorage.setItem('tutorialComplete', 'true');
        document.getElementById('tutorial-welcome-overlay').remove();
    });
    
    document.getElementById('tutorial-start-btn').addEventListener('click', () => {
        const tutorialType = document.querySelector('input[name="tutorial-option"]:checked').value;
        startTutorial(tutorialType);
        document.getElementById('tutorial-welcome-overlay').remove();
    });
    
    // Show/hide specific features dropdown
    document.getElementById('specific-feature').addEventListener('change', () => {
        document.getElementById('specific-features-dropdown').style.display = 'block';
    });
    
    document.getElementById('full-tutorial').addEventListener('change', () => {
        document.getElementById('specific-features-dropdown').style.display = 'none';
    });
    
    document.getElementById('quick-tutorial').addEventListener('change', () => {
        document.getElementById('specific-features-dropdown').style.display = 'none';
    });
    
    // Add CSS for tutorial overlay
    const style = document.createElement('style');
    style.textContent = `
        .tutorial-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .tutorial-overlay-content {
            background: white;
            border-radius: 8px;
            max-width: 600px;
            width: 90%;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            animation: tutorialFadeIn 0.3s ease-out;
        }
        
        @keyframes tutorialFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .tutorial-overlay-header {
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            border-radius: 8px 8px 0 0;
            display: flex;
            align-items: center;
        }
        
        .ai-assistant-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 15px;
            object-fit: cover;
        }
        
        .tutorial-overlay-body {
            padding: 20px;
        }
        
        .tutorial-overlay-footer {
            padding: 15px 20px;
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
            border-radius: 0 0 8px 8px;
            display: flex;
            justify-content: space-between;
        }
        
        .tutorial-options {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 15px;
        }
        
        .tutorial-option {
            position: relative;
        }
        
        .tutorial-option input[type="radio"] {
            position: absolute;
            opacity: 0;
        }
        
        .tutorial-option label {
            display: flex;
            align-items: center;
            padding: 15px;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .tutorial-option label:hover {
            background: #f8f9fa;
        }
        
        .tutorial-option input[type="radio"]:checked + label {
            border-color: #4e73df;
            background: rgba(78, 115, 223, 0.1);
        }
        
        .tutorial-option i {
            font-size: 20px;
            margin-right: 15px;
            color: #4e73df;
        }
        
        .tutorial-option span {
            font-weight: bold;
        }
        
        .tutorial-option small {
            margin-left: auto;
            color: #6c757d;
        }
        
        .tutorial-highlight {
            position: relative;
            z-index: 10000;
            box-shadow: 0 0 0 4px rgba(78, 115, 223, 0.8);
            border-radius: 4px;
            animation: tutorialPulse 1.5s infinite;
        }
        
        @keyframes tutorialPulse {
            0% { box-shadow: 0 0 0 4px rgba(78, 115, 223, 0.4); }
            50% { box-shadow: 0 0 0 8px rgba(78, 115, 223, 0.2); }
            100% { box-shadow: 0 0 0 4px rgba(78, 115, 223, 0.4); }
        }
        
        .tutorial-tooltip {
            position: absolute;
            background: white;
            border-radius: 8px;
            padding: 15px;
            width: 300px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            animation: tutorialFadeIn 0.3s ease-out;
        }
        
        .tutorial-tooltip-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .tutorial-tooltip-avatar {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin-right: 10px;
        }
        
        .tutorial-tooltip-step {
            margin-left: auto;
            font-size: 12px;
            color: #6c757d;
        }
        
        .tutorial-tooltip-content {
            margin-bottom: 15px;
        }
        
        .tutorial-tooltip-footer {
            display: flex;
            justify-content: space-between;
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Start the tutorial
 * @param {string} tutorialType - Type of tutorial to start
 */
function startTutorial(tutorialType) {
    // Set tutorial as active
    sessionStorage.setItem('tutorialActive', 'true');
    sessionStorage.setItem('tutorialStep', '0');
    
    // Get tutorial steps based on type
    let tutorialSteps = [];
    
    if (tutorialType === 'full') {
        tutorialSteps = getFullTutorialSteps();
    } else if (tutorialType === 'quick') {
        tutorialSteps = getQuickTutorialSteps();
    } else if (tutorialType === 'specific') {
        const selectedFeature = document.getElementById('feature-selector').value;
        tutorialSteps = getFeatureSpecificSteps(selectedFeature);
    }
    
    // Store steps in session storage
    sessionStorage.setItem('tutorialSteps', JSON.stringify(tutorialSteps));
    
    // Start first step or redirect to the correct page
    startTutorialStep();
}

/**
 * Resume tutorial after page navigation
 */
function resumeTutorial() {
    // Check if we have steps stored and tutorial is active
    if (sessionStorage.getItem('tutorialActive') === 'true') {
        const currentStep = parseInt(sessionStorage.getItem('tutorialStep') || '0');
        const tutorialSteps = JSON.parse(sessionStorage.getItem('tutorialSteps') || '[]');
        
        if (tutorialSteps.length > currentStep) {
            // Check if we're on the correct page for the current step
            const currentHash = window.location.hash || '#dashboard';
            const requiredPage = tutorialSteps[currentStep].page;
            
            if (currentHash === requiredPage) {
                // We're on the right page, show the step
                setTimeout(() => {
                    showTutorialStep(tutorialSteps[currentStep], currentStep, tutorialSteps.length);
                }, 500); // Small delay to ensure page elements are loaded
            } else {
                // We need to redirect to the correct page
                window.location.hash = requiredPage;
            }
        }
    }
}

/**
 * Start or continue the tutorial steps
 */
function startTutorialStep() {
    const currentStep = parseInt(sessionStorage.getItem('tutorialStep') || '0');
    const tutorialSteps = JSON.parse(sessionStorage.getItem('tutorialSteps') || '[]');
    
    if (tutorialSteps.length > currentStep) {
        // Check if we're on the correct page for the current step
        const currentHash = window.location.hash || '#dashboard';
        const requiredPage = tutorialSteps[currentStep].page;
        
        if (currentHash === requiredPage) {
            // We're on the right page, show the step
            setTimeout(() => {
                showTutorialStep(tutorialSteps[currentStep], currentStep, tutorialSteps.length);
            }, 500); // Small delay to ensure page elements are loaded
        } else {
            // We need to redirect to the correct page
            window.location.hash = requiredPage;
        }
    } else {
        // Tutorial complete
        completeTutorial();
    }
}

/**
 * Show a specific tutorial step
 * @param {Object} step - The step to show
 * @param {number} currentStepIndex - Current step index
 * @param {number} totalSteps - Total number of steps
 */
function showTutorialStep(step, currentStepIndex, totalSteps) {
    // Remove any existing highlights and tooltips
    clearTutorialHighlights();
    
    // Find the target element
    const targetElement = document.querySelector(step.selector);
    
    if (!targetElement) {
        console.error(`Tutorial target element not found: ${step.selector}`);
        // Skip to next step
        goToNextStep();
        return;
    }
    
    // Highlight the target element
    targetElement.classList.add('tutorial-highlight');
    
    // Create a tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'tutorial-tooltip';
    tooltip.className = 'tutorial-tooltip';
    
    // Position the tooltip based on the target element and specified position
    positionTooltip(tooltip, targetElement, step.position || 'bottom');
    
    // Add content to the tooltip
    tooltip.innerHTML = `
        <div class="tutorial-tooltip-header">
            <img src="/img/ai-assistant.png" alt="AI Assistant" class="tutorial-tooltip-avatar">
            <h5 class="mb-0">Assistente de IA</h5>
            <span class="tutorial-tooltip-step">Passo ${currentStepIndex + 1} de ${totalSteps}</span>
        </div>
        <div class="tutorial-tooltip-content">
            ${step.content}
        </div>
        <div class="tutorial-tooltip-footer">
            ${currentStepIndex > 0 ? 
              '<button class="btn btn-sm btn-outline-secondary" id="tutorial-prev-btn">Anterior</button>' : 
              '<button class="btn btn-sm btn-outline-secondary" id="tutorial-exit-btn">Sair</button>'}
            ${currentStepIndex < totalSteps - 1 ? 
              '<button class="btn btn-sm btn-primary" id="tutorial-next-btn">Próximo</button>' : 
              '<button class="btn btn-sm btn-success" id="tutorial-finish-btn">Concluir</button>'}
        </div>
    `;
    
    document.body.appendChild(tooltip);
    
    // Add event listeners
    const nextBtn = document.getElementById('tutorial-next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', goToNextStep);
    }
    
    const prevBtn = document.getElementById('tutorial-prev-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', goToPrevStep);
    }
    
    const exitBtn = document.getElementById('tutorial-exit-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', exitTutorial);
    }
    
    const finishBtn = document.getElementById('tutorial-finish-btn');
    if (finishBtn) {
        finishBtn.addEventListener('click', completeTutorial);
    }
    
    // Add interaction for interactive steps
    if (step.interactive) {
        // Monitor for the expected interaction
        const interactionHandler = () => {
            // When the expected interaction occurs, proceed to next step
            targetElement.removeEventListener(step.interactionEvent, interactionHandler);
            goToNextStep();
        };
        
        targetElement.addEventListener(step.interactionEvent, interactionHandler);
    }
    
    // Add scroll into view if the element is not visible
    if (!isElementInViewport(targetElement)) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

/**
 * Position tooltip relative to target element
 * @param {HTMLElement} tooltip - The tooltip element
 * @param {HTMLElement} target - The target element
 * @param {string} position - Desired position (top, bottom, left, right)
 */
function positionTooltip(tooltip, target, position) {
    const targetRect = target.getBoundingClientRect();
    const tooltipWidth = 300; // Fixed width for tooltip
    
    // Set initial position to absolute
    tooltip.style.position = 'absolute';
    
    // Position based on specified direction
    switch (position) {
        case 'top':
            tooltip.style.bottom = `${window.innerHeight - targetRect.top + 10}px`;
            tooltip.style.left = `${targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)}px`;
            break;
        case 'bottom':
            tooltip.style.top = `${targetRect.bottom + 10}px`;
            tooltip.style.left = `${targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)}px`;
            break;
        case 'left':
            tooltip.style.right = `${window.innerWidth - targetRect.left + 10}px`;
            tooltip.style.top = `${targetRect.top + (targetRect.height / 2) - 80}px`;
            break;
        case 'right':
            tooltip.style.left = `${targetRect.right + 10}px`;
            tooltip.style.top = `${targetRect.top + (targetRect.height / 2) - 80}px`;
            break;
        default:
            // Default to bottom if position is not recognized
            tooltip.style.top = `${targetRect.bottom + 10}px`;
            tooltip.style.left = `${targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)}px`;
    }
    
    // Make sure tooltip stays within viewport
    const tooltipRect = tooltip.getBoundingClientRect();
    
    if (tooltipRect.left < 10) {
        tooltip.style.left = '10px';
    } else if (tooltipRect.right > window.innerWidth - 10) {
        tooltip.style.left = `${window.innerWidth - tooltipWidth - 10}px`;
    }
    
    if (tooltipRect.top < 10) {
        tooltip.style.top = '10px';
    } else if (tooltipRect.bottom > window.innerHeight - 10) {
        tooltip.style.top = `${window.innerHeight - tooltipRect.height - 10}px`;
    }
}

/**
 * Go to the next tutorial step
 */
function goToNextStep() {
    const currentStep = parseInt(sessionStorage.getItem('tutorialStep') || '0');
    const tutorialSteps = JSON.parse(sessionStorage.getItem('tutorialSteps') || '[]');
    
    if (tutorialSteps.length > currentStep + 1) {
        sessionStorage.setItem('tutorialStep', (currentStep + 1).toString());
        startTutorialStep();
    } else {
        completeTutorial();
    }
}

/**
 * Go to the previous tutorial step
 */
function goToPrevStep() {
    const currentStep = parseInt(sessionStorage.getItem('tutorialStep') || '0');
    
    if (currentStep > 0) {
        sessionStorage.setItem('tutorialStep', (currentStep - 1).toString());
        startTutorialStep();
    }
}

/**
 * Exit the tutorial
 */
function exitTutorial() {
    clearTutorialHighlights();
    sessionStorage.setItem('tutorialActive', 'false');
    
    // Show exit confirmation
    const overlay = document.createElement('div');
    overlay.id = 'tutorial-exit-overlay';
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = `
        <div class="tutorial-overlay-content">
            <div class="tutorial-overlay-header">
                <img src="/img/ai-assistant.png" alt="AI Assistant" class="ai-assistant-avatar">
                <h3>Sair do Tutorial?</h3>
            </div>
            <div class="tutorial-overlay-body">
                <p>Você tem certeza que deseja sair do tutorial? Você pode retomá-lo a qualquer momento pelo menu de ajuda.</p>
            </div>
            <div class="tutorial-overlay-footer">
                <button class="btn btn-outline-secondary" id="tutorial-resume-btn">Continuar Tutorial</button>
                <button class="btn btn-primary" id="tutorial-confirm-exit-btn">Confirmar Saída</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('tutorial-resume-btn').addEventListener('click', () => {
        document.getElementById('tutorial-exit-overlay').remove();
        sessionStorage.setItem('tutorialActive', 'true');
        startTutorialStep();
    });
    
    document.getElementById('tutorial-confirm-exit-btn').addEventListener('click', () => {
        document.getElementById('tutorial-exit-overlay').remove();
        sessionStorage.setItem('tutorialComplete', 'false');
    });
}

/**
 * Complete the tutorial
 */
function completeTutorial() {
    clearTutorialHighlights();
    sessionStorage.setItem('tutorialActive', 'false');
    sessionStorage.setItem('tutorialComplete', 'true');
    
    // Show completion message
    const overlay = document.createElement('div');
    overlay.id = 'tutorial-complete-overlay';
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = `
        <div class="tutorial-overlay-content">
            <div class="tutorial-overlay-header">
                <img src="/img/ai-assistant.png" alt="AI Assistant" class="ai-assistant-avatar">
                <h3>Tutorial Concluído!</h3>
            </div>
            <div class="tutorial-overlay-body text-center">
                <div class="my-4">
                    <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                </div>
                <p>Parabéns! Você concluiu o tutorial interativo da Plataforma de Prospecção por Voz.</p>
                <p>Agora você está pronto para começar a usar o sistema de forma eficiente.</p>
                
                <div class="mt-4">
                    <h5>O que você quer fazer agora?</h5>
                    <div class="d-flex justify-content-center gap-3 mt-3">
                        <button class="btn btn-outline-primary" id="tutorial-setup-campaign-btn">
                            <i class="fas fa-bullhorn"></i><br>
                            Configurar Campanha
                        </button>
                        <button class="btn btn-outline-primary" id="tutorial-import-leads-btn">
                            <i class="fas fa-file-import"></i><br>
                            Importar Leads
                        </button>
                        <button class="btn btn-outline-primary" id="tutorial-explore-ai-btn">
                            <i class="fas fa-robot"></i><br>
                            Explorar Modelos de IA
                        </button>
                    </div>
                </div>
            </div>
            <div class="tutorial-overlay-footer">
                <button class="btn btn-primary" id="tutorial-finish-close-btn">Fechar e Começar a Usar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('tutorial-finish-close-btn').addEventListener('click', () => {
        document.getElementById('tutorial-complete-overlay').remove();
    });
    
    document.getElementById('tutorial-setup-campaign-btn').addEventListener('click', () => {
        document.getElementById('tutorial-complete-overlay').remove();
        window.location.hash = '#campaigns/new';
    });
    
    document.getElementById('tutorial-import-leads-btn').addEventListener('click', () => {
        document.getElementById('tutorial-complete-overlay').remove();
        window.location.hash = '#leads/import';
    });
    
    document.getElementById('tutorial-explore-ai-btn').addEventListener('click', () => {
        document.getElementById('tutorial-complete-overlay').remove();
        window.location.hash = '#ai-models';
    });
}

/**
 * Clear all tutorial highlights and tooltips
 */
function clearTutorialHighlights() {
    // Remove highlight class from all elements
    const highlightedElements = document.querySelectorAll('.tutorial-highlight');
    highlightedElements.forEach(element => {
        element.classList.remove('tutorial-highlight');
    });
    
    // Remove tooltip if it exists
    const tooltip = document.getElementById('tutorial-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} Whether the element is in viewport
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
    );
}

/**
 * Get full tutorial steps
 * @returns {Array} Array of tutorial steps
 */
function getFullTutorialSteps() {
    return [
        // Dashboard introduction
        {
            page: '#dashboard',
            selector: '#dashboard-overview',
            position: 'bottom',
            content: `<p>Bem-vindo ao <strong>Dashboard</strong>! Aqui você pode ver uma visão geral do seu desempenho e atividades recentes.</p>
                     <p>Vamos conhecer as principais funcionalidades da plataforma.</p>`
        },
        {
            page: '#dashboard',
            selector: '#sidebar-menu',
            position: 'right',
            content: `<p>Este é o <strong>Menu de Navegação</strong>.</p>
                     <p>Use-o para acessar diferentes áreas da plataforma, como campanhas, leads, chamadas e relatórios.</p>`
        },
        {
            page: '#dashboard',
            selector: '#quick-stats',
            position: 'bottom',
            content: `<p>Aqui estão suas <strong>Estatísticas Rápidas</strong>.</p>
                     <p>Veja rapidamente o desempenho das suas campanhas, leads qualificados e chamadas realizadas.</p>`
        },
        {
            page: '#dashboard',
            selector: '#recent-calls',
            position: 'top',
            content: `<p>Esta seção mostra suas <strong>Chamadas Recentes</strong>.</p>
                     <p>Acompanhe as conversas mais recentes e seus resultados.</p>`
        },
        
        // Campaigns section
        {
            page: '#campaigns',
            selector: '#campaigns-list',
            position: 'bottom',
            content: `<p>Nesta página você gerencia suas <strong>Campanhas de Prospecção</strong>.</p>
                     <p>Aqui você pode criar, visualizar e gerenciar todas as suas campanhas de chamadas.</p>`
        },
        {
            page: '#campaigns',
            selector: '#create-campaign-btn',
            position: 'bottom',
            content: `<p>Clique aqui para <strong>Criar uma Nova Campanha</strong>.</p>
                     <p>Você pode definir o nome, objetivo, público-alvo e scripts de IA para suas campanhas.</p>`,
            interactive: true,
            interactionEvent: 'click'
        },
        {
            page: '#campaigns/new',
            selector: '#campaign-name-input',
            position: 'bottom',
            content: `<p>Dê um <strong>Nome Descritivo</strong> para sua campanha.</p>
                     <p>Use um nome que ajude a identificar facilmente o objetivo da campanha.</p>`
        },
        {
            page: '#campaigns/new',
            selector: '#campaign-target-section',
            position: 'bottom',
            content: `<p>Defina o <strong>Público-Alvo</strong> da sua campanha.</p>
                     <p>Você pode selecionar leads existentes ou importar novos contatos.</p>`
        },
        {
            page: '#campaigns/new',
            selector: '#ai-script-section',
            position: 'bottom',
            content: `<p>Configure o <strong>Script de IA</strong> que será usado nas chamadas.</p>
                     <p>Você pode selecionar modelos prontos ou criar scripts personalizados.</p>`
        },
        
        // Leads management
        {
            page: '#leads',
            selector: '#leads-table',
            position: 'bottom',
            content: `<p>Esta é a página de <strong>Gerenciamento de Leads</strong>.</p>
                     <p>Aqui você pode visualizar, filtrar e gerenciar todos os seus contatos e leads.</p>`
        },
        {
            page: '#leads',
            selector: '#import-leads-btn',
            position: 'bottom',
            content: `<p>Clique aqui para <strong>Importar Leads</strong> de arquivos CSV ou Excel.</p>
                     <p>Você pode importar grandes listas de contatos para suas campanhas.</p>`
        },
        {
            page: '#leads',
            selector: '#lead-filters',
            position: 'bottom',
            content: `<p>Use estes <strong>Filtros</strong> para encontrar leads específicos.</p>
                     <p>Você pode filtrar por status, fonte, data de criação e muito mais.</p>`
        },
        
        // Calls section
        {
            page: '#calls',
            selector: '#calls-list',
            position: 'bottom',
            content: `<p>Esta é a página de <strong>Chamadas</strong>.</p>
                     <p>Aqui você pode ver o histórico de chamadas, ouvir gravações e analisar conversas.</p>`
        },
        {
            page: '#calls',
            selector: '#make-call-btn',
            position: 'bottom',
            content: `<p>Clique aqui para <strong>Iniciar uma Nova Chamada</strong>.</p>
                     <p>Você pode escolher um lead específico ou deixar o sistema selecionar o próximo contato mais adequado.</p>`
        },
        {
            page: '#calls',
            selector: '#auto-dialer-btn',
            position: 'bottom',
            content: `<p>O <strong>Auto-Dialer</strong> permite fazer chamadas automaticamente.</p>
                     <p>O sistema liga para múltiplos contatos seguindo as prioridades da campanha.</p>`
        },
        
        // AI Models
        {
            page: '#ai-models',
            selector: '#ai-models-list',
            position: 'bottom',
            content: `<p>Esta é a página de <strong>Modelos de IA</strong>.</p>
                     <p>Aqui você pode configurar e personalizar os modelos de IA usados nas chamadas.</p>`
        },
        {
            page: '#ai-models',
            selector: '#voice-models-section',
            position: 'bottom',
            content: `<p>Na seção de <strong>Modelos de Voz</strong>, você pode escolher e personalizar as vozes usadas pelo sistema.</p>
                     <p>O sistema usa ElevenLabs para gerar vozes de alta qualidade e naturais.</p>`
        },
        {
            page: '#ai-models',
            selector: '#conversation-models-section',
            position: 'bottom',
            content: `<p>Os <strong>Modelos de Conversação</strong> determinam como a IA responde durante as chamadas.</p>
                     <p>Você pode ajustar parâmetros como tom, personalidade e estilo de comunicação.</p>`
        },
        
        // Analytics
        {
            page: '#analytics',
            selector: '#analytics-dashboard',
            position: 'bottom',
            content: `<p>Esta é a página de <strong>Analytics</strong>.</p>
                     <p>Aqui você pode analisar o desempenho das campanhas, conversões e qualidade das chamadas.</p>`
        },
        {
            page: '#analytics',
            selector: '#conversion-metrics',
            position: 'bottom',
            content: `<p>As <strong>Métricas de Conversão</strong> mostram o desempenho da sua prospecção.</p>
                     <p>Acompanhe taxas de atendimento, conversão e eficácia das campanhas.</p>`
        },
        {
            page: '#analytics',
            selector: '#voice-analytics-btn',
            position: 'bottom',
            content: `<p>O <strong>Voice Analytics</strong> analisa as gravações para extrair insights.</p>
                     <p>Identifique padrões, sentimentos e oportunidades de melhoria nas conversas.</p>`,
            interactive: true,
            interactionEvent: 'click'
        },
        {
            page: '#voice-analytics',
            selector: '#sentiment-analysis',
            position: 'bottom',
            content: `<p>A <strong>Análise de Sentimento</strong> mostra como os contatos estão reagindo às chamadas.</p>
                     <p>Identifique quais abordagens geram reações mais positivas.</p>`
        },
        
        // Settings
        {
            page: '#settings',
            selector: '#settings-panel',
            position: 'bottom',
            content: `<p>Esta é a página de <strong>Configurações</strong>.</p>
                     <p>Aqui você pode personalizar a plataforma e gerenciar integrações.</p>`
        },
        {
            page: '#settings',
            selector: '#integrations-section',
            position: 'bottom',
            content: `<p>Na seção de <strong>Integrações</strong>, você pode conectar a plataforma com outros serviços.</p>
                     <p>Integre com CRMs, ferramentas de marketing, e-mail e muito mais.</p>`
        },
        {
            page: '#settings',
            selector: '#notification-settings',
            position: 'bottom',
            content: `<p>Configure suas <strong>Notificações</strong> para manter-se informado.</p>
                     <p>Você pode receber alertas por e-mail, SMS ou no navegador.</p>`
        },
        
        // Final step
        {
            page: '#dashboard',
            selector: '#help-menu-item',
            position: 'right',
            content: `<p>Parabéns! Você completou o tour pela plataforma.</p>
                     <p>Lembre-se que você pode acessar este tutorial novamente a qualquer momento pelo <strong>Menu de Ajuda</strong>.</p>
                     <p>Vamos concluir o tutorial agora.</p>`
        }
    ];
}

/**
 * Get quick tutorial steps (shorter version)
 * @returns {Array} Array of tutorial steps
 */
function getQuickTutorialSteps() {
    return [
        // Dashboard introduction
        {
            page: '#dashboard',
            selector: '#dashboard-overview',
            position: 'bottom',
            content: `<p>Bem-vindo à <strong>Plataforma de Prospecção por Voz</strong>!</p>
                     <p>Vamos fazer um tour rápido pelas funcionalidades essenciais.</p>`
        },
        {
            page: '#dashboard',
            selector: '#sidebar-menu',
            position: 'right',
            content: `<p>Use o <strong>Menu de Navegação</strong> para acessar as diferentes áreas do sistema.</p>`
        },
        
        // Campaigns section
        {
            page: '#campaigns',
            selector: '#campaigns-list',
            position: 'bottom',
            content: `<p>Aqui você gerencia suas <strong>Campanhas de Prospecção</strong>.</p>
                     <p>Crie campanhas para organizar seus esforços de prospecção.</p>`
        },
        {
            page: '#campaigns',
            selector: '#create-campaign-btn',
            position: 'bottom',
            content: `<p>Clique aqui para <strong>Criar uma Nova Campanha</strong>.</p>`,
            interactive: true,
            interactionEvent: 'click'
        },
        {
            page: '#campaigns/new',
            selector: '#ai-script-section',
            position: 'bottom',
            content: `<p>Configure o <strong>Script de IA</strong> que será usado nas chamadas.</p>
                     <p>Este é o coração da plataforma - a IA que conversa com seus leads.</p>`
        },
        
        // Leads management
        {
            page: '#leads',
            selector: '#import-leads-btn',
            position: 'bottom',
            content: `<p>Use este botão para <strong>Importar Leads</strong> para suas campanhas.</p>
                     <p>Você pode importar contatos de arquivos CSV.</p>`
        },
        
        // Calls section
        {
            page: '#calls',
            selector: '#make-call-btn',
            position: 'bottom',
            content: `<p>Clique aqui para <strong>Iniciar uma Nova Chamada</strong>.</p>
                     <p>A IA irá conduzir a conversa seguindo o script configurado.</p>`
        },
        
        // AI Models
        {
            page: '#ai-models',
            selector: '#voice-models-section',
            position: 'bottom',
            content: `<p>Personalize as <strong>Vozes</strong> e <strong>Personalidades</strong> da IA.</p>
                     <p>Escolha vozes naturais e defina como a IA deve se comportar nas chamadas.</p>`
        },
        
        // Analytics
        {
            page: '#analytics',
            selector: '#conversion-metrics',
            position: 'bottom',
            content: `<p>Acompanhe o <strong>Desempenho</strong> das suas campanhas.</p>
                     <p>Analise resultados e otimize suas estratégias de prospecção.</p>`
        },
        
        // Final step
        {
            page: '#dashboard',
            selector: '#help-menu-item',
            position: 'right',
            content: `<p>Pronto! Você conheceu as funcionalidades essenciais da plataforma.</p>
                     <p>Você pode acessar este tutorial novamente pelo <strong>Menu de Ajuda</strong> a qualquer momento.</p>`
        }
    ];
}

/**
 * Get feature-specific tutorial steps
 * @param {string} feature - The feature to focus on
 * @returns {Array} Array of tutorial steps
 */
function getFeatureSpecificSteps(feature) {
    switch (feature) {
        case 'campaigns':
            return [
                {
                    page: '#campaigns',
                    selector: '#campaigns-list',
                    position: 'bottom',
                    content: `<p>Esta é a página de <strong>Gerenciamento de Campanhas</strong>.</p>
                             <p>As campanhas organizam seus esforços de prospecção em grupos focados.</p>`
                },
                {
                    page: '#campaigns',
                    selector: '#create-campaign-btn',
                    position: 'bottom',
                    content: `<p>Clique aqui para <strong>Criar uma Nova Campanha</strong>.</p>`,
                    interactive: true,
                    interactionEvent: 'click'
                },
                {
                    page: '#campaigns/new',
                    selector: '#campaign-details-section',
                    position: 'bottom',
                    content: `<p>Defina os <strong>Detalhes da Campanha</strong> como nome, período e objetivos.</p>`
                },
                {
                    page: '#campaigns/new',
                    selector: '#campaign-target-section',
                    position: 'bottom',
                    content: `<p>Selecione o <strong>Público-Alvo</strong> da campanha.</p>
                             <p>Você pode selecionar leads existentes ou importar novos.</p>`
                },
                {
                    page: '#campaigns/new',
                    selector: '#ai-script-section',
                    position: 'bottom',
                    content: `<p>Configure o <strong>Script de IA</strong> que será usado nas chamadas.</p>
                             <p>Este script determina como a IA vai interagir com os leads.</p>`
                },
                {
                    page: '#campaigns/new',
                    selector: '#schedule-section',
                    position: 'bottom',
                    content: `<p>Defina o <strong>Agendamento</strong> da campanha.</p>
                             <p>Você pode configurar horários ideais para chamar os contatos.</p>`
                },
                {
                    page: '#campaigns',
                    selector: '#campaign-analytics-btn',
                    position: 'bottom',
                    content: `<p>Depois de criar a campanha, você pode acompanhar os <strong>Resultados</strong> em tempo real.</p>
                             <p>Analise métricas de desempenho e otimize a campanha.</p>`
                }
            ];
            
        case 'calls':
            return [
                {
                    page: '#calls',
                    selector: '#calls-list',
                    position: 'bottom',
                    content: `<p>Esta é a página de <strong>Gerenciamento de Chamadas</strong>.</p>
                             <p>Aqui você vê o histórico de chamadas e pode iniciar novas conversas.</p>`
                },
                {
                    page: '#calls',
                    selector: '#make-call-btn',
                    position: 'bottom',
                    content: `<p>Clique aqui para <strong>Iniciar uma Nova Chamada</strong>.</p>
                             <p>Você pode escolher um lead específico ou deixar o sistema selecionar o próximo melhor contato.</p>`
                },
                {
                    page: '#calls',
                    selector: '#auto-dialer-btn',
                    position: 'bottom',
                    content: `<p>O <strong>Auto-Dialer</strong> permite fazer chamadas automaticamente.</p>
                             <p>A IA gere as chamadas enquanto você acompanha e intervém quando necessário.</p>`
                },
                {
                    page: '#calls',
                    selector: '#call-monitor',
                    position: 'bottom',
                    content: `<p>Durante as chamadas, use o <strong>Monitor de Chamadas</strong> para acompanhar em tempo real.</p>
                             <p>Você pode ver a transcrição, análise de sentimento e sugestões de próximos passos.</p>`
                },
                {
                    page: '#calls',
                    selector: '#call-recordings',
                    position: 'bottom',
                    content: `<p>Todas as chamadas são <strong>Gravadas e Transcritas</strong> para análise posterior.</p>
                             <p>Use estas gravações para treinar novos agentes e melhorar scripts.</p>`
                },
                {
                    page: '#calls',
                    selector: '#call-analytics',
                    position: 'bottom',
                    content: `<p>O <strong>Analytics de Chamadas</strong> mostra estatísticas detalhadas.</p>
                             <p>Identifique padrões, pontos de objeção comuns e oportunidades de melhoria.</p>`
                }
            ];
            
        case 'leads':
            return [
                {
                    page: '#leads',
                    selector: '#leads-table',
                    position: 'bottom',
                    content: `<p>Esta é a página de <strong>Gerenciamento de Leads</strong>.</p>
                             <p>Aqui você gerencia todos os seus contatos e prospects.</p>`
                },
                {
                    page: '#leads',
                    selector: '#import-leads-btn',
                    position: 'bottom',
                    content: `<p>Clique aqui para <strong>Importar Leads</strong> de arquivos externos.</p>
                             <p>Você pode importar contatos de CSV, Excel ou CRMs conectados.</p>`
                },
                {
                    page: '#leads',
                    selector: '#lead-filters',
                    position: 'bottom',
                    content: `<p>Use estes <strong>Filtros</strong> para segmentar seus leads.</p>
                             <p>Encontre rapidamente os contatos mais promissores ou que precisam de follow-up.</p>`
                },
                {
                    page: '#leads',
                    selector: '#lead-scoring',
                    position: 'bottom',
                    content: `<p>O <strong>Lead Scoring</strong> classifica automaticamente seus contatos por potencial.</p>
                             <p>Priorize os leads com maior probabilidade de conversão.</p>`
                },
                {
                    page: '#leads',
                    selector: '#lead-details-btn',
                    position: 'bottom',
                    content: `<p>Veja <strong>Detalhes Completos</strong> de cada lead, incluindo histórico de interações.</p>
                             <p>Todas as chamadas, e-mails e notas são registrados em um único lugar.</p>`
                }
            ];
            
        case 'analytics':
            return [
                {
                    page: '#analytics',
                    selector: '#analytics-dashboard',
                    position: 'bottom',
                    content: `<p>Esta é a página de <strong>Analytics</strong>.</p>
                             <p>Aqui você analisa o desempenho das campanhas e identifica oportunidades de melhoria.</p>`
                },
                {
                    page: '#analytics',
                    selector: '#campaign-performance',
                    position: 'bottom',
                    content: `<p>Veja o <strong>Desempenho das Campanhas</strong> com métricas detalhadas.</p>
                             <p>Compare diferentes campanhas e identifique as estratégias mais eficazes.</p>`
                },
                {
                    page: '#analytics',
                    selector: '#conversion-metrics',
                    position: 'bottom',
                    content: `<p>As <strong>Métricas de Conversão</strong> mostram a eficácia das suas campanhas.</p>
                             <p>Acompanhe taxas de atendimento, qualificação e conversão final.</p>`
                },
                {
                    page: '#analytics',
                    selector: '#voice-analytics-btn',
                    position: 'bottom',
                    content: `<p>O <strong>Voice Analytics</strong> analisa profundamente as conversas.</p>
                             <p>Identifique padrões, objeções comuns e oportunidades para melhorar os scripts.</p>`,
                    interactive: true,
                    interactionEvent: 'click'
                },
                {
                    page: '#voice-analytics',
                    selector: '#sentiment-analysis',
                    position: 'bottom',
                    content: `<p>A <strong>Análise de Sentimento</strong> mostra como os contatos reagem durante as chamadas.</p>
                             <p>Identifique pontos de atrito e momentos positivos nas conversas.</p>`
                },
                {
                    page: '#voice-analytics',
                    selector: '#keyword-analysis',
                    position: 'bottom',
                    content: `<p>A <strong>Análise de Palavras-chave</strong> identifica termos importantes nas conversas.</p>
                             <p>Descubra quais termos e frases estão associados a conversões bem-sucedidas.</p>`
                }
            ];
            
        case 'ai-models':
            return [
                {
                    page: '#ai-models',
                    selector: '#ai-models-list',
                    position: 'bottom',
                    content: `<p>Esta é a página de <strong>Modelos de IA</strong>.</p>
                             <p>Aqui você configura os modelos de inteligência artificial usados nas chamadas.</p>`
                },
                {
                    page: '#ai-models',
                    selector: '#voice-models-section',
                    position: 'bottom',
                    content: `<p>Configure <strong>Modelos de Voz</strong> para suas chamadas.</p>
                             <p>Escolha entre diversas vozes realistas, personalize tom e velocidade.</p>`
                },
                {
                    page: '#ai-models',
                    selector: '#voice-clone-btn',
                    position: 'bottom',
                    content: `<p>Você pode <strong>Clonar Vozes</strong> para criar versões digitais de vozes reais.</p>
                             <p>Isso permite uma experiência mais personalizada e consistente.</p>`
                },
                {
                    page: '#ai-models',
                    selector: '#conversation-models-section',
                    position: 'bottom',
                    content: `<p>Os <strong>Modelos de Conversação</strong> definem como a IA responde durante as chamadas.</p>
                             <p>Ajuste parâmetros como tom, personalidade e estilo de comunicação.</p>`
                },
                {
                    page: '#ai-models',
                    selector: '#prompt-templates',
                    position: 'bottom',
                    content: `<p>Crie <strong>Templates de Prompts</strong> para diferentes cenários de chamada.</p>
                             <p>Instruções precisas para a IA resultam em conversas mais naturais e eficazes.</p>`
                },
                {
                    page: '#ai-models',
                    selector: '#model-training',
                    position: 'bottom',
                    content: `<p>Use a seção de <strong>Treinamento de Modelos</strong> para melhorar o desempenho da IA.</p>
                             <p>Forneça exemplos de boas conversas e corrija respostas inadequadas.</p>`
                }
            ];
            
        case 'integrations':
            return [
                {
                    page: '#settings/integrations',
                    selector: '#integrations-panel',
                    position: 'bottom',
                    content: `<p>Esta é a página de <strong>Integrações</strong>.</p>
                             <p>Conecte a plataforma com outros sistemas para maximizar a eficiência.</p>`
                },
                {
                    page: '#settings/integrations',
                    selector: '#crm-integrations',
                    position: 'bottom',
                    content: `<p>Integre com <strong>Sistemas de CRM</strong> para sincronizar dados de contatos.</p>
                             <p>Mantenha leads e histórico de interações atualizados automaticamente.</p>`
                },
                {
                    page: '#settings/integrations',
                    selector: '#telephony-integrations',
                    position: 'bottom',
                    content: `<p>Configure <strong>Integrações de Telefonia</strong> para realizar chamadas.</p>
                             <p>Conecte com sistemas SIP, PBX ou provedores VoIP.</p>`
                },
                {
                    page: '#settings/integrations',
                    selector: '#messaging-integrations',
                    position: 'bottom',
                    content: `<p>As <strong>Integrações de Mensagens</strong> permitem comunicação multicanal.</p>
                             <p>Conecte WhatsApp, SMS e e-mail para follow-ups automáticos.</p>`
                },
                {
                    page: '#settings/integrations',
                    selector: '#api-settings',
                    position: 'bottom',
                    content: `<p>Use nossa <strong>API</strong> para integrar com sistemas personalizados.</p>
                             <p>Desenvolva integrações específicas para seu fluxo de trabalho.</p>`
                }
            ];
            
        default:
            // Default to quick tutorial if feature not recognized
            return getQuickTutorialSteps();
    }
}