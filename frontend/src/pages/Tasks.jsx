import { Filter, MessageSquare, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PriorityBadge from '../components/PriorityBadge.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { ALL_FILTER, TASK_PRIORITIES, TASK_STATUSES } from '../constants/taskOptions.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getProjectsRequest } from '../services/projectService.js';
import {
  addTaskCommentRequest,
  createTaskRequest,
  deleteTaskRequest,
  getTasksRequest,
  updateTaskRequest,
  updateTaskStatusRequest
} from '../services/taskService.js';
import { getMembersRequest } from '../services/userService.js';
import { getErrorMessage } from '../utils/errors.js';
import { parseTags, taskMatchesFilters } from '../utils/taskHelpers.js';

const emptyTask = {
  title: '',
  description: '',
  status: 'Todo',
  priority: 'Medium',
  tags: '',
  dueDate: '',
  project: '',
  assignedTo: ''
};

const Tasks = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [editingId, setEditingId] = useState('');
  const [filters, setFilters] = useState({ status: ALL_FILTER, priority: ALL_FILTER, query: '' });
  const [commentText, setCommentText] = useState({});
  const [error, setError] = useState('');

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === form.project),
    [projects, form.project]
  );

  const assignableMembers = selectedProject?.teamMembers || members;
  const filteredTasks = tasks.filter((task) => taskMatchesFilters(task, filters));

  const load = async () => {
    try {
      const [tasksResponse, projectsResponse, membersResponse] = await Promise.all([
        getTasksRequest(),
        getProjectsRequest(),
        isAdmin ? getMembersRequest() : Promise.resolve({ data: [] })
      ]);
      setTasks(tasksResponse.data);
      setProjects(projectsResponse.data);
      setMembers(membersResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  const reset = () => {
    setForm(emptyTask);
    setEditingId('');
  };

  const submitTask = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await updateTaskRequest(editingId, { ...form, tags: parseTags(form.tags) });
      } else {
        await createTaskRequest({ ...form, tags: parseTags(form.tags) });
      }
      reset();
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const editTask = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'Medium',
      tags: task.tags?.join(', ') || '',
      dueDate: task.dueDate.slice(0, 10),
      project: task.project?._id || '',
      assignedTo: task.assignedTo?._id || ''
    });
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTaskRequest(taskId);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const changeStatus = async (taskId, status) => {
    try {
      await updateTaskStatusRequest(taskId, status);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const addComment = async (taskId) => {
    const body = commentText[taskId]?.trim();
    if (!body) return;
    try {
      await addTaskCommentRequest(taskId, body);
      setCommentText((current) => ({ ...current, [taskId]: '' }));
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase text-pine">{isAdmin ? 'Task administration' : 'Assigned tasks'}</p>
        <h1 className="mt-1 text-3xl font-black text-ink">
          {isAdmin ? 'Create, assign, and track tasks' : 'Update progress on your work'}
        </h1>
      </section>

      {error ? <div className="rounded-md bg-red-50 p-4 font-semibold text-coral">{error}</div> : null}

      {isAdmin ? (
        <form onSubmit={submitTask} className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="grid gap-4 lg:grid-cols-4">
            <label>
              <span className="text-sm font-bold">Task title</span>
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
                required
              />
            </label>
            <label>
              <span className="text-sm font-bold">Project</span>
              <select
                value={form.project}
                onChange={(event) => setForm({ ...form, project: event.target.value, assignedTo: '' })}
                className="focus-ring mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
                required
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-bold">Assigned member</span>
              <select
                value={form.assignedTo}
                onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}
                className="focus-ring mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
                required
              >
                <option value="">Select member</option>
                {assignableMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-bold">Due date</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
                required
              />
            </label>
            <label>
              <span className="text-sm font-bold">Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
                className="focus-ring mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-bold">Priority</span>
              <select
                value={form.priority}
                onChange={(event) => setForm({ ...form, priority: event.target.value })}
                className="focus-ring mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-bold">Description</span>
              <input
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
              />
            </label>
            <label>
              <span className="text-sm font-bold">Tags</span>
              <input
                value={form.tags}
                onChange={(event) => setForm({ ...form, tags: event.target.value })}
                className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
                placeholder="design, launch, qa"
              />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className="focus-ring inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 font-bold text-white">
              {editingId ? <Save size={17} /> : <Plus size={17} />}
              {editingId ? 'Save Task' : 'Create Task'}
            </button>
            {editingId ? (
              <button type="button" onClick={reset} className="focus-ring rounded-md border border-line px-4 py-2 font-bold">
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      <section className="rounded-md border border-line bg-white p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <label>
            <span className="flex items-center gap-2 text-sm font-bold">
              <Filter size={16} />
              Search
            </span>
            <input
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="Task, project, or description"
            />
          </label>
          <label>
            <span className="text-sm font-bold">Status</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              className="focus-ring mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
            >
              <option>{ALL_FILTER}</option>
              {TASK_STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-sm font-bold">Priority</span>
            <select
              value={filters.priority}
              onChange={(event) => setFilters({ ...filters, priority: event.target.value })}
              className="focus-ring mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
            >
              <option>{ALL_FILTER}</option>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-mist">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">Task</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">Project</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">Assigned</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">Due</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">Collaboration</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredTasks.map((task) => (
                <tr key={task._id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-bold text-ink">{task.title}</p>
                    <p className="text-sm text-slate-600">{task.description}</p>
                    {task.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-bold text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">{task.project?.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{task.assignedTo?.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{task.dueDate?.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <StatusBadge status={task.status} />
                    ) : (
                      <select
                        value={task.status}
                        onChange={(event) => changeStatus(task._id, event.target.value)}
                        className="focus-ring rounded-md border border-line bg-white px-2 py-1 text-sm font-semibold"
                      >
                        {TASK_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="min-w-72 px-4 py-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-600">
                        <MessageSquare size={14} />
                        {task.comments?.length || 0} comments
                      </div>
                      <div className="max-h-24 space-y-2 overflow-y-auto rounded-md bg-mist p-2">
                        {task.comments?.slice(-2).map((comment) => (
                          <div key={comment._id} className="text-xs">
                            <p className="font-black text-ink">{comment.user?.name || 'User'}</p>
                            <p className="text-slate-600">{comment.body}</p>
                          </div>
                        ))}
                        {!task.comments?.length ? <p className="text-xs font-semibold text-slate-500">No comments yet.</p> : null}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={commentText[task._id] || ''}
                          onChange={(event) => setCommentText({ ...commentText, [task._id]: event.target.value })}
                          className="focus-ring w-full rounded-md border border-line px-2 py-1 text-sm"
                          placeholder="Add comment"
                        />
                        <button
                          type="button"
                          onClick={() => addComment(task._id)}
                          className="focus-ring rounded-md bg-ink px-3 py-1 text-sm font-bold text-white"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isAdmin ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => editTask(task)} className="focus-ring rounded-md border border-line p-2" type="button">
                          <Save size={16} />
                        </button>
                        <button onClick={() => deleteTask(task._id)} className="focus-ring rounded-md bg-coral p-2 text-white" type="button">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">Status only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Tasks;
