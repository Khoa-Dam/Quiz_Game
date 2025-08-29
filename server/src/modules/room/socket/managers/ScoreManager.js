import { quizService } from "../../../quiz/quizService.js";

export class ScoreManager {
  constructor() { }

  /**
   * Calculate player results for current question
   */
  async calculatePlayerResults(room, quizId, questionIndex) {
    const playerResults = [];
    const answeredUserIds = new Set();

    // Xử lý những người đã trả lời
    for (const [userId, answers] of room.answers.entries()) {
      const playerAnswer = answers.find(a => a.questionIndex === questionIndex);

      if (playerAnswer) {
        // Use existing checkAnswer logic
        const result = await quizService.checkAnswer(
          quizId,
          questionIndex,
          playerAnswer.selectedAnswer,
          playerAnswer.responseTime
        );

        playerResults.push({
          userId,
          selectedAnswer: playerAnswer.selectedAnswer,
          isCorrect: result.isCorrect,
          points: result.points,
          responseTime: playerAnswer.responseTime
        });

        answeredUserIds.add(userId);
      }
    }

    // Ghi nhận 0 điểm cho những người chưa trả lời (tất cả players trong room)
    for (const userId of room.players.keys()) {
      if (!answeredUserIds.has(userId)) {
        playerResults.push({
          userId,
          selectedAnswer: null,
          isCorrect: false,
          points: 0,
          responseTime: 0
        });
        console.log(`⏰ Player ${userId} didn't answer - recorded 0 points`);
      }
    }

    return playerResults;
  }

  /**
   * Update cumulative player scores
   */
  updatePlayerScores(room, playerResults) {
    playerResults.forEach(result => {
      const currentScore = room.playerScores.get(result.userId) || 0;
      room.playerScores.set(result.userId, currentScore + result.points);
    });
  }

  /**
   * Calculate leaderboard from cumulative scores
   */
  calculateLeaderboard(room) {
    const playersMap = room.players || new Map();
    // Convert to array and sort by score
    const leaderboard = Array.from(room.playerScores.entries())
      .map(([userId, totalScore]) => {
        const playerData = playersMap.get(userId) || { name: 'Player' };
        return {
          userId,
          name: playerData.name,
          totalScore,
          rank: 0 // Will be calculated after sorting
        }
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((player, index) => ({
        ...player,
        rank: index + 1
      }));

    return leaderboard;
  }

  /**
   * Get correct answer for a question
   */
  async getCorrectAnswer(quizId, questionIndex) {
    try {
      const result = await quizService.checkAnswer(quizId, questionIndex, 0, 0);
      return result.correctAnswer;
    } catch (error) {
      console.error('Error getting correct answer:', error);
      return 0;
    }
  }

  /**
   * Check if all players have answered
   */
  allPlayersAnswered(room, questionIndex) {
    if (!room) return false;

    // Đếm số players đã trả lời câu hỏi này
    const answers = room.answers;
    let answeredCount = 0;

    for (const [userId, playerAnswers] of answers.entries()) {
      const hasAnswered = playerAnswers.some(a => a.questionIndex === questionIndex);
      if (hasAnswered) {
        answeredCount++;
      }
    }

    // Lấy tổng số players thực tế trong room (không tính host)
    const totalPlayers = room.players.size;

    console.log(`🔍 Room ${room.roomCode || 'Unknown'}, Question ${questionIndex}: ${answeredCount}/${totalPlayers} players answered`);

    // Chỉ hiện kết quả khi TẤT CẢ players đã trả lời
    // Development mode: Nếu chỉ có 1 player thì cho phép hiện kết quả ngay
    // Production mode: Luôn đợi tất cả players
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isSinglePlayer = totalPlayers === 1;

    let requiredAnswers;
    if (isDevelopment && isSinglePlayer) {
      requiredAnswers = 1; // Development với 1 player: hiện ngay
    } else {
      requiredAnswers = totalPlayers; // Tất cả các trường hợp khác: đợi tất cả
    }

    console.log(`📊 Required answers: ${requiredAnswers}, Current: ${answeredCount}`);
    return answeredCount >= requiredAnswers;
  }
}