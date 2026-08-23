'use client';

import { useState } from 'react';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import type { WizardFormData } from '@/app/page';
import { getCalendlyBookingUrl } from '@/lib/config';

type AnalysisSection = {
  title: string;
  problem?: string;
  evidence?: string;
  whyItMatters?: string;
  recommendation?: string;
  structuralChange?: string;
  exampleCopy?: string;
  expectedDirection?: string;
  confidence?: string;
};

type Phase3Analysis = {
  friction: AnalysisSection;
  improvement: AnalysisSection;
};

function unwrapPhase3(value: unknown): unknown {
  if (Array.isArray(value)) return unwrapPhase3(value[0]);
  if (!value || typeof value !== 'object') return value;
  const record = value as Record<string, unknown>;
  if (record.output) return unwrapPhase3(record.output);
  if (record.response) return unwrapPhase3(record.response);
  if (record.data) return unwrapPhase3(record.data);
  return value;
}

function normalizePhase3(value: unknown): Phase3Analysis | null {
  const unwrapped = unwrapPhase3(value);
  if (!unwrapped || typeof unwrapped !== 'object') return null;
  const record = unwrapped as Record<string, unknown>;
  const friction = record.friction;
  const improvement = record.improvement;
  if (!friction || typeof friction !== 'object' || !improvement || typeof improvement !== 'object') return null;

  const frictionRecord = friction as Record<string, unknown>;
  const improvementRecord = improvement as Record<string, unknown>;
  if (typeof frictionRecord.title !== 'string' || typeof improvementRecord.title !== 'string') return null;

  return {
    friction: frictionRecord as unknown as AnalysisSection,
    improvement: improvementRecord as unknown as AnalysisSection,
  };
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="border-t border-border pt-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm leading-7 text-foreground">{value}</p>
    </div>
  );
}

interface Step3Props {
  formData: WizardFormData;
  onBack: () => void;
  onReset: () => void;
}

