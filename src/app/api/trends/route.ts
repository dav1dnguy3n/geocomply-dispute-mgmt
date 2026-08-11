import { NextResponse } from 'next/server';
import db, { ensureDbSeeded } from '@/lib/db';

export async function GET() {
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
    
    // Monthly trends
    const stmtMonth = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, outcome, COUNT(*) as count
      FROM disputes
      WHERE status = 'resolved' AND outcome IS NOT NULL AND outcome != ''
      GROUP BY month, outcome
      ORDER BY month ASC
    `);
    const rawMonthly = stmtMonth.all() as any[];
    const monthlyMap = new Map<string, any>();
    for (const row of rawMonthly) {
      if (!monthlyMap.has(row.month)) {
        monthlyMap.set(row.month, { name: row.month, won: 0, lost: 0, fraud_confirmed: 0 });
      }
      const item = monthlyMap.get(row.month);
      if (item && item[row.outcome] !== undefined) {
        item[row.outcome] = row.count;
      }
    }
    
    const trendsByMonth = Array.from(monthlyMap.values());

    return NextResponse.json({
      byRegion: trendsByRegion,
      byMonth: trendsByMonth
    });
  } catch (error: any) {
    console.error('Error fetching trends:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
