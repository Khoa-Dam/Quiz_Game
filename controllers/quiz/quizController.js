import { quizService } from "../../services/quiz/quizService.js";
import { validateQuizCreation } from "../../utils/validationUtils.js";

export const createQuiz = async (req, res) => {
  try {
    const { title, description, questions, timePerQuestion, scoring } = req.body;
    const userId = req.user?.id;
    
    // Validation
    const validationErrors = validateQuizCreation({ title, questions });
    if (validationErrors.length > 0) {
      return res.json({
        success: false,
        message: validationErrors.join(', ')
      });
    }
    
    // Service call
    const result = await quizService.createQuiz({
      title, description, questions, timePerQuestion, createdBy: userId, scoring
    });
    
    return res.json({
      success: true,
      data: result.quiz,
      message: result.message
    });
    
  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    });
  }
};

export const getAllQuizzes = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Service call
    const result = await quizService.getAllActiveQuizzes(userId);
    
    return res.json({
      success: true,
      data: result.quizzes,
      message: result.message
    });
    
  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    });
  }
};

export const getQuizForGame = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Service call
    const result = await quizService.getQuizForGame(id);
    
    return res.json({
      success: true,
      data: result.gameQuiz,
      message: result.message
    });
    
  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    });
  }
};

export const checkAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIndex, selectedAnswer, responseTime } = req.body;
    
    // Service call
    const result = await quizService.checkAnswer(id, questionIndex, selectedAnswer, responseTime);
    
    return res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // Service call
    const result = await quizService.updateQuiz(id, req.body, userId);
    
    return res.json({
      success: true,
      data: result.quiz,
      message: result.message
    });
    
  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // Service call
    const result = await quizService.deleteQuiz(id, userId);
    
    return res.json({
      success: true,
      message: result.message
    });
    
  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    });
  }
};