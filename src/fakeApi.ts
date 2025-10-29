export type Status = "ok" | "degraded" | "outage" | "maintenance";
export interface ServiceRow {
  id: string;
  status: Status;
  name: string;
  uptime: number; // %
  cpu: number; // %
  ram: string; // "1.2G"
  group: "web" | "games" | "db";
  updated: string; // "2m ago"
  port: number;
  host: string;
  region?: string;
  net_io?: string;
}

const demo: ServiceRow[] = [
  { id: "1", status:"ok", name:"web-api", uptime:99.98, cpu:22, ram:"1.2G", group:"web", updated:"2m ago", port:443, host:"srv-eu-01", region:"eu" },
  { id: "2", status:"degraded", name:"game-node-1", uptime:99.1, cpu:78, ram:"5.8G", group:"games", updated:"30s ago", port:25565, host:"node-de-01", region:"eu", net_io:"↑120 ↓80 Mbps" },
  { id: "3", status:"outage", name:"db-prod", uptime:97.3, cpu:0, ram:"—", group:"db", updated:"10s ago", port:5432, host:"db-eu-02", region:"eu" },
  { id: "4", status:"ok", name:"cache", uptime:100.0, cpu:12, ram:"512M", group:"web", updated:"1m ago", port:6379, host:"srv-eu-01", region:"eu" }
];

export const FakeApi = {
  async list(): Promise<ServiceRow[]> {
    // simulate fetch
    await new Promise(r => setTimeout(r, 200));
    return demo;
  }
};
