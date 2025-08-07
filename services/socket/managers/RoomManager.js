import { roomService } from "../../room/roomService.js";

export class RoomManager {
  constructor(io) {
    this.io = io;
    this.activeRooms = new Map(); // Track active game rooms
  }

  /**
   * Initialize or get room data
   */
  initializeRoom(roomCode, roomId = null) {
    if (!this.activeRooms.has(roomCode)) {
      this.activeRooms.set(roomCode, {
        host: null, // Store host ID
        players: new Set(), // Store active player IDs (excluding host)
        answers: new Map(),
        roomId: roomId,
        playerScores: new Map() // Store cumulative scores
      });
    }
    return this.activeRooms.get(roomCode);
  }

  /**
   * Get room data safely
   */
  getRoomData(roomCode) {
    const room = this.activeRooms.get(roomCode);
    
    if (!room) {
      console.error('Room not found:', roomCode);
      return null;
    }
    
    return room;
  }

  /**
   * Handle create room event
   */
  async handleCreateRoom(socket, data, authManager) {
    try {
      if (!authManager.validateAuth(socket)) return;
      
      const { quizId, settings } = data;
      const result = await roomService.createRoom({
        quizId,
        hostId: socket.userId,
        settings
      });
      
      // Join socket room and initialize room data
      socket.join(`room_${result.roomCode}`);
      socket.roomCode = result.roomCode;
      socket.isHost = true;
      const room = this.initializeRoom(result.roomCode, result.room._id);
      
      // Set as host (host doesn't participate in answering)
      room.host = socket.userId;
      console.log(`👑 Set ${socket.userId} as host of room ${result.roomCode}`);
      
      socket.emit('room_created', {
        success: true,
        data: {
          roomId: result.room._id,
          roomCode: result.roomCode
        },
        message: result.message
      });
      
    } catch (error) {
      authManager.handleError(socket, error, 'create_room');
    }
  }

  /**
   * Handle join room event
   */
  async handleJoinRoom(socket, data, authManager) {
    try {
      if (!authManager.validateAuth(socket)) return;
      
      const { roomCode } = data;
      const result = await roomService.joinRoom({
        roomCode,
        userId: socket.userId
      });
      
      // Join socket room and initialize room data
      socket.join(`room_${roomCode}`);
      socket.roomCode = roomCode;
      socket.isHost = false;
      const room = this.initializeRoom(roomCode, result.room._id);
      
      // Add as player (only players answer questions, not host)
      room.players.add(socket.userId);
      console.log(`👤 Added player ${socket.userId} to room ${roomCode}. Total players: ${room.players.size} (Host: ${room.host})`);
      
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
        message: 'A new player has joined'
      });
      
    } catch (error) {
      authManager.handleError(socket, error, 'join_room');
    }
  }

  /**
   * Handle player disconnect from room
   */
  async handleDisconnect(socket) {
    if (socket.roomCode && socket.authenticated) {
      try {
        // Remove player/host from active room
        const room = this.activeRooms.get(socket.roomCode);
        if (room) {
          if (socket.isHost) {
            room.host = null;
            console.log(`🗑️ Host ${socket.userId} left room ${socket.roomCode}`);
          } else {
            room.players.delete(socket.userId);
            console.log(`🗑️ Removed player ${socket.userId} from room ${socket.roomCode}. Players left: ${room.players.size}`);
          }
        }
        
        await roomService.leaveRoom({
          roomId: socket.roomId,
          userId: socket.userId
        });
        
        // Thông báo cho room
        socket.to(`room_${socket.roomCode}`).emit('player_left', {
          message: 'A player has left the room'
        });
        
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    }
  }

  /**
   * Clean up room data
   */
  cleanupRoom(roomCode) {
    // Remove room data
    this.activeRooms.delete(roomCode);
    console.log(`🧹 Cleaned up room: ${roomCode}`);
  }

  /**
   * Save player answer in room memory
   */
  savePlayerAnswer(roomCode, userId, answerData) {
    const room = this.initializeRoom(roomCode);
    const playerAnswers = room.answers.get(userId) || [];
    playerAnswers.push(answerData);
    room.answers.set(userId, playerAnswers);
  }
}