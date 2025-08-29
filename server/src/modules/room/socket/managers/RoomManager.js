import { roomService } from "../../../room/roomService.js";

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
        host: null,
        players: new Map(), // Store players by ID with their data { name, isHost }
        answers: new Map(),
        roomId: roomId,
        playerScores: new Map(),
        createdAt: new Date()
      });
      console.log(`🏠 Initialized new room: ${roomCode} with roomId: ${roomId}`);
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
   * Handle create room event (called via HTTP, not socket)
   */
  async handleCreateRoom(socket, data, authManager) {
    // This is mostly handled by the HTTP route, socket just needs to be aware
    // The host will join via handleJoinRoom after creation
  }

  /**
   * Handle join room event
   */
  async handleJoinRoom(socket, data, authManager) {
    try {
      if (!authManager.validateAuth(socket)) return;

      const { roomCode, playerName } = data;
      if (!roomCode || !playerName) {
        return authManager.handleError(socket, { message: 'Room code and player name are required.' }, 'join_room');
      }

      const result = await roomService.joinRoom({
        roomCode,
        userId: socket.userId
      });

      socket.join(`room_${roomCode}`);
      socket.roomCode = roomCode;
      socket.roomId = result.room._id;
      const room = this.initializeRoom(roomCode, result.room._id);

      const hostIdFromDb = result.room.host && (result.room.host._id ? String(result.room.host._id) : String(result.room.host));
      if (!room.host && hostIdFromDb) {
        room.host = hostIdFromDb;
      }

      socket.isHost = socket.userId === room.host;

      room.players.set(socket.userId, {
        name: playerName,
        isHost: socket.isHost
      });

      const playersList = Array.from(room.players.entries()).map(([id, playerData]) => ({
        id,
        userId: id,
        name: playerData.name,
        isHost: playerData.isHost
      }));

      console.log(`👤 Player ${socket.userId} (${playerName}) joined room ${roomCode}. Total players: ${playersList.length}`);

      socket.emit('room_joined', {
        success: true,
        data: {
          roomId: result.room._id,
          roomCode: result.room.roomCode,
          quizTitle: result.room.quiz.title,
          players: playersList,
          isHost: socket.isHost,
          status: 'waiting'
        },
        message: result.message
      });

      socket.to(`room_${roomCode}`).emit('player_joined', {
        playerCount: playersList.length,
        playerName: playerName,
        players: playersList
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
        const room = this.activeRooms.get(socket.roomCode);
        if (!room) return;

        let playerName = 'A player';
        if (room.players.has(socket.userId)) {
          playerName = room.players.get(socket.userId).name;
          room.players.delete(socket.userId);

          if (socket.isHost) {
            room.host = null;
            console.log(`🗑️ Host ${socket.userId} (${playerName}) left room ${socket.roomCode}.`);
            // Future enhancement: assign a new host.
          } else {
            console.log(`🗑️ Player ${socket.userId} (${playerName}) left room ${socket.roomCode}. Players left: ${room.players.size}`);
          }

          await roomService.leaveRoom({
            roomId: socket.roomId,
            userId: socket.userId
          });

          const playersList = Array.from(room.players.entries()).map(([id, data]) => ({
            id,
            userId: id,
            name: data.name,
            isHost: data.isHost
          }));

          socket.to(`room_${socket.roomCode}`).emit('player_left', {
            message: `${playerName} has left the room.`,
            playerName: playerName,
            players: playersList
          });
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    }
  }

  /**
   * Clean up room data
   */
  cleanupRoom(roomCode) {
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
