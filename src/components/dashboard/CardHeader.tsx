import type { LucideIcon } from "lucide-react";

// One header pattern for every dashboard card: icon chip + title + optional
// subtitle, with an optional slot on the right (status pill, refresh button…).
export default function CardHeader({
  icon: Icon,
  title,
  sub,
  right,
}: {
  icon: LucideIcon;
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="icon-chip">
          <Icon size={15} />
        </div>
        <div className="min-w-0">
          <h3 className="card-title truncate">{title}</h3>
          {sub && <p className="card-sub truncate">{sub}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
