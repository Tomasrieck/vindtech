import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { cookies } from 'next/headers'
import { list, put, del } from '@vercel/blob'

// Base directory for Vercel Blob is configured via your ENV / project settings
async function getAnonId() {
  const store = await cookies()
  return store.get('anonId')?.value || null
}

function userPrefix(id: string) {
  return `${id}/`
}

// GET /api/images
export async function GET() {
  const anon = await getAnonId()
  if (!anon) {
    return NextResponse.json({ error: 'Missing anonId' }, { status: 400 })
  }

  // List blobs under the user's prefix
  const result = await list({ prefix: `${userPrefix(anon)}images/` })
  // result.blobs is the array of blob metadata
  const images = result.blobs.map((b) => ({
    filename: b.pathname.replace(userPrefix(anon), ''),
    url: b.url,
  }))

  return NextResponse.json({ images })
}

// POST /api/images
export async function POST(request: Request) {
  const anon = await getAnonId()
  if (!anon) {
    return NextResponse.json({ error: 'Missing anonId' }, { status: 400 })
  }

  const form = await request.formData()
  const file = form.get('image') as Blob
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const prefix = userPrefix(anon)
  const key = `${prefix}images/${(file as any).name}`
  await put(key, file as any, { access: 'public' })

  return NextResponse.json({ success: true }, { status: 201 })
}

// DELETE /api/images
export async function DELETE(request: Request) {
  const anon = await getAnonId()
  if (!anon) {
    return NextResponse.json({ error: 'Missing anonId' }, { status: 400 })
  }

  const { filename } = await request.json()
  if (!filename) {
    return NextResponse.json({ error: 'Filename required' }, { status: 400 })
  }

  const key = `${userPrefix(anon)}${filename}`
  await del(key)
  return NextResponse.json({ success: true })
}