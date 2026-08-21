import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const PHASE_2_WEBHOOK = 'https://n8n-production-888fb.up.railway.app/webhook-test/aeo-preview/phase-2'

type SelectedPrompt = {
  id?: unknown
  prompt?: unknown
  commercialReason?: unknown
  evidence?: unknown
  confidence?: unknown
}

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>
    const agencyName = clean(body.agencyName, 160)
    const websiteUrl = clean(body.websiteUrl, 500)
    const recommendationPrompt = clean(body.recommendationPrompt, 600)
    const selectedPrompt = body.selectedPrompt && typeof body.selectedPrompt === 'object'
      ? body.selectedPrompt as SelectedPrompt
      : undefined

    try {
      const parsedUrl = new URL(websiteUrl)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Invalid URL')
    } catch {
      return NextResponse.json({ status: 'error', message: 'Missing required Phase 2 analysis data.' }, { status: 400 })
    }

    if (!agencyName || !websiteUrl || !recommendationPrompt) {
      return NextResponse.json({ status: 'error', message: 'Missing required Phase 2 analysis data.' }, { status: 400 })
    }

    const payload = {
      agencyName,
      websiteUrl,
      recommendationPrompt,
      selectedPrompt: selectedPrompt ? {
        id: clean(selectedPrompt.id, 120),
        prompt: clean(selectedPrompt.prompt, 600),
        commercialReason: clean(selectedPrompt.commercialReason, 1200),
        evidence: clean(selectedPrompt.evidence, 2000),
        confidence: clean(selectedPrompt.confidence, 40),
      } : undefined,
    }

    console.log('[Phase 2 n8n request]', payload)
    const response = await fetch(PHASE_2_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })
    console.log('[Phase 2 n8n status]', response.status)

    const rawResponse = await response.text()
    console.log('[Phase 2 n8n raw response]', rawResponse)
    let result: unknown = rawResponse
    try { result = JSON.parse(rawResponse) } catch { /* preserve plain text */ }

    if (!response.ok) {
      return NextResponse.json({ status: 'error', message: "We couldn't complete the AI recommendation check." }, { status: 502 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[v0] Phase 2 route failed:', error)
    return NextResponse.json({ status: 'error', message: "We couldn't complete the AI recommendation check." }, { status: 502 })
  }
}
