import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { list, put } from '@vercel/blob';

type RecordEntry = { start: string; end: string };

// Read anonId from cookie
async function getAnonId(): Promise<string | null> {
  const store = await cookies();
  return store.get('anonId')?.value || null;
}

// Prefix all blob keys by user
function userPrefix(id: string) {
  return `${id}/time-reg.json`;
}

// GET /api/time-reg
export async function GET() {
  const anon = await getAnonId();
  if (!anon) {
    return NextResponse.json({ error: 'Missing anonId' }, { status: 400 });
  }

  const prefix = userPrefix(anon);
  // List blobs under that key (folded mode)
  const result = await list({ prefix, mode: 'folded' });
  const blob = result.blobs.find(b => b.pathname === prefix);

  let records: RecordEntry[] = [];
  if (blob) {
    // Fetch the JSON directly from its public URL
    const res = await fetch(blob.url);
    if (res.ok) {
      records = await res.json() as RecordEntry[];
    }
  }

  // Sort & take last 5 by end date
  const last5 = records
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime())
    .slice(0, 5)
    .map(r => {
      const start = new Date(r.start);
      const end   = new Date(r.end);
      return {
        date: start.toLocaleDateString('da-DK'),
        hours: (end.getTime() - start.getTime()) / (1000 * 3600),
      };
    });

  return NextResponse.json({ entries: last5 });
}

// POST /api/time-reg
export async function POST(request: Request) {
  const anon = await getAnonId();
  if (!anon) {
    return NextResponse.json({ error: 'Missing anonId' }, { status: 400 });
  }

  const { start, end } = await request.json();
  if (!start || !end) {
    return NextResponse.json({ error: 'start+end required' }, { status: 400 });
  }

  const prefix = userPrefix(anon);
  // Read existing
  const listRes = await list({ prefix, mode: 'folded' });
  const blob = listRes.blobs.find(b => b.pathname === prefix);

  let records: RecordEntry[] = [];
  if (blob) {
    const res = await fetch(blob.url);
    if (res.ok) records = await res.json() as RecordEntry[];
  }

  // Add & trim to last 5 by start date
  records.push({ start, end });
  records = records
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(-5);

  // Write updated JSON back to blob (publicly accessible)
  const jsonBlob = new Blob([JSON.stringify(records)], { type: 'application/json' });
  await put(prefix, jsonBlob, { access: 'public', allowOverwrite: true });

  return NextResponse.json({ success: true }, { status: 201 });
}