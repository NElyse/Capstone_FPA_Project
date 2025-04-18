// src/components/FloodStatus.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FloodStatus = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/api/flood/latest')
      .then(res => setStatus(res.data))
      .catch(err => console.error('Error fetching flood status:', err));
  }, []);

  return (
    <div className="p-4 rounded shadow bg-blue-100">
      <h2 className="text-xl font-bold mb-2">Current Flood Risk</h2>
      {status ? (
        <div>
          <p><strong>Risk Level:</strong> {status.risk_level || 'Data not available'}</p>
          <p><strong>Location:</strong> {status.location || 'Data not available'}</p>
          <p><strong>Timestamp:</strong> {status.timestamp ? new Date(status.timestamp).toLocaleString() : 'Data not available'}</p>
        </div>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default FloodStatus;
