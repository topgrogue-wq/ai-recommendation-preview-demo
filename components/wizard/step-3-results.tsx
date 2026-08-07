'use client';

import { ChevronLeft, Check, RotateCcw } from 'lucide-react';
import BrowserPreview from '@/components/wizard/browser-preview';

interface Step3Props {
  formData: {
    agencyName: string;
    websiteUrl: string;
    selectedScenarios?: string[];
  };
  onBack: () => void;
  onReset: () => void;
}

const changedItems = [
  'Clear local authority headline',
  'Stronger primary CTA',
  'Better property category structure',
  'Easier for AI to understand what the agency specializes in',
];

export default function Step3Results({ formData, onBack, onReset }: Step3Props) {
  const agencyName = formData.agencyName || 'Your agency';
  const websiteUrl = formData.websiteUrl || 'yourwebsite.com';

  return (
    <div className="space-y-10 pb-4">
      <div className="mb-2">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Step 3: One Improvement
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Here&apos;s one focused improvement that can make your website easier for AI platforms to understand and recommend.
        </p>
      </div>

      <section aria-labelledby="comparison-title" className="space-y-5">
        <div>
          <h3 id="comparison-title" className="text-lg font-semibold text-foreground">
            See the difference
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            One focused change, shown before and after.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-foreground">Current Version</span>
              <span className="text-xs text-muted-foreground">{agencyName}</span>
            </div>
            <BrowserPreview agencyName={agencyName} websiteUrl={websiteUrl} variant="current" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-primary">AI-Optimized Version</span>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">One improvement</span>
            </div>
            <BrowserPreview agencyName={agencyName} websiteUrl={websiteUrl} variant="improved" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-border bg-card p-6 md:p-7">
          <h3 className="text-lg font-semibold text-foreground">What Changed</h3>
          <ul className="mt-5 space-y-4">
            {changedItems.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check size={13} strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 md:p-7">
          <h3 className="text-lg font-semibold text-foreground">Why this helps AI</h3>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            AI assistants recommend businesses when they can quickly understand who the company serves, where it operates, and why it stands out. Making those signals clearer increases the likelihood of your agency appearing in AI-generated recommendations.
          </p>
        </div>
      </section>

      <section aria-labelledby="confidence-title" className="rounded-xl border border-border bg-background p-6 md:p-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 id="confidence-title" className="text-lg font-semibold text-foreground">AI Recommendation Confidence</h3>
            <p className="mt-2 text-xs text-muted-foreground">Preview estimate based on observable website signals. This is illustrative only.</p>
          </div>
          <div className="flex gap-10">
            <Confidence label="Current" dots={2} />
            <Confidence label="After Improvement" dots={4} highlighted />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-primary/25 bg-primary/5 p-6 md:p-7">
        <h3 className="text-lg font-semibold text-foreground">This preview intentionally focuses on one improvement.</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          During the analysis we identified four additional opportunities, but I wanted to keep this preview focused so it&apos;s easy to evaluate.
        </p>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-3 font-medium text-secondary-foreground transition hover:bg-secondary/90"
        >
          <ChevronLeft size={18} aria-hidden="true" />
          Back
        </button>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-md border border-primary bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Request My Full AI Visibility Review
          </button>
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 rounded-md border border-border bg-card px-5 py-3 font-medium text-foreground transition hover:bg-secondary"
          >
            <RotateCcw size={17} aria-hidden="true" />
            Analyze Another Website
          </button>
        </div>
      </div>
    </div>
  );
}

function Confidence({ label, dots, highlighted = false }: { label: string; dots: number; highlighted?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 flex gap-1.5" aria-label={`${dots} out of 5 confidence`}>
        {[0, 1, 2, 3, 4].map((dot) => (
          <span key={dot} className={`h-2.5 w-2.5 rounded-full ${dot < dots ? (highlighted ? 'bg-primary' : 'bg-muted-foreground') : 'bg-muted'}`} />
        ))}
      </div>
    </div>
  );
}
