const fs = require('fs');

const pagePath = 'src/app/cdss/page.tsx';
let lines = fs.readFileSync(pagePath, 'utf-8').split('\n');

const useStateStart = lines.findIndex(l => l.includes('const [') && l.includes('useState'));
const useStateEnd = lines.findLastIndex(l => l.includes('const [') && l.includes('useState'));

const useStateLines = lines.slice(useStateStart, useStateEnd + 1);

let stateCode = `import { useState } from 'react';
import type { OrganId } from '../data/cdssRules';

export function useCDSSState() {
`;

stateCode += useStateLines.join('\n');

const stateNames = [];
const actionNames = [];

for (const line of useStateLines) {
    const match = line.match(/const \[(.*?), (set.*?)\] = useState/);
    if (match) {
        stateNames.push(match[1]);
        actionNames.push(match[2]);
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

lines.splice(useStateStart, useStateEnd - useStateStart + 1, "  const { state, actions, resetForm } = useCDSSState();\n  const { " + stateNames.join(', ') + " } = state;\n  const { " + actionNames.join(', ') + " } = actions;");

// Insert the import for the hook
const importIdx = lines.findIndex(l => l.includes('import {'));
lines.splice(importIdx, 0, "import { useCDSSState } from '@/hooks/useCDSSState';");

fs.writeFileSync(pagePath, lines.join('\n'));
console.log('Successfully extracted state hook!');
