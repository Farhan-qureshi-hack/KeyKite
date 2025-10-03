"use client";

import { useState } from "react";
import RepoInput from "./components/RepoInput";
import ScanResults from "./components/ScanResults";
import SelfTest from "./components/SelfTest";
import type { Finding } from "../utils/security";

export default function Page() {
  const [results, setResults] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleScan = async (repoUrl: string) => {
    setLoading(true);
    setStatus(null);
    setResults([]);
    try {
      const r = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl })
      });
      const data = await r.json();
      if (data.success) {
        setResults(data.findings || []);
        setStatus(`Scanned ${data.scanned}/${data.totalFiles} files`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setStatus(`Network error: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "system-ui,Segoe UI,Roboto,Arial" }}>
      <h1 style={{ fontSize: 26, marginBottom: 12 }}>KeyKite — AI Bug Bounty Hunter</h1>

      <RepoInput onScan={handleScan} />

      {loading && <p style={{ color: "#0366d6" }}>Scanning repository — this may take a few seconds...</p>}
      {status && <p style={{ marginTop: 8 }}>{status}</p>}

      <ScanResults results={results} />

      <SelfTest onSetResults={(r) => setResults(r)} />
    </div>
  );
}
