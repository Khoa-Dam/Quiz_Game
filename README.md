# 🎮 Quiz Game API

A multiplayer Quiz Game application built with Node.js, Express.js, MongoDB, and Socket.IO.

## 📋 Table of Contents

- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Usage](#-usage)
- [Testing](#-testing)
- [Deployment](#-deployment)

## ✨ Features

### 🔐 Authentication & Authorization
- User registration with email verification
- Login/logout with JWT
- Password reset via OTP
- Security middleware for protected routes

### 🎯 Quiz Management
- Create quizzes with multiple questions
- Flexible scoring system (base points, time bonus, penalties)
- Validation for questions (4 options, 1 correct answer)
- CRUD operations for quizzes

### 🏠 Room Management
- Create game rooms with 6-character room codes
- Join rooms using room codes
- Room status management (waiting, playing, paused, finished)
- Room settings (max players, auto start, leaderboard)

### 🌐 Real-time Communication
- Socket.IO for multiplayer gameplay
- Real-time updates for all players
- Game events: join room, start game, submit answer, game finished

### 📊 User Management
- User profile management
- Account verification
- Password reset functionality

## 🛠 Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **nodemailer** - Email service

### Development Tools
- **Swagger/OpenAPI** - API documentation
- **Postman** - API testing
- **Git** - Version control

## 🚀 Installation

### System Requirements
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Step 1: Clone repository
```bash
git clone <repository-url>
cd Quiz_Game
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure environment
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/quiz_game

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=5d

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Optional: Redis for session storage
REDIS_URL=redis://localhost:6379
```

### Step 4: Start MongoDB
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

### Step 5: Run the application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The application will run at: `http://localhost:3000`

## 📁 Project Structure

```
Quiz_Game/
├── config/
│   ├── database.js          # Database configuration
│   └── swagger.js           # Swagger documentation config
├── controllers/
│   ├── auth/
│   │   └── authController.js # Authentication logic
│   ├── quiz/
│   │   └── quizController.js # Quiz management
│   ├── room/
│   │   └── roomController.js # Room management
│   └── user/
│       └── userController.js # User management
├── docs/
│   └── swagger/             # API documentation
│       ├── auth.js
│       ├── quiz.js
│       ├── room.js
│       └── user.js
├── middleware/
│   ├── userAuth.js          # Authentication middleware
│   └── validationUtils.js   # Validation utilities
├── models/
│   ├── users/
│   │   └── userModel.js     # User schema
│   ├── quiz/
│   │   ├── quizModel.js     # Quiz schema
│   │   └── questionModel.js # Question schema
│   └── room/
│       └── roomModel.js     # Room schema
├── routes/
│   └── v1/                  # API routes
│       ├── authRouters.js
│       ├── quizRouters.js
│       ├── roomRoutes.js
│       └── userRouters.js
├── services/
│   ├── auth/
│   │   ├── authService.js   # Authentication business logic
│   │   └── emailService.js  # Email service
│   ├── quiz/
│   │   └── quizService.js   # Quiz business logic
│   ├── room/
│   │   └── roomService.js   # Room business logic
│   └── socket/
│       └── gameSocketService.js # Socket.IO game logic
├── utils/
│   └── validationUtils.js   # Validation utilities
├── server.js                # Main server file
├── package.json
└── README.md
```

## 📚 API Documentation

### Swagger UI
Access API documentation at: `http://localhost:3000/api-docs`

### API Endpoints

#### 🔐 Authentication
```
POST /api/v1/auth/register     # Register account
POST /api/v1/auth/login        # Login
POST /api/v1/auth/logout       # Logout
POST /api/v1/auth/send-reset-otp    # Send password reset OTP
POST /api/v1/auth/reset-password     # Reset password
POST /api/v1/auth/send-verify-otp    # Send email verification OTP
POST /api/v1/auth/verify-account     # Verify email
GET  /api/v1/auth/is-auth     # Check authentication
```

#### 🎯 Quiz Management
```
POST   /api/v1/quiz/create           # Create new quiz
GET    /api/v1/quiz/all              # Get all quizzes
GET    /api/v1/quiz/{id}/game        # Get quiz for game
POST   /api/v1/quiz/{id}/check-answer # Check answer
GET    /api/v1/quiz/{id}             # Get quiz by ID
PUT    /api/v1/quiz/{id}             # Update quiz
DELETE /api/v1/quiz/{id}             # Delete quiz
```

#### 🏠 Room Management
```
POST /api/v1/room/create           # Create game room
POST /api/v1/room/join             # Join room
GET  /api/v1/room/{roomId}/status  # Get room status
```

#### 👤 User Management
```
GET /api/v1/user/data              # Get user data
```

## 🎮 Usage

### 1. Register account
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "kaito",
    "email": "damngockhoa2005@gmail.com",
    "password": "1234"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "damngockhoa2005@gmail.com",
    "password": "1234"
  }' \
  -c cookies.txt
```

### 3. Create quiz
```bash
curl -X POST http://localhost:3000/api/v1/quiz/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Basic Knowledge Quiz",
    "description": "A comprehensive knowledge test",
    "questions": [
      {
        "text": "What is the capital of Vietnam?",
        "options": ["Hanoi", "Ho Chi Minh", "Da Nang", "Hue"],
        "correctAnswer": 0
      }
    ],
    "timePerQuestion": 30,
    "scoring": {
      "basePoints": 100,
      "timeBonus": true,
      "maxTimeBonus": 50,
      "penaltyForWrong": false,
      "wrongAnswerPenalty": 0
    }
  }'
```

### 4. Create game room
```bash
curl -X POST http://localhost:3000/api/v1/room/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "quizId": "quiz_id_here",
    "settings": {
      "maxPlayers": 10,
      "autoStart": false,
      "showLeaderboard": true
    }
  }'
```

## 🧪 Testing

### API Testing with Postman

1. **Import Collection**: Import Postman collection file
2. **Set Environment Variables**:
   - `baseUrl`: `http://localhost:3000/api/v1`
   - `token`: JWT token after login

### Socket.IO Testing

#### Browser Console
```javascript
// Connect to Socket.IO
const socket = io('http://localhost:3000');

// Authenticate
socket.emit('authenticate', { token: 'your_jwt_token' });

// Join room
socket.emit('join_room', { roomCode: 'ABC123' });

// Submit answer
socket.emit('submit_answer', {
  questionIndex: 0,
  selectedAnswer: 1,
  responseTime: 5000
});
```

#### Node.js Client
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Authenticate
  socket.emit('authenticate', { token: 'your_jwt_token' });
});

socket.on('player_joined', (data) => {
  console.log('Player joined:', data);
});
```

### Unit Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Environment

1. **Set Environment Variables**:
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
```

2. **Build and Start**:
```bash
npm run build
npm start
```

### Docker Deployment

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build image
docker build -t quiz-game .

# Run container
docker run -p 3000:3000 quiz-game
```

### PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "quiz-game"

# Monitor
pm2 monit

# Logs
pm2 logs quiz-game
```

## 🔧 Development

### Available Scripts

```bash
npm start          # Run production
npm run dev        # Run development with nodemon
npm test           # Run tests
npm run lint       # Lint code
npm run format     # Format code
```

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 🤝 Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

### Coding Standards

- Use ES6+ syntax
- Follow ESLint rules
- Write tests for new features
- Update documentation when needed

### Commit Message Convention

```
feat: add new feature
fix: bug fix
docs: update documentation
style: code formatting
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- Socket.IO team for real-time communication
- MongoDB team for the database solution

---

**Made with ❤️ by Quiz Game Team** 