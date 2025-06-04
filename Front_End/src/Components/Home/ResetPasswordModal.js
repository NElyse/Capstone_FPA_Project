// Components/Home/ResetPasswordModal.js
import React, { useState } from 'react';
import '../CSS/ResetPasswordModal.css';

export default function ResetPasswordModal({ isOpen, onClose }) {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();
      setMessage(data.message);
      setSuccess(response.ok);

    } catch (err) {
      setMessage("Failed to reset password.");
      setSuccess(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Reset Password</h2>
        <form className="form-card" onSubmit={handleReset}>
          <div className="form-group">
            <label>Reset Token</label>
            <input
              type="text"
              placeholder="Paste your reset token here"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <p className={`form-message ${success ? 'success' : 'error'}`}>
              {message}
            </p>
          )}

          <div className="modal-buttons">
            <button type="submit" className="form-button">Reset Password</button>
            <button type="button" className="form-button cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
