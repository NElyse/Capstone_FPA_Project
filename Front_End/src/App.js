// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FloodData from './components/FloodData';
import FloodStatus from './components/FloodStatus'; 



function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          <Navbar />
          <div className="p-4">
            <Routes>
              {/* Default route set to FloodData */}
              <Route path="/" element={<FloodData />} />
              <Route path="/flooddata" element={<FloodData />} />
              <Route path="/floodstatus" element={<FloodStatus />} />
             
              {/* Add more routes as needed */}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
