/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *         username:
 *           type: string
 *           example: "testuser"
 *         email:
 *           type: string
 *           example: "test@example.com"
 *         isVerified:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 */

/**
 * @swagger
 * /user/data:
 *   get:
 *     summary: Get current user data
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *                         username:
 *                           type: string
 *                           example: "testuser"
 *                         email:
 *                           type: string
 *                           example: "test@example.com"
 *                         isVerified:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           example: "2024-01-15T10:30:00.000Z"
 *                         updatedAt:
 *                           type: string
 *                           example: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Unauthorized - User not authenticated
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

export const userDocs = {}; 