const fs = require('fs');
let p = fs.readFileSync('src/app/cdss/page.tsx', 'utf8');

// Be careful, only replace exact occurrences of types
p = p.replace(/'sbrt'/g, "'ultra_hypo'");
p = p.replace(/'moderate'/g, "'moderate_hypo'");
p = p.replace(/'sib'/g, "'sib_boost'");

p = p.replace(/sbrt:/g, "ultra_hypo:");
p = p.replace(/moderate:/g, "moderate_hypo:");
p = p.replace(/sib:/g, "sib_boost:");

p = p.replace(/ultra_hypoList/g, "sbrtList");

fs.writeFileSync('src/app/cdss/page.tsx', p);
console.log('Brute force replacement done');
