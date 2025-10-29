import React from "react";

export default function CustomizeModal({ isAdmin, onClose }: { isAdmin: boolean; onClose: () => void; }) {
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Customize columns">
      <div className="modal-inner">
        <div className="modal-header">
          <h4>Ansicht anpassen</h4>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <p>Hier würdest du Spalten ein-/ausblenden und Reihenfolge per Drag & Drop ändern.</p>
          <p>Admin: {isAdmin ? "Ja" : "Nein"}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
