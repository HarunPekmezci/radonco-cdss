import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface GuidelineVersionSource {
  hasPendingUpdate?: boolean;
  [key: string]: unknown;
}

interface GuidelineVersions {
  lastCheck?: string;
  sources?: Record<string, GuidelineVersionSource>;
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/guideline_versions.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: true, pendingCount: 0, pendingUpdates: [] });
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw) as GuidelineVersions;

    const pendingList: Array<GuidelineVersionSource & { key: string }> = [];
    Object.entries(data.sources ?? {}).forEach(([key, val]) => {
      if (val.hasPendingUpdate) {
        pendingList.push({ key, ...val });
      }
    });

    return NextResponse.json({
      success: true,
      lastCheck: data.lastCheck,
      pendingCount: pendingList.length,
      pendingUpdates: pendingList
    });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Kılavuz durumu alınamadı.' }, { status: 500 });
  }
}