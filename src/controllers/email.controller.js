/**
 * Email Controller
 * Handles email processing, retrieval, and statistics
 */

const Email = require('../models/Email');
const gmailService = require('../services/gmail.service');

/**
 * Process emails from Gmail
 * Fetches unread emails, applies tagging logic, and stores in database
 */
const processEmails = async (req, res) => {
  try {
    console.log('🔄 Starting email processing...');
    
    // Get authenticated Gmail client
    const gmail = await gmailService.getAuthenticatedClient();
    
    // Fetch recent messages from inbox (both read and unread)
    const query = 'in:inbox';
    
    console.log(`📧 Fetching recent emails from inbox...`);
    
    const messagesResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 50
    });
    
    const messages = messagesResponse.data.messages || [];
    console.log(`📬 Found ${messages.length} recent messages`);
    
    if (messages.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No emails found in inbox',
        processed: 0,
        skipped: 0
      });
    }
    
    let processed = 0;
    let skipped = 0;
    const errors = [];
    
    // Process each message
    for (const message of messages) {
      try {
        // Check if message already exists in database
        const exists = await Email.messageExists(message.id);
        if (exists) {
          console.log(`⏭️  Skipping duplicate message: ${message.id}`);
          skipped++;
          continue;
        }
        
        // Get full message details
        const messageDetails = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });
        
        const msg = messageDetails.data;
        const headers = msg.payload.headers;
        
        // Extract email data
        const sender = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const receivedDate = new Date(parseInt(msg.internalDate));
        
        // Extract body snippet
        let bodySnippet = msg.snippet || '';
        if (bodySnippet.length > 500) {
          bodySnippet = bodySnippet.substring(0, 500) + '...';
        }
        
        // Create email document and determine tag
        const email = new Email({
          messageId: message.id,
          sender: sender,
          subject: subject,
          bodySnippet: bodySnippet,
          receivedAt: receivedDate,
          threadId: msg.threadId
        });
        
        // Apply tagging logic
        email.determineTag();
        
        // Save to database
        await email.save();
        console.log(`✅ Processed email: ${subject} (Tag: ${email.tag})`);
        
        processed++;
        
      } catch (error) {
        console.error(`❌ Error processing message ${message.id}:`, error.message);
        errors.push({
          messageId: message.id,
          error: error.message
        });
      }
    }
    
    console.log(`🎉 Email processing completed. Processed: ${processed}, Skipped: ${skipped}`);
    
    res.status(200).json({
      success: true,
      message: 'Email processing completed',
      processed,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('❌ Email processing failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Email processing failed',
      error: error.message
    });
  }
};

/**
 * Get emails with filtering and pagination
 */
const getEmails = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      tag,
      startDate,
      endDate,
      sender
    } = req.query;
    
    // Build filter query
    const filter = {};
    
    if (tag && tag !== 'all') {
      filter.tag = tag;
    }
    
    if (startDate || endDate) {
      filter.receivedAt = {};
      if (startDate) {
        filter.receivedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.receivedAt.$lte = new Date(endDate);
      }
    }
    
    if (sender) {
      filter.sender = { $regex: sender, $options: 'i' };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const emails = await Email.find(filter)
      .sort({ receivedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const total = await Email.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: emails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching emails:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emails',
      error: error.message
    });
  }
};

/**
 * Get email statistics
 */
const getEmailStats = async (req, res) => {
  try {
    const stats = await Email.getStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Error fetching email stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email statistics',
      error: error.message
    });
  }
};

/**
 * Manual email tagging update
 */
const updateEmailTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag } = req.body;
    
    if (!['Business Lead', 'Reporting', 'General'].includes(tag)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tag. Must be one of: Business Lead, Reporting, General'
      });
    }
    
    const email = await Email.findByIdAndUpdate(
      id,
      { tag },
      { new: true }
    );
    
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Email tag updated successfully',
      data: email
    });
    
  } catch (error) {
    console.error('❌ Error updating email tag:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update email tag',
      error: error.message
    });
  }
};

module.exports = {
  processEmails,
  getEmails,
  getEmailStats,
  updateEmailTag
};
