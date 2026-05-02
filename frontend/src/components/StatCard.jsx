const StatCard = ({ label, value, tone = 'default' }) => {
  const tones = {
    default: 'border-line bg-white text-ink',
    danger: 'border-red-200 bg-red-50 text-coral',
    success: 'border-emerald-200 bg-emerald-50 text-pine',
    warn: 'border-amber-200 bg-amber-50 text-gold'
  };

  return (
    <div className={`rounded-md border p-4 shadow-soft ${tones[tone]}`}>
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-black">{value ?? 0}</p>
    </div>
  );
};

export default StatCard;
