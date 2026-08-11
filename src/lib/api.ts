export interface Dispute {
  case_id: string;
  user_id: string;
  user_email: string;
  device_id: string;
  amount: number;
  currency: string;
  created_at: string;
  region: string;
  status: string;
  outcome: string | null;
  outcome_note: string | null;
}

export async function fetchDisputes(): Promise<Dispute[]> {
  const res = await fetch('/api/disputes');
  if (!res.ok) throw new Error('Failed to fetch disputes');
  return res.json();
}

export async function updateOutcome(id: string, outcome: string, note: string) {
  const res = await fetch(`/api/disputes/${id}/outcome`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outcome, note }),
  });
  if (!res.ok) throw new Error('Failed to update outcome');
  return res.json();
}

export async function fetchTrends() {
  const res = await fetch('/api/trends');
  if (!res.ok) throw new Error('Failed to fetch trends');
  return res.json();
}
