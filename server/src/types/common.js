// Common types, enums, and validation rules

/**
 * Room Status Enum
 */
export const ROOM_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished'
};

/**
 * User Roles Enum
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  HOST: 'host',
  PLAYER: 'player',
  GUEST: 'guest'
};

/**
 * Game Settings Constraints
 */
export const GAME_CONSTRAINTS = {
  MAX_PLAYERS: {
    MIN: 2,
    MAX: 20,
    DEFAULT: 8
  },
  TIME_PER_QUESTION: {
    MIN: 5,
    MAX: 60,
    DEFAULT: 25 // Updated to 25 seconds
  },
  ROOM_CODE: {
    LENGTH: 6,
    PATTERN: /^[A-Z0-9]{6}$/
  },
  QUIZ_SCORING: {
    BASE_POINTS: {
      MIN: 1,
      MAX: 1000,
      DEFAULT: 100
    },
    TIME_BONUS: {
      MIN: 0,
      MAX: 500,
      DEFAULT: 50
    }
  }
};

/**
 * Validation Schemas
 */
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  },
  ROOM_CODE: /^[A-Z0-9]{6}$/,
  name: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_-]+$/
  }
};

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: (field) => `${field} is required`,
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  INVALID_ROOM_CODE: 'Room code must be 6 characters (A-Z, 0-9)',
  ROOM_FULL: 'Room has reached maximum capacity',
  ROOM_NOT_FOUND: 'Room not found',
  UNAUTHORIZED: 'Unauthorized access',
  GAME_ALREADY_STARTED: 'Game has already started',
  QUESTION_TIMEOUT: 'Time limit exceeded for this question'
};

/**
 * Default settings
 */
export const DEFAULT_SETTINGS = {
  ROOM: {
    maxPlayers: GAME_CONSTRAINTS.MAX_PLAYERS.DEFAULT,
    autoStart: false,
    showLeaderboard: true,
    timePerQuestion: GAME_CONSTRAINTS.TIME_PER_QUESTION.DEFAULT
  },
  QUIZ: {
    scoring: {
      basePoints: GAME_CONSTRAINTS.QUIZ_SCORING.BASE_POINTS.DEFAULT,
      timeBonus: true,
      maxTimeBonus: GAME_CONSTRAINTS.QUIZ_SCORING.TIME_BONUS.DEFAULT,
      penaltyForWrong: false,
      wrongAnswerPenalty: 0
    }
  },
  USER: {
    isAccountVerified: false,
    role: USER_ROLES.PLAYER
  }
};