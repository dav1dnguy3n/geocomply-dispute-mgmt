import { NextResponse } from 'next/server';
import db, { ensureDbSeeded } from '@/lib/db';

export async function GET() {
  try {
    await ensureDbSeeded();
    const stmt = db.prepare('SELECT * FROM disputes ORDER BY created_at DESC');
    const cases = stmt.all();
    return NextResponse.json(cases);
  } catch (error: any) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
