"use client";

import { useState } from "react";
import RepoInput from "./components/RepoInput";
import ScanResults from "./components/ScanResults";

export default function Page() {
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleScan = async (repoPath: string) => {
    setLoading(true);
    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: repoPath }),
    });
    const data = await res.json();
    setFindings(data.findings || []);
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>KeyKite - AI Bug Bounty Hunter</h1>
      <RepoInput onScan={handleScan} />
      {loading ? <p>Scanning...</p> : <ScanResults results={findings} />}
    </div>
  );
}
