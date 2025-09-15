const express = require('express');
const passport = require('../config/passport');
const router = express.Router();

// Google OAuth login
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.modify'] 
    })
);

// Google OAuth callback
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication
        const user = {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            picture: req.user.picture,
            provider: req.user.provider
        };
        
        // Redirect to frontend with user data
        const userData = encodeURIComponent(JSON.stringify(user));
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5174'}/auth/callback?user=${userData}`);
    }
);

// Logout route
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Session destruction failed' });
            }
            res.clearCookie('connect.sid');
            res.json({ message: 'Logged out successfully' });
        });
    });
});

// Gmail API OAuth routes (separate from user authentication)
const gmailService = require('../services/gmail.service');

// Gmail OAuth initiation
router.get('/gmail', async (req, res) => {
    try {
        const authUrl = await gmailService.getAuthUrl();
        res.redirect(authUrl);
    } catch (error) {
        res.status(500).json({ error: 'Failed to initiate Gmail OAuth' });
    }
});

// Gmail OAuth callback - handles the authorization code
router.get('/gmail/callback', async (req, res) => {
    try {
        const { code, error } = req.query;
        
        if (error) {
            return res.status(400).json({ error: 'OAuth authorization failed', details: error });
        }
        
        if (!code) {
            return res.status(400).json({ error: 'Authorization code not received' });
        }
        
        // Exchange code for tokens
        const tokens = await gmailService.getAccessToken(code);
        
        // Test the Gmail connection
        await gmailService.getAuthenticatedClient();
        
        // Redirect to frontend with success message
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/?gmail_auth=success`);
        
    } catch (error) {
        console.error('Gmail OAuth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/?gmail_auth=error&message=${encodeURIComponent(error.message)}`);
    }
});

// Get current user
router.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

module.exports = router;
