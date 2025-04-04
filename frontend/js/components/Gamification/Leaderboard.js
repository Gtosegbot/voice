/**
 * Leaderboard Component for Agent Gamification
 * This component displays the leaderboard, achievements, and performance metrics for agents
 */

/**
 * Initialize the Leaderboard page
 */
function initLeaderboard() {
    renderLeaderboardPage();
    setupLeaderboardEvents();
    loadLeaderboardData();
}

/**
 * Render the Leaderboard page
 */
function renderLeaderboardPage() {
    const leaderboardPage = document.getElementById('leaderboard-page');
    
    leaderboardPage.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="page-title">Gamificação de Desempenho</h1>
            <div>
                <button class="btn btn-outline-primary me-2" id="leaderboard-settings-btn">
                    <i class="fas fa-cog"></i> Configurações
                </button>
                <button class="btn btn-primary" id="refresh-leaderboard-btn">
                    <i class="fas fa-sync-alt"></i> Atualizar
                </button>
            </div>
        </div>
        
        <!-- Time Period Filter -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row align-items-end">
                    <div class="col-md-3">
                        <label for="leaderboard-time-period" class="form-label">Período</label>
                        <select class="form-select" id="leaderboard-time-period">
                            <option value="daily">Hoje</option>
                            <option value="weekly" selected>Esta Semana</option>
                            <option value="monthly">Este Mês</option>
                            <option value="quarterly">Este Trimestre</option>
                            <option value="yearly">Este Ano</option>
                            <option value="all-time">Todo o Histórico</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="leaderboard-team" class="form-label">Equipe</label>
                        <select class="form-select" id="leaderboard-team">
                            <option value="all" selected>Todas as Equipes</option>
                            <!-- Will be populated dynamically -->
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="leaderboard-metric" class="form-label">Métrica Principal</label>
                        <select class="form-select" id="leaderboard-metric">
                            <option value="points" selected>Pontos Totais</option>
                            <option value="calls">Chamadas Realizadas</option>
                            <option value="conversations">Conversas Completadas</option>
                            <option value="leads-qualified">Leads Qualificados</option>
                            <option value="conversion-rate">Taxa de Conversão</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-primary w-100" id="apply-leaderboard-filters-btn">
                            Aplicar Filtros
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Agent Level Info -->
        <div class="card mb-4 bg-gradient-primary text-white">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-3 text-center border-end">
                        <div class="mb-2">
                            <img src="/img/badges/diamond.png" alt="Nível de Agente" class="img-fluid" style="max-height: 80px;" id="current-level-badge">
                        </div>
                        <h4 class="mb-1" id="current-level-title">Prospector Diamante</h4>
                        <p class="mb-0" id="current-level-description">Elite dos prospectores</p>
                    </div>
                    <div class="col-md-3 d-flex flex-column justify-content-center text-center">
                        <h1 class="display-4 mb-0 fw-bold" id="current-points">5,280</h1>
                        <p class="mb-0">Pontos Totais</p>
                    </div>
                    <div class="col-md-3 d-flex flex-column justify-content-center text-center">
                        <div class="mb-2">
                            <span class="h3" id="current-rank">#3</span> <span class="small" id="total-agents">de 22 agentes</span>
                        </div>
                        <p class="mb-0">Sua Posição</p>
                    </div>
                    <div class="col-md-3 d-flex flex-column justify-content-center text-center">
                        <div class="progress mb-2" style="height: 20px;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: 75%;" 
                                id="next-level-progress-bar">75%</div>
                        </div>
                        <p class="mb-0">
                            <span id="points-to-next-level">720</span> pontos para 
                            <span id="next-level-title">Prospector Lendário</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Leaderboard and Recent Achievements -->
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="card h-100">
                    <div class="card-header bg-transparent">
                        <h5 class="mb-0">Ranking de Agentes</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th width="80">Posição</th>
                                        <th>Agente</th>
                                        <th>Nível</th>
                                        <th>Pontos</th>
                                        <th width="150">Progresso</th>
                                    </tr>
                                </thead>
                                <tbody id="leaderboard-table-body">
                                    <!-- Will be populated dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100">
                    <div class="card-header bg-transparent">
                        <h5 class="mb-0">Conquistas Recentes</h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="list-group list-group-flush" id="recent-achievements-list">
                            <!-- Will be populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Performance Metrics and Badges -->
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="card h-100">
                    <div class="card-header bg-transparent">
                        <h5 class="mb-0">Métricas de Desempenho</h5>
                    </div>
                    <div class="card-body">
                        <div class="row g-4">
                            <div class="col-md-4">
                                <div class="card border-0 shadow-sm">
                                    <div class="card-body text-center">
                                        <div class="display-6 mb-2" id="metric-calls">154</div>
                                        <p class="text-muted mb-0">Chamadas Realizadas</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card border-0 shadow-sm">
                                    <div class="card-body text-center">
                                        <div class="display-6 mb-2" id="metric-conversations">98</div>
                                        <p class="text-muted mb-0">Conversas Completadas</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card border-0 shadow-sm">
                                    <div class="card-body text-center">
                                        <div class="display-6 mb-2" id="metric-qualified-leads">42</div>
                                        <p class="text-muted mb-0">Leads Qualificados</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card border-0 shadow-sm">
                                    <div class="card-body text-center">
                                        <div class="display-6 mb-2" id="metric-conversion-rate">27.3%</div>
                                        <p class="text-muted mb-0">Taxa de Conversão</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card border-0 shadow-sm">
                                    <div class="card-body text-center">
                                        <div class="display-6 mb-2" id="metric-talk-time">5:42</div>
                                        <p class="text-muted mb-0">Tempo Médio de Conversa</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card border-0 shadow-sm">
                                    <div class="card-body text-center">
                                        <div class="display-6 mb-2" id="metric-streak">3 dias</div>
                                        <p class="text-muted mb-0">Sequência Atual</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100">
                    <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Emblemas e Conquistas</h5>
                        <button class="btn btn-sm btn-outline-primary" id="view-all-badges-btn">Ver Todos</button>
                    </div>
                    <div class="card-body">
                        <div class="d-flex flex-wrap gap-3 justify-content-center" id="badges-container">
                            <!-- Will be populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Challenges and Rewards -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header bg-transparent">
                        <h5 class="mb-0">Desafios Ativos</h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="list-group list-group-flush" id="active-challenges-list">
                            <!-- Will be populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header bg-transparent">
                        <h5 class="mb-0">Recompensas Disponíveis</h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="list-group list-group-flush" id="available-rewards-list">
                            <!-- Will be populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Performance Chart -->
        <div class="card mb-4">
            <div class="card-header bg-transparent">
                <h5 class="mb-0">Tendências de Desempenho</h5>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-md-4">
                        <select class="form-select" id="performance-chart-metric">
                            <option value="points" selected>Pontos Totais</option>
                            <option value="calls">Chamadas Realizadas</option>
                            <option value="conversations">Conversas Completadas</option>
                            <option value="leads-qualified">Leads Qualificados</option>
                            <option value="conversion-rate">Taxa de Conversão</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <select class="form-select" id="performance-chart-period">
                            <option value="daily">Diário</option>
                            <option value="weekly" selected>Semanal</option>
                            <option value="monthly">Mensal</option>
                        </select>
                    </div>
                </div>
                <canvas id="performance-chart" height="300"></canvas>
            </div>
        </div>
        
        <!-- Achievement Details Modal -->
        <div class="modal fade" id="achievement-detail-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="achievement-detail-title">Detalhes da Conquista</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-4">
                            <div class="col-md-3 text-center">
                                <img src="/img/badges/master-caller.png" alt="Badge" class="img-fluid mb-3" id="achievement-badge" style="max-height: 150px;">
                                <div id="achievement-progress-container">
                                    <div class="progress mb-2" style="height: 20px;">
                                        <div class="progress-bar bg-success" role="progressbar" style="width: 75%;" 
                                            id="achievement-progress-bar">75%</div>
                                    </div>
                                    <p class="text-muted" id="achievement-progress-text">75/100 completado</p>
                                </div>
                            </div>
                            <div class="col-md-9">
                                <h4 id="achievement-name">Mestre das Chamadas</h4>
                                <p class="text-muted" id="achievement-description">Realize 100 chamadas em uma única semana.</p>
                                <div class="mb-3">
                                    <span class="badge bg-primary me-2" id="achievement-category">Chamadas</span>
                                    <span class="badge bg-secondary me-2" id="achievement-points">+500 pontos</span>
                                    <span class="badge bg-warning text-dark me-2" id="achievement-rarity">Raro</span>
                                </div>
                                <div id="achievement-requirements">
                                    <h6>Requisitos:</h6>
                                    <ul id="achievement-requirements-list">
                                        <li>Realizar 100 chamadas</li>
                                        <li>Em uma única semana</li>
                                        <li>Taxa de atendimento mínima de 60%</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <h6>Dicas para Desbloquear</h6>
                        <div class="alert alert-info" id="achievement-tips">
                            <ul>
                                <li>Foque em fazer chamadas curtas para maximizar o número de contatos.</li>
                                <li>Utilize os horários de pico para aumentar a taxa de atendimento.</li>
                                <li>Use a funcionalidade de discagem automática para otimizar o tempo.</li>
                            </ul>
                        </div>
                        
                        <h6>Agentes que Conquistaram</h6>
                        <div class="row" id="achievement-agents-list">
                            <!-- Will be populated dynamically -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- All Badges Modal -->
        <div class="modal fade" id="all-badges-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Todos os Emblemas e Conquistas</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <select class="form-select" id="badges-filter-category">
                                    <option value="all" selected>Todas as Categorias</option>
                                    <option value="calls">Chamadas</option>
                                    <option value="leads">Leads</option>
                                    <option value="conversations">Conversas</option>
                                    <option value="quality">Qualidade</option>
                                    <option value="special">Especiais</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <select class="form-select" id="badges-filter-status">
                                    <option value="all" selected>Todos os Status</option>
                                    <option value="unlocked">Desbloqueados</option>
                                    <option value="locked">Bloqueados</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <select class="form-select" id="badges-sort">
                                    <option value="category" selected>Ordenar por Categoria</option>
                                    <option value="name">Ordenar por Nome</option>
                                    <option value="rarity">Ordenar por Raridade</option>
                                    <option value="points">Ordenar por Pontos</option>
                                </select>
                            </div>
                        </div>
                        <div class="row g-4" id="all-badges-container">
                            <!-- Will be populated dynamically -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load Chart.js if not already loaded
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js';
        document.head.appendChild(script);
    }
}

