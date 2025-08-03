/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         roomCode:
 *           type: string
 *         quiz:
 *           type: string
 *         host:
 *           type: string
 *         players:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [waiting, playing, paused, finished]
 *         settings:
 *           $ref: '#/components/schemas/RoomSettings'
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
 *     responses:
 *       200:
 *         description: Room created successfully
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
 *     responses:
 *       200:
 *         description: Successfully joined room
 */

/**
 * @swagger
 * /room/{roomId}/status:
 *   get:
 *     summary: Get room status and details
 *     tags: [Room]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room status
 */

export const roomDocs = {}; 