import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { diseaseId, newGuidelineText } = await req.json();

    const filePath = path.join(process.cwd(), 'src/data/clinicalGuidelines.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const db = JSON.parse(rawData);

    const currentData = db.guidelines[diseaseId] || {};

    const prompt = `Sen radyasyon onkolojisi klinik kılavuz analiz uzmanısın.
Aşağıda sistemdeki mevcut doz/fraksiyonasyon JSON verisi ve yeni yayınlanan kılavuz pasajı yer almaktadır.

Mevcut Sistem Verisi:
${JSON.stringify(currentData, null, 2)}

Yeni Kılavuz Metni / Revizyon:
"""
${newGuidelineText}
"""

GÖREVİN:
1. Yeni metinde doz, fraksiyon sayısı, fx dozu veya hedef hacim/marj değişikliği olup olmadığını analiz et.
2. Değişiklik varsa mevcut 'regimens' dizisini yeni kılavuza göre güncelle.
3. YALNIZCA geçerli bir JSON nesnesi döndür. Markdown veya ek metin ekleme:
{
  "hasChanges": true,
  "changeSummary": "Değişikliğin Türkçe klinik özeti",
  "updatedRegimens": [...]
}`;

    const ollamaRes = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:14b-instruct-q8_0',
        prompt,
        format: 'json',
        stream: false
      })
    });

    if (!ollamaRes.ok) {
      throw new Error(`Ollama API hatası: ${ollamaRes.statusText}`);
    }

    const data = await ollamaRes.json();
    const parsed = JSON.parse(data.response);

    return NextResponse.json({ success: true, result: parsed });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}