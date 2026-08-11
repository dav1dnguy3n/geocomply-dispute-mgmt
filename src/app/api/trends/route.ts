import { NextResponse } from 'next/server';
import db, { ensureDbSeeded } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await ensureDbSeeded();

    // Group by outcome and region
    const stmt = db.prepare(`
      SELECT region, outcome, COUNT(*) as count 
      FROM disputes 
      WHERE status = 'resolved' AND outcome IS NOT NULL AND outcome != ''
      GROUP BY region, outcome
    `);

    const rawData = stmt.all() as any[];

    // Transform for Recharts
    const regionsMap = new Map<string, any>();

    for (const row of rawData) {
      if (!regionsMap.has(row.region)) {
        regionsMap.set(row.region, { name: row.region, won: 0, lost: 0, fraud_confirmed: 0 });
      }
      const item = regionsMap.get(row.region);
      if (item && item[row.outcome] !== undefined) {
        item[row.outcome] = row.count;
      }
    }

    const trendsByRegion = Array.from(regionsMap.values());

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    let timeFormat = "'%Y-%m'";
    if (period === 'year') timeFormat = "'%Y'";
    if (period === 'week') timeFormat = "'%Y-%W'";

    const stmtTime = db.prepare(`
      SELECT strftime(${timeFormat}, created_at) as timeLabel, outcome, COUNT(*) as count
      FROM disputes
      WHERE status = 'resolved' AND outcome IS NOT NULL AND outcome != ''
      GROUP BY timeLabel, outcome
      ORDER BY timeLabel ASC
    `);

    const rawTime = stmtTime.all() as any[];
    const timeMap = new Map<string, any>();

    for (const row of rawTime) {
      if (!timeMap.has(row.timeLabel)) {
        timeMap.set(row.timeLabel, { name: row.timeLabel, won: 0, lost: 0, fraud_confirmed: 0 });
      }
      const item = timeMap.get(row.timeLabel);
      if (item && item[row.outcome] !== undefined) {
        item[row.outcome] = row.count;
      }
    }

    const trendsByPeriod = Array.from(timeMap.values());

    return NextResponse.json({
      byRegion: trendsByRegion,
      byPeriod: trendsByPeriod
    });
  } catch (error: any) {
    console.error('Error fetching trends:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
