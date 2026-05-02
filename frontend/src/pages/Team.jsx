import { ShieldAlert, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getUsersRequest, removeUserRequest } from '../services/userService.js';
import { getErrorMessage } from '../utils/errors.js';

const MAIN_ADMIN_EMAIL = 'vlistenmusic@gmail.com';

const Team = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [passwords, setPasswords] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const { data } = await getUsersRequest();
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const removeUser = async (targetUser) => {
    const password = passwords[targetUser._id];
    if (!password) {
      setError('Enter the main admin password before removing a user.');
      return;
    }

    if (!window.confirm(`Remove ${targetUser.name}? Assigned tasks for this user will be deleted.`)) return;

    setError('');
    setMessage('');
    try {
      const { data } = await removeUserRequest(targetUser._id, password);
      setMessage(data.message);
      setPasswords((current) => ({ ...current, [targetUser._id]: '' }));
      loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const currentUserIsMainAdmin = user.email?.toLowerCase() === MAIN_ADMIN_EMAIL;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase text-pine">Main admin security</p>
        <h1 className="mt-1 text-3xl font-black text-ink">Manage admins and members</h1>
      </section>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 shrink-0" size={20} />
          <p>
            Only the main admin account, {MAIN_ADMIN_EMAIL}, can remove users. Each removal requires the separate user removal password.
          </p>
        </div>
      </div>

      {error ? <div className="rounded-md bg-red-50 p-4 font-semibold text-coral">{error}</div> : null}
      {message ? <div className="rounded-md bg-emerald-50 p-4 font-semibold text-pine">{message}</div> : null}

      <section className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
        <div className="flex items-center gap-3 border-b border-line bg-mist px-4 py-3">
          <Users size={18} />
          <h2 className="font-black text-ink">Workspace Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">User</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">Role</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">Removal password</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((item) => {
                const isMainAdminAccount = item.email?.toLowerCase() === MAIN_ADMIN_EMAIL;
                const canRemove = currentUserIsMainAdmin && !isMainAdminAccount;

                return (
                  <tr key={item._id}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-ink">{item.name}</p>
                      <p className="text-sm text-slate-600">{item.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-mist px-2.5 py-1 text-xs font-black uppercase text-pine">
                        {item.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {canRemove ? (
                        <input
                          type="password"
                          value={passwords[item._id] || ''}
                          onChange={(event) => setPasswords({ ...passwords, [item._id]: event.target.value })}
                          className="focus-ring w-full min-w-56 rounded-md border border-line px-3 py-2"
                          placeholder="User removal password"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-slate-500">
                          {isMainAdminAccount ? 'Protected account' : 'Main admin only'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canRemove ? (
                        <button
                          type="button"
                          onClick={() => removeUser(item)}
                          className="focus-ring inline-flex items-center gap-2 rounded-md bg-coral px-3 py-2 text-sm font-bold text-white"
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">Locked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Team;
