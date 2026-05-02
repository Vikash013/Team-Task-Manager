import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { TASK_PRIORITIES, TASK_STATUSES } from '../constants/taskConstants.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const taskFilter = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };
  const projectFilter = req.user.role === 'admin' ? {} : { teamMembers: req.user._id };

  const [tasks, projectsCount, membersCount] = await Promise.all([
    Task.find(taskFilter)
      .populate('project', 'name')
      .populate('assignedTo', 'name email role')
      .populate('activity.user', 'name email role')
      .sort({ dueDate: 1 }),
    Project.countDocuments(projectFilter),
    req.user.role === 'admin' ? User.countDocuments({ role: 'member' }) : Promise.resolve(undefined)
  ]);

  const grouped = TASK_STATUSES.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => task.status === status);
    return acc;
  }, {});

  const overdue = tasks.filter((task) => task.status !== 'Done' && task.dueDate < now);
  const priorityCounts = TASK_PRIORITIES.reduce((acc, priority) => {
    acc[priority] = tasks.filter((task) => task.priority === priority).length;
    return acc;
  }, {});
  const recentActivity = tasks
    .flatMap((task) =>
      (task.activity || []).map((item) => ({
        ...item.toObject(),
        task: { _id: task._id, title: task.title, priority: task.priority }
      }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  res.json({
    role: req.user.role,
    summary: {
      totalTasks: tasks.length,
      totalProjects: projectsCount,
      totalMembers: membersCount,
      overdueTasks: overdue.length,
      doneTasks: grouped.Done.length,
      completionRate: tasks.length ? Math.round((grouped.Done.length / tasks.length) * 100) : 0
    },
    grouped,
    priorityCounts,
    recentActivity,
    overdue,
    assignedToMe: req.user.role === 'admin' ? tasks.filter((task) => task.assignedTo?._id.equals(req.user._id)) : tasks
  });
});
