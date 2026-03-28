import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'signin' | 'signup' | 'reset';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, resetPassword, user } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already signed in
  React.useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccess('Check your email for a reset link.');
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        setSuccess('Account created! Check your email to confirm.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        const redirect = searchParams.get('redirect') || '/';
        navigate(redirect, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      {/* Header */}
      <div className="bg-primary-600 text-white px-6 pt-16 pb-10 text-center">
        <div className="text-4xl mb-3">🌴</div>
        <h1 className="text-2xl font-bold">
          {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
        </h1>
        <p className="text-primary-100 text-sm mt-1">
          {mode === 'signin' ? 'Sign in to save and view your Barbados plans' :
           mode === 'signup' ? 'Save your itineraries and collect passport stamps' :
           'Enter your email to receive a reset link'}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white rounded-xl pl-10 pr-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-gray-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white rounded-xl pl-10 pr-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-gray-900"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full bg-white rounded-xl pl-10 pr-12 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {success && (
            <div className="text-green-700 text-sm bg-green-50 rounded-xl px-4 py-3">
              ✓ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 disabled:bg-gray-300 text-white font-bold text-base py-4 rounded-2xl shadow-md transition-all active:scale-95"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        {/* Mode switchers */}
        <div className="mt-6 space-y-3 text-center">
          {mode === 'signin' && (
            <>
              <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }} className="text-primary-600 text-sm font-medium">
                Don't have an account? Sign up
              </button>
              <br />
              <button onClick={() => { setMode('reset'); setError(''); setSuccess(''); }} className="text-gray-400 text-xs">
                Forgot password?
              </button>
            </>
          )}
          {(mode === 'signup' || mode === 'reset') && (
            <button onClick={() => { setMode('signin'); setError(''); setSuccess(''); }} className="text-primary-600 text-sm font-medium">
              Back to Sign In
            </button>
          )}
        </div>

        {/* Skip */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 text-xs underline underline-offset-2"
          >
            Continue without account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
