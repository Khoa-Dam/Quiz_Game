import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  // Basic info
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Visual - chỉ lưu URL
  coverImage: {
    type: String,
    default: ""
  },
  
  // Category
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  
  // Questions
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  questionCount: {
    type: Number,
    default: 0
  },
  
  // Quiz settings
  timePerQuestion: {
    type: Number,
    default: 30 // seconds
  },
  pointsPerQuestion: {
    type: Number,
    default: 1000
  },
  randomizeQuestions: {
    type: Boolean,
    default: true
  },
  randomizeAnswers: {
    type: Boolean,
    default: true
  },
  showCorrectAnswer: {
    type: Boolean,
    default: true
  },
  showExplanation: {
    type: Boolean,
    default: false
  },
  
  // Access control
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
  originalQuiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  
  // Usage stats
  playCount: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isDraft: {
    type: Boolean,
    default: true
  },
  
  // Tags & Search
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for performance
quizSchema.index({ createdBy: 1, category: 1 });
quizSchema.index({ isPublic: 1, isActive: 1 });
quizSchema.index({ tags: 1 });
quizSchema.index({ playCount: -1 });

// Pre-save middleware to update questionCount
quizSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.questionCount = this.questions.length;
  }
  next();
});

// Method to increment play count
quizSchema.methods.incrementPlayCount = function() {
  this.playCount += 1;
  return this.save();
};

// Static method to find public quizzes
quizSchema.statics.findPublicQuizzes = function(categoryId = null) {
  const query = { isPublic: true, isActive: true };
  if (categoryId) {
    query.category = categoryId;
  }
  return this.find(query).populate('category createdBy', 'name email');
};

// Static method to find user's quizzes
quizSchema.statics.findUserQuizzes = function(userId) {
  return this.find({ createdBy: userId, isActive: true })
    .populate('category', 'name')
    .sort({ updatedAt: -1 });
};

// Static method to find all available quizzes for playing
quizSchema.statics.findAvailableQuizzes = function() {
  return this.find({ 
    isActive: true, 
    isDraft: false,
    questionCount: { $gte: 1 }
  })
  .populate('category', 'name')
  .populate('createdBy', 'name')
  .sort({ playCount: -1, createdAt: -1 });
};

const quizModel = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);

export default quizModel;

