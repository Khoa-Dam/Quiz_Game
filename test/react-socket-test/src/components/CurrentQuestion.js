import React from 'react';

const CurrentQuestion = ({ gameData, currentRoom, submitAnswer }) => {
  if (!gameData.currentQuestion) {
    return (
      <div className="section">
        <h3>❓ Current Question</h3>
        <div>
          {currentRoom?.isHost ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              👑 Waiting for players to answer questions...
            </p>
          ) : (
            <p>No question active</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <h3>❓ Current Question</h3>
      
      <div className="question-card">
        <h4>Question {gameData.currentQuestion.questionIndex + 1}/{gameData.currentQuestion.totalQuestions}</h4>
        <p><strong>{gameData.currentQuestion.question.text}</strong></p>
        
        <div>
          {gameData.currentQuestion.question.options.map((option, index) => (
            <button
              key={index}
              className={`answer-option ${
                gameData.selectedAnswer === index ? 'selected' : ''
              } ${
                gameData.currentResults ? 
                  (index === gameData.currentResults.correctAnswer ? 'correct' : 
                   gameData.selectedAnswer === index ? 'incorrect' : '') : ''
              }`}
              onClick={() => submitAnswer(index)}
              disabled={gameData.selectedAnswer !== null || gameData.currentResults || currentRoom?.isHost}
            >
              {String.fromCharCode(65 + index)}. {option}
            </button>
          ))}
        </div>

        {gameData.currentResults && (
          <div style={{ marginTop: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
            <h5>📊 Results</h5>
            <p>✅ Correct Answer: {String.fromCharCode(65 + gameData.currentResults.correctAnswer)}</p>
            {gameData.currentResults.leaderboard && (
              <div>
                <h6>🏆 Leaderboard:</h6>
                {gameData.currentResults.leaderboard.map((player, index) => (
                  <div key={index}>
                    {player.rank}. Player {player.userId.substring(0, 8)}... - {player.totalScore} pts
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentQuestion;