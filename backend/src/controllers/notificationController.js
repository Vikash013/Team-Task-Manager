import Task from '../models/Task.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getOverdueNotifications = asyncHandler(async (req, res) => {
  const filter = {
    status: { $ne: 'Done' },
    dueDate: { $lt: new Date() },
    ...(req.user.role === 'admin' ? {} : { assignedTo: req.user._id })
  };

  const tasks = await Task.find(filter)
    .populate('project', 'name')
    .populate('assignedTo', 'name email role')
    .sort({ dueDate: 1 });

  res.json({
    count: tasks.length,
    notifications: tasks.map((task) => ({
      id: task._id,
      type: 'overdue-task',
      title: task.title,
      message: `${task.title} is overdue`,
      priority: task.priority,
      dueDate: task.dueDate,
      project: task.project,
      assignedTo: task.assignedTo
    }))
  });
});
