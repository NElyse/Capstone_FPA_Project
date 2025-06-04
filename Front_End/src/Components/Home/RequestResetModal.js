// Components/Home/RequestResetModal.js
import React, { useState } from 'react';
import Modal from '../Modal';

export default function RequestResetModal({ isOpen, onClose, onTokenReceived }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message);
      setIsSuccess(!!data.token);
      if (data.token) {
        onTokenReceived(data.token); // Pass token to parent
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('Request failed.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Reset Your Password</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        {message && <p className={isSuccess ? 'success' : 'error'}>{message}</p>}
        <div className="modal-buttons">
          <button type="submit">Send Reset Link</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
        
      </form>
    </Modal>
  );
}
