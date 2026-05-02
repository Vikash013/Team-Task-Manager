import { format, isBefore } from 'date-fns';
import { CalendarDays, MessageSquare, Sparkles } from 'lucide-react';
import { TASK_STATUSES } from '../constants/taskOptions.js';
import { useAuth } from '../context/AuthContext.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import StatusBadge from './StatusBadge.jsx';

const TaskCard = ({ task, onStatusChange }) => {
  const { isAdmin } = useAuth();
  const overdue = task.status !== 'Done' && isBefore(new Date(task.dueDate), new Date());

  return (
    <article className="relative overflow-hidden rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pine via-gold to-coral" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-ink">{task.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{task.project?.name || 'No project'}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </div>
      {task.description ? <p className="mt-3 text-sm leading-6 text-slate-700">{task.description}</p> : null}
      {task.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-mist px-2 py-1 text-[11px] font-bold text-slate-600">
              <Sparkles size={11} />
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
        <span className={`inline-flex items-center gap-1 ${overdue ? 'text-coral' : ''}`}>
          <CalendarDays size={14} />
          {format(new Date(task.dueDate), 'MMM d, yyyy')}
        </span>
        <span>Assigned to {task.assignedTo?.name || 'Member'}</span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare size={14} />
          {task.comments?.length || 0}
        </span>
      </div>
      <div className="mt-4">
        <label className="text-xs font-bold uppercase text-slate-500">Status</label>
        <select
          value={task.status}
          onChange={(event) => onStatusChange(task._id, event.target.value)}
          className="focus-ring mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold"
          disabled={!onStatusChange}
        >
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {!isAdmin ? <p className="mt-2 text-xs text-slate-500">Members can update status only.</p> : null}
      </div>
    </article>
  );
};

export default TaskCard;