export default function Step3Results({ formData, onBack, onReset }: Step3Props) {
  const [isRequestingFullReview, setIsRequestingFullReview] = useState(false);
  const [phase4Error, setPhase4Error] = useState('');

  const handleVisibilityReviewBooking = async () => {
    if (isRequestingFullReview) return;
    const bookingUrl = getCalendlyBookingUrl();
    if (!bookingUrl) return;

    const phase3 = asRecord(formData.phase3Response);
    const phase3Data = asRecord(phase3.output || phase3.response || phase3.data || phase3);
    const phase3Friction = asRecord(phase3Data.friction || analysis?.friction);
    const phase3Improvement = asRecord(phase3Data.improvement || analysis?.improvement);
    const phase2 = formData.phase2Result;
    const selectedPrompt = formData.selectedPrompt;
    const profile = formData.agencyProfile;
    const missing = [
      !formData.agencyName && 'agencyName',
      !formData.websiteUrl && 'websiteUrl',
      !profile && 'agencyProfile',
      !selectedPrompt?.prompt && 'selectedPrompt.prompt',
      !phase2 && 'phase2Result',
      !phase3Friction.title && 'phase3Result.friction',
      !phase3Improvement.title && 'phase3Result.improvement',
    ].filter(Boolean);

    const phase4Payload = {
      source: 'ai-recommendation-preview' as const,
      agencyName: formData.agencyName,
      websiteUrl: formData.websiteUrl,
      agencyProfile: profile,
      selectedPrompt,
      aiRecommendation: phase2 && {
        model: phase2.model ?? null,
        prompt: phase2.prompt,
        answer: phase2.answer ?? null,
        mentioned: phase2.mentioned,
        recommended: phase2.recommended ?? null,
        position: phase2.position ?? null,
        reason: phase2.reason,
      },
      websiteAnalysis: {
        pageLabel: typeof phase3Data.pageLabel === 'string' && phase3Data.pageLabel.trim() ? phase3Data.pageLabel : 'Submitted page',
        pageUrl: typeof phase3Data.pageUrl === 'string' && phase3Data.pageUrl.trim() ? phase3Data.pageUrl : formData.websiteUrl,
        friction: {
          title: phase3Friction.title,
          problem: phase3Friction.problem,
          evidence: phase3Friction.evidence,
          whyItMatters: phase3Friction.whyItMatters,
          confidence: phase3Friction.confidence,
        },
        improvement: {
          title: phase3Improvement.title,
          recommendation: phase3Improvement.recommendation,
          structuralChange: phase3Improvement.structuralChange,
          exampleCopy: phase3Improvement.exampleCopy,
          expectedDirection: phase3Improvement.expectedDirection,
          confidence: phase3Improvement.confidence,
        },
      },
      previewAssetExists: Boolean(phase3Friction.title && phase3Improvement.title),
      requestedAt: new Date().toISOString(),
    };

    if (missing.length > 0) {
      setPhase4Error(`Some analysis data is missing: ${missing.join(', ')}. Please return to the previous step and try again.`);
      return;
    }

    setPhase4Error('');
    setIsRequestingFullReview(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/phase-4-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phase4Payload),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.status !== 'accepted') {
        console.error('[v0] Phase 4 outreach rejected:', response.status, result);
        setPhase4Error(result?.message || 'The full review request could not be sent to n8n. Keep the Phase 4 webhook listening, then try again.');
        return;
      }
      window.location.assign(bookingUrl);
    } catch (error) {
      console.error('[v0] Phase 4 outreach request failed:', error);
      setPhase4Error(error instanceof DOMException && error.name === 'AbortError' ? 'n8n took too long to respond. Keep the Phase 4 webhook listening, then try again.' : 'The full review request could not be sent to n8n.');
    } finally {
      window.clearTimeout(timeout);
      setIsRequestingFullReview(false);
    }
  };

  const agencyName = formData.agencyName || 'Your agency';
  const websiteUrl = formData.websiteUrl || 'yourwebsite.com';
  const recommendationQuestion = formData.originalPrompt || 'your submitted recommendation question';
  const analysis = normalizePhase3(formData.phase3Response);

  if (!analysis) {
    return (
      <div className="space-y-6" role="alert">
        <button onClick={onBack} className="flex items-center gap-2 rounded-md bg-secondary px-4 py-3 font-medium text-secondary-foreground transition hover:bg-secondary/90">
          <ChevronLeft size={18} aria-hidden="true" /> Back
        </button>
        <section className="rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="font-serif text-2xl font-bold text-foreground">Website analysis couldn&apos;t be loaded</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">The live n8n response did not contain the expected friction and improvement data.</p>
          <button onClick={onBack} className="mt-6 rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:bg-primary/90">Try Again</button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-4">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Step 03 / Website analysis</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Turn the signal into action.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Analysis for: <span className="font-medium text-foreground">{recommendationQuestion}</span></p></div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Analysis complete</span>
      </div>

      <section aria-labelledby="website-information-title" className="rounded-xl border border-border bg-background p-5 md:p-6">
        <h3 id="website-information-title" className="sr-only">Website Information</h3>
        <div className="grid gap-5 md:grid-cols-3">
          <div><p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Agency Name</p><p className="mt-2 break-words text-sm font-medium leading-6 text-foreground">{agencyName}</p></div>
          <div><p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Website</p><p className="mt-2 break-words text-sm font-medium leading-6 text-foreground">{websiteUrl}</p></div>
          <div><p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Recommendation question</p><p className="mt-2 break-words text-sm font-medium leading-6 text-foreground">{recommendationQuestion}</p></div>
        </div>
      </section>

      <section aria-labelledby="friction-title" className="rounded-xl border border-border bg-card p-6 md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">One friction</p>
        <h3 id="friction-title" className="mt-2 text-xl font-semibold text-foreground">{analysis.friction.title}</h3>
        <div className="mt-5 space-y-4">
          <Detail label="Problem" value={analysis.friction.problem} />
          <div className="border-t border-primary/30 pt-4"><p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">Evidence from submitted website</p><p className="mt-2 text-sm leading-7 text-foreground">{analysis.friction.evidence}</p></div>
          <Detail label="Why It Matters" value={analysis.friction.whyItMatters} />
        </div>
      </section>

      <section aria-labelledby="improvement-title" className="rounded-xl border border-primary/25 bg-primary/5 p-6 md:p-7">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">Recommended Improvement</p>
        <h3 id="improvement-title" className="mt-2 text-xl font-semibold text-foreground">{analysis.improvement.title}</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Recommendation based on the identified friction.</p>
        <div className="mt-5 space-y-4">
          <Detail label="Recommendation" value={analysis.improvement.recommendation} />
          <Detail label="What to Change" value={analysis.improvement.structuralChange} />
          <Detail label="Example" value={analysis.improvement.exampleCopy} />
          <Detail label="Expected Direction" value={analysis.improvement.expectedDirection} />
        </div>
      </section>

      {phase4Error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive">{phase4Error}</p>}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
        <button onClick={onBack} className="flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-3 font-medium text-secondary-foreground transition hover:bg-secondary/90"><ChevronLeft size={18} aria-hidden="true" /> Back</button>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={handleVisibilityReviewBooking} disabled={isRequestingFullReview} className="rounded-md border border-primary bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60">{isRequestingFullReview ? 'Preparing Your Review...' : 'Request My Full AI Visibility Review'}</button><button onClick={onReset} className="flex items-center justify-center gap-2 rounded-md border border-border bg-card px-5 py-3 font-medium text-foreground transition hover:bg-secondary"><RotateCcw size={17} aria-hidden="true" /> Analyze Another Website</button></div>
      </div>
    </div>
  );
}
