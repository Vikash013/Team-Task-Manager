import User from '../models/User.js';
import Invite from '../models/Invite.js';
import asyncHandler from '../utils/asyncHandler.js';
import { hashToken } from '../utils/crypto.js';
import { createToken } from '../utils/token.js';

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'member', adminSetupKey, inviteToken } = req.body;

  let resolvedRole = 'member';
  const wantsAdmin = role === 'admin';
  let invite = null;

  if (inviteToken) {
    invite = await Invite.findOne({
      tokenHash: hashToken(inviteToken),
      acceptedAt: null,
      cancelledAt: null,
      expiresAt: { $gt: new Date() }
    });

    if (!invite) {
      res.status(400);
      throw new Error('Invite is invalid or expired');
    }

    if (invite.email !== email) {
      res.status(400);
      throw new Error('Invite email must match signup email');
    }

    resolvedRole = invite.role;
  }

  if (!invite && wantsAdmin) {
    const hasAdmin = await User.exists({ role: 'admin' });
    const setupKeyConfigured = Boolean(process.env.ADMIN_SETUP_KEY);
    const setupKeyAllowsAdmin = setupKeyConfigured && adminSetupKey === process.env.ADMIN_SETUP_KEY;

    if (setupKeyAllowsAdmin || (!setupKeyConfigured && !hasAdmin)) {
      resolvedRole = 'admin';
    } else {
      res.status(403);
      throw new Error('Admin signup requires a valid setup key');
    }
  }

  const user = await User.create({ name, email, password, role: resolvedRole });

  if (invite) {
    invite.acceptedAt = new Date();
    await invite.save();
  }

  res.status(201).json({
    user: sanitizeUser(user),
    token: createToken(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    user: sanitizeUser(user),
    token: createToken(user)
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});
