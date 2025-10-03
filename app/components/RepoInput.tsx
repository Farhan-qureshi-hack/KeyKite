import { useState } from "react";

// Add onScan to props
export interface RepoInputProps {
  onScan: (repoPath: string) => Promise<void>;
}

export default function RepoInput({ onScan }: RepoInputProps) {
  const [repoPath, setRepoPath] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoPath.trim()) return;
    await onScan(repoPath);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={repoPath}
        onChange={(e) => setRepoPath(e.target.value)}
        placeholder="Enter repo path"
        style={{ width: "300px", marginRight: "10px" }}
      />
      <button type="submit">Scan</button>
    </form>
  );
}
