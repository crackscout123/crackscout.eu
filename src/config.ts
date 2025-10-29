export type ColumnKey =
  | "status" | "service" | "uptime" | "cpu" | "ram" | "group" | "updated"
  | "port" | "host" | "region" | "image" | "containers" | "net_io"
  | "labels" | "maintenance" | "power";

export interface ColumnFormat {
  type: "percent" | "bytes" | "bandwidth" | "relativeTime" | "text";
  precision?: number;
  unit?: "auto" | "mbps" | "kbps" | "gb" | "mb";
  period?: "24h" | "7d" | "30d";
}

export interface TableViewConfig {
  defaults: {
    order: ColumnKey[];
    stickyLeft: ColumnKey[];
    hiddenPublic: ColumnKey[];
    hiddenAdmin: ColumnKey[];
    formats: Partial<Record<ColumnKey, ColumnFormat>>;
    sort: { column: ColumnKey; direction: "asc" | "desc" };
  };
  groups: Record<"web" | "games" | "db", {
    sla: number;
    publicVisible: ColumnKey[];
    adminVisible: ColumnKey[];
  }>;
  statusColors: {
    ok: { light?: string; dark?: string; all?: string };
    degraded: { light?: string; dark?: string; all?: string };
    outage: { light?: string; dark?: string; all?: string };
    maintenance: { light?: string; dark?: string; all?: string };
    unknown: { light?: string; dark?: string; all?: string };
  };
  thresholds: {
    uptime: { greenOffset: number; orangeOffset: number };
    cpu: { greenMax: number; orangeMax: number };
    ram: { greenMax: number; orangeMax: number };
  };
  refresh: {
    publicList: number;
    publicDetail: number;
    adminList: number;
    adminDetail: number;
    inactiveAfterSec: number;
    inactiveList: number;
  };
}

export const CONFIG: TableViewConfig = {
  defaults: {
    order: ["status","service","uptime","cpu","ram","group","updated","port","host","region","image","containers","net_io","labels","maintenance","power"],
    stickyLeft: ["status","service"],
    hiddenPublic: ["port","host","region","image","containers","net_io","labels","maintenance","power"],
    hiddenAdmin: [],
    formats: {
      uptime: { type:"percent", precision:1, period:"30d" },
      cpu:    { type:"percent", precision:0 },
      ram:    { type:"bytes", unit:"auto" },
      net_io: { type:"bandwidth", unit:"auto" },
      updated:{ type:"relativeTime" }
    },
    sort: { column:"updated", direction:"desc" }
  },
  groups: {
    web:   { sla: 99.9, publicVisible: ["status","service","uptime","cpu","ram","group","updated","region"], adminVisible: ["status","service","uptime","cpu","ram","group","updated","port","host","region","image","containers","net_io","labels","maintenance","power"] },
    games: { sla: 99.5, publicVisible: ["status","service","uptime","cpu","ram","group","updated","port"], adminVisible: ["status","service","uptime","cpu","ram","group","updated","port","host","region","image","containers","net_io","labels","maintenance","power"] },
    db:    { sla: 99.9, publicVisible: ["status","service","uptime","cpu","ram","group","updated"], adminVisible: ["status","service","uptime","cpu","ram","group","updated","port","host","region","image","containers","net_io","labels","maintenance","power"] }
  },
  statusColors: {
    ok:         { light:"#00E200", dark:"#56F000" },
    degraded:   { light:"#FAD800", dark:"#FCE83A" },
    outage:     { light:"#FF2A04", dark:"#FF3838" },
    maintenance:{ all:"#2DCCFF" },
    unknown:    { light:"#7B8089", dark:"#A4ABB6" }
  },
  thresholds: {
    uptime: { greenOffset: 0.0, orangeOffset: -0.5 },
    cpu:    { greenMax: 70, orangeMax: 90 },
    ram:    { greenMax: 70, orangeMax: 90 }
  },
  refresh: {
    publicList: 30, publicDetail: 20, adminList: 15, adminDetail: 10,
    inactiveAfterSec: 120, inactiveList: 60
  }
};
