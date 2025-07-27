import GameSessionService from '../../services/quiz/gameSessionService.js';

class GameSessionController {

  // ============ GAME PREPARATION ============

  /**
   * POST /api/quizzes/:id/play
   * Chuẩn bị quiz cho game session
   */
  async prepareQuizForGame(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Quiz ID is required'
        });
      }

      const result = await GameSessionService.prepareQuizForGame(id);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: ' + error.message
      });
    }
  }

  /**
   * GET /api/quizzes/:id/preview
   * Lấy preview quiz (vài câu đầu)
   */
  async getQuizPreview(req, res) {
    try {
      const { id } = req.params;
      const { questionCount = 3 } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Quiz ID is required'
        });
      }

      const result = await GameSessionService.getQuizPreview(id, parseInt(questionCount));
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        return res.status(404).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: ' + error.message
      });
    }
  }

  // ============ ANSWER VALIDATION ============

  /**
   * POST /api/game/validate-answer
   * Validate single answer và tính điểm
   */
  async validateAnswer(req, res) {
    try {
      const { questionId, selectedAnswerId, timeSpent } = req.body;

      // Validate required fields
      if (!questionId || selectedAnswerId === undefined || !timeSpent) {
        return res.status(400).json({
          success: false,
          message: 'Question ID, selected answer ID, and time spent are required'
        });
      }

      const result = await GameSessionService.validateAnswer(questionId, selectedAnswerId, timeSpent);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: ' + error.message
      });
    }
  }

  /**
   * POST /api/game/submit-results
   * Submit kết quả game và tính tổng điểm
   */
  async submitGameResults(req, res) {
    try {
      const { quizId, userAnswers } = req.body;

      // Validate required fields
      if (!quizId || !userAnswers || !Array.isArray(userAnswers)) {
        return res.status(400).json({
          success: false,
          message: 'Quiz ID and user answers array are required'
        });
      }

      // Validate userAnswers format
      const validAnswers = userAnswers.every(answer => 
        answer.questionId && 
        answer.selectedAnswerId !== undefined && 
        answer.timeSpent !== undefined
      );

      if (!validAnswers) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user answers format. Each answer must have questionId, selectedAnswerId, and timeSpent'
        });
      }

      const result = await GameSessionService.validateGameAnswers(quizId, userAnswers);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: ' + error.message
      });
    }
  }

  // ============ RANDOM QUIZ ============

  /**
   * POST /api/game/random-quiz
   * Tạo random quiz từ category
   */
  async generateRandomQuiz(req, res) {
    try {
      const { categoryId, questionCount = 10 } = req.body;

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Category ID is required'
        });
      }

      if (questionCount < 1 || questionCount > 50) {
        return res.status(400).json({
          success: false,
          message: 'Question count must be between 1 and 50'
        });
      }

      const result = await GameSessionService.generateRandomQuiz(categoryId, questionCount);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: ' + error.message
      });
    }
  }

  // ============ GAME UTILITIES ============

  /**
   * POST /api/game/calculate-score
   * Tính điểm cho một câu trả lời (utility endpoint)
   */
  async calculateScore(req, res) {
    try {
      const { isCorrect, basePoints, timeSpent, timeLimit } = req.body;

      if (typeof isCorrect !== 'boolean' || !basePoints || !timeSpent || !timeLimit) {
        return res.status(400).json({
          success: false,
          message: 'isCorrect, basePoints, timeSpent, and timeLimit are required'
        });
      }

      let score = 0;
      if (isCorrect) {
        const timeBonus = GameSessionService.calculateTimeBonus(timeSpent, timeLimit);
        score = Math.round(basePoints * timeBonus);
      }

      return res.status(200).json({
        success: true,
        data: {
          score,
          isCorrect,
          timeBonus: isCorrect ? GameSessionService.calculateTimeBonus(timeSpent, timeLimit) : 0
        },
        message: 'Score calculated successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: ' + error.message
      });
    }
  }

  // ============ GAME SESSION HELPERS ============

  /**
   * GET /api/game/session-info
   * Lấy thông tin session cho multiplayer (placeholder)
   */
  async getSessionInfo(req, res) {
    try {
      const { sessionId } = req.params;

      // Placeholder for future multiplayer session management
      // This would integrate with Socket.IO for real-time features
      
      return res.status(501).json({
        success: false,
        message: 'Session management not implemented yet. This will be used for multiplayer rooms.'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: ' + error.message
      });
    }
  }

  /**
   * POST /api/game/join-session
   * Join multiplayer session (placeholder)
   */
  async joinSession(req, res) {
    try {
      const { sessionId, pin } = req.body;
      const userId = req.user?.userId;

      // Placeholder for future implementation
      // This would handle:
      // - Validate PIN
      // - Add user to session
      // - Notify other players via Socket.IO
      
      return res.status(501).json({
        success: false,
        message: 'Multiplayer session joining not implemented yet'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: ' + error.message
      });
    }
  }

  /**
   * POST /api/game/create-session
   * Create multiplayer session (placeholder)
   */
  async createSession(req, res) {
    try {
      const { quizId, maxPlayers, settings } = req.body;
      const userId = req.user?.userId;

      // Placeholder for future implementation
      // This would handle:
      // - Create game session with PIN
      // - Set up Socket.IO room
      // - Return session details
      
      return res.status(501).json({
        success: false,
        message: 'Multiplayer session creation not implemented yet'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: ' + error.message
      });
    }
  }
}

export default new GameSessionController(); 