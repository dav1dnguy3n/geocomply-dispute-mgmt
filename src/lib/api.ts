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

export interface PaginatedDisputes {
  data: Dispute[];
  total: number;
  page: number;
  totalPages: number;
}

export async function fetchDisputes(page = 1, limit = 10, search = ''): Promise<PaginatedDisputes> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', limit.toString());
  if (search) params.set('search', search);

  const res = await fetch(`/api/disputes?${params.toString()}`);
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
