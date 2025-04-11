// src/App.jsx
import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';


function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
