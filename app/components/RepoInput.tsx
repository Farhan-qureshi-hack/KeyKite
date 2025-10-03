"use client";

import { useState } from "react";

interface RepoInputProps {
  onSubmit: (repoUrl: string) => void;
}

export default function RepoInput({ onSubmit }: RepoInputProps) {
  const [repoUrl, setRepoUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;
    onSubmit(repoUrl);
    setRepoUrl("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "16px" }}>
      <input
        type="text"
        value={repoUrl}
        placeholder="Enter GitHub repository URL"
        onChange={(e) => setRepoUrl(e.target.value)}
        style={{
          padding: "8px",
          width: "300px",
          marginRight: "8px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "8px 12px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#0070f3",
          color: "white",
          cursor: "pointer",
        }}
      >
        Scan Repo
      </button>
    </form>
  );
}
