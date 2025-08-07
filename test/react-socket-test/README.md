# React Socket Test App - Testing Guide

## 🎯 **Purpose:**
Interactive React frontend for testing Socket.IO game functionality with real-time quiz features.

## 🚀 **Quick Start:**

### **1. Setup & Installation:**
```bash
# Navigate to React test app
cd test/react-socket-test

# Install dependencies
npm install

# Start the React app
npm start
```

**App will open at:** `http://localhost:3001`

### **2. Prerequisites:**
- **Backend server** must be running on `http://localhost:3000`
- **Valid JWT token** (default: `demo` works for testing)
- **Quiz data** in database (default Quiz ID: `688e2e4e9b4ff1cbd73ac4d4`)

## 📋 **Testing Scenarios:**

### **🔐 Authentication Test:**
1. **Connect:** App auto-connects to `localhost:3000`
2. **Status:** Should show `🟢 Connected`
3. **Authenticate:** Click "Authenticate" with token `demo`
4. **Verify:** Status changes to `🟡 Authenticated`

**Expected Logs:**
```
✅ Connected to server
🆔 Socket ID: abc123...
🔐 Authenticating with token: demo...
✅ Authenticated successfully
```

### **🏠 Room Management Test:**

#### **As Host (Create Room):**
1. **Authenticate** first
2. **Quiz ID:** Use `688e2e4e9b4ff1cbd73ac4d4` (default)
3. **Click:** "Create Room"
4. **Verify:** Room code appears (e.g., `ABC123`)
5. **Status:** Shows `Room: ABC123 | State: in_room`

**Expected Logs:**
```
🏠 Creating room with quiz: 688e2e4e9b4ff1cbd73ac4d4
🏠 Room created successfully
📝 Room Code: ABC123
```

#### **As Player (Join Room):**
1. **Open new browser tab/window** → `http://localhost:3001`
2. **Authenticate** with token `demo`
3. **Room Code:** Enter the room code from host (e.g., `ABC123`)
4. **Click:** "Join Room"
5. **Verify:** Successfully joined room

**Expected Logs:**
```
🚪 Joining room: ABC123
✅ Joined room successfully
📝 Room: Quiz Title Name
```

### **🎮 Game Flow Test:**

#### **Single Player (Development Mode):**
1. **Create room** as host
2. **Click:** "Start Game"
3. **Questions appear** automatically
4. **Answer questions** by clicking options (A, B, C, D)
5. **Results show** after 25 seconds or immediate answer
6. **Game progresses** through all questions

#### **Multiplayer Test:**
1. **Host creates room** (Browser 1)
2. **Player joins room** (Browser 2, 3, etc.)
3. **Host starts game**
4. **All players see questions** simultaneously
5. **Players answer** at different speeds
6. **Results show** when all players answer OR 25s timeout
7. **Leaderboard updates** with real-time scores

## ⏱️ **Time-Based Scoring Test:**

### **Fast Answer (High Score):**
- Answer within **1-5 seconds** → **140-148 points**
- Look for log: `⏱️ Time scoring: 3500ms response, 21500ms left, 0.86 time percent, +43 bonus points`

### **Slow Answer (Low Score):**
- Answer within **20-24 seconds** → **102-110 points**
- Look for log: `⏱️ Time scoring: 22000ms response, 3000ms left, 0.12 time percent, +6 bonus points`

### **Timeout (Zero Points):**
- Don't answer for **25+ seconds** → **0 points**
- Look for log: `⏰ Player X didn't answer - recorded 0 points`

## 👑 **Host vs Players Test:**

### **Host Behavior:**
- **Can:** Create room, start game, observe progress
- **Cannot:** Answer questions (buttons disabled)
- **UI Shows:** `👑 Waiting for players to answer questions...`
- **Error Test:** Try clicking answer → `❌ Error: Host cannot answer questions`

### **Player Behavior:**
- **Can:** Join room, answer questions, earn points
- **Cannot:** Start game (button disabled for non-hosts)
- **UI Shows:** Answer options and timer

## 🏆 **Leaderboard Test:**