/**
 * Setup Leaderboard events
 */
function setupLeaderboardEvents() {
    // Apply filters button
    const applyFiltersBtn = document.getElementById('apply-leaderboard-filters-btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            loadLeaderboardData();
        });
    }
    
    // Refresh leaderboard button
    const refreshLeaderboardBtn = document.getElementById('refresh-leaderboard-btn');
    if (refreshLeaderboardBtn) {
        refreshLeaderboardBtn.addEventListener('click', () => {
            refreshLeaderboardBtn.innerHTML = '<i class="fas fa-spin fa-spinner"></i> Atualizando...';
            refreshLeaderboardBtn.disabled = true;
            
            loadLeaderboardData(() => {
                refreshLeaderboardBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar';
                refreshLeaderboardBtn.disabled = false;
            });
        });
    }
    
    // Performance chart metric change
    const performanceChartMetric = document.getElementById('performance-chart-metric');
    if (performanceChartMetric) {
        performanceChartMetric.addEventListener('change', () => {
            updatePerformanceChart();
        });
    }
    
    // Performance chart period change
    const performanceChartPeriod = document.getElementById('performance-chart-period');
    if (performanceChartPeriod) {
        performanceChartPeriod.addEventListener('change', () => {
            updatePerformanceChart();
        });
    }
    
    // View all badges button
    const viewAllBadgesBtn = document.getElementById('view-all-badges-btn');
    if (viewAllBadgesBtn) {
        viewAllBadgesBtn.addEventListener('click', () => {
            showAllBadges();
        });
    }
    
    // Add click event for achievement details
    // These will be dynamically added, so we use event delegation
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('badge-item') || 
            (e.target.parentElement && e.target.parentElement.classList.contains('badge-item'))) {
            const badgeElement = e.target.classList.contains('badge-item') ? e.target : e.target.parentElement;
            const achievementId = badgeElement.getAttribute('data-achievement-id');
            showAchievementDetails(achievementId);
        }
    });
    
    // Badges filter events
    const badgesFilterCategory = document.getElementById('badges-filter-category');
    const badgesFilterStatus = document.getElementById('badges-filter-status');
    const badgesSort = document.getElementById('badges-sort');
    
    [badgesFilterCategory, badgesFilterStatus, badgesSort].forEach(element => {
        if (element) {
            element.addEventListener('change', () => {
                filterBadges();
            });
        }
    });
}

