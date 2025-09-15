import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, ExternalLink } from 'lucide-react';

const SetupWizard = ({ onClose }) => {
  const [checks, setChecks] = useState({
    backend: 'checking',
    mongodb: 'checking',
    gmail: 'checking'
  });

  useEffect(() => {
    runHealthChecks();
  }, []);

  const runHealthChecks = async () => {
    // Check backend connection
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      setChecks(prev => ({
        ...prev,
        backend: data.status === 'ok' ? 'success' : 'error'
      }));
    } catch (error) {
      setChecks(prev => ({ ...prev, backend: 'error' }));
    }

    // Check MongoDB (via stats endpoint)
    try {
      const response = await fetch('http://localhost:3001/api/emails/stats');
      const data = await response.json();
      setChecks(prev => ({
        ...prev,
        mongodb: data.success ? 'success' : 'error'
      }));
    } catch (error) {
      setChecks(prev => ({ ...prev, mongodb: 'error' }));
    }

    // Check Gmail API (try to process - will fail if not configured but that's expected)
    try {
      const response = await fetch('http://localhost:3001/api/emails/process', {
        method: 'POST'
      });
      // If we get any response, Gmail service is at least loaded
      setChecks(prev => ({ ...prev, gmail: 'warning' }));
    } catch (error) {
      setChecks(prev => ({ ...prev, gmail: 'error' }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const allChecksComplete = Object.values(checks).every(status => 
    status === 'success' || status === 'warning'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Setup Wizard</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-600 mt-1">
            Let's check your system status and help you get started
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* System Checks */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            
            {/* Backend Check */}
            <div className={`p-4 border rounded-lg ${getStatusColor(checks.backend)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(checks.backend)}
                  <span className="ml-3 font-medium">Backend Server</span>
                </div>
                <span className="text-sm text-gray-600">Port 5000</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {checks.backend === 'success' 
                  ? 'Express server is running and accessible'
                  : checks.backend === 'error'
                  ? 'Backend server is not responding. Run: npm run dev'
                  : 'Checking backend connection...'
                }
              </p>
            </div>

            {/* MongoDB Check */}
            <div className={`p-4 border rounded-lg ${getStatusColor(checks.mongodb)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(checks.mongodb)}
                  <span className="ml-3 font-medium">MongoDB Database</span>
                </div>
                <span className="text-sm text-gray-600">Connection</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {checks.mongodb === 'success' 
                  ? 'Database connected and ready'
                  : checks.mongodb === 'error'
                  ? 'Database connection failed. Check MongoDB is running'
                  : 'Checking database connection...'
                }
              </p>
            </div>

            {/* Gmail API Check */}
            <div className={`p-4 border rounded-lg ${getStatusColor(checks.gmail)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(checks.gmail)}
                  <span className="ml-3 font-medium">Gmail API</span>
                </div>
                <span className="text-sm text-gray-600">OAuth2</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {checks.gmail === 'warning' 
                  ? 'Gmail service loaded. Configure credentials.json for full functionality'
                  : checks.gmail === 'error'
                  ? 'Gmail service not available. Check backend configuration'
                  : 'Checking Gmail API service...'
                }
              </p>
            </div>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Setup Guide</h3>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  1
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Start Backend Server</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                    npm run dev
                  </code>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  2
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Configure Environment</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Copy .env.example to .env and configure MongoDB URI
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  3
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Setup Gmail API (Optional)</p>
                  <p className="text-sm text-gray-600 mt-1">
                    For email processing: configure credentials.json from Google Cloud Console
                  </p>
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mt-2"
                  >
                    Open Google Cloud Console
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              onClick={runHealthChecks}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Recheck Status
            </button>
            
            <div className="flex space-x-3">
              <a
                href="https://github.com/your-repo/QUICKSTART.md"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Full Guide
              </a>
              <button
                onClick={onClose}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  allChecksComplete
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {allChecksComplete ? 'Get Started' : 'Continue Anyway'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
