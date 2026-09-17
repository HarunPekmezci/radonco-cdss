import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { reportText, diseaseId } = await req.json();

    const systemPrompt = `Sen radyasyon onkolojisi uzmanı ve klinik veri çıkarım asistanısın. 
Görevin: Verilen Türkçe epikriz veya patoloji raporundan seçilen organ (${diseaseId}) için gerekli parametreleri ayıklamak ve YALNIZCA geçerli bir JSON nesnesi döndürmektir. 
Asla selamlama, markdown açıklaması veya ek metin ekleme. Sadece saf JSON üret.

Dönebileceğin JSON anahtarları (varsa doldur, yoksa null bırak):
- clinicalT: string (örn: "cT1a-cT1c", "cT2a", "cT2b", "cT3a", "T1", "T2", "FIGO IB2" vb.)
- hasN1: boolean (lenf nodu pozitifliği varsa true)
- nodalStatus: string (örn: "cN0", "cN1", "N0", "N1", "N2")
- hasM1: boolean (metastaz varsa true)
- tumorSizeMm: number (tümörün en büyük çapı mm cinsinden)
- tPsa: number (prostat için serum tPSA değeri)
- gleasonP1: number (prostat primer gleason)
- gleasonP2: number (prostat sekonder gleason)
- erPositive: boolean (meme için ER durumu)
- prPositive: boolean (meme için PR durumu)
- her2Positive: boolean (meme için HER2 durumu)
- positiveNodes: number (meme için tutulu aksiller LN sayısı)
- histologyGrade: number (derece 1, 2, 3, 4)
- idhStatus: "WILDTYPE" | "MUTANT"
- breslowThicknessMm: number (melanom için breslow)`;

    const userPrompt = `Hastanın Raporu:\n"""\n${reportText}\n"""\nYukarıdaki rapordan parametreleri çıkar ve saf JSON olarak ver:`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // route.ts içinde ~35. satır civarı:
body: JSON.stringify({
  model: 'qwen2.5:14b-instruct-q8_0',
  prompt: `${systemPrompt}\n\n${userPrompt}`,
  stream: false,
  format: 'json'
})
    });

    if (!response.ok) {
      throw new Error(`Ollama API hatası: ${response.statusText}`);
    }

    const data = await response.json();
    const parsedData = JSON.parse(data.response);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen çıkarım hatası';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}