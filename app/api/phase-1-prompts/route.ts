import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const PHASE_1_WEBHOOK_URL = 'https://n8n-production-888fb.up.railway.app/webhook/aeo-preview/phase-1'
const MAX_BODY = 8_000

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function normalize(rawInput: unknown) {
  const raw = Array.isArray(rawInput) ? rawInput[0] : rawInput
  let payload = raw

  if (raw && typeof raw === 'object' && 'output' in raw) {
    payload = (raw as { output?: unknown }).output
  }

  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload)
    } catch {
      throw new Error('n8n returned an invalid structured output')
    }
  }

  const rawObject = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  const payloadObject = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  const prompts = Array.isArray(payloadObject.promptOptions)
    ? payloadObject.promptOptions
    : Array.isArray(payloadObject.prompts)
      ? payloadObject.prompts
      : Array.isArray(rawObject.promptOptions)
        ? rawObject.promptOptions
        : Array.isArray(rawObject.prompts)
          ? rawObject.prompts
          : []

  const promptOptions = prompts.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object')).map((item, index) => ({
    id: typeof item.id === 'string' && item.id ? item.id : `prompt-${index + 1}`,
    prompt: typeof item.prompt === 'string' ? item.prompt : '',
    commercialReason: typeof item.commercialReason === 'string' ? item.commercialReason : '',
    evidence: typeof item.evidence === 'string' ? item.evidence : '',
    confidence: item.confidence === 'medium' ? 'medium' : 'high',
  })).filter((item) => item.prompt.length > 0)

  if (promptOptions.length === 0) throw new Error('n8n returned no prompt options')
  return { status: 'success' as const, promptOptions }
}

export async function POST(request: Request) {
  let agencyName = ''
  let websiteUrl = ''
  try {
    const text = await request.text()
    if (text.length > MAX_BODY) return NextResponse.json({ status: 'invalid_request' }, { status: 413 })
    const body = JSON.parse(text) as Record<string, unknown>
    agencyName = clean(body.agencyName, 160)
    websiteUrl = clean(body.websiteUrl, 500)
    if (!agencyName || !websiteUrl) return NextResponse.json({ status: 'invalid_request' }, { status: 400 })

    console.log('[Phase 1 request]', { agencyName, websiteUrl })
    const response = await fetch(PHASE_1_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agencyName, websiteUrl }),
        cache: 'no-store',

    })
    const rawResponse = await response.text()
    console.log('[Phase 1 n8n raw response]', rawResponse)
    if (!response.ok) return NextResponse.json({ status: 'http_error' }, { status: 502 })

    let raw: unknown
    try {
      raw = JSON.parse(rawResponse)
    } catch {
      return NextResponse.json({ status: 'parse_error' }, { status: 502 })
    }
    const normalizedResponse = normalize(raw)
    console.log('[Phase 1 normalized response]', normalizedResponse)
    return NextResponse.json(normalizedResponse)
  } catch (error) {
    console.error('[Phase 1 error]', error)
    return NextResponse.json({ status: 'failed' }, { status: 502 })
  }
}
