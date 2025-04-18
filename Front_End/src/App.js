// src/App.jsx
import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FloodData  from './components/FloodData';


function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <FloodData  />
      </div>
    </div>
  );
}

export default App;
