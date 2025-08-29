import { roomService } from "../../../room/roomService.js";
import { quizService } from "../../../quiz/quizService.js";

export class GameManager {
  constructor(io) {
    this.io = io;
    this.roomQuizzes = new Map(); // Store quiz data for each room
    this.questionTimeouts = new Map(); // Track question timeouts
  }

  /**
   * Clear question timeout
   */
  clearQuestionTimeout(roomCode, questionIndex) {
    const timeoutKey = `${roomCode}_${questionIndex}`;
    const timeoutId = this.questionTimeouts.get(timeoutKey);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.questionTimeouts.delete(timeoutKey);
      console.log(`⏰ Cleared timeout for room ${roomCode}, question ${questionIndex}`);
    }
  }

  /**
   * Get room and quiz data safely
   */
  getRoomAndQuizData(roomCode, roomManager) {
    const room = roomManager.getRoomData(roomCode);
    const quiz = this.roomQuizzes.get(roomCode);

    if (!room) {
      console.error(`❌ Room not found: ${roomCode}`);
      return null;
    }

    if (!quiz) {
      console.error(`❌ Quiz data not found for room: ${roomCode}`);
      return null;
    }

    return { room, quiz };
  }

  /**
   * Handle start countdown event
   */
  async handleStartCountdown(socket, data, authManager) {
    try {
      console.log(`[DEBUG] handleStartCountdown called for room: ${socket.roomCode}, isHost: ${socket.isHost}`);
      if (!authManager.validateAuth(socket) || !authManager.validateHost(socket)) return;

      console.log(`⏳ Countdown started for room: ${socket.roomCode}`);

      // Broadcast to all players in the room to start their countdown
      this.io.to(`room_${socket.roomCode}`).emit('countdown_started', {
        duration: 3,
        message: 'Game is about to start!'
      });

    } catch (error) {
      console.error(`❌ Error starting countdown for room ${socket.roomCode}:`, error);
      authManager.handleError(socket, error, 'start_countdown');
    }
  }

  /**
   * Handle start game event
   */
  async handleStartGame(socket, data, authManager, roomManager) {
    try {
      if (!authManager.validateAuth(socket) || !authManager.validateHost(socket)) return;

      const { roomId } = data;

      // Check if room is already in game
      if (this.roomQuizzes.has(socket.roomCode)) {
        console.warn(`⚠️ Room ${socket.roomCode} is already in game`);
        socket.emit('error', { message: 'Game is already in progress for this room' });
        return;
      }

      const result = await roomService.startGame({
        roomId,
        hostId: socket.userId
      });

      // Lấy quiz info để bắt đầu
      const quizResult = await quizService.getQuizForGame(result.room.quiz);
      if (!quizResult || !quizResult.gameQuiz) {
        socket.emit('error', { message: 'Cannot get quiz info' });
        return;
      }

      // Lưu quiz data và ensure room initialization
      this.roomQuizzes.set(socket.roomCode, quizResult.gameQuiz);
      const room = roomManager.initializeRoom(socket.roomCode, result.room._id);

      console.log(`🎮 Starting game for room: ${socket.roomCode}, quiz: ${quizResult.gameQuiz._id}`);

      // Gửi thông tin game bắt đầu cho tất cả players
      this.io.to(`room_${socket.roomCode}`).emit('game_started', {
        quiz: quizResult.gameQuiz,
        currentQuestion: 0,
        message: 'Game has started!'
      });

      // Gửi câu hỏi đầu tiên
      this.sendQuestion(socket.roomCode, 0, quizResult.gameQuiz, result.room._id, roomManager);

    } catch (error) {
      console.error(`❌ Error starting game for room ${socket.roomCode}:`, error);
      authManager.handleError(socket, error, 'start_game');
    }
  }

  /**
   * Send question to room
   */
  async sendQuestion(roomCode, questionIndex, quiz, roomId, roomManager) {
    if (questionIndex >= quiz.questions.length) {
      console.log(`🏁 Quiz completed for room ${roomCode}, ending game`);
      this.endGame(roomCode, roomManager);
      return;
    }

    // Clear any existing timeout for this question
    this.clearQuestionTimeout(roomCode, questionIndex);

    // Update currentQuestion in database
    try {
      await roomService.updateCurrentQuestion(roomId, questionIndex);
      console.log(`📝 Updated current question to ${questionIndex} for room ${roomCode}`);
    } catch (error) {
      console.error(`❌ Error updating current question for room ${roomCode}:`, error);
    }

    const question = quiz.questions[questionIndex];

    console.log(`❓ Sending question ${questionIndex + 1}/${quiz.questions.length} to room ${roomCode}`);

    this.io.to(`room_${roomCode}`).emit('new_question', {
      questionIndex,
      totalQuestions: quiz.questions.length,
      question: {
        text: question.text,
        options: question.options,
        imageUrl: question.imageUrl // Add this line
      },
      timeLimit: quiz.timePerQuestion, // Use quiz's time limit
      startTime: new Date()
    });

    // Set timeout for auto move to next question (25 seconds fixed)
    const timeoutKey = `${roomCode}_${questionIndex}`;
    const timeoutId = setTimeout(() => {
      console.log(`⏰ 25 seconds timeout reached for room ${roomCode}, question ${questionIndex} - auto assigning 0 points for unanswered players`);
      this.showResults(roomCode, questionIndex, roomManager);
    }, quiz.timePerQuestion * 1000); // Use quiz's time limit

    this.questionTimeouts.set(timeoutKey, timeoutId);
    console.log(`⏱️ Set timeout for room ${roomCode}, question ${questionIndex}`);
  }

  /**
   * Handle submit answer event
   */
  async handleSubmitAnswer(socket, data, authManager, roomManager, scoreManager) {
    try {
      if (!authManager.validateAuth(socket)) return;

      // Host không được trả lời câu hỏi
      if (socket.isHost) {
        socket.emit('error', { message: 'Host cannot answer questions. Only players can answer.' });
        return;
      }

      const { roomId, questionIndex, selectedAnswer, responseTime } = data;

      // Lưu answer vào memory
      roomManager.savePlayerAnswer(socket.roomCode, socket.userId, {
        questionIndex,
        selectedAnswer,
        responseTime,
        timestamp: new Date()
      });

      // Thông báo cho room ai đã trả lời
      socket.to(`room_${socket.roomCode}`).emit('player_answered', {
        message: 'A player has answered'
      });

      // Confirm cho player
      socket.emit('answer_submitted', {
        success: true,
        message: 'Answer has been recorded'
      });

      // Kiểm tra tất cả đã trả lời chưa
      console.log(`📝 Player ${socket.userId} submitted answer for question ${questionIndex}`);
      const room = roomManager.getRoomData(socket.roomCode);
      if (scoreManager.allPlayersAnswered(room, questionIndex)) {
        console.log(`✅ All players answered question ${questionIndex}, showing results`);
        // Clear timeout vì đã có người trả lời
        this.clearQuestionTimeout(socket.roomCode, questionIndex);
        this.showResults(socket.roomCode, questionIndex, roomManager, scoreManager);
      } else {
        console.log(`⏳ Waiting for more players to answer question ${questionIndex}`);
      }

    } catch (error) {
      authManager.handleError(socket, error, 'submit_answer');
    }
  }

  /**
   * Show question results
   */
  async showResults(roomCode, questionIndex, roomManager, scoreManager = null) {
    // Use instance scoreManager if not provided
    if (!scoreManager) {
      const { ScoreManager } = await import('./ScoreManager.js');
      scoreManager = new ScoreManager();
    }
    try {
      console.log(`🎯 Showing results for room ${roomCode}, question ${questionIndex}`);

      // Get room and quiz data safely
      const roomData = this.getRoomAndQuizData(roomCode, roomManager);
      if (!roomData) return;

      const { room, quiz } = roomData;
      const quizId = quiz._id;

      // Calculate scores for all players
      const playerResults = await scoreManager.calculatePlayerResults(room, quizId, questionIndex);

      // Get correct answer
      const correctAnswer = await scoreManager.getCorrectAnswer(quizId, questionIndex);

      // Update cumulative scores and calculate leaderboard
      scoreManager.updatePlayerScores(room, playerResults);
      const leaderboard = scoreManager.calculateLeaderboard(room);

      // Broadcast results to all players
      this.io.to(`room_${roomCode}`).emit('question_results', {
        questionIndex,
        correctAnswer,
        leaderboard,
        playerResults: playerResults.map(p => ({
          userId: p.userId,
          isCorrect: p.isCorrect,
          points: p.points
        })),
        message: 'Question results'
      });

      // Move to next question after 5 seconds
      setTimeout(() => {
        this.moveToNextQuestion(roomCode, questionIndex + 1, roomManager, scoreManager);
      }, 5000);

    } catch (error) {
      console.error('Error showing results:', error);
    }
  }

  /**
   * Move to next question or end game
   */
  moveToNextQuestion(roomCode, nextQuestionIndex, roomManager, scoreManager = null) {
    const roomData = this.getRoomAndQuizData(roomCode, roomManager);
    if (!roomData) return;

    const { room, quiz } = roomData;

    if (nextQuestionIndex >= quiz.questions.length) {
      this.endGame(roomCode, roomManager, scoreManager);
    } else {
      console.log(`🔄 Sending next question ${nextQuestionIndex} for room ${roomCode}`);
      this.sendQuestion(roomCode, nextQuestionIndex, quiz, room.roomId, roomManager);
    }
  }

  /**
   * End game
   */
  endGame(roomCode, roomManager, scoreManager = null) {
    // Use instance scoreManager if not provided
    if (!scoreManager) {
      const { ScoreManager } = require('./ScoreManager.js');
      scoreManager = new ScoreManager();
    }
    console.log(`🏁 Game ended for room: ${roomCode}`);

    const room = roomManager.getRoomData(roomCode);
    const finalLeaderboard = room ? scoreManager.calculateLeaderboard(room) : [];
    const winner = finalLeaderboard.length > 0 ? finalLeaderboard[0] : null;

    this.io.to(`room_${roomCode}`).emit('game_finished', {
      leaderboard: finalLeaderboard,
      winner: winner,
      message: 'Game has ended!'
    });

    // Cleanup all room data
    this.cleanupRoom(roomCode, roomManager);
  }

  /**
   * Get status of all active rooms (for debugging)
   */
  getActiveRoomsStatus() {
    const status = {
      totalRooms: this.roomQuizzes.size,
      rooms: []
    };

    this.roomQuizzes.forEach((quiz, roomCode) => {
      status.rooms.push({
        roomCode,
        quizId: quiz._id,
        totalQuestions: quiz.questions.length,
        hasActiveTimeouts: Array.from(this.questionTimeouts.keys()).some(key => key.startsWith(roomCode))
      });
    });

    return status;
  }

  /**
   * Clean up all game data for room
   */
  cleanupRoom(roomCode, roomManager) {
    console.log(`🧹 Starting cleanup for room: ${roomCode}`);

    // Clear all timeouts for this room
    let clearedTimeouts = 0;
    this.questionTimeouts.forEach((timeoutId, key) => {
      if (key.startsWith(roomCode)) {
        clearTimeout(timeoutId);
        this.questionTimeouts.delete(key);
        clearedTimeouts++;
      }
    });
    console.log(`⏰ Cleared ${clearedTimeouts} timeouts for room ${roomCode}`);

    // Remove quiz data
    const hadQuiz = this.roomQuizzes.has(roomCode);
    this.roomQuizzes.delete(roomCode);
    if (hadQuiz) {
      console.log(`📚 Removed quiz data for room ${roomCode}`);
    }

    // Let room manager clean up its data
    roomManager.cleanupRoom(roomCode);

    console.log(`✅ Game data cleanup completed for room: ${roomCode}`);
  }
}