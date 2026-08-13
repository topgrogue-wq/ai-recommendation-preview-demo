'use client';

import { ChevronLeft, RotateCcw } from 'lucide-react';
import BrowserPreview from '@/components/wizard/browser-preview';

interface Step3Props {
  formData: {
    agencyName: string;
    websiteUrl: string;
    businessLocation: string;
    aiRecommendationPrompt: string;
    selectedScenarios?: string[];
    liveAnalysis?: {
      status: string;
      input?: Record<string, unknown>;
      responses?: Array<{ model: string; rawAnswer: string }>;
      errors?: Array<{ model: string; message: string }>;
      message?: string;
    };
  };
  onBack: () => void;
  onReset: () => void;
}

export default function Step3Results({ formData, onBack, onReset }: Step3Props) {
  const agencyName = formData.agencyName || 'Your agency';
  const websiteUrl = formData.websiteUrl || 'yourwebsite.com';
  const businessLocation = formData.businessLocation || 'your local market';
  const liveResponses = formData.liveAnalysis?.responses ?? [];
  const liveErrors = formData.liveAnalysis?.errors ?? [];

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
            <BrowserPreview agencyName={agencyName} websiteUrl={websiteUrl} businessLocation={businessLocation} variant="current" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-primary">AI-Optimized Version</span>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">One improvement</span>
            </div>
            <BrowserPreview agencyName={agencyName} websiteUrl={websiteUrl} businessLocation={businessLocation} variant="improved" />
          </div>
        </div>
      </section>

      <section aria-labelledby="analysis-title" className="rounded-xl border border-border bg-background p-6 md:p-7">
        <h3 id="analysis-title" className="text-lg font-semibold text-foreground">Live AI analysis</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Raw model responses are shown below so the findings remain inspectable and evidence-based.</p>
        <div className="mt-5 space-y-4">
          {liveResponses.map((response) => (
            <article key={response.model} className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-medium text-primary">{response.model}</p>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-muted-foreground">{response.rawAnswer}</pre>
            </article>
          ))}
          {liveErrors.map((error) => <p key={error.model} className="text-sm text-destructive">{error.model}: {error.message}</p>)}
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

