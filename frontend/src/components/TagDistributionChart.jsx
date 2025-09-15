import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const TagDistributionChart = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-card">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tag Distribution</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-2">📊</div>
            <p className="text-gray-500">No data available</p>
            <p className="text-sm text-gray-400 mt-1">Process some emails to see the distribution</p>
          </div>
        </div>
      </div>
    );
  }

  const data = [
    {
      name: 'Business Lead',
      value: stats.byTag['Business Lead'],
      percentage: ((stats.byTag['Business Lead'] / stats.total) * 100).toFixed(1)
    },
    {
      name: 'Reporting',
      value: stats.byTag['Reporting'],
      percentage: ((stats.byTag['Reporting'] / stats.total) * 100).toFixed(1)
    },
    {
      name: 'General',
      value: stats.byTag['General'],
      percentage: ((stats.byTag['General'] / stats.total) * 100).toFixed(1)
    }
  ];

  const COLORS = {
    'Business Lead': '#10b981', // green
    'Reporting': '#3b82f6',     // blue
    'General': '#6b7280'        // gray
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-col space-y-2 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm text-gray-600">{entry.value}</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {data.find(d => d.name === entry.value)?.value || 0}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tag Distribution</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <CustomLegend payload={
        data.map(item => ({
          value: item.name,
          color: COLORS[item.name]
        }))
      } />

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Emails</span>
          <span className="font-medium text-gray-900">{stats.total}</span>
        </div>
      </div>
    </div>
  );
};

export default TagDistributionChart;
