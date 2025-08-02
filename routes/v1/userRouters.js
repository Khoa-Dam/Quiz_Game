import express from "express";
import userAuth from "../../middleware/userAuth.js";
import getUserData from "../../controllers/user/userController.js";

const userRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserData:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         isAccountVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *                 data:
 *                   $ref: '#/components/schemas/UserData'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - User not authenticated
 */
userRouter.get("/data", userAuth, getUserData);

export default userRouter;