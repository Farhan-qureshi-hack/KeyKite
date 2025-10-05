// app/page.tsx
"use client";

import { useState } from "react";
import RepoInput from "./components/RepoInput";
import ScanResults from "./components/ScanResults";
import SelfTest from "./components/SelfTest";
import { Finding } from "../utils/security";

export default function Page() {
  const [results, setResults] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(false);

  const handleScan = async (repoUrl: string) => {
    setLoading(true);
    try {
      const resp = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });
      const json = await resp.json();
      if (resp.ok) setResults(json.findings || []);
      else setResults([]);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const runSelfTest = async (): Promise<Finding[]> => {
    try {
      const resp = await fetch("/api/selftest");
      const json = await resp.json();
      return json.findings ?? [];
    } catch {
      return [];
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: "Inter, Arial, sans-serif" }}>
      <h1>KeyKite — AI Bug Bounty Hunter</h1>

      <section style={{ marginTop: 16 }}>
        <h3>Scan GitHub Repo</h3>
        <RepoInput onScan={handleScan} />
        {loading ? <p>Scanning repository — please wait...</p> : <ScanResults results={results} />}
      </section>

      <section style={{ marginTop: 32 }}>
        <h3>Self Test</h3>
        <SelfTest runSelfTest={runSelfTest} />
      </section>
    </main>
  );
}
