import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Keep this in one place so the test URL can be swapped for production later.
export const PHASE_1_WEBHOOK_URL = 'https://n8n-production-888fb.up.railway.app/webhook-test/aeo-preview/phase-1'

const MAX_BODY = 8_000

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(request: Request) {
  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY) return NextResponse.json({ status: 'invalid_request' }, { status: 413 })
    const body = JSON.parse(raw) as Record<string, unknown>
    const agencyName = clean(body.agencyName, 160)
    const websiteUrl = clean(body.websiteUrl, 500)
    if (!agencyName || !websiteUrl) return NextResponse.json({ status: 'invalid_request' }, { status: 400 })

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)
    try {
      const response = await fetch(PHASE_1_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyName, websiteUrl }),
        signal: controller.signal,
        cache: 'no-store',
      })
      if (!response.ok) return NextResponse.json({ status: 'failed' }, { status: 502 })
      const data = await response.json() as unknown
      return NextResponse.json(data)
    } finally {
      clearTimeout(timeout)
    }
  } catch (error) {
    console.error('[v0] Phase 1 prompt generation failed:', error)
    return NextResponse.json({ status: 'failed' }, { status: 502 })
  }
}
