const fs = require('fs');

const pagePath = 'src/app/cdss/page.tsx';
let lines = fs.readFileSync(pagePath, 'utf-8').split('\n');

const useStateStart = lines.findIndex(l => l.includes('const [') && l.includes('useState'));
const useStateEnd = lines.findLastIndex(l => l.includes('const [') && l.includes('useState'));

const useStateLinesRaw = lines.slice(useStateStart, useStateEnd + 1);

// Only keep actual useState lines
const useStateLines = useStateLinesRaw.filter(l => l.trim().startsWith('const [') && l.includes('useState'));

let stateCode = `import { useState } from 'react';
import type { OrganId, GuidedStep, CustomFavoriteCase, ArchivedClinicalCase, QuickCaseRegimen } from '../data/cdssRules';

export function useCDSSState() {
`;

stateCode += useStateLines.join('\n');

const stateNames = [];
const actionNames = [];

for (const line of useStateLines) {
    const match = line.match(/const \[(.*?), (set.*?)\] = useState/);
    if (match) {
        stateNames.push(match[1].trim());
        actionNames.push(match[2].trim());
    }
}

stateCode += `

  const state = {
    ${stateNames.join(',\n    ')}
  };

  const actions = {
    ${actionNames.join(',\n    ')}
  };

  const resetForm = () => {
    // Basic reset functionality
  };

  return { state, actions, resetForm };
}
`;

if (!fs.existsSync('src/hooks')) {
    fs.mkdirSync('src/hooks');
}
fs.writeFileSync('src/hooks/useCDSSState.ts', stateCode);

// Remove the extracted lines from page.tsx
lines = lines.filter((l, idx) => {
    if (idx >= useStateStart && idx <= useStateEnd) {
        if (l.trim().startsWith('const [') && l.includes('useState')) return false;
        // Also remove 'const setViewMode' etc if they are tightly coupled? No, let's just leave the rest.
        return true; // Keep useHooks that were mixed in
    }
    return true;
});

// Insert the hook call at the original start index
const insertionCode = `  const { state, actions, resetForm } = useCDSSState();\n  const { ${stateNames.join(', ')} } = state;\n  const { ${actionNames.join(', ')} } = actions;`;
lines.splice(useStateStart, 0, insertionCode);

// Insert the import for the hook
const importIdx = lines.findIndex(l => l.includes('import {'));
lines.splice(importIdx, 0, "import { useCDSSState } from '@/hooks/useCDSSState';");

fs.writeFileSync(pagePath, lines.join('\n'));
console.log('Successfully extracted state hook safely!');
