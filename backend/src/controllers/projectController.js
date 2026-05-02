import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const populateProject = (query) => query.populate('teamMembers', 'name email role').populate('createdBy', 'name email role');

const ensureMembersExist = async (memberIds = []) => {
  if (!memberIds.length) return;
  const count = await User.countDocuments({ _id: { $in: memberIds }, role: 'member' });
  if (count !== new Set(memberIds.map(String)).size) {
    const error = new Error('All team members must be valid member users');
    error.statusCode = 400;
    throw error;
  }
};

export const getProjects = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { teamMembers: req.user._id };
  const projects = await populateProject(Project.find(filter).sort({ createdAt: -1 }));
  res.json(projects);
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await populateProject(Project.findById(req.params.id));

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isTeamMember = project.teamMembers.some((member) => member._id.equals(req.user._id));

  if (req.user.role !== 'admin' && !isTeamMember) {
    res.status(403);
    throw new Error('You can only view projects where you are a team member');
  }

  res.json(project);
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, description = '', teamMembers = [] } = req.body;
  await ensureMembersExist(teamMembers);

  const project = await Project.create({
    name,
    description,
    teamMembers,
    createdBy: req.user._id
  });

  res.status(201).json(await populateProject(Project.findById(project._id)));
});

export const updateProject = asyncHandler(async (req, res) => {
  const { name, description = '', teamMembers = [] } = req.body;
  await ensureMembersExist(teamMembers);

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { name, description, teamMembers },
    { new: true, runValidators: true }
  );

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.json(await populateProject(Project.findById(project._id)));
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ message: 'Project and related tasks deleted' });
});
