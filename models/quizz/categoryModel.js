

import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Visual
  icon: {
    type: String,
    default: ""
  },
  
  // Ownership & Access
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Usage stats
  totalQuizzes: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  usageCount: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Tags for search
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for performance
categorySchema.index({ name: 1, isActive: 1 });
categorySchema.index({ createdBy: 1, isPublic: 1 });
categorySchema.index({ isDefault: 1 });

// Method to increment usage count
categorySchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Static method to find public categories
categorySchema.statics.findPublicCategories = function() {
  return this.find({ 
    isPublic: true, 
    isActive: true
  }).sort({ usageCount: -1, name: 1 });
};

// Static method to find default categories
categorySchema.statics.findDefaultCategories = function() {
  return this.find({ 
    isDefault: true, 
    isActive: true 
  }).sort({ name: 1 });
};

// Static method to find user's categories
categorySchema.statics.findUserCategories = function(userId) {
  return this.find({ 
    createdBy: userId, 
    isActive: true 
  }).sort({ updatedAt: -1 });
};

// Static method to find all available categories
categorySchema.statics.findAvailableCategories = function() {
  return this.find({ isActive: true })
    .sort({ isDefault: -1, usageCount: -1, name: 1 });
};

const categoryModel = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default categoryModel;