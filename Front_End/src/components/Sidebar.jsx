// src/components/Sidebar.jsx
import React from 'react';
import { AlertCircle, BarChart, MapPin } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="bg-blue-900 text-white w-60 h-screen p-4 space-y-6">
      <div className="text-2xl font-bold">Menu</div>
      <ul className="space-y-4">
        <li className="flex items-center gap-2"><AlertCircle size={20} /> Alerts</li>
        <li className="flex items-center gap-2"><BarChart size={20} /> Statistics</li>
        <li className="flex items-center gap-2"><MapPin size={20} /> Locations</li>
      </ul>
    </aside>
  );
};

export default Sidebar;
