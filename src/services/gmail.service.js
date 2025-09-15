

const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');

// Gmail API scope - allows reading and modifying Gmail messages
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];

// Paths for credentials and token files
const CREDENTIALS_PATH = process.env.GMAIL_CREDENTIALS_PATH || './gmail-credentials.json';
const TOKEN_PATH = process.env.GMAIL_TOKEN_PATH || './gmail-token.json';

class GmailService {
  constructor() {
    this.oauth2Client = null;
    this.gmail = null;
  }

  /**
   * Load OAuth2 credentials from credentials.json file
   * @returns {Object} OAuth2 credentials
   */
  async loadCredentials() {
    try {
      const content = await fs.readFile(CREDENTIALS_PATH);
      return JSON.parse(content);
    } catch (error) {
      console.error('Error loading gmail-credentials.json:');
      console.error('1. Make sure you have downloaded desktop application credentials from Google Cloud Console');
      console.error('2. Place it in the project root directory as gmail-credentials.json');
      console.error('3. Run: node setup-gmail-oauth.js to authorize');
      throw new Error('Unable to load gmail-credentials.json file');
    }
  }

  /**
   * Create OAuth2 client with credentials
   * @returns {google.auth.OAuth2} OAuth2 client
   */
  async createOAuth2Client() {
    const credentials = await this.loadCredentials();
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    
    // Use the backend callback URL that matches your auth routes
    const redirectUri = 'http://localhost:3001/api/auth/google/callback';
    
    this.oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirectUri
    );
    
    return this.oauth2Client;
  }

  /**
   * Generate authorization URL for OAuth2 flow
   * @returns {string} Authorization URL
   */
  async getAuthUrl() {
    if (!this.oauth2Client) {
      await this.createOAuth2Client();
    }

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('\n🔐 Gmail API Authorization Required');
    console.log('📋 Follow these steps:');
    console.log('1. Open this URL in your browser:');
    console.log(`   ${authUrl}`);
    console.log('2. Grant permission to your application');
    console.log('3. Copy the authorization code from the browser');
    console.log('4. Use the getAccessToken(code) function with the code\n');

    return authUrl;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code Authorization code from OAuth2 flow
   * @returns {Object} Token information
   */
  async getAccessToken(code) {
    if (!this.oauth2Client) {
      await this.createOAuth2Client();
    }

    try {
      // Try the newer getToken method first
      let response;
      try {
        response = await this.oauth2Client.getToken(code);
      } catch (e) {
        // Fallback to older getAccessToken method
        response = await this.oauth2Client.getAccessToken(code);
      }
      
      // Handle different response formats from google-auth-library
      let tokens;
      if (response && response.tokens) {
        tokens = response.tokens;
      } else if (response) {
        tokens = response;
      } else {
        throw new Error('No tokens received from OAuth2 flow');
      }
      
      this.oauth2Client.setCredentials(tokens);

      // Save token to file for future use
      await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
      console.log('✅ Token saved successfully to', TOKEN_PATH);
      
      return tokens;
    } catch (error) {
      console.error('❌ Error retrieving access token:', error.message);
      throw error;
    }
  }

  /**
   * Load existing token from file
   * @returns {Object|null} Token object or null if not found
   */
  async loadToken() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get authenticated Gmail client
   * @returns {google.gmail} Authenticated Gmail API client
   */
  async getAuthenticatedClient() {
    if (!this.oauth2Client) {
      await this.createOAuth2Client();
    }

    // Try to load existing token
    const token = await this.loadToken();
    
    if (!token) {
      console.log('\n⚠️  No token found. Authorization required.');
      await this.getAuthUrl();
      throw new Error('Authorization required. Please follow the authorization steps above.');
    }

    // Set credentials and create Gmail client
    this.oauth2Client.setCredentials(token);
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    // Test the connection
    try {
      await this.gmail.users.getProfile({ userId: 'me' });
      console.log('✅ Gmail API authenticated successfully');
      return this.gmail;
    } catch (error) {
      if (error.code === 401) {
        console.log('🔄 Token expired or invalid. Re-authorization required.');
        await fs.unlink(TOKEN_PATH).catch(() => {}); // Delete invalid token
        await this.getAuthUrl();
        throw new Error('Token expired. Please re-authorize.');
      }
      throw error;
    }
  }

  /**
   * Get Gmail client instance (wrapper method)
   * @returns {google.gmail} Gmail API client
   */
  async getGmail() {
    if (!this.gmail) {
      await this.getAuthenticatedClient();
    }
    return this.gmail;
  }
}

// Export singleton instance
module.exports = new GmailService();
