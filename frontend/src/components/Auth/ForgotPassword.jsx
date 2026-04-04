import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiKey, FiArrowLeft, FiMail } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Alert from '../Common/Alert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await forgotPassword(email);
      setMessage(response?.message || 'If your email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen font-[Inter,system-ui,-apple-system,Segoe_UI,Roboto,Helvetica,Arial,sans-serif]">
      <div className="auth-shell auth-enter">
        <div className="auth-panel">
          <div className="flex flex-col items-center text-center px-8 pt-8 pb-2">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e3dbcf] bg-transparent text-[#7c5ce6]">
              <FiKey className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#111827]">Forgot password?</h1>
            <p className="mt-3 text-[1.02rem] leading-7 text-[#5f6670]">No worries, we&apos;ll send you reset instructions.</p>
          </div>

          <div className="px-8 pb-8 pt-6">
            <div className="mb-5">
              {error && <Alert type="error" message={error} onClose={() => setError('')} />}
              {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="field-group">
                <label htmlFor="forgot-email" className="auth-label mb-2 block text-sm font-semibold tracking-[0.01em] text-[#1f2328]">Email</label>
                <div className="input-shell group">
                  <span className="input-icon" aria-hidden="true">
                    <FiMail />
                  </span>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="input-field input-with-icon"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary btn-primary-live w-full disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Sending...' : 'Reset password'}
              </button>

              <p className="flex items-center justify-center gap-2 text-center text-sm text-[#5f6670]">
                <FiArrowLeft className="h-4 w-4" />
                <Link to="/login" className="link-underline font-semibold text-[#7c5ce6] hover:text-[#111827]">
                  Back to log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;