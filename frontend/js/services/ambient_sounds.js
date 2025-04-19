// frontend/js/services/ambient_sounds.js
/**
 * AmbientSoundManager
 * 
 * Classe para gerenciar sons de ambiente para simular um call center
 * ou outros ambientes durante chamadas para aumentar a naturalidade
 */
class AmbientSoundManager {
  /**
   * Cria uma nova instância do gerenciador de sons ambientes
   * @param {Object} options - Opções de configuração
   */
  constructor(options = {}) {
    // Configurações padrão
    this.settings = {
      basePath: options.basePath || '/assets/sounds/',
      defaultVolume: options.defaultVolume || 0.2,
      crossfadeDuration: options.crossfadeDuration || 1000,
      useAnalytics: options.useAnalytics !== false,
      preload: options.preload !== false
    };
    
    // Sons disponíveis
    this.sounds = {
      'call_center_busy': { 
        path: 'call_center_busy.mp3',
        description: 'Call Center Ocupado',
        loop: true,
        volume: 0.2
      },
      'office_talk': { 
        path: 'office_talk.mp3',
        description: 'Conversas de Escritório',
        loop: true,
        volume: 0.15
      },
      'keyboard_typing': { 
        path: 'keyboard_typing.mp3',
        description: 'Digitação de Teclado',
        loop: true,
        volume: 0.1
      },
      'call_transfer': { 
        path: 'call_transfer.mp3',
        description: 'Transferência de Chamada',
        loop: false,
        volume: 0.3
      },
      'hold_music': { 
        path: 'hold_music.mp3',
        description: 'Música de Espera',
        loop: true,
        volume: 0.25
      },
      'phone_ringing': { 
        path: 'phone_ringing.mp3',
        description: 'Telefone Tocando',
        loop: true,
        volume: 0.3
      },
      'busy_signal': { 
        path: 'busy_signal.mp3',
        description: 'Sinal de Ocupado',
        loop: true,
        volume: 0.3
      },
      'cafe_ambience': { 
        path: 'cafe_ambience.mp3',
        description: 'Ambiente de Café',
        loop: true,
        volume: 0.15
      },
      'restaurant': { 
        path: 'restaurant.mp3',
        description: 'Restaurante',
        loop: true,
        volume: 0.2
      },
      'street_traffic': { 
        path: 'street_traffic.mp3',
        description: 'Tráfego de Rua',
        loop: true,
        volume: 0.15
      },
      'office_printer': { 
        path: 'office_printer.mp3',
        description: 'Impressora de Escritório',
        loop: false,
        volume: 0.15
      },
      'notification': { 
        path: 'notification.mp3',
        description: 'Notificação',
        loop: false,
        volume: 0.3
      }
    };
    
    // Sons ativos no momento
    this.activeSounds = {};
    
    // Estatísticas
    this.stats = {
      played: {},
      totalPlays: 0
    };
    
    // Cache de áudio
    this.audioCache = {};
    
    // Mixer master
    this.masterVolume = options.masterVolume || 1.0;
    
    // Estado do gerenciador
    this.enabled = true;
    
    // Contexto de áudio Web Audio API para efeitos avançados
    this.audioContext = null;
    this.masterGain = null;
    this.effectNodes = {};
    
    // Inicializar
    this._init();
  }
  
  /**
   * Inicializa o gerenciador
   * @private
   */
  _init() {
    // Precarregar sons se configurado
    if (this.settings.preload) {
      this._preloadSounds();
    }
    
    // Inicializar Audio Context se suportado
    this._initAudioContext();
    
    console.log('Gerenciador de Sons Ambiente inicializado');
  }
  
  /**
   * Precarrega sons para uso futuro
   * @private
   */
  _preloadSounds() {
    console.log('Precarregando sons ambiente...');
    Object.keys(this.sounds).forEach(soundName => {
      this._getAudio(soundName);
    });
  }
  
