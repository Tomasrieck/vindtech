// app/api/images/route.ts
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { cookies } from 'next/headers'

const DATA_DIR = path.join(process.cwd(), 'data/images')

async function getAnonId() {
  const store = await cookies()
  return store.get('anonId')?.value || null
}

function userDir(id: string) {
  return path.join(DATA_DIR, id)
}

async function ensureDir(dir: string) {
  try { await fs.access(dir) }
  catch { await fs.mkdir(dir, { recursive: true }) }
}

// respond with both filename + data-URI
export async function GET() {
  const anon = await getAnonId()
  if (!anon) return NextResponse.json({ error: 'Missing anonId' }, { status: 400 })

  const dir = userDir(anon)
  await ensureDir(dir)
  const files = await fs.readdir(dir)
  const images = await Promise.all(
    files.map(async fname => {
      const buf = await fs.readFile(path.join(dir, fname))
      const ext = path.extname(fname).slice(1)
      const mime = `image/${ext}`
      return { filename: fname, src: `data:${mime};base64,${buf.toString('base64')}` }
    })
  )
  return NextResponse.json({ images })
}

export async function POST(request: Request) { /*...unchanged...*/ }

export async function DELETE(request: Request) {
  const anon = await getAnonId()
  if (!anon) return NextResponse.json({ error: 'Missing anonId' }, { status: 400 })

  const { filename } = await request.json()
  if (!filename) return NextResponse.json({ error: 'Filename required' }, { status: 400 })

  const full = path.join(userDir(anon), filename)
  try {
    await fs.unlink(full)
  } catch (e) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}