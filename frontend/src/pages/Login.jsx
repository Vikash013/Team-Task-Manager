import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/errors.js';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4">
      <div className="w-full max-w-md rounded-md border border-line bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-black text-ink">Team Task Manager</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to your role-based workspace.</p>
        {error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-coral">{error}</div> : null}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-ink">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-ink">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
              required
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-pine px-4 py-2.5 font-bold text-white disabled:opacity-60"
          >
            <LogIn size={18} />
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          New here?{' '}
          <Link to="/signup" className="font-bold text-pine">
            Create an account
          </Link>
        </p>
        <Link to="/forgot-password" className="mt-3 block text-center text-sm font-bold text-pine">
          Forgot password?
        </Link>
      </div>
    </div>
  );
};

export default Login;
