import Invite from '../models/Invite.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildInviteUrl } from '../utils/appUrls.js';
import { createPlainToken, hashToken } from '../utils/crypto.js';
import { sendInviteEmail } from '../utils/email.js';

const inviteResponse = (invite, token = null) => ({
  id: invite._id,
  email: invite.email,
  role: invite.role,
  invitedBy: invite.invitedBy,
  expiresAt: invite.expiresAt,
  acceptedAt: invite.acceptedAt,
  cancelledAt: invite.cancelledAt,
  cancelledBy: invite.cancelledBy,
  createdAt: invite.createdAt,
  inviteUrl: token ? buildInviteUrl(token) : undefined,
  emailSent: invite.emailSent
});

export const createInvite = asyncHandler(async (req, res) => {
  const { email, role = 'member' } = req.body;

  const existingUser = await User.exists({ email });
  if (existingUser) {
    res.status(409);
    throw new Error('A user with this email already exists');
  }

  const token = createPlainToken();
  const inviteUrl = buildInviteUrl(token);
  const invite = await Invite.create({
    email,
    role,
    tokenHash: hashToken(token),
    invitedBy: req.user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  const mail = await sendInviteEmail({
    to: email,
    inviteUrl,
    role,
    invitedBy: req.user.name
  });

  const response = inviteResponse(invite, token);
  response.emailSent = mail.sent;
  response.emailMessage = mail.sent
    ? 'Invite email sent.'
    : `${mail.reason || 'Email could not be sent'}. Use this invite link manually.`;

  res.status(201).json(response);
});

export const getInvites = asyncHandler(async (_req, res) => {
  const invites = await Invite.find()
    .populate('invitedBy', 'name email role')
    .populate('cancelledBy', 'name email role')
    .sort({ createdAt: -1 });

  res.json(invites.map((invite) => inviteResponse(invite)));
});

export const verifyInvite = asyncHandler(async (req, res) => {
  const invite = await Invite.findOne({
    tokenHash: hashToken(req.params.token),
    acceptedAt: null,
    cancelledAt: null,
    expiresAt: { $gt: new Date() }
  });

  if (!invite) {
    res.status(404);
    throw new Error('Invite is invalid or expired');
  }

  res.json({ email: invite.email, role: invite.role, expiresAt: invite.expiresAt });
});

export const cancelInvite = asyncHandler(async (req, res) => {
  const invite = await Invite.findById(req.params.id);

  if (!invite) {
    res.status(404);
    throw new Error('Invite not found');
  }

  if (invite.acceptedAt) {
    res.status(400);
    throw new Error('Accepted invites cannot be cancelled');
  }

  if (!invite.cancelledAt) {
    invite.cancelledAt = new Date();
    invite.cancelledBy = req.user._id;
    await invite.save();
  }

  res.json(inviteResponse(invite));
});

export const deleteInvite = asyncHandler(async (req, res) => {
  const invite = await Invite.findById(req.params.id);

  if (!invite) {
    res.status(404);
    throw new Error('Invite not found');
  }

  await invite.deleteOne();
  res.json({ message: 'Invite removed' });
});
