import express from "express";
import { createRoom, joinRoom, getRoomStatus } from "../../controllers/room/roomController.js";
import userAuth from "../../middleware/userAuth.js";

const roomRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RoomSettings:
 *       type: object
 *       properties:
 *         maxPlayers:
 *           type: integer
 *           default: 10
 *           minimum: 2
 *           maximum: 20
 *           description: Maximum number of players
 *         timePerQuestion:
 *           type: integer
 *           default: 30
 *           description: Time per question in seconds
 *         autoStart:
 *           type: boolean
 *           default: false
 *           description: Auto start when enough players
 *         showLeaderboard:
 *           type: boolean
 *           default: true
 *           description: Show leaderboard during game
 *     CreateRoom:
 *       type: object
 *       required:
 *         - quizId
 *       properties:
 *         quizId:
 *           type: string
 *           description: ID of the quiz to play
 *         settings:
 *           $ref: '#/components/schemas/RoomSettings'
 *     JoinRoom:
 *       type: object
 *       required:
 *         - roomCode
 *       properties:
 *         roomCode:
 *           type: string
 *           description: 6-character room code
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     roomId:
 *                       type: string
 *                     roomCode:
 *                       type: string
 *                     quizTitle:
 *                       type: string
 *                 message:
 *                   type: string
 */
roomRouter.post("/create", userAuth, createRoom);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *                 message:
 *                   type: string
 */
roomRouter.post("/join", userAuth, joinRoom);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *                 message:
 *                   type: string
 */
roomRouter.get("/:roomId/status", userAuth, getRoomStatus);

export default roomRouter;