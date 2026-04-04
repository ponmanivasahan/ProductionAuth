import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiLock, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Alert from '../Common/Alert';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const redirectTimerRef = useRef(null);
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid reset link');
      return;
    }
    
    if (!password) {
      setError('Please enter a password');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await resetPassword(token, password);
      setSuccess('Password reset successful! Redirecting to login...');
      redirectTimerRef.current = setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  if (!token) {
    return (
      <div className="auth-screen font-[Inter,system-ui,-apple-system,Segoe_UI,Roboto,Helvetica,Arial,sans-serif]">
        <div className="auth-shell auth-enter">
          <div className="auth-panel">
            <div className="flex flex-col items-center px-8 pt-8 pb-8 text-center">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e3dbcf] bg-transparent text-[#d73c3c]">
                <FiCheckCircle className="h-6 w-6 rotate-180" />
              </div>

              <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#111827]">Reset link expired</h1>
              <p className="mt-3 text-[1.02rem] leading-7 text-[#5f6670]">
                This reset link is missing or invalid. Please request a new password reset email.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/forgot-password" className="btn-primary btn-primary-live inline-flex">
                  Request New Link
                </Link>
                <Link to="/login" className="btn-secondary inline-flex">
                  Back to log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen font-[Inter,system-ui,-apple-system,Segoe_UI,Roboto,Helvetica,Arial,sans-serif]">
      <div className="auth-shell auth-enter">
        <div className="auth-panel">
          <div className="flex flex-col items-center px-8 pt-8 pb-2 text-center">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e3dbcf] bg-transparent text-[#7c5ce6]">
              <FiLock className="h-6 w-6" />
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#111827]">Create new password</h1>
            <p className="mt-3 text-[1.02rem] leading-7 text-[#5f6670]">Enter a strong password to secure your account.</p>
          </div>

          <div className="px-8 pb-8 pt-6">
            <div className="mb-5 space-y-4">
              {error && <Alert type="error" message={error} onClose={() => setError('')} />}
              {success && (
                <div className="flex items-center gap-3 rounded-xl border border-[#d6eedb] bg-[#f3fbf5] p-4 text-[#2d7a4a]">
                  <FiCheckCircle className="text-xl" />
                  <p className="font-semibold">{success}</p>
                </div>
              )}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="field-group">
              <label htmlFor="password" className="auth-label mb-2 block text-sm font-semibold tracking-[0.01em] text-[#1f2328]">
                New Password
              </label>
              <div className="input-shell group">
                <span className="input-icon" aria-hidden="true">
                  <FiLock />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field input-with-icon"
                  placeholder="Enter new password"
                />
              </div>
                <p className="mt-1.5 text-xs text-[#8a8a8a]">Must be at least 6 characters</p>
              </div>

              <div className="field-group">
              <label htmlFor="confirm-password" className="auth-label mb-2 block text-sm font-semibold tracking-[0.01em] text-[#1f2328]">
                Confirm Password
              </label>
              <div className="input-shell group">
                <span className="input-icon" aria-hidden="true">
                  <FiLock />
                </span>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field input-with-icon"
                  placeholder="Confirm password"
                />
              </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary btn-primary-live w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Resetting password...' : 'Reset password'}
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

export default ResetPassword;