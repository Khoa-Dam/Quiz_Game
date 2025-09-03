import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [gameState, setGameState] = useState('disconnected');
  const [logs, setLogs] = useState([]);

  // Chat states
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Game data state
  const [gameData, setGameData] = useState({
    currentQuestion: null,
    questionHistory: [],
    selectedAnswer: null,
    questionStartTime: null,
    currentResults: null,
    playerScore: 0,
    totalQuestions: 0,
    questionIndex: 0
  });
  
  const socketRef = useRef();

  // Helper functions
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    setLogs(prev => [...prev, logEntry]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const resetGameData = () => {
    setGameData({
      currentQuestion: null,
      questionHistory: [],
      selectedAnswer: null,
      questionStartTime: null,
      currentResults: null,
      playerScore: 0,
      totalQuestions: 0,
      questionIndex: 0
    });
  };

  const addQuestionToHistory = (questionData, results) => {
    const playerResult = results.playerResults?.find(p => 
      p.userId === socketRef.current?.userId || 
      p.userId === socket?.id
    );
    const questionPoints = playerResult?.points || 0;
    
    const historyEntry = {
      questionIndex: results.questionIndex,
      question: questionData,
      selectedAnswer: gameData.selectedAnswer,
      correctAnswer: results.correctAnswer,
      isCorrect: gameData.selectedAnswer === results.correctAnswer,
      points: questionPoints,
      timestamp: new Date().toLocaleTimeString()
    };
    
    return historyEntry;
  };

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    socketRef.current = newSocket;

    // Connection events
    newSocket.on('connect', () => {
      addLog('✅ Connected to server', 'success');
      addLog(`🆔 Socket ID: ${newSocket.id}`, 'info');
      setConnected(true);
      setGameState('connected');
    });

    newSocket.on('disconnect', () => {
      addLog('❌ Disconnected from server', 'error');
      setConnected(false);
      setAuthenticated(false);
      setGameState('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      addLog(`❌ Connection error: ${error.message}`, 'error');
    });

    // Authentication events
    newSocket.on('authenticated', (data) => {
      addLog('✅ Authenticated successfully', 'success');
      addLog(`📝 Data: ${JSON.stringify(data)}`, 'info');
      setAuthenticated(true);
      setGameState('authenticated');
    });

    newSocket.on('auth_error', (data) => {
      addLog(`❌ Auth error: ${data.message}`, 'error');
      setAuthenticated(false);
    });

    // Room events
    newSocket.on('room_created', (data) => {
      addLog('🏠 Room created successfully', 'success');
      addLog(`📝 Room Code: ${data.data.roomCode}`, 'info');
      setCurrentRoom({
        id: data.data.roomId,
        code: data.data.roomCode,
        isHost: true
      });
      setGameState('in_room');
    });

    newSocket.on('room_joined', (data) => {
      addLog('✅ Joined room successfully', 'success');
      addLog(`📝 Room: ${data.data.quizTitle}`, 'info');
      setCurrentRoom({
        id: data.data.roomId,
        code: data.data.roomCode,
        isHost: false
      });
      setGameState('in_room');
    });

    newSocket.on('player_joined', (data) => {
      addLog(`👥 New player joined: ${data.playerCount} players`, 'info');
    });

    newSocket.on('player_left', (data) => {
      addLog('👋 Player left the room', 'info');
    });

    // Game events
    newSocket.on('game_started', (data) => {
      addLog('🎮 Game started!', 'success');
      addLog(`📝 Quiz: ${data.quiz.title}`, 'info');
      setGameState('playing');
      resetGameData();
      setGameData(prev => ({
        ...prev,
        totalQuestions: data.quiz.totalQuestions || 0
      }));
    });

    newSocket.on('new_question', (data) => {
      addLog(`❓ Question ${data.questionIndex + 1}/${data.totalQuestions}`, 'info');
      addLog(`📝 ${data.question.text}`, 'info');
      
      setGameData(prev => ({
        ...prev,
        currentQuestion: data,
        selectedAnswer: null,
        questionStartTime: Date.now(),
        currentResults: null,
        questionIndex: data.questionIndex,
        totalQuestions: data.totalQuestions
      }));
    });

    newSocket.on('answer_submitted', (data) => {
      addLog('📝 Answer submitted successfully', 'success');
    });

    newSocket.on('player_answered', (data) => {
      addLog('👤 Another player answered', 'info');
    });

    newSocket.on('question_results', (data) => {
      addLog('📊 Question results received', 'success');
      addLog(`✅ Correct answer: ${data.correctAnswer}`, 'info');
      
      setGameData(prev => {
        const historyEntry = addQuestionToHistory(prev.currentQuestion?.question, data);
        
        return {
          ...prev,
          currentResults: data,
          questionHistory: [...prev.questionHistory, historyEntry],
          playerScore: prev.playerScore + historyEntry.points
        };
      });
    });

    newSocket.on('game_finished', (data) => {
      addLog('🏆 Game finished!', 'success');
      addLog(`🏆 Winner: ${data.winner?.userId || 'N/A'}`, 'info');
      setGameState('finished');
    });

    newSocket.on('error', (data) => {
      addLog(`❌ Error: ${data.message}`, 'error');
    });

    // Chat event listeners
    newSocket.on('chat_message', (message) => {
      setMessages(prev => [...prev, message]);
      addLog(`💬 ${message.sender.name}: ${message.content}`, 'info');
      
      // Increment unread if not currently viewing chat
      if (!document.hasFocus()) {
        setUnreadCount(prev => prev + 1);
      }
    });

    newSocket.on('typing_start', (userId) => {
      setTypingUsers(prev => new Set([...prev, userId]));
    });

    newSocket.on('typing_end', (userId) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    newSocket.on('message_reaction', ({ messageId, reaction, userId }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions };
          if (!reactions[reaction]) reactions[reaction] = [];
          if (!reactions[reaction].includes(userId)) {
            reactions[reaction] = [...reactions[reaction], userId];
          }
          return { ...msg, reactions };
        }
        return msg;
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Socket actions
  const authenticate = (token) => {
    if (!socket || !token) return;
    socket.emit('authenticate', { token });
    addLog(`🔐 Authenticating with token: ${token.substring(0, 20)}...`, 'info');
  };

  const createRoom = (quizId) => {
    if (!socket || !authenticated) return;
    socket.emit('create_room', {
      quizId,
      settings: {
        maxPlayers: 10,
        timePerQuestion: 30
      }
    });
    addLog(`🏠 Creating room with quiz: ${quizId}`, 'info');
  };

  const joinRoom = (roomCode) => {
    if (!socket || !authenticated || !roomCode) return;
    socket.emit('join_room', { roomCode: roomCode.toUpperCase() });
    addLog(`🚪 Joining room: ${roomCode}`, 'info');
  };

  const startGame = () => {
    if (!socket || !currentRoom) return;
    socket.emit('start_game', { roomId: currentRoom.id });
    addLog(`🎮 Starting game: ${currentRoom.id}`, 'info');
  };

  const submitAnswer = (answer) => {
    if (!socket || !currentRoom || !gameData.currentQuestion) return;
    
    const responseTime = Date.now() - gameData.questionStartTime;
    socket.emit('submit_answer', {
      roomId: currentRoom.id,
      questionIndex: gameData.currentQuestion.questionIndex,
      selectedAnswer: answer,
      responseTime
    });
    
    setGameData(prev => ({ ...prev, selectedAnswer: answer }));
    addLog(`📝 Submitting answer: ${answer}`, 'info');
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      addLog('🔌 Disconnected manually', 'info');
    }
  };

  // Chat helpers
  const createMessage = (content, type = 'text', replyTo = null) => {
    return {
      id: uuidv4(),
      type,
      content,
      sender: {
        id: socket?.id,
        name: currentRoom?.playerName || 'Anonymous'
      },
      timestamp: Date.now(),
      roomId: currentRoom?.id,
      replyTo,
      reactions: {}
    };
  };

  // Chat actions
  const sendMessage = (content, type = 'text', replyTo = null) => {
    if (!socket || !currentRoom || !content.trim()) return;
    
    const message = createMessage(content, type, replyTo);
    socket.emit('chat_message', message);
    
    // Optimistic update
    setMessages(prev => [...prev, message]);
    addLog(`💬 Sent: ${content}`, 'info');
  };

  const startTyping = () => {
    if (!socket || !currentRoom) return;
    socket.emit('typing_start', { roomId: currentRoom.id });
  };

  const stopTyping = () => {
    if (!socket || !currentRoom) return;
    socket.emit('typing_end', { roomId: currentRoom.id });
  };

  const addReaction = (messageId, reaction) => {
    if (!socket || !currentRoom) return;
    socket.emit('message_reaction', {
      messageId,
      reaction,
      roomId: currentRoom.id
    });
  };

  const deleteMessage = (messageId) => {
    if (!socket || !currentRoom) return;
    socket.emit('delete_message', {
      messageId,
      roomId: currentRoom.id
    });
    // Optimistic update
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const clearUnreadCount = () => {
    setUnreadCount(0);
  };

  return {
    // State
    socket,
    connected,
    authenticated,
    currentRoom,
    gameState,
    gameData,
    logs,
    
    // Chat state
    messages,
    typingUsers: Array.from(typingUsers),
    unreadCount,
    
    // Actions
    authenticate,
    createRoom,
    joinRoom,
    startGame,
    submitAnswer,
    disconnect,
    resetGameData,
    clearLogs,
    
    // Chat actions
    sendMessage,
    startTyping,
    stopTyping,
    addReaction,
    deleteMessage,
    clearUnreadCount
  };
};