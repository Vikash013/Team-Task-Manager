import { useEffect, useState } from 'react';
import PriorityBadge from '../components/PriorityBadge.jsx';
import StatCard from '../components/StatCard.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { TASK_STATUSES } from '../constants/taskOptions.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getDashboardRequest } from '../services/dashboardService.js';
import { updateTaskStatusRequest } from '../services/taskService.js';
import { getErrorMessage } from '../utils/errors.js';

const Dashboard = () => {
  const { isAdmin, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const { data } = await getDashboardRequest();
      setDashboard(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const updateStatus = async (taskId, status) => {
    try {
      await updateTaskStatusRequest(taskId, status);
      fetchDashboard();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (error) return <div className="rounded-md bg-red-50 p-4 font-semibold text-coral">{error}</div>;
  if (!dashboard) return <div className="text-sm font-semibold text-slate-600">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase text-pine">{isAdmin ? 'Admin dashboard' : 'Member dashboard'}</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
          {isAdmin ? 'Control projects, teams, and assignments' : `Your assigned work, ${user.name}`}
        </h1>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tasks" value={dashboard.summary.totalTasks} />
        <StatCard label="Projects" value={dashboard.summary.totalProjects} tone="success" />
        <StatCard label="Overdue" value={dashboard.summary.overdueTasks} tone="danger" />
        <StatCard label="Completion" value={`${dashboard.summary.completionRate}%`} tone="warn" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-md border border-line bg-ink text-white shadow-soft">
          <div className="bg-gradient-to-r from-pine via-ink to-coral p-5">
            <p className="text-sm font-bold uppercase text-white/75">{isAdmin ? 'Command center' : 'Focus mode'}</p>
            <h2 className="mt-1 text-2xl font-black">
              {dashboard.summary.overdueTasks
                ? `${dashboard.summary.overdueTasks} overdue task${dashboard.summary.overdueTasks > 1 ? 's' : ''} need attention`
                : 'Everything urgent is under control'}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
            {Object.entries(dashboard.priorityCounts).map(([priority, count]) => (
              <div key={priority} className="bg-ink/80 p-4">
                <PriorityBadge priority={priority} />
                <p className="mt-3 text-3xl font-black">{count}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <h2 className="text-lg font-black text-ink">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            {dashboard.recentActivity?.map((item) => (
              <div key={item._id || `${item.task._id}-${item.createdAt}`} className="border-l-4 border-pine pl-3">
                <p className="text-sm font-black text-ink">{item.action}</p>
                <p className="text-xs font-semibold text-slate-600">{item.task.title}</p>
                {item.details ? <p className="text-xs text-slate-500">{item.details}</p> : null}
              </div>
            ))}
            {!dashboard.recentActivity?.length ? <p className="text-sm font-semibold text-slate-500">No activity yet.</p> : null}
          </div>
        </div>
      </section>

      {dashboard.overdue.length ? (
        <section>
          <h2 className="text-xl font-black text-ink">Overdue Tasks</h2>
          <div className="mt-3 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {dashboard.overdue.map((task) => (
              <TaskCard key={task._id} task={task} onStatusChange={updateStatus} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-3">
        {TASK_STATUSES.map((status) => (
          <div key={status}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-black text-ink">{status}</h2>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-600 shadow-sm">
                {dashboard.grouped[status]?.length || 0}
              </span>
            </div>
            <div className="space-y-4">
              {(dashboard.grouped[status] || []).map((task) => (
                <TaskCard key={task._id} task={task} onStatusChange={updateStatus} />
              ))}
              {!dashboard.grouped[status]?.length ? (
                <div className="rounded-md border border-dashed border-line bg-white p-4 text-sm font-semibold text-slate-500">
                  No tasks in this status.
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;