/**
 * Load leaderboard data from API
 * @param {Function} callback - Optional callback function
 */
function loadLeaderboardData(callback) {
    // Get filters
    const timePeriod = document.getElementById('leaderboard-time-period').value;
    const team = document.getElementById('leaderboard-team').value;
    const metric = document.getElementById('leaderboard-metric').value;
    
    // In a real app, you would fetch data from your API
    // Here we'll use mock data for demonstration
    setTimeout(() => {
        // Mock data for leaderboard
        const mockLeaderboardData = {
            currentUser: {
                id: 2,
                name: "Maria Santos",
                avatarUrl: "/img/avatars/avatar-2.jpg",
                level: {
                    id: 4,
                    title: "Prospector Diamante",
                    description: "Elite dos prospectores",
                    badgeUrl: "/img/badges/diamond.png"
                },
                rank: 3,
                points: 5280,
                nextLevel: {
                    id: 5,
                    title: "Prospector Lendário",
                    pointsRequired: 6000
                },
                metrics: {
                    calls: 154,
                    conversations: 98,
                    qualifiedLeads: 42,
                    conversionRate: 27.3,
                    talkTime: "5:42", // in minutes:seconds
                    streak: 3 // days
                }
            },
            totalAgents: 22,
            leaderboard: [
                {
                    id: 3,
                    name: "Carlos Pereira",
                    avatarUrl: "/img/avatars/avatar-3.jpg",
                    level: {
                        id: 5,
                        title: "Prospector Lendário",
                        badgeUrl: "/img/badges/legendary.png"
                    },
                    points: 7850,
                    nextLevelProgress: 92
                },
                {
                    id: 4,
                    name: "Ana Silva",
                    avatarUrl: "/img/avatars/avatar-4.jpg",
                    level: {
                        id: 4,
                        title: "Prospector Diamante",
                        badgeUrl: "/img/badges/diamond.png"
                    },
                    points: 6120,
                    nextLevelProgress: 87
                },
                {
                    id: 2,
                    name: "Maria Santos",
                    avatarUrl: "/img/avatars/avatar-2.jpg",
                    level: {
                        id: 4,
                        title: "Prospector Diamante",
                        badgeUrl: "/img/badges/diamond.png"
                    },
                    points: 5280,
                    nextLevelProgress: 75
                },
                {
                    id: 1,
                    name: "João Silva",
                    avatarUrl: "/img/avatars/avatar-1.jpg",
                    level: {
                        id: 3,
                        title: "Prospector Ouro",
                        badgeUrl: "/img/badges/gold.png"
                    },
                    points: 4530,
                    nextLevelProgress: 82
                },
                {
                    id: 5,
                    name: "Pedro Almeida",
                    avatarUrl: "/img/avatars/avatar-5.jpg",
                    level: {
                        id: 3,
                        title: "Prospector Ouro",
                        badgeUrl: "/img/badges/gold.png"
                    },
                    points: 3980,
                    nextLevelProgress: 65
                }
            ],
            recentAchievements: [
                {
                    id: 1,
                    agentId: 2,
                    agentName: "Maria Santos",
                    agentAvatarUrl: "/img/avatars/avatar-2.jpg",
                    achievementId: 12,
                    achievementName: "Especialista em Qualidade",
                    badgeUrl: "/img/badges/quality-expert.png",
                    points: 200,
                    earnedAt: "2023-04-02T14:35:00Z"
                },
                {
                    id: 2,
                    agentId: 3,
                    agentName: "Carlos Pereira",
                    agentAvatarUrl: "/img/avatars/avatar-3.jpg",
                    achievementId: 8,
                    achievementName: "Mestre das Chamadas",
                    badgeUrl: "/img/badges/master-caller.png",
                    points: 500,
                    earnedAt: "2023-04-02T10:15:00Z"
                },
                {
                    id: 3,
                    agentId: 1,
                    agentName: "João Silva",
                    agentAvatarUrl: "/img/avatars/avatar-1.jpg",
                    achievementId: 5,
                    achievementName: "Conversor de Elite",
                    badgeUrl: "/img/badges/elite-converter.png",
                    points: 300,
                    earnedAt: "2023-04-01T16:45:00Z"
                },
                {
                    id: 4,
                    agentId: 2,
                    agentName: "Maria Santos",
                    agentAvatarUrl: "/img/avatars/avatar-2.jpg",
                    achievementId: 3,
                    achievementName: "Prospector Consistente",
                    badgeUrl: "/img/badges/consistent-prospector.png",
                    points: 150,
                    earnedAt: "2023-04-01T09:20:00Z"
                },
                {
                    id: 5,
                    agentId: 4,
                    agentName: "Ana Silva",
                    agentAvatarUrl: "/img/avatars/avatar-4.jpg",
                    achievementId: 15,
                    achievementName: "Embaixador da Marca",
                    badgeUrl: "/img/badges/brand-ambassador.png",
                    points: 400,
                    earnedAt: "2023-03-31T15:10:00Z"
                }
            ],
            userBadges: [
                {
                    id: 3,
                    name: "Prospector Consistente",
                    badgeUrl: "/img/badges/consistent-prospector.png",
                    category: "consistency",
                    rarity: "common",
                    isUnlocked: true
                },
                {
                    id: 5,
                    name: "Conversor de Elite",
                    badgeUrl: "/img/badges/elite-converter.png",
                    category: "conversion",
                    rarity: "rare",
                    isUnlocked: true
                },
                {
                    id: 8,
                    name: "Mestre das Chamadas",
                    badgeUrl: "/img/badges/master-caller.png",
                    category: "calls",
                    rarity: "rare",
                    isUnlocked: true
                },
                {
                    id: 12,
                    name: "Especialista em Qualidade",
                    badgeUrl: "/img/badges/quality-expert.png",
                    category: "quality",
                    rarity: "epic",
                    isUnlocked: true
                },
                {
                    id: 15,
                    name: "Embaixador da Marca",
                    badgeUrl: "/img/badges/brand-ambassador.png",
                    category: "special",
                    rarity: "legendary",
                    isUnlocked: false,
                    progress: 65
                },
                {
                    id: 18,
                    name: "Maratonista de Vendas",
                    badgeUrl: "/img/badges/sales-marathoner.png",
                    category: "sales",
                    rarity: "epic",
                    isUnlocked: false,
                    progress: 42
                }
            ],
            activeChallenges: [
                {
                    id: 1,
                    title: "Semana de Fogo",
                    description: "Complete 50 chamadas em uma semana",
                    reward: "500 pontos + Emblema 'Maratonista de Chamadas'",
                    progress: 32,
                    target: 50,
                    endDate: "2023-04-07T23:59:59Z"
                },
                {
                    id: 2,
                    title: "Qualificador Mestre",
                    description: "Qualifique 20 leads com alta precisão",
                    reward: "300 pontos + 2 horas de folga",
                    progress: 12,
                    target: 20,
                    endDate: "2023-04-10T23:59:59Z"
                },
                {
                    id: 3,
                    title: "Taxa de Conversão Elite",
                    description: "Mantenha uma taxa de conversão acima de 30% por 5 dias consecutivos",
                    reward: "700 pontos + Emblema 'Conversor Lendário'",
                    progress: 3,
                    target: 5,
                    endDate: "2023-04-15T23:59:59Z"
                }
            ],
            availableRewards: [
                {
                    id: 1,
                    title: "Vale-Presente R$50",
                    description: "Vale-presente de R$50 para usar em lojas parceiras",
                    pointsCost: 2000,
                    imageUrl: "/img/rewards/gift-card.png",
                    availability: "Disponível (10 restantes)"
                },
                {
                    id: 2,
                    title: "Dia de Folga Extra",
                    description: "Um dia adicional de folga para ser usado quando quiser",
                    pointsCost: 5000,
                    imageUrl: "/img/rewards/day-off.png",
                    availability: "Disponível (3 restantes)"
                },
                {
                    id: 3,
                    title: "Almoço com o CEO",
                    description: "Almoço exclusivo com o CEO para discutir ideias e carreira",
                    pointsCost: 7500,
                    imageUrl: "/img/rewards/lunch.png",
                    availability: "Disponível (1 restante)"
                },
                {
                    id: 4,
                    title: "Curso de Especialização",
                    description: "Curso de especialização em vendas ou liderança à sua escolha",
                    pointsCost: 10000,
                    imageUrl: "/img/rewards/course.png",
                    availability: "Disponível (5 restantes)"
                }
            ],
            performanceData: {
                daily: {
                    labels: ["28/03", "29/03", "30/03", "31/03", "01/04", "02/04", "03/04"],
                    datasets: {
                        points: [380, 420, 350, 490, 520, 480, 510],
                        calls: [20, 25, 18, 28, 30, 24, 26],
                        conversations: [15, 18, 12, 20, 22, 16, 19],
                        "leads-qualified": [5, 8, 4, 10, 12, 8, 9],
                        "conversion-rate": [25, 32, 22, 36, 40, 33, 35]
                    }
                },
                weekly: {
                    labels: ["Semana 9", "Semana 10", "Semana 11", "Semana 12", "Semana 13"],
                    datasets: {
                        points: [2300, 2100, 2500, 2800, 2600],
                        calls: [120, 105, 130, 150, 135],
                        conversations: [85, 72, 90, 105, 94],
                        "leads-qualified": [35, 28, 38, 45, 40],
                        "conversion-rate": [29, 27, 30, 32, 31]
                    }
                },
                monthly: {
                    labels: ["Nov", "Dez", "Jan", "Fev", "Mar"],
                    datasets: {
                        points: [8500, 7800, 9200, 10500, 11200],
                        calls: [450, 420, 480, 520, 560],
                        conversations: [320, 290, 350, 380, 410],
                        "leads-qualified": [120, 110, 140, 160, 180],
                        "conversion-rate": [27, 26, 29, 31, 32]
                    }
                }
            }
        };
        
        // Update UI with leaderboard data
        updateLeaderboardUI(mockLeaderboardData);
        
        if (callback && typeof callback === 'function') {
            callback();
        }
    }, 1500);
}

