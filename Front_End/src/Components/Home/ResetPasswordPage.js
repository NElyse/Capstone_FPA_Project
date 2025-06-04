// src/components/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../CSS/Form.css';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validToken, setValidToken] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate token on mount
    fetch(`http://localhost:5000/api/reset-password/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setValidToken(false);
        } else {
          setValidToken(true);
        }
      })
      .catch(() => setError('Server error validating token.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Password reset successful. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(data.error || 'Password reset failed.');
      }
    } catch {
      setError('Network error. Try again later.');
    }
  };

  if (loading) {
    return <div className="form-container"><p>Validating token...</p></div>;
  }

  if (!validToken) {
    return <div className="form-container"><p className="error">{error || 'Invalid or expired token.'}</p></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Set New Password</h2>

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        className="form-input"
        required
      />

      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        className="form-input"
        required
      />

      <button type="submit" className="form-button">Reset Password</button>
      <button type="button" className="form-button cancel" onClick={() => navigate('/')}>Cancel</button>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
}
