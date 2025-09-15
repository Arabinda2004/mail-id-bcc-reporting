const mongoose = require('mongoose');

/**
 * Email Schema
 * Represents an email record with metadata and classification
 */
const emailSchema = new mongoose.Schema({
  // Gmail API message ID
  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Thread ID from Gmail
  threadId: {
    type: String,
    required: true,
    index: true
  },
  
  // Email metadata
  sender: {
    type: String,
    required: true,
    index: true
  },
  
  subject: {
    type: String,
    required: true
  },
  
  bodySnippet: {
    type: String,
    required: true
  },
  
  // Full email body (optional)
  body: {
    type: String,
    default: ''
  },
  
  // Email classification tag
  tag: {
    type: String,
    enum: ['Business Lead', 'Reporting', 'General'],
    default: 'General',
    index: true
  },
  
  // Timestamps
  receivedAt: {
    type: Date,
    required: true,
    index: true
  },
  
  processedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Additional metadata
  hasAttachments: {
    type: Boolean,
    default: false
  },
  
  labels: [{
    type: String
  }],
  
  // Raw Gmail data (for debugging)
  rawData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
emailSchema.index({ receivedAt: -1 });
emailSchema.index({ tag: 1, receivedAt: -1 });
emailSchema.index({ sender: 1, receivedAt: -1 });

// Virtual for formatted date
emailSchema.virtual('formattedDate').get(function() {
  return this.receivedAt ? this.receivedAt.toISOString() : '';
});

// Static methods
emailSchema.statics.getStatistics = async function() {
  const total = await this.countDocuments();
  const byTag = await this.aggregate([
    {
      $group: {
        _id: '$tag',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const tagStats = {};
  byTag.forEach(item => {
    tagStats[item._id] = item.count;
  });
  
  return {
    total,
    byTag: tagStats
  };
};

// Static method to check if message already exists
emailSchema.statics.messageExists = async function(messageId) {
  const count = await this.countDocuments({ messageId });
  return count > 0;
};

// Alias for getStatistics method to match controller usage
emailSchema.statics.getStats = function() {
  return this.getStatistics();
};

// Instance methods
emailSchema.methods.updateTag = function(newTag) {
  this.tag = newTag;
  return this.save();
};

// Instance method to determine tag based on content
emailSchema.methods.determineTag = function() {
  const content = `${this.subject} ${this.bodySnippet}`.toLowerCase();
  
  // Business Lead keywords
  const businessKeywords = ['enquiry', 'inquiry', 'product', 'pricing', 'quote', 'purchase', 'buy', 'sale', 'order', 'demo', 'trial'];
  
  // Reporting keywords  
  const reportingKeywords = ['report', 'status', 'update', 'summary', 'analytics', 'metrics', 'dashboard', 'statistics'];
  
  // Check for business lead keywords
  if (businessKeywords.some(keyword => content.includes(keyword))) {
    this.tag = 'Business Lead';
    return this.tag;
  }
  
  // Check for reporting keywords
  if (reportingKeywords.some(keyword => content.includes(keyword))) {
    this.tag = 'Reporting';
    return this.tag;
  }
  
  // Default to General
  this.tag = 'General';
  return this.tag;
};

module.exports = mongoose.model('Email', emailSchema);
