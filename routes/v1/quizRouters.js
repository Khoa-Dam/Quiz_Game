import express from "express";
import { 
  createQuiz, 
  getAllQuizzes, 
  getQuizForGame, 
  checkAnswer, 
  updateQuiz, 
  deleteQuiz 
} from "../../controllers/quiz/quizController.js";
import userAuth from "../../middleware/userAuth.js";

const quizRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       required:
 *         - text
 *         - options
 *         - correctAnswer
 *       properties:
 *         text:
 *           type: string
 *           description: Question text
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of 4 answer options
 *         correctAnswer:
 *           type: integer
 *           minimum: 0
 *           maximum: 3
 *           description: Index of correct answer (0-3)
 *     Quiz:
 *       type: object
 *       required:
 *         - title
 *         - questions
 *       properties:
 *         title:
 *           type: string
 *           description: Quiz title
 *         description:
 *           type: string
 *           description: Quiz description
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *         timePerQuestion:
 *           type: integer
 *           default: 15
 *           description: Time per question in seconds
 *         scoring:
 *           type: object
 *           properties:
 *             basePoints:
 *               type: integer
 *               default: 100
 *             timeBonus:
 *               type: boolean
 *               default: true
 *             maxTimeBonus:
 *               type: integer
 *               default: 50
 *     CheckAnswer:
 *       type: object
 *       required:
 *         - questionIndex
 *         - selectedAnswer
 *       properties:
 *         questionIndex:
 *           type: integer
 *           description: Index of question (0-based)
 *         selectedAnswer:
 *           type: integer
 *           minimum: 0
 *           maximum: 3
 *           description: Selected answer index
 *         responseTime:
 *           type: integer
 *           description: Response time in milliseconds
 */

/**
 * @swagger
 * /quiz/create:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quiz]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Quiz'
 *     responses:
 *       200:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Quiz'
 *                 message:
 *                   type: string
 */
quizRouter.post("/create", userAuth, createQuiz);

/**
 * @swagger
 * /quiz/all:
 *   get:
 *     summary: Get all active quizzes
 *     tags: [Quiz]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter quizzes by creator
 *     responses:
 *       200:
 *         description: List of quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Quiz'
 *                 message:
 *                   type: string
 */
quizRouter.get("/all", getAllQuizzes);

/**
 * @swagger
 * /quiz/{id}/game:
 *   get:
 *     summary: Get quiz for game (without answers)
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz data for game
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
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     totalQuestions:
 *                       type: integer
 *                     timePerQuestion:
 *                       type: integer
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           index:
 *                             type: integer
 *                           text:
 *                             type: string
 *                           options:
 *                             type: array
 *                             items:
 *                               type: string
 *                 message:
 *                   type: string
 */
quizRouter.get("/:id/game", getQuizForGame);

/**
 * @swagger
 * /quiz/{id}/check-answer:
 *   post:
 *     summary: Check answer for a question
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckAnswer'
 *     responses:
 *       200:
 *         description: Answer check result
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
 *                     isCorrect:
 *                       type: boolean
 *                     correctAnswer:
 *                       type: integer
 *                     points:
 *                       type: integer
 *                     explanation:
 *                       type: string
 */
quizRouter.post("/:id/check-answer", checkAnswer);

/**
 * @swagger
 * /quiz/{id}:
 *   put:
 *     summary: Update quiz
 *     tags: [Quiz]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               timePerQuestion:
 *                 type: integer
 *               scoring:
 *                 type: object
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 */
quizRouter.put("/:id", userAuth, updateQuiz);

/**
 * @swagger
 * /quiz/{id}:
 *   delete:
 *     summary: Delete quiz (soft delete)
 *     tags: [Quiz]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 */
quizRouter.delete("/:id", userAuth, deleteQuiz);

export default quizRouter;