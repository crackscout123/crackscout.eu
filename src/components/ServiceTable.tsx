import React, { useMemo } from "react";
import { ColumnKey, CONFIG } from "../config/config.ts";
import { ServiceRow } from "../api/fakeApi.ts";

interface Props {
  rows: ServiceRow[];
  visibleCols: ColumnKey[];
  selectedId: string | null;
  onSelect: (row: ServiceRow) => void;
  isAdmin: boolean;
}

export default function ServiceTable({ rows, visibleCols, selectedId, onSelect, isAdmin }: Props) {
  const order = CONFIG.defaults.order.filter(c => visibleCols.includes(c));
  const formats = CONFIG.defaults.formats;

  return (
    <div className="table-wrap" role="region" aria-label="Services table">
      <table className="table" role="grid" aria-readonly="true">
        <thead>
          <tr role="row">
            {order.map((col, i) => (
              <th key={col} role="columnheader" aria-colindex={i+1} scope="col">
                {label(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr
              key={r.id}
              role="row"
              aria-rowindex={ri+1}
              className={selectedId === r.id ? "selected" : ""}
              onClick={() => onSelect(r)}
              tabIndex={0}
            >
              {order.map((col, ci) => (
                <td key={col} role="gridcell" aria-colindex={ci+1}>
                  {renderCell(col, r, isAdmin)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function label(col: ColumnKey) {
  const map: Record<ColumnKey,string> = {
    status:"Status", service:"Service", uptime:"Uptime", cpu:"CPU", ram:"RAM",
    group:"Group", updated:"Updated", port:"Port", host:"Host", region:"Region",
    image:"Image", containers:"Containers", net_io:"Net I/O", labels:"Labels",
    maintenance:"Maintenance", power:"Power"
  };
  return map[col];
}

function renderCell(col: ColumnKey, r: ServiceRow, isAdmin: boolean) {
  switch(col) {
    case "status":
      return <span className={`badge ${badgeClass(r.status)}`}>{statusLabel(r.status)}</span>;
    case "service": return r.name;
    case "uptime": return `${r.uptime.toFixed(1)}%`;
    case "cpu": return `${Math.round(r.cpu)}%`;
    case "ram": return r.ram;
    case "group": return r.group;
    case "updated": return r.updated;
    case "port": return isAdmin ? r.port : "—";
    case "host": return isAdmin ? r.host : "—";
    case "region": return r.region ?? "—";
    case "net_io": return r.net_io ?? "—";
    default: return "—";
  }
}

function badgeClass(s: ServiceRow["status"]) {
  return s === "ok" ? "badge--ok" : s === "degraded" ? "badge--deg" : s === "maintenance" ? "badge--mnt" : "badge--out";
}
function statusLabel(s: ServiceRow["status"]) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
