'use client';

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
  const handleVisibilityReviewBooking = () => {
    const bookingUrl = getCalendlyBookingUrl();
    if (!bookingUrl) return;
    window.location.assign(bookingUrl);
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

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
        <button onClick={onBack} className="flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-3 font-medium text-secondary-foreground transition hover:bg-secondary/90"><ChevronLeft size={18} aria-hidden="true" /> Back</button>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={handleVisibilityReviewBooking} className="rounded-md border border-primary bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:bg-primary/90">Request My Full AI Visibility Review</button><button onClick={onReset} className="flex items-center justify-center gap-2 rounded-md border border-border bg-card px-5 py-3 font-medium text-foreground transition hover:bg-secondary"><RotateCcw size={17} aria-hidden="true" /> Analyze Another Website</button></div>
      </div>
    </div>
  );
}
