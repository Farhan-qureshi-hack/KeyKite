// app/components/RepoInput.tsx
"use client";
import { useState } from "react";

export interface RepoInputProps {
  onScan: (repoUrl: string) => Promise<void>;
}

export default function RepoInput({ onScan }: RepoInputProps) {
  const [repoUrl, setRepoUrl] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    await onScan(repoUrl.trim());
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 16 }}>
      <input
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        placeholder="https://github.com/owner/repo"
        style={{ padding: 8, width: 360, marginRight: 8 }}
      />
      <button type="submit" style={{ padding: "8px 12px" }}>
        Scan Repo
      </button>
    </form>
  );
}
