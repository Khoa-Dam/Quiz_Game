import quizModel from '../../models/quizz/quizzModel.js';
import questionModel from '../../models/quizz/questionModel.js';

class GameSessionService {

  // ============ GAME PREPARATION ============

  /**
   * Chuẩn bị quiz data cho game session
   */
  async prepareQuizForGame(quizId) {
    try {
      const quiz = await quizModel.findById(quizId)
        .populate('questions')
        .populate('category', 'name');

      if (!quiz) {
        return {
          success: false,
          message: 'Quiz not found'
        };
      }

      if (quiz.isDraft) {
        return {
          success: false,
          message: 'Cannot play draft quiz'
        };
      }

      if (quiz.questions.length === 0) {
        return {
          success: false,
          message: 'Quiz has no questions'
        };
      }

      // Increment play count
      await quiz.incrementPlayCount();

      // Prepare quiz data for game (randomize if needed)
      let gameQuestions = [...quiz.questions];
      
      if (quiz.randomizeQuestions) {
        gameQuestions = this.shuffleArray(gameQuestions);
      }

      if (quiz.randomizeAnswers) {
        gameQuestions = gameQuestions.map(question => ({
          ...question.toObject(),
          answers: this.shuffleArray([...question.answers])
        }));
      }

      // Prepare clean game data
      const gameData = {
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          category: quiz.category,
          timePerQuestion: quiz.timePerQuestion,
          pointsPerQuestion: quiz.pointsPerQuestion,
          showCorrectAnswer: quiz.showCorrectAnswer,
          showExplanation: quiz.showExplanation,
          questionCount: quiz.questionCount
        },
        questions: gameQuestions.map((question, index) => ({
          questionNumber: index + 1,
          _id: question._id,
          questionText: question.questionText,
          questionType: question.questionType,
          questionImage: question.questionImage,
          answers: question.answers.map((answer, answerIndex) => ({
            id: answerIndex,
            text: answer.text,
            // Don't include isCorrect in game data for security
          })),
          timeLimit: question.timeLimit || quiz.timePerQuestion,
          points: question.points || quiz.pointsPerQuestion,
          explanation: quiz.showExplanation ? question.explanation : undefined
        }))
      };

      return {
        success: true,
        data: gameData,
        message: 'Quiz prepared for game successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error preparing quiz for game: ' + error.message
      };
    }
  }

  /**
   * Validate answer và tính điểm
   */
  async validateAnswer(questionId, selectedAnswerId, timeSpent) {
    try {
      const question = await questionModel.findById(questionId);
      
      if (!question) {
        return {
          success: false,
          message: 'Question not found'
        };
      }

      // Find correct answer
      const correctAnswer = question.answers.find(answer => answer.isCorrect);
      const selectedAnswer = question.answers[selectedAnswerId];
      
      if (!selectedAnswer) {
        return {
          success: false,
          message: 'Invalid answer selection'
        };
      }

      const isCorrect = selectedAnswer.isCorrect;
      
      // Calculate score based on correctness and time
      let score = 0;
      if (isCorrect) {
        const basePoints = question.points || 1000;
        const timeBonus = this.calculateTimeBonus(timeSpent, question.timeLimit);
        score = Math.round(basePoints * timeBonus);
      }

      // Update question stats
      await question.updateStats(isCorrect);

      return {
        success: true,
        data: {
          isCorrect,
          score,
          correctAnswer: {
            id: question.answers.findIndex(a => a.isCorrect),
            text: correctAnswer.text
          },
          selectedAnswer: {
            id: selectedAnswerId,
            text: selectedAnswer.text
          },
          explanation: question.explanation,
          timeSpent
        },
        message: 'Answer validated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error validating answer: ' + error.message
      };
    }
  }

  /**
   * Batch validate answers cho end-of-game scoring
   */
  async validateGameAnswers(quizId, userAnswers) {
    try {
      const quiz = await quizModel.findById(quizId).populate('questions');
      
      if (!quiz) {
        return {
          success: false,
          message: 'Quiz not found'
        };
      }

      const results = [];
      let totalScore = 0;
      let correctCount = 0;

      for (const userAnswer of userAnswers) {
        const question = quiz.questions.find(q => q._id.toString() === userAnswer.questionId);
        
        if (!question) {
          continue;
        }

        const correctAnswer = question.answers.find(answer => answer.isCorrect);
        const selectedAnswer = question.answers[userAnswer.selectedAnswerId];
        const isCorrect = selectedAnswer?.isCorrect || false;

        let score = 0;
        if (isCorrect) {
          const basePoints = question.points || quiz.pointsPerQuestion;
          const timeBonus = this.calculateTimeBonus(userAnswer.timeSpent, question.timeLimit || quiz.timePerQuestion);
          score = Math.round(basePoints * timeBonus);
          correctCount++;
        }

        totalScore += score;

        results.push({
          questionId: question._id,
          questionText: question.questionText,
          isCorrect,
          score,
          correctAnswer: {
            id: question.answers.findIndex(a => a.isCorrect),
            text: correctAnswer.text
          },
          selectedAnswer: {
            id: userAnswer.selectedAnswerId,
            text: selectedAnswer?.text || 'No answer'
          },
          timeSpent: userAnswer.timeSpent
        });

        // Update question stats
        await question.updateStats(isCorrect);
      }

      // Calculate performance metrics
      const accuracy = (correctCount / quiz.questions.length) * 100;
      const averageTimePerQuestion = userAnswers.reduce((sum, ans) => sum + ans.timeSpent, 0) / userAnswers.length;

      return {
        success: true,
        data: {
          totalScore,
          correctCount,
          totalQuestions: quiz.questions.length,
          accuracy: Math.round(accuracy * 100) / 100,
          averageTimePerQuestion: Math.round(averageTimePerQuestion),
          results
        },
        message: 'Game results calculated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error validating game answers: ' + error.message
      };
    }
  }

  // ============ UTILITY METHODS ============

  /**
   * Shuffle array (Fisher-Yates algorithm)
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Calculate time bonus multiplier (faster = higher score)
   */
  calculateTimeBonus(timeSpent, timeLimit) {
    // timeSpent in milliseconds, timeLimit in seconds
    const timeSpentSeconds = timeSpent / 1000;
    const timeLimitSeconds = timeLimit;
    
    if (timeSpentSeconds >= timeLimitSeconds) {
      return 0.5; // Minimum 50% points for correct but slow answers
    }
    
    // Linear bonus: faster answers get higher multiplier
    // 0 seconds = 1.0x, timeLimit seconds = 0.5x
    const bonus = 1.0 - (timeSpentSeconds / timeLimitSeconds) * 0.5;
    return Math.max(0.5, bonus);
  }

  /**
   * Generate random quiz từ category
   */
  async generateRandomQuiz(categoryId, questionCount = 10) {
    try {
      const randomQuestions = await questionModel.getRandomQuestions(categoryId, questionCount);
      
      if (randomQuestions.length < questionCount) {
        return {
          success: false,
          message: `Not enough questions in category. Found ${randomQuestions.length}, needed ${questionCount}`
        };
      }

      // Create temporary quiz structure for game
      const tempQuiz = {
        _id: 'random_' + Date.now(),
        title: 'Random Quiz',
        category: randomQuestions[0].category,
        timePerQuestion: 30,
        pointsPerQuestion: 1000,
        showCorrectAnswer: true,
        showExplanation: false,
        questionCount: randomQuestions.length,
        randomizeQuestions: false, // Already randomized
        randomizeAnswers: true
      };

      // Prepare questions for game
      let gameQuestions = randomQuestions.map((question, index) => ({
        questionNumber: index + 1,
        _id: question._id,
        questionText: question.questionText,
        questionType: question.questionType,
        questionImage: question.questionImage,
        answers: tempQuiz.randomizeAnswers ? 
          this.shuffleArray([...question.answers]).map((answer, answerIndex) => ({
            id: answerIndex,
            text: answer.text
          })) :
          question.answers.map((answer, answerIndex) => ({
            id: answerIndex,
            text: answer.text
          })),
        timeLimit: question.timeLimit || tempQuiz.timePerQuestion,
        points: question.points || tempQuiz.pointsPerQuestion,
        explanation: tempQuiz.showExplanation ? question.explanation : undefined
      }));

      return {
        success: true,
        data: {
          quiz: tempQuiz,
          questions: gameQuestions
        },
        message: 'Random quiz generated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error generating random quiz: ' + error.message
      };
    }
  }

  /**
   * Get game preview (first few questions)
   */
  async getQuizPreview(quizId, questionCount = 3) {
    try {
      const quiz = await quizModel.findById(quizId)
        .populate({
          path: 'questions',
          options: { limit: questionCount }
        })
        .populate('category', 'name');

      if (!quiz) {
        return {
          success: false,
          message: 'Quiz not found'
        };
      }

      const previewQuestions = quiz.questions.slice(0, questionCount).map((question, index) => ({
        questionNumber: index + 1,
        questionText: question.questionText,
        questionType: question.questionType,
        questionImage: question.questionImage,
        answerCount: question.answers.length
      }));

      return {
        success: true,
        data: {
          quiz: {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            category: quiz.category,
            questionCount: quiz.questionCount,
            timePerQuestion: quiz.timePerQuestion,
            playCount: quiz.playCount
          },
          previewQuestions
        },
        message: 'Quiz preview retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error getting quiz preview: ' + error.message
      };
    }
  }
}

export default new GameSessionService(); 