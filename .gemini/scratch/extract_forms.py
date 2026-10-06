import os

with open('src/app/cdss/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

def find_block(marker):
    idx = code.find(marker)
    if idx == -1: return ""
    braces = 0
    start = idx
    while start > 0 and code[start-1] != '<': start -= 1
    if start > 0: start -= 1 # to include `<`
    
    # We want to extract the entire enclosing JSX tag, e.g., <div className="space-y-6"> ... </div>
    # Actually, it's simpler to just find the start and end manually if we know the structure.
    pass

# Let's just create a completely new page.tsx. The user's prompt explicitly requests this rewrite.
# We will create `src/components/cdss/CDSSFormsRenderer.tsx` and just dump the whole forms section in there.
# Let's find where the forms start.
forms_start_marker = "                {selectedOrgan === 'thorax' && ("
forms_end_marker = '              {/* Karar Rasyoneli ve Çıktı Kartı */}'

start_idx = code.find(forms_start_marker)
end_idx = code.find(forms_end_marker)

if start_idx != -1 and end_idx != -1:
    forms_jsx = code[start_idx:end_idx]
    
    with open('src/components/cdss/CDSSFormsRenderer.tsx', 'w', encoding='utf-8') as f:
        f.write('import React from "react";\nimport ThoraxForm from "./forms/ThoraxForm";\nimport GUSForm from "./forms/GUSForm";\nimport BreastForm from "./forms/BreastForm";\nimport CNSForm from "./forms/CNSForm";\nimport GIForm from "./forms/GIForm";\nimport GYNForm from "./forms/GYNForm";\nimport HeadNeckForm from "./forms/HeadNeckForm";\n\nexport default function CDSSFormsRenderer({ state, actions, tText, lang, parameterButtonClass }: any) {\n  const { selectedOrgan, thoraxSubtype, thoraxCentrality, thoraxSurgeryStatus, breathingMotion, thymicHistology, thymomaStage, thymomaMargin, mesoIntent, sclcStage, sclcTiming, gusSubtype, gleasonPrimary, gleasonSecondary, psaLevel, hasECE, hasSVI, positiveCorePercent, bladderTurbtComplete, bladderTmtSuitable, bladderHydronephrosis, bladderConcurrentCis, prostateHistology, testisHistology, bladderHistology, renalHistology, renalDiseaseSetting, renalTumorSizeCm, breastHistology, breastMenopause, breastSurgery, breastMargin, breastBoost, phyllodesMarginCm, phyllodesHighGrade, breastER, breastPR, breastHER2, breastKi67, breastGrade, gisOrgan, liverHistology, liverBclcStage, biliaryHistology, biliaryTreatmentSetting, biliaryMarginStatus, gisCrmStatus, hnSubsite, hnLarynxSubsite, hnCrossesMidline, hnDistanceFromMidlineCm, hnTumorSizeCm, hnDoiMm, hnENE, hnPositiveMargin, cnsSubtype, gliomaGrade, gliomaRiskFactors, cnsMidlineShift, cnsMetCount, cnsMaxDiameter, cnsSymptoms, cnsResection, meningiomaSimpson, cnsKps, gbmPerformance, meningiomaGrade, gliomaHistology, gynSite, cervixScenario, endoRisk, ovaryScenario, vulvaScenario, sarcomaSubtype, dfspStatus, sarcomaSurgery, osteoScenario, ewingIntent, stsHistology, skinHistology, skinMargin, skinDepthMm, skinPerineuralInvasion, skinBoneInvasion, hematologicSubtype, lymphomaResponse, myelomaFractionation, pediatricSubtype, pediatricRisk, wilmsStage, wilmsWholeAbdomen, palliativeIntent, selectedT, selectedN, selectedM } = state;\n  const { setThoraxCentrality, setThoraxSurgeryStatus, setBreathingMotion, setThymicHistology, setThymomaStage, setThymomaMargin, setMesoIntent, setSclcStage, setSclcTiming, setGleasonPrimary, setGleasonSecondary, setPsaLevel, setHasECE, setHasSVI, setPositiveCorePercent, setBladderTurbtComplete, setBladderTmtSuitable, setBladderHydronephrosis, setBladderConcurrentCis, setProstateHistology, setTestisHistology, setBladderHistology, setRenalHistology, setRenalDiseaseSetting, setRenalTumorSizeCm, setBreastHistology, setBreastMenopause, setBreastSurgery, setBreastMargin, setBreastBoost, setPhyllodesMarginCm, setPhyllodesHighGrade, setBreastER, setBreastPR, setBreastHER2, setBreastKi67, setBreastGrade, setLiverHistology, setLiverBclcStage, setBiliaryHistology, setBiliaryTreatmentSetting, setBiliaryMarginStatus, setGisCrmStatus, setHnSubsite, setHnLarynxSubsite, setHnCrossesMidline, setHnDistanceFromMidlineCm, setHnTumorSizeCm, setHnDoiMm, setHnENE, setHnPositiveMargin, setCnsSubtype, setGliomaGrade, setGliomaRiskFactors, setCnsMidlineShift, setCnsMetCount, setCnsMaxDiameter, setCnsSymptoms, setCnsResection, setMeningiomaSimpson, setCnsKps, setGbmPerformance, setMeningiomaGrade, setGliomaHistology, setCervixScenario, setEndoRisk, setOvaryScenario, setVulvaScenario, setSarcomaSubtype, setDfspStatus, setSarcomaSurgery, setOsteoScenario, setEwingIntent, setStsHistology, setSkinHistology, setSkinMargin, setSkinDepthMm, setSkinPerineuralInvasion, setSkinBoneInvasion, setHematologicSubtype, setLymphomaResponse, setMyelomaFractionation, setPediatricSubtype, setPediatricRisk, setWilmsStage, setWilmsWholeAbdomen, setPalliativeIntent } = actions;\n  return (\n    <>\n')
        f.write(forms_jsx)
        f.write('\n    </>\n  );\n}')
        
    new_code = code[:start_idx] + '              <CDSSFormsRenderer state={state} actions={actions} tText={tText} lang={lang} parameterButtonClass={parameterButtonClass} />\n' + code[end_idx:]
    with open('src/app/cdss/page.tsx', 'w', encoding='utf-8') as f:
        f.write(new_code)
    print("Extracted forms renderer!")
else:
    print("Could not find forms markers!")
