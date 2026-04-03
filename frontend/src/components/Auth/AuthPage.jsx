import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { SiHackclub } from 'react-icons/si';
import { useAuth } from '../../context/AuthContext';
import Alert from '../Common/Alert';
import authService from '../../services/auth';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6.1-2.7-6.1-6.1s2.8-6.1 6.1-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.3 12 2.3 6.8 2.3 2.6 6.5 2.6 11.7S6.8 21 12 21c6.9 0 9.2-4.8 9.2-7.3 0-.5 0-.8-.1-1.2H12z"
    />
    <path
      fill="#FBBC05"
      d="M3.7 7.9l3.2 2.3c.9-1.9 2.8-3.2 5.1-3.2 1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.3 12 2.3c-3.8 0-7.1 2.1-8.8 5.6z"
    />
    <path
      fill="#34A853"
      d="M12 21c2.5 0 4.6-.8 6.1-2.3l-2.8-2.3c-.8.6-1.9 1-3.3 1-2.5 0-4.6-1.7-5.4-4l-3.3 2.5C5 18.7 8.3 21 12 21z"
    />
    <path
      fill="#4285F4"
      d="M21.2 13.7c0-.5 0-.8-.1-1.2H12v3.9h5.5c-.3 1.4-1.1 2.5-2.2 3.3l2.8 2.3c1.6-1.5 3.1-4.3 3.1-8.3z"
    />
  </svg>
);

const AuthPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const data = await login(formData.email, formData.password);

      if (data?.verificationEmailSent || data?.user?.is_email_verified === false) {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-linear-to-br from-[#f8f6f2] via-[#f0ece5] to-[#e9e1d7] p-4 font-[Inter,system-ui,-apple-system,Segoe_UI,Roboto,Helvetica,Arial,sans-serif]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-[#d5e2ef]/55 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-[#ebdecf]/65 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.07] [background:radial-gradient(#1e2f3f_0.6px,transparent_0.6px)] bg-size-[16px_16px]" />
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div className="w-full max-w-md auth-enter">
        {/* Card */}
        <div className="rounded-[20px] bg-transparent shadow-none backdrop-blur-0">
          {/* Header Section */}
          <div className="border-b border-[#e8ddfa] px-7 pt-7 pb-5">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ded4f1] bg-[#fbf8ff] text-[#7c5ce6] shadow-[0_10px_20px_rgba(124,92,230,0.08)]">
              <FiLock className="h-5 w-5" />
            </div>
            <h1 className="text-[2.05rem] font-semibold leading-tight tracking-[-0.03em] text-[#0e1319]">Log in to your account</h1>
            <p className="mt-2 text-[0.96rem] leading-6 text-[#676d71]">Welcome back! Please enter your details.</p>
          </div>

          {/* Content Section */}
          <div className="px-7 py-5">
            {/* Alert */}
            {error && (
              <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                <Alert type="error" message={error} onClose={() => setError('')} />
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="field-group">
                <label htmlFor="auth-email" className="auth-label mb-2 block text-sm font-semibold tracking-[0.01em] text-[#1f2328]">
                  Email
                </label>
                <div className="input-shell group">
                  <span className="input-icon group-focus-within:text-[#7c5ce6] group-focus-within:bg-[#f4f0ff]" aria-hidden="true">
                    <FiMail />
                  </span>
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field input-with-icon"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="field-group">
                <label htmlFor="auth-password" className="auth-label mb-2 block text-sm font-semibold tracking-[0.01em] text-[#1f2328]">
                  Password
                </label>
                <div className="input-shell group">
                  <span className="input-icon group-focus-within:text-[#7c5ce6] group-focus-within:bg-[#f4f0ff]" aria-hidden="true">
                    <FiLock />
                  </span>
                  <input
                    id="auth-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field input-with-icon"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="auth-check flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-[#c8c1b4] text-[#7c5ce6] focus:ring-2 focus:ring-[#7c5ce6] focus:ring-offset-1"
                  />
                  <span className="text-sm text-[#666b70] transition-colors group-hover:text-[#2b3137]">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="link-underline text-sm font-semibold text-[#7c5ce6] transition-colors hover:text-[#0f0f0f]"
                >
                  Forgot?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary btn-primary-live group mt-6 flex w-full items-center justify-center gap-2.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="font-semibold">{loading ? 'Signing in...' : 'Sign in'}</span>
                {!loading && <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5 group-active:translate-x-0.5" />}
              </button>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e8dfd2]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white/90 px-3 text-xs font-medium tracking-wide text-[#8e8f90]">Or</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={authService.googleLogin}
                  className="btn-secondary oauth-btn group w-full"
                >
                  <GoogleIcon />
                  <span className="text-sm font-semibold">Sign in with Google</span>
                </button>

                <button
                  type="button"
                  onClick={authService.hackclubLogin}
                  className="btn-secondary oauth-btn group w-full"
                >
                  <SiHackclub className="text-lg text-[#ec3750]" />
                  <span className="text-sm font-semibold">Continue with HackClub</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AuthPage;