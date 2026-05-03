import { CheckCircle2, LogIn, ShieldCheck, Users } from 'lucide-react';
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
    <div className="min-h-screen bg-[linear-gradient(135deg,#edf7f1_0%,#f8f1ef_52%,#fbf8ee_100%)] px-4 py-8 text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-md border border-white/70 bg-white shadow-soft lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex flex-col justify-between bg-ink p-7 text-white sm:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pine via-gold to-coral" />
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-black">
              <ShieldCheck size={18} />
              Team Task Manager
            </div>
            <h1 className="mt-8 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
              Plan work, assign ownership, and keep the team moving.
            </h1>
            <p className="mt-4 max-w-lg text-base font-semibold leading-7 text-white/70">
              A focused workspace for projects, tasks, comments, priorities, invite links, and role-based team control.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ['Role control', 'Admin and member workspaces'],
              ['Manual invites', 'Copy links without email setup'],
              ['Task flow', 'Statuses, due dates, comments']
            ].map(([label, detail]) => (
              <div key={label} className="rounded-md border border-white/10 bg-white/10 p-4">
                <CheckCircle2 size={18} className="text-emerald-200" />
                <p className="mt-3 text-sm font-black">{label}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-white/60">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center bg-white p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase text-pine">Welcome back</p>
                <h2 className="mt-1 text-3xl font-black text-ink">Sign in</h2>
              </div>
              <span className="rounded-md bg-mist p-3 text-pine">
                <Users size={24} />
              </span>
            </div>
            {error ? <div className="mb-5 rounded-md bg-red-50 p-3 text-sm font-semibold text-coral">{error}</div> : null}
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-ink">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="focus-ring mt-1 w-full rounded-md border border-line bg-mist/40 px-3 py-3"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-ink">Password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="focus-ring mt-1 w-full rounded-md border border-line bg-mist/40 px-3 py-3"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-black text-white transition hover:bg-pine disabled:opacity-60"
              >
                <LogIn size={18} />
                {submitting ? 'Signing in...' : 'Login'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
              New here?{' '}
              <Link to="/signup" className="font-black text-pine">
                Create an account
              </Link>
            </p>
            <Link to="/forgot-password" className="mt-3 block text-center text-sm font-black text-pine">
              Forgot password?
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
