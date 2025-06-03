import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../CSS/Form.css';

export default function Login({ switchToRegister }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        identifier,
        password
      });

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate('/flooddata');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div>
      <h2 className="form-title">Login</h2>
      <form onSubmit={handleLogin} className="form-container">
        <input
          type="text"
          placeholder="Email / Username / Phone"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          className="form-input"
        //   required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="form-input"
        //   required
        />
        <button type="submit" className="form-button">Login</button>

        <div className="form-switch-text">
          Don't have an account?{' '}
          <button
            type="button"
            className="form-link"
            onClick={switchToRegister}
          >
            Register here
          </button>
        </div>
      </form>
    </div>
  );
}
