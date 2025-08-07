import React from 'react';
import { useSocket } from './hooks/useSocket';
import StatusBar from './components/StatusBar';
import GameControls from './components/GameControls';
import CurrentQuestion from './components/CurrentQuestion';
import EventLogs from './components/EventLogs';
import './App.css';

function App() {
  const {
    // State
    connected,
    authenticated,
    currentRoom,
    gameState,
    gameData,
    logs,
    
    // Actions
    authenticate,
    createRoom,
    joinRoom,
    startGame,
    submitAnswer,
    disconnect,
    resetGameData,
    clearLogs
  } = useSocket();

  return (
    <div className="container">
      <h1>🔌 Socket.IO React Test</h1>
      
      {/* Status Bar */}
      <StatusBar 
        connected={connected}
        authenticated={authenticated}
        currentRoom={currentRoom}
        gameState={gameState}
      />

      <div className="game-area">
        {/* Game Controls */}
        <GameControls
          connected={connected}
          authenticated={authenticated}
          currentRoom={currentRoom}
          gameState={gameState}
          authenticate={authenticate}
          createRoom={createRoom}
          joinRoom={joinRoom}
          startGame={startGame}
          disconnect={disconnect}
          resetGameData={resetGameData}
        />

        {/* Current Question */}
        <CurrentQuestion
          gameData={gameData}
          currentRoom={currentRoom}
          submitAnswer={submitAnswer}
        />
      </div>

      {/* Event Logs */}
      <EventLogs
        logs={logs}
        clearLogs={clearLogs}
      />
    </div>
  );
}

export default App;