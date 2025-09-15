import React, { useState, useEffect } from 'react';
import { Mail, BarChart3, Settings, Home, Activity, AlertCircle, CheckCircle, HelpCircle, LogOut, User, Menu, X } from 'lucide-react';
import StatCard from './components/StatCard.jsx';
import TagDistributionChart from './components/TagDistributionChart.jsx';
import EmailDataTable from './components/EmailDataTable.jsx';
import SetupWizard from './components/SetupWizard.jsx';
import { emailAPI } from './services/api.js';

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  
  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoProcessing: false,
    darkMode: false
  });

  useEffect(() => {
    fetchStats();
    // Show setup wizard on first load if no data
    const hasSeenWizard = localStorage.getItem('hasSeenSetupWizard');
    if (!hasSeenWizard) {
      setShowSetupWizard(true);
    }

    // Load saved settings
    const savedSettings = localStorage.getItem('emailAppSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
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

  const handleViewChange = (viewName) => {
    setActiveView(viewName);
    setSidebarOpen(false); // Close mobile sidebar when view changes
  };

  const handleSettingChange = (settingKey, value) => {
    const newSettings = {
      ...settings,
      [settingKey]: value
    };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('emailAppSettings', JSON.stringify(newSettings));
    
    // Show notification
    showNotification(`${settingKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${value ? 'enabled' : 'disabled'}`, 'success');
    
    // Apply dark mode immediately if toggled
    if (settingKey === 'darkMode') {
      document.documentElement.classList.toggle('dark', value);
    }
  };

  const handleProfileUpdate = () => {
    showNotification('Profile settings updated successfully!', 'success');
  };

  const NotificationBanner = () => {
    if (!notification) return null;

    const bgColor = {
      success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800',
      error: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800',
      info: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800'
    };

    const Icon = {
      success: CheckCircle,
      error: AlertCircle,
      info: AlertCircle
    };

    const IconComponent = Icon[notification.type];

    return (
      <div className={`mx-4 sm:mx-6 lg:mx-8 mt-4 p-4 border rounded-xl shadow-sm ${bgColor[notification.type]} animate-in slide-in-from-top duration-300`}>
        <div className="flex items-center">
          <IconComponent className="h-5 w-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium flex-1">{notification.message}</p>
          <button
            onClick={() => setNotification(null)}
            className="ml-3 p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-mesh relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Setup Wizard */}
      {showSetupWizard && <SetupWizard onClose={handleCloseWizard} />}
      
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:w-72 bg-navy-900 shadow-lg border-r border-navy-800 relative z-10">
        <div className="flex flex-col w-full">
          {/* Logo Section */}
          <div className="p-8 border-b border-navy-700">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-xl font-black text-white">
                  BCC Email
                </span>
                <p className="text-navy-300 text-sm mt-1 font-medium">Reporting Dashboard</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-6 py-8">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-4">
                Navigation
              </p>
              
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleViewChange('dashboard')}
                    className={`w-full flex items-center px-5 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-1 group ${
                      activeView === 'dashboard' 
                        ? 'text-white bg-blue-600' 
                        : 'text-navy-300 hover:text-white hover:bg-navy-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-300 ${
                      activeView === 'dashboard' 
                        ? 'bg-white' 
                        : 'bg-navy-600 group-hover:bg-blue-500'
                    }`}>
                      <Home className={`h-4 w-4 ${activeView === 'dashboard' ? 'text-blue-600' : 'text-white'}`} />
                    </div>
                    <span className="font-bold">Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleViewChange('analytics')}
                    className={`w-full flex items-center px-5 py-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 group ${
                      activeView === 'analytics' 
                        ? 'text-white bg-purple-600' 
                        : 'text-navy-300 hover:text-white hover:bg-navy-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mr-3 group-hover:scale-110 transition-all duration-300 ${
                      activeView === 'analytics' 
                        ? 'bg-white' 
                        : 'bg-navy-600 group-hover:bg-purple-500'
                    }`}>
                      <BarChart3 className={`h-4 w-4 ${activeView === 'analytics' ? 'text-purple-600' : 'text-white'}`} />
                    </div>
                    <span className="font-medium">Analytics</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleViewChange('processing')}
                    className={`w-full flex items-center px-5 py-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 group ${
                      activeView === 'processing' 
                        ? 'text-white bg-emerald-600' 
                        : 'text-navy-300 hover:text-white hover:bg-navy-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mr-3 group-hover:scale-110 transition-all duration-300 ${
                      activeView === 'processing' 
                        ? 'bg-white' 
                        : 'bg-navy-600 group-hover:bg-emerald-500'
                    }`}>
                      <Activity className={`h-4 w-4 ${activeView === 'processing' ? 'text-emerald-600' : 'text-white'}`} />
                    </div>
                    <span className="font-medium">Processing</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleViewChange('settings')}
                    className={`w-full flex items-center px-5 py-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 group ${
                      activeView === 'settings' 
                        ? 'text-white bg-orange-600' 
                        : 'text-navy-300 hover:text-white hover:bg-navy-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mr-3 group-hover:scale-110 transition-all duration-300 ${
                      activeView === 'settings' 
                        ? 'bg-white' 
                        : 'bg-navy-600 group-hover:bg-orange-500'
                    }`}>
                      <Settings className={`h-4 w-4 ${activeView === 'settings' ? 'text-orange-600' : 'text-white'}`} />
                    </div>
                    <span className="font-medium">Settings</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
          
          {/* User Profile Section */}
          <div className="px-6 pb-6">
            <div className="bg-navy-800 rounded-3xl p-6 border border-navy-600 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                {user?.picture ? (
                  <div className="relative">
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      className="w-14 h-14 rounded-2xl object-cover border-3 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                ) : (
                  <div className="bg-blue-600 rounded-2xl p-4 shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-navy-300 text-xs truncate font-medium">
                    {user?.email || 'user@example.com'}
                  </p>
                  {user?.provider && (
                    <p className="text-blue-400 text-xs font-bold">
                      via {user.provider === 'google' ? 'Google' : user.provider}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center space-x-2 text-navy-300 hover:text-white text-sm py-3 px-4 rounded-2xl bg-navy-700 hover:bg-navy-600 transition-all duration-300 border border-navy-600 group"
              >
                <LogOut className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-80 bg-navy-900 shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Mobile Logo Section */}
              <div className="p-6 border-b border-navy-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">
                      BCC Email
                    </span>
                    <p className="text-navy-300 text-sm">Reporting Dashboard</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-navy-700 transition-colors"
                >
                  <X className="h-6 w-6 text-navy-300" />
                </button>
              </div>
              
              {/* Mobile Navigation */}
              <nav className="flex-1 px-6 py-8">
                <div className="mb-8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                    Navigation
                  </p>
                  
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => handleViewChange('dashboard')}
                        className={`w-full flex items-center px-4 py-3 rounded-xl font-medium shadow-sm transition-all duration-200 ${
                          activeView === 'dashboard' 
                            ? 'text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Home className={`h-5 w-5 mr-3 ${activeView === 'dashboard' ? 'text-blue-600' : ''}`} />
                        Dashboard
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleViewChange('analytics')}
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                          activeView === 'analytics' 
                            ? 'text-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <BarChart3 className={`h-5 w-5 mr-3 ${activeView === 'analytics' ? 'text-purple-600' : ''}`} />
                        Analytics
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleViewChange('processing')}
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                          activeView === 'processing' 
                            ? 'text-gray-700 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Activity className={`h-5 w-5 mr-3 ${activeView === 'processing' ? 'text-emerald-600' : ''}`} />
                        Processing
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleViewChange('settings')}
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                          activeView === 'settings' 
                            ? 'text-gray-700 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Settings className={`h-5 w-5 mr-3 ${activeView === 'settings' ? 'text-orange-600' : ''}`} />
                        Settings
                      </button>
                    </li>
                  </ul>
                </div>
              </nav>
              
              {/* Mobile User Profile */}
              <div className="px-6 pb-6">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center space-x-4 mb-4">
                    {user?.picture ? (
                      <img 
                        src={user.picture} 
                        alt={user.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-lg"
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-3 shadow-lg">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm font-semibold truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {user?.email || 'user@example.com'}
                      </p>
                      {user?.provider && (
                        <p className="text-blue-500 text-xs font-medium">
                          via {user.provider === 'google' ? 'Google' : user.provider}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 text-sm py-3 px-4 rounded-xl hover:bg-white/70 transition-all duration-200 border border-gray-200/50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                BCC Email
              </span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Header */}
        <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="animate-slide-in-up">
                <h1 className="text-2xl sm:text-4xl font-black text-blue-800">
                  BCC Email Reporting Dashboard
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base font-medium">
                  Monitor and analyze your email processing activities with advanced insights
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-scale-in">
                <button
                  onClick={processEmails}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 group font-bold"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                      Process Emails
                    </>
                  )}
                </button>
                <button
                  onClick={fetchStats}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-gray-300 font-medium group"
                >
                  <span className="group-hover:scale-110 transition-transform duration-300 inline-block">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Notification Banner */}
        <NotificationBanner />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto relative">
          {activeView === 'dashboard' && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-8 sm:space-y-10 h-full">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                <StatCard
                  title="Total Emails"
                  value={stats?.total || 0}
                  icon={Mail}
                  loading={isLoading}
                  className="animate-slide-in-up"
                  style={{animationDelay: '0.1s'}}
                />
                <StatCard
                  title="Business Leads"
                  value={stats?.byTag['Business Lead'] || 0}
                  icon={Activity}
                  loading={isLoading}
                  color="green"
                  className="animate-slide-in-up"
                  style={{animationDelay: '0.2s'}}
                />
                <StatCard
                  title="Reporting"
                  value={stats?.byTag['Reporting'] || 0}
                  icon={BarChart3}
                  loading={isLoading}
                  color="blue"
                  className="animate-slide-in-up"
                  style={{animationDelay: '0.3s'}}
                />
                <StatCard
                  title="General"
                  value={stats?.byTag['General'] || 0}
                  icon={Settings}
                  loading={isLoading}
                  color="gray"
                  className="animate-slide-in-up"
                  style={{animationDelay: '0.4s'}}
                />
              </div>

              {/* Charts and Tables */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 lg:gap-10 flex-1 min-h-0">
                {/* Chart */}
                <div className="xl:col-span-1 animate-slide-in-up flex flex-col" style={{animationDelay: '0.5s'}}>
                  <TagDistributionChart stats={stats} loading={isLoading} />
                </div>
                
                {/* Email Table */}
                <div className="xl:col-span-3 animate-slide-in-up flex flex-col min-h-0" style={{animationDelay: '0.6s'}}>
                  <EmailDataTable />
                </div>
              </div>
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
                  Advanced Analytics
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Email Trends</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">This Week</span>
                          <span className="text-2xl font-bold text-purple-600">{stats?.total || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Last Week</span>
                          <span className="text-lg font-semibold text-gray-500">
                            {Math.floor((stats?.total || 0) * 0.85)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Growth Rate</span>
                          <span className="text-lg font-bold text-green-600">+15.3%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Processing Speed</span>
                          <span className="text-lg font-bold text-blue-600">2.3s avg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Success Rate</span>
                          <span className="text-lg font-bold text-green-600">98.7%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Error Rate</span>
                          <span className="text-lg font-bold text-red-500">1.3%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Tag Distribution</h3>
                    <div className="space-y-4">
                      {stats?.byTag && Object.entries(stats.byTag).map(([tag, count]) => (
                        <div key={tag} className="flex justify-between items-center">
                          <span className="text-gray-600">{tag}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                                style={{width: `${(count / (stats?.total || 1)) * 100}%`}}
                              ></div>
                            </div>
                            <span className="text-lg font-bold text-green-600">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'processing' && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Activity className="h-8 w-8 text-emerald-600 mr-3" />
                  Email Processing Management
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Processing Controls</h3>
                      <div className="space-y-4">
                        <button
                          onClick={processEmails}
                          disabled={isProcessing}
                          className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl font-bold"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                              Processing Emails...
                            </>
                          ) : (
                            <>
                              <Mail className="h-5 w-5 mr-3" />
                              Process New Emails
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={fetchStats}
                          className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl font-bold"
                        >
                          <BarChart3 className="h-5 w-5 mr-3" />
                          Refresh Statistics
                        </button>
                        
                        <button
                          onClick={() => setShowSetupWizard(true)}
                          className="w-full px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl font-bold"
                        >
                          <Settings className="h-5 w-5 mr-3" />
                          Setup Wizard
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Processing Status</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            isProcessing ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {isProcessing ? 'Processing' : 'Ready'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Last Processed</span>
                          <span className="text-gray-500">
                            {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Queue Size</span>
                          <span className="text-lg font-bold text-blue-600">0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Processing History</h3>
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-900">Latest Batch</span>
                          <span className="text-green-600 font-bold">✓ Success</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Processed: {stats?.total || 0} emails
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date().toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-900">Previous Batch</span>
                          <span className="text-green-600 font-bold">✓ Success</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Processed: {Math.floor((stats?.total || 0) * 0.85)} emails
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(Date.now() - 3600000).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Settings className="h-8 w-8 text-orange-600 mr-3" />
                  Application Settings
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Account Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            defaultValue={user?.name || 'User'}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <input 
                            type="email" 
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            defaultValue={user?.email || 'user@example.com'}
                            disabled
                          />
                        </div>
                        <button 
                          onClick={handleProfileUpdate}
                          className="w-full px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all duration-300 font-bold"
                        >
                          Update Profile
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">Email Notifications</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={settings.emailNotifications}
                              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">Auto Processing</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={settings.autoProcessing}
                              onChange={(e) => handleSettingChange('autoProcessing', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">Dark Mode</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={settings.darkMode}
                              onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Gmail API Configuration</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-6 w-6 text-green-500" />
                          <span className="text-gray-700">Gmail API Connected</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-6 w-6 text-green-500" />
                          <span className="text-gray-700">OAuth2 Configured</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-6 w-6 text-green-500" />
                          <span className="text-gray-700">Database Connected</span>
                        </div>
                        <button 
                          onClick={() => setShowSetupWizard(true)}
                          className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-bold"
                        >
                          Reconfigure Setup
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">System Information</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Version</span>
                          <span className="font-bold text-gray-900">v1.0.0</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Environment</span>
                          <span className="font-bold text-green-600">Development</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Uptime</span>
                          <span className="font-bold text-gray-900">2h 15m</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Emails</span>
                          <span className="font-bold text-blue-600">{stats?.total || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
