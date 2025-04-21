import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-800 text-white p-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-semibold">Flood Alert Dashboard</h1>
      <div className="space-x-4">
      <ul className="flex space-x-4">
        <li>
          <Link to="/flooddata" className="text-white hover:text-blue-300">Home</Link>
        </li>
        <li>
          <Link to="/floodstatus" className="text-white hover:text-blue-300">Flood Status</Link>
        </li>
        <li>
          <Link to="/reports" className="text-white hover:text-blue-300">Reports</Link>
        </li>
        <li>
          <Link to="/reports" className="text-white hover:text-blue-300">User</Link>
        </li>
      </ul>
      </div>
    </nav>
  );
};

export default Navbar;
