import React, { useState } from 'react';
import axios from 'axios';
import '../CSS/Form.css';

export default function ForgotPassword({ onCancel }) {
  const [email, setEmail] = useState('');
  const [messageForgotPassword, setMessageForgotPassword] = useState('');
  const [errorEmptyEmailForgotPassword, setErrorEmptyEmailForgotPassword] = useState('');
  const [errorInvalidEmailForgotPassword, setErrorInvalidEmailForgotPassword] = useState('');
  const [errorForgotPassword, setErrorForgotPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset all messages
    setMessageForgotPassword('');
    setErrorForgotPassword('');
    setErrorEmptyEmailForgotPassword('');
    setErrorInvalidEmailForgotPassword('');
    setLoading(true);

    if (!email.trim()) {
      setErrorEmptyEmailForgotPassword('⚠️ Please provide your email');
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setErrorInvalidEmailForgotPassword('❌ Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/forgot-password', { email });
      setMessageForgotPassword('✅ ' + res.data.message);
    } catch (err) {
      setErrorForgotPassword('❌ ' + (err.response?.data?.error || 'Error sending reset email'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container" noValidate>
      <label className="form-label">Email</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="form-input"
        placeholder="Enter your email"
      />

      {/* Show error messages separately */}
      {errorEmptyEmailForgotPassword && (
        <div className="erroor-forgot-password">{errorEmptyEmailForgotPassword}</div>
      )}
      {errorInvalidEmailForgotPassword && (
        <div className="erroor-forgot-password">{errorInvalidEmailForgotPassword}</div>
      )}
      {errorForgotPassword && (
        <div className="erroor-forgot-password">{errorForgotPassword}</div>
      )}

      <button
        type="submit"
        className="form-button small-button"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Reset Password'}
      </button>

      {onCancel && (
        <button
          type="button"
          className="form-button cancel-button"
          onClick={onCancel}
        >
          Cancel
        </button>
      )}

      {/* Show success message below buttons */}
      {messageForgotPassword && (
        <div className="successs-forgot-password">{messageForgotPassword}</div>
      )}
    </form>
  );
}
