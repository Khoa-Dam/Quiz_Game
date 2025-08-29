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
 *           example: "What is 2 + 2?"
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of 4 answer options
 *           example: ["3", "4", "5", "6"]
 *         correctAnswer:
 *           type: integer
 *           minimum: 0
 *           maximum: 3
 *           description: Index of correct answer (0-3)
 *           example: 1
 *         timeLimit:
 *           type: integer
 *           description: Time limit for this question in seconds
 *           example: 30
 *     Quiz:
 *       type: object
 *       required:
 *         - title
 *         - questions
 *       properties:
 *         title:
 *           type: string
 *           description: Quiz title
 *           example: "Math Quiz"
 *         description:
 *           type: string
 *           description: Quiz description
 *           example: "A simple math quiz for testing"
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *         timePerQuestion:
 *           type: integer
 *           default: 15
 *           description: Time per question in seconds
 *           example: 30
 *         scoring:
 *           type: object
 *           properties:
 *             basePoints:
 *               type: integer
 *               default: 100
 *               example: 100
 *             timeBonus:
 *               type: boolean
 *               default: true
 *               example: true
 *             maxTimeBonus:
 *               type: integer
 *               default: 50
 *               example: 50
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
 *           examples:
 *             createQuizExample:
 *               summary: Create Math Quiz
 *               description: Example for creating a math quiz
 *               value:
 *                 title: "Math Quiz"
 *                 description: "A simple math quiz for testing"
 *                 questions:
 *                   - text: "What is 2 + 2?"
 *                     options: ["3", "4", "5", "6"]
 *                     correctAnswer: 1
 *                     timeLimit: 30
 *                   - text: "What is 5 x 5?"
 *                     options: ["20", "25", "30", "35"]
 *                     correctAnswer: 1
 *                     timeLimit: 30
 *                 timePerQuestion: 30
 *                 scoring:
 *                   basePoints: 100
 *                   timeBonus: true
 *                   maxTimeBonus: 50
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tạo quiz thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     quiz:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *                         title:
 *                           type: string
 *                           example: "Math Quiz"
 *                         description:
 *                           type: string
 *                           example: "A simple math quiz for testing"
 *                         questions:
 *                           type: array
 *                           items:
 *                             type: object
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *                       title:
 *                         type: string
 *                         example: "Math Quiz"
 *                       description:
 *                         type: string
 *                         example: "A simple math quiz for testing"
 *                       questionCount:
 *                         type: integer
 *                         example: 2
 *                       createdAt:
 *                         type: string
 *                         example: "2024-01-15T10:30:00.000Z"
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
 *         example: "64f8a1b2c3d4e5f6a7b8c9d0"
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     quiz:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *                         title:
 *                           type: string
 *                           example: "Math Quiz"
 *                         description:
 *                           type: string
 *                           example: "A simple math quiz for testing"
 *                         questions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "64f8a1b2c3d4e5f6a7b8c9d1"
 *                               text:
 *                                 type: string
 *                                 example: "What is 2 + 2?"
 *                               options:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                                 example: ["3", "4", "5", "6"]
 *                               timeLimit:
 *                                 type: integer
 *                                 example: 30
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
 *         example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckAnswer'
 *           examples:
 *             checkAnswerExample:
 *               summary: Check Answer
 *               description: Example for checking an answer
 *               value:
 *                 questionId: "64f8a1b2c3d4e5f6a7b8c9d1"
 *                 selectedAnswer: "A"
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     isCorrect:
 *                       type: boolean
 *                       example: false
 *                     correctAnswer:
 *                       type: string
 *                       example: "B"
 *                     points:
 *                       type: integer
 *                       example: 85
 *       400:
 *         description: Invalid request
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
 *                   example: "Dữ liệu không hợp lệ"
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
 *         example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Math Quiz"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               timePerQuestion:
 *                 type: integer
 *                 example: 45
 *               scoring:
 *                 type: object
 *                 properties:
 *                   basePoints:
 *                     type: integer
 *                     example: 150
 *                   timeBonus:
 *                     type: boolean
 *                     example: true
 *                   maxTimeBonus:
 *                     type: integer
 *                     example: 75
 *           examples:
 *             updateQuizExample:
 *               summary: Update Quiz
 *               description: Example for updating a quiz
 *               value:
 *                 title: "Updated Math Quiz"
 *                 description: "Updated description"
 *                 timePerQuestion: 45
 *                 scoring:
 *                   basePoints: 150
 *                   timeBonus: true
 *                   maxTimeBonus: 75
 *     responses:
 *       200:
 *         description: Quiz updated successfully
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
 *                   example: "Cập nhật quiz thành công"
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
 *         example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
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
 *                   example: "Xóa quiz thành công"
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

export const quizDocs = {}; 