import quizModel from '../../models/quizz/quizzModel.js';
import questionModel from '../../models/quizz/questionModel.js';

class QuestionManagementService {

  // ============ ADD/REMOVE QUESTIONS ============

  /**
   * Thêm câu hỏi vào quiz
   */
  async addQuestionToQuiz(quizId, userId, questionId) {
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
          message: 'Unauthorized: You can only modify your own quizzes'
        };
      }

      // Validate question exists
      const question = await questionModel.findById(questionId);
      if (!question) {
        return {
          success: false,
          message: 'Question not found'
        };
      }

      // Check if question already in quiz
      if (quiz.questions.includes(questionId)) {
        return {
          success: false,
          message: 'Question already in quiz'
        };
      }

      // Add question
      quiz.questions.push(questionId);
      await quiz.save(); // questionCount will be auto-updated by middleware

      // Return updated quiz with populated questions
      const updatedQuiz = await quizModel.findById(quizId)
        .populate('questions')
        .populate('category', 'name');

      return {
        success: true,
        data: updatedQuiz,
        message: 'Question added to quiz successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error adding question to quiz: ' + error.message
      };
    }
  }

  /**
   * Xóa câu hỏi khỏi quiz
   */
  async removeQuestionFromQuiz(quizId, userId, questionId) {
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
          message: 'Unauthorized: You can only modify your own quizzes'
        };
      }

      // Remove question
      quiz.questions = quiz.questions.filter(qId => qId.toString() !== questionId);
      await quiz.save(); // questionCount will be auto-updated

      // Return updated quiz with populated questions
      const updatedQuiz = await quizModel.findById(quizId)
        .populate('questions')
        .populate('category', 'name');

      return {
        success: true,
        data: updatedQuiz,
        message: 'Question removed from quiz successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error removing question from quiz: ' + error.message
      };
    }
  }

  /**
   * Thêm nhiều câu hỏi vào quiz cùng lúc
   */
  async addMultipleQuestionsToQuiz(quizId, userId, questionIds) {
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
          message: 'Unauthorized: You can only modify your own quizzes'
        };
      }

      // Validate all questions exist
      const questions = await questionModel.find({ _id: { $in: questionIds } });
      if (questions.length !== questionIds.length) {
        return {
          success: false,
          message: 'Some questions not found'
        };
      }

      // Filter out questions already in quiz
      const newQuestionIds = questionIds.filter(qId => !quiz.questions.includes(qId));
      
      if (newQuestionIds.length === 0) {
        return {
          success: false,
          message: 'All questions are already in quiz'
        };
      }

      // Add new questions
      quiz.questions.push(...newQuestionIds);
      await quiz.save();

      // Return updated quiz with populated questions
      const updatedQuiz = await quizModel.findById(quizId)
        .populate('questions')
        .populate('category', 'name');

      return {
        success: true,
        data: updatedQuiz,
        message: `${newQuestionIds.length} questions added to quiz successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error adding questions to quiz: ' + error.message
      };
    }
  }

  // ============ QUESTION SUGGESTIONS ============

  /**
   * Lấy câu hỏi gợi ý cho quiz (theo category)
   */
  async getSuggestedQuestions(quizId, userId, limit = 10) {
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
          message: 'Unauthorized: You can only view your own quizzes'
        };
      }

      // Find questions in same category that are not in this quiz
      const suggestedQuestions = await questionModel.find({
        category: quiz.category,
        isActive: true,
        _id: { $nin: quiz.questions } // Not in current quiz
      })
      .populate('category', 'name')
      .sort({ usageCount: -1 }) // Most used first
      .limit(limit);

      return {
        success: true,
        data: suggestedQuestions,
        message: 'Suggested questions retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving suggested questions: ' + error.message
      };
    }
  }

  /**
   * Lấy câu hỏi từ bank theo category
   */
  async getQuestionsByCategory(categoryId, excludeQuizId = null, limit = 20) {
    try {
      const query = {
        category: categoryId,
        isActive: true,
        isPublic: true
      };

      // Exclude questions already in a specific quiz
      if (excludeQuizId) {
        const quiz = await quizModel.findById(excludeQuizId);
        if (quiz && quiz.questions.length > 0) {
          query._id = { $nin: quiz.questions };
        }
      }

      const questions = await questionModel.find(query)
        .populate('category', 'name')
        .populate('createdBy', 'name')
        .sort({ usageCount: -1, createdAt: -1 })
        .limit(limit);

      return {
        success: true,
        data: questions,
        message: 'Questions retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving questions: ' + error.message
      };
    }
  }

  // ============ QUIZ QUESTION MANAGEMENT ============

  /**
   * Reorder questions trong quiz
   */
  async reorderQuestions(quizId, userId, questionOrder) {
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
          message: 'Unauthorized: You can only modify your own quizzes'
        };
      }

      // Validate all questions in order exist in quiz
      const currentQuestionIds = quiz.questions.map(q => q.toString());
      const newOrderIds = questionOrder.map(q => q.toString());
      
      if (currentQuestionIds.length !== newOrderIds.length ||
          !currentQuestionIds.every(id => newOrderIds.includes(id))) {
        return {
          success: false,
          message: 'Invalid question order: questions don\'t match'
        };
      }

      // Update order
      quiz.questions = questionOrder;
      await quiz.save();

      return {
        success: true,
        data: quiz,
        message: 'Question order updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error reordering questions: ' + error.message
      };
    }
  }

  /**
   * Duplicate questions from another quiz
   */
  async duplicateQuestionsFromQuiz(targetQuizId, sourceQuizId, userId) {
    try {
      const targetQuiz = await quizModel.findById(targetQuizId);
      const sourceQuiz = await quizModel.findById(sourceQuizId)
        .populate('questions');
      
      if (!targetQuiz || !sourceQuiz) {
        return {
          success: false,
          message: 'Quiz not found'
        };
      }

      // Check ownership of target quiz
      if (targetQuiz.createdBy.toString() !== userId) {
        return {
          success: false,
          message: 'Unauthorized: You can only modify your own quizzes'
        };
      }

      // Check if source quiz is accessible
      if (!sourceQuiz.isPublic && sourceQuiz.createdBy.toString() !== userId) {
        return {
          success: false,
          message: 'Source quiz is not accessible'
        };
      }

      // Get questions not already in target quiz
      const newQuestionIds = sourceQuiz.questions
        .map(q => q._id.toString())
        .filter(qId => !targetQuiz.questions.includes(qId));

      if (newQuestionIds.length === 0) {
        return {
          success: false,
          message: 'No new questions to add'
        };
      }

      // Add new questions
      targetQuiz.questions.push(...newQuestionIds);
      await targetQuiz.save();

      const updatedQuiz = await quizModel.findById(targetQuizId)
        .populate('questions')
        .populate('category', 'name');

      return {
        success: true,
        data: updatedQuiz,
        message: `${newQuestionIds.length} questions duplicated successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error duplicating questions: ' + error.message
      };
    }
  }
}

export default new QuestionManagementService(); 