import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  // Content
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false'],
    default: 'multiple-choice'
  },
  
  // Media - chỉ lưu URL
  questionImage: {
    type: String,
    default: ""
  },
  
  // Answers
  answers: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  
  // Question settings
  timeLimit: {
    type: Number,
    default: 30 // seconds
  },
  points: {
    type: Number,
    default: 1000 // base points
  },
  
  // Category & Tags
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Ownership & Access
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true // Default public cho multiplayer
  },
  isFromBank: {
    type: Boolean,
    default: false
  },
  originalQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  
  // Usage & Stats
  usageCount: {
    type: Number,
    default: 0
  },
  averageCorrectRate: {
    type: Number,
    default: 0
  },
  totalAnswers: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Explanation
  explanation: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for performance
questionSchema.index({ createdBy: 1, category: 1 });
questionSchema.index({ isPublic: 1, isActive: 1 });
questionSchema.index({ category: 1 });
questionSchema.index({ tags: 1 });

// Virtual to get correct answer
questionSchema.virtual('correctAnswer').get(function() {
  return this.answers.find(answer => answer.isCorrect);
});

// Method to update stats after someone answers
questionSchema.methods.updateStats = function(isCorrect) {
  this.totalAnswers += 1;
  if (isCorrect) {
    this.correctAnswers += 1;
  }
  
  // Calculate new average
  this.averageCorrectRate = (this.correctAnswers / this.totalAnswers) * 100;
  
  return this.save();
};

// Method to increment usage count
questionSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Method to validate answers (ensure at least one correct answer)
questionSchema.methods.validateAnswers = function() {
  const correctAnswers = this.answers.filter(answer => answer.isCorrect);
  
  if (this.questionType === 'true-false') {
    return this.answers.length === 2 && correctAnswers.length === 1;
  } else {
    return this.answers.length >= 2 && correctAnswers.length >= 1;
  }
};

// Pre-save validation
questionSchema.pre('save', function(next) {
  if (this.isModified('answers')) {
    if (!this.validateAnswers()) {
      return next(new Error('Invalid answers configuration'));
    }
  }
  next();
});

// Static method to find public questions
questionSchema.statics.findPublicQuestions = function(categoryId = null) {
  const query = { isPublic: true, isActive: true };
  
  if (categoryId) {
    query.category = categoryId;
  }
  
  return this.find(query).populate('category', 'name');
};

// Static method to find user's questions
questionSchema.statics.findUserQuestions = function(userId) {
  return this.find({ createdBy: userId, isActive: true })
    .populate('category', 'name')
    .sort({ updatedAt: -1 });
};

// Static method to find questions by category
questionSchema.statics.findByCategory = function(categoryId) {
  return this.find({ 
    category: categoryId, 
    isActive: true 
  }).sort({ createdAt: -1 });
};

// Static method to get random questions for quiz
questionSchema.statics.getRandomQuestions = function(categoryId, count = 10) {
  const matchStage = {
    category: new mongoose.Types.ObjectId(categoryId),
    isActive: true
  };
  
  return this.aggregate([
    { $match: matchStage },
    { $sample: { size: count } },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: '$category' }
  ]);
};

const questionModel = mongoose.models.Question || mongoose.model('Question', questionSchema);

export default questionModel; 