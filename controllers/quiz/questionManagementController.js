import QuestionManagementService from '../../services/quiz/questionManagementService.js';

class QuestionManagementController {

  // ============ QUESTION MANAGEMENT IN QUIZ ============

  /**
   * POST /api/quizzes/:id/questions
   * Thêm câu hỏi vào quiz
   */
  async addQuestionToQuiz(req, res) {
    try {
      const { id } = req.params;
      const { questionId } = req.body;
      const userId = req.user.userId;

      if (!questionId) {
        return res.status(400).json({
          success: false,
          message: 'Question ID is required'
        });
      }

      const result = await QuestionManagementService.addQuestionToQuiz(id, userId, questionId);
      
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
   * POST /api/quizzes/:id/questions/bulk
   * Thêm nhiều câu hỏi vào quiz cùng lúc
   */
  async addMultipleQuestionsToQuiz(req, res) {
    try {
      const { id } = req.params;
      const { questionIds } = req.body;
      const userId = req.user.userId;

      if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Question IDs array is required'
        });
      }

      const result = await QuestionManagementService.addMultipleQuestionsToQuiz(id, userId, questionIds);
      
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
   * DELETE /api/quizzes/:id/questions/:questionId
   * Xóa câu hỏi khỏi quiz
   */
  async removeQuestionFromQuiz(req, res) {
    try {
      const { id, questionId } = req.params;
      const userId = req.user.userId;

      const result = await QuestionManagementService.removeQuestionFromQuiz(id, userId, questionId);
      
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
   * PUT /api/quizzes/:id/questions/reorder
   * Sắp xếp lại thứ tự câu hỏi trong quiz
   */
  async reorderQuestions(req, res) {
    try {
      const { id } = req.params;
      const { questionOrder } = req.body;
      const userId = req.user.userId;

      if (!questionOrder || !Array.isArray(questionOrder)) {
        return res.status(400).json({
          success: false,
          message: 'Question order array is required'
        });
      }

      const result = await QuestionManagementService.reorderQuestions(id, userId, questionOrder);
      
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

  // ============ QUESTION DISCOVERY ============

  /**
   * GET /api/quizzes/:id/questions/suggestions
   * Lấy câu hỏi gợi ý cho quiz
   */
  async getSuggestedQuestions(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { limit = 10 } = req.query;

      const result = await QuestionManagementService.getSuggestedQuestions(id, userId, parseInt(limit));
      
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
   * GET /api/questions/category/:categoryId
   * Lấy câu hỏi theo category (từ bank)
   */
  async getQuestionsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { excludeQuizId, limit = 20 } = req.query;

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Category ID is required'
        });
      }

      const result = await QuestionManagementService.getQuestionsByCategory(
        categoryId, 
        excludeQuizId, 
        parseInt(limit)
      );
      
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

  // ============ ADVANCED OPERATIONS ============

  /**
   * POST /api/quizzes/:targetId/questions/duplicate/:sourceId
   * Copy câu hỏi từ quiz khác
   */
  async duplicateQuestionsFromQuiz(req, res) {
    try {
      const { targetId, sourceId } = req.params;
      const userId = req.user.userId;

      if (!targetId || !sourceId) {
        return res.status(400).json({
          success: false,
          message: 'Both target and source quiz IDs are required'
        });
      }

      const result = await QuestionManagementService.duplicateQuestionsFromQuiz(targetId, sourceId, userId);
      
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

  // ============ BULK OPERATIONS ============

  /**
   * POST /api/quizzes/:id/questions/import
   * Import questions từ file hoặc data (future feature)
   */
  async importQuestions(req, res) {
    try {
      // Placeholder for future implementation
      return res.status(501).json({
        success: false,
        message: 'Import questions feature not implemented yet'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: ' + error.message
      });
    }
  }

  /**
   * GET /api/quizzes/:id/questions/export
   * Export questions từ quiz (future feature)
   */
  async exportQuestions(req, res) {
    try {
      // Placeholder for future implementation
      return res.status(501).json({
        success: false,
        message: 'Export questions feature not implemented yet'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: ' + error.message
      });
    }
  }

  // ============ VALIDATION HELPERS ============

  /**
   * Validate quiz ownership
   */
  async validateQuizOwnership(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // This can be moved to a middleware if needed frequently
      // For now, individual methods handle ownership checking
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: ' + error.message
      });
    }
  }
}

export default new QuestionManagementController(); 