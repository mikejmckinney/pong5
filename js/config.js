const CONFIG = {
  // Canvas
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // Paddle settings
  PADDLE_WIDTH: 15,
  PADDLE_HEIGHT: 100,
  PADDLE_SPEED: 8,
  PADDLE_MARGIN: 20,  // Distance from edge
  
  // Ball settings
  BALL_SIZE: 15,
  BALL_INITIAL_SPEED: 5,
  BALL_SPEED_INCREMENT: 0.5,  // Speed increase per hit
  BALL_MAX_SPEED: 15,
  
  // Game settings
  WINNING_SCORE: 11,
  RESET_DELAY: 1000,  // ms delay after scoring
  
  // AI Difficulty (reaction time in ms, lower = harder)
  AI_DIFFICULTY: {
    EASY: { reactionDelay: 150, errorMargin: 50 },
    MEDIUM: { reactionDelay: 80, errorMargin: 25 },
    HARD: { reactionDelay: 30, errorMargin: 10 },
    IMPOSSIBLE: { reactionDelay: 0, errorMargin: 0 }
  },
  
  // Colors (initial retro theme)
  COLORS: {
    BACKGROUND: '#0a0a0a',
    PADDLE: '#00ffff',
    BALL: '#ff00ff',
    SCORE: '#ffffff',
    CENTER_LINE: '#333333'
  }
};
