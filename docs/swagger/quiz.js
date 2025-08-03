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
 */

/**
 * @swagger
 * /quiz/all:
 *   get:
 *     summary: Get all active quizzes
 *     tags: [Quiz]
 *     responses:
 *       200:
 *         description: List of quizzes
 */

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
 */

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
 */

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

export const quizDocs = {}; 