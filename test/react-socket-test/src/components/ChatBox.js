import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { createChatMessage } from '../types/chat';
import { v4 as generateId } from 'uuid';

export const ChatBox = () => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  const {
    socket,
    currentRoom,
    messages,
    typingUsers,
    unreadCount,
    sendMessage,
    startTyping,
    stopTyping,
    clearUnreadCount
  } = useSocket();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * @param {string} content
   * @param {import('../types/chat').MessageType} type
   * @param {string?} replyTo
   */
  const handleSendMessage = (content, type = 'text', replyTo = null) => {
    if (!content.trim() || !socket || !currentRoom) return;
    
    const message = createChatMessage({
      id: generateId(),
      type,
      content,
      sender: {
        id: socket.id,
        name: currentRoom.playerName || 'Anonymous'
      },
      roomId: currentRoom.id,
      replyTo
    });
    
    sendMessage(message);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(message);
    setMessage('');
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>Chat Room</h3>
        {unreadCount > 0 && (
          <span className="unread-badge" onClick={clearUnreadCount}>
            {unreadCount}
          </span>
        )}
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.type}`}>
            <div className="message-header">
              <span className="sender">{msg.sender.name}</span>
              <span className="time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(', ')} đang nhập...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-input">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            startTyping();
          }}
          onBlur={stopTyping}
          placeholder="Nhập tin nhắn..."
        />
        <button type="submit">Gửi</button>
      </form>
    </div>
  );
};
