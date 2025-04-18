// src/components/FloodData.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataCard from './DataCard'; // Import DataCard component
import './FloodData.css';

const FloodData = () => {
  const [floodData, setFloodData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/flooddata')
      .then(response => {
        setFloodData(response.data);
      })
      .catch(err => {
        console.error('Error fetching flood data:', err);
      });
  }, []);

  const getColorForFloodRisk = (risk) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'High':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flood-data-container p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Flood Prediction and Alert System</h2>
      
      <div className="cards-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {floodData.map((data) => (
          <React.Fragment key={data.id}>
            <DataCard
              title="Water Level"
              value={data.water_level}
              unit="m"
              color="bg-blue-500" // Adjust the color as needed
            />
            <DataCard
              title="Rainfall"
              value={data.rainfall}
              unit="mm"
              color="bg-green-500" // Adjust the color as needed
            />
            <DataCard
              title="Flood Risk"
              value={data.flood_risk}
              unit=""
              color={getColorForFloodRisk(data.flood_risk)} // Dynamic color based on flood risk
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default FloodData;
