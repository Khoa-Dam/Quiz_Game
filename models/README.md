# Models Directory Structure

## 📁 **Current Structure:**

```
models/
├── index.js                      // 🎯 Main exports (all models, types)
├── users/
│   └── userModel.js              // User schema & model
├── room/
│   └── roomModel.js              // Room schema & model  
├── quiz/
│   ├── quizModel.js              // Quiz schema & model
│   └── questionModel.js          // Question schema & model
├── types/
│   └── common.js                 // Enums, constants, validation rules
└── README.md                     // This file
```

## 🎯 **Usage:**

### **Import All Models:**
```javascript
import { User, Room, Quiz, Question } from './models/index.js';
```

### **Import Individual Models:**
```javascript
import User from './models/users/userModel.js';
import Room from './models/room/roomModel.js';
import Quiz from './models/quiz/quizModel.js';
import Question from './models/quiz/questionModel.js';
```

### **Import Types & Constants:**
```javascript
import { ROOM_STATUS, USER_ROLES, GAME_CONSTRAINTS, ERROR_MESSAGES } from './models/index.js';
```

## 📊 **Model Overview:**

### **1. 👤 User Model** (`users/userModel.js`)
```javascript
{
  name: String,
  email: String,
  password: String,
  verifyOtp: String,
  verifyOtpExpireAt: Number,
  isAccountVerified: Boolean,
  resetOtp: String,
  resetOtpExpireAt: Number
}
```

### **2. 🏠 Room Model** (`room/roomModel.js`)
```javascript
{
  roomCode: String,           // 6-char unique code
  quiz: ObjectId,            // ref: Quiz
  host: ObjectId,            // ref: User
  players: [ObjectId],       // ref: User
  status: String,            // waiting|playing|paused|finished
  currentQuestion: Number,   // -1 initially
  questionStartTime: Date,
  settings: {
    maxPlayers: Number,      // default: 8
    autoStart: Boolean,      // default: false
    showLeaderboard: Boolean // default: true
  }
}
```

### **3. 📝 Quiz Model** (`quiz/quizModel.js`)
```javascript
{
  title: String,
  description: String,
  questions: [ObjectId],     // ref: Question
  timePerQuestion: Number,   // default: 15
  createdBy: ObjectId,       // ref: User
  isActive: Boolean,         // default: true
  scoring: {
    basePoints: Number,      // default: 100
    timeBonus: Boolean,      // default: true
    maxTimeBonus: Number,    // default: 50
    penaltyForWrong: Boolean,// default: false
    wrongAnswerPenalty: Number // default: 0
  }
}
```

### **4. ❓ Question Model** (`quiz/questionModel.js`)
```javascript
{
  text: String,
  options: [String],         // exactly 4 options
  correctAnswer: Number      // 0-3 index
}
```



## 🎨 **Types & Constants** (`types/common.js`)

### **Enums:**
```javascript
ROOM_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing', 
  PAUSED: 'paused',
  FINISHED: 'finished'
}

USER_ROLES = {
  ADMIN: 'admin',
  HOST: 'host',
  PLAYER: 'player',
  GUEST: 'guest'
}
```

### **Constraints:**
```javascript
GAME_CONSTRAINTS = {
  MAX_PLAYERS: { MIN: 2, MAX: 20, DEFAULT: 8 },
  TIME_PER_QUESTION: { MIN: 5, MAX: 60, DEFAULT: 25 },
  ROOM_CODE: { LENGTH: 6, PATTERN: /^[A-Z0-9]{6}$/ }
}
```

### **Validation:**
```javascript
VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: { MIN_LENGTH: 8, PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/ },
  ROOM_CODE: /^[A-Z0-9]{6}$/
}
```

### **Error Messages:**
```javascript
ERROR_MESSAGES = {
  REQUIRED_FIELD: (field) => `${field} is required`,
  INVALID_EMAIL: 'Invalid email format',
  ROOM_FULL: 'Room has reached maximum capacity',
  UNAUTHORIZED: 'Unauthorized access'
}
```

## 🔧 **Benefits of This Structure:**

### **1. 📝 Simple Imports:**
- **Single entry point:** `models/index.js`
- **No nested index files:** Direct file imports
- **Clean imports:** All models in one place

### **2. 🎯 Organized by Domain:**
- **users/:** User-related models
- **room/:** Room-related models  
- **quiz/:** Quiz & Question models
- **base/:** Shared functionality
- **types/:** Constants & validation

### **3. 🔄 Scalable:**
- **Easy to add:** New models in appropriate folders
- **Future expansion:** Ready for growth
- **Maintainable:** Clear separation of concerns

### **4. 🧪 Testable:**
- **Individual imports:** Test specific models
- **Mock-friendly:** Easy to mock for testing
- **Isolated:** Changes don't affect other models

## 🚀 **Usage Examples:**

### **In Services:**
```javascript
// Import what you need
import { User, Room, Quiz, ROOM_STATUS } from '../models/index.js';

export const roomService = {
  async createRoom(data) {
    const room = new Room({
      ...data,
      status: ROOM_STATUS.WAITING
    });
    return await room.save();
  }
};
```

### **In Controllers:**
```javascript
import { User, ERROR_MESSAGES } from '../models/index.js';

export const authController = {
  async login(req, res) {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ 
        message: ERROR_MESSAGES.UNAUTHORIZED 
      });
    }
    // ...
  }
};
```

### **In Socket Services:**
```javascript
import { Room, ROOM_STATUS, GAME_CONSTRAINTS } from '../models/index.js';

export class GameSocketService {
  async handleJoinRoom(socket, { roomCode }) {
    const room = await Room.findOne({ 
      roomCode, 
      status: ROOM_STATUS.WAITING 
    });
    
    if (room.players.length >= GAME_CONSTRAINTS.MAX_PLAYERS.MAX) {
      socket.emit('error', { message: ERROR_MESSAGES.ROOM_FULL });
      return;
    }
    // ...
  }
}
```

**Clean, organized, and ready for production! 🎯✨**