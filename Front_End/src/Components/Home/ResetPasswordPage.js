// src/components/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import '../CSS/Form.css'; // Make sure your CSS matches these classes!

export default function ResetPasswordPage({ token, isOpen, onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validToken, setValidToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !isOpen) return;

    setLoading(true);
    fetch(`http://localhost:5000/api/reset-password/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setValidToken(false);
        } else {
          setValidToken(true);
          setError('');
        }
      })
      .catch(() => setError('Server error validating token.'))
      .finally(() => setLoading(false));
  }, [token, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Password reset successful. Redirecting to login...');
        setTimeout(() => {
          onClose(); // close modal and navigate
        }, 2500);
      } else {
        setError(data.error || 'Password reset failed.');
      }
    } catch {
      setError('Network error. Try again later.');
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay-reset-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-password-title"
    >
      <div
        className="modal-content-reset-modal"
        onClick={e => e.stopPropagation()}
      >
        {loading ? (
          <p className="loading-text-reset-modal">Validating token...</p>
        ) : !validToken ? (
          <>
            <p className="erroor-reset-modal">{error || 'Invalid or expired token.'}</p>
            <button
              className="form-button-cancel-reset-modal"
              onClick={onClose}
              disabled={submitting}
            >
              Close
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="form-container-reset-modal">
            <h2 id="reset-password-title" className="form-title-reset-modal">
              Set New Password
            </h2>

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="form-input-reset-modal"
              required
              autoFocus
              disabled={submitting}
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="form-input-reset-modal"
              required
              disabled={submitting}
            />

            <div className="reset-buttons-container-reset-modal">
              <button
                type="submit"
                className="form-button-reset-modal"
                disabled={submitting}
              >
                {submitting ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                type="button"
                className="form-button-cancel-reset-modal"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>

            {message && <p className="successs-reset-modal">{message}</p>}
            {error && <p className="erroor-reset-modal">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
