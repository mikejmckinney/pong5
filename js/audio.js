/**
 * Audio Manager - Handles all game sound effects using Web Audio API
 */

class AudioManager {
  constructor() {
    // Initialize Web Audio API
    this.audioContext = null;
    this.masterGain = null;
    this.initialized = false;
    
    // Load settings from localStorage
    const savedMuted = localStorage.getItem('pong_audio_muted');
    const savedVolume = localStorage.getItem('pong_audio_volume');
    
    this.muted = savedMuted === 'true';
    this.volume = savedVolume ? parseFloat(savedVolume) : CONFIG.AUDIO.VOLUME;
    
    // Sound cache
    this.sounds = {};
  }
  
  /**
   * Initialize audio context (must be called after user interaction)
   */
  init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.updateVolume();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }
  
  /**
   * Update master volume
   */
  updateVolume() {
    if (!this.masterGain) return;
    this.masterGain.gain.value = this.muted ? 0 : this.volume;
  }
  
  /**
   * Toggle mute
   */
  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('pong_audio_muted', this.muted);
    this.updateVolume();
    return this.muted;
  }
  
  /**
   * Set volume (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('pong_audio_volume', this.volume);
    this.updateVolume();
  }
  
  /**
   * Play a simple tone
   */
  playTone(frequency, duration, type = 'sine', volume = 1.0) {
    if (!this.initialized || this.muted) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
  
  /**
   * Play paddle hit sound
   */
  playPaddleHit() {
    this.init();
    const baseFreq = 400 + Math.random() * 200;
    this.playTone(baseFreq, 0.1, 'square', 0.5);
  }
  
  /**
   * Play wall bounce sound
   */
  playWallBounce() {
    this.init();
    this.playTone(200, 0.1, 'square', 0.3);
  }
  
  /**
   * Play score sound (player scores)
   */
  playScore() {
    this.init();
    if (!this.initialized || this.muted) return;
    
    // Ascending arpeggio
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'square', 0.4);
      }, index * 100);
    });
  }
  
  /**
   * Play lose sound (opponent scores)
   */
  playLose() {
    this.init();
    if (!this.initialized || this.muted) return;
    
    // Descending sad tone
    const notes = [523.25, 392.00, 329.63]; // C5, G4, E4
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'sine', 0.3);
      }, index * 100);
    });
  }
  
  /**
   * Play game start sound
   */
  playGameStart() {
    this.init();
    if (!this.initialized || this.muted) return;
    
    // Quick ascending arpeggio
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'square', 0.35);
      }, index * 80);
    });
  }
  
  /**
   * Play game over sound
   */
  playGameOver(won) {
    this.init();
    if (!this.initialized || this.muted) return;
    
    if (won) {
      // Victory fanfare
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        setTimeout(() => {
          this.playTone(freq, 0.3, 'square', 0.4);
        }, index * 150);
      });
    } else {
      // Defeat sound
      const notes = [392.00, 329.63, 261.63]; // G4, E4, C4
      notes.forEach((freq, index) => {
        setTimeout(() => {
          this.playTone(freq, 0.4, 'sine', 0.3);
        }, index * 200);
      });
    }
  }
  
  /**
   * Play menu navigation sound
   */
  playMenuClick() {
    this.init();
    this.playTone(800, 0.05, 'square', 0.2);
  }
  
  /**
   * Play countdown beep
   */
  playCountdown(count) {
    this.init();
    const freq = count === 0 ? 1000 : 600; // Higher pitch for "GO"
    this.playTone(freq, 0.1, 'square', 0.4);
  }
}
