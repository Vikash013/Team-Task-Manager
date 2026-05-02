import { Check, Copy, Link2, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  cancelInviteRequest,
  createInviteRequest,
  deleteInviteRequest,
  getInvitesRequest
} from '../services/inviteService.js';
import { getErrorMessage } from '../utils/errors.js';

const Invites = () => {
  const [invites, setInvites] = useState([]);
  const [form, setForm] = useState({ email: '', role: 'member' });
  const [latestLink, setLatestLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadInvites = async () => {
    try {
      const { data } = await getInvitesRequest();
      setInvites(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const submitInvite = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setLatestLink('');
    setCopied(false);
    try {
      const { data } = await createInviteRequest(form);
      setNotice(data.emailMessage || 'Invite created.');
      if (data.inviteUrl) setLatestLink(data.inviteUrl);
      setForm({ email: '', role: 'member' });
      loadInvites();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const copyLatestLink = async () => {
    setError('');
    try {
      await navigator.clipboard.writeText(latestLink);
      setCopied(true);
      setNotice('Invite link copied.');
    } catch (_err) {
      setError('Copy failed. Select and copy the invite link manually.');
    }
  };

  const cancelInvite = async (inviteId) => {
    if (!window.confirm('Cancel this invite? The link will stop working.')) return;
    setError('');
    try {
      await cancelInviteRequest(inviteId);
      loadInvites();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const removeInvite = async (inviteId) => {
    if (!window.confirm('Remove this invite from history?')) return;
    setError('');
    try {
      await deleteInviteRequest(inviteId);
      loadInvites();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const getInviteStatus = (invite) => {
    if (invite.acceptedAt) return 'Accepted';
    if (invite.cancelledAt) return 'Cancelled';
    if (new Date(invite.expiresAt) < new Date()) return 'Expired';
    return 'Pending';
  };

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase text-pine">Manual invitations</p>
        <h1 className="mt-1 text-3xl font-black text-ink">Create invite links</h1>
      </section>

      {error ? <div className="rounded-md bg-red-50 p-4 font-semibold text-coral">{error}</div> : null}
      {notice ? <div className="rounded-md bg-emerald-50 p-4 font-semibold text-pine">{notice}</div> : null}

      <form onSubmit={submitInvite} className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
          <label>
            <span className="text-sm font-bold">Recipient email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
              required
            />
          </label>
          <label>
            <span className="text-sm font-bold">Role</span>
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="focus-ring mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button className="focus-ring mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-pine px-4 py-2 font-bold text-white">
            <Link2 size={18} />
            Create Link
          </button>
        </div>
        {latestLink ? (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-pine">Invite link</p>
                <a href={latestLink} className="break-all text-sm font-semibold text-ink">
                  {latestLink}
                </a>
              </div>
              <button
                type="button"
                onClick={copyLatestLink}
                className="focus-ring inline-flex items-center gap-2 rounded-md bg-pine px-3 py-1.5 text-sm font-bold text-white"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </div>
        ) : null}
      </form>

      <section className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
        <table className="min-w-full divide-y divide-line">
          <thead className="bg-mist">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">Recipient</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">Role</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">Expires</th>
              <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {invites.map((invite) => (
              <tr key={invite.id}>
                <td className="px-4 py-3 text-sm font-bold">{invite.email}</td>
                <td className="px-4 py-3 text-sm capitalize">{invite.role}</td>
                <td className="px-4 py-3 text-sm font-semibold">{getInviteStatus(invite)}</td>
                <td className="px-4 py-3 text-sm">{new Date(invite.expiresAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {!invite.acceptedAt && !invite.cancelledAt && new Date(invite.expiresAt) > new Date() ? (
                      <button
                        type="button"
                        onClick={() => cancelInvite(invite.id)}
                        className="focus-ring inline-flex items-center gap-2 rounded-md bg-coral px-3 py-1.5 text-sm font-bold text-white"
                      >
                        <XCircle size={15} />
                        Cancel
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeInvite(invite.id)}
                      className="focus-ring inline-flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm font-bold text-ink"
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Invites;
