import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../store/api/adminAuthApi';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ admin: result.admin, accessToken: result.token }));
      navigate('/');
    } catch (err) {
      console.error('Failed to login:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 border border-emerald-100 overflow-hidden">
            <img src="/favicon.svg" alt="ReviewQR" className="w-14 h-14" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ReviewQR Admin</h1>
          <p className="text-gray-500 mt-2">Please sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{(error as { data?: { message?: string } })?.data?.message || 'Invalid email or password'}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
