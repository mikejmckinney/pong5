/**
 * Game - Core game logic and state management
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new Renderer(this.canvas);
    this.controls = new Controls();
    this.ai = new AI('MEDIUM');
    
    // Game state
    this.state = 'MENU'; // MENU, PLAYING, PAUSED, GAME_OVER
    this.currentDifficulty = 'MEDIUM';
    
    // Game objects
    this.player1Paddle = {
      x: CONFIG.PADDLE_MARGIN,
      y: CONFIG.CANVAS_HEIGHT / 2 - CONFIG.PADDLE_HEIGHT / 2,
      width: CONFIG.PADDLE_WIDTH,
      height: CONFIG.PADDLE_HEIGHT
    };
    
    this.player2Paddle = {
      x: CONFIG.CANVAS_WIDTH - CONFIG.PADDLE_MARGIN - CONFIG.PADDLE_WIDTH,
      y: CONFIG.CANVAS_HEIGHT / 2 - CONFIG.PADDLE_HEIGHT / 2,
      width: CONFIG.PADDLE_WIDTH,
      height: CONFIG.PADDLE_HEIGHT
    };
    
    this.ball = {
      x: CONFIG.CANVAS_WIDTH / 2,
      y: CONFIG.CANVAS_HEIGHT / 2,
      size: CONFIG.BALL_SIZE,
      velocityX: CONFIG.BALL_INITIAL_SPEED,
      velocityY: 0,
      speed: CONFIG.BALL_INITIAL_SPEED
    };
    
    // Scores
    this.player1Score = 0;
    this.player2Score = 0;
    this.winner = null;
    
    // Timing
    this.lastTime = 0;
    this.resetTimer = 0;
    this.isResetting = false;
    
    // Serve direction (alternates)
    this.serveDirection = 1; // 1 for right, -1 for left
    
    // Track key states for one-time presses
    this.spaceWasPressed = false;
    this.escapeWasPressed = false;
    
    // Start game loop
    this.run();
  }

  /**
   * Reset ball to center
   */
  resetBall() {
    this.ball.x = CONFIG.CANVAS_WIDTH / 2;
    this.ball.y = CONFIG.CANVAS_HEIGHT / 2;
    this.ball.speed = CONFIG.BALL_INITIAL_SPEED;
    
    // Alternate serve direction
    this.serveDirection *= -1;
    
    // Launch ball at slight random angle
    const angle = randomFloat(-30, 30);
    const angleRad = degToRad(angle);
    this.ball.velocityX = Math.cos(angleRad) * this.ball.speed * this.serveDirection;
    this.ball.velocityY = Math.sin(angleRad) * this.ball.speed;
  }

  /**
   * Reset game to initial state
   */
  resetGame() {
    this.player1Score = 0;
    this.player2Score = 0;
    this.winner = null;
    this.player1Paddle.y = CONFIG.CANVAS_HEIGHT / 2 - CONFIG.PADDLE_HEIGHT / 2;
    this.player2Paddle.y = CONFIG.CANVAS_HEIGHT / 2 - CONFIG.PADDLE_HEIGHT / 2;
    this.resetBall();
    this.ai.reset();
    this.serveDirection = 1;
  }

  /**
   * Handle ball collision with paddle
   */
  handlePaddleCollision(paddle) {
    // Calculate where ball hit on paddle (0 = top, 1 = bottom)
    const paddleCenter = paddle.y + paddle.height / 2;
    const hitPosition = (this.ball.y - paddleCenter) / (paddle.height / 2);
    
    // Calculate bounce angle based on hit position (-60 to 60 degrees)
    const maxAngle = 60;
    const angle = hitPosition * maxAngle;
    const angleRad = degToRad(angle);
    
    // Increase ball speed
    this.ball.speed = Math.min(
      this.ball.speed + CONFIG.BALL_SPEED_INCREMENT,
      CONFIG.BALL_MAX_SPEED
    );
    
    // Determine direction based on which paddle was hit
    const direction = paddle === this.player1Paddle ? 1 : -1;
    
    // Set new velocity
    this.ball.velocityX = Math.cos(angleRad) * this.ball.speed * direction;
    this.ball.velocityY = Math.sin(angleRad) * this.ball.speed;
    
    // Move ball slightly away from paddle to prevent multiple collisions
    if (direction > 0) {
      this.ball.x = paddle.x + paddle.width + this.ball.size / 2 + 1;
    } else {
      this.ball.x = paddle.x - this.ball.size / 2 - 1;
    }
  }

  /**
   * Update game state
   */
  update(deltaTime) {
    // Handle menu state
    if (this.state === 'MENU') {
      // Check for difficulty selection
      const diffKey = this.controls.getDifficultyKeyPressed();
      if (diffKey) {
        const difficulties = ['EASY', 'MEDIUM', 'HARD', 'IMPOSSIBLE'];
        const newDifficulty = difficulties[diffKey - 1];
        this.currentDifficulty = newDifficulty;
        this.ai.setDifficulty(newDifficulty);
      }
      
      // Check for space to start
      if (this.controls.isSpacePressed() && !this.spaceWasPressed) {
        this.state = 'PLAYING';
        this.resetGame();
      }
      this.spaceWasPressed = this.controls.isSpacePressed();
      return;
    }

    // Handle game over state
    if (this.state === 'GAME_OVER') {
      if (this.controls.isSpacePressed() && !this.spaceWasPressed) {
        this.state = 'MENU';
        this.resetGame();
      }
      this.spaceWasPressed = this.controls.isSpacePressed();
      return;
    }

    // Handle pause
    if (this.controls.isEscapePressed() && !this.escapeWasPressed) {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
      }
    }
    this.escapeWasPressed = this.controls.isEscapePressed();

    // Don't update game if paused
    if (this.state === 'PAUSED') {
      return;
    }

    // Handle reset delay after scoring
    if (this.isResetting) {
      this.resetTimer += deltaTime;
      if (this.resetTimer >= CONFIG.RESET_DELAY) {
        this.resetBall();
        this.isResetting = false;
        this.resetTimer = 0;
      }
      return;
    }

    // Update player paddle
    if (this.controls.isMovingUp()) {
      this.player1Paddle.y -= CONFIG.PADDLE_SPEED;
    }
    if (this.controls.isMovingDown()) {
      this.player1Paddle.y += CONFIG.PADDLE_SPEED;
    }
    
    // Keep player paddle in bounds
    this.player1Paddle.y = clamp(
      this.player1Paddle.y,
      0,
      CONFIG.CANVAS_HEIGHT - this.player1Paddle.height
    );

    // Update AI paddle
    this.ai.update(this.player2Paddle, this.ball, deltaTime);

    // Update ball position
    this.ball.x += this.ball.velocityX;
    this.ball.y += this.ball.velocityY;

    // Ball collision with top/bottom walls
    if (this.ball.y - this.ball.size / 2 <= 0) {
      this.ball.y = this.ball.size / 2;
      this.ball.velocityY *= -1;
    }
    if (this.ball.y + this.ball.size / 2 >= CONFIG.CANVAS_HEIGHT) {
      this.ball.y = CONFIG.CANVAS_HEIGHT - this.ball.size / 2;
      this.ball.velocityY *= -1;
    }

    // Ball collision with paddles
    const ballRect = {
      x: this.ball.x - this.ball.size / 2,
      y: this.ball.y - this.ball.size / 2,
      width: this.ball.size,
      height: this.ball.size
    };

    // Check player 1 paddle collision
    if (checkCollision(ballRect, this.player1Paddle) && this.ball.velocityX < 0) {
      this.handlePaddleCollision(this.player1Paddle);
    }

    // Check player 2 paddle collision
    if (checkCollision(ballRect, this.player2Paddle) && this.ball.velocityX > 0) {
      this.handlePaddleCollision(this.player2Paddle);
    }

    // Ball goes out of bounds - scoring
    if (this.ball.x - this.ball.size / 2 <= 0) {
      // Player 2 (AI) scores
      this.player2Score++;
      this.checkWinCondition();
      if (this.state !== 'GAME_OVER') {
        this.isResetting = true;
      }
    } else if (this.ball.x + this.ball.size / 2 >= CONFIG.CANVAS_WIDTH) {
      // Player 1 scores
      this.player1Score++;
      this.checkWinCondition();
      if (this.state !== 'GAME_OVER') {
        this.isResetting = true;
      }
    }
  }

  /**
   * Check if someone has won
   */
  checkWinCondition() {
    if (this.player1Score >= CONFIG.WINNING_SCORE) {
      this.winner = 'Player 1';
      this.state = 'GAME_OVER';
    } else if (this.player2Score >= CONFIG.WINNING_SCORE) {
      this.winner = 'AI';
      this.state = 'GAME_OVER';
    }
  }

  /**
   * Get current game state for rendering
   */
  getGameState() {
    return {
      state: this.state,
      player1Paddle: this.player1Paddle,
      player2Paddle: this.player2Paddle,
      ball: this.ball,
      player1Score: this.player1Score,
      player2Score: this.player2Score,
      winner: this.winner,
      currentDifficulty: this.currentDifficulty
    };
  }

  /**
   * Main game loop
   */
  run(currentTime = 0) {
    // Calculate delta time in milliseconds
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update game state
    this.update(deltaTime);

    // Render
    this.renderer.render(this.getGameState());

    // Continue loop
    requestAnimationFrame((time) => this.run(time));
  }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Game();
});
