'use client';

import { useState } from 'react';
import { AlertCircle, Check, ChevronLeft, LoaderCircle, X } from 'lucide-react';
import type { WizardFormData } from '@/app/page';

interface Step2Props {
  formData: WizardFormData;
  onNext: (data: Partial<WizardFormData>) => void;
  onBack: () => void;
}

export default function Step2WebsitePreview({ formData, onNext, onBack }: Step2Props) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isStartingWebsiteAnalysis, setIsStartingWebsiteAnalysis] = useState(false);
  const [websiteAnalysisError, setWebsiteAnalysisError] = useState('');
  const analysis = formData.liveAnalysis;
  const response = analysis?.n8nResponse;

  const handleStartWebsiteAnalysis = async () => {
    setIsStartingWebsiteAnalysis(true);
    setWebsiteAnalysisError('');

    try {
      const result = await fetch('https://n8n-production-888fb.up.railway.app/webhook-test/aeo-preview/phase-3', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          agencyName: formData.agencyName,
          websiteUrl: formData.websiteUrl,
          businessLocation: formData.businessLocation,
          originalPrompt: formData.originalPrompt,
          analysisPrompt: formData.analysisPrompt,
          aiAnswer: response?.Answer ?? '',
          mentioned: response?.['Mentioned?'] ?? false,
          reason: response?.Reason ?? '',
        }),
      });

      if (!result.ok) throw new Error('Phase 3 webhook request failed');

      let phase3Response: unknown = null;
      const responseText = await result.text();
      if (responseText) {
        try {
          phase3Response = JSON.parse(responseText);
        } catch {
          phase3Response = responseText;
        }
      }

      onNext({ phase3Response });
    } catch (error) {
      console.error('[v0] Phase 3 website analysis failed:', error);
      setWebsiteAnalysisError("We couldn't start the website analysis. Please try again.");
    } finally {
      setIsStartingWebsiteAnalysis(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const result = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ agencyName: formData.agencyName, websiteUrl: formData.websiteUrl, businessLocation: formData.businessLocation, originalPrompt: formData.originalPrompt }),
      });
      const data = await result.json();
      if (!result.ok || !data.n8nResponse) throw new Error('AI recommendation analysis couldn\'t be completed.');
      onNext({ liveAnalysis: data });
    } finally {
      setIsRetrying(false);
    }
  };

  if (isRetrying || analysis?.status === 'loading') {
    return <div className="flex min-h-[28rem] flex-col items-center justify-center gap-4 text-center"><LoaderCircle className="animate-spin text-primary" size={24} aria-hidden="true" /><div><h2 className="font-serif text-2xl font-bold text-foreground">Analyzing AI recommendations...</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Waiting for the n8n analysis to return.</p></div></div>;
  }

  if (analysis?.status === 'analysis_failed' || analysis?.status === 'website_unavailable' || !response) {
    return <div className="space-y-6"><button onClick={onBack} className="flex items-center gap-2 rounded-md bg-secondary px-4 py-3 font-medium text-secondary-foreground transition hover:bg-secondary/90"><ChevronLeft size={18} aria-hidden="true" />Back</button><section className="flex min-h-[22rem] flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center" role="alert"><AlertCircle className="text-muted-foreground" size={25} aria-hidden="true" /><h2 className="mt-4 font-serif text-2xl font-bold text-foreground">AI recommendation analysis couldn&apos;t be completed.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Please try again.</p><button onClick={handleRetry} className="mt-6 rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:bg-primary/90">Retry analysis</button></section></div>;
  }

  const mentioned = response['Mentioned?'];
  return (
    <div className="space-y-6 pb-4">
      <div className="mb-8"><h2 className="mb-2 font-serif text-2xl font-bold text-foreground">Step 2: AI Recommendation</h2><p className="max-w-2xl leading-6 text-muted-foreground">See what AI recommends for your question and whether your agency appears in the answer.</p></div>
      <section className="rounded-lg border border-primary/40 bg-primary/[0.04] p-5" aria-labelledby="recommendation-title"><h3 id="recommendation-title" className="text-lg font-semibold text-foreground">AI Recommendation</h3><dl className="mt-4 divide-y divide-primary/10"><div className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[8rem_1fr] sm:gap-5"><dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Prompt</dt><dd className="text-sm leading-6 text-foreground">{response.Prompt}</dd></div><div className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-5"><dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Location</dt><dd className="text-sm leading-6 text-foreground">{response.Location}</dd></div></dl><div className="mt-5 border-t border-primary/10 pt-5"><p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">AI Response</p><div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">{response.Answer}</div></div></section>
      <section className={`rounded-lg border p-5 ${mentioned ? 'border-primary/40 bg-primary/[0.04]' : 'border-border bg-card'}`} aria-labelledby="agency-result-title"><div className="flex items-start gap-3"><span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${mentioned ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>{mentioned ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}</span><div><h3 id="agency-result-title" className="text-base font-semibold text-foreground">{mentioned ? 'Your agency was mentioned' : "Your agency wasn't mentioned"}</h3><p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Agency</p><p className="mt-1 text-sm text-foreground">{response['Agency Name']}</p></div></div><div className="mt-5 border-t border-border pt-4"><p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Why</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{response.Reason}</p></div></section>
      <div className="border-t border-border pt-5">
        {websiteAnalysisError && <p role="alert" className="mb-3 text-sm leading-6 text-destructive">{websiteAnalysisError}</p>}
        <div className="flex gap-3">
          <button onClick={onBack} disabled={isStartingWebsiteAnalysis} className="flex items-center gap-2 rounded-md bg-secondary px-4 py-3 font-medium text-secondary-foreground transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"><ChevronLeft size={18} aria-hidden="true" />Back</button>
          <button onClick={handleStartWebsiteAnalysis} disabled={isStartingWebsiteAnalysis} className="flex-1 rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60">{isStartingWebsiteAnalysis ? 'Starting website analysis...' : 'Continue to Website Analysis →'}</button>
        </div>
      </div>
    </div>
  );
}
