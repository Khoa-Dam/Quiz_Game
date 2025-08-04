/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *         roomCode:
 *           type: string
 *           example: "ABC123"
 *         quiz:
 *           type: string
 *           example: "64f8a1b2c3d4e5f6a7b8c9d1"
 *         host:
 *           type: string
 *           example: "64f8a1b2c3d4e5f6a7b8c9d2"
 *         players:
 *           type: array
 *           items:
 *             type: string
 *           example: ["64f8a1b2c3d4e5f6a7b8c9d2", "64f8a1b2c3d4e5f6a7b8c9d3"]
 *         status:
 *           type: string
 *           enum: [waiting, playing, paused, finished]
 *           example: "waiting"
 */

/**
 * @swagger
 * /room/create:
 *   post:
 *     summary: Create a new game room
 *     tags: [Room]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoom'
 *           examples:
 *             createRoomExample:
 *               summary: Create Room
 *               description: Example for creating a new game room
 *               value:
 *                 quizId: "64f8a1b2c3d4e5f6a7b8c9d1"
 *                 maxPlayers: 10
 *                 settings:
 *                   timePerQuestion: 30
 *                   autoStart: false
 *     responses:
 *       200:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tạo phòng thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     room:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *                         roomCode:
 *                           type: string
 *                           example: "ABC123"
 *                         pin:
 *                           type: string
 *                           example: "123456"
 *                         quiz:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "64f8a1b2c3d4e5f6a7b8c9d1"
 *                             title:
 *                               type: string
 *                               example: "Math Quiz"
 *                         host:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "64f8a1b2c3d4e5f6a7b8c9d2"
 *                             username:
 *                               type: string
 *                               example: "testuser"
 *                         status:
 *                           type: string
 *                           example: "waiting"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Chưa đăng nhập"
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Quiz không tồn tại"
 */

/**
 * @swagger
 * /room/join:
 *   post:
 *     summary: Join an existing room
 *     tags: [Room]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JoinRoom'
 *           examples:
 *             joinRoomExample:
 *               summary: Join Room
 *               description: Example for joining an existing room
 *               value:
 *                 pin: "123456"
 *     responses:
 *       200:
 *         description: Successfully joined room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tham gia phòng thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     room:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *                         roomCode:
 *                           type: string
 *                           example: "ABC123"
 *                         pin:
 *                           type: string
 *                           example: "123456"
 *                         quiz:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "64f8a1b2c3d4e5f6a7b8c9d1"
 *                             title:
 *                               type: string
 *                               example: "Math Quiz"
 *                         host:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "64f8a1b2c3d4e5f6a7b8c9d2"
 *                             username:
 *                               type: string
 *                               example: "testuser"
 *                         players:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "64f8a1b2c3d4e5f6a7b8c9d2"
 *                               username:
 *                                 type: string
 *                                 example: "testuser"
 *                         status:
 *                           type: string
 *                           example: "waiting"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Chưa đăng nhập"
 *       404:
 *         description: Room not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Phòng không tồn tại"
 *       400:
 *         description: Room is full or game already started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Phòng đã đầy hoặc game đã bắt đầu"
 */

/**
 * @swagger
 * /room/{roomId}/status:
 *   get:
 *     summary: Get room status and details
 *     tags: [Room]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *         example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *     responses:
 *       200:
 *         description: Room status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     room:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *                         roomCode:
 *                           type: string
 *                           example: "ABC123"
 *                         pin:
 *                           type: string
 *                           example: "123456"
 *                         quiz:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "64f8a1b2c3d4e5f6a7b8c9d1"
 *                             title:
 *                               type: string
 *                               example: "Math Quiz"
 *                             questionCount:
 *                               type: integer
 *                               example: 5
 *                         host:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "64f8a1b2c3d4e5f6a7b8c9d2"
 *                             username:
 *                               type: string
 *                               example: "testuser"
 *                         players:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "64f8a1b2c3d4e5f6a7b8c9d2"
 *                               username:
 *                                 type: string
 *                                 example: "testuser"
 *                               score:
 *                                 type: integer
 *                                 example: 0
 *                         status:
 *                           type: string
 *                           example: "waiting"
 *                         currentQuestion:
 *                           type: integer
 *                           example: 0
 *                         settings:
 *                           type: object
 *                           properties:
 *                             maxPlayers:
 *                               type: integer
 *                               example: 10
 *                             timePerQuestion:
 *                               type: integer
 *                               example: 30
 *       404:
 *         description: Room not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Phòng không tồn tại"
 */

export const roomDocs = {}; 