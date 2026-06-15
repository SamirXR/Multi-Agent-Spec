interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  delta?: string;
}

export default function MetricCard({ label, value, icon, delta }: MetricCardProps) {
  return (
    <div className="metric-card animate-in">
      <div className="metric-icon">{icon}</div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {delta && <div className="metric-delta">{delta}</div>}
    </div>
  );
}
