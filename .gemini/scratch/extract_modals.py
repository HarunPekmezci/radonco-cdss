import os

with open('src/app/cdss/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

def extract_jsx_block(start_marker, fallback_end_marker=None):
    idx = code.find(start_marker)
    if idx == -1: return ""
    
    braces = 0
    in_str = False
    str_char = ''
    start_brace = -1
    
    for i in range(idx, len(code)):
        c = code[i]
        
        # handle strings so we don't count braces inside strings
        if not in_str and (c == '"' or c == "'" or c == '`'):
            in_str = True
            str_char = c
            continue
        elif in_str and c == str_char and code[i-1] != '\\':
            in_str = False
            continue
            
        if not in_str:
            if c == '{':
                if start_brace == -1: start_brace = i
                braces += 1
            elif c == '}':
                braces -= 1
                if start_brace != -1 and braces == 0:
                    return code[idx:i+1]
                    
    # fallback if matching fails
    if fallback_end_marker:
        end_idx = code.find(fallback_end_marker, idx)
        if end_idx != -1:
            return code[idx:end_idx + len(fallback_end_marker)]
            
    return ""

modals = []
modals.append(extract_jsx_block('{isRadiobiologyModalOpen && ('))
modals.append(extract_jsx_block('{isMdrModalOpen && ('))
modals.append(extract_jsx_block('{isExportMenuOpen && ('))
modals.append(extract_jsx_block('{showEContourHelp && ('))
modals.append(extract_jsx_block('{isSearchOpen && ('))
modals.append(extract_jsx_block('{isCaseArchiveOpen && ('))

# The TNM Sidebar
tnm_sidebar = extract_jsx_block('id="tnm-sidebar"', '</div>\n          </section>')
if tnm_sidebar:
    # Need to go back to find the parent container if necessary, but we can just replace it
    pass

new_code = code
for m in modals:
    if m: new_code = new_code.replace(m, "")

if tnm_sidebar:
    new_code = new_code.replace(tnm_sidebar, "<CDSSTnmSidebar state={state} actions={actions} />")

with open('src/components/cdss/CDSSModals.tsx', 'w', encoding='utf-8') as f:
    f.write('import React from "react";\n\nexport default function CDSSModals({ state, actions }: any) {\n  const { ' + 
            'isRadiobiologyModalOpen, isMdrModalOpen, isExportMenuOpen, showEContourHelp, isSearchOpen, isCaseArchiveOpen' + 
            ' } = state;\n  return (<>\n' + '\n'.join(modals) + '\n  </>);\n}')

with open('src/components/cdss/CDSSTnmSidebar.tsx', 'w', encoding='utf-8') as f:
    f.write('import React from "react";\n\nexport default function CDSSTnmSidebar({ state, actions }: any) {\n  return (\n' + tnm_sidebar + '\n  );\n}')

# Now replace modals in page.tsx with <CDSSModals />
new_code = new_code.replace('return (', 'return (\n    <>\n      <CDSSModals state={state} actions={actions} />', 1)

with open('src/app/cdss/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_code)
    
print("Extracted Modals and Sidebar!")
