import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FloodData from './Components/FloodData';
import FloodStatus from './Components/FloodStatus';
import Login from './Components/Home/Login';
import HomePage from './Components/Home/HomePage';
import Logout from './Components/Home/Logout';
import PrivateRoute from './Components/Home/PrivateRoute';
import Profile from './Components/users/Profile';
import Register from './Components/Home/Register';
import ForgotPassword from './Components/Home/ForgotPassword';
import AppLayout from './Components/AppLayout';
import ResetPasswordModal from './Components/Home/ResetPasswordModal';

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Default route is the HomePage */}
        <Route path="/" element={<HomePage />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPasswordModal />} /> {/* ✅ New Modal-based Reset Route */}
        <Route path="/logout" element={<Logout />} />

        {/* ✅ Protected Routes with Layout */}
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
