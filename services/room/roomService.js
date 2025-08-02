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
        message: 'Tạo phòng thành công'
      };

    } catch (error) {
      throw new Error(`Lỗi tạo phòng: ${error.message}`);
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
        throw new Error('Phòng không tồn tại');
      }

      if (room.status !== 'waiting') {
        throw new Error('Phòng đã bắt đầu game');
      }

      if (room.players.length >= room.settings.maxPlayers) {
        throw new Error('Phòng đã đầy');
      }

      // Check if user is already in room
      if (room.players.includes(userId)) {
        throw new Error('Bạn đã trong phòng này');
      }

      // Add player to room
      room.players.push(userId);
      await room.save();

      return {
        success: true,
        room,
        message: 'Tham gia phòng thành công'
      };

    } catch (error) {
      throw new Error(`Lỗi tham gia phòng: ${error.message}`);
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
        throw new Error('Phòng không tồn tại');
      }

      if (room.host.toString() !== hostId) {
        throw new Error('Chỉ host mới có thể bắt đầu game');
      }

      if (room.status !== 'waiting') {
        throw new Error('Game đã bắt đầu');
      }

      if (room.players.length < 2) {
        throw new Error('Cần ít nhất 2 người chơi');
      }

      // Update room status
      room.status = 'playing';
      room.startedAt = new Date();
      await room.save();

      return {
        success: true,
        room,
        message: 'Game đã bắt đầu'
      };

    } catch (error) {
      throw new Error(`Lỗi bắt đầu game: ${error.message}`);
    }
  }

  /**
   * Leave room
   */
  async leaveRoom({ roomId, userId }) {
    try {
      const room = await Room.findById(roomId);
      
      if (!room) {
        return { success: true, message: 'Phòng không tồn tại' };
      }

      // Remove player from room
      room.players = room.players.filter(playerId => 
        playerId.toString() !== userId
      );

      // If no players left, delete room
      if (room.players.length === 0) {
        await Room.findByIdAndDelete(roomId);
        return { success: true, message: 'Phòng đã đóng' };
      }

      // If host left, assign new host
      if (room.host.toString() === userId) {
        room.host = room.players[0];
      }

      await room.save();

      return {
        success: true,
        message: 'Đã rời phòng'
      };

    } catch (error) {
      throw new Error(`Lỗi rời phòng: ${error.message}`);
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
        throw new Error('Phòng không tồn tại');
      }

      return {
        success: true,
        room
      };

    } catch (error) {
      throw new Error(`Lỗi lấy thông tin phòng: ${error.message}`);
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
        throw new Error('Phòng không tồn tại');
      }

      return {
        success: true,
        room
      };

    } catch (error) {
      throw new Error(`Lỗi lấy thông tin phòng: ${error.message}`);
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