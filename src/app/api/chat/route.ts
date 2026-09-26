import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages?: ChatMessage[];
  activeCaseContext?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequest;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        reply: 'GEMINI_API_KEY is not configured. Add it to .env.local and your Vercel Environment Variables.',
      }, { status: 503 });
    }

    const systemPrompt = `You are the expert Radiation Oncology AI Clinical Assistant for RadOnc CDSS.
Answer physicians with concise, evidence-based clinical and dosimetric guidance informed by NCCN v1.2025, ASTRO, ESTRO, QUANTEC, and DEGRO.
The active patient context currently visible on the physician's screen is:
-------------------------
${body.activeCaseContext || 'No active patient has been selected.'}
-------------------------
Use this context directly when answering questions. Focus on stage, prescription, radiobiology, target volumes, and OAR constraints. Do not replace physician judgment or multidisciplinary review.`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...messages.map(message => ({
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.content }],
      })),
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      },
    );

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      return NextResponse.json({
        reply: data.error?.message || 'Gemini could not generate a clinical response.',
      }, { status: response.status });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({
      reply: reply || 'Gemini returned no clinical response.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected chat service error.';
    return NextResponse.json({ reply: `Chat service error: ${message}` }, { status: 500 });
  }
}
