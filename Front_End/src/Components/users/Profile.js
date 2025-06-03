// src/Components/users/Profile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditUserForm from './EditUserForm';
import '../CSS/EditUserForm.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleEditClick = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

const handleSave = async (updatedData) => {
  try {
    const token = localStorage.getItem('token'); // if you’re using auth
    const response = await axios.put(
      `http://localhost:5000/api/users/${user.id}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${token}` // remove if you’re not using JWT auth
        }
      }
    );

    // response.data.user is the updated user returned by backend
    const updatedUser = response.data.user;

    // Update React state and localStorage so UI reflects the change
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsEditing(false);
  } catch (err) {
    console.error('Failed to update profile:', err);
    alert('Profile update failed. Please try again.');
  }
};



  if (!user) {
    return <p>Loading user information...</p>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <table className="profile-table">
        <tbody>
          <tr>
            <th>Full Name:</th>
            <td>{user.full_names}</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>{user.email}</td>
          </tr>
          <tr>
            <th>Username:</th>
            <td>{user.username}</td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>{user.phone || '-'}</td>
          </tr>
          <tr>
            <th>Role:</th>
            <td>{user.role}</td>
          </tr>
        </tbody>
      </table>
      <button onClick={handleEditClick} className="edit-profile-btn">
        Edit Profile
      </button>

      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditUserForm
              user={user}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          </div>
        </div>
      )}
    </div>
  );
}