### **Multiplayer Ranking:**
1. **Multiple players** answer questions
2. **Different response times** = different scores
3. **Leaderboard shows** after each question:
   ```
   🏆 Leaderboard:
   1. Player abc12345... - 295 pts
   2. Player def67890... - 220 pts
   3. Player ghi11111... - 150 pts
   ```

### **Score Accumulation:**
- **Each question** adds points to total
- **Faster answers** = higher cumulative score
- **Final ranking** based on total points

## 🔧 **Debug Features:**

### **Event Logs:**
- **Real-time logs** show all socket events
- **Color-coded:** Success (green), Error (red), Info (blue)
- **Timestamps** for tracking event timing
- **Clear Logs** button for fresh start

### **Game Controls:**
- **Reset Game Data:** Clear current game state
- **Disconnect:** Manual disconnect for testing
- **Multiple Tabs:** Test multiple players easily

## 🧪 **Test Cases:**

### **1. Connection Test:**
```
✅ App connects to backend
✅ Socket ID is assigned
✅ Authentication works
✅ Disconnection handling
```

### **2. Room Management Test:**
```
✅ Host can create room
✅ Players can join room
✅ Room codes work correctly
✅ Player count updates
✅ Room full handling
```

### **3. Game Flow Test:**
```
✅ Game starts for all players
✅ Questions sent simultaneously
✅ 25-second timer works
✅ All players must answer (multiplayer)
✅ Game progresses through questions
✅ Game ends properly
```

### **4. Scoring System Test:**
```
✅ Time-based scoring (25 seconds)
✅ Fast answers get bonus points
✅ Slow answers get fewer points
✅ Timeout = 0 points
✅ Cumulative scoring works
✅ Leaderboard updates correctly
```

### **5. Host vs Player Test:**
```
✅ Host cannot answer questions
✅ Players cannot start game
✅ UI adapts to role
✅ Error messages for wrong actions
```

## 🔍 **Troubleshooting:**

### **Connection Issues:**
- **Check backend:** `http://localhost:3000` running?
- **CORS errors:** Backend allows `localhost:3001`
- **Socket logs:** Check browser developer console

### **Authentication Issues:**
- **Token:** Use `demo` for testing
- **JWT format:** Valid token structure
- **Backend auth:** Auth service working?

### **Game Issues:**
- **Quiz data:** Valid quiz ID in database
- **Room full:** Default max 10 players (dev mode ignores)
- **Questions:** Quiz has questions in database

### **Timing Issues:**
- **25-second timeout:** Fixed timer for all questions
- **Answer blocking:** Can't answer twice
- **Results delay:** 5 seconds between questions

## 📱 **Browser Testing:**

### **Multiple Browsers/Tabs:**
```
Tab 1: Host (Chrome)     → Create room
Tab 2: Player 1 (Chrome) → Join room  
Tab 3: Player 2 (Firefox) → Join room
Tab 4: Player 3 (Safari)  → Join room
```

### **Mobile Testing:**
- **Responsive UI** works on mobile browsers
- **Touch interactions** for answer buttons
- **Real-time updates** work on mobile

## 🎯 **Expected Performance:**

### **Real-time Features:**
- **Instant updates** when players join/leave
- **Simultaneous question delivery** to all players
- **Real-time leaderboard** updates
- **Immediate result display**

### **Network Resilience:**
- **Auto-reconnection** on connection loss
- **Error handling** for network issues
- **Graceful degradation** when backend down

## 🚀 **Quick Test Commands:**

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start React app
cd test/react-socket-test
npm start

# Browser: Open multiple tabs
# http://localhost:3001 (Tab 1 - Host)
# http://localhost:3001 (Tab 2 - Player 1)  
# http://localhost:3001 (Tab 3 - Player 2)
```

## 📊 **Success Criteria:**

### **✅ All Tests Pass:**
- **Connection:** Stable socket connection
- **Authentication:** JWT validation works
- **Rooms:** Create/join successfully
- **Game:** Start/play/finish properly
- **Scoring:** Time-based points accurate
- **Real-time:** All players see updates
- **Host/Player:** Role restrictions work
- **UI:** Responsive and intuitive

**Ready for production-quality game testing! 🎮🚀**