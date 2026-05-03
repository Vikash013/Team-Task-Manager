import { CheckCircle2, Link2, ShieldCheck, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { verifyInviteRequest } from '../services/inviteService.js';
import { getErrorMessage } from '../utils/errors.js';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite') || '';
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
    adminSetupKey: ''
  });
  const [error, setError] = useState('');
  const [invite, setInvite] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!inviteToken) return;

    verifyInviteRequest(inviteToken)
      .then(({ data }) => {
        setInvite(data);
        setForm((current) => ({ ...current, email: data.email, role: data.role }));
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [inviteToken]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (inviteToken) payload.inviteToken = inviteToken;
      if (payload.role !== 'admin') delete payload.adminSetupKey;
      await signup(payload);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#edf7f1_0%,#f8f1ef_52%,#fbf8ee_100%)] px-4 py-8 text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-md border border-white/70 bg-white shadow-soft lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative flex flex-col justify-between bg-ink p-7 text-white sm:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pine via-gold to-coral" />
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-black">
              <Link2 size={18} />
              Invite-ready workspace
            </div>
            <h1 className="mt-8 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
              Join with the right role and start from a focused dashboard.
            </h1>
            <p className="mt-4 max-w-lg text-base font-semibold leading-7 text-white/70">
              Members track assigned work. Admins manage teams, projects, invite links, and workspace security.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {[
              'Invite links lock signup to the invited email',
              'Admins can create projects and assign work',
              'Members get a clean task-first workspace'
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/10 p-3 text-sm font-bold">
                <CheckCircle2 size={18} className="text-emerald-200" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center bg-white p-6 sm:p-10">
          <div className="w-full max-w-lg">
            <div className="mb-8 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase text-pine">Workspace access</p>
                <h2 className="mt-1 text-3xl font-black text-ink">Create account</h2>
              </div>
              <span className="rounded-md bg-mist p-3 text-pine">
                <ShieldCheck size={24} />
              </span>
            </div>
            {invite ? (
              <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-pine">
                Invite verified for {invite.email} as {invite.role}.
              </div>
            ) : null}
            {error ? <div className="mb-5 rounded-md bg-red-50 p-3 text-sm font-semibold text-coral">{error}</div> : null}
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-ink">Name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="focus-ring mt-1 w-full rounded-md border border-line bg-mist/40 px-3 py-3"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-ink">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="focus-ring mt-1 w-full rounded-md border border-line bg-mist/40 px-3 py-3"
                  readOnly={Boolean(invite)}
                  required
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-ink">Password</span>
                  <input
                    type="password"
                    minLength={8}
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    className="focus-ring mt-1 w-full rounded-md border border-line bg-mist/40 px-3 py-3"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-ink">Role</span>
                  <select
                    value={form.role}
                    onChange={(event) => setForm({ ...form, role: event.target.value })}
                    className="focus-ring mt-1 w-full rounded-md border border-line bg-mist/40 px-3 py-3"
                    disabled={Boolean(invite)}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </div>
              {form.role === 'admin' ? (
                <label className="block">
                  <span className="text-sm font-bold text-ink">Admin setup key</span>
                  <input
                    value={form.adminSetupKey}
                    onChange={(event) => setForm({ ...form, adminSetupKey: event.target.value })}
                    className="focus-ring mt-1 w-full rounded-md border border-line bg-mist/40 px-3 py-3"
                    placeholder="Required after first admin exists"
                  />
                </label>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-black text-white transition hover:bg-pine disabled:opacity-60"
              >
                <UserPlus size={18} />
                {submitting ? 'Creating...' : 'Signup'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-black text-pine">
                Login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Signup;
