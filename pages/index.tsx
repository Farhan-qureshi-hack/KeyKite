// pages/index.tsx
import { useState } from 'react';

type Finding = {
  file: string;
  line: number;
  type: string;
  snippet?: string;
  redacted?: string;
};

export default function Home() {
  const [repo, setRepo] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Finding[]>([]);
  const [error, setError] = useState('');
  const [scannedInfo, setScannedInfo] = useState<{ scanned: number; total: number } | null>(null);
  const [selftestRuns, setSelftestRuns] = useState<any[]>([]);

  async function scanRepo(u: string) {
    setLoading(true);
    setError('');
    setResults([]);
    setScannedInfo(null);
    try {
      const resp = await fetch(`/api/scan?repo=${encodeURIComponent(u)}`);
      const data = await resp.json();
      if (data.success) {
        setResults(data.results || []);
        setScannedInfo({ scanned: data.scanned || 0, total: data.total || 0 });
      } else {
        setError(data.error || 'Scan failed');
      }
    } catch (err: any) {
      setError(err.message || 'Scan failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleScan() {
    if (!repo) return setError('Enter repo URL');
    if (!confirm('I confirm I have permission to scan this repo. Proceed?')) return;
    await scanRepo(repo);
  }

  async function handleDemo() {
    // demo uses a small known public repo or sample (we'll use the selftest endpoint's sample runs)
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const r = await fetch('/api/selftest?iterations=1');
      const d = await r.json();
      if (d.success) {
        // convert test findings into UI-friendly list
        const sample = d.runs[0].findingsSample || [];
        setResults(sample.map((s: any) => ({ file: s.file || 'sample.js', line: s.line || 1, type: s.type, snippet: s.snippet || s.redacted })));
      } else {
        setError('Demo failed');
      }
    } catch (e: any) {
      setError(e.message || 'Demo error');
    } finally {
      setLoading(false);
    }
  }

  async function runSelfTest() {
    setSelftestRuns([]);
    setLoading(true);
    try {
      const r = await fetch('/api/selftest?iterations=3');
      const d = await r.json();
      if (d.success) {
        setSelftestRuns(d.runs || []);
      } else {
        setError('Selftest failed');
      }
    } catch (e: any) {
      setError(e.message || 'Selftest error');
    } finally {
      setLoading(false);
    }
  }

  function downloadMD() {
    const payload = results;
    fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: payload, format: 'md' })
    }).then(res => res.blob()).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'keykite-report.md'; a.click();
      URL.revokeObjectURL(url);
    });
  }

  function downloadPDF() {
    const payload = results;
    fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: payload, format: 'pdf' })
    }).then(res => res.blob()).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'keykite-report.pdf'; a.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui,Segoe UI,Roboto,Arial' }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>KeyKite — AI Bug Bounty Hunter (local)</h1>

      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="https://github.com/owner/repo"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          style={{ width: 520, padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <button onClick={handleScan} disabled={loading} style={{ marginRight: 8 }}>
          {loading ? 'Scanning...' : 'Scan Repo'}
        </button>
        <button onClick={handleDemo} disabled={loading} style={{ marginRight: 8 }}>Demo (sample)</button>
        <button onClick={runSelfTest} disabled={loading} style={{ marginRight: 8 }}>Run Self-test ×3</button>
        <button onClick={downloadMD} disabled={results.length === 0}>Download MD</button>
        <button onClick={downloadPDF} disabled={results.length === 0} style={{ marginLeft: 8 }}>Download PDF</button>
      </div>

      {loading && <div style={{ marginBottom: 8 }}>Scanning repository, please wait... (this may take several seconds)</div>}
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      {scannedInfo && <div style={{ marginBottom: 8 }}>Scanned files: {scannedInfo.scanned} / {scannedInfo.total}</div>}

      {results.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h3>Findings ({results.length})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f6f6f6' }}>
                <th style={{ padding: 8, border: '1px solid #eee' }}>File</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Line</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Type</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Snippet/Redacted</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{r.file}</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{r.line}</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{r.type}</td>
                  <td style={{ padding: 8, border: '1px solid #eee', fontFamily: 'monospace' }}>{r.snippet || r.redacted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selftestRuns.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Self-test runs</h3>
          <pre style={{ background: '#fafafa', padding: 12 }}>{JSON.stringify(selftestRuns, null, 2)}</pre>
        </div>
      )}

    </div>
  );
}
