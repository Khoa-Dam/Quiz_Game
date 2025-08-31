import { roomService } from "./room.Service.js";

export const createRoom = async (req, res) => {
  try {
    const { quizId, settings, hostId } = req.body; // ✅ Lấy hostId từ body
    // ✅ Sử dụng hostId từ body hoặc fallback về userId từ auth
    const finalHostId = hostId || req.body.userId;

    if (!quizId) {
      return res.json({
        success: false,
        message: "Quiz ID is required"
      });
    }

    if (!finalHostId) {
      return res.json({
        success: false,
        message: "Host ID is required"
      });
    }

    console.log('🏠 Room Controller: Creating room with hostId:', finalHostId);

    const result = await roomService.createRoom({ quizId, hostId: finalHostId, settings });

    return res.json({
      success: true,
      data: {
        roomId: result.room._id,
        roomCode: result.roomCode,
        quizTitle: result.room.quiz?.title,
        hostId: finalHostId // ✅ Trả về hostId để frontend biết
      },
      message: result.message
    });

  } catch (error) {
    console.error('❌ Room Controller Error:', error);
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