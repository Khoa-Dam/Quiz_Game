# Quiz Game Multi-Room Testing

## Vấn đề đã được sửa

Dự án Quiz Game trước đây có vấn đề khi tạo nhiều room và bắt đầu game cùng lúc:

### ❌ **Vấn đề cũ:**
1. **Race Condition**: Khi 2 room cùng bắt đầu, có thể xảy ra conflict
2. **Shared State Conflict**: `activeRooms` và `roomQuizzes` có thể bị ghi đè
3. **Timeout Management**: Timeouts có thể bị conflict giữa các room
4. **Socket Room Naming**: Có thể xảy ra conflict trong tên socket room

### ✅ **Giải pháp đã áp dụng:**
1. **Room Conflict Detection**: Tự động phát hiện và xử lý conflict
2. **Unique Room Codes**: Tạo room code duy nhất khi cần thiết
3. **Better State Management**: Cải thiện quản lý state cho từng room
4. **Enhanced Logging**: Thêm logging chi tiết để debug
5. **Timeout Isolation**: Cô lập timeouts giữa các room

## Cách sử dụng

### 1. **Chạy test multi-room:**
```bash
cd test
node multi-room-test.js
```

### 2. **Debug room status (từ client):**
```javascript
// Chỉ host mới có thể debug
socket.emit('debug_rooms');

socket.on('debug_info', (data) => {
  console.log('Game Rooms:', data.gameRooms);
  console.log('Active Rooms:', data.activeRooms);
});
```

### 3. **Kiểm tra logs server:**
Server sẽ hiển thị logs chi tiết:
```
🏠 Initialized new room: ABC123 with roomId: 507f1f77bcf86cd799439011
🎮 Starting game for room: ABC123, quiz: 507f1f77bcf86cd799439012
❓ Sending question 1/10 to room ABC123
⏱️ Set timeout for room ABC123, question 0
```

## Cấu trúc dữ liệu

### **RoomManager.activeRooms:**
```javascript
Map {
  "ABC123" => {
    host: "user123",
    players: Set {"user456", "user789"},
    answers: Map,
    roomId: "507f1f77bcf86cd799439011",
    playerScores: Map,
    createdAt: Date
  }
}
```

### **GameManager.roomQuizzes:**
```javascript
Map {
  "ABC123" => {
    _id: "quiz123",
    title: "Test Quiz",
    questions: [...]
  }
}
```

### **GameManager.questionTimeouts:**
```javascript
Map {
  "ABC123_0" => TimeoutID,
  "ABC123_1" => TimeoutID,
  "DEF456_0" => TimeoutID
}
```

## Xử lý lỗi

### **Room Code Conflict:**
```javascript
// Tự động tạo room code duy nhất
if (existingRoom.roomId !== roomId) {
  const uniqueRoomCode = `${roomCode}_${Date.now()}`;
  return this.initializeRoom(uniqueRoomCode, roomId);
}
```

### **Game Already Started:**
```javascript
// Kiểm tra room đã bắt đầu game chưa
if (this.roomQuizzes.has(socket.roomCode)) {
  socket.emit('error', { message: 'Game is already in progress for this room' });
  return;
}
```

## Monitoring và Debug

### **Server Logs:**
- `🏠` - Room operations
- `🎮` - Game operations  
- `❓` - Question operations
- `⏱️` - Timeout operations
- `🧹` - Cleanup operations
- `⚠️` - Warnings
- `❌` - Errors

### **Client Events:**
- `room_created` - Room được tạo
- `room_joined` - Tham gia room
- `game_started` - Game bắt đầu
- `new_question` - Câu hỏi mới
- `question_results` - Kết quả câu hỏi
- `game_finished` - Game kết thúc
- `debug_info` - Thông tin debug

## Best Practices

1. **Luôn kiểm tra room status** trước khi thực hiện operations
2. **Sử dụng try-catch** cho tất cả socket events
3. **Cleanup resources** khi room kết thúc
4. **Log đầy đủ** để debug khi có vấn đề
5. **Validate input** từ client trước khi xử lý

## Troubleshooting

### **Room không thể bắt đầu game:**
- Kiểm tra logs server
- Sử dụng `debug_rooms` event
- Kiểm tra room có tồn tại trong `activeRooms` không

### **Game bị treo:**
- Kiểm tra timeouts có bị conflict không
- Sử dụng cleanup methods
- Restart server nếu cần

### **Socket connection bị mất:**
- Kiểm tra network
- Kiểm tra authentication
- Kiểm tra room status
