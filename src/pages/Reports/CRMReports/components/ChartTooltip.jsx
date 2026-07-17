export default function ChartTooltip({ active, payload, label, rows }) {
  if (!active || !payload || !payload.length) return null;

  const items = rows ? rows(payload) : payload.map((p) => ({ label: p.name, value: p.value, color: p.color }));

  return (
    <div className="bg-[var(--primary)] text-white rounded-[var(--radius)] px-3 py-2 shadow-[var(--shadow-elevated)] text-[12.5px] min-w-[140px]">
      {label && <div className="font-medium mb-1 text-white/90">{label}</div>}
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-white/70">
              {item.color && <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />}
              {item.label}
            </span>
            <span className="font-semibold tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
