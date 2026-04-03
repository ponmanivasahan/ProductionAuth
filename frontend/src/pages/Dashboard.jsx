import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-linear-to-br from-[#faf7fc] via-[#f6f0fb] to-[#efe7f9] p-4">
      <div className="w-full max-w-md auth-enter">
        <div className="rounded-[20px] bg-white/92 border border-[#e8deef] shadow-[0_24px_70px_rgba(91,59,154,0.12)] backdrop-blur-xl p-8 text-center">
          <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ded4f1] bg-[#fbf8ff] text-[#7c5ce6] shadow-[0_10px_20px_rgba(124,92,230,0.08)]">
            <FiLogOut className="h-6 w-6 rotate-180" />
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#111827]">Welcome back</h1>
          <p className="mt-4 text-base leading-7 text-[#5f6670]">
            You have successfully logged in as <span className="font-semibold text-[#7c5ce6]">{user?.email}</span>
          </p>
          
          <button
            onClick={handleLogout}
            className="btn-primary btn-primary-live w-full mt-8 flex items-center justify-center gap-2 group"
          >
            <FiLogOut className="h-4 w-4" />
            <span className="font-semibold">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;