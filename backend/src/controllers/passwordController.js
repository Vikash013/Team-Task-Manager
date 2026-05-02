import PasswordReset from '../models/PasswordReset.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildResetUrl } from '../utils/appUrls.js';
import { createPlainToken, hashToken } from '../utils/crypto.js';
import { sendPasswordResetEmail } from '../utils/email.js';

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.json({ message: 'If an account exists, a reset link has been prepared.' });
  }

  const token = createPlainToken();
  const resetUrl = buildResetUrl(token);
  const reset = await PasswordReset.create({
    user: user._id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
  });

  const mail = await sendPasswordResetEmail({
    to: user.email,
    resetUrl
  });

  res.json({
    message: mail.sent
      ? 'Password reset email sent.'
      : `${mail.reason || 'Email could not be sent'}. Use this reset link manually.`,
    resetUrl: mail.sent ? undefined : resetUrl,
    emailSent: mail.sent,
    expiresAt: reset.expiresAt
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const reset = await PasswordReset.findOne({
    tokenHash: hashToken(req.body.token),
    usedAt: null,
    expiresAt: { $gt: new Date() }
  });

  if (!reset) {
    res.status(400);
    throw new Error('Reset token is invalid or expired');
  }

  const user = await User.findById(reset.user);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.password = req.body.password;
  await user.save();

  reset.usedAt = new Date();
  await reset.save();

  res.json({ message: 'Password updated successfully' });
});
