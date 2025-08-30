import mongoose from 'mongoose';

const quizModel = new mongoose.Schema({
    title: { type: String, required: true, trim: true},
    description: {type: String, default: ""},
    questions: [{type: mongoose.Schema.Types.ObjectId, ref: "Question"}],
    timePerQuestion: {type: Number, default: 15, min: 5, max: 60},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    isActive: {type: Boolean, default: true},
    scoring: {
        basePoints: {type: Number, default: 100, min: 1, max: 1000},
        timeBonus: {type: Boolean, default: true},
        maxTimeBonus: {type: Number, default: 50, min: 0, max: 500},
        penaltyForWrong: {type: Boolean, default: false},
        wrongAnswerPenalty: {type: Number, default: 0, min: 0, max: 100},
    }
})

export default mongoose.model("Quiz", quizModel);