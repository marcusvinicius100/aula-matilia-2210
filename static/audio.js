/**
 * MULTIVERSE - Audio Engine Espacial Procedural
 * 100% sintetizado com Web Audio API nativo.
 * Sem dependências de arquivos de áudio externos.
 */

class CosmicAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = true;
    this.initialized = false;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneFilter = null;
    this.droneGain = null;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
      this.startAmbientSpaceDrone();
    } catch (e) {
      console.warn("Web Audio não suportado ou bloqueado:", e);
    }
  }

  toggleMute() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0.0001 : 0.35;
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.3);
    }
    return !this.isMuted;
  }

  startAmbientSpaceDrone() {
    if (!this.ctx || !this.masterGain) return;

    // Criar osciladores de frequência ultra-baixa (ressonância Schumann espacial)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc2 = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneGain = this.ctx.createGain();

    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(110.5, this.ctx.currentTime); // Ligeiramente desafinado para efeito cósmico

    // Filtro passa-baixa ressonante escuro
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
    this.droneFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    // LFO para modular lentamente o filtro de espaço profundo
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(60, this.ctx.currentTime);
    lfo.connect(this.droneFilter.frequency);

    this.droneGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
    lfo.start();
  }

  // Efeito de Salto Hiperespaço / Warp Drive
  playWarpSound() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Gerador de Ruído para feixe de plasma
    const bufferSize = this.ctx.sampleRate * 2.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(3500, now + 1.2);
    noiseFilter.frequency.exponentialRampToValueAtTime(80, now + 2.5);
    noiseFilter.Q.setValueAtTime(6, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.5, now + 0.8);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Sine sweep ultra ascendente
    const sweep = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    sweep.type = 'sine';
    sweep.frequency.setValueAtTime(80, now);
    sweep.frequency.exponentialRampToValueAtTime(1400, now + 1.0);
    sweep.frequency.exponentialRampToValueAtTime(60, now + 2.2);

    sweepGain.gain.setValueAtTime(0.01, now);
    sweepGain.gain.linearRampToValueAtTime(0.3, now + 0.6);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    sweep.connect(sweepGain);
    sweepGain.connect(this.masterGain);

    noise.start(now);
    sweep.start(now);
    noise.stop(now + 2.5);
    sweep.stop(now + 2.2);
  }

  // Efeito sonoro de hover interativo nas dimensões
  playHoverBlip(freq = 520) {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Efeito sonoro do Buraco Negro (Gravitational Singularity)
  playSingularityDrone() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(45, now);
    osc.frequency.linearRampToValueAtTime(32, now + 1.5);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.5);
  }

  // Tocar nota musical do Sintetizador Gravitacional
  playSynthNote(frequency) {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 3, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  // Efeito sonoro ao ativar o Scanner de Realidades
  playScanTone() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.3);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }
}

window.cosmicAudio = new CosmicAudioEngine();
