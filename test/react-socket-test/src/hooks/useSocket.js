import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [gameState, setGameState] = useState('disconnected');
  const [logs, setLogs] = useState([]);
  
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

  return {
    // State
    socket,
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
  };
};