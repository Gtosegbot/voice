document.addEventListener('DOMContentLoaded', function() {
    // Função para adicionar eventos a todos os botões
    function adicionarEventosBotoes() {
        // Adicionar eventos a todos os botões na aplicação
        document.querySelectorAll('button:not([data-event-added])').forEach(button => {
            button.addEventListener('click', function(e) {
                // Evita comportamento padrão para links
                e.preventDefault();
                
                // Adiciona classe para efeito visual
                this.classList.add('clicked');
                setTimeout(() => {
                    this.classList.remove('clicked');
                }, 500);
                
                // Mensagem no console para debugging
                console.log('Botão clicado:', this.innerText || this.innerHTML);
                
                // Alerta para o usuário
                if (this.innerText && this.innerText.trim() !== '') {
                    alert(`Ação: ${this.innerText.trim()}`);
                } else if (this.querySelector('i')) {
                    // Para botões com apenas ícones
                    const iconeClasse = this.querySelector('i').className;
                    if (iconeClasse.includes('eye')) {
                        alert('Visualizar detalhes');
                    } else if (iconeClasse.includes('edit') || iconeClasse.includes('pencil')) {
                        alert('Editar item');
                    } else if (iconeClasse.includes('trash') || iconeClasse.includes('times')) {
                        alert('Excluir/Cancelar item');
                    } else if (iconeClasse.includes('phone')) {
                        alert('Iniciar chamada');
                    } else if (iconeClasse.includes('download')) {
                        alert('Download/Exportar dados');
                    } else if (iconeClasse.includes('plus')) {
                        alert('Adicionar novo item');
                    } else if (iconeClasse.includes('search')) {
                        alert('Pesquisar');
                    } else if (iconeClasse.includes('bars')) {
                        // Não faz nada pois tem tratamento especial
                    } else {
                        alert('Ação executada com sucesso!');
                    }
                } else {
                    alert('Ação executada com sucesso!');
                }
            });
            
            // Marca o botão como já tendo recebido evento
            button.setAttribute('data-event-added', 'true');
        });
        
        // Adicionar eventos a todos os links na aplicação
        document.querySelectorAll('a:not([data-event-added])').forEach(link => {
            link.addEventListener('click', function(e) {
                // Se não for link para a interface de voz, previne o comportamento padrão
                if (!this.href.includes('/voz/')) {
                    e.preventDefault();
                    
                    // Adiciona classe para efeito visual
                    this.classList.add('clicked');
                    setTimeout(() => {
                        this.classList.remove('clicked');
                    }, 500);
                    
                    // Mensagem no console para debugging
                    console.log('Link clicado:', this.innerText || this.innerHTML);
                    
                    // Alerta para dropdown do usuário
                    if (this.closest('.dropdown-menu')) {
                        alert(`Menu: ${this.innerText.trim()}`);
                    } else {
                        alert(`Link: ${this.innerText.trim() || 'Navegação'}`);
                    }
                }
            });
            
            // Marca o link como já tendo recebido evento
            link.setAttribute('data-event-added', 'true');
        });
        
        // Adicionar eventos para badges e notificações
        document.querySelectorAll('.notification-badge:not([data-event-added]), .badge:not([data-event-added])').forEach(badge => {
            badge.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Adiciona classe para efeito visual
                this.classList.add('clicked');
                setTimeout(() => {
                    this.classList.remove('clicked');
                }, 500);
                
                if (this.querySelector('.fa-bell')) {
                    alert('Notificações: 3 novas notificações');
                } else if (this.querySelector('.fa-envelope')) {
                    alert('Mensagens: 7 novas mensagens');
                } else {
                    alert('Informação visualizada');
                }
            });
            
            badge.setAttribute('data-event-added', 'true');
        });
    }
    
    // Navegação do sidebar - atualizada para mostrar as seções corretas
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Adiciona classe para efeito visual
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 500);
            
            // Remover classe ativa de todos os itens
            navItems.forEach(i => i.classList.remove('active'));
            
            // Adicionar classe ativa ao item clicado
            this.classList.add('active');
            
            // Obter a página a ser exibida
            const page = this.getAttribute('data-page');
            console.log(`Navegando para: ${page}`);
            
            // Esconder todas as seções
            document.querySelectorAll('.page-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Mostrar a seção correspondente
            const pageSection = document.getElementById(`${page}-content`);
            if (pageSection) {
                pageSection.classList.add('active');
            }
            
            // Alerta para navegação
            alert(`Navegando para seção: ${page}`);
        });
    });
    
    // Configura o botão de toggle do menu
    const toggleSidebarBtn = document.querySelector('.toggle-sidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function() {
            // Adiciona classe para efeito visual
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 500);
            
            const sidebar = document.querySelector('.sidebar');
            const mainContent = document.querySelector('.main-content');
            
            sidebar.classList.toggle('minimized');
            if (sidebar.classList.contains('minimized')) {
                sidebar.style.width = '100px';
                mainContent.style.marginLeft = '100px';
                
                // Esconder textos
                document.querySelectorAll('.sidebar-nav-item span, .sidebar-header h3').forEach(el => {
                    el.style.display = 'none';
                });
                
                // Centralizar ícones
                document.querySelectorAll('.sidebar-nav-item').forEach(el => {
                    el.style.justifyContent = 'center';
                    el.style.padding = '1rem';
                });
                
                document.querySelectorAll('.sidebar-nav-item i').forEach(el => {
                    el.style.marginRight = '0';
                });
                
                // Mostrar alerta
                alert('Menu lateral minimizado');
            } else {
                sidebar.style.width = '250px';
                mainContent.style.marginLeft = '250px';
                
                // Mostrar textos
                document.querySelectorAll('.sidebar-nav-item span, .sidebar-header h3').forEach(el => {
                    el.style.display = 'inline';
                });
                
                // Voltar layout dos itens
                document.querySelectorAll('.sidebar-nav-item').forEach(el => {
                    el.style.justifyContent = 'flex-start';
                    el.style.padding = '0.8rem 1.5rem';
                });
                
                document.querySelectorAll('.sidebar-nav-item i').forEach(el => {
                    el.style.marginRight = '0.8rem';
                });
                
                // Mostrar alerta
                alert('Menu lateral expandido');
            }
        });
    }
    
    // Ativa o botão de nova chamada
    const newCallBtn = document.getElementById('new-call-btn');
    if (newCallBtn) {
        newCallBtn.addEventListener('click', function() {
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 500);
            
            alert('Iniciando nova chamada...');
        });
    }
    
    // Inicializar gráficos
    const callsCtx = document.getElementById('callsChart');
    const statusCtx = document.getElementById('statusChart');
    
    if (callsCtx) {
        // Gráfico de linha para chamadas
        const callsChart = new Chart(callsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Chamadas Realizadas',
                    lineTension: 0.3,
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    borderColor: 'rgba(78, 115, 223, 1)',
                    pointRadius: 3,
                    pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                    pointBorderColor: 'rgba(78, 115, 223, 1)',
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
                    pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                    pointHitRadius: 10,
                    pointBorderWidth: 2,
                    data: [1200, 1800, 2400, 3200, 4000, 4500, 5200],
                }],
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            maxTicksLimit: 5,
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                        }
                    }
                }
            }
        });
    }
    
    if (statusCtx) {
        // Gráfico de pizza para status
        const statusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Concluídas', 'Agendadas', 'Não Atendidas', 'Canceladas'],
                datasets: [{
                    data: [55, 15, 20, 10],
                    backgroundColor: ['#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
                    hoverBackgroundColor: ['#169a6f', '#2c9faf', '#dda20a', '#be3a2d'],
                    hoverBorderColor: "rgba(234, 236, 244, 1)",
                }],
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                cutout: '60%',
            }
        });
    }
    
    // Inicializar tooltips do Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    if (typeof bootstrap !== 'undefined') {
        const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        });
    }
    
    // Adicionar eventos iniciais
    adicionarEventosBotoes();
    
    // Verificar se as imagens foram carregadas corretamente
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            console.log('Erro ao carregar imagem:', this.src);
            if (this.classList.contains('logo') && !this.getAttribute('data-fallback-applied')) {
                this.setAttribute('data-fallback-applied', 'true');
                this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTIgMS45OTJoM2EyIDIgMCAwIDEgMiAydjE2YTIgMiAwIDAgMS0yIDJIOGEyIDIgMCAwIDEtMi0ydi0xNmEyIDIgMCAwIDEgMi0yaDF2LTJoMnYyeiI+PC9wYXRoPjxyZWN0IHg9IjkiIHk9IjEzIiB3aWR0aD0iNCIgaGVpZ2h0PSI2Ij48L3JlY3Q+PGNpcmNsZSBjeD0iMTEiIGN5PSI4IiByPSIyIj48L2NpcmNsZT48L3N2Zz4=';
            } else if (this.classList.contains('user-avatar') && !this.getAttribute('data-fallback-applied')) {
                this.setAttribute('data-fallback-applied', 'true');
                this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjNGU3M2RmIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLXVzZXIiPjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIj48L3BhdGg+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ij48L2NpcmNsZT48L3N2Zz4=';
            }
        });
    });
    
    // Mostrar mensagem de boas-vindas com domínio correto
    setTimeout(() => {
        alert('Bem-vindo à Plataforma DisparoSeguro!\n\nTodos os botões e elementos são clicáveis e mostrarão alertas para demonstrar a funcionalidade.');
    }, 1000);
    
    // Verificar conexão com o WebSocket
    try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.hostname;
        const wsPort = 8765;
        const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}`;
        
        console.log(`Tentando conectar ao WebSocket: ${wsUrl}`);
        
        // Simular uma autenticação básica
        const dummyToken = btoa(JSON.stringify({
            sub: 'admin',
            exp: Date.now() + 3600000 // 1 hora no futuro
        }));
        
        setTimeout(() => {
            console.log("A conexão WebSocket seria estabelecida em um ambiente completo");
        }, 2000);
    } catch (error) {
        console.error("Erro ao conectar ao WebSocket:", error);
    }
});
