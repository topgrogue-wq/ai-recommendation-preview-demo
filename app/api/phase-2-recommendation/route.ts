import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const PHASE_2_WEBHOOK = 'https://n8n-production-888fb.up.railway.app/webhook-test/aeo-preview/phase-2'

type Phase2AnalysisResult = {
  model: string | null
  agencyName: string
  website: string
  prompt: string
  answer: string | null
  mentioned: boolean
  recommended: boolean | null
  position: number | null
  reason: string
}

type SelectedPrompt = Record<string, unknown>

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function firstObject(value: unknown): Record<string, unknown> | null {
  let current = value
  if (typeof current === 'string') {
    try { current = JSON.parse(current) } catch { return null }
  }
  if (Array.isArray(current)) current = current[0]
  if (current && typeof current === 'object') {
    const record = current as Record<string, unknown>
    const nested = record.output ?? record.response ?? record.data
    if (nested !== undefined) return firstObject(nested)
    return record
  }
  return null
}

function normalizePhase2Response(rawResponse: unknown, agencyName: string, websiteUrl: string, recommendationPrompt: string): Phase2AnalysisResult | null {
  const rawItem = firstObject(rawResponse)
  if (!rawItem) return null
  const mentioned = rawItem.mentioned ?? rawItem['Mentioned?']
  if (typeof mentioned !== 'boolean') return null
  const prompt = rawItem.prompt ?? rawItem.Prompt ?? recommendationPrompt
  const reason = rawItem.reason ?? rawItem.Reason
  if (typeof prompt !== 'string' || prompt.trim().length === 0 || typeof reason !== 'string' || reason.trim().length === 0) return null
  const recommendedValue = rawItem.recommended ?? rawItem['Recommended?']
  const positionValue = rawItem.position ?? rawItem.Position
  return {
    model: typeof (rawItem.model ?? rawItem.Model) === 'string' ? String(rawItem.model ?? rawItem.Model) : null,
    agencyName: String(rawItem.agencyName ?? rawItem['Agency Name'] ?? agencyName),
    website: String(rawItem.website ?? rawItem.Website ?? websiteUrl),
    prompt,
    answer: typeof (rawItem.answer ?? rawItem.Answer) === 'string' ? String(rawItem.answer ?? rawItem.Answer) : null,
    mentioned,
    recommended: typeof recommendedValue === 'boolean' ? recommendedValue : null,
    position: typeof positionValue === 'number' ? positionValue : null,
    reason,
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>
    const agencyName = clean(body.agencyName, 160)
    const websiteUrl = clean(body.websiteUrl, 500)
    const recommendationPrompt = clean(body.recommendationPrompt, 600)
    const selectedPrompt = body.selectedPrompt && typeof body.selectedPrompt === 'object' ? body.selectedPrompt as SelectedPrompt : undefined
    try {
      const parsedUrl = new URL(websiteUrl)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Invalid URL')
    } catch {
      return NextResponse.json({ status: 'error', message: 'Missing required Phase 2 analysis data.' }, { status: 400 })
    }
    if (!agencyName || !websiteUrl || !recommendationPrompt) return NextResponse.json({ status: 'error', message: 'Missing required Phase 2 analysis data.' }, { status: 400 })
    const payload = { agencyName, websiteUrl, recommendationPrompt, selectedPrompt }
    const response = await fetch(PHASE_2_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), cache: 'no-store' })
    const responseText = await response.text()
    let rawResponse: unknown = responseText
    try { rawResponse = JSON.parse(responseText) } catch { /* preserve parse failure */ }
    console.log('[Phase 2 raw API response]', rawResponse)
    if (!response.ok) return NextResponse.json({ status: 'error', message: "We couldn't complete the AI recommendation check." }, { status: 502 })
    const result = normalizePhase2Response(rawResponse, agencyName, websiteUrl, recommendationPrompt)
    console.log('[Phase 2 normalized result]', result)
    console.log('[Phase 2 mentioned value]', result?.mentioned, typeof result?.mentioned)
    if (!result) return NextResponse.json({ status: 'error', message: "We couldn't complete the AI recommendation check." }, { status: 502 })
    return NextResponse.json({ status: 'success', result })
  } catch (error) {
    console.error('[v0] Phase 2 route failed:', error)
    return NextResponse.json({ status: 'error', message: "We couldn't complete the AI recommendation check." }, { status: 502 })
  }
}
