const fs = require('fs');
const lines = fs.readFileSync('src/app/cdss/page.tsx', 'utf-8').split('\n');
const idx1 = lines.findIndex(l => l.includes('id="tnm-sidebar"'));
console.log('Sidebar at:', idx1);
