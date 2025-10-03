// utils/security.ts

// Types for findings
export interface Finding {
  line: number;
  type: string;
  snippet: string;
}

// Placeholder frontend logic (no Node APIs here)
export const scanContent = async (content: string): Promise<Finding[]> => {
  // For demo purposes: detect "password" in content
  const lines = content.split("\n");
  const results: Finding[] = [];

  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes("password")) {
      results.push({
        line: idx + 1,
        type: "Potential Secret",
        snippet: line,
      });
    }
  });

  return results;
};
