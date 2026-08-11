import { NextResponse } from 'next/server';
import db, { ensureDbSeeded } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await ensureDbSeeded();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const offset = (page - 1) * limit;

    let baseQuery = 'FROM disputes';
    let countParams: any[] = [];
    let queryParams: any[] = [];

    if (search) {
      baseQuery += ` WHERE case_id LIKE ? OR user_email LIKE ? OR device_id LIKE ? OR user_id LIKE ?`;
      const searchPattern = `%${search}%`;
      countParams = [searchPattern, searchPattern, searchPattern, searchPattern];
      queryParams = [searchPattern, searchPattern, searchPattern, searchPattern];
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as total ${baseQuery}`);
    const { total } = countStmt.get(...countParams) as { total: number };

    const dataStmt = db.prepare(`SELECT * ${baseQuery} ORDER BY created_at DESC LIMIT ? OFFSET ?`);
    queryParams.push(limit, offset);
    const data = dataStmt.all(...queryParams);

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
