// utils/security.ts

// Only types and frontend-safe helpers
export interface Finding {
  line: number;
  type: string;
  snippet: string;
  redacted?: boolean;
}

// Optional: dummy function for frontend simulation
export const dummyScan = (content: string): Finding[] => {
  const lines = content.split("\n");
  const findings: Finding[] = [];

  lines.forEach((line, index) => {
    if (line.includes("SECRET")) {
      findings.push({
        line: index + 1,
        type: "SecretFound",
        snippet: line,
        redacted: true,
      });
    }
  });

  return findings;
};
