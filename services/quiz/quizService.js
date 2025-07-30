import Quiz from "../../models/quiz/quizModel.js";
import Question from "../../models/quiz/questionModel.js";

export const quizService = {
  
  /**
   * Tạo quiz mới
   */
  async createQuiz({ title, description, questionIds, timePerQuestion, createdBy, scoring }) {
    // Kiểm tra questions tồn tại
    const questions = await Question.find({ _id: { $in: questionIds } });
    if (questions.length !== questionIds.length) {
      throw new Error('Một số câu hỏi không tồn tại');
    }
    
    const quiz = new Quiz({
      title,
      description,
      questions: questionIds,
      timePerQuestion: timePerQuestion || 15,
      createdBy,
      scoring: {
        basePoints: scoring?.basePoints || 100,
        timeBonus: scoring?.timeBonus !== undefined ? scoring.timeBonus : true,
        maxTimeBonus: scoring?.maxTimeBonus || 50,
        penaltyForWrong: scoring?.penaltyForWrong || false,
        wrongAnswerPenalty: scoring?.wrongAnswerPenalty || 0
      }
    });
    
    await quiz.save();
    return { quiz, message: 'Quiz đã được tạo thành công' };
  },
  
  /**
   * Lấy tất cả quiz active
   */
  async getAllActiveQuizzes(userId = null) {
    const query = { isActive: true };
    if (userId) {
      query.createdBy = userId;
    }
    
    const quizzes = await Quiz.find(query)
      .populate('createdBy', 'name email')
      .populate('questions', 'text')
      .sort({ createdAt: -1 });
    
    return { 
      quizzes, 
      message: 'Lấy danh sách quiz thành công' 
    };
  },
  
  /**
   * Lấy quiz cho game (không có đáp án)
   */
  async getQuizForGame(quizId) {
    const quiz = await Quiz.findOne({ _id: quizId, isActive: true })
      .populate('questions', 'text options')
      .populate('createdBy', 'name');
    
    if (!quiz) {
      throw new Error('Quiz không tồn tại hoặc đã bị vô hiệu hóa');
    }
    
    // Format data cho game
    const gameQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      totalQuestions: quiz.questions.length,
      timePerQuestion: quiz.timePerQuestion,
      createdBy: quiz.createdBy.name,
      scoring: quiz.scoring,
      questions: quiz.questions.map((q, index) => ({
        index: index,
        text: q.text,
        options: q.options
      }))
    };
    
    return { 
      gameQuiz, 
      message: 'Lấy quiz cho game thành công' 
    };
  },
  
  /**
   * Kiểm tra đáp án và tính điểm
   */
  async checkAnswer(quizId, questionIndex, selectedAnswer, responseTime) {
    const quiz = await Quiz.findById(quizId).populate('questions');
    
    if (!quiz || questionIndex >= quiz.questions.length) {
      throw new Error('Câu hỏi không tồn tại');
    }
    
    const question = quiz.questions[questionIndex];
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    // Tính điểm
    let points = 0;
    if (isCorrect) {
      points = quiz.scoring.basePoints;
      
      if (quiz.scoring.timeBonus && responseTime) {
        const maxTime = quiz.timePerQuestion * 1000;
        const timeLeft = Math.max(0, maxTime - responseTime);
        const timePercent = timeLeft / maxTime;
        const bonus = Math.round(timePercent * quiz.scoring.maxTimeBonus);
        points += bonus;
      }
    } else if (quiz.scoring.penaltyForWrong) {
      points = -quiz.scoring.wrongAnswerPenalty;
    }
    
    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      points: Math.max(0, points),
      explanation: `${isCorrect ? 'Chính xác!' : 'Sai rồi!'} Đáp án đúng là: ${question.options[question.correctAnswer]}`
    };
  },
  
  /**
   * Cập nhật quiz
   */
  async updateQuiz(quizId, updateData, userId) {
    const quiz = await Quiz.findOne({ _id: quizId, createdBy: userId });
    
    if (!quiz) {
      throw new Error('Quiz không tồn tại hoặc bạn không có quyền chỉnh sửa');
    }
    
    // Cập nhật các field được phép
    const allowedFields = ['title', 'description', 'timePerQuestion', 'scoring'];
    for (let field of allowedFields) {
      if (updateData[field] !== undefined) {
        quiz[field] = updateData[field];
      }
    }
    
    await quiz.save();
    return { quiz, message: 'Quiz đã được cập nhật' };
  },
  
  /**
   * Xóa quiz (soft delete)
   */
  async deleteQuiz(quizId, userId) {
    const quiz = await Quiz.findOne({ _id: quizId, createdBy: userId });
    
    if (!quiz) {
      throw new Error('Quiz không tồn tại hoặc bạn không có quyền xóa');
    }
    
    quiz.isActive = false;
    await quiz.save();
    
    return { message: 'Quiz đã được xóa' };
  }
};