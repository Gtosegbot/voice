/**
 * Interactive Tutorial Component
 * Provides step-by-step guided tours for different features of the VoiceAI platform
 */

// Tutorial step configurations
const tutorials = {
    // Full platform tour
    full: [
        {
            element: '.app-container',
            title: 'Bem-vindo à Plataforma VoiceAI',
            content: 'Vamos conhecer as principais funcionalidades da nossa plataforma.',
            position: 'center'
        },
        {
            element: '.sidebar',
            title: 'Menu de Navegação',
            content: 'Acesse facilmente todas as seções da plataforma.',
            position: 'right'
        },
        {
            element: '#sidebar-dashboard',
            title: 'Dashboard',
            content: 'Visualize métricas e indicadores de desempenho da sua equipe.',
            position: 'right'
        },
        {
            element: '#sidebar-leads',
            title: 'Gerenciamento de Leads',
            content: 'Gerencie seus contatos, importe listas e organize seus leads.',
            position: 'right'
        },
        {
            element: '#sidebar-conversations',
            title: 'Conversas',
            content: 'Acesse o histórico de todas as interações com seus leads.',
            position: 'right'
        },
        {
            element: '#sidebar-analytics',
            title: 'Análises e Relatórios',
            content: 'Obtenha insights valiosos sobre suas campanhas de prospecção.',
            position: 'right'
        },
        {
            element: '#sidebar-campaigns',
            title: 'Campanhas',
            content: 'Crie e gerencie campanhas de prospecção automatizada.',
            position: 'right'
        },
        {
            element: '#sidebar-ai-models',
            title: 'Modelos de IA',
            content: 'Personalize os modelos de IA usados em suas campanhas.',
            position: 'right'
        },
        {
            element: '#new-call-btn',
            title: 'Iniciar Ligação',
            content: 'Clique aqui para fazer uma nova ligação para um lead.',
            position: 'bottom'
        },
        {
            element: '.user-menu',
            title: 'Menu do Usuário',
            content: 'Acesse suas configurações e opções da conta.',
            position: 'bottom'
        },
        {
            element: '.app-container',
            title: 'Pronto para Começar!',
            content: 'Agora você conhece as principais seções da plataforma. Vamos começar a prospectar?',
            position: 'center'
        }
    ],
    
    // Campaign creation tour
    campaign: [
        {
            element: '#sidebar-campaigns',
            title: 'Campanhas de Prospecção',
            content: 'Vamos aprender a criar uma nova campanha de prospecção.',
            position: 'right'
        },
        {
            element: '#new-campaign-btn',
            title: 'Nova Campanha',
            content: 'Clique aqui para criar uma nova campanha.',
            position: 'bottom'
        },
        {
            element: '#campaign-name',
            title: 'Nome da Campanha',
            content: 'Dê um nome descritivo para sua campanha.',
            position: 'right'
        },
        {
            element: '#campaign-description',
            title: 'Descrição',
            content: 'Adicione uma descrição para entender melhor o objetivo da campanha.',
            position: 'right'
        },
        {
            element: '#campaign-leads-file',
            title: 'Importar Leads',
            content: 'Carregue um arquivo CSV com seus contatos para prospecção.',
            position: 'right'
        },
        {
            element: '#campaign-ai-profile',
            title: 'Perfil de IA',
            content: 'Escolha o perfil de IA que melhor se adapta ao seu negócio.',
            position: 'right'
        },
        {
            element: '#campaign-schedule',
            title: 'Agendamento',
            content: 'Define quando suas ligações automáticas serão realizadas.',
            position: 'right'
        },
        {
            element: '#save-campaign-btn',
            title: 'Salvar Campanha',
            content: 'Clique para salvar e iniciar sua campanha.',
            position: 'bottom'
        }
    ],
    
    // AI model customization tour
    aiModel: [
        {
            element: '#sidebar-ai-models',
            title: 'Personalização de IA',
            content: 'Vamos aprender a personalizar os modelos de IA para sua empresa.',
            position: 'right'
        },
        {
            element: '#voice-models-tab',
            title: 'Modelos de Voz',
            content: 'Escolha e personalize as vozes usadas nas ligações automáticas.',
            position: 'top'
        },
        {
            element: '#voice-preview',
            title: 'Prévia de Voz',
            content: 'Ouça como a voz selecionada soa antes de usá-la.',
            position: 'right'
        },
        {
            element: '#script-templates-tab',
            title: 'Templates de Script',
            content: 'Crie e gerencie scripts para diferentes situações de prospecção.',
            position: 'top'
        },
        {
            element: '#ai-behavior-tab',
            title: 'Comportamento da IA',
            content: 'Ajuste como a IA deve se comportar durante conversas.',
            position: 'top'
        },
        {
            element: '#objection-handling',
            title: 'Tratamento de Objeções',
            content: 'Configure como a IA deve responder a objeções comuns.',
            position: 'right'
        },
        {
            element: '#save-ai-settings-btn',
            title: 'Salvar Configurações',
            content: 'Clique para salvar suas personalizações de IA.',
            position: 'bottom'
        }
    ]
};

