import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

type RecordEntry = { id: string; text: string };
const DATA_DIR = path.join(process.cwd(), 'data/to-do');

async function ensureFile(file: string) {
  try { await fs.access(file); }
  catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(file, '[]');
  }
}

async function readEntries(file: string): Promise<RecordEntry[]> {
  await ensureFile(file);
  const content = await fs.readFile(file, 'utf8');
  return JSON.parse(content) as RecordEntry[];
}

async function writeEntries(file: string, records: RecordEntry[]) {
  await fs.writeFile(file, JSON.stringify(records, null, 2));
}

async function getAnonId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('anonId')?.value || null;
}

function userFile(userId: string) {
  return path.join(DATA_DIR, `${userId}.json`);
}

// GET /api/to-do
export async function GET() {
  const anon = await getAnonId();
  if (!anon) return NextResponse.json({ error: 'Missing anonId' }, { status: 400 });

  const file = userFile(anon);
  const recs = await readEntries(file);
  return NextResponse.json({ items: recs });
}

// POST /api/to-do
export async function POST(request: Request) {
  const anon = await getAnonId();
  if (!anon) return NextResponse.json({ error: 'Missing anonId' }, { status: 400 });
  const { text } = await request.json();
  if (!text) return NextResponse.json({ error: 'Text required' }, { status: 400 });

  const file = userFile(anon);
  const recs = await readEntries(file);
  if (recs.length >= 10) {
    return NextResponse.json({ error: 'Max 10 items' }, { status: 400 });
  }
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
  recs.push({ id, text });
  await writeEntries(file, recs);
  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE /api/to-do
export async function DELETE(request: Request) {
  const anon = await getAnonId();
  if (!anon) return NextResponse.json({ error: 'Missing anonId' }, { status: 400 });
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const file = userFile(anon);
  const recs = await readEntries(file);
  const filtered = recs.filter(r => r.id !== id);
  await writeEntries(file, filtered);
  return NextResponse.json({ success: true });
}