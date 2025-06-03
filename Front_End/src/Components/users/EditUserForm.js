// src/Components/EditUserForm.js
import React, { useState, useEffect } from 'react';
import '../CSS/EditUserForm.css';

export default function EditUserForm({ user, onCancel, onSave }) {
  const [formData, setFormData] = useState({
    full_names: '',
    email: '',
    username: '',
    phone: '',
    role: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_names: user.full_names || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
        role: user.role || '',
      });
    }
  }, [user]);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit User</h2>
        <form onSubmit={handleSubmit} className="edit-user-form">
          <label>
            Full Name:
            <input name="full_names" value={formData.full_names} onChange={handleChange} required />
          </label>
          <label>
            Email:
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>
          <label>
            Username:
            <input name="username" value={formData.username} onChange={handleChange} required />
          </label>
          <label>
            Phone:
            <input name="phone" value={formData.phone} onChange={handleChange} />
          </label>
          <label>
            Role:
            <input name="role" value={formData.role} onChange={handleChange} disabled />
          </label>
          <div className="form-buttons">
            <button type="submit" className="save-button">Save</button>
            <button type="button" onClick={onCancel} className="cancel-button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
