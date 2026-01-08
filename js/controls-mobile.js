/**
 * Mobile Controls - Handle touch input for mobile devices
 * Supports drag-based paddle movement with split-screen zones
 */

class MobileControls {
  constructor(canvas) {
    this.canvas = canvas;
    this.isEnabled = this.isTouchDevice();
    
    // Touch state for both paddles
    this.player1Touch = {
      active: false,
      touchId: null,
      startY: 0,
      currentY: 0
    };
    
    this.player2Touch = {
      active: false,
      touchId: null,
      startY: 0,
      currentY: 0
    };
    
    // Target positions for smooth paddle movement
    this.player1TargetY = null;
    this.player2TargetY = null;
    
    // Always position touch zones for visual feedback
    this.updateTouchZonePositions();
    
    if (this.isEnabled) {
      this.setupEventListeners();
      this.preventDefaultGestures();
    }
  }

  /**
   * Update touch zone positions to align with canvas
   */
  updateTouchZonePositions() {
    const updatePositions = () => {
      const rect = this.canvas.getBoundingClientRect();
      const leftZone = document.getElementById('touch-zone-left');
      const rightZone = document.getElementById('touch-zone-right');
      
      if (leftZone && rightZone) {
        const width = rect.width / 2;
        
        leftZone.style.left = `${rect.left}px`;
        leftZone.style.top = `${rect.top}px`;
        leftZone.style.width = `${width}px`;
        leftZone.style.height = `${rect.height}px`;
        
        rightZone.style.left = `${rect.left + width}px`;
        rightZone.style.top = `${rect.top}px`;
        rightZone.style.width = `${width}px`;
        rightZone.style.height = `${rect.height}px`;
      }
    };
    
    // Update on load and resize
    updatePositions();
    window.addEventListener('resize', updatePositions);
    window.addEventListener('orientationchange', () => {
      setTimeout(updatePositions, 100); // Delay to ensure layout is updated
    });
  }

