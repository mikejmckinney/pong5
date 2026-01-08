/**
 * Renderer - Handles all canvas drawing operations
 */

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = CONFIG.CANVAS_WIDTH;
    this.canvas.height = CONFIG.CANVAS_HEIGHT;
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
   * Draw a paddle with glow effect
   */
  drawPaddle(paddle) {
    // Glow effect
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = CONFIG.COLORS.PADDLE;
    
    this.ctx.fillStyle = CONFIG.COLORS.PADDLE;
    this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  /**
   * Draw the ball with glow effect
   */
  drawBall(ball) {
    // Glow effect
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = CONFIG.COLORS.BALL;
    
    this.ctx.fillStyle = CONFIG.COLORS.BALL;
    this.ctx.fillRect(
      ball.x - ball.size / 2,
      ball.y - ball.size / 2,
      ball.size,
      ball.size
    );
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  /**
   * Draw the score
   */
  drawScore(player1Score, player2Score) {
    this.ctx.fillStyle = CONFIG.COLORS.SCORE;
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    
    // Player 1 score (left)
    this.ctx.fillText(player1Score, this.canvas.width / 4, 30);
    
    // Player 2 score (right)
    this.ctx.fillText(player2Score, (this.canvas.width * 3) / 4, 30);
  }

  /**
   * Draw overlay text (for menus, game over, etc.)
   */
  drawOverlay(lines, fontSize = 36) {
    // Semi-transparent background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = CONFIG.COLORS.SCORE;
    this.ctx.font = `bold ${fontSize}px monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const lineHeight = fontSize * 1.5;
    const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      this.ctx.fillText(line, centerX, startY + index * lineHeight);
    });
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
   * Render the game state
   */
  render(gameState) {
    this.clear();
    this.drawCenterLine();
    
    if (gameState.state === 'MENU') {
      this.drawPaddle(gameState.player1Paddle);
      this.drawPaddle(gameState.player2Paddle);
      this.drawBall(gameState.ball);
      this.drawScore(gameState.player1Score, gameState.player2Score);
      this.drawTitleScreen(gameState.currentDifficulty);
    } else if (gameState.state === 'PLAYING') {
      this.drawPaddle(gameState.player1Paddle);
      this.drawPaddle(gameState.player2Paddle);
      this.drawBall(gameState.ball);
      this.drawScore(gameState.player1Score, gameState.player2Score);
    } else if (gameState.state === 'PAUSED') {
      this.drawPaddle(gameState.player1Paddle);
      this.drawPaddle(gameState.player2Paddle);
      this.drawBall(gameState.ball);
      this.drawScore(gameState.player1Score, gameState.player2Score);
      this.drawPauseScreen();
    } else if (gameState.state === 'GAME_OVER') {
      this.drawPaddle(gameState.player1Paddle);
      this.drawPaddle(gameState.player2Paddle);
      this.drawBall(gameState.ball);
      this.drawScore(gameState.player1Score, gameState.player2Score);
      this.drawGameOverScreen(gameState.winner, gameState.player1Score, gameState.player2Score);
    }
  }
}
