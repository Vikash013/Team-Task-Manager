const statusClasses = {
  Todo: 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-amber-100 text-amber-800',
  Done: 'bg-emerald-100 text-emerald-800'
};

const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClasses[status] || statusClasses.Todo}`}>
    {status}
  </span>
);

export default StatusBadge;
