import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { list, put } from '@vercel/blob';

type RecordEntry = { id: string; text: string };

// read anonId…
async function getAnonId(): Promise<string | null> {
  const store = await cookies();
  return store.get('anonId')?.value || null;
}

// where we store the JSON
function userKey(id: string) {
  return `${id}/todo.json`;
}

// GET
export async function GET() {
  const anon = await getAnonId();
  if (!anon) return NextResponse.json({ error: 'Missing anonId' }, { status: 400 });

  const key = userKey(anon);
  const res = await list({ prefix: key, mode: 'folded' });
  // <— use b.key, not b.pathname
  const blob = res.blobs.find(b => b.pathname === key);

  let items: RecordEntry[] = [];
  if (blob) {
    const r = await fetch(blob.url);
    if (r.ok) items = await r.json();
  }

  return NextResponse.json({ items });
}

// POST
export async function POST(request: Request) {
  const anon = await getAnonId();
  if (!anon) return NextResponse.json({ error: 'Missing anonId' }, { status: 400 });

  const { text } = await request.json();
  if (!text) return NextResponse.json({ error: 'Text required' }, { status: 400 });

  const key = userKey(anon);
  const listRes = await list({ prefix: key, mode: 'folded' });
  // <— use b.key here too
  const blob = listRes.blobs.find(b => b.pathname === key);

  let items: RecordEntry[] = [];
  if (blob) {
    const r = await fetch(blob.url);
    if (r.ok) items = await r.json();
  }

  if (items.length >= 10) {
    return NextResponse.json({ error: 'Max 10 items' }, { status: 400 });
  }
  const id = crypto.randomUUID?.() ?? Date.now().toString();
  items.push({ id, text });

  const jsonBlob = new Blob([JSON.stringify(items)], { type: 'application/json' });
  await put(key, jsonBlob, { access: 'public', allowOverwrite: true });

  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE
export async function DELETE(request: Request) {
  const anon = await getAnonId();
  if (!anon) return NextResponse.json({ error: 'Missing anonId' }, { status: 400 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const key = userKey(anon);
  const listRes = await list({ prefix: key, mode: 'folded' });
  // <— and here
  const blob = listRes.blobs.find(b => b.pathname === key);

  let items: RecordEntry[] = [];
  if (blob) {
    const r = await fetch(blob.url);
    if (r.ok) items = await r.json();
  }

  const filtered = items.filter(item => item.id !== id);
  const jsonBlob = new Blob([JSON.stringify(filtered)], { type: 'application/json' });
  await put(key, jsonBlob, { access: 'public', allowOverwrite: true });

  return NextResponse.json({ success: true });
}