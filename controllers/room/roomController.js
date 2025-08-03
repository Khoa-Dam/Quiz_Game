import { roomService } from "../../services/room/roomService.js";

export const createRoom = async (req, res) => {
  try {
    const { quizId, settings } = req.body;
    const hostId = req.body.userId; // From auth middleware
    
    if (!quizId) {
      return res.json({
        success: false,
        message: "Quiz ID is required"
      });
    }
    
    const result = await roomService.createRoom({ quizId, hostId, settings });
    
    return res.json({
      success: true,
      data: {
        roomId: result.room._id,
        roomCode: result.roomCode,
        quizTitle: result.room.quiz?.title
      },
      message: result.message
    });
    
  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.body.userId;
    
    if (!roomCode) {
      return res.json({
        success: false,
        message: "Room code is required"
      });
    }
    
    const result = await roomService.joinRoom({ roomCode, userId });
    
    return res.json({
      success: true,
      data: {
        roomId: result.room._id,
        roomCode: result.room.roomCode,
        quizTitle: result.room.quiz.title,
        hostName: result.room.host.name,
        playerCount: result.room.players.length
      },
      message: result.message
    });
    
  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    });
  }
};

export const getRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await roomService.getRoomInfo(id);
    
    return res.json({
      success: true,
      data: {
        roomCode: result.room.roomCode,
        status: result.room.status,
        currentQuestion: result.room.currentQuestion,
        totalQuestions: result.room.quiz.questions.length,
        players: result.room.players.map(p => ({
          id: p._id,
          name: p.name
        })),
        host: result.room.host.name,
        settings: result.room.settings,
        quiz: {
          title: result.room.quiz.title,
          timePerQuestion: result.room.quiz.timePerQuestion
        }
      },
      message: "Get room info successfully"
    });
    
  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    });
  }
};