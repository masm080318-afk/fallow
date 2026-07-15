import { Radio, WifiOff } from "lucide-react";
import CardHeader from "./CardHeader";

export interface SensorItem {
  id: string;
  name: string;
  node_id: string;
  moisture: number | null;
  created_at: string | null;
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}

export default function SensorList({ sensors }: { sensors: SensorItem[] }) {
  return (
    <div className="card">
      <CardHeader icon={Radio} title="Your sensors" sub={`${sensors.length} connected`} />

      <ul className="space-y-2">
        {sensors.map((s) => {
          const online =
            s.created_at != null &&
            Date.now() - new Date(s.created_at).getTime() < 35 * 60 * 1000;
          const m = s.moisture;
          const color =
            m == null ? "var(--muted)" : m < 30 ? "var(--data-dry, #A8442A)" : m > 70 ? "var(--data-wet, #3E5F8A)" : "var(--accent)";

          return (
            <li key={s.id} className="tile flex items-center justify-between px-3.5 py-3">
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{s.name}</div>
                <div className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                  {online ? (
                    <>
                      <span className="dot-online" style={{ width: 6, height: 6 }} />
                      {s.created_at ? timeAgo(s.created_at) : "live"}
                    </>
                  ) : (
                    <>
                      <WifiOff size={11} />
                      {s.created_at ? `last seen ${timeAgo(s.created_at)}` : "no readings yet"}
                    </>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 pl-3">
                <div className="text-xl font-bold leading-none" style={{ color }}>
                  {m != null ? `${m}%` : "—"}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>moisture</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