/**
 * Update leaderboard UI with data
 * @param {Object} data - Leaderboard data
 */
function updateLeaderboardUI(data) {
    // Update current user level info
    const currentUser = data.currentUser;
    
    document.getElementById('current-level-badge').src = currentUser.level.badgeUrl;
    document.getElementById('current-level-title').textContent = currentUser.level.title;
    document.getElementById('current-level-description').textContent = currentUser.level.description;
    document.getElementById('current-points').textContent = currentUser.points.toLocaleString();
    document.getElementById('current-rank').textContent = `#${currentUser.rank}`;
    document.getElementById('total-agents').textContent = `de ${data.totalAgents} agentes`;
    
    // Calculate points to next level
    const pointsToNextLevel = currentUser.nextLevel.pointsRequired - currentUser.points;
    document.getElementById('points-to-next-level').textContent = pointsToNextLevel.toLocaleString();
    document.getElementById('next-level-title').textContent = currentUser.nextLevel.title;
    
    // Calculate progress percentage
    const currentLevelPoints = currentUser.nextLevel.pointsRequired - 1000; // Assuming each level requires 1000 more points
    const progressPercentage = ((currentUser.points - currentLevelPoints) / (currentUser.nextLevel.pointsRequired - currentLevelPoints)) * 100;
    
    const progressBar = document.getElementById('next-level-progress-bar');
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.textContent = `${Math.round(progressPercentage)}%`;
    
    // Update metrics
    document.getElementById('metric-calls').textContent = currentUser.metrics.calls;
    document.getElementById('metric-conversations').textContent = currentUser.metrics.conversations;
    document.getElementById('metric-qualified-leads').textContent = currentUser.metrics.qualifiedLeads;
    document.getElementById('metric-conversion-rate').textContent = `${currentUser.metrics.conversionRate}%`;
    document.getElementById('metric-talk-time').textContent = currentUser.metrics.talkTime;
    document.getElementById('metric-streak').textContent = `${currentUser.metrics.streak} dias`;
    
    // Update leaderboard table
    const tableBody = document.getElementById('leaderboard-table-body');
    tableBody.innerHTML = '';
    
    data.leaderboard.forEach((agent, index) => {
        const isCurrentUser = agent.id === currentUser.id;
        const row = document.createElement('tr');
        
        if (isCurrentUser) {
            row.classList.add('table-primary');
        }
        
        row.innerHTML = `
            <td class="text-center">
                ${index === 0 ? '<i class="fas fa-trophy text-warning fa-lg"></i>' : 
                  index === 1 ? '<i class="fas fa-trophy text-secondary fa-lg"></i>' :
                  index === 2 ? '<i class="fas fa-trophy" style="color: #cd7f32;"></i>' :
                  `#${index + 1}`}
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${agent.avatarUrl || '/img/avatar-placeholder.jpg'}" class="rounded-circle me-2" width="40" height="40">
                    <div>
                        <div class="fw-bold">${agent.name}</div>
                        <div class="small text-muted">${agent.level.title}</div>
                    </div>
                </div>
            </td>
            <td>
                <img src="${agent.level.badgeUrl}" alt="${agent.level.title}" height="30">
            </td>
            <td>${agent.points.toLocaleString()}</td>
            <td>
                <div class="progress" style="height: 10px;">
                    <div class="progress-bar bg-success" role="progressbar" style="width: ${agent.nextLevelProgress}%"></div>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Update recent achievements
    const achievementsList = document.getElementById('recent-achievements-list');
    achievementsList.innerHTML = '';
    
    data.recentAchievements.forEach(achievement => {
        const timeAgo = getTimeAgo(new Date(achievement.earnedAt));
        const listItem = document.createElement('a');
        listItem.href = "#";
        listItem.classList.add('list-group-item', 'list-group-item-action');
        listItem.setAttribute('data-achievement-id', achievement.achievementId);
        
        listItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <img src="${achievement.badgeUrl}" alt="${achievement.achievementName}" height="40" class="me-2">
                    <div>
                        <h6 class="mb-0">${achievement.achievementName}</h6>
                        <small>
                            <img src="${achievement.agentAvatarUrl || '/img/avatar-placeholder.jpg'}" class="rounded-circle me-1" width="20" height="20">
                            ${achievement.agentName} • +${achievement.points} pontos
                        </small>
                    </div>
                </div>
                <small class="text-muted">${timeAgo}</small>
            </div>
        `;
        
        achievementsList.appendChild(listItem);
    });
    
    // Update badges
    const badgesContainer = document.getElementById('badges-container');
    badgesContainer.innerHTML = '';
    
    // Display only unlocked badges in the main view
    const unlockedBadges = data.userBadges.filter(badge => badge.isUnlocked);
    const lockedBadgesWithProgress = data.userBadges.filter(badge => !badge.isUnlocked && badge.progress > 0)
                                          .sort((a, b) => b.progress - a.progress)
                                          .slice(0, 2); // Show top 2 in-progress badges
    
    // Show unlocked badges
    unlockedBadges.slice(0, 4).forEach(badge => { // Show only the first 4
        const badgeElement = document.createElement('div');
        badgeElement.classList.add('badge-item', 'text-center', 'cursor-pointer');
        badgeElement.setAttribute('data-achievement-id', badge.id);
        
        let rarityClass = 'text-muted';
        switch (badge.rarity) {
            case 'rare': rarityClass = 'text-primary'; break;
            case 'epic': rarityClass = 'text-purple'; break;
            case 'legendary': rarityClass = 'text-warning'; break;
        }
        
        badgeElement.innerHTML = `
            <div class="mb-2">
                <img src="${badge.badgeUrl}" alt="${badge.name}" height="50">
            </div>
            <div class="small fw-bold">${badge.name}</div>
            <small class="${rarityClass}">${capitalizeFirstLetter(badge.rarity)}</small>
        `;
        
        badgesContainer.appendChild(badgeElement);
    });
    
    // Show in-progress badges
    lockedBadgesWithProgress.forEach(badge => {
        const badgeElement = document.createElement('div');
        badgeElement.classList.add('badge-item', 'text-center', 'cursor-pointer');
        badgeElement.setAttribute('data-achievement-id', badge.id);
        
        badgeElement.innerHTML = `
            <div class="mb-2 position-relative">
                <img src="${badge.badgeUrl}" alt="${badge.name}" height="50" class="opacity-50">
                <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                    <span class="badge bg-secondary">${badge.progress}%</span>
                </div>
            </div>
            <div class="small fw-bold text-muted">${badge.name}</div>
            <div class="progress" style="height: 5px;">
                <div class="progress-bar bg-info" role="progressbar" style="width: ${badge.progress}%"></div>
            </div>
        `;
        
        badgesContainer.appendChild(badgeElement);
    });
    
    // Update active challenges
    const challengesList = document.getElementById('active-challenges-list');
    challengesList.innerHTML = '';
    
    data.activeChallenges.forEach(challenge => {
        const daysLeft = getDaysLeft(new Date(challenge.endDate));
        const progressPercentage = (challenge.progress / challenge.target) * 100;
        
        const listItem = document.createElement('a');
        listItem.href = "#";
        listItem.classList.add('list-group-item', 'list-group-item-action');
        
        listItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${challenge.title}</h6>
                <small class="text-danger">${daysLeft} dias restantes</small>
            </div>
            <p class="mb-1">${challenge.description}</p>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Recompensa: ${challenge.reward}</small>
                <span class="badge bg-primary">${challenge.progress}/${challenge.target}</span>
            </div>
            <div class="progress mt-2" style="height: 5px;">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${progressPercentage}%"></div>
            </div>
        `;
        
        challengesList.appendChild(listItem);
    });
    
    // Update available rewards
    const rewardsList = document.getElementById('available-rewards-list');
    rewardsList.innerHTML = '';
    
    data.availableRewards.forEach(reward => {
        const canAfford = currentUser.points >= reward.pointsCost;
        
        const listItem = document.createElement('a');
        listItem.href = "#";
        listItem.classList.add('list-group-item', 'list-group-item-action');
        
        listItem.innerHTML = `
            <div class="d-flex">
                <div class="me-3">
                    <img src="${reward.imageUrl}" alt="${reward.title}" width="60" height="60" class="rounded">
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${reward.title}</h6>
                        <span class="badge ${canAfford ? 'bg-success' : 'bg-secondary'}">${reward.pointsCost} pontos</span>
                    </div>
                    <p class="mb-1">${reward.description}</p>
                    <small class="text-muted">${reward.availability}</small>
                </div>
            </div>
        `;
        
        rewardsList.appendChild(listItem);
    });
    
    // Initialize performance chart
    updatePerformanceChart(data.performanceData);
}

/**
 * Update performance chart
 * @param {Object} performanceData - Performance data for chart
 */
function updatePerformanceChart(performanceData) {
    // If no data is provided, get it from the current chart
    if (!performanceData && window.performanceChartData) {
        performanceData = window.performanceChartData;
    } else if (performanceData) {
        // Store the data for future updates
        window.performanceChartData = performanceData;
    } else {
        return; // No data available
    }
    
    // Wait for Chart.js to load
    if (typeof Chart === 'undefined') {
        setTimeout(() => updatePerformanceChart(performanceData), 100);
        return;
    }
    
    const ctx = document.getElementById('performance-chart').getContext('2d');
    
    // Get selected metric and period
    const metricSelect = document.getElementById('performance-chart-metric');
    const periodSelect = document.getElementById('performance-chart-period');
    
    const selectedMetric = metricSelect ? metricSelect.value : 'points';
    const selectedPeriod = periodSelect ? periodSelect.value : 'weekly';
    
    // Get data for selected period
    const periodData = performanceData[selectedPeriod];
    if (!periodData) return;
    
    // Destroy existing chart if any
    if (window.performanceChart) {
        window.performanceChart.destroy();
    }
    
    // Prepare chart data
    const chartData = {
        labels: periodData.labels,
        datasets: [{
            label: getMetricLabel(selectedMetric),
            data: periodData.datasets[selectedMetric],
            backgroundColor: 'rgba(78, 115, 223, 0.2)',
            borderColor: 'rgba(78, 115, 223, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(78, 115, 223, 1)',
            pointBorderColor: '#fff',
            pointRadius: 4,
            tension: 0.3
        }]
    };
    
    // Create new chart
    window.performanceChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: selectedMetric === 'conversion-rate' ? false : true,
                    ticks: {
                        callback: function(value) {
                            if (selectedMetric === 'conversion-rate') {
                                return value + '%';
                            }
                            return value;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (selectedMetric === 'conversion-rate') {
                                label += context.parsed.y + '%';
                            } else {
                                label += context.parsed.y;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Show achievement details
 * @param {string} achievementId - Achievement ID
 */
function showAchievementDetails(achievementId) {
    // In a real app, you would fetch achievement details from your API
    // Here we'll use mock data for demonstration
    
    // Mock achievement details (would be from API)
    const mockAchievementDetails = {
        id: parseInt(achievementId),
        name: "Mestre das Chamadas",
        description: "Realize 100 chamadas em uma única semana.",
        badgeUrl: "/img/badges/master-caller.png",
        category: "Chamadas",
        points: 500,
        rarity: "Raro",
        isUnlocked: achievementId === "8" || achievementId === "3" || achievementId === "5" || achievementId === "12",
        progress: achievementId === "8" || achievementId === "3" || achievementId === "5" || achievementId === "12" ? 100 : 75,
        progressText: achievementId === "8" || achievementId === "3" || achievementId === "5" || achievementId === "12" ? "Conquistado" : "75/100 completado",
        requirements: [
            "Realizar 100 chamadas",
            "Em uma única semana",
            "Taxa de atendimento mínima de 60%"
        ],
        tips: [
            "Foque em fazer chamadas curtas para maximizar o número de contatos.",
            "Utilize os horários de pico para aumentar a taxa de atendimento.",
            "Use a funcionalidade de discagem automática para otimizar o tempo."
        ],
        agentsWhoEarned: [
            { id: 3, name: "Carlos Pereira", avatarUrl: "/img/avatars/avatar-3.jpg", earnedAt: "2023-04-02T10:15:00Z" },
            { id: 2, name: "Maria Santos", avatarUrl: "/img/avatars/avatar-2.jpg", earnedAt: "2023-03-25T14:30:00Z" },
            { id: 4, name: "Ana Silva", avatarUrl: "/img/avatars/avatar-4.jpg", earnedAt: "2023-03-20T09:45:00Z" }
        ]
    };
    
    // Update modal content
    document.getElementById('achievement-badge').src = mockAchievementDetails.badgeUrl;
    document.getElementById('achievement-name').textContent = mockAchievementDetails.name;
    document.getElementById('achievement-description').textContent = mockAchievementDetails.description;
    document.getElementById('achievement-category').textContent = mockAchievementDetails.category;
    document.getElementById('achievement-points').textContent = `+${mockAchievementDetails.points} pontos`;
    document.getElementById('achievement-rarity').textContent = mockAchievementDetails.rarity;
    
    // Update progress display
    const progressContainer = document.getElementById('achievement-progress-container');
    const progressBar = document.getElementById('achievement-progress-bar');
    const progressText = document.getElementById('achievement-progress-text');
    
    if (mockAchievementDetails.isUnlocked) {
        progressContainer.innerHTML = `
            <div class="alert alert-success mb-0">
                <i class="fas fa-check-circle me-2"></i> Conquistado em ${formatDate(new Date(mockAchievementDetails.agentsWhoEarned[0].earnedAt))}
            </div>
        `;
    } else {
        progressBar.style.width = `${mockAchievementDetails.progress}%`;
        progressText.textContent = mockAchievementDetails.progressText;
    }
    
    // Update requirements
    const requirementsList = document.getElementById('achievement-requirements-list');
    requirementsList.innerHTML = '';
    
    mockAchievementDetails.requirements.forEach(requirement => {
        const li = document.createElement('li');
        li.textContent = requirement;
        requirementsList.appendChild(li);
    });
    
    // Update tips
    const achievementTips = document.getElementById('achievement-tips');
    achievementTips.innerHTML = '<ul>';
    mockAchievementDetails.tips.forEach(tip => {
        achievementTips.innerHTML += `<li>${tip}</li>`;
    });
    achievementTips.innerHTML += '</ul>';
    
    // Update agents who earned
    const agentsList = document.getElementById('achievement-agents-list');
    agentsList.innerHTML = '';
    
    mockAchievementDetails.agentsWhoEarned.forEach(agent => {
        const col = document.createElement('div');
        col.classList.add('col-md-4', 'text-center', 'mb-3');
        
        col.innerHTML = `
            <img src="${agent.avatarUrl || '/img/avatar-placeholder.jpg'}" class="rounded-circle mb-2" width="60" height="60">
            <div class="fw-bold">${agent.name}</div>
            <small class="text-muted">${formatDate(new Date(agent.earnedAt))}</small>
        `;
        
        agentsList.appendChild(col);
    });
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('achievement-detail-modal'));
    modal.show();
}

/**
 * Show all badges
 */
function showAllBadges() {
    // In a real app, you would fetch all badges from your API
    // Here we'll use mock data for demonstration
    
    // Mock badges data (would be from API)
    const mockAllBadges = [
        {
            id: 1,
            name: "Primeiro Contato",
            description: "Complete sua primeira chamada de prospecção.",
            badgeUrl: "/img/badges/first-contact.png",
            category: "calls",
            rarity: "common",
            points: 50,
            isUnlocked: true
        },
        {
            id: 2,
            name: "Iniciante Promissor",
            description: "Complete 10 chamadas de prospecção.",
            badgeUrl: "/img/badges/promising-rookie.png",
            category: "calls",
            rarity: "common",
            points: 100,
            isUnlocked: true
        },
        {
            id: 3,
            name: "Prospector Consistente",
            description: "Complete 50 chamadas de prospecção.",
            badgeUrl: "/img/badges/consistent-prospector.png",
            category: "calls",
            rarity: "common",
            points: 150,
            isUnlocked: true
        },
        {
            id: 4,
            name: "Explorador de Leads",
            description: "Identifique 10 leads qualificados.",
            badgeUrl: "/img/badges/lead-explorer.png",
            category: "leads",
            rarity: "common",
            points: 100,
            isUnlocked: true
        },
        {
            id: 5,
            name: "Conversor de Elite",
            description: "Atinja uma taxa de conversão de 25% por uma semana.",
            badgeUrl: "/img/badges/elite-converter.png",
            category: "conversion",
            rarity: "rare",
            points: 300,
            isUnlocked: true
        },
        {
            id: 6,
            name: "Comunicador Eficaz",
            description: "Mantenha um tempo médio de chamada abaixo de 3 minutos com alta taxa de qualificação.",
            badgeUrl: "/img/badges/effective-communicator.png",
            category: "quality",
            rarity: "rare",
            points: 250,
            isUnlocked: true
        },
        {
            id: 7,
            name: "Caçador de Oportunidades",
            description: "Identifique 30 leads qualificados em um mês.",
            badgeUrl: "/img/badges/opportunity-hunter.png",
            category: "leads",
            rarity: "rare",
            points: 350,
            isUnlocked: true
        },
        {
            id: 8,
            name: "Mestre das Chamadas",
            description: "Realize 100 chamadas em uma única semana.",
            badgeUrl: "/img/badges/master-caller.png",
            category: "calls",
            rarity: "rare",
            points: 500,
            isUnlocked: true
        },
        {
            id: 9,
            name: "Maratonista de Vendas",
            description: "Mantenha uma sequência de 15 dias úteis consecutivos atingindo suas metas.",
            badgeUrl: "/img/badges/sales-marathoner.png",
            category: "consistency",
            rarity: "epic",
            points: 750,
            isUnlocked: false,
            progress: 42
        },
        {
            id: 10,
            name: "Guru da Prospecção",
            description: "Atinja uma taxa de conversão de 35% por um mês.",
            badgeUrl: "/img/badges/prospecting-guru.png",
            category: "conversion",
            rarity: "epic",
            points: 800,
            isUnlocked: false,
            progress: 65
        },
        {
            id: 11,
            name: "Perfeccionista",
            description: "Atinja 100% das suas metas em todas as categorias por um trimestre.",
            badgeUrl: "/img/badges/perfectionist.png",
            category: "special",
            rarity: "epic",
            points: 1000,
            isUnlocked: false,
            progress: 28
        },
        {
            id: 12,
            name: "Especialista em Qualidade",
            description: "Mantenha uma alta pontuação de qualidade nas suas chamadas por um mês.",
            badgeUrl: "/img/badges/quality-expert.png",
            category: "quality",
            rarity: "epic",
            points: 700,
            isUnlocked: true
        },
        {
            id: 13,
            name: "Mestre da Persuasão",
            description: "Converta 10 leads considerados de baixa probabilidade.",
            badgeUrl: "/img/badges/persuasion-master.png",
            category: "special",
            rarity: "epic",
            points: 900,
            isUnlocked: false,
            progress: 30
        },
        {
            id: 14,
            name: "Conversor Lendário",
            description: "Atinja uma taxa de conversão de 50% por duas semanas consecutivas.",
            badgeUrl: "/img/badges/legendary-converter.png",
            category: "conversion",
            rarity: "legendary",
            points: 1500,
            isUnlocked: false,
            progress: 0
        },
        {
            id: 15,
            name: "Embaixador da Marca",
            description: "Demonstre excelência consistente em todos os aspectos da prospecção por 3 meses consecutivos.",
            badgeUrl: "/img/badges/brand-ambassador.png",
            category: "special",
            rarity: "legendary",
            points: 2000,
            isUnlocked: false,
            progress: 15
        }
    ];
    
    // Show all badges in modal
    const container = document.getElementById('all-badges-container');
    
    // Clear existing content
    container.innerHTML = '';
    
    // Get filter values
    const categoryFilter = document.getElementById('badges-filter-category').value;
    const statusFilter = document.getElementById('badges-filter-status').value;
    const sortOption = document.getElementById('badges-sort').value;
    
    // Filter badges
    let filteredBadges = [...mockAllBadges];
    
    if (categoryFilter !== 'all') {
        filteredBadges = filteredBadges.filter(badge => badge.category === categoryFilter);
    }
    
    if (statusFilter !== 'all') {
        filteredBadges = filteredBadges.filter(badge => 
            (statusFilter === 'unlocked' && badge.isUnlocked) || 
            (statusFilter === 'locked' && !badge.isUnlocked)
        );
    }
    
    // Sort badges
    filteredBadges.sort((a, b) => {
        switch (sortOption) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'rarity':
                const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
                return rarityOrder[b.rarity] - rarityOrder[a.rarity];
            case 'points':
                return b.points - a.points;
            case 'category':
            default:
                if (a.category === b.category) {
                    return rarityOrder[b.rarity] - rarityOrder[a.rarity];
                }
                return a.category.localeCompare(b.category);
        }
    });
    
    // Display badges
    filteredBadges.forEach(badge => {
        const col = document.createElement('div');
        col.classList.add('col-md-3', 'mb-4');
        
        let badgeContent = '';
        let rarityClass = 'text-muted';
        
        switch (badge.rarity) {
            case 'rare': rarityClass = 'text-primary'; break;
            case 'epic': rarityClass = 'text-purple'; break;
            case 'legendary': rarityClass = 'text-warning'; break;
        }
        
        if (badge.isUnlocked) {
            badgeContent = `
                <div class="card h-100 border-0 shadow-sm badge-card">
                    <div class="card-body text-center">
                        <img src="${badge.badgeUrl}" alt="${badge.name}" height="80" class="mb-3">
                        <h6 class="card-title">${badge.name}</h6>
                        <p class="card-text small text-muted">${badge.description}</p>
                        <div class="badge-footer">
                            <span class="badge bg-success me-2">Desbloqueado</span>
                            <span class="badge bg-secondary me-2">+${badge.points} pontos</span>
                            <span class="badge ${rarityClass} bg-opacity-10 text-${rarityClass}">${capitalizeFirstLetter(badge.rarity)}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            let progressBar = '';
            if (badge.progress > 0) {
                progressBar = `
                    <div class="progress mt-2 mb-2" style="height: 5px;">
                        <div class="progress-bar bg-info" role="progressbar" style="width: ${badge.progress}%"></div>
                    </div>
                    <small class="text-muted">${badge.progress}% completado</small>
                `;
            }
            
            badgeContent = `
                <div class="card h-100 border-0 shadow-sm badge-card locked-badge">
                    <div class="card-body text-center">
                        <div class="position-relative mb-3">
                            <img src="${badge.badgeUrl}" alt="${badge.name}" height="80" class="opacity-50">
                            <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                                <i class="fas fa-lock text-secondary fa-2x"></i>
                            </div>
                        </div>
                        <h6 class="card-title text-muted">${badge.name}</h6>
                        <p class="card-text small text-muted">${badge.description}</p>
                        ${progressBar}
                        <div class="badge-footer">
                            <span class="badge bg-secondary me-2">+${badge.points} pontos</span>
                            <span class="badge ${rarityClass} bg-opacity-10 text-${rarityClass}">${capitalizeFirstLetter(badge.rarity)}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        col.innerHTML = badgeContent;
        container.appendChild(col);
    });
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('all-badges-modal'));
    modal.show();
}

/**
 * Filter badges in the all badges modal
 */
function filterBadges() {
    // This just triggers the showAllBadges function to reapply filters
    showAllBadges();
}

/**
 * Get metric label for chart
 * @param {string} metric - Metric identifier
 * @returns {string} Human-readable metric label
 */
function getMetricLabel(metric) {
    const labels = {
        'points': 'Pontos Totais',
        'calls': 'Chamadas Realizadas',
        'conversations': 'Conversas Completadas',
        'leads-qualified': 'Leads Qualificados',
        'conversion-rate': 'Taxa de Conversão (%)'
    };
    
    return labels[metric] || metric;
}

/**
 * Get time ago string from date
 * @param {Date} date - Date to calculate time ago from
 * @returns {string} Time ago string
 */
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return `${diffInSeconds} segundo${diffInSeconds !== 1 ? 's' : ''} atrás`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''} atrás`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hora${diffInHours !== 1 ? 's' : ''} atrás`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} dia${diffInDays !== 1 ? 's' : ''} atrás`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} mês${diffInMonths !== 1 ? 'es' : ''} atrás`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ano${diffInYears !== 1 ? 's' : ''} atrás`;
}

/**
 * Get days left until date
 * @param {Date} date - Target date
 * @returns {number} Number of days left
 */
function getDaysLeft(date) {
    const now = new Date();
    const diffInMs = date - now;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffInDays);
}

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Capitalize first letter of a string
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}