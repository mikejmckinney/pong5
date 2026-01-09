/**
 * Renderer - Handles all canvas drawing operations
 */

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = CONFIG.CANVAS_WIDTH;
    this.canvas.height = CONFIG.CANVAS_HEIGHT;
    
    // Ball trail for motion effect
    this.ballTrail = [];
    
    // Grid animation offset
    this.gridOffset = 0;
    
    // Scanline offset
    this.scanlineOffset = 0;
    
    // Initialize deltaTime to safe default
    this.deltaTime = 16.67; // ~60fps default
    
    // Cache gradients for performance
    this.paddleGradient = null;
    this.ballGradient = null;
    this.lastPaddleWidth = 0;
    this.lastBallSize = 0;
  }
  
  /**
   * Clear ball trail
   */
  clearBallTrail() {
    this.ballTrail = [];
  }

  /**
   * Clear the canvas and draw background effects
   */
  clear() {
    // Fill with background color
    this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid background if enabled
    if (CONFIG.EFFECTS.GRID_ENABLED) {
      // Update grid animation (frame-rate independent, normalized to 60fps)
      this.gridOffset = (this.gridOffset + (CONFIG.EFFECTS.GRID_ANIMATION_SPEED / 1000) * this.deltaTime) % CONFIG.EFFECTS.GRID_SIZE;
      this.drawGrid();
    }
    
    // Draw scanlines if enabled
    if (CONFIG.EFFECTS.SCANLINES_ENABLED) {
      // Update scanline animation (frame-rate independent, normalized to 60fps)
      this.scanlineOffset = (this.scanlineOffset + (CONFIG.EFFECTS.SCANLINE_ANIMATION_SPEED / 1000) * this.deltaTime) % 4;
      this.drawScanlines();
    }
  }
  
  /**
   * Draw animated synthwave grid background
   */
  drawGrid() {
    const gridSize = CONFIG.EFFECTS.GRID_SIZE;
    const perspectiveY = this.canvas.height * CONFIG.EFFECTS.GRID_PERSPECTIVE_Y; // Horizon line
    
    this.ctx.save();
    this.ctx.strokeStyle = CONFIG.COLORS.GRID_LINES;
    this.ctx.lineWidth = 1;
    
    // Draw horizontal lines with perspective
    for (let i = 0; i < CONFIG.EFFECTS.GRID_HORIZONTAL_LINES; i++) {
      const y = perspectiveY + (i * gridSize) - this.gridOffset;
      if (y > this.canvas.height) continue;
      
      // Perspective alpha
      const alpha = Math.max(0.1, 0.4 - (i / 20));
      
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    
    // Draw vertical lines with perspective
    const numVerticalLines = CONFIG.EFFECTS.GRID_VERTICAL_LINES;
    for (let i = 0; i <= numVerticalLines; i++) {
      const x = (i / numVerticalLines) * this.canvas.width;
      const alpha = 0.3;
      
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.moveTo(x, perspectiveY);
      
      // Draw line toward vanishing point with perspective
      const bottomY = this.canvas.height;
      const centerX = this.canvas.width / 2;
      const perspectiveX = centerX + (x - centerX) * 0.3;
      
      this.ctx.lineTo(perspectiveX, bottomY);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
  
  /**
   * Draw CRT scanline effect
   */
  drawScanlines() {
    this.ctx.save();
    this.ctx.globalAlpha = 0.05;
    this.ctx.fillStyle = CONFIG.COLORS.BLACK;
    
    for (let y = this.scanlineOffset; y < this.canvas.height; y += 4) {
      this.ctx.fillRect(0, y, this.canvas.width, 2);
    }
    
    this.ctx.restore();
  }

  /**
   * Draw the center line
   */
  drawCenterLine() {
    this.ctx.strokeStyle = CONFIG.COLORS.CENTER_LINE;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  /**
   * Draw a paddle with enhanced glow effect
   */
  drawPaddle(paddle, isActive = false) {
    if (!CONFIG.EFFECTS.GLOW_ENABLED) {
      this.ctx.fillStyle = CONFIG.COLORS.PADDLE;
      this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
      return;
    }
    
    // Enhanced glow effect when paddle is actively controlled via touch
    const glowIntensity = isActive ? CONFIG.EFFECTS.PADDLE_GLOW_ACTIVE : CONFIG.EFFECTS.PADDLE_GLOW_NORMAL;
    const glowColor = isActive ? CONFIG.COLORS.NEON_PINK : CONFIG.COLORS.NEON_CYAN;
    
    // Draw multiple layers for stronger glow
    this.ctx.shadowBlur = glowIntensity;
    this.ctx.shadowColor = glowColor;
    
    // Cache gradient for paddle if not created or size changed
    if (!this.paddleGradient || this.lastPaddleWidth !== paddle.width) {
      this.paddleGradient = this.ctx.createLinearGradient(
        0, 0,
        paddle.width, 0
      );
      this.paddleGradient.addColorStop(0, CONFIG.COLORS.NEON_CYAN);
      this.paddleGradient.addColorStop(0.5, CONFIG.COLORS.WHITE);
      this.paddleGradient.addColorStop(1, CONFIG.COLORS.NEON_CYAN);
      this.lastPaddleWidth = paddle.width;
    }
    
    this.ctx.save();
    this.ctx.translate(paddle.x, paddle.y);
    this.ctx.fillStyle = this.paddleGradient;
    this.ctx.fillRect(0, 0, paddle.width, paddle.height);
    
    // Second glow layer
    this.ctx.shadowBlur = glowIntensity / 2;
    this.ctx.fillRect(0, 0, paddle.width, paddle.height);
    this.ctx.restore();
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  /**
   * Draw the ball with enhanced glow and motion trail
   */
  drawBall(ball) {
    // Only update trail if glow effects are enabled
    if (CONFIG.EFFECTS.GLOW_ENABLED) {
      // Add current position to trail
      this.ballTrail.push({ x: ball.x, y: ball.y, size: ball.size });
      
      // Keep trail length limited
      if (this.ballTrail.length > CONFIG.EFFECTS.BALL_TRAIL_LENGTH) {
        this.ballTrail.shift();
      }
      
      // Draw trail
      this.ctx.save();
      for (let i = 0; i < this.ballTrail.length - 1; i++) {
        const pos = this.ballTrail[i];
        const alpha = (i / this.ballTrail.length) * 0.5;
        const size = pos.size * (0.5 + (i / this.ballTrail.length) * 0.5);
        
        this.ctx.globalAlpha = alpha;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = CONFIG.COLORS.NEON_PINK;
        this.ctx.fillStyle = CONFIG.COLORS.NEON_PINK;
        
        this.ctx.fillRect(
          pos.x - size / 2,
          pos.y - size / 2,
          size,
          size
        );
      }
      this.ctx.restore();
    }
    
    // Draw main ball with intense glow
    this.ctx.shadowBlur = CONFIG.EFFECTS.GLOW_ENABLED ? CONFIG.EFFECTS.BALL_GLOW : 0;
    this.ctx.shadowColor = CONFIG.COLORS.NEON_PINK;
    
    // Cache gradient for ball if not created or size changed
    if (!this.ballGradient || this.lastBallSize !== ball.size) {
      this.ballGradient = this.ctx.createRadialGradient(
        0, 0, 0,
        0, 0, ball.size / 2
      );
      this.ballGradient.addColorStop(0, CONFIG.COLORS.WHITE);
      this.ballGradient.addColorStop(0.4, CONFIG.COLORS.NEON_PINK);
      this.ballGradient.addColorStop(1, CONFIG.COLORS.NEON_PURPLE);
      this.lastBallSize = ball.size;
    }
    
    this.ctx.save();
    this.ctx.translate(ball.x, ball.y);
    this.ctx.fillStyle = this.ballGradient;
    this.ctx.fillRect(
      -ball.size / 2,
      -ball.size / 2,
      ball.size,
      ball.size
    );
    
    // Second glow layer for intensity
    if (CONFIG.EFFECTS.GLOW_ENABLED) {
      this.ctx.shadowBlur = 40;
      this.ctx.globalAlpha = 0.5;
      this.ctx.fillRect(
        -ball.size / 2,
        -ball.size / 2,
        ball.size,
        ball.size
      );
      this.ctx.globalAlpha = 1.0;
    }
    this.ctx.restore();
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  /**
   * Draw the score with retro font and glow
   */
  drawScore(player1Score, player2Score) {
    this.ctx.fillStyle = CONFIG.COLORS.TEXT_GLOW;
    this.ctx.font = 'bold 48px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    
    // Add glow effect to score
    if (CONFIG.EFFECTS.GLOW_ENABLED) {
      this.ctx.shadowBlur = CONFIG.EFFECTS.SCORE_GLOW;
      this.ctx.shadowColor = CONFIG.COLORS.NEON_CYAN;
    }
    
    // Player 1 score (left)
    this.ctx.fillText(player1Score, this.canvas.width / 4, 30);
    
    // Player 2 score (right)
    this.ctx.fillText(player2Score, (this.canvas.width * 3) / 4, 30);
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  /**
   * Draw overlay text (for menus, game over, etc.)
   */
  drawOverlay(lines, fontSize = 36) {
    // Semi-transparent background with gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, 'rgba(10, 10, 10, 0.85)');
    gradient.addColorStop(0.5, 'rgba(26, 26, 46, 0.9)');
    gradient.addColorStop(1, 'rgba(10, 10, 10, 0.85)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Text with glow effect
    this.ctx.fillStyle = CONFIG.COLORS.TEXT_GLOW;
    this.ctx.font = `bold ${fontSize}px "Press Start 2P", monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    if (CONFIG.EFFECTS.GLOW_ENABLED) {
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = CONFIG.COLORS.NEON_CYAN;
    }
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const lineHeight = fontSize * 1.8;
    const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      // Alternate colors for visual interest
      if (index === 0) {
        this.ctx.shadowColor = CONFIG.COLORS.NEON_PINK;
      } else if (line.includes('Press') || line.includes('Difficulty')) {
        this.ctx.shadowColor = CONFIG.COLORS.NEON_CYAN;
      }
      
      this.ctx.fillText(line, centerX, startY + index * lineHeight);
    });
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  /**
   * Draw title screen
   */
  drawTitleScreen(currentDifficulty) {
    this.drawOverlay([
      'RETRO PONG',
      '',
      `Difficulty: ${currentDifficulty}`,
      '1: Easy  2: Medium  3: Hard  4: Impossible',
      '',
      'Press SPACE to Start'
    ], 32);
  }

  /**
   * Draw pause screen
   */
  drawPauseScreen() {
    this.drawOverlay([
      'PAUSED',
      '',
      'Press ESC to Resume'
    ], 36);
  }

  /**
   * Draw game over screen
   */
  drawGameOverScreen(winner, player1Score, player2Score) {
    this.drawOverlay([
      'GAME OVER',
      '',
      `${winner} Wins!`,
      `${player1Score} - ${player2Score}`,
      '',
      'Press SPACE to Restart'
    ], 36);
  }

  /**
   * Draw common game elements (paddles, ball, score)
   */
  drawGameElements(gameState) {
    // Check if paddles are being actively controlled via touch
    const player1Active = gameState.player1TouchActive || false;
    const player2Active = gameState.player2TouchActive || false;
    
    this.drawPaddle(gameState.player1Paddle, player1Active);
    this.drawPaddle(gameState.player2Paddle, player2Active);
    this.drawBall(gameState.ball);
    this.drawScore(gameState.player1Score, gameState.player2Score);
  }

  /**
   * Render the game state
   */
  render(gameState, deltaTime = 16.67) {
    // Store deltaTime for animations
    this.deltaTime = deltaTime;
    
    this.clear();
    this.drawCenterLine();
    
    // Draw particles before game elements for layering
    if (gameState.particleSystem) {
      gameState.particleSystem.draw(this.ctx);
    }
    
    this.drawGameElements(gameState);
    
    // Draw state-specific overlays
    if (gameState.state === 'MENU') {
      this.drawTitleScreen(gameState.currentDifficulty);
    } else if (gameState.state === 'PAUSED') {
      this.drawPauseScreen();
    } else if (gameState.state === 'GAME_OVER') {
      this.drawGameOverScreen(gameState.winner, gameState.player1Score, gameState.player2Score);
    }
  }
}
