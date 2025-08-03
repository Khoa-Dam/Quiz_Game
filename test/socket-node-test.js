import { io } from 'socket.io-client';

console.log('🔌 Testing Socket.IO connection...');

// Connect to server
const socket = io('http://localhost:3000');

// Test connection
socket.on('connect', () => {
  console.log('✅ Connected to server');
  console.log('Socket ID:', socket.id);
  
  // Test authentication (replace with real token)
  const token = 'your_jwt_token_here';
  console.log('🔐 Testing authentication...');
  socket.emit('authenticate', { token });
});

socket.on('authenticated', (data) => {
  console.log('✅ Authentication successful:', data);
  
  // Test join room
  console.log('🚪 Testing join room...');
  socket.emit('join_room', { roomCode: 'ABC123' });
});

socket.on('room_joined', (data) => {
  console.log('✅ Room joined successfully:', data);
  
  // Test submit answer
  console.log('📝 Testing submit answer...');
  socket.emit('submit_answer', {
    roomId: 'room123',
    questionIndex: 0,
    selectedAnswer: 1,
    responseTime: 5000
  });
});

socket.on('answer_submitted', (data) => {
  console.log('✅ Answer submitted successfully:', data);
  
  // Disconnect after 3 seconds
  setTimeout(() => {
    socket.disconnect();
    console.log('🔌 Test completed, disconnected');
  }, 3000);
});

socket.on('error', (data) => {
  console.log('❌ Socket error:', data);
});

socket.on('disconnect', () => {
  console.log('👋 Disconnected from server');
});

// Handle connection errors
socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
});

// Handle authentication errors
socket.on('auth_error', (data) => {
  console.log('❌ Authentication failed:', data);
});

console.log('🚀 Socket.IO test started...');
console.log('Đảm bảo server đang chạy trên localhost:3000'); 