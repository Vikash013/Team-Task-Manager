import { UserPlus } from 'lucide-react';
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
    <div className="flex min-h-screen items-center justify-center bg-mist px-4 py-8">
      <div className="w-full max-w-lg rounded-md border border-line bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-black text-ink">Create Workspace Account</h1>
        <p className="mt-2 text-sm text-slate-600">Members join task flow. Admins manage projects, teams, and assignments.</p>
        {invite ? (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-pine">
            Invite verified for {invite.email} as {invite.role}.
          </div>
        ) : null}
        {error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-coral">{error}</div> : null}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-ink">Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-ink">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
              readOnly={Boolean(invite)}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-ink">Password</span>
            <input
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-ink">Role</span>
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="focus-ring mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
              disabled={Boolean(invite)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {form.role === 'admin' ? (
            <label className="block">
              <span className="text-sm font-bold text-ink">Admin setup key</span>
              <input
                value={form.adminSetupKey}
                onChange={(event) => setForm({ ...form, adminSetupKey: event.target.value })}
                className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
                placeholder="Required after first admin exists"
              />
            </label>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-pine px-4 py-2.5 font-bold text-white disabled:opacity-60"
          >
            <UserPlus size={18} />
            {submitting ? 'Creating...' : 'Signup'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-pine">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
