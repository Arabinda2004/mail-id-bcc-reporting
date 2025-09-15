# 📧 Email Processing & Analytics Dashboard

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Gmail API](https://img.shields.io/badge/Gmail-API-red?style=for-the-badge&logo=gmail&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

*A comprehensive email processing and analytics platform that integrates with Gmail API to fetch, categorize, analyze, and visualize email data with intelligent tagging and reporting capabilities.*

[📸 View Screenshots](#-screenshots) • [🚀 Quick Start](#-quick-start) • [📡 API Reference](#-api-reference) • [🤝 Contributing](#-contributing)

</div>

---

## 🌟 Features

### 📊 **Dashboard & Analytics**
- **Real-time Statistics**: Live email counts, processing status, and performance metrics
- **Interactive Charts**: Tag distribution visualization with Chart.js integration
- **Advanced Filtering**: Filter emails by date range, tags, sender, subject, and read status
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🔐 **Authentication & Security**
- **Google OAuth Integration**: Secure login with Google accounts
- **Gmail API Integration**: Direct access to user's Gmail data
- **Session Management**: Secure user sessions with Passport.js
- **Environment Protection**: Sensitive data excluded from version control

### 📧 **Email Management**
- **Automated Processing**: Fetch and categorize emails from Gmail
- **Smart Tagging**: Intelligent email classification (Business Lead, Reporting, General)
- **Duplicate Prevention**: Avoid processing the same email multiple times
- **Thread Tracking**: Maintain email thread relationships

### 🎨 **User Experience**
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Dark Mode Support**: Toggle between light and dark themes
- **Mobile Responsive**: Works perfectly on all device sizes
- **Real-time Updates**: Live statistics and processing status

---

## 📸 Screenshots

<div align="center">

### 🏠 Dashboard Overview
![Dashboard](./results/dashboard-overview.png)
*Main dashboard with real-time statistics and email distribution charts*

### 📊 Email Analytics  
![Analytics](./results/analytics-view.png)
*Advanced analytics with tag distribution and processing insights*

### 📧 Email Management
![Email Management](./results/email-management.png)
*Comprehensive email data table with filtering and search*

### ⚙️ Settings Panel
![Settings](./results/settings-panel.png)
*User settings with profile management and preferences*

</div>

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **Gmail Account** for API access
- **Google Cloud Project** with Gmail API enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mail-id-bcc-reporting.git
   cd mail-id-bcc-reporting
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configurations
   nano .env
   ```

5. **Google Cloud Console Setup**
   - Create a new project in [Google Cloud Console](https://console.cloud.google.com)
   - Enable Gmail API
   - Create OAuth 2.0 credentials (Desktop Application)
   - Download credentials as `gmail-credentials.json`
   - Add authorized redirect URIs:
     - `http://localhost:3001/api/auth/google/callback`
     - `http://localhost:3001/api/auth/gmail/callback`

6. **Start the application**
   ```bash
   # Start backend server
   npm start
   
   # In another terminal, start frontend
   cd frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/emailApp
DB_NAME=emailApp

# Server Configuration
PORT=3001
NODE_ENV=development

# Gmail API Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Session Configuration
SESSION_SECRET=your_session_secret_key

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
```

---

## 🏗️ Project Structure

```
emailApp/
├── server.js                    # Express server entry point
├── package.json                 # Backend dependencies
├── .env.example                 # Environment template
├── gmail-credentials.json       # Gmail OAuth credentials
├── src/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── passport.js         # OAuth configuration
│   ├── controllers/
│   │   ├── email.controller.js # Email processing logic
│   │   └── health.controller.js# Health check endpoints
│   ├── models/
│   │   ├── Email.js            # Email schema
│   │   └── email.model.js      # Email model methods
│   ├── routes/
│   │   ├── auth.routes.js      # Authentication routes
│   │   ├── email.routes.js     # Email API routes
│   │   └── index.js            # Route aggregation
│   └── services/
│       └── gmail.service.js    # Gmail API integration
├── frontend/
│   ├── src/
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── main.jsx           # React entry point
│   │   ├── components/
│   │   │   ├── AuthCallback.jsx
│   │   │   ├── EmailDataTable.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── TagDistributionChart.jsx
│   │   └── services/
│   │       └── api.js          # API communication
│   ├── index.html
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
└── results/                   # Application screenshots
```

---

## 📡 API Reference

### Authentication Endpoints
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback handler
- `GET /api/auth/gmail` - Gmail-specific OAuth
- `GET /api/auth/gmail/callback` - Gmail OAuth callback
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout user

### Email Endpoints
- `GET /api/emails` - Get emails with filtering
- `POST /api/emails/process` - Process emails from Gmail
- `GET /api/emails/stats` - Get email statistics

### Health Check
- `GET /api/health` - System health check

---

## 🎨 Email Tagging Logic

The application uses intelligent keyword-based tagging:

### 🏢 Business Lead
- Keywords: `enquiry`, `quote`, `pricing`, `product`, `demo`, `consultation`
- Use case: Sales inquiries, product information requests

### 📊 Reporting  
- Keywords: `report`, `analytics`, `status`, `summary`, `metrics`, `performance`
- Use case: Status updates, analytical reports

### 📬 General
- All other emails that don't match specific categories
- Use case: Personal communications, newsletters, notifications

---

## 🛡️ Security & Privacy

### Data Protection
- **No Email Content Storage**: Only metadata is stored
- **Encrypted Tokens**: OAuth tokens securely managed
- **Session Security**: Secure session handling
- **Environment Variables**: Sensitive data protected

### OAuth Security
- **Minimal Scopes**: Only required Gmail permissions
- **Secure Redirects**: Validated redirect URIs
- **Token Refresh**: Automatic token management

---

## 🧪 Testing

```bash
# Backend tests
npm test

# Frontend tests
cd frontend
npm test
```

---

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/emailApp
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
SESSION_SECRET=your_production_session_secret
FRONTEND_URL=https://yourdomain.com
```

### Build Process
```bash
# Build frontend
cd frontend
npm run build

# Start production server
npm start
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

---

## 📝 License

This project is licensed under the **ISC License**.

---

<div align="center">

**Made with ❤️ by Arabinda**

[⭐ Star this repo](https://github.com/Arabinda2004/mail-id-bcc-reporting) • [🐛 Report Bug](https://github.com/Arabinda2004/mail-id-bcc-reporting/issues) • [💡 Request Feature](https://github.com/Arabinda2004/mail-id-bcc-reporting/issues)

</div>