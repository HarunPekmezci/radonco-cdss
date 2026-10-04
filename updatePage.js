const fs = require('fs');
let content = fs.readFileSync('src/app/cdss/page.tsx', 'utf8');

content = content.replace(/regimen: 'sbrt' \| 'moderate' \| 'sib' \| 'conventional'/g, "regimen: 'ultra_hypo' | 'moderate_hypo' | 'sib_boost' | 'conventional'");
content = content.replace(/Record<'sbrt' \| 'moderate' \| 'sib' \| 'conventional',/g, "Record<'ultra_hypo' | 'moderate_hypo' | 'sib_boost' | 'conventional',");

// Also replace the loop in JSX
content = content.replace(/\['sbrt', 'moderate', 'sib', 'conventional'\] as const/g, "['ultra_hypo', 'moderate_hypo', 'sib_boost', 'conventional'] as const");

content = content.replace(/regimen === 'sbrt'/g, "regimen === 'ultra_hypo'");
content = content.replace(/regimen === 'moderate'/g, "regimen === 'moderate_hypo'");
content = content.replace(/regimen === 'sib'/g, "regimen === 'sib_boost'");

content = content.replace(/return 'sbrt'/g, "return 'ultra_hypo'");
content = content.replace(/return 'moderate'/g, "return 'moderate_hypo'");
content = content.replace(/return 'sib'/g, "return 'sib_boost'");

content = content.replace(/setSelectedRegimen\('moderate'\)/g, "setSelectedRegimen('moderate_hypo')");

// And the object keys for regimenByOrgan
content = content.replace(/sbrt: \{/g, "ultra_hypo: {");
content = content.replace(/moderate: \{/g, "moderate_hypo: {");
content = content.replace(/sib: \{/g, "sib_boost: {");

// lungSubSchemesByPhilosophy keys
content = content.replace(/sbrt: sbrtList,/g, "ultra_hypo: sbrtList,");
content = content.replace(/moderate: \[/g, "moderate_hypo: [");
content = content.replace(/sib: \[/g, "sib_boost: [");

fs.writeFileSync('src/app/cdss/page.tsx', content);
console.log('Updated strings in page.tsx');
