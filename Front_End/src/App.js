import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FloodData from './Components/FloodData';
import FloodStatus from './Components/FloodStatus';
import Login from './Components/Home/Login';
import HomePage from './Components/Home/HomePage';
import Logout from './Components/Home/Logout';
import PrivateRoute from './Components/Home/PrivateRoute';
import Profile from './Components/users/Profile';
import Register from './Components/Home/Register';
import ResetPassword from './Components/Home/ForgotPassword';
import AppLayout from './Components/AppLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Default route is the HomePage (or login screen) */}
        <Route path="/" element={<HomePage />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/logout" element={<Logout />} />

        {/* ✅ Protected Dashboard Routes using AppLayout */}
        <Route
          path="/flooddata"
          element={
            <PrivateRoute>
              <AppLayout>
                <FloodData />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/floodstatus"
          element={
            <PrivateRoute>
              <AppLayout>
                <FloodStatus />
              </AppLayout>
            </PrivateRoute>
          }
        />
        

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
