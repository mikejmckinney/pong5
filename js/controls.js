/**
 * Controls - Handle keyboard input for the game
 */

class Controls {
  constructor() {
    this.keys = {};
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code] = true;
      
      // Prevent default behavior for game keys
      if (['ArrowUp', 'ArrowDown', 'Space', 'Escape'].includes(e.code) ||
          ['w', 's', ' ', 'escape'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code] = false;
    });
  }

  isPressed(key) {
    return this.keys[key] || this.keys[key.toLowerCase()] || false;
  }

  // Check if moving up (W or Up Arrow)
  isMovingUp() {
    return this.isPressed('w') || this.isPressed('ArrowUp');
  }

  // Check if moving down (S or Down Arrow)
  isMovingDown() {
    return this.isPressed('s') || this.isPressed('ArrowDown');
  }

  // Check if space is pressed
  isSpacePressed() {
    return this.isPressed(' ') || this.isPressed('Space');
  }

  // Check if escape is pressed
  isEscapePressed() {
    return this.isPressed('escape') || this.isPressed('Escape');
  }

  // Check for difficulty selection (1-4)
  getDifficultyKeyPressed() {
    for (let i = 1; i <= 4; i++) {
      if (this.isPressed(i.toString())) {
        return i;
      }
    }
    return null;
  }

  // Clear a specific key (useful for one-time presses)
  clearKey(key) {
    this.keys[key] = false;
    this.keys[key.toLowerCase()] = false;
  }
}
