import { roomService } from "../../room/roomService.js";
import { quizService } from "../../quiz/quizService.js";

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
    }
  }

  /**
   * Get room and quiz data safely
   */
  getRoomAndQuizData(roomCode, roomManager) {
    const room = roomManager.getRoomData(roomCode);
    const quiz = this.roomQuizzes.get(roomCode);
    
    if (!room) {
      console.error('Room not found:', roomCode);
      return null;
    }
    
    if (!quiz) {
      console.error('Quiz data not found for room:', roomCode);
      return null;
    }
    
    return { room, quiz };
  }

  /**
   * Handle start game event
   */
  async handleStartGame(socket, data, authManager, roomManager) {
    try {
      if (!authManager.validateAuth(socket) || !authManager.validateHost(socket)) return;
      
      const { roomId } = data;
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
      roomManager.initializeRoom(socket.roomCode, result.room._id);
      
      // Gửi thông tin game bắt đầu cho tất cả players
      this.io.to(`room_${socket.roomCode}`).emit('game_started', {
        quiz: quizResult.gameQuiz,
        currentQuestion: 0,
        message: 'Game has started!'
      });
      
      // Gửi câu hỏi đầu tiên
      this.sendQuestion(socket.roomCode, 0, quizResult.gameQuiz, result.room._id, roomManager);
      
    } catch (error) {
      authManager.handleError(socket, error, 'start_game');
    }
  }

  /**
   * Send question to room
   */
  async sendQuestion(roomCode, questionIndex, quiz, roomId, roomManager) {
    if (questionIndex >= quiz.questions.length) {
      this.endGame(roomCode, roomManager);
      return;
    }
    
    // Clear any existing timeout for this question
    this.clearQuestionTimeout(roomCode, questionIndex);
    
    // Update currentQuestion in database
    try {
      await roomService.updateCurrentQuestion(roomId, questionIndex);
    } catch (error) {
      console.error('Error updating current question:', error);
    }
    
    const question = quiz.questions[questionIndex];
    
    this.io.to(`room_${roomCode}`).emit('new_question', {
      questionIndex,
      totalQuestions: quiz.questions.length,
      question: {
        text: question.text,
        options: question.options
      },
      timeLimit: 25, // Fixed 25 seconds
      startTime: new Date()
    });
    
    // Set timeout for auto move to next question (25 seconds fixed)
    const timeoutKey = `${roomCode}_${questionIndex}`;
    const timeoutId = setTimeout(() => {
      console.log(`⏰ 25 seconds timeout reached for room ${roomCode}, question ${questionIndex} - auto assigning 0 points for unanswered players`);
      this.showResults(roomCode, questionIndex, roomManager);
    }, 25000); // 25 seconds fixed
    
    this.questionTimeouts.set(timeoutKey, timeoutId);
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
   * Clean up all game data for room
   */
  cleanupRoom(roomCode, roomManager) {
    // Clear all timeouts for this room
    this.questionTimeouts.forEach((timeoutId, key) => {
      if (key.startsWith(roomCode)) {
        clearTimeout(timeoutId);
        this.questionTimeouts.delete(key);
      }
    });
    
    // Remove quiz data
    this.roomQuizzes.delete(roomCode);
    
    // Let room manager clean up its data
    roomManager.cleanupRoom(roomCode);
    
    console.log(`🧹 Game data cleaned up for room: ${roomCode}`);
  }
}