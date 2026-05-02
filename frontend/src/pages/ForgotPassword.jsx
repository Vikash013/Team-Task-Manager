import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordRequest } from '../services/authService.js';
import { getErrorMessage } from '../utils/errors.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResetUrl('');
    try {
      const { data } = await forgotPasswordRequest(email);
      setMessage(data.message);
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4">
      <div className="w-full max-w-md rounded-md border border-line bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-black text-ink">Reset Password</h1>
        <p className="mt-2 text-sm text-slate-600">Enter your account email to generate a reset link.</p>
        {error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-coral">{error}</div> : null}
        {message ? <div className="mt-4 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-pine">{message}</div> : null}
        {resetUrl ? (
          <a href={resetUrl} className="mt-3 block break-all rounded-md border border-line bg-mist p-3 text-sm font-bold text-pine">
            {resetUrl}
          </a>
        ) : null}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-ink">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
              required
            />
          </label>
          <button className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-pine px-4 py-2.5 font-bold text-white">
            <KeyRound size={18} />
            Generate Link
          </button>
        </form>
        <Link to="/login" className="mt-5 block text-center text-sm font-bold text-pine">
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
