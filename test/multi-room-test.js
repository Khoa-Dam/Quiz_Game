import io from 'socket.io-client';

// Test configuration
const SERVER_URL = 'http://localhost:3000';
const TEST_DELAY = 1000; // 1 second delay between operations

// Test data
const testQuizzes = [
    { id: 'quiz1', title: 'Test Quiz 1' },
    { id: 'quiz2', title: 'Test Quiz 2' }
];

// Test rooms
const testRooms = [];

// Socket connections
const sockets = [];

/**
 * Create a test room
 */
async function createTestRoom(quizId, roomIndex) {
    return new Promise((resolve, reject) => {
        const socket = io(SERVER_URL);
        sockets.push(socket);

        socket.on('connect', () => {
            console.log(`🔌 Socket ${roomIndex} connected`);

            // Authenticate (you'll need to provide valid token)
            socket.emit('authenticate', {
                token: 'your_jwt_token_here' // Replace with actual token
            });
        });

        socket.on('authenticated', () => {
            console.log(`✅ Socket ${roomIndex} authenticated`);

            // Create room
            socket.emit('create_room', {
                quizId,
                settings: {
                    maxPlayers: 4,
                    timeLimit: 25
                }
            });
        });

        socket.on('room_created', (data) => {
            if (data.success) {
                console.log(`🏠 Room ${roomIndex} created: ${data.data.roomCode}`);
                testRooms.push({
                    index: roomIndex,
                    roomCode: data.data.roomCode,
                    roomId: data.data.roomId,
                    socket: socket
                });
                resolve(data.data);
            } else {
                reject(new Error(`Failed to create room ${roomIndex}: ${data.message}`));
            }
        });

        socket.on('error', (error) => {
            console.error(`❌ Socket ${roomIndex} error:`, error);
            reject(error);
        });

        // Timeout after 10 seconds
        setTimeout(() => {
            reject(new Error(`Timeout creating room ${roomIndex}`));
        }, 10000);
    });
}

/**
 * Start game in a room
 */
async function startGameInRoom(roomIndex) {
    return new Promise((resolve, reject) => {
        const room = testRooms.find(r => r.index === roomIndex);
        if (!room) {
            reject(new Error(`Room ${roomIndex} not found`));
            return;
        }

        const socket = room.socket;

        socket.on('game_started', (data) => {
            console.log(`🎮 Game started in room ${roomIndex}: ${room.roomCode}`);
            resolve(data);
        });

        socket.on('error', (error) => {
            console.error(`❌ Error starting game in room ${roomIndex}:`, error);
            reject(error);
        });

        // Start the game
        socket.emit('start_game', {
            roomId: room.roomId
        });

        // Timeout after 10 seconds
        setTimeout(() => {
            reject(new Error(`Timeout starting game in room ${roomIndex}`));
        }, 10000);
    });
}

/**
 * Debug room status
 */
async function debugRooms() {
    return new Promise((resolve) => {
        if (testRooms.length === 0) {
            console.log('No rooms to debug');
            resolve();
            return;
        }

        const firstRoom = testRooms[0];
        const socket = firstRoom.socket;

        socket.on('debug_info', (data) => {
            console.log('🔍 Debug Info:');
            console.log('Game Rooms:', data.gameRooms);
            console.log('Active Rooms:', data.activeRooms);
            resolve(data);
        });

        socket.emit('debug_rooms');
    });
}

/**
 * Clean up all connections
 */
function cleanup() {
    console.log('🧹 Cleaning up connections...');
    sockets.forEach(socket => {
        socket.disconnect();
    });
    sockets.length = 0;
    testRooms.length = 0;
}

/**
 * Main test function
 */
async function runMultiRoomTest() {
    console.log('🚀 Starting Multi-Room Test...');

    try {
        // Create first room
        console.log('\n📝 Creating Room 1...');
        await createTestRoom('quiz1', 1);
        await new Promise(resolve => setTimeout(resolve, TEST_DELAY));

        // Create second room
        console.log('\n📝 Creating Room 2...');
        await createTestRoom('quiz2', 2);
        await new Promise(resolve => setTimeout(resolve, TEST_DELAY));

        // Start game in first room
        console.log('\n🎮 Starting Game in Room 1...');
        await startGameInRoom(1);
        await new Promise(resolve => setTimeout(resolve, TEST_DELAY));

        // Start game in second room
        console.log('\n🎮 Starting Game in Room 2...');
        await startGameInRoom(2);
        await new Promise(resolve => setTimeout(resolve, TEST_DELAY));

        // Debug room status
        console.log('\n🔍 Debugging Room Status...');
        await debugRooms();

        console.log('\n✅ Multi-Room Test completed successfully!');

    } catch (error) {
        console.error('\n❌ Multi-Room Test failed:', error.message);
    } finally {
        // Wait a bit before cleanup
        await new Promise(resolve => setTimeout(resolve, 2000));
        cleanup();
    }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMultiRoomTest();
}

export { runMultiRoomTest, createTestRoom, startGameInRoom, debugRooms, cleanup };
