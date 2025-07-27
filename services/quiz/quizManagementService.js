import quizModel from '../../models/quizz/quizzModel.js';
import categoryModel from '../../models/quizz/categoryModel.js';

class QuizManagementService {
  
  // ============ GET QUIZZES ============
  
  /**
   * Lấy tất cả quiz có thể chơi (không phải draft, có câu hỏi)
   */
  async getAvailableQuizzes() {
    try {
      const quizzes = await quizModel.findAvailableQuizzes();
      return {
        success: true,
        data: quizzes,
        message: 'Quizzes retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving quizzes: ' + error.message
      };
    }
  }

  /**
   * Lấy quiz theo category
   */
  async getQuizzesByCategory(categoryId) {
    try {
      const quizzes = await quizModel.findPublicQuizzes(categoryId);
      return {
        success: true,
        data: quizzes,
        message: 'Category quizzes retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving category quizzes: ' + error.message
      };
    }
  }

  /**
   * Lấy quiz của user (bao gồm cả draft)
   */
  async getUserQuizzes(userId) {
    try {
      const quizzes = await quizModel.findUserQuizzes(userId);
      return {
        success: true,
        data: quizzes,
        message: 'User quizzes retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving user quizzes: ' + error.message
      };
    }
  }

  /**
   * Lấy chi tiết quiz theo ID
   */
  async getQuizById(quizId) {
    try {
      const quiz = await quizModel.findById(quizId)
        .populate('category', 'name icon')
        .populate('createdBy', 'name email')
        .populate('questions');

      if (!quiz) {
        return {
          success: false,
          message: 'Quiz not found'
        };
      }

      return {
        success: true,
        data: quiz,
        message: 'Quiz retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving quiz: ' + error.message
      };
    }
  }

  // ============ CREATE QUIZ ============

  /**
   * Tạo quiz mới
   */
  async createQuiz(userId, quizData) {
    try {
      // Validate category exists
      const category = await categoryModel.findById(quizData.category);
      if (!category) {
        return {
          success: false,
          message: 'Category not found'
        };
      }

      // Create quiz
      const newQuiz = new quizModel({
        ...quizData,
        createdBy: userId,
        questions: [], // Start with empty questions
        isDraft: true // New quiz starts as draft
      });

      const savedQuiz = await newQuiz.save();

      // Populate and return
      const populatedQuiz = await quizModel.findById(savedQuiz._id)
        .populate('category', 'name icon')
        .populate('createdBy', 'name email');

      return {
        success: true,
        data: populatedQuiz,
        message: 'Quiz created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error creating quiz: ' + error.message
      };
    }
  }

  // ============ UPDATE QUIZ ============

  /**
   * Update quiz (chỉ owner mới được update)
   */
  async updateQuiz(quizId, userId, updateData) {
    try {
      const quiz = await quizModel.findById(quizId);
      
      if (!quiz) {
        return {
          success: false,
          message: 'Quiz not found'
        };
      }

      // Check ownership
      if (quiz.createdBy.toString() !== userId) {
        return {
          success: false,
          message: 'Unauthorized: You can only update your own quizzes'
        };
      }

      // Validate category if being updated
      if (updateData.category) {
        const category = await categoryModel.findById(updateData.category);
        if (!category) {
          return {
            success: false,
            message: 'Category not found'
          };
        }
      }

      // Update quiz
      Object.assign(quiz, updateData);
      const updatedQuiz = await quiz.save();

      // Populate and return
      const populatedQuiz = await quizModel.findById(updatedQuiz._id)
        .populate('category', 'name icon')
        .populate('createdBy', 'name email');

      return {
        success: true,
        data: populatedQuiz,
        message: 'Quiz updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error updating quiz: ' + error.message
      };
    }
  }

  // ============ QUIZ ACTIONS ============

  /**
   * Publish quiz (chuyển từ draft sang public)
   */
  async publishQuiz(quizId, userId) {
    try {
      const quiz = await quizModel.findById(quizId);
      
      if (!quiz) {
        return {
          success: false,
          message: 'Quiz not found'
        };
      }

      // Check ownership
      if (quiz.createdBy.toString() !== userId) {
        return {
          success: false,
          message: 'Unauthorized: You can only publish your own quizzes'
        };
      }

      // Validate quiz has questions
      if (quiz.questions.length === 0) {
        return {
          success: false,
          message: 'Cannot publish quiz without questions'
        };
      }

      // Publish quiz
      quiz.isDraft = false;
      quiz.isPublic = true;
      await quiz.save();

      return {
        success: true,
        data: quiz,
        message: 'Quiz published successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error publishing quiz: ' + error.message
      };
    }
  }

  /**
   * Delete quiz (soft delete)
   */
  async deleteQuiz(quizId, userId) {
    try {
      const quiz = await quizModel.findById(quizId);
      
      if (!quiz) {
        return {
          success: false,
          message: 'Quiz not found'
        };
      }

      // Check ownership
      if (quiz.createdBy.toString() !== userId) {
        return {
          success: false,
          message: 'Unauthorized: You can only delete your own quizzes'
        };
      }

      // Soft delete
      quiz.isActive = false;
      await quiz.save();

      return {
        success: true,
        message: 'Quiz deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error deleting quiz: ' + error.message
      };
    }
  }

  // ============ SEARCH & FILTER ============

  /**
   * Search quizzes by title or tags
   */
  async searchQuizzes(searchTerm) {
    try {
      const quizzes = await quizModel.find({
        isActive: true,
        isDraft: false,
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      })
      .populate('category', 'name icon')
      .populate('createdBy', 'name')
      .sort({ playCount: -1 });

      return {
        success: true,
        data: quizzes,
        message: 'Search completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error searching quizzes: ' + error.message
      };
    }
  }

  /**
   * Get quiz statistics
   */
  async getQuizStats(quizId) {
    try {
      const quiz = await quizModel.findById(quizId);
      
      if (!quiz) {
        return {
          success: false,
          message: 'Quiz not found'
        };
      }

      const stats = {
        playCount: quiz.playCount,
        averageScore: quiz.averageScore,
        questionCount: quiz.questionCount,
        createdAt: quiz.createdAt,
        lastPlayed: quiz.updatedAt
      };

      return {
        success: true,
        data: stats,
        message: 'Quiz stats retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving quiz stats: ' + error.message
      };
    }
  }
}

export default new QuizManagementService(); 