// File: models/quiz/questionModel.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
        max: 3
    }
}, {
    timestamps: true
});

// Validation ở đây, không phải ở Quiz
questionSchema.pre('save', function(next) {
    if (this.options.length !== 4) {
        return next(new Error('Mỗi câu hỏi phải có đúng 4 lựa chọn'));
    }
    if (this.correctAnswer < 0 || this.correctAnswer > 3) {
        return next(new Error('Đáp án đúng phải từ 0 đến 3'));
    }
    next();
});

export default mongoose.model("Question", questionSchema);