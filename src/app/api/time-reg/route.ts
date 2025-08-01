import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

type RecordEntry = { start: string; end: string };
const DATA_DIR = path.join(process.cwd(), 'data/time-reg');

async function ensureFile(file: string) {
  try {
    await fs.access(file);
  } catch {
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

export async function GET() {
  const anon = await getAnonId();
  if (!anon) return NextResponse.json({ error: 'Missing anonId' }, { status: 400 });

  const file = userFile(anon);
  const recs = await readEntries(file);
  const last5 = recs
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime())
    .slice(0, 5)
    .map(r => {
      const start = new Date(r.start);
      const end   = new Date(r.end);
      return { date: start.toLocaleDateString('da-DK'), hours: (end.getTime() - start.getTime()) / 3600000 };
    });

  return NextResponse.json({ entries: last5 });
}

export async function POST(request: Request) {
  const anon = await getAnonId();
  if (!anon) return NextResponse.json({ error: 'Missing anonId' }, { status: 400 });

  const { start, end } = await request.json();
  if (!start || !end) {
    return NextResponse.json({ error: 'start+end required' }, { status: 400 });
  }

  const file = userFile(anon);
  const recs = await readEntries(file);
  recs.push({ start, end });
  // Keep only the latest 5 entries by start date
  const sorted = recs.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const limited = sorted.slice(-5);
  await writeEntries(file, limited);

  return NextResponse.json({ success: true }, { status: 201 });
}