// src/components/Dashboard.jsx
import React from 'react';
import DataCard from './DataCard';

const Dashboard = () => {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <DataCard title="Water Level" value="3.2" unit="m" color="bg-blue-600" />
      <DataCard title="Rainfall" value="78" unit="mm" color="bg-green-600" />
      <DataCard title="Flood Risk" value="High" unit="" color="bg-red-600" />
      {/* Add chart and more components here */}
    </div>
  );
};

export default Dashboard;
