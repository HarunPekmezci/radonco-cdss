import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

export async function POST(req: Request) {
  try {
    const { question, diseaseContext } = await req.json();
    if (!question) {
      return NextResponse.json({ success: false, error: 'Soru iletilmedi.' }, { status: 400 });
    }

    const indexPath = path.join(process.cwd(), 'src/data/guidelines_rag.json');
    if (!fs.existsSync(indexPath)) {
      return NextResponse.json({ 
        success: false, 
        error: "Kılavuz indeksi bulunamadı. Lütfen önce 'scripts/index_guidelines.py' çalıştırın." 
      }, { status: 404 });
    }

    // 1. Sorunun Embedding'ini al
    const embedRes = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nomic-embed-text', prompt: question })
    });
    const embedData = await embedRes.json();
    const qVec = embedData.embedding;

    // 2. Kılavuz pasajlarıyla karşılaştır (Top 3 getir)
    const ragChunks = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    const scoredChunks = ragChunks.map((chunk: any) => ({
      ...chunk,
      score: cosineSimilarity(qVec, chunk.embedding)
    }));

    scoredChunks.sort((a: any, b: any) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 3);

    const contextText = topChunks.map((c: any, i: number) => 
      `[Pasaj ${i+1} | Kaynak: ${c.source}, Sayfa: ${c.page}]:\n${c.content}`
    ).join('\n\n---\n\n');

    // 3. Qwen 2.5'ten klinik yanıt oluştur
    const systemPrompt = `Sen kıdemli bir Radyasyon Onkolojisi Kılavuz Danışmanısın.
Kullanıcının klinik sorusunu YALNIZCA aşağıda verilen kılavuz pasajlarına dayanarak açık, net ve hekim diline uygun olarak yanıtla.
Cevap verirken mutlaka hangi kılavuz ve hangi sayfadan yararlandığını dipnot veya referans olarak belirt. Pasajlarda kesin bilgi yoksa kılavuzda net hüküm olmadığını açıkça söyle, varsayımda bulunma.

KILAVUZ PASAJLARI:
${contextText}`;

    const llmRes = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:14b-instruct-q8_0',
        system: systemPrompt,
        prompt: `Klinik Durum / Soru: ${question} (İlgili Tümör: ${diseaseContext || 'Genel'})`,
        stream: false
      })
    });

    const llmData = await llmRes.json();

    return NextResponse.json({
      success: true,
      answer: llmData.response,
      references: topChunks.map((c: any) => ({ source: c.source, page: c.page, score: c.score }))
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}