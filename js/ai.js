/**
 * AI Opponent - Controls the right paddle with configurable difficulty
 */

class AI {
  constructor(difficulty = 'MEDIUM') {
    this.setDifficulty(difficulty);
    this.reactionTimer = 0;
    this.targetY = CONFIG.CANVAS_HEIGHT / 2;
    this.errorOffset = 0;
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    this.config = CONFIG.AI_DIFFICULTY[difficulty];
    
    if (!this.config) {
      console.warn(`Invalid difficulty: ${difficulty}, defaulting to MEDIUM`);
      this.config = CONFIG.AI_DIFFICULTY.MEDIUM;
      this.difficulty = 'MEDIUM';
    }
  }

  getDifficulty() {
    return this.difficulty;
  }

  /**
   * Update AI paddle position based on ball position
   */
  update(paddle, ball, deltaTime) {
    // Accumulate time for reaction delay
    this.reactionTimer += deltaTime;
    
    // Only react when ball is moving toward AI's side (right side)
    const isBallComingToward = ball.velocityX > 0;
    
    if (!isBallComingToward) {
      // Move toward center when ball is not coming
      this.targetY = CONFIG.CANVAS_HEIGHT / 2;
      this.reactionTimer = 0; // Reset timer when ball is not approaching
    } else {
      // Check if enough time has passed for reaction
      if (this.reactionTimer >= this.config.reactionDelay) {
        this.reactionTimer = 0;
        
        // Calculate target position with error margin
        this.targetY = ball.y;
        
        // Add random error based on difficulty
        if (this.config.errorMargin > 0) {
          this.errorOffset = randomFloat(-this.config.errorMargin, this.config.errorMargin);
          
          // Easy difficulty: sometimes move in wrong direction
          if (this.difficulty === 'EASY' && Math.random() < 0.15) {
            this.errorOffset = randomFloat(-80, 80);
          }
        } else {
          this.errorOffset = 0;
        }
      }
    }

    // Apply error to target
    const adjustedTarget = this.targetY + this.errorOffset;

    // Move paddle toward target
    const paddleCenter = paddle.y + paddle.height / 2;
    const diff = adjustedTarget - paddleCenter;
    
    // Determine movement speed based on difficulty
    let speedMultiplier = 1.0;
    switch (this.difficulty) {
      case 'EASY':
        speedMultiplier = 0.6;
        break;
      case 'MEDIUM':
        speedMultiplier = 0.8;
        break;
      case 'HARD':
        speedMultiplier = 1.0;
        break;
      case 'IMPOSSIBLE':
        speedMultiplier = 1.2;
        break;
    }

    const moveSpeed = CONFIG.PADDLE_SPEED * speedMultiplier;

    // Move paddle
    if (Math.abs(diff) > moveSpeed) {
      if (diff > 0) {
        paddle.y += moveSpeed;
      } else {
        paddle.y -= moveSpeed;
      }
    } else {
      // Fine adjustment
      paddle.y += diff * 0.1;
    }

    // Keep paddle within bounds
    paddle.y = clamp(paddle.y, 0, CONFIG.CANVAS_HEIGHT - paddle.height);
  }

  /**
   * Reset AI state
   */
  reset() {
    this.reactionTimer = 0;
    this.targetY = CONFIG.CANVAS_HEIGHT / 2;
    this.errorOffset = 0;
  }
}
