import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Filter, 
  Search,
  Mail,
  Tag as TagIcon,
  Clock,
  RefreshCw
} from 'lucide-react';

const EmailDataTable = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    tag: 'all',
    startDate: '',
    endDate: '',
    sender: ''
  });

  useEffect(() => {
    fetchEmails();
  }, [pagination.page, filters]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.tag !== 'all' && { tag: filters.tag }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.sender && { sender: filters.sender })
      });

      const response = await fetch(`http://localhost:3001/api/emails?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setEmails(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getTagColor = (tag) => {
    const colors = {
      'Business Lead': 'bg-green-100 text-green-800 border border-green-200',
      'Reporting': 'bg-blue-100 text-blue-800 border border-blue-200',
      'General': 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    return colors[tag] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading && emails.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-32"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded-lg animate-pulse flex-1"></div>
                <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden animate-scale-in flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <div className="bg-blue-600 p-3 rounded-2xl mr-4 shadow-md">
              <Mail className="h-6 w-6 text-white" />
            </div>
            Email Data
          </h3>
          <button
            onClick={fetchEmails}
            className="flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-300 border border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 group font-medium"
          >
            <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tag Filter */}
          <div className="animate-slide-in-up" style={{animationDelay: '0.1s'}}>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              <Filter className="h-3 w-3 inline mr-2" />
              Tag
            </label>
            <select
              value={filters.tag}
              onChange={(e) => handleFilterChange('tag', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 font-medium hover:shadow-md"
            >
              <option value="all">All Tags</option>
              <option value="Business Lead">Business Lead</option>
              <option value="Reporting">Reporting</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="animate-slide-in-up" style={{animationDelay: '0.2s'}}>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              <Calendar className="h-3 w-3 inline mr-2" />
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 font-medium hover:shadow-md"
            />
          </div>

          {/* End Date */}
          <div className="animate-slide-in-up" style={{animationDelay: '0.3s'}}>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              <Calendar className="h-3 w-3 inline mr-2" />
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 font-medium hover:shadow-md"
            />
          </div>

          {/* Sender Search */}
          <div className="animate-slide-in-up" style={{animationDelay: '0.4s'}}>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              <Search className="h-3 w-3 inline mr-2" />
              Sender
            </label>
            <input
              type="text"
              placeholder="Search sender..."
              value={filters.sender}
              onChange={(e) => handleFilterChange('sender', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 font-medium hover:shadow-md placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-80 overflow-y-auto">
        {emails.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Mail className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No emails found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your filters or process some emails to see data here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="w-1/6 px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Sender
                    </th>
                    <th className="w-1/2 px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="w-1/6 px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Tag
                    </th>
                    <th className="w-1/6 px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {emails.map((email, index) => (
                    <tr key={email._id} className="hover:bg-gray-50 transition-all duration-200 group">
                      <td className="w-1/6 px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-900 truncate">
                          {truncateText(email.sender, 25)}
                        </div>
                      </td>
                      <td className="w-1/2 px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-900 mb-1">
                          {email.subject}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {email.bodySnippet}
                        </div>
                      </td>
                      <td className="w-1/6 px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTagColor(email.tag)} shadow-sm`}>
                          <TagIcon className="h-3 w-3 mr-1" />
                          {email.tag}
                        </span>
                      </td>
                      <td className="w-1/6 px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="truncate">{formatDate(email.receivedAt)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {emails.map((email, index) => (
                <div key={email._id} className="p-6 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {email.sender}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {email.subject}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTagColor(email.tag)} ml-3`}>
                      <TagIcon className="h-3 w-3 mr-1" />
                      {email.tag}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {email.bodySnippet}
                  </p>
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(email.receivedAt)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              Showing <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
              <span className="font-semibold">{pagination.total}</span> results
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center px-3 py-2 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-md transition-all duration-200 text-sm font-medium"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === pagination.page;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="flex items-center px-3 py-2 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-md transition-all duration-200 text-sm font-medium"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDataTable;
