import { roomService } from "../room/roomService.js";
import { quizService } from "../quiz/quizService.js";
import { tokenService } from "../auth/tokenService.js";
import Room from "../../models/room/roomModel.js";

export class GameSocketService {
  constructor(io) {
    this.io = io;
    this.activeRooms = new Map(); // Track active game rooms
  }
  
  /**
   * Initialize Socket.IO events
   */
  initializeEvents() {
    this.io.on('connection', (socket) => {
      console.log(`🎮 User connected: ${socket.id}`);
      
      // ============ AUTH & CONNECTION ============
      socket.on('authenticate', async (data) => {
        try {
          const { token } = data;
          const decoded = tokenService.verifyToken(token);
          
          socket.userId = decoded.id;
          socket.authenticated = true;
          
          socket.emit('authenticated', {
            success: true,
            message: 'Xác thực thành công'
          });
          
        } catch (error) {
          socket.emit('auth_error', {
            success: false,
            message: 'Token không hợp lệ'
          });
        }
      });
      
      // ============ ROOM MANAGEMENT ============
      socket.on('create_room', async (data) => {
        try {
          if (!socket.authenticated) {
            socket.emit('error', { message: 'Chưa xác thực' });
            return;
          }
          
          const { quizId, settings } = data;
          const result = await roomService.createRoom({
            quizId,
            hostId: socket.userId,
            settings
          });
          
          // Join socket room
          socket.join(`room_${result.roomCode}`);
          socket.roomCode = result.roomCode;
          socket.isHost = true;
          
          socket.emit('room_created', {
            success: true,
            data: {
              roomId: result.room._id,
              roomCode: result.roomCode
            },
            message: result.message
          });
          
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });
      
      socket.on('join_room', async (data) => {
        try {
          if (!socket.authenticated) {
            socket.emit('error', { message: 'Chưa xác thực' });
            return;
          }
          
          const { roomCode } = data;
          const result = await roomService.joinRoom({
            roomCode,
            userId: socket.userId
          });
          
          // Join socket room
          socket.join(`room_${roomCode}`);
          socket.roomCode = roomCode;
          socket.isHost = false;
          
          // Thông báo cho player mới
          socket.emit('room_joined', {
            success: true,
            data: {
              roomId: result.room._id,
              roomCode: result.room.roomCode,
              quizTitle: result.room.quiz.title,
              players: result.room.players.length
            },
            message: result.message
          });
          
          // Thông báo cho tất cả players khác
          socket.to(`room_${roomCode}`).emit('player_joined', {
            playerCount: result.room.players.length,
            message: 'Có người chơi mới tham gia'
          });
          
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });
      
      // ============ GAME CONTROL ============
      socket.on('start_game', async (data) => {
        try {
          if (!socket.authenticated || !socket.isHost) {
            socket.emit('error', { message: 'Chỉ host mới có thể bắt đầu game' });
            return;
          }
          
          const { roomId } = data;
          const result = await roomService.startGame({
            roomId,
            hostId: socket.userId
          });
          
          // Lấy quiz info để bắt đầu
          const quizResult = await quizService.getQuizForGame(result.room.quiz);
          
          if (!quizResult.success) {
            socket.emit('error', { message: 'Không thể lấy thông tin quiz' });
            return;
          }
          
          // Gửi thông tin game bắt đầu cho tất cả players
          this.io.to(`room_${socket.roomCode}`).emit('game_started', {
            quiz: quizResult.data,
            currentQuestion: 0,
            message: 'Game đã bắt đầu!'
          });
          
          // Gửi câu hỏi đầu tiên
          this.sendQuestion(socket.roomCode, 0, quizResult.data);
          
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });
      
      // ============ GAME PLAY ============
      socket.on('submit_answer', async (data) => {
        try {
          if (!socket.authenticated) {
            socket.emit('error', { message: 'Chưa xác thực' });
            return;
          }
          
          const { roomId, questionIndex, selectedAnswer, responseTime } = data;
          
          // Lưu answer vào database hoặc memory
          this.savePlayerAnswer(socket.roomCode, socket.userId, {
            questionIndex,
            selectedAnswer,
            responseTime,
            timestamp: new Date()
          });
          
          // Thông báo cho room ai đã trả lời
          socket.to(`room_${socket.roomCode}`).emit('player_answered', {
            message: 'Một người chơi đã trả lời'
          });
          
          // Confirm cho player
          socket.emit('answer_submitted', {
            success: true,
            message: 'Đã ghi nhận câu trả lời'
          });
          
          // Kiểm tra tất cả đã trả lời chưa
          if (this.allPlayersAnswered(socket.roomCode, questionIndex)) {
            this.showResults(socket.roomCode, questionIndex);
          }
          
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });
      
      // ============ DISCONNECT ============
      socket.on('disconnect', async () => {
        console.log(`👋 User disconnected: ${socket.id}`);
        
        if (socket.roomCode && socket.authenticated) {
          try {
            await roomService.leaveRoom({
              roomId: socket.roomId,
              userId: socket.userId
            });
            
            // Thông báo cho room
            socket.to(`room_${socket.roomCode}`).emit('player_left', {
              message: 'Một người chơi đã rời khỏi phòng'
            });
            
          } catch (error) {
            console.error('Error handling disconnect:', error);
          }
        }
      });
    });
  }
  
  /**
   * Gửi câu hỏi cho room
   */
  sendQuestion(roomCode, questionIndex, quiz) {
    if (questionIndex >= quiz.questions.length) {
      this.endGame(roomCode);
      return;
    }
    
    const question = quiz.questions[questionIndex];
    
    this.io.to(`room_${roomCode}`).emit('new_question', {
      questionIndex,
      totalQuestions: quiz.questions.length,
      question: {
        text: question.text,
        options: question.options
      },
      timeLimit: quiz.timePerQuestion,
      startTime: new Date()
    });
    
    // Auto move to next question after time limit
    setTimeout(() => {
      this.showResults(roomCode, questionIndex);
    }, quiz.timePerQuestion * 1000);
  }
  
  /**
   * Lưu answer của player
   */
  savePlayerAnswer(roomCode, userId, answerData) {
    if (!this.activeRooms.has(roomCode)) {
      this.activeRooms.set(roomCode, {
        players: new Map(),
        answers: new Map()
      });
    }
    
    const room = this.activeRooms.get(roomCode);
    const playerAnswers = room.answers.get(userId) || [];
    playerAnswers.push(answerData);
    room.answers.set(userId, playerAnswers);
  }
  
  /**
   * Kiểm tra tất cả players đã trả lời chưa
   */
  allPlayersAnswered(roomCode, questionIndex) {
    const room = this.activeRooms.get(roomCode);
    if (!room) return false;
    
    // Logic kiểm tra tất cả players đã answer
    // Simplified version
    return false; // Implement based on your needs
  }
  
  /**
   * Hiển thị kết quả câu hỏi
   */
  async showResults(roomCode, questionIndex) {
    try {
      // Calculate scores and show results
      // This is simplified - implement scoring logic
      
      this.io.to(`room_${roomCode}`).emit('question_results', {
        questionIndex,
        correctAnswer: 0, // Get from quiz data
        leaderboard: [], // Calculate leaderboard
        message: 'Kết quả câu hỏi'
      });
      
      // Move to next question after 3 seconds
      setTimeout(() => {
        // Implement next question logic
      }, 3000);
      
    } catch (error) {
      console.error('Error showing results:', error);
    }
  }
  
  /**
   * Kết thúc game
   */
  endGame(roomCode) {
    this.io.to(`room_${roomCode}`).emit('game_finished', {
      leaderboard: [], // Final leaderboard
      winner: null, // Winner info
      message: 'Game đã kết thúc!'
    });
    
    // Cleanup
    this.activeRooms.delete(roomCode);
  }
}