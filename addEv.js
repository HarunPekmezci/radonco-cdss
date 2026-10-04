const fs = require('fs');
let p = fs.readFileSync('src/app/cdss/page.tsx', 'utf8');
const regex = /export interface DoseScheme/;
const reg = `export interface RegimenEvidence {
  nccn: { pdfUrl: string; targetPage: number; sectionCode: string; sectionTitle: string; };
  astro?: { title: string; url: string; };
  estro?: { title: string; url: string; };
  landmarkTrial?: { shortName: string; citation: string; doiUrl: string; };
}

`;
p = p.replace(regex, reg + 'export interface DoseScheme');
fs.writeFileSync('src/app/cdss/page.tsx', p);
