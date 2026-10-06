import sys

with open('src/app/cdss/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = [i for i, l in enumerate(lines) if 'return (' in l][-1]
with open('.gemini/scratch/jsx_start.txt', 'w', encoding='utf-8') as f:
    f.write(''.join(lines[start:start+100]))
