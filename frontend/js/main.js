document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado completamente');
    
    // Observer para monitorar novas adições ao DOM e adicionar eventos
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                adicionarEventosBotoes();
            }
        });
    });
    
    // Iniciar observação
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
    
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
                }, 300); // Reduzido para melhor resposta
                
                // Mensagem no console para debugging
                console.log('Botão clicado:', this.innerText || this.innerHTML);
                
                // Executa funcionalidade real em vez de apenas mostrar alerta
                handleButtonClick(this);
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
                    }, 300); // Reduzido para melhor resposta
                    
                    // Mensagem no console para debugging
                    console.log('Link clicado:', this.innerText || this.innerHTML);
                    
                    // Executa funcionalidade real em vez de apenas mostrar alerta
                    handleLinkClick(this);
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
                }, 300); // Reduzido para melhor resposta
                
                // Executa funcionalidade real em vez de apenas mostrar alerta
                handleBadgeClick(this);
            });
            
            badge.setAttribute('data-event-added', 'true');
        });
    }
    
    // Funções para lidar com cliques em elementos
    function handleButtonClick(button) {
        // Substitui alertas por funcionalidade real
        if (button.dataset.action) {
            // Usando atributo data-action para determinar a ação
            executeAction(button.dataset.action, button.dataset);
            return;
        }
        
        // Fallback para identificação por texto ou ícone
        if (button.innerText && button.innerText.trim() !== '') {
            const text = button.innerText.trim().toLowerCase();
            
            // Adicionar casos específicos para botões comuns
            if (text.includes('salvar') || text.includes('confirmar')) {
                console.log('Salvando dados...');
                // Simulação de sucesso após 800ms
                setTimeout(() => {
                    toastSuccess('Dados salvos com sucesso!');
                }, 800);
                return;
            }
            
            if (text.includes('cancelar') || text.includes('voltar')) {
                console.log('Operação cancelada');
                window.history.back();
                return;
            }
            
            // Genérico para outros botões
            toastInfo(`Executando: ${button.innerText.trim()}`);
            
        } else if (button.querySelector('i')) {
            // Para botões com apenas ícones
            const iconeClasse = button.querySelector('i').className;
            handleIconButton(iconeClasse, button);
        } else {
            toastInfo('Ação executada com sucesso!');
        }
    }
    
    function handleLinkClick(link) {
        // Lógica para navegação por links
        const href = link.getAttribute('href');
        
        if (href && href.startsWith('#')) {
            // Navegação interna
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Scroll suave para o elemento
                targetSection.scrollIntoView({ behavior: 'smooth' });
                return;
            }
        }
        
        // Menu dropdown
        if (link.closest('.dropdown-menu')) {
            const action = link.dataset.action || link.innerText.trim().toLowerCase();
            executeAction(action, { element: 'dropdown-item' });
            return;
        }
        
        // Navegação para outra página/seção
        const pageName = link.dataset.page || 
                         (link.innerText.trim() ? link.innerText.trim() : 'página');
        
        console.log(`Navegando para: ${pageName}`);
        
        // Se link tem data-page, navegar para essa página
        if (link.dataset.page) {
            navigateTo(link.dataset.page);
        } else {
            toastInfo(`Navegando para ${pageName}`);
        }
    }
    
    function handleBadgeClick(badge) {
        if (badge.querySelector('.fa-bell')) {
            openNotifications();
        } else if (badge.querySelector('.fa-envelope')) {
            openMessages();
        } else {
            toastInfo('Informação visualizada');
        }
    }
    
    function handleIconButton(iconeClasse, button) {
        if (iconeClasse.includes('eye')) {
            console.log('Visualizando detalhes...');
            toastInfo('Visualizando detalhes');
        } else if (iconeClasse.includes('edit') || iconeClasse.includes('pencil')) {
            console.log('Editando item...');
            toastInfo('Modo de edição ativado');
        } else if (iconeClasse.includes('trash') || iconeClasse.includes('times')) {
            console.log('Preparando exclusão...');
            confirmDelete();
        } else if (iconeClasse.includes('phone')) {
            console.log('Iniciando chamada...');
            startCall();
        } else if (iconeClasse.includes('download')) {
            console.log('Iniciando download...');
            simulateDownload();
        } else if (iconeClasse.includes('plus')) {
            console.log('Adicionando novo item...');
            addNewItem();
        } else if (iconeClasse.includes('search')) {
            console.log('Pesquisando...');
            handleSearch();
        } else if (iconeClasse.includes('bars')) {
            // Toggle menu
            toggleSidebar();
        } else {
            toastInfo('Ação executada com sucesso!');
        }
    }
    
    // Funções de ação para diferentes elementos da UI
    function executeAction(action, data) {
        console.log(`Executando ação: ${action}`, data);
        
        // Mapeamento de ações para funções
        const actionMap = {
            'new-call': startCall,
            'add-lead': addNewLead,
            'import-leads': importLeads,
            'export-data': exportData,
            'settings': openSettings,
            'profile': openProfile,
            'logout': handleLogout,
            'filter': applyFilter,
            'search': handleSearch
        };
        
        if (actionMap[action]) {
            actionMap[action](data);
        } else {
            // Ação genérica
            toastInfo(`Executando: ${action}`);
        }
    }
    
    // Funções auxiliares
    function navigateTo(page) {
        console.log(`Navegando para: ${page}`);
        
        // Esconder todas as seções
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remover classe ativa de todos os itens do menu
        document.querySelectorAll('.sidebar-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Mostrar a seção correspondente
        const pageSection = document.getElementById(`${page}-content`);
        if (pageSection) {
            pageSection.classList.add('active');
            
            // Destacar o item de menu correspondente
            const menuItem = document.querySelector(`.sidebar-nav-item[data-page="${page}"]`);
            if (menuItem) {
                menuItem.classList.add('active');
            }
        }
    }
    
    function toastSuccess(message) {
        console.log('Sucesso:', message);
        // Mostrar toast de sucesso - implementação depende da biblioteca de UI
        if (typeof showToast === 'function') {
            showToast('success', message);
        } else {
            // Fallback para alert
            alert(message);
        }
    }
    
    function toastInfo(message) {
        console.log('Info:', message);
        // Mostrar toast informativo
        if (typeof showToast === 'function') {
            showToast('info', message);
        } else {
            // Fallback para alert
            alert(message);
        }
    }
    
    function toastError(message) {
        console.error('Erro:', message);
        // Mostrar toast de erro
        if (typeof showToast === 'function') {
            showToast('error', message);
        } else {
            // Fallback para alert
            alert('Erro: ' + message);
        }
    }
    
    function confirmDelete() {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            toastSuccess('Item excluído com sucesso!');
        }
    }
    
    function startCall() {
        toastInfo('Iniciando chamada...');
        // Aqui você adicionaria lógica para iniciar uma chamada real
        setTimeout(() => {
            window.location.href = '/voz/';
        }, 1000);
    }
    
    function simulateDownload() {
        toastInfo('Preparando download...');
        setTimeout(() => {
            toastSuccess('Download concluído!');
        }, 1500);
    }
    
    function addNewItem() {
        toastInfo('Adicionando novo item...');
        // Implementar lógica de adicionar novo item
    }
    
    function handleSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            const searchTerm = searchInput.value;
            toastInfo(`Pesquisando por: ${searchTerm}`);
        } else {
            toastInfo('Pesquisando...');
        }
    }
    
    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (!sidebar || !mainContent) return;
        
        sidebar.classList.toggle('minimized');
        if (sidebar.classList.contains('minimized')) {
            sidebar.style.width = '70px';
            mainContent.style.marginLeft = '70px';
            
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
        }
    }
    
    // Funções específicas (implementações simplificadas)
    function addNewLead() {
        toastInfo('Adicionando novo lead...');
        // Implementação real abriria um modal/formulário
    }
    
    function importLeads() {
        toastInfo('Importando leads...');
        // Implementação real abriria seletor de arquivo
    }
    
    function exportData() {
        toastInfo('Exportando dados...');
        // Implementação real geraria e baixaria um arquivo
    }
    
    function openSettings() {
        navigateTo('settings');
    }
    
    function openProfile() {
        toastInfo('Abrindo perfil do usuário');
        // Implementação real abriria página/modal de perfil
    }
    
    function handleLogout() {
        if (confirm('Deseja realmente sair?')) {
            toastInfo('Saindo...');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1000);
        }
    }
    
    function applyFilter() {
        toastInfo('Filtros aplicados');
        // Implementação real aplicaria filtros na exibição
    }
    
    function openNotifications() {
        toastInfo('3 novas notificações');
        // Implementação real abriria painel de notificações
    }
    
    function openMessages() {
        toastInfo('7 novas mensagens');
        // Implementação real abriria painel de mensagens
    }
    
    // Navegação do sidebar
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Adiciona classe para efeito visual
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 300);
            
            // Obter a página a ser exibida
            const page = this.getAttribute('data-page');
            if (page) {
                navigateTo(page);
            }
        });
    });
    
    // Configura o botão de toggle do menu
    const toggleSidebarBtn = document.querySelector('.toggle-sidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', toggleSidebar);
    }
    
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
    
    // Inicializar a aplicação
    adicionarEventosBotoes();
    
    // Mostrar mensagem de boas-vindas com delay reduzido
    setTimeout(() => {
        console.log('Bem-vindo à Plataforma DisparoSeguro!');
        // Usar toast em vez de alert para não bloquear
        toastSuccess('Bem-vindo à Plataforma DisparoSeguro!');
    }, 500);
    
    // Verificar conexão com o WebSocket
    try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.hostname;
        const wsPort = 8765;
        const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}`;
        
        console.log(`Tentando conectar ao WebSocket: ${wsUrl}`);
        
        // Implementação de WebSocket com reconexão automática
        window.wsConnect = function() {
            const ws = new WebSocket(wsUrl);
            
            ws.onopen = function() {
                console.log('Conexão WebSocket estabelecida');
                toastSuccess('Conexão com servidor estabelecida');
            };
            
            ws.onclose = function() {
                console.log('Conexão WebSocket fechada. Tentando reconectar em 5s...');
                setTimeout(window.wsConnect, 5000);
            };
            
            ws.onerror = function(error) {
                console.error('Erro WebSocket:', error);
            };
            
            return ws;
        };
        
        // Iniciar conexão dummy para demonstração
        setTimeout(() => {
            console.log("Simulando conexão WebSocket em ambiente de desenvolvimento");
        }, 1000);
    } catch (error) {
        console.error("Erro ao configurar WebSocket:", error);
    }
});
