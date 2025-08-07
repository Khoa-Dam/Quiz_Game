import React from 'react';

const StatusBar = ({ connected, authenticated, currentRoom, gameState }) => {
  const getStatusClass = () => {
    if (!connected) return 'disconnected';
    if (authenticated) return 'authenticated';
    return 'connected';
  };

  const getStatusText = () => {
    if (!connected) return '🔴 Disconnected';
    if (authenticated) return '🟡 Authenticated';
    return '🟢 Connected';
  };

  return (
    <div className={`status ${getStatusClass()}`}>
      {getStatusText()}
      {currentRoom && ` | Room: ${currentRoom.code}`}
      {gameState !== 'disconnected' && ` | State: ${gameState}`}
    </div>
  );
};

export default StatusBar;