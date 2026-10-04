const fs = require('fs');
let p = fs.readFileSync('src/app/cdss/page.tsx', 'utf8');
p = p.replace(/const ultra_hypo: DoseScheme/g, "const sbrt: DoseScheme");
p = p.replace(/let ultra_hypo: DoseScheme/g, "let sbrt: DoseScheme");
fs.writeFileSync('src/app/cdss/page.tsx', p);
