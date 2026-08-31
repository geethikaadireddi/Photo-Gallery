import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }
function AccessCodeForm() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    navigate(`/shared/${code.trim().toUpperCase()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Enter access code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
      >
        View
      </button>
    </form>
  );
}
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-6">Log in to access your albums</p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
        <div className="mt-6 pt-6 border-t border-gray-100">
  <p className="text-xs text-gray-400 text-center mb-2">Have a shared album code?</p>
  <AccessCodeForm />
</div>
      </div>
    </div>
    
  );
}