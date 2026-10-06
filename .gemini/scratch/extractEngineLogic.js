const fs = require('fs');

const pagePath = 'src/app/cdss/page.tsx';
let lines = fs.readFileSync(pagePath, 'utf-8').split('\n');

const evalStartIdx = lines.findIndex(l => l.includes('const evaluatedDecision: EvaluatedDecision = useMemo('));

// We know from previous scan that the last useMemo is resolvedEvidenceLinks at 1959.
const lastUseMemoIdx = lines.findIndex(l => l.includes('const resolvedEvidenceLinks = useMemo('));

// find its end
let lastUseMemoEndIdx = -1;
let braces = 0;
let started = false;
for (let i = lastUseMemoIdx; i < lines.length; i++) {
    for (const char of lines[i]) {
        if (char === '{') braces++;
        if (char === '}') braces--;
    }
    if (braces > 0) started = true;
    if (started && braces === 0 && lines[i].includes('}, [')) {
        lastUseMemoEndIdx = i;
        break;
    }
}
if (lastUseMemoEndIdx === -1) {
    for (let i = lastUseMemoIdx; i < lines.length; i++) {
        if (lines[i].includes('  }, [') || lines[i].includes('  ]);')) {
            lastUseMemoEndIdx = i;
            break;
        }
    }
}

console.log('Extracting from', evalStartIdx, 'to', lastUseMemoEndIdx);

const extractLines = lines.slice(evalStartIdx, lastUseMemoEndIdx + 1);

// We want to turn all these useMemos into standard assignments inside a function.
let engineLogic = extractLines.join('\n');

engineLogic = engineLogic.replace(/const (\w+)[^=]*= useMemo\(\(\) => \{/g, 'const $1 = (() => {');
engineLogic = engineLogic.replace(/const (\w+)[^=]*= useMemo\(/g, 'const $1 = (() => { // ');

// Remove dependency arrays
engineLogic = engineLogic.replace(/\}, \[.*?\]\);/g, '})();');
engineLogic = engineLogic.replace(/\], \[.*?\]\);/g, '] /* was useMemo */ ;');

const outputVars = [];
const extractLines2 = engineLogic.split('\n');
for (const line of extractLines2) {
    const m = line.match(/^  const (\w+)\s*=/);
    if (m) outputVars.push(m[1]);
}

const engineExport = `
export function resolveCDSSOutputs(state: any, tText: any, lang: any) {
  const {
    selectedOrgan, selectedSubsite, benignClinicalStatus, thoraxSubtype, thoraxCentrality, breathingMotion, thoraxSurgeryStatus, sclcStage, sclcTiming, thymomaStage, thymomaMargin, thymicHistology, nsclcHistology, mesoIntent, gusSubtype, gleasonPrimary, gleasonSecondary, psaLevel, hasECE, hasSVI, positiveCorePercent, bladderTurbtComplete, bladderTmtSuitable, bladderHydronephrosis, bladderConcurrentCis, prostateHistology, testisHistology, bladderHistology, renalHistology, renalDiseaseSetting, renalTumorSizeCm, breastHistology, breastMenopause, breastSurgery, breastMargin, breastBoost, phyllodesMarginCm, phyllodesHighGrade, breastER, breastPR, breastHER2, breastKi67, breastGrade, gisOrgan, liverHistology, liverBclcStage, biliaryHistology, biliaryTreatmentSetting, biliaryMarginStatus, gisCrmStatus, hnSubsite, hnLarynxSubsite, hnCrossesMidline, hnDistanceFromMidlineCm, hnTumorSizeCm, hnDoiMm, hnENE, hnPositiveMargin, cnsSubtype, gliomaGrade, gliomaRiskFactors, cnsMidlineShift, cnsMetCount, cnsMaxDiameter, cnsSymptoms, cnsResection, meningiomaSimpson, cnsKps, gbmPerformance, meningiomaGrade, gliomaHistology, gynSite, cervixScenario, endoRisk, ovaryScenario, vulvaScenario, sarcomaSubtype, dfspStatus, sarcomaSurgery, osteoScenario, ewingIntent, stsHistology, skinHistology, skinMargin, skinDepthMm, skinPerineuralInvasion, skinBoneInvasion, hematologicSubtype, lymphomaResponse, myelomaFractionation, pediatricSubtype, pediatricRisk, wilmsStage, wilmsWholeAbdomen, palliativeIntent, selectedT, selectedN, selectedM, patientAgeYears, patientGender
  } = state;

${engineLogic}

  return {
    ${outputVars.join(',\n    ')}
  };
}
`;

fs.appendFileSync('src/engines/cdssEngine.ts', engineExport);

lines.splice(evalStartIdx, lastUseMemoEndIdx - evalStartIdx + 1, "  const outputs = useMemo(() => resolveCDSSOutputs(state, tText, lang), [state, tText, lang]);\n  const { " + outputVars.join(', ') + " } = outputs;");

fs.writeFileSync(pagePath, lines.join('\n'));
console.log('Successfully extracted remaining logic blocks.');
