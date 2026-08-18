import { generateText, gateway } from 'ai'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MAX_BODY = 24_000
const MAX_PAGE_BYTES = 120_000
const MAX_PAGES = 4
const MODELS = ['openai/gpt-oss-120b', 'openai/o4-mini'] as const

type AnalyzeInput = {
  agencyName: string
  websiteUrl: string
  recommendationPrompt: string
  originalPrompt?: string
  analysisPrompt?: string
}

type PageContext = { url: string; title: string; description: string; headings: string[]; text: string }

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function absoluteUrl(value: string) {
  const url = new URL(value.startsWith('http') ? value : `https://${value}`)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported website URL')
  url.hash = ''
  return url
}

async function fetchPage(url: URL): Promise<PageContext | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 7000)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'AI-Recommendation-Preview/1.0' },
      cache: 'no-store',
    })
    if (!response.ok) return null
    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) return null
    const reader = response.body?.getReader()
    if (!reader) return null
    const chunks: Uint8Array[] = []
    let total = 0
    while (total < MAX_PAGE_BYTES) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue
      const remaining = MAX_PAGE_BYTES - total
      chunks.push(value.slice(0, remaining))
      total += Math.min(value.byteLength, remaining)
      if (value.byteLength > remaining) break
    }
    await reader.cancel()
    const html = new TextDecoder().decode(concat(chunks, total))
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''
    const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)?.[1] ?? ''
    const headings = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map((match) => strip(match[1])).filter(Boolean).slice(0, 20)
    const text = strip(html).slice(0, 14_000)
    return { url: url.toString(), title: strip(title), description: strip(description), headings, text }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function concat(chunks: Uint8Array[], total: number) {
  const result = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength }
  return result
}

function strip(value: string) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
}

function discoverLinks(html: string, origin: URL) {
  return [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => { try { return { url: new URL(match[1], origin), label: strip(match[2]).toLowerCase() } } catch { return null } })
    .filter((link): link is { url: URL; label: string } => Boolean(link))
    .filter((link) => link.url.origin === origin.origin)
    .filter((link) => /about|service|contact|location|area|company|team/.test(`${link.url.pathname} ${link.label}`))
    .map((link) => link.url)
}

async function callN8n(input: AnalyzeInput) {
  const webhookUrl = process.env.N8N_ANALYZE_WEBHOOK_URL
  if (!webhookUrl) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        agencyName: input.agencyName,
        websiteUrl: input.websiteUrl,
        recommendationPrompt: input.recommendationPrompt,
        source: 'ai-recommendation-preview',
      }),
      signal: controller.signal,
      cache: 'no-store',
    })
    const text = await response.text()
    let data: unknown = text
    try { data = JSON.parse(text) } catch { /* n8n may return plain text */ }
    if (!response.ok) throw new Error(`n8n webhook returned ${response.status}`)
    return data
  } finally {
    clearTimeout(timeout)
  }
}

function normalizeN8nResponse(data: unknown, input: AnalyzeInput) {
  const payload = Array.isArray(data) ? data[0] : data
  const value = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  const recommendationKeys = ['Model', 'Agency Name', 'Website', 'Location', 'Prompt', 'Answer', 'Mentioned?', 'Reason']
  const hasRecommendation = recommendationKeys.every((key) => key in value)
  const responses = Array.isArray(value.responses)
    ? value.responses.filter((item): item is { model: string; rawAnswer: string } => Boolean(item && typeof item === 'object' && typeof (item as Record<string, unknown>).rawAnswer === 'string')).map((item) => ({ model: String(item.model || 'n8n'), rawAnswer: item.rawAnswer }))
    : [{ model: String(value.Model || 'n8n'), rawAnswer: typeof value.Answer === 'string' ? value.Answer : typeof data === 'string' ? data : JSON.stringify(data, null, 2) }]
  return {
    status: String(value.status || (hasRecommendation ? 'success' : 'analysis_failed')),
    input: value.input || { ...input },
    responses,
    errors: Array.isArray(value.errors) ? value.errors : [],
    n8n: true,
    n8nResponse: hasRecommendation ? {
      Model: String(value.Model),
      'Agency Name': String(value['Agency Name']),
      Website: String(value.Website),
      Location: String(value.Location),
      Prompt: String(value.Prompt),
      Answer: String(value.Answer),
      'Mentioned?': value['Mentioned?'] === true,
      Reason: String(value.Reason),
    } : undefined,
    message: hasRecommendation ? undefined : 'AI recommendation analysis couldn\'t be completed.',
  }
}

