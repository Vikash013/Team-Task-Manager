const StatCard = ({ label, value, tone = 'default' }) => {
  const tones = {
    default: { card: 'border-line bg-white text-ink', accent: 'from-pine to-ink' },
    danger: { card: 'border-red-200 bg-red-50 text-coral', accent: 'from-coral to-red-700' },
    success: { card: 'border-emerald-200 bg-emerald-50 text-pine', accent: 'from-pine to-emerald-700' },
    warn: { card: 'border-amber-200 bg-amber-50 text-gold', accent: 'from-gold to-amber-700' }
  };
  const toneConfig = tones[tone] || tones.default;

  return (
    <div className={`relative overflow-hidden rounded-md border p-4 shadow-soft ${toneConfig.card}`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${toneConfig.accent}`} />
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-black">{value ?? 0}</p>
        </div>
        <span className="h-10 w-10 rounded-md bg-white/70 shadow-sm" />
      </div>
    </div>
  );
};

export default StatCard;
