import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getMainAdminEmail, isMainAdmin } from '../utils/mainAdmin.js';

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select('-password').sort({ name: 1 });
  res.json(users);
});

export const getMembers = asyncHandler(async (_req, res) => {
  const members = await User.find({ role: 'member' }).select('-password').sort({ name: 1 });
  res.json(members);
});

export const removeUser = asyncHandler(async (req, res) => {
  const { removalPassword } = req.body;

  if (!isMainAdmin(req.user)) {
    res.status(403);
    throw new Error(`Only the main admin (${getMainAdminEmail()}) can remove users`);
  }

  if (!process.env.USER_REMOVAL_PASSWORD) {
    res.status(500);
    throw new Error('USER_REMOVAL_PASSWORD is not configured');
  }

  if (!removalPassword) {
    res.status(400);
    throw new Error('User removal password is required');
  }

  if (removalPassword !== process.env.USER_REMOVAL_PASSWORD) {
    res.status(401);
    throw new Error('User removal password is incorrect');
  }

  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }

  if (targetUser.email.toLowerCase() === getMainAdminEmail()) {
    res.status(400);
    throw new Error('The main admin account cannot be removed');
  }

  await Promise.all([
    Project.updateMany({ teamMembers: targetUser._id }, { $pull: { teamMembers: targetUser._id } }),
    Task.deleteMany({ assignedTo: targetUser._id })
  ]);

  await targetUser.deleteOne();

  res.json({
    message: `${targetUser.name} was removed. Assigned tasks were deleted and project team membership was cleaned up.`
  });
});
