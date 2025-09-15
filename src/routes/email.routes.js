const express = require('express');
const {
  processEmails,
  getEmails,
  getEmailStats,
  updateEmailTag
} = require('../controllers/email.controller');

const router = express.Router();

/**
 * @route   POST /api/emails/process
 * @desc    Process emails from Gmail
 * @access  Public
 */
router.post('/process', processEmails);

/**
 * @route   GET /api/emails
 * @desc    Get emails with filtering and pagination
 * @access  Public
 * @query   page, limit, tag, startDate, endDate, sender
 */
router.get('/', getEmails);

/**
 * @route   GET /api/emails/stats
 * @desc    Get email statistics
 * @access  Public
 */
router.get('/stats', getEmailStats);

/**
 * @route   PUT /api/emails/:id/tag
 * @desc    Update email tag
 * @access  Public
 */
router.put('/:id/tag', updateEmailTag);

module.exports = router;
