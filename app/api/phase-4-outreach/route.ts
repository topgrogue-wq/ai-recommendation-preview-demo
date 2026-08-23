import { NextResponse } from 'next/server';

const PHASE_4_WEBHOOK_URL =
  process.env.N8N_PHASE_4_WEBHOOK_URL ||
  'https://n8n-production-888fb.up.railway.app/webhook-test/aeo-preview/phase-4';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ status: 'invalid_request', message: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!isRecord(payload)) {
    return NextResponse.json({ status: 'invalid_request', message: 'A payload is required.' }, { status: 400 });
  }

  const agencyProfile = payload.agencyProfile;
  const selectedPrompt = payload.selectedPrompt;
  const aiRecommendation = payload.aiRecommendation;
  const websiteAnalysis = payload.websiteAnalysis;
  const friction = isRecord(websiteAnalysis) ? websiteAnalysis.friction : null;
  const improvement = isRecord(websiteAnalysis) ? websiteAnalysis.improvement : null;
  const missing = [
    !hasText(payload.agencyName) && 'agencyName',
    !hasText(payload.websiteUrl) && 'websiteUrl',
    !isRecord(agencyProfile) && 'agencyProfile',
    !isRecord(selectedPrompt) || !hasText(selectedPrompt.prompt) ? 'selectedPrompt.prompt' : false,
    !isRecord(aiRecommendation) && 'aiRecommendation',
    !isRecord(friction) && 'websiteAnalysis.friction',
    !isRecord(improvement) && 'websiteAnalysis.improvement',
  ].filter(Boolean);

  if (missing.length > 0) {
    return NextResponse.json({ status: 'invalid_request', message: `Missing required analysis data: ${missing.join(', ')}` }, { status: 400 });
  }

  console.log('[Phase 4 n8n request]', payload);
  try {
    const n8nResponse = await fetch(PHASE_4_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('[Phase 4 n8n status]', n8nResponse.status);
    if (!n8nResponse.ok) {
      return NextResponse.json({ status: 'upstream_error', message: 'Phase 4 webhook rejected the request.' }, { status: 502 });
    }
    return NextResponse.json({ status: 'accepted' });
  } catch (error) {
    console.error('[Phase 4 n8n request failed]', error);
    return NextResponse.json({ status: 'upstream_error', message: 'Phase 4 webhook could not be reached.' }, { status: 502 });
  }
}
