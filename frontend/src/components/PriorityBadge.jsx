import { Flame, Gauge, SignalLow, Siren } from 'lucide-react';

const priorityMap = {
  Low: {
    className: 'bg-sky-50 text-sky-700 ring-sky-200',
    Icon: SignalLow
  },
  Medium: {
    className: 'bg-violet-50 text-violet-700 ring-violet-200',
    Icon: Gauge
  },
  High: {
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
    Icon: Flame
  },
  Urgent: {
    className: 'bg-red-50 text-red-700 ring-red-200',
    Icon: Siren
  }
};

const PriorityBadge = ({ priority = 'Medium' }) => {
  const config = priorityMap[priority] || priorityMap.Medium;
  const Icon = config.Icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ring-1 ${config.className}`}>
      <Icon size={13} />
      {priority}
    </span>
  );
};

export default PriorityBadge;