/**
 * Initialize the Interactive Tutorial
 */
function initInteractiveTutorial() {
    // Create container for tutorial
    if (!document.getElementById('tutorial-container')) {
        const tutorialContainer = document.createElement('div');
        tutorialContainer.id = 'tutorial-container';
        document.body.appendChild(tutorialContainer);
    }
    
    // Set up tutorial event listeners
    setupTutorialEvents();
}

/**
 * Setup tutorial event listeners
 */
function setupTutorialEvents() {
    // Listen for tutorial start events
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id && e.target.id.endsWith('-tutorial')) {
            const tutorialType = e.target.id.replace('-tutorial', '');
            if (tutorials[tutorialType]) {
                startTutorial(tutorialType);
            }
        }
    });
}

/**
 * Start a tutorial of specified type
 * @param {string} type - Type of tutorial to start
 */
function startTutorial(type) {
    if (!tutorials[type]) {
        console.error(`Tutorial type '${type}' not found.`);
        return;
    }
    
    const steps = tutorials[type];
    let currentStep = 0;
    
    // Show first step
    showTutorialStep(steps[currentStep], () => {
        currentStep++;
        if (currentStep < steps.length) {
            showTutorialStep(steps[currentStep], arguments.callee);
        } else {
            endTutorial();
        }
    });
}

/**
 * Show a tutorial step
 * @param {Object} step - Tutorial step configuration
 * @param {Function} nextCallback - Callback to execute when moving to next step
 */
