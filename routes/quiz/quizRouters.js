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

// ============ PUBLIC ROUTES ============

quizRouter.get("/all", getAllQuizzes);

quizRouter.get("/:id/game", getQuizForGame);

quizRouter.post("/:id/check-answer", checkAnswer);

// ============ PROTECTED ROUTES ============

quizRouter.post("/create", userAuth, createQuiz);

quizRouter.put("/:id", userAuth, updateQuiz);

quizRouter.delete("/:id", userAuth, deleteQuiz);

export default quizRouter;