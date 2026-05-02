import { Save } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { resetPasswordRequest } from '../services/authService.js';
import { getErrorMessage } from '../utils/errors.js';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { data } = await resetPasswordRequest(token, password);
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4">
      <div className="w-full max-w-md rounded-md border border-line bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-black text-ink">Choose New Password</h1>
        {error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-coral">{error}</div> : null}
        {message ? <div className="mt-4 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-pine">{message}</div> : null}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-ink">New password</span>
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
              required
            />
          </label>
          <button className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-pine px-4 py-2.5 font-bold text-white">
            <Save size={18} />
            Save Password
          </button>
        </form>
        <Link to="/login" className="mt-5 block text-center text-sm font-bold text-pine">
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
