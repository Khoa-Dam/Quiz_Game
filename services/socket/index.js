import { AuthManager } from "./managers/AuthManager.js";
import { RoomManager } from "./managers/RoomManager.js";
import { GameManager } from "./managers/GameManager.js";
import { ScoreManager } from "./managers/ScoreManager.js";

export class GameSocketService {
  constructor(io) {
    this.io = io;

    // Initialize managers
    this.authManager = new AuthManager();
    this.roomManager = new RoomManager(io);
    this.gameManager = new GameManager(io);
    this.scoreManager = new ScoreManager();
  }

  /**
   * Initialize Socket.IO events
   */
  initializeEvents() {
    this.io.on('connection', (socket) => {
      console.log(`🎮 User connected: ${socket.id}`);

      // ============ AUTH & CONNECTION ============
      socket.on('authenticate', async (data) => {
        await this.authManager.handleAuthenticate(socket, data);
      });

      // ============ ROOM MANAGEMENT ============
      socket.on('create_room', async (data) => {
        await this.roomManager.handleCreateRoom(socket, data, this.authManager);
      });

      socket.on('join_room', async (data) => {
        await this.roomManager.handleJoinRoom(socket, data, this.authManager);
      });

      // ============ GAME CONTROL ============
      socket.on('start_game', async (data) => {
        await this.gameManager.handleStartGame(socket, data, this.authManager, this.roomManager);
      });

      // ============ GAME PLAY ============
      socket.on('submit_answer', async (data) => {
        await this.gameManager.handleSubmitAnswer(socket, data, this.authManager, this.roomManager, this.scoreManager);
      });

      // ============ DEBUG & MONITORING ============
      socket.on('debug_rooms', async (data) => {
        if (socket.isHost) { // Only hosts can debug
          const roomStatus = this.gameManager.getActiveRoomsStatus();
          const activeRooms = this.roomManager.activeRooms;
          socket.emit('debug_info', {
            gameRooms: roomStatus,
            activeRooms: Array.from(activeRooms.entries()).map(([code, room]) => ({
              roomCode: code,
              roomId: room.roomId,
              host: room.host,
              playerCount: room.players.size,
              createdAt: room.createdAt
            }))
          });
        }
      });

      // ============ DISCONNECT ============
      socket.on('disconnect', async () => {
        console.log(`👋 User disconnected: ${socket.id}`);
        await this.roomManager.handleDisconnect(socket);
      });
    });
  }
}