import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const populateTask = (query) =>
  query
    .populate('project', 'name description teamMembers')
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role')
    .populate('comments.user', 'name email role')
    .populate('activity.user', 'name email role');

const ensureTaskAssignmentIsValid = async (projectId, assignedTo) => {
  const [project, assignedUser] = await Promise.all([
    Project.findById(projectId),
    User.findById(assignedTo)
  ]);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  if (!assignedUser || assignedUser.role !== 'member') {
    const error = new Error('Tasks can only be assigned to member users');
    error.statusCode = 400;
    throw error;
  }

  if (!project.teamMembers.some((memberId) => memberId.equals(assignedUser._id))) {
    const error = new Error('Assigned member must be on the project team');
    error.statusCode = 400;
    throw error;
  }
};

export const getTasks = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };
  const tasks = await populateTask(Task.find(filter).sort({ dueDate: 1, createdAt: -1 }));
  res.json(tasks);
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await populateTask(Task.findById(req.params.id));

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (req.user.role !== 'admin' && !task.assignedTo._id.equals(req.user._id)) {
    res.status(403);
    throw new Error('You can only view assigned tasks');
  }

  res.json(task);
});

export const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description = '',
    status = 'Todo',
    priority = 'Medium',
    tags = [],
    dueDate,
    project,
    assignedTo
  } = req.body;
  await ensureTaskAssignmentIsValid(project, assignedTo);

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    tags,
    dueDate,
    project,
    assignedTo,
    createdBy: req.user._id,
    activity: [
      {
        action: 'Task created',
        user: req.user._id,
        details: `Priority: ${priority}`
      }
    ]
  });

  res.status(201).json(await populateTask(Task.findById(task._id)));
});

export const updateTask = asyncHandler(async (req, res) => {
  const {
    title,
    description = '',
    status = 'Todo',
    priority = 'Medium',
    tags = [],
    dueDate,
    project,
    assignedTo
  } = req.body;
  await ensureTaskAssignmentIsValid(project, assignedTo);

  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const notes = [];
  if (task.status !== status) notes.push(`Status: ${task.status} to ${status}`);
  if (task.priority !== priority) notes.push(`Priority: ${task.priority} to ${priority}`);
  if (!task.assignedTo.equals(assignedTo)) notes.push('Assignment changed');

  task.set({ title, description, status, priority, tags, dueDate, project, assignedTo });
  task.activity.push({
    action: 'Task updated',
    user: req.user._id,
    details: notes.join(', ') || 'Task details updated'
  });
  await task.save();

  res.json(await populateTask(Task.findById(task._id)));
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (req.user.role !== 'admin' && !task.assignedTo.equals(req.user._id)) {
    res.status(403);
    throw new Error('You can only update the status of assigned tasks');
  }

  task.status = req.body.status;
  task.activity.push({
    action: 'Status changed',
    user: req.user._id,
    details: `Moved to ${req.body.status}`
  });
  await task.save();

  res.json(await populateTask(Task.findById(task._id)));
});

export const addTaskComment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (req.user.role !== 'admin' && !task.assignedTo.equals(req.user._id)) {
    res.status(403);
    throw new Error('You can only comment on assigned tasks');
  }

  task.comments.push({
    body: req.body.body,
    user: req.user._id
  });
  task.activity.push({
    action: 'Comment added',
    user: req.user._id,
    details: req.body.body.slice(0, 90)
  });
  await task.save();

  res.status(201).json(await populateTask(Task.findById(task._id)));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await task.deleteOne();
  res.json({ message: 'Task deleted' });
});
