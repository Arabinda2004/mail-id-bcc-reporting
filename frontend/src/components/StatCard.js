import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  loading = false, 
  color = 'primary',
  trend = null 
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    gray: 'bg-gray-50 text-gray-600',
    red: 'bg-red-50 text-red-600'
  };

  const iconBgClasses = {
    primary: 'bg-primary-100',
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    gray: 'bg-gray-100',
    red: 'bg-red-100'
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value?.toLocaleString()}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              {trend.direction === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.percentage}% {trend.period}
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${iconBgClasses[color]}`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
