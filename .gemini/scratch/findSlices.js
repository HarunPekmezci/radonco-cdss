const fs = require('fs');
const lines = fs.readFileSync('src/app/cdss/page.tsx', 'utf-8').split('\n');

const slices = {
    navbar: lines.findIndex(l => l.includes('HEADER: PARILDAYAN RADYASYON LOGOSU')),
    organTabs: lines.findIndex(l => l.includes('ANA KATEGORİ SEÇİMİ')),
    organForms: lines.findIndex(l => l.includes('<GIForm')),
    decisionCard: lines.findIndex(l => l.includes('id="prescription"')),
    oarCard: lines.findIndex(l => l.includes('KRİTİK ORGAN (OAR) RİSK / DOZ KISITLARI')),
    printReport: lines.findIndex(l => l.includes('<CDSSPrintReport'))
};
console.log(slices);
