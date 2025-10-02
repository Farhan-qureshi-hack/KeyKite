// pages/api/report.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'POST only' });
    const { results, format } = req.body;
    if (!Array.isArray(results)) return res.status(400).json({ success: false, error: 'results array required' });

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="keykite-report.pdf"');
      const doc = new PDFDocument();
      doc.pipe(res);
      doc.fontSize(16).text('KeyKite Scan Report', { underline: true });
      doc.moveDown();
      results.forEach((r: any, idx: number) => {
        doc.fontSize(10).text(`${idx + 1}. ${r.file} (line ${r.line}) - ${r.type}`);
        doc.text(`   Snippet: ${r.snippet || r.redacted || '[REDACTED]'}`);
        doc.moveDown(0.5);
      });
      doc.end();
    } else {
      // Markdown
      let md = `# KeyKite Scan Report\n\nGenerated: ${new Date().toISOString()}\n\n`;
      md += `| # | File | Line | Type | Snippet |\n|---|---|---|---|---|\n`;
      results.forEach((r: any, i: number) => {
        md += `| ${i + 1} | ${r.file} | ${r.line} | ${r.type} | ${r.snippet || r.redacted || '[REDACTED]'} |\n`;
      });
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="keykite-report.md"');
      res.status(200).send(md);
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'report failed' });
  }
}
