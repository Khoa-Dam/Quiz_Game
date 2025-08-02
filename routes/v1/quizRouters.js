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

quizRouter.post("/create", userAuth, createQuiz);
quizRouter.get("/all", getAllQuizzes);
quizRouter.get("/:id/game", getQuizForGame);
quizRouter.post("/:id/check-answer", checkAnswer);
quizRouter.put("/:id", userAuth, updateQuiz);
quizRouter.delete("/:id", userAuth, deleteQuiz);

export default quizRouter;