"use client";

import { acknowledgeAlert, acknowledgeAllAlerts } from "@/app/actions/alerts";
import { useState } from "react";

export function AcknowledgeButton({ alertId }: { alertId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handle = async () => {
    setLoading(true);
    await acknowledgeAlert(alertId);
    setDone(true);
    setLoading(false);
  };

  if (done) return <span className="text-xs text-success font-bold">✓ Done</span>;

  return (
    <button 
      onClick={handle} 
      disabled={loading}
      className="btn-primary py-1.5 px-3 text-sm"
    >
      {loading ? "..." : "Acknowledge"}
    </button>
  );
}

export function MarkAllReadButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button 
      onClick={async () => { setLoading(true); await acknowledgeAllAlerts(); setLoading(false); }}
      disabled={loading}
      className="btn-ghost bg-[#111827]"
    >
      {loading ? "Marking..." : "Mark All Read"}
    </button>
  );
}
