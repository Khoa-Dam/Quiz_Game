import Room from "../../models/room/roomModel.js";
import Quiz from "../../models/quiz/quizModel.js";
import User from "../../models/users/userModel.js";

export class RoomService {
  /**
   * Create a new game room
   */
  async createRoom({ quizId, hostId, settings = {} }) {
    try {
      // Verify quiz exists
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new Error('Quiz không tồn tại');
      }

      // Generate unique room code
      const roomCode = this.generateRoomCode();
      
      // Create room
      const room = new Room({
        quiz: quizId,
        host: hostId,
        roomCode,
        settings: {
          maxPlayers: settings.maxPlayers || 10,
          timePerQuestion: settings.timePerQuestion || 30,
          ...settings
        },
        players: [hostId],
        status: 'waiting'
      });

      await room.save();

      return {
        success: true,
        room,
        roomCode,
        message: 'Create room successfully'
      };

    } catch (error) {
      throw new Error(`Error creating room: ${error.message}`);
    }
  }

  /**
   * Join an existing room
   */
  async joinRoom({ roomCode, userId }) {
    try {
      const room = await Room.findOne({ roomCode })
        .populate('quiz')
        .populate('players', 'username email');

      if (!room) {
        throw new Error('Room not found');
      }

      if (room.status !== 'waiting') {
        throw new Error('Room has already started');
      }

      if (room.players.length >= room.settings.maxPlayers) {
        throw new Error('Room is full');
      }

      // Check if user is already in room
      if (room.players.includes(userId)) {
        throw new Error('You are already in this room');
      }

      // Add player to room
      room.players.push(userId);
      await room.save();

      return {
        success: true,
        room,
        message: 'Join room successfully'
      };

    } catch (error) {
      throw new Error(`Error joining room: ${error.message}`);
    }
  }

  /**
   * Start the game
   */
  async startGame({ roomId, hostId }) {
    try {
      const room = await Room.findById(roomId)
        .populate('quiz')
        .populate('players');

      if (!room) {
        throw new Error('Room not found');
      }

      if (room.host.toString() !== hostId) {
        throw new Error('Only host can start the game');
      }

      if (room.status !== 'waiting') {
        throw new Error('Game has already started');
      }

      if (room.players.length < 2) {
        throw new Error('At least 2 players are required');
      }

      // Update room status
      room.status = 'playing';
      room.startedAt = new Date();
      await room.save();

      return {
        success: true,
        room,
        message: 'Game has started'
      };

    } catch (error) {
      throw new Error(`Error starting game: ${error.message}`);
    }
  }

  /**
   * Leave room
   */
  async leaveRoom({ roomId, userId }) {
    try {
      const room = await Room.findById(roomId);
      
      if (!room) {
        return { success: true, message: 'Room not found' };
      }

      // Remove player from room
      room.players = room.players.filter(playerId => 
        playerId.toString() !== userId
      );

      // If no players left, delete room
      if (room.players.length === 0) {
        await Room.findByIdAndDelete(roomId);
        return { success: true, message: 'Room closed' };
      }

      // If host left, assign new host
      if (room.host.toString() === userId) {
        room.host = room.players[0];
      }

      await room.save();

      return {
        success: true,
        message: 'Left room'
      };

    } catch (error) {
      throw new Error(`Error leaving room: ${error.message}`);
    }
  }

  /**
   * Get room by ID
   */
  async getRoomById(roomId) {
    try {
      const room = await Room.findById(roomId)
        .populate('quiz')
        .populate('players', 'username email')
        .populate('host', 'username email');

      if (!room) {
        throw new Error('Room not found');
      }

      return {
        success: true,
        room
      };

    } catch (error) {
      throw new Error(`Error getting room info: ${error.message}`);
    }
  }

  /**
   * Get room by room code
   */
  async getRoomByCode(roomCode) {
    try {
      const room = await Room.findOne({ roomCode })
        .populate('quiz')
        .populate('players', 'username email')
        .populate('host', 'username email');

      if (!room) {
        throw new Error('Room not found');
      }

      return {
        success: true,
        room
      };

    } catch (error) {
      throw new Error(`Error getting room info: ${error.message}`);
    }
  }

  /**
   * Generate unique room code
   */
  generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Export singleton instance
export const roomService = new RoomService(); 