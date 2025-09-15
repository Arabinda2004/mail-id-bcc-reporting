import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  loading = false, 
  color = 'primary',
  trend = null,
  className = ''
}) => {
  const colorClasses = {
    primary: 'text-blue-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    red: 'text-red-600'
  };

  const solidBackgrounds = {
    primary: 'bg-blue-600',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    red: 'bg-red-600'
  };

  const cardBackgrounds = {
    primary: 'bg-blue-50',
    green: 'bg-green-50',
    blue: 'bg-blue-50',
    gray: 'bg-gray-50',
    red: 'bg-red-50'
  };

  if (loading) {
    return (
      <div className={`bg-white p-4 rounded-2xl shadow-lg border border-gray-200 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded-xl animate-pulse mb-3"></div>
            <div className="h-6 bg-gray-200 rounded-xl animate-pulse w-2/3"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group bg-white p-4 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-500 hover:-translate-y-2 transform ${cardBackgrounds[color]} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{title}</p>
          <p className="text-2xl lg:text-3xl font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-all duration-500">
            {value?.toLocaleString()}
          </p>
          
          {trend && (
            <div className="flex items-center mt-3">
              {trend.direction === 'up' ? (
                <div className="flex items-center bg-green-50 px-2 py-1 rounded-xl border border-green-200">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1 animate-bounce" />
                  <span className="text-xs font-bold text-green-600">
                    +{trend.percentage}% {trend.period}
                  </span>
                </div>
              ) : (
                <div className="flex items-center bg-red-50 px-2 py-1 rounded-xl border border-red-200">
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1 animate-bounce" />
                  <span className="text-xs font-bold text-red-600">
                    -{trend.percentage}% {trend.period}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${solidBackgrounds[color]} shadow-lg transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
          <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
