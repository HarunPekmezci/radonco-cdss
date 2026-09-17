import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/guideline_versions.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: true, pendingCount: 0, pendingUpdates: [] });
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    const pendingList: any[] = [];
    Object.entries(data.sources || {}).forEach(([key, val]: [string, any]) => {
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}