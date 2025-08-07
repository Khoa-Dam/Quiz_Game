import React, { useState } from 'react';

const GameControls = ({ 
  connected, 
  authenticated, 
  currentRoom, 
  gameState,
  authenticate,
  createRoom,
  joinRoom,
  startGame,
  disconnect,
  resetGameData
}) => {
  const [token, setToken] = useState('demo');
  const [roomCode, setRoomCode] = useState('');
  const [quizId, setQuizId] = useState('688e2e4e9b4ff1cbd73ac4d4');

  const handleAuthenticate = () => {
    authenticate(token);
  };

  const handleCreateRoom = () => {
    createRoom(quizId);
  };

  const handleJoinRoom = () => {
    joinRoom(roomCode);
  };

  return (
    <div className="section">
      <h3>🎮 Game Controls</h3>
      
      {/* Authentication */}
      <div>
        <h4>🔐 Authentication</h4>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="JWT Token"
          style={{ width: '200px' }}
        />
        <button onClick={handleAuthenticate} disabled={!connected || authenticated}>
          Authenticate
        </button>
      </div>

      {/* Room Management */}
      <div>
        <h4>🏠 Room Management</h4>
        <input
          type="text"
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
          placeholder="Quiz ID"
          style={{ width: '150px' }}
        />
        <button onClick={handleCreateRoom} disabled={!authenticated}>
          Create Room
        </button>
        
        <br />
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Room Code"
          style={{ width: '150px' }}
        />
        <button onClick={handleJoinRoom} disabled={!authenticated || !roomCode}>
          Join Room
        </button>
      </div>

      {/* Game Actions */}
      <div>
        <h4>🎯 Game Actions</h4>
        <button 
          onClick={startGame} 
          disabled={!currentRoom || !currentRoom.isHost || gameState !== 'in_room'}
        >
          Start Game
        </button>
        <button onClick={disconnect}>
          Disconnect
        </button>
        <button onClick={resetGameData}>
          Reset Game Data
        </button>
      </div>
    </div>
  );
};

export default GameControls;