function showTutorialStep(step, nextCallback) {
    const tutorialContainer = document.getElementById('tutorial-container');
    
    // Create tutorial overlay
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    document.body.appendChild(overlay);
    
    // Create tutorial tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tutorial-tooltip';
    
    // Set position
    if (step.position === 'center') {
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
    } else {
        // Get target element position
        const targetElement = document.querySelector(step.element);
        if (!targetElement) {
            console.warn(`Target element ${step.element} not found. Skipping step.`);
            if (nextCallback) nextCallback();
            return;
        }
        
        const rect = targetElement.getBoundingClientRect();
        
        // Highlight target element
        const highlight = document.createElement('div');
        highlight.className = 'tutorial-highlight';
        highlight.style.top = `${rect.top - 5}px`;
        highlight.style.left = `${rect.left - 5}px`;
        highlight.style.width = `${rect.width + 10}px`;
        highlight.style.height = `${rect.height + 10}px`;
        document.body.appendChild(highlight);
        
        // Position tooltip based on position setting
        switch (step.position) {
            case 'right':
                tooltip.style.top = `${rect.top + rect.height / 2}px`;
                tooltip.style.left = `${rect.right + 20}px`;
                tooltip.style.transform = 'translateY(-50%)';
                break;
            case 'left':
                tooltip.style.top = `${rect.top + rect.height / 2}px`;
                tooltip.style.left = `${rect.left - 20}px`;
                tooltip.style.transform = 'translate(-100%, -50%)';
                break;
            case 'top':
                tooltip.style.top = `${rect.top - 20}px`;
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.transform = 'translate(-50%, -100%)';
                break;
            case 'bottom':
                tooltip.style.top = `${rect.bottom + 20}px`;
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.transform = 'translateX(-50%)';
                break;
        }
    }
    
    // Set tooltip content
    tooltip.innerHTML = `
        <div class="tutorial-tooltip-header">
            <h4>${step.title}</h4>
        </div>
        <div class="tutorial-tooltip-body">
            <p>${step.content}</p>
        </div>
        <div class="tutorial-tooltip-footer">
            <button id="tutorial-next-btn" class="btn btn-primary btn-sm">Próximo</button>
            <button id="tutorial-skip-btn" class="btn btn-light btn-sm ms-2">Pular Tutorial</button>
        </div>
    `;
    
    document.body.appendChild(tooltip);
    
    // Add CSS for tutorial elements
    const style = document.createElement('style');
    style.textContent = `
        .tutorial-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
        }
        
        .tutorial-highlight {
            position: fixed;
            z-index: 9999;
            border-radius: 4px;
            box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.5);
            animation: tutorialPulse 1.5s infinite;
        }
        
        @keyframes tutorialPulse {
            0% { box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(78, 115, 223, 0.7); }
            70% { box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.5), 0 0 0 10px rgba(78, 115, 223, 0); }
            100% { box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(78, 115, 223, 0); }
        }
        
        .tutorial-tooltip {
            position: fixed;
            z-index: 10000;
            background: white;
            border-radius: 6px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            max-width: 300px;
            animation: tooltipFadeIn 0.3s ease-out;
        }
        
        @keyframes tooltipFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .tutorial-tooltip-header {
            padding: 12px 15px;
            background: #f8f9fa;
            border-radius: 6px 6px 0 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .tutorial-tooltip-header h4 {
            margin: 0;
            font-size: 16px;
            color: #4e73df;
        }
        
        .tutorial-tooltip-body {
            padding: 12px 15px;
        }
        
        .tutorial-tooltip-body p {
            margin: 0;
            font-size: 14px;
        }
        
        .tutorial-tooltip-footer {
            padding: 10px 15px;
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
            border-radius: 0 0 6px 6px;
            display: flex;
            justify-content: flex-end;
        }
    `;
    
    document.head.appendChild(style);
    
    // Add event listeners
    document.getElementById('tutorial-next-btn').addEventListener('click', () => {
        // Clean up
        document.body.removeChild(overlay);
        document.body.removeChild(tooltip);
        const highlight = document.querySelector('.tutorial-highlight');
        if (highlight) document.body.removeChild(highlight);
        document.head.removeChild(style);
        
        // Call next callback
        if (nextCallback) nextCallback();
    });
    
    document.getElementById('tutorial-skip-btn').addEventListener('click', () => {
        // Clean up all tutorial elements
        document.body.removeChild(overlay);
        document.body.removeChild(tooltip);
        const highlight = document.querySelector('.tutorial-highlight');
        if (highlight) document.body.removeChild(highlight);
        document.head.removeChild(style);
        
        // End tutorial
        endTutorial();
    });
}

/**
 * End the current tutorial
 */
function endTutorial() {
    // Mark tutorial as complete in user preferences
    localStorage.setItem('hasCompletedTutorial', 'true');
    
    // Show completion message
    const completionMessage = document.createElement('div');
    completionMessage.className = 'tutorial-completion-message';
    completionMessage.innerHTML = `
        <div class="tutorial-completion-content">
            <div class="tutorial-completion-icon">
                <i class="fas fa-check-circle fa-3x text-success"></i>
            </div>
            <h4>Tutorial Concluído!</h4>
            <p>Você está pronto para começar a usar a plataforma VoiceAI. Em caso de dúvidas, acesse o menu de ajuda.</p>
            <button id="tutorial-done-btn" class="btn btn-primary">Começar a Usar</button>
        </div>
    `;
    
    document.body.appendChild(completionMessage);
    
    // Add CSS for completion message
    const style = document.createElement('style');
    style.textContent = `
        .tutorial-completion-message {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .tutorial-completion-content {
            background: white;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            max-width: 400px;
            animation: completionFadeIn 0.5s ease-out;
        }
        
        @keyframes completionFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .tutorial-completion-icon {
            margin-bottom: 20px;
        }
        
        .tutorial-completion-content h4 {
            margin-bottom: 15px;
        }
        
        .tutorial-completion-content p {
            margin-bottom: 20px;
        }
    `;
    
    document.head.appendChild(style);
    
    // Add event listener to done button
    document.getElementById('tutorial-done-btn').addEventListener('click', () => {
        document.body.removeChild(completionMessage);
        document.head.removeChild(style);
    });
}

// Expose functions to window object instead of using ES6 exports
window.initInteractiveTutorial = initInteractiveTutorial;
window.startTutorial = startTutorial;