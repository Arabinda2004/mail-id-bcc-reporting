import React, { useState, useEffect } from 'react';
import { Mail, BarChart3, Settings, Home, Activity, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import StatCard from './components/StatCard';
import TagDistributionChart from './components/TagDistributionChart';
import EmailDataTable from './components/EmailDataTable';
import SetupWizard from './components/SetupWizard';
import { emailAPI } from './services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  useEffect(() => {
    fetchStats();
    // Show setup wizard on first load if no data
    const hasSeenWizard = localStorage.getItem('hasSeenSetupWizard');
    if (!hasSeenWizard) {
      setShowSetupWizard(true);
    }
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await emailAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      showNotification('Error fetching statistics. Please check your backend connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const processEmails = async () => {
    try {
      setIsProcessing(true);
      showNotification('Processing emails...', 'info');
      
      const response = await emailAPI.processEmails();
      if (response.data.success) {
        showNotification(
          `Successfully processed ${response.data.processed} emails, skipped ${response.data.skipped} duplicates`, 
          'success'
        );
        // Refresh stats after processing
        fetchStats();
      }
    } catch (error) {
      console.error('Error processing emails:', error);
      if (error.response?.status === 500) {
        showNotification('Gmail API not configured. Please set up credentials.json first.', 'error');
      } else {
        showNotification('Error processing emails. Please check your Gmail API setup.', 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCloseWizard = () => {
    setShowSetupWizard(false);
    localStorage.setItem('hasSeenSetupWizard', 'true');
  };

  const NotificationBanner = () => {
    if (!notification) return null;

    const bgColor = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const Icon = {
      success: CheckCircle,
      error: AlertCircle,
      info: AlertCircle
    };

    const IconComponent = Icon[notification.type];

    return (
      <div className={`mx-8 mt-4 p-4 border rounded-lg ${bgColor[notification.type]}`}>
        <div className="flex items-center">
          <IconComponent className="h-5 w-5 mr-2" />
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Setup Wizard */}
      {showSetupWizard && <SetupWizard onClose={handleCloseWizard} />}
      
      {/* Sidebar */}
      <aside className="w-64 bg-dark-800 text-white">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <Mail className="h-8 w-8 text-primary-400" />
            <span className="text-xl font-bold">BCC Email</span>
          </div>
          <p className="text-dark-400 text-sm mt-1">Reporting Dashboard</p>
        </div>
        
        <nav className="mt-8">
          <div className="px-6 py-2">
            <p className="text-dark-400 text-xs font-semibold uppercase tracking-wider">
              Navigation
            </p>
          </div>
          
          <ul className="mt-2 space-y-1">
            <li>
              <a
                href="#"
                className="flex items-center px-6 py-3 text-white bg-primary-600 border-r-2 border-primary-400"
              >
                <Home className="h-5 w-5 mr-3" />
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-6 py-3 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Analytics
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-6 py-3 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
              >
                <Activity className="h-5 w-5 mr-3" />
                Processing
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-6 py-3 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-6">
          <div className="bg-dark-700 rounded-lg p-4">
            <p className="text-dark-300 text-sm mb-2">
              Need help setting up?
            </p>
            <button
              onClick={() => setShowSetupWizard(true)}
              className="flex items-center text-primary-400 hover:text-primary-300 text-sm transition-colors"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Open Setup Guide
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  BCC Email Reporting Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Monitor and analyze your email processing activities
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={processEmails}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Process Emails
                    </>
                  )}
                </button>
                <button
                  onClick={fetchStats}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Notification Banner */}
        <NotificationBanner />

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Emails"
              value={stats?.total || 0}
              icon={Mail}
              loading={isLoading}
            />
            <StatCard
              title="Business Leads"
              value={stats?.byTag['Business Lead'] || 0}
              icon={Activity}
              loading={isLoading}
              color="green"
            />
            <StatCard
              title="Reporting"
              value={stats?.byTag['Reporting'] || 0}
              icon={BarChart3}
              loading={isLoading}
              color="blue"
            />
            <StatCard
              title="General"
              value={stats?.byTag['General'] || 0}
              icon={Settings}
              loading={isLoading}
              color="gray"
            />
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="lg:col-span-1">
              <TagDistributionChart stats={stats} loading={isLoading} />
            </div>
            
            {/* Email Table */}
            <div className="lg:col-span-2">
              <EmailDataTable />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