  /**
   * Inicializa o Audio Context para processamento avançado
   * @private
   */
  _initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      
      if (AudioContext) {
        this.audioContext = new AudioContext();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.masterVolume;
        this.masterGain.connect(this.audioContext.destination);
        
        // Configurar efeitos
        this._setupEffects();
      }
    } catch (e) {
      console.warn('Web Audio API não suportada. Usando fallback.', e);
    }
  }
  
  /**
   * Configura nós de efeito para processamento de áudio
   * @private
   */
  _setupEffects() {
    if (!this.audioContext) return;
    
    // Reverb (ambiente)
    try {
      const convolver = this.audioContext.createConvolver();
      // Em produção, carregaria um impulso real aqui
      this.effectNodes.reverb = convolver;
    } catch (e) {
      console.warn('Falha ao criar efeito de reverb', e);
    }
    
    // Compressor (nivelar volume)
    try {
      const compressor = this.audioContext.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      compressor.connect(this.masterGain);
      this.effectNodes.compressor = compressor;
    } catch (e) {
      console.warn('Falha ao criar compressor', e);
    }
  }
  
  /**
   * Obtém elemento de áudio do cache ou cria um novo
   * @param {string} soundName - Nome do som
   * @returns {HTMLAudioElement} Elemento de áudio
   * @private
   */
  _getAudio(soundName) {
    if (!this.sounds[soundName]) {
      console.error(`Som não encontrado: ${soundName}`);
      return null;
    }
    
    // Usar cache se disponível
    if (this.audioCache[soundName]) {
      return this.audioCache[soundName];
    }
    
    // Criar novo elemento de áudio
    const soundConfig = this.sounds[soundName];
    const audio = new Audio();
    
    // Configurar
    audio.src = `${this.settings.basePath}${soundConfig.path}`;
    audio.loop = soundConfig.loop || false;
    audio.volume = (soundConfig.volume || this.settings.defaultVolume) * this.masterVolume;
    
    // Configurar manipuladores de eventos
    audio.addEventListener('error', (e) => {
      console.error(`Erro ao carregar som ${soundName}: ${e.target.error.code}`);
      
      // Verificar diferentes formatos como fallback
      if (audio.src.endsWith('.mp3')) {
        console.log(`Tentando formato alternativo para ${soundName}`);
        audio.src = audio.src.replace('.mp3', '.ogg');
      } else if (audio.src.endsWith('.ogg')) {
        audio.src = audio.src.replace('.ogg', '.wav');
      }
    });
    
    // Adicionar ao cache
    this.audioCache[soundName] = audio;
    return audio;
  }
  
  /**
   * Reproduz um som ambiente
   * @param {string} soundName - Nome do som para reproduzir
   * @param {Object} options - Opções para reprodução
   * @param {boolean} options.loop - Se o som deve ser reproduzido em loop
   * @param {number} options.volume - Volume do som (0.0 a 1.0)
   * @param {number} options.duration - Duração máxima em ms (0 para ilimitado)
   * @param {boolean} options.exclusive - Se deve parar outros sons do mesmo tipo
   * @returns {string} ID único para controlar o som reproduzido
   */
  playSound(soundName, options = {}) {
    if (!this.enabled || !this.sounds[soundName]) {
      return null;
    }
    
    // Gerar ID único para esta reprodução
    const playId = `${soundName}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Obter elemento de áudio
    const audio = this._getAudio(soundName);
    if (!audio) {
      return null;
    }
    
    // Aplicar opções
    const soundConfig = this.sounds[soundName];
    audio.loop = options.loop !== undefined ? options.loop : soundConfig.loop;
    
    const volume = options.volume !== undefined ? 
      options.volume : soundConfig.volume || this.settings.defaultVolume;
    
    // Se exclusive, parar outros sons do mesmo tipo
    if (options.exclusive) {
      this.stopSound(soundName);
    }
    
    // Aplicar volume com fade in
    audio.volume = 0;
    const targetVolume = volume * this.masterVolume;
    
    // Usar Web Audio API se disponível
    let source = null;
    let gainNode = null;
    
    if (this.audioContext && false) { // Desabilitado por enquanto para compatibilidade
      try {
        // Criar nova source
        source = this.audioContext.createMediaElementSource(audio);
        
        // Criar gain para este som específico
        gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0; // Começar silencioso para fade
        
        // Conectar
        source.connect(gainNode);
        
        // Conectar ao compressor ou direto ao master
        if (this.effectNodes.compressor) {
          gainNode.connect(this.effectNodes.compressor);
        } else {
          gainNode.connect(this.masterGain);
        }
        
        // Fade in
        gainNode.gain.linearRampToValueAtTime(
          targetVolume,
          this.audioContext.currentTime + (this.settings.crossfadeDuration / 1000)
        );
      } catch (e) {
        console.warn('Falha ao usar Web Audio API, usando fallback', e);
        source = null;
        gainNode = null;
      }
    }
    
    // Fallback para método padrão se Web Audio falhar
    if (!source) {
      // Realizar fade in
      const fadeStep = 0.05;
      const fadeInterval = this.settings.crossfadeDuration / (targetVolume / fadeStep);
      
      const fadeInInterval = setInterval(() => {
        if (audio.volume < targetVolume) {
          audio.volume = Math.min(audio.volume + fadeStep, targetVolume);
        } else {
          clearInterval(fadeInInterval);
        }
      }, fadeInterval);
    }
    
    // Iniciar reprodução
    const playPromise = audio.play();
    
    // Lidar com possíveis erros (navegadores bloqueiam autoplay)
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn(`Não foi possível reproduzir som ${soundName}:`, error);
      });
    }
    
    // Configurar timer se duração especificada
    let durationTimer = null;
    if (options.duration && options.duration > 0) {
      durationTimer = setTimeout(() => {
        this.fadeOutAndStop(playId);
      }, options.duration);
    }
    
    // Armazenar em sons ativos
    this.activeSounds[playId] = {
      element: audio,
      name: soundName,
      startTime: Date.now(),
      options: { ...options },
      durationTimer,
      source,
      gainNode
    };
    
    // Atualizar estatísticas
    this.stats.totalPlays++;
    this.stats.played[soundName] = (this.stats.played[soundName] || 0) + 1;
    
    // Retornar ID
    return playId;
  }
  
  /**
   * Reproduz um ambiente completo (combinação de sons)
   * @param {string} environmentName - Nome do ambiente predefinido
   * @returns {Array<string>} IDs dos sons reproduzidos
   */
  playEnvironment(environmentName) {
    // Ambientes predefinidos
    const environments = {
      'call_center': [
        { sound: 'call_center_busy', volume: 0.15, exclusive: true },
        { sound: 'keyboard_typing', volume: 0.08, exclusive: true }
      ],
      'office': [
        { sound: 'office_talk', volume: 0.12, exclusive: true },
        { sound: 'keyboard_typing', volume: 0.05, exclusive: true },
        { sound: 'office_printer', volume: 0.1, duration: 8000 }
      ],
      'on_hold': [
        { sound: 'hold_music', volume: 0.2, exclusive: true }
      ],
      'cafe': [
        { sound: 'cafe_ambience', volume: 0.15, exclusive: true }
      ],
      'busy': [
        { sound: 'busy_signal', volume: 0.3, exclusive: true, duration: 5000 }
      ],
      'outgoing_call': [
        { sound: 'phone_ringing', volume: 0.25, exclusive: true }
      ],
      'street': [
        { sound: 'street_traffic', volume: 0.15, exclusive: true }
      ],
      'restaurant': [
        { sound: 'restaurant', volume: 0.15, exclusive: true }
      ]
    };
    
    // Verificar se ambiente existe
    if (!environments[environmentName]) {
      console.error(`Ambiente não encontrado: ${environmentName}`);
      return [];
    }
    
    // Reproduzir cada som do ambiente
    const soundIds = [];
    environments[environmentName].forEach(soundConfig => {
      const id = this.playSound(soundConfig.sound, {
        volume: soundConfig.volume,
        loop: soundConfig.loop !== false,
        duration: soundConfig.duration || 0,
        exclusive: soundConfig.exclusive || false
      });
      
      if (id) {
        soundIds.push(id);
      }
    });
    
    return soundIds;
  }
  
  /**
   * Para um som específico
   * @param {string} soundId - ID do som ou nome do som
   * @param {boolean} fadeOut - Se deve fazer fade out antes de parar
   * @returns {boolean} Se a operação foi bem-sucedida
   */
  stopSound(soundId, fadeOut = true) {
    // Se for o nome de um som, parar todas as instâncias
    if (this.sounds[soundId]) {
      let stopped = false;
      
      Object.keys(this.activeSounds).forEach(id => {
        if (this.activeSounds[id].name === soundId) {
          this._stopById(id, fadeOut);
          stopped = true;
        }
      });
      
      return stopped;
    }
    
    // Caso contrário, parar por ID
    return this._stopById(soundId, fadeOut);
  }
  
  /**
   * Para todos os sons ativos
   * @param {boolean} fadeOut - Se deve fazer fade out antes de parar
   */
  stopAllSounds(fadeOut = true) {
    Object.keys(this.activeSounds).forEach(id => {
      this._stopById(id, fadeOut);
    });
  }
  
  /**
   * Realiza fade out e depois para o som
   * @param {string} soundId - ID do som
   * @param {number} duration - Duração do fade em ms
   */
  fadeOutAndStop(soundId, duration = 1000) {
    if (!this.activeSounds[soundId]) {
      return false;
    }
    
    const sound = this.activeSounds[soundId];
    const audio = sound.element;
    
    // Limpar timer se existir
    if (sound.durationTimer) {
      clearTimeout(sound.durationTimer);
    }
    
    // Usar Web Audio API se disponível
    if (sound.gainNode && sound.source) {
      try {
        // Fade out usando Web Audio API
        sound.gainNode.gain.linearRampToValueAtTime(
          0,
          this.audioContext.currentTime + (duration / 1000)
        );
        
        // Parar após fade
        setTimeout(() => {
          this._cleanupSound(soundId);
        }, duration);
        
        return true;
      } catch (e) {
        console.warn('Falha ao fazer fade com Web Audio, usando fallback', e);
      }
    }
    
    // Fallback para método padrão
    const fadeStep = 0.05;
    const initialVolume = audio.volume;
    const fadeInterval = duration / (initialVolume / fadeStep);
    
    const fadeOutInterval = setInterval(() => {
      if (audio.volume > fadeStep) {
        audio.volume -= fadeStep;
      } else {
        clearInterval(fadeOutInterval);
        this._cleanupSound(soundId);
      }
    }, fadeInterval);
    
    return true;
  }
  
  /**
   * Para um som pelo ID
   * @param {string} id - ID do som
   * @param {boolean} fadeOut - Se deve fazer fade out
   * @returns {boolean} Se a operação foi bem-sucedida
   * @private
   */
  _stopById(id, fadeOut) {
    if (!this.activeSounds[id]) {
      return false;
    }
    
    if (fadeOut) {
      return this.fadeOutAndStop(id, this.settings.crossfadeDuration);
    } else {
      return this._cleanupSound(id);
    }
  }
  
  /**
   * Limpa e remove um som ativo
   * @param {string} soundId - ID do som
   * @returns {boolean} Se a operação foi bem-sucedida
   * @private
   */
  _cleanupSound(soundId) {
    if (!this.activeSounds[soundId]) {
      return false;
    }
    
    const sound = this.activeSounds[soundId];
    const audio = sound.element;
    
    // Parar reprodução
    audio.pause();
    
    // Reset
    audio.currentTime = 0;
    
    // Limpar timer se existir
    if (sound.durationTimer) {
      clearTimeout(sound.durationTimer);
    }
    
    // Limpar conexões Web Audio se existirem
    if (sound.source && sound.gainNode) {
      try {
        sound.source.disconnect();
        sound.gainNode.disconnect();
      } catch (e) {
        console.warn('Erro ao desconectar nós de áudio', e);
      }
    }
    
    // Remover da lista de ativos
    delete this.activeSounds[soundId];
    
    return true;
  }
  
  /**
   * Altera o volume master
   * @param {number} volume - Novo volume (0.0 a 1.0)
   */
  setMasterVolume(volume) {
    // Limitar entre 0 e 1
    volume = Math.max(0, Math.min(1, volume));
    this.masterVolume = volume;
    
    // Atualizar gain node se disponível
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
    
    // Atualizar volume de todos os sons ativos
    Object.keys(this.activeSounds).forEach(id => {
      const sound = this.activeSounds[id];
      const targetVolume = (sound.options.volume || 
                          this.sounds[sound.name].volume || 
                          this.settings.defaultVolume) * volume;
                          
      // Usar gain node se disponível, senão atualizar diretamente
      if (sound.gainNode) {
        sound.gainNode.gain.value = targetVolume;
      } else {
        sound.element.volume = targetVolume;
      }
    });
  }
  
  /**
   * Habilita ou desabilita completamente o gerenciador
   * @param {boolean} enabled - Se o gerenciador deve estar ativo
   */
  setEnabled(enabled) {
    const wasEnabled = this.enabled;
    this.enabled = enabled;
    
    // Se desabilitado, parar todos os sons
    if (wasEnabled && !enabled) {
      this.stopAllSounds(true);
    }
  }
  
  /**
   * Retorna todos os sons disponíveis
   * @returns {Array<Object>} Lista de sons com metadados
   */
  getAvailableSounds() {
    return Object.keys(this.sounds).map(key => ({
      id: key,
      ...this.sounds[key]
    }));
  }
  
  /**
   * Retorna todos os ambientes predefinidos
   * @returns {Array<string>} Lista de ambientes
   */
  getAvailableEnvironments() {
    return [
      'call_center',
      'office',
      'on_hold',
      'cafe',
      'busy',
      'outgoing_call',
      'street',
      'restaurant'
    ];
  }
  
  /**
   * Retorna estatísticas de uso
   * @returns {Object} Estatísticas
   */
  getStats() {
    return {
      ...this.stats,
      activeSounds: Object.keys(this.activeSounds).length
    };
  }
  
  /**
   * Adiciona um som personalizado
   * @param {string} soundId - ID para o som
   * @param {string} path - Caminho para o arquivo de áudio
   * @param {Object} options - Opções para o som
   * @returns {boolean} Se a operação foi bem-sucedida
   */
  addCustomSound(soundId, path, options = {}) {
    if (this.sounds[soundId]) {
      console.warn(`Som ${soundId} já existe e será sobrescrito`);
    }
    
    this.sounds[soundId] = {
      path,
      description: options.description || `Som personalizado ${soundId}`,
      loop: options.loop !== undefined ? options.loop : false,
      volume: options.volume || this.settings.defaultVolume
    };
    
    // Limpar cache para forçar recarregamento
    if (this.audioCache[soundId]) {
      delete this.audioCache[soundId];
    }
    
    return true;
  }
}

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AmbientSoundManager;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return AmbientSoundManager;
  });
} else {
  window.AmbientSoundManager = AmbientSoundManager;
}
