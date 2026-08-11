import { NextResponse } from 'next/server';
import db, { ensureDbSeeded } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbSeeded();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const body = await request.json();
    const { outcome, note } = body;

    if (!['won', 'lost', 'fraud_confirmed'].includes(outcome)) {
      return NextResponse.json({ error: 'Invalid outcome' }, { status: 400 });
    }

    // Get current dispute
    const dispute = db.prepare('SELECT * FROM disputes WHERE case_id = ?').get(id) as any;
    if (!dispute) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const oldOutcome = dispute.outcome;

    const updateStmt = db.prepare(`
      UPDATE disputes 
      SET status = 'resolved', outcome = ?, outcome_note = ?
      WHERE case_id = ?
    `);

    const insertAuditStmt = db.prepare(`
      INSERT INTO audit_logs (case_id, old_outcome, new_outcome, note, changed_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const updateTransaction = db.transaction(() => {
      updateStmt.run(outcome, note, id);
      insertAuditStmt.run(id, oldOutcome, outcome, note, new Date().toISOString());
    });

    updateTransaction();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating outcome:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
