import QuizManagementService from '../../services/quiz/quizManagementService.js';

class QuizManagementController {

  // ============ GET ENDPOINTS ============

  /**
   * GET /api/quizzes
   * Lấy tất cả quiz có thể chơi
   */
  async getAllQuizzes(req, res) {
    try {
      const result = await QuizManagementService.getAvailableQuizzes();
      
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
   * GET /api/quizzes/category/:categoryId
   * Lấy quiz theo category
   */
  async getQuizzesByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      
      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Category ID is required'
        });
      }

      const result = await QuizManagementService.getQuizzesByCategory(categoryId);
      
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
   * GET /api/quizzes/my
   * Lấy quiz của user hiện tại
   */
  async getMyQuizzes(req, res) {
    try {
      const userId = req.user.userId; // From auth middleware
      
      const result = await QuizManagementService.getUserQuizzes(userId);
      
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
   * GET /api/quizzes/:id
   * Lấy chi tiết quiz
   */
  async getQuizById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Quiz ID is required'
        });
      }

      const result = await QuizManagementService.getQuizById(id);
      
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

  /**
   * GET /api/quizzes/search/:term
   * Tìm kiếm quiz
   */
  async searchQuizzes(req, res) {
    try {
      const { term } = req.params;
      
      if (!term || term.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search term must be at least 2 characters'
        });
      }

      const result = await QuizManagementService.searchQuizzes(term.trim());
      
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
   * GET /api/quizzes/:id/stats
   * Lấy thống kê quiz
   */
  async getQuizStats(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Quiz ID is required'
        });
      }

      const result = await QuizManagementService.getQuizStats(id);
      
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

  // ============ POST ENDPOINTS ============

  /**
   * POST /api/quizzes
   * Tạo quiz mới
   */
  async createQuiz(req, res) {
    try {
      const userId = req.user.userId; // From auth middleware
      const quizData = req.body;

      // Validate required fields
      const requiredFields = ['title', 'category'];
      const missingFields = requiredFields.filter(field => !quizData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      const result = await QuizManagementService.createQuiz(userId, quizData);
      
      if (result.success) {
        return res.status(201).json({
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
   * POST /api/quizzes/:id/publish
   * Publish quiz (chuyển từ draft sang public)
   */
  async publishQuiz(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await QuizManagementService.publishQuiz(id, userId);
      
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

  // ============ PUT ENDPOINTS ============

  /**
   * PUT /api/quizzes/:id
   * Update quiz
   */
  async updateQuiz(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;

      const result = await QuizManagementService.updateQuiz(id, userId, updateData);
      
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

  // ============ DELETE ENDPOINTS ============

  /**
   * DELETE /api/quizzes/:id
   * Xóa quiz
   */
  async deleteQuiz(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await QuizManagementService.deleteQuiz(id, userId);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
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
}

export default new QuizManagementController(); 