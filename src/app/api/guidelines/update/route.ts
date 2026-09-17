import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { diseaseId, updatedRegimens } = await req.json();

    if (!diseaseId || !updatedRegimens) {
      return NextResponse.json({ success: false, error: 'Eksik veri gönderildi.' }, { status: 400 });
    }

    // 1. Kılavuz Veritabanını Güncelle
    const guidelinesPath = path.join(process.cwd(), 'src/data/clinicalGuidelines.json');
    if (fs.existsSync(guidelinesPath)) {
      const rawData = fs.readFileSync(guidelinesPath, 'utf-8');
      const allGuidelines = JSON.parse(rawData);

      allGuidelines[diseaseId] = {
        ...(allGuidelines[diseaseId] || {}),
        regimens: updatedRegimens
      };

      fs.writeFileSync(guidelinesPath, JSON.stringify(allGuidelines, null, 2), 'utf-8');
    }

    // 2. Bekleyen Bildirimi Otomatik Sıfırla (Okundu Yap)
    const versionsPath = path.join(process.cwd(), 'src/data/guideline_versions.json');
    if (fs.existsSync(versionsPath)) {
      const rawVersions = fs.readFileSync(versionsPath, 'utf-8');
      const versionsData = JSON.parse(rawVersions);

      if (versionsData.sources && versionsData.sources[diseaseId]) {
        versionsData.sources[diseaseId].hasPendingUpdate = false;
        versionsData.sources[diseaseId].pendingNotes = '';
      }

      fs.writeFileSync(versionsPath, JSON.stringify(versionsData, null, 2), 'utf-8');
    }

    return NextResponse.json({ success: true, message: 'Kılavuz güncellendi ve bildirim temizlendi.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}