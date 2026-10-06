const fs = require('fs');
const path = require('path');

const pagePath = 'src/app/cdss/page.tsx';
let pageContent = fs.readFileSync(pagePath, 'utf-8');
const lines = pageContent.split('\n');

// 1. Extract evaluatedDecision
const evalStart = lines.findIndex(l => l.includes('const evaluatedDecision: EvaluatedDecision = useMemo('));
let evalEnd = -1;
let bracketCount = 0;
let started = false;
for (let i = evalStart; i < lines.length; i++) {
    const line = lines[i];
    for (const char of line) {
        if (char === '{') bracketCount++;
        if (char === '}') bracketCount--;
    }
    if (bracketCount > 0) started = true;
    if (started && bracketCount === 0 && line.includes('}, [')) { // end of useMemo
        evalEnd = i;
        break;
    }
}
if (evalEnd === -1) {
  for (let i = evalStart; i < lines.length; i++) {
    if (lines[i].match(/^\s*\}\,\s*\[.*\]\)\;\s*$/)) {
      evalEnd = i;
      break;
    }
  }
}
if (evalEnd === -1) {
    for (let i = evalStart + 1000; i < lines.length; i++) {
        if (lines[i].includes('  const formProps = {')) {
            evalEnd = i - 1;
            while(lines[evalEnd].trim() === '') evalEnd--;
            break;
        }
    }
}
console.log('evalStart:', evalStart, 'evalEnd:', evalEnd);

const evalLines = lines.slice(evalStart + 1, evalEnd); // inner code
const evalCode = `
import { EvaluatedDecision, DoseScheme, PrognosticResult, TargetVolume, OARConstraint } from '../data/cdssRules';
import { NCCN_GUIDELINE_MAP } from '../data/nccnGuidelineMap';

export function evaluateClinicalDecision(state: any): EvaluatedDecision {
  const {
    selectedOrgan, selectedSubsite, benignClinicalStatus, thoraxSubtype, thoraxCentrality, breathingMotion, thoraxSurgeryStatus, sclcStage, sclcTiming, thymomaStage, thymomaMargin, thymicHistology, nsclcHistology, mesoIntent, gusSubtype, gleasonPrimary, gleasonSecondary, psaLevel, hasECE, hasSVI, positiveCorePercent, bladderTurbtComplete, bladderTmtSuitable, bladderHydronephrosis, bladderConcurrentCis, prostateHistology, testisHistology, bladderHistology, renalHistology, renalDiseaseSetting, renalTumorSizeCm, breastHistology, breastMenopause, breastSurgery, breastMargin, breastBoost, phyllodesMarginCm, phyllodesHighGrade, breastER, breastPR, breastHER2, breastKi67, breastGrade, gisOrgan, liverHistology, liverBclcStage, biliaryHistology, biliaryTreatmentSetting, biliaryMarginStatus, gisCrmStatus, hnSubsite, hnLarynxSubsite, hnCrossesMidline, hnDistanceFromMidlineCm, hnTumorSizeCm, hnDoiMm, hnENE, hnPositiveMargin, cnsSubtype, gliomaGrade, gliomaRiskFactors, cnsMidlineShift, cnsMetCount, cnsMaxDiameter, cnsSymptoms, cnsResection, meningiomaSimpson, cnsKps, gbmPerformance, meningiomaGrade, gliomaHistology, gynSite, cervixScenario, endoRisk, ovaryScenario, vulvaScenario, sarcomaSubtype, dfspStatus, sarcomaSurgery, osteoScenario, ewingIntent, stsHistology, skinHistology, skinMargin, skinDepthMm, skinPerineuralInvasion, skinBoneInvasion, hematologicSubtype, lymphomaResponse, myelomaFractionation, pediatricSubtype, pediatricRisk, wilmsStage, wilmsWholeAbdomen, palliativeIntent, selectedT, selectedN, selectedM, patientAgeYears, patientGender, lang, tText
  } = state;

  const tNum = parseInt(selectedT.replace(/\\D/g, '')) || 0;
  const nNum = parseInt(selectedN.replace(/\\D/g, '')) || 0;
  const mNum = parseInt(selectedM.replace(/\\D/g, '')) || 0;

  const makeScheme = (id: string, title: string, dose: number, fx: number, optScale: number, desc: string, detail: string, tags: string[], oars: OARConstraint[], ptvInfo?: string, alternatives?: DoseScheme[]): DoseScheme => {
    const isPalliative = id.includes('palliative');
    const eqd2 = dose * (1 + (dose / fx) / (isPalliative ? 10 : 10)); // approximate logic if needed
    return {
      id, title, dose, fractions: fx,
      bed: dose * (1 + (dose / fx) / 10),
      eqd2,
      description: desc, details: detail, tags, targetVolumes: [{
        name: 'PTV', dose, fractions: fx, description: ptvInfo || desc
      }],
      oars,
      evidence: [],
      optimizationScale: optScale,
      alternatives
    };
  };

${evalLines.join('\n')}

  return { stage: 'Unknown', prognostic: null, options: [], targets: [], references: [], status: 'No regimen matched' };
}
`;

