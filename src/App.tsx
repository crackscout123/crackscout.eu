import React, { useMemo, useState, useEffect } from "react";
import SplitPane from "react-split-pane";
import { CONFIG, ColumnKey } from "./config/config.ts";
import { FakeApi, ServiceRow } from "./api/fakeApi.ts";
import ServiceTable from "./components/ServiceTable.tsx";
import DetailPane from "./components/DetailPane.tsx";
import CustomizeModal from "./components/CustomizeModal.tsx";

export default function App() {
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [selected, setSelected] = useState<ServiceRow | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [paneSize, setPaneSize] = useState<number>(400);

  const visibleCols = useMemo<ColumnKey[]>(() => {
    const base = CONFIG.defaults.order;
    const hidden = isAdmin ? CONFIG.defaults.hiddenAdmin : CONFIG.defaults.hiddenPublic;
    return base.filter(c => !(hidden as ColumnKey[]).includes(c));
  }, [isAdmin]);

  // polling intervals
  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await FakeApi.list();
      if (active) setRows(data);
    };
    load();
    const interval = setInterval(load, CONFIG.refresh.publicList * 1000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  return (
    <div className="app">
      <header className="topbar" role="banner">
        <div className="title">Services</div>
        <div className="spacer" />
        <button onClick={() => setShowCustomize(true)} aria-haspopup="dialog">Columns ▾</button>
        <button onClick={() => setIsAdmin(v => !v)}>{isAdmin ? "Admin: ON" : "Admin: OFF"}</button>
      </header>

      <SplitPane split="vertical" defaultSize={`calc(100% - ${paneSize}px)`} onChange={(v:number)=>{}}>
        <div className="left">
          <ServiceTable
            rows={rows}
            visibleCols={visibleCols}
            onSelect={setSelected}
            selectedId={selected?.id ?? null}
            isAdmin={isAdmin}
          />
        </div>
        <div className="right" role="complementary" aria-label="Service details">
          <DetailPane row={selected} isAdmin={isAdmin} />
        </div>
      </SplitPane>

      {showCustomize && (
        <CustomizeModal
          isAdmin={isAdmin}
          onClose={() => setShowCustomize(false)}
        />
      )}
    </div>
  );
}