  /**
   * Detect if device supports touch
   */
  isTouchDevice() {
    return ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0) || 
           (navigator.msMaxTouchPoints > 0);
  }

  /**
   * Prevent default browser gestures
   */
  preventDefaultGestures() {
    // Prevent pull-to-refresh and overscroll
    document.body.style.overscrollBehavior = 'none';
    
    // Prevent double-tap zoom - limited to canvas only
    let lastTouchEnd = 0;
    this.canvas.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= CONFIG.DOUBLE_TAP_PREVENT_MS) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
    
    // Prevent pinch zoom
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Prevent context menu on long press
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  /**
   * Setup touch event listeners
   */
  setupEventListeners() {
    // Store bound functions for cleanup
    this.boundHandleTouchStart = (e) => this.handleTouchStart(e);
    this.boundHandleTouchMove = (e) => this.handleTouchMove(e);
    this.boundHandleTouchEnd = (e) => this.handleTouchEnd(e);
    
    this.canvas.addEventListener('touchstart', this.boundHandleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.boundHandleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.boundHandleTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', this.boundHandleTouchEnd, { passive: false });
    
    // Reset touch state when device orientation changes
    this.handleOrientationChange = () => {
      this.player1Touch.active = false;
      this.player1Touch.touchId = null;
      this.player1Touch.startY = 0;
      this.player1Touch.currentY = 0;

      this.player2Touch.active = false;
      this.player2Touch.touchId = null;
      this.player2Touch.startY = 0;
      this.player2Touch.currentY = 0;

      this.player1TargetY = null;
      this.player2TargetY = null;
    };
    window.addEventListener('orientationchange', this.handleOrientationChange);
  }

  /**
   * Get touch zone for a touch position
   * Returns 'left' for player 1, 'right' for player 2
   */
  getTouchZone(clientX) {
    const rect = this.canvas.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const canvasWidth = rect.width;
    
    return relativeX < canvasWidth / 2 ? 'left' : 'right';
  }

  /**
   * Convert client Y to canvas Y coordinate
   */
  clientYToCanvasY(clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const scale = CONFIG.CANVAS_HEIGHT / rect.height;
    return relativeY * scale;
  }

  /**
   * Handle touch start
   */
  handleTouchStart(e) {
    e.preventDefault();
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const zone = this.getTouchZone(touch.clientX);
      const canvasY = this.clientYToCanvasY(touch.clientY);
      
      if (zone === 'left' && !this.player1Touch.active) {
        this.player1Touch.active = true;
        this.player1Touch.touchId = touch.identifier;
        this.player1Touch.startY = canvasY;
        this.player1Touch.currentY = canvasY;
        this.player1TargetY = canvasY;
        this.showTouchZoneFeedback('left', true);
      } else if (zone === 'right' && !this.player2Touch.active) {
        this.player2Touch.active = true;
        this.player2Touch.touchId = touch.identifier;
        this.player2Touch.startY = canvasY;
        this.player2Touch.currentY = canvasY;
        this.player2TargetY = canvasY;
        this.showTouchZoneFeedback('right', true);
      }
    }
  }

  /**
   * Handle touch move
   */
  handleTouchMove(e) {
    e.preventDefault();
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const canvasY = this.clientYToCanvasY(touch.clientY);
      
      if (this.player1Touch.active && touch.identifier === this.player1Touch.touchId) {
        this.player1Touch.currentY = canvasY;
        this.player1TargetY = canvasY;
      } else if (this.player2Touch.active && touch.identifier === this.player2Touch.touchId) {
        this.player2Touch.currentY = canvasY;
        this.player2TargetY = canvasY;
      }
    }
  }

  /**
   * Handle touch end
   */
  handleTouchEnd(e) {
    e.preventDefault();
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      
      if (this.player1Touch.active && touch.identifier === this.player1Touch.touchId) {
        this.player1Touch.active = false;
        this.player1Touch.touchId = null;
        this.player1TargetY = null;
        this.showTouchZoneFeedback('left', false);
      } else if (this.player2Touch.active && touch.identifier === this.player2Touch.touchId) {
        this.player2Touch.active = false;
        this.player2Touch.touchId = null;
        this.player2TargetY = null;
        this.showTouchZoneFeedback('right', false);
      }
    }
  }

  /**
   * Show visual feedback for touch zones
   */
  showTouchZoneFeedback(zone, active) {
    const overlay = document.getElementById(`touch-zone-${zone}`);
    if (overlay) {
      if (active) {
        overlay.classList.add('active');
      } else {
        overlay.classList.remove('active');
      }
    } else {
      // In development, warn if the expected overlay element is missing
      const isDevEnv = (typeof window !== 'undefined' && 
                        window.location && 
                        window.location.hostname === 'localhost');
      
      if (isDevEnv && typeof console !== 'undefined' && console.warn) {
        console.warn(`MobileControls: Expected touch zone overlay element with id "touch-zone-${zone}" not found.`);
      }
    }
  }

  /**
   * Get player 1 target position (for player-controlled paddle)
   */
  getPlayer1Target() {
    return this.player1TargetY;
  }

  /**
   * Get player 2 target position (for AI or future multiplayer)
   */
  getPlayer2Target() {
    return this.player2TargetY;
  }

  /**
   * Check if player 1 touch is active
   */
  isPlayer1Active() {
    return this.player1Touch.active;
  }

  /**
   * Check if player 2 touch is active
   */
  isPlayer2Active() {
    return this.player2Touch.active;
  }

  /**
   * Check if mobile controls are enabled
   */
  isActive() {
    return this.isEnabled;
  }

  /**
   * Cleanup method to remove event listeners
   */
  destroy() {
    if (!this.isEnabled) return;
    
    // Remove canvas event listeners using stored bound functions
    if (this.boundHandleTouchStart) {
      this.canvas.removeEventListener('touchstart', this.boundHandleTouchStart);
      this.canvas.removeEventListener('touchmove', this.boundHandleTouchMove);
      this.canvas.removeEventListener('touchend', this.boundHandleTouchEnd);
      this.canvas.removeEventListener('touchcancel', this.boundHandleTouchEnd);
    }
    
    // Remove orientation change listener
    if (this.handleOrientationChange) {
      window.removeEventListener('orientationchange', this.handleOrientationChange);
    }
    
    // Reset touch states
    this.player1Touch.active = false;
    this.player2Touch.active = false;
    this.player1TargetY = null;
    this.player2TargetY = null;
  }
}
