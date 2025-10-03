// app/components/RepoInput.tsx
import { useState } from "react";

interface RepoInputProps {
  onSubmit: (repoUrl: string) => void;
}

const RepoInput = ({ onSubmit }: RepoInputProps) => {
  const [repoUrl, setRepoUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;
    onSubmit(repoUrl);
    setRepoUrl("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <input
        type="text"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        placeholder="Enter GitHub repo URL"
        style={{ width: 300, padding: 8 }}
      />
      <button type="submit" style={{ marginLeft: 8, padding: "8px 16px" }}>
        Scan
      </button>
    </form>
  );
};

export default RepoInput;
