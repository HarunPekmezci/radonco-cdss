const fs = require('fs');
let content = fs.readFileSync('src/app/cdss/page.tsx', 'utf8');

// Fix presets
content = content.replace(/regimen: 'sbrt'/g, "regimen: 'ultra_hypo'");
content = content.replace(/regimen: 'moderate'/g, "regimen: 'moderate_hypo'");
content = content.replace(/regimen: 'sib'/g, "regimen: 'sib_boost'");

content = content.replace(/setSelectedRegimen\('moderate'\)/g, "setSelectedRegimen('moderate_hypo')");

content = content.replace(/effectiveRegimen: 'sbrt' \| 'moderate' \| 'sib' \| 'conventional'/g, "effectiveRegimen: 'ultra_hypo' | 'moderate_hypo' | 'sib_boost' | 'conventional'");

// Fix remaining exact matches
content = content.replace(/=== 'sbrt'/g, "=== 'ultra_hypo'");
content = content.replace(/=== 'moderate'/g, "=== 'moderate_hypo'");
content = content.replace(/=== 'sib'/g, "=== 'sib_boost'");

fs.writeFileSync('src/app/cdss/page.tsx', content);
console.log('Fixed page.tsx');

let catalog = fs.readFileSync('src/data/regimenCatalog.ts', 'utf8');
if (!catalog.includes('RegimenEvidence')) {
  catalog = catalog.replace('AlternativeDoseScheme,', 'AlternativeDoseScheme,\n  RegimenEvidence,');
  fs.writeFileSync('src/data/regimenCatalog.ts', catalog);
}
console.log('Fixed regimenCatalog.ts');
