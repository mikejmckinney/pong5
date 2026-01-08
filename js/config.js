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
  
  // Touch controls
  TOUCH_SMOOTHING_FACTOR: 0.2,  // Paddle movement smoothing for touch (0-1)
  TOUCH_DEAD_ZONE: 3,  // Minimum movement threshold in pixels
  DOUBLE_TAP_PREVENT_MS: 300,  // Double-tap prevention delay in milliseconds
  
  // AI Difficulty (reaction time in ms, lower = harder)
  AI_DIFFICULTY: {
    EASY: { reactionDelay: 150, errorMargin: 50 },
    MEDIUM: { reactionDelay: 80, errorMargin: 25 },
    HARD: { reactionDelay: 30, errorMargin: 10 },
    IMPOSSIBLE: { reactionDelay: 0, errorMargin: 0 }
  },
  
  // Colors (synthwave theme)
  COLORS: {
    BACKGROUND: '#0a0a0a',
    SECONDARY_BG: '#1a1a2e',
    NEON_PINK: '#ff00ff',
    NEON_CYAN: '#00ffff',
    NEON_PURPLE: '#bf00ff',
    ELECTRIC_BLUE: '#0080ff',
    HOT_ORANGE: '#ff6600',
    GRID_LINES: '#330033',
    TEXT_GLOW: '#ffffff',
    PADDLE: '#00ffff',
    BALL: '#ff00ff',
    SCORE: '#ffffff',
    CENTER_LINE: '#333333',
    WHITE: '#ffffff',
    BLACK: '#000000'
  },
  
  // Visual effects settings
  EFFECTS: {
    BALL_TRAIL_LENGTH: 8,
    PARTICLE_COUNT: 12,
    SCANLINES_ENABLED: true,
    GRID_ENABLED: true,
    GLOW_ENABLED: true,
    PADDLE_GLOW_NORMAL: 20,
    PADDLE_GLOW_ACTIVE: 30,
    BALL_GLOW: 25,
    SCORE_GLOW: 15,
    GRID_SIZE: 40,
    GRID_PERSPECTIVE_Y: 0.6,
    PARTICLE_GRAVITY: 0.2,
    PARTICLE_DRAG: 0.98
  },
  
  // Audio settings
  AUDIO: {
    ENABLED: true,
    VOLUME: 0.5,
    MUTED: false,
    TONE_VOLUME_MULTIPLIER: 0.3
  }
};
