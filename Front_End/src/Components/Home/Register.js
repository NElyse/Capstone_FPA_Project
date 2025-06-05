import React, { useState } from 'react';
import axios from 'axios';
import '../CSS/Form.css';

export default function Register({ switchToLogin }) {
  const [form, setForm] = useState({
    fullNames: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    role: 'user'
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setSuccess('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullNames.trim()) newErrors.fullNames = 'Please provide your full names.';
    if (!form.email.trim()) newErrors.email = 'Please provide your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Please enter a valid email address.';
    if (!form.username.trim()) newErrors.username = 'Please choose a username.';
    if (!form.phone.trim()) newErrors.phone = 'Please provide your phone number.';
    if (!/^\d{10,15}$/.test(form.phone)) newErrors.phone = 'Please enter a valid phone number.';
    if (!form.password) newErrors.password = 'Please create a password.';
    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/register', form);
      setSuccess('✅ ' + res.data.message);
    } catch (err) {
      const msg = err.response?.data?.error;
      if (msg.includes('email')) setErrors({ email: msg });
      else if (msg.includes('username')) setErrors({ username: msg });
      else if (msg.includes('phone')) setErrors({ phone: msg });
      else setErrors({ general: 'Registration failed. Try again.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <label className="form-label">Full Names</label>
      <input name="fullNames" className="form-input" onChange={handleChange} />
      {errors.fullNames && <div className="erroor">{errors.fullNames}</div>}

      <label className="form-label">Email</label>
      <input name="email" type="email" className="form-input" onChange={handleChange} />
      {errors.email && <div className="erroor">{errors.email}</div>}

      <label className="form-label">Username</label>
      <input name="username" className="form-input" onChange={handleChange} />
      {errors.username && <div className="erroor">{errors.username}</div>}

      <label className="form-label">Phone</label>
      <input name="phone" className="form-input" onChange={handleChange} />
      {errors.phone && <div className="erroor">{errors.phone}</div>}

      <label className="form-label">Password</label>
      <input name="password" type="password" className="form-input" onChange={handleChange} />
      {errors.password && <div className="erroor">{errors.password}</div>}

      <label className="form-label">Role</label>
      <select name="role" className="form-select" onChange={handleChange}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button type="submit" className="form-button green">Register</button>

      {errors.general && <div className="erroor">{errors.general}</div>}
      {success && <div className="successs">{success}</div>}

      <div className="form-switch-text">
        Already have an account?{' '}
        <button type="button" className="form-link" onClick={switchToLogin}>
          Login here
        </button>
      </div>
    </form>
  );
}
