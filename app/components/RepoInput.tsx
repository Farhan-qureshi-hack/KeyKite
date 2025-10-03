"use client";

import { useState } from "react";

export default function RepoInput({ onScan }: { onScan: (url: string) => void }) {
  const [value, setValue] = useState("");

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!value) return alert("Enter a repo URL (e.g. https://github.com/owner/repo)");
    onScan(value);
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 12 }}>
      <input
        placeholder="https://github.com/owner/repo"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ width: 480, padding: 8, marginRight: 8 }}
      />
      <button type="submit" style={{ padding: "8px 12px" }}>Scan Repo</button>
    </form>
  );
}
