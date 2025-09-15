const express = require('express');
const { healthCheck } = require('../controllers/health.controller');
const emailRoutes = require('./email.routes');
const authRoutes = require('./auth.routes');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', healthCheck);

/**
 * Authentication routes
 */
router.use('/auth', authRoutes);

/**
 * Email-related routes
 */
router.use('/emails', emailRoutes);

module.exports = router;
