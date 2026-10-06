import sys
import re

with open('src/app/cdss/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# We need to extract useMemos from line ~1058 up to the `resolvedEvidenceLinks` useMemo.
def extract_logic():
    start_str = "const evaluatedDecision: EvaluatedDecision = useMemo("
    end_str = "const verifyReference = evidenceReferences[0];"
    
    start_idx = code.find(start_str)
    end_idx = code.find(end_str)
    
    if start_idx == -1 or end_idx == -1:
        print("Could not find bounds")
        return
        
    extracted_block = code[start_idx:end_idx]
    
    # We will just replace all of this with the call to our new engine function.
    new_call = """
  const evaluation = useMemo(() => resolveTreatmentScheme(state.selectedOrgan, state, CDSS_RULES), [state]);
  const relevantOars = useMemo(() => resolveOarConstraints(state.selectedOrgan, evaluation?.schemeId), [state.selectedOrgan, evaluation?.schemeId]);
"""
    
    new_code = code[:start_idx] + new_call + code[end_idx:]
    with open('src/app/cdss/page.tsx', 'w', encoding='utf-8') as f:
        f.write(new_code)
        
    print("Replaced logic block with engine calls.")

extract_logic()
