import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  createProjectRequest,
  deleteProjectRequest,
  getProjectsRequest,
  updateProjectRequest
} from '../services/projectService.js';
import { getMembersRequest } from '../services/userService.js';
import { getErrorMessage } from '../utils/errors.js';

const emptyProject = { name: '', description: '', teamMembers: [] };

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [projectsResponse, membersResponse] = await Promise.all([
        getProjectsRequest(),
        isAdmin ? getMembersRequest() : Promise.resolve({ data: [] })
      ]);
      setProjects(projectsResponse.data);
      setMembers(membersResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  const toggleMember = (memberId) => {
    setForm((current) => ({
      ...current,
      teamMembers: current.teamMembers.includes(memberId)
        ? current.teamMembers.filter((id) => id !== memberId)
        : [...current.teamMembers, memberId]
    }));
  };

  const reset = () => {
    setForm(emptyProject);
    setEditingId('');
  };

  const submitProject = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await updateProjectRequest(editingId, form);
      } else {
        await createProjectRequest(form);
      }
      reset();
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const editProject = (project) => {
    setEditingId(project._id);
    setForm({
      name: project.name,
      description: project.description || '',
      teamMembers: project.teamMembers?.map((member) => member._id) || []
    });
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project and its tasks?')) return;
    try {
      await deleteProjectRequest(projectId);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase text-pine">{isAdmin ? 'Project administration' : 'Project visibility'}</p>
        <h1 className="mt-1 text-3xl font-black text-ink">
          {isAdmin ? 'Create projects and manage teams' : 'Projects where you are a team member'}
        </h1>
      </section>

      {error ? <div className="rounded-md bg-red-50 p-4 font-semibold text-coral">{error}</div> : null}

      {isAdmin ? (
        <form onSubmit={submitProject} className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="grid gap-4 lg:grid-cols-2">
            <label>
              <span className="text-sm font-bold">Project name</span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
                required
              />
            </label>
            <label>
              <span className="text-sm font-bold">Description</span>
              <input
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
              />
            </label>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold">Team members</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <label key={member._id} className="flex items-center gap-2 rounded-md border border-line p-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={form.teamMembers.includes(member._id)}
                    onChange={() => toggleMember(member._id)}
                    className="h-4 w-4 accent-pine"
                  />
                  {member.name}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className="focus-ring inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 font-bold text-white">
              {editingId ? <Save size={17} /> : <Plus size={17} />}
              {editingId ? 'Save Project' : 'Create Project'}
            </button>
            {editingId ? (
              <button type="button" onClick={reset} className="focus-ring rounded-md border border-line px-4 py-2 font-bold">
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        {projects.map((project) => (
          <article key={project._id} className="rounded-md border border-line bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-ink">{project.name}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{project.description || 'No description'}</p>
              </div>
              {isAdmin ? (
                <div className="flex gap-2">
                  <button onClick={() => editProject(project)} className="focus-ring rounded-md border border-line p-2" type="button">
                    <Save size={16} />
                  </button>
                  <button onClick={() => deleteProject(project._id)} className="focus-ring rounded-md bg-coral p-2 text-white" type="button">
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.teamMembers?.map((member) => (
                <span key={member._id} className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-ink">
                  {member.name}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Projects;