fs.writeFileSync('src/engines/cdssEngine.ts', evalCode);

// 2. Remove formProps and rewrite evaluateDecision hook
const formPropsStart = lines.findIndex(l => l.includes('  const formProps = {'));
let formPropsEnd = -1;
for (let i = formPropsStart; i < lines.length; i++) {
    if (lines[i].includes('};') && lines[i-1].includes('parseOption')) {
        formPropsEnd = i;
        break;
    }
}
if(formPropsEnd === -1) {
    let brackets = 0;
    for (let i = formPropsStart; i < lines.length; i++) {
        if(lines[i].includes('{')) brackets++;
        if(lines[i].includes('}')) brackets--;
        if(brackets === 0) {
            formPropsEnd = i;
            break;
        }
    }
}

console.log('formPropsStart:', formPropsStart, 'formPropsEnd:', formPropsEnd);

// 3. Extract props for each form
const formsDir = 'src/components/cdss/forms';
const formFiles = fs.readdirSync(formsDir);
const formPropsMap = {};
for (const file of formFiles) {
    if (file.endsWith('.tsx')) {
        const content = fs.readFileSync(path.join(formsDir, file), 'utf-8');
        const match = content.match(/export interface \w+Props \{([^}]+)\}/);
        if (match) {
            const props = match[1].split('\n')
                .map(l => l.split(':')[0].trim().replace('?', ''))
                .filter(l => l && !l.startsWith('//') && l !== '');
            formPropsMap[file.replace('.tsx', '')] = props;
        }
    }
}
console.log('Extracted Form Props:', Object.keys(formPropsMap));