function buildPrompt(input: AnalyzeInput, pages: PageContext[]) {
  const evidence = pages.map((page) => `URL: ${page.url}\nTitle: ${page.title}\nDescription: ${page.description}\nHeadings: ${page.headings.join(' | ')}\nText: ${page.text}`).join('\n\n')
  return `You are evaluating a business website for AI recommendation visibility.\nBusiness: ${input.agencyName}\nRecommendation question (preserve exactly as intent): ${input.recommendationPrompt}\nAnalysis prompt: ${input.analysisPrompt}\n\nWebsite evidence is the only source of truth. Do not infer unsupported claims, rankings, scores, or competitors. Return valid JSON only with keys: targetMentioned (boolean), recommended (boolean), qualitativePosition (string), reasoning (string), evidence (array of strings), competitorNames (array of strings), visibilityAssessment (string). Mention means the business is explicitly present in the evidence. Recommended means the answer explicitly recommends it for the analysis prompt.\n\nEvidence:\n${evidence}`
}

export async function POST(request: Request) {
  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY) return NextResponse.json({ status: 'invalid_request', message: 'Request is too large.' }, { status: 413 })
    const body = JSON.parse(raw) as Record<string, unknown>
    const input: AnalyzeInput = {
      agencyName: clean(body.agencyName, 160),
      websiteUrl: clean(body.websiteUrl, 500),
      recommendationPrompt: clean(body.recommendationPrompt, 600),
    }
    if (!input.agencyName || !input.websiteUrl || !input.recommendationPrompt) return NextResponse.json({ status: 'invalid_request', message: 'Agency name, website, and recommendation question are required.' }, { status: 400 })
    input.originalPrompt = input.recommendationPrompt
    input.analysisPrompt = input.recommendationPrompt

    const n8nResult = await callN8n(input)
    if (n8nResult !== null) return NextResponse.json(normalizeN8nResponse(n8nResult, input))

    const site = absoluteUrl(input.websiteUrl)
    const homepage = await fetchPage(site)
    if (!homepage) return NextResponse.json({ status: 'website_unavailable', message: 'The website could not be reached or did not return readable HTML.' }, { status: 422 })
    const links = discoverLinks(await (await fetch(site)).text().catch(() => ''), site)
    const pages = [homepage]
    for (const link of links.slice(0, MAX_PAGES - 1)) {
      const page = await fetchPage(link)
      if (page) pages.push(page)
    }
    const prompt = buildPrompt(input, pages)
    const settled = await Promise.allSettled(MODELS.map(async (model) => {
      const result = await generateText({ model: gateway(model), prompt, maxOutputTokens: 700 })
      return { model, rawAnswer: result.text }
    }))
    const responses = settled.flatMap((result) => result.status === 'fulfilled' ? [result.value] : [])
    const errors = settled.flatMap((result, index) => result.status === 'rejected' ? [{ model: MODELS[index], message: result.reason instanceof Error ? result.reason.message : 'Model request failed' }] : [])
    if (!responses.length) return NextResponse.json({ status: 'analysis_failed', message: 'All model requests failed.', errors }, { status: 502 })
    return NextResponse.json({ status: errors.length ? 'partial_success' : 'success', input: { ...input, analyzedPageUrls: pages.map((page) => page.url) }, responses, errors })
  } catch (error) {
    return NextResponse.json({ status: 'analysis_failed', message: error instanceof Error ? error.message : 'Analysis failed.' }, { status: 500 })
  }
}
