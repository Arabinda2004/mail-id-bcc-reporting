/**
 * Email Model
 * Mongoose schema for storing processed email data
 */

const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  // Gmail message ID - unique identifier from Gmail API
  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Email sender information
  sender: {
    type: String,
    required: true,
    trim: true
  },
  
  // Email subject line
  subject: {
    type: String,
    required: true,
    trim: true
  },
  
  // Brief snippet of email body content
  bodySnippet: {
    type: String,
    required: true,
    trim: true
  },
  
  // Date when email was received
  receivedAt: {
    type: Date,
    required: true,
    index: true
  },
  
  // Automated tag based on content analysis
  tag: {
    type: String,
    required: true,
    enum: ['Business Lead', 'Reporting', 'General'],
    default: 'General'
  },
  
  // Processing metadata
  processedAt: {
    type: Date,
    default: Date.now
  },
  
  // Original Gmail thread ID for reference
  threadId: {
    type: String,
    required: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
emailSchema.index({ receivedAt: -1 }); // For date-based queries
emailSchema.index({ tag: 1 }); // For tag filtering
emailSchema.index({ sender: 1 }); // For sender filtering
emailSchema.index({ processedAt: -1 }); // For recent processing queries

// Virtual for formatting received date
emailSchema.virtual('formattedReceivedAt').get(function() {
  return this.receivedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Static method to get email statistics
emailSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$tag',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const total = await this.countDocuments();
  
  // Format stats for frontend consumption
  const formattedStats = {
    total,
    byTag: {
      'Business Lead': 0,
      'Reporting': 0,
      'General': 0
    }
  };
  
  stats.forEach(stat => {
    formattedStats.byTag[stat._id] = stat.count;
  });
  
  return formattedStats;
};

// Static method to check if message already exists
emailSchema.statics.messageExists = async function(messageId) {
  const count = await this.countDocuments({ messageId });
  return count > 0;
};

// Instance method to determine tag based on content
emailSchema.methods.determineTag = function() {
  const content = `${this.subject} ${this.bodySnippet}`.toLowerCase();
  
  // Business Lead keywords
  const businessKeywords = ['enquiry', 'product', 'pricing', 'quote', 'purchase', 'buy'];
  
  // Reporting keywords  
  const reportingKeywords = ['report', 'status', 'update', 'summary', 'analytics'];
  
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

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
