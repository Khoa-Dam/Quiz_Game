import Quiz from "./quizModel.js";
import Question from "./questionModel.js";

export const quizService = {
  /**
   * Tạo quiz mới với questions tự động
   */
  async createQuiz({
    title,
    description,
    questions,
    timePerQuestion,
    createdBy,
    scoring,
  }) {
    // Tạo questions mới
    const createdQuestions = [];
    for (const questionData of questions) {
      console.log("DEBUG: questionData in createQuiz:", questionData); // ADD THIS
      const question = new Question({
        text: questionData.text,
        imageUrl: questionData.imageUrl, // Add imageUrl
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
      });
      await question.save();
      createdQuestions.push(question._id);
    }

    const quiz = new Quiz({
      title,
      description,
      questions: createdQuestions,
      timePerQuestion: timePerQuestion || 15,
      createdBy,
      scoring: {
        basePoints: scoring?.basePoints || 100,
        timeBonus: scoring?.timeBonus !== undefined ? scoring.timeBonus : true,
        maxTimeBonus: scoring?.maxTimeBonus || 50,
        penaltyForWrong: scoring?.penaltyForWrong || false,
        wrongAnswerPenalty: scoring?.wrongAnswerPenalty || 0,
      },
    });

    await quiz.save();
    return { quiz, message: "Quiz đã được tạo thành công" };
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
      .populate("createdBy", "name email")
      .populate("questions", "text")
      .sort({ createdAt: -1 });

    return {
      quizzes,
      message: "Lấy danh sách quiz thành công",
    };
  },

  async getQuizById(quizId) {
    const quiz = await Quiz.findById(quizId)
      .populate("questions")
      .populate("createdBy", "name email");

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    return { quiz, message: "Quiz fetched successfully" };
  },

  /**
   * Lấy quiz cho game (không có đáp án)
   */
  async getQuizForGame(quizId) {
    console.log("=== GET QUIZ FOR GAME DEBUG ===");
    console.log("Quiz ID:", quizId);

    const quiz = await Quiz.findOne({ _id: quizId, isActive: true })
      .populate("questions", "text options imageUrl")
      .populate("createdBy", "name");

    console.log("Quiz found:", !!quiz);
    console.log("Quiz createdBy:", quiz?.createdBy);
    console.log("Quiz questions count:", quiz?.questions?.length);
    console.log("===============================");

    if (!quiz) {
      throw new Error("Quiz không tồn tại hoặc đã bị vô hiệu hóa");
    }

    // Format data cho game
    const gameQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      totalQuestions: quiz.questions.length,
      timePerQuestion: quiz.timePerQuestion,
      createdBy: quiz.createdBy?.name || "Unknown",
      scoring: quiz.scoring,
      questions: quiz.questions.map((q, index) => ({
        index: index,
        text: q.text,
        options: q.options,
        imageUrl: q.imageUrl, // Add this line
      })),
    };

    return {
      gameQuiz,
      message: "Lấy quiz cho game thành công",
    };
  },

  /**
   * Kiểm tra đáp án và tính điểm
   */
  async checkAnswer(quizId, questionIndex, selectedAnswer, responseTime) {
    const quiz = await Quiz.findById(quizId).populate("questions");

    if (!quiz || questionIndex >= quiz.questions.length) {
      throw new Error("Câu hỏi không tồn tại");
    }

    const question = quiz.questions[questionIndex];
    const isCorrect = selectedAnswer === question.correctAnswer;

    // Tính điểm
    let points = 0;
    if (isCorrect) {
      points = quiz.scoring.basePoints;

      if (quiz.scoring.timeBonus && responseTime) {
        const maxTime = 25000; // Fixed 25 seconds = 25000ms
        const timeLeft = Math.max(0, maxTime - responseTime);
        const timePercent = timeLeft / maxTime;
        const bonus = Math.round(timePercent * quiz.scoring.maxTimeBonus);
        points += bonus;

        console.log(
          `⏱️ Time scoring: ${responseTime}ms response, ${timeLeft}ms left, ${timePercent.toFixed(
            2
          )} time percent, +${bonus} bonus points`
        );
      }
    } else if (quiz.scoring.penaltyForWrong) {
      points = -quiz.scoring.wrongAnswerPenalty;
    }

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      points: Math.max(0, points),
      explanation: `${isCorrect ? "Chính xác!" : "Sai rồi!"} Đáp án đúng là: ${question.options[question.correctAnswer]
        }`,
    };
  },

  /**
   * Cập nhật quiz
   */
  async updateQuiz(quizId, updateData, userId) {
    const quiz = await Quiz.findOne({ _id: quizId, createdBy: userId });

    if (!quiz) {
      throw new Error("Quiz không tồn tại hoặc bạn không có quyền chỉnh sửa");
    }

    // Xóa các câu hỏi cũ liên quan đến quiz này
    if (quiz.questions && quiz.questions.length > 0) {
      await Question.deleteMany({ _id: { $in: quiz.questions } });
    }

    // Tạo các câu hỏi mới từ updateData
    const newQuestionIds = [];
    if (updateData.questions && updateData.questions.length > 0) {
      for (const questionData of updateData.questions) {
        console.log("DEBUG: questionData in updateQuiz:", questionData); // ADD THIS
        const question = new Question({
          text: questionData.text,
          imageUrl: questionData.imageUrl,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
        });
        await question.save();
        newQuestionIds.push(question._id);
      }
    }

    // Cập nhật các field được phép của quiz chính
    const allowedFields = [
      "title",
      "description",
      "timePerQuestion",
      "scoring",
    ];
    for (let field of allowedFields) {
      if (updateData[field] !== undefined) {
        quiz[field] = updateData[field];
      }
    }
    quiz.questions = newQuestionIds; // Cập nhật danh sách câu hỏi mới

    await quiz.save();
    return { quiz, message: "Quiz đã được cập nhật" };
  },

  /**
   * Xóa quiz (soft delete)
   */
  async deleteQuiz(quizId, userId) {
    const quiz = await Quiz.findOne({ _id: quizId, createdBy: userId });

    if (!quiz) {
      throw new Error("Quiz không tồn tại hoặc bạn không có quyền xóa");
    }

    quiz.isActive = false;
    await quiz.save();

    return { message: "Quiz đã được xóa" };
  },
};
