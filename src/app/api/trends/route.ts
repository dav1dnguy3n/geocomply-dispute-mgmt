import { NextResponse } from 'next/server';
import db, { ensureDbSeeded } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await ensureDbSeeded();

    // Group by outcome and region
    const stmt = db.prepare(`
      SELECT region, 
             CASE WHEN status = 'open' THEN 'open' ELSE outcome END as outcome_group,
             COUNT(*) as count 
      FROM disputes 
      WHERE status = 'open' OR (status = 'resolved' AND outcome IS NOT NULL AND outcome != '')
      GROUP BY region, outcome_group
    `);

    const rawData = stmt.all() as any[];

    // Transform for Recharts
    const regionsMap = new Map<string, any>();

    for (const row of rawData) {
      if (!regionsMap.has(row.region)) {
        regionsMap.set(row.region, { name: row.region, open: 0, won: 0, lost: 0, fraud_confirmed: 0 });
      }
      const item = regionsMap.get(row.region);
      if (item && item[row.outcome_group] !== undefined) {
        item[row.outcome_group] = row.count;
      }
    }

    const trendsByRegion = Array.from(regionsMap.values());

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const year = searchParams.get('year');

    let timeFormat = "'%Y-%m'";
    if (period === 'year') timeFormat = "'%Y'";

    const yearFilter = (period === 'month' && year) ? `AND strftime('%Y', created_at) = '${year}'` : '';

    const stmtTime = db.prepare(`
      SELECT strftime(${timeFormat}, created_at) as timeLabel, 
             CASE WHEN status = 'open' THEN 'open' ELSE outcome END as outcome_group,
             COUNT(*) as count
      FROM disputes
      WHERE (status = 'open' OR (status = 'resolved' AND outcome IS NOT NULL AND outcome != ''))
            ${yearFilter}
      GROUP BY timeLabel, outcome_group
      ORDER BY timeLabel ASC
    `);

    const rawTime = stmtTime.all() as any[];
    const timeMap = new Map<string, any>();

    for (const row of rawTime) {
      if (!timeMap.has(row.timeLabel)) {
        timeMap.set(row.timeLabel, { name: row.timeLabel, open: 0, won: 0, lost: 0, fraud_confirmed: 0 });
      }
      const item = timeMap.get(row.timeLabel);
      if (item && item[row.outcome_group] !== undefined) {
        item[row.outcome_group] = row.count;
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
