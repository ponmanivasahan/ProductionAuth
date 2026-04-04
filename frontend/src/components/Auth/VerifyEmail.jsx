import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiMail, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Alert from '../Common/Alert';
import LoadingSpinner from '../Common/LoadingSpinner';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [resendMessage, setResendMessage] = useState('');
  const redirectTimerRef = useRef(null);
  
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyEmailHandler();
    } else {
      if (!email) {
        setError('Invalid verification link');
      }
      setLoading(false);
    }
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [token, email]);

  const verifyEmailHandler = async () => {
    try {
      await verifyEmail(token);
      setSuccess('Email verified successfully! Redirecting to dashboard...');
      redirectTimerRef.current = setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email address is missing. Please go back and try again.');
      return;
    }

    try {
      setResendMessage('');
      await resendVerification(email);
      setResendMessage('A new verification link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    }
  };

  if (loading) {
    return (
      <div className="auth-screen p-4 sm:p-6 lg:p-8">
        <LoadingSpinner message="Verifying your email..." />
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-screen p-4 sm:p-6 lg:p-8">
        <div className="auth-shell" style={{ maxWidth: '460px' }}>
          <div className="auth-panel auth-enter">
            <div className="flex flex-col items-center px-8 pt-8 pb-8 text-center">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e3dbcf] bg-transparent text-[#2d7a4a]">
                <FiCheckCircle className="h-6 w-6" />
              </div>

              <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#111827]">Email verified</h1>
              <p className="mt-3 text-[1.02rem] leading-7 text-[#5f6670]">
                Your email has been successfully verified. You&apos;re all set to use FlavorTown Auth.
              </p>

              <button onClick={() => navigate('/dashboard')} className="btn-primary btn-primary-live mt-8 inline-flex">
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-screen p-4 sm:p-6 lg:p-8">
        <div className="auth-shell" style={{ maxWidth: '460px' }}>
          <div className="auth-panel auth-enter">
            <div className="flex flex-col items-center px-8 pt-8 pb-8 text-center">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e3dbcf] bg-transparent text-[#d73c3c]">
                <FiAlertCircle className="h-6 w-6" />
              </div>

              <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#111827]">Verification failed</h1>
              <p className="mt-3 text-[1.02rem] leading-7 text-[#5f6670]">
                {error || 'Invalid verification link'}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/login" className="btn-primary btn-primary-live inline-flex">
                  Return to Sign In
                </Link>
                <Link to="/forgot-password" className="btn-secondary inline-flex">
                  Request New Link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen p-4 sm:p-6 lg:p-8">
      <div className="auth-shell" style={{ maxWidth: '460px' }}>
        <div className="auth-panel auth-enter">
          <div className="flex flex-col items-center px-8 pt-8 pb-8 text-center">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e3dbcf] bg-transparent text-[#7c5ce6]">
              <FiMail className="h-6 w-6" />
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#111827]">Check your email</h1>
            <p className="mt-3 text-[1.02rem] leading-7 text-[#5f6670]">
              We sent a verification link{email ? ` to ${email}` : ''}.
            </p>

            {resendMessage && <p className="mt-4 text-sm font-medium text-[#2d7a4a]">{resendMessage}</p>}
            {error && <p className="mt-4 text-sm font-medium text-[#d73c3c]">{error}</p>}

            <button
              type="button"
              onClick={handleResend}
              className="btn-primary btn-primary-live mt-8 inline-flex w-full"
            >
              Resend verification email
            </button>

            <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7c5ce6] hover:text-[#111827]">
              <FiArrowLeft className="h-4 w-4" />
              Back to log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;