import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoadingSpinner from './components/Common/LoadingSpinner.jsx';

const AuthPage = lazy(() => import('./components/Auth/AuthPage.jsx'));
const ForgotPassword = lazy(() => import('./components/Auth/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./components/Auth/ResetPassword.jsx'));
const VerifyEmail = lazy(() => import('./components/Auth/VerifyEmail.jsx'));
const PrivateRoute = lazy(() => import('./components/Common/PrivateRoute.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const App = () => {
  return (
    <Suspense
      fallback={(
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#faf7fc] via-[#f6f0fb] to-[#efe7f9] p-4">
          <LoadingSpinner message="Loading interface..." />
        </div>
      )}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