// 4. Update page.tsx lines
let newLines = [];
let i = 0;
while(i < lines.length) {
    if (i === evalStart) {
        newLines.push('  const evaluatedDecision: EvaluatedDecision = useMemo(() => {');
        newLines.push('    const state = { selectedOrgan, selectedSubsite, benignClinicalStatus, thoraxSubtype, thoraxCentrality, breathingMotion, thoraxSurgeryStatus, sclcStage, sclcTiming, thymomaStage, thymomaMargin, thymicHistology, nsclcHistology, mesoIntent, gusSubtype, gleasonPrimary, gleasonSecondary, psaLevel, hasECE, hasSVI, positiveCorePercent, bladderTurbtComplete, bladderTmtSuitable, bladderHydronephrosis, bladderConcurrentCis, prostateHistology, testisHistology, bladderHistology, renalHistology, renalDiseaseSetting, renalTumorSizeCm, breastHistology, breastMenopause, breastSurgery, breastMargin, breastBoost, phyllodesMarginCm, phyllodesHighGrade, breastER, breastPR, breastHER2, breastKi67, breastGrade, gisOrgan, liverHistology, liverBclcStage, biliaryHistology, biliaryTreatmentSetting, biliaryMarginStatus, gisCrmStatus, hnSubsite, hnLarynxSubsite, hnCrossesMidline, hnDistanceFromMidlineCm, hnTumorSizeCm, hnDoiMm, hnENE, hnPositiveMargin, cnsSubtype, gliomaGrade, gliomaRiskFactors, cnsMidlineShift, cnsMetCount, cnsMaxDiameter, cnsSymptoms, cnsResection, meningiomaSimpson, cnsKps, gbmPerformance, meningiomaGrade, gliomaHistology, gynSite, cervixScenario, endoRisk, ovaryScenario, vulvaScenario, sarcomaSubtype, dfspStatus, sarcomaSurgery, osteoScenario, ewingIntent, stsHistology, skinHistology, skinMargin, skinDepthMm, skinPerineuralInvasion, skinBoneInvasion, hematologicSubtype, lymphomaResponse, myelomaFractionation, pediatricSubtype, pediatricRisk, wilmsStage, wilmsWholeAbdomen, palliativeIntent, selectedT, selectedN, selectedM, patientAgeYears, patientGender, lang, tText };');
        newLines.push('    return evaluateClinicalDecision(state);');
        newLines.push('  }, [/* dependencies */ selectedOrgan, selectedSubsite, benignClinicalStatus, thoraxSubtype, thoraxCentrality, breathingMotion, thoraxSurgeryStatus, sclcStage, sclcTiming, thymomaStage, thymomaMargin, thymicHistology, nsclcHistology, mesoIntent, gusSubtype, gleasonPrimary, gleasonSecondary, psaLevel, hasECE, hasSVI, positiveCorePercent, bladderTurbtComplete, bladderTmtSuitable, bladderHydronephrosis, bladderConcurrentCis, prostateHistology, testisHistology, bladderHistology, renalHistology, renalDiseaseSetting, renalTumorSizeCm, breastHistology, breastMenopause, breastSurgery, breastMargin, breastBoost, phyllodesMarginCm, phyllodesHighGrade, breastER, breastPR, breastHER2, breastKi67, breastGrade, gisOrgan, liverHistology, liverBclcStage, biliaryHistology, biliaryTreatmentSetting, biliaryMarginStatus, gisCrmStatus, hnSubsite, hnLarynxSubsite, hnCrossesMidline, hnDistanceFromMidlineCm, hnTumorSizeCm, hnDoiMm, hnENE, hnPositiveMargin, cnsSubtype, gliomaGrade, gliomaRiskFactors, cnsMidlineShift, cnsMetCount, cnsMaxDiameter, cnsSymptoms, cnsResection, meningiomaSimpson, cnsKps, gbmPerformance, meningiomaGrade, gliomaHistology, gynSite, cervixScenario, endoRisk, ovaryScenario, vulvaScenario, sarcomaSubtype, dfspStatus, sarcomaSurgery, osteoScenario, ewingIntent, stsHistology, skinHistology, skinMargin, skinDepthMm, skinPerineuralInvasion, skinBoneInvasion, hematologicSubtype, lymphomaResponse, myelomaFractionation, pediatricSubtype, pediatricRisk, wilmsStage, wilmsWholeAbdomen, palliativeIntent, selectedT, selectedN, selectedM, patientAgeYears, patientGender, lang, tText]);');
        i = evalEnd + 1; // skip the original evalDecision block
        continue;
    }
    
    if (i === formPropsStart) {
        i = formPropsEnd + 1;
        continue;
    }

    let line = lines[i];

    // Replace <GIForm {...formProps} /> with explicit props
    for (const form of Object.keys(formPropsMap)) {
        if (line.includes(`<${form} {...formProps} />`)) {
            const propsStr = formPropsMap[form].map(p => `${p}={${p}}`).join(' ');
            line = line.replace(`{...formProps}`, propsStr);
        }
    }

    newLines.push(line);
    i++;
}

// Find if we need to add the import for evaluateClinicalDecision
if (!newLines.some(l => l.includes('evaluateClinicalDecision'))) {
    const importIdx = newLines.findIndex(l => l.includes('import {'));
    newLines.splice(importIdx, 0, `import { evaluateClinicalDecision } from '@/engines/cdssEngine';`);
}

fs.writeFileSync(pagePath, newLines.join('\n'));
console.log('Successfully refactored page.tsx and created cdssEngine.ts');
