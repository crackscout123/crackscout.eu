import React from "react";
import { ServiceRow } from "./fakeApi.ts";

export default function DetailPane({ row, isAdmin }: { row: ServiceRow | null; isAdmin: boolean; }) {
  if (!row) return <div className="pane-empty">Wähle einen Dienst links aus.</div>;
  return (
    <div className="pane">
      <div className="pane-header">
        <h4>{row.name}</h4>
        <span className={`badge ${badgeClass(row.status)}`}>{statusLabel(row.status)}</span>
        <span className="uptime">{row.uptime.toFixed(1)}%</span>
        <span className="updated">{row.updated}</span>
      </div>
      <div className="actions">
        <button>Details</button>
        <button>Logs</button>
        {isAdmin && <button>Reboot</button>}
      </div>
      <div className="metrics">
        <div className="metric">CPU: {Math.round(row.cpu)}%</div>
        <div className="metric">RAM: {row.ram}</div>
        <div className="metric">NET: {row.net_io ?? "—"}</div>
      </div>
      <div className="incidents">
        <div className="section-title">Incidents</div>
        <ul>
          <li>05:02 CET Degradation EU cluster</li>
          <li>03:12 CET Short outage resolved</li>
        </ul>
      </div>
      <div className="config">
        <div className="section-title">Config</div>
        <div>Port: {row.port}</div>
        <div>Host: {isAdmin ? row.host : "—"}</div>
        <div>Region: {row.region ?? "—"}</div>
      </div>
    </div>
  );
}

function badgeClass(s: ServiceRow["status"]) {
  return s === "ok" ? "badge--ok" : s === "degraded" ? "badge--deg" : s === "maintenance" ? "badge--mnt" : "badge--out";
}
function statusLabel(s: ServiceRow["status"]) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
