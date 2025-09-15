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
      'Business Lead': 'bg-green-100 text-green-800',
      'Reporting': 'bg-blue-100 text-blue-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[tag] || 'bg-gray-100 text-gray-800';
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
      <div className="bg-white rounded-xl shadow-card">
        <div className="p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Email Data
          </h3>
          <button
            onClick={fetchEmails}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tag Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Filter className="h-3 w-3 inline mr-1" />
              Tag
            </label>
            <select
              value={filters.tag}
              onChange={(e) => handleFilterChange('tag', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Tags</option>
              <option value="Business Lead">Business Lead</option>
              <option value="Reporting">Reporting</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Calendar className="h-3 w-3 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Calendar className="h-3 w-3 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Sender Search */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Search className="h-3 w-3 inline mr-1" />
              Sender
            </label>
            <input
              type="text"
              placeholder="Search sender..."
              value={filters.sender}
              onChange={(e) => handleFilterChange('sender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {emails.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
            <p className="text-gray-500">
              Try adjusting your filters or process some emails to see data here.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {emails.map((email) => (
                <tr key={email._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {truncateText(email.sender, 30)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {truncateText(email.subject, 40)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {truncateText(email.bodySnippet, 60)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(email.tag)}`}>
                      <TagIcon className="h-3 w-3 mr-1" />
                      {email.tag}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(email.receivedAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="px-3 py-2 text-sm font-medium">
                {pagination.page} of {pagination.pages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDataTable;
