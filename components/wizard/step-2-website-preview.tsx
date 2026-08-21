'use client';

import { useState } from 'react';
import { AlertCircle, Check, ChevronLeft, LoaderCircle, X } from 'lucide-react';
import type { WizardFormData } from '@/app/page';

type RecommendationResponse = {
  Model: string;
  'Agency Name': string;
  Website: string;
  Prompt: string;
  Answer: string;
  'Mentioned?': boolean;
  Reason: string;
};

function normalizePhase2Response(value: WizardFormData['phase2Result']): RecommendationResponse | null {
  let current: unknown = value;
  if (Array.isArray(current)) current = current[0];
  if (current && typeof current === 'object') {
    const record = current as Record<string, unknown>;
    current = record.output ?? record.response ?? record.data ?? current;
  }
  if (Array.isArray(current)) current = current[0];
  if (!current || typeof current !== 'object') return null;
  const record = current as Record<string, unknown>;
  const answer = record.Answer ?? record.answer;
  const prompt = record.Prompt ?? record.prompt;
  if (typeof answer !== 'string' || typeof prompt !== 'string') return null;
  return {
    Model: String(record.Model ?? record.model ?? 'n8n'),
    'Agency Name': String(record['Agency Name'] ?? record.agencyName ?? ''),
    Website: String(record.Website ?? record.websiteUrl ?? ''),
    Prompt: prompt,
    Answer: answer,
    'Mentioned?': record['Mentioned?'] === true || record.mentioned === true,
    Reason: String(record.Reason ?? record.reason ?? ''),
  };
}

interface Step2Props {
  formData: WizardFormData;
  onNext: (data: Partial<WizardFormData>) => void;
  onBack: () => void;
}

export default function Step2WebsitePreview({ formData, onNext, onBack }: Step2Props) {
  const [isStartingWebsiteAnalysis, setIsStartingWebsiteAnalysis] = useState(false);
  const [websiteAnalysisError, setWebsiteAnalysisError] = useState('');
  const response = normalizePhase2Response(formData.phase2Result);
  const phase2Failed = Boolean(formData.phase2Error);

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
          recommendationPrompt: formData.originalPrompt,
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

  if (formData.isRunningPhase2) {
    return <div className="flex min-h-[28rem] flex-col items-center justify-center gap-4 text-center"><LoaderCircle className="animate-spin text-primary" size={24} aria-hidden="true" /><div><h2 className="font-serif text-2xl font-bold text-foreground">Analyzing AI recommendations...</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Waiting for the n8n analysis to return.</p></div></div>;
  }

  if (phase2Failed || !response) {
    return <div className="space-y-6"><button onClick={onBack} className="flex items-center gap-2 rounded-md bg-secondary px-4 py-3 font-medium text-secondary-foreground transition hover:bg-secondary/90"><ChevronLeft size={18} aria-hidden="true" />Back</button><section className="flex min-h-[22rem] flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center" role="alert"><AlertCircle className="text-muted-foreground" size={25} aria-hidden="true" /><h2 className="mt-4 font-serif text-2xl font-bold text-foreground">AI recommendation analysis couldn&apos;t be completed.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Please return to Step 1 and retry the selected prompt.</p></section></div>;
  }

  const mentioned = response['Mentioned?'];
  return (
    <div className="space-y-8 pb-4">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Step 02 / AI recommendation</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">AI Recommendation Analysis</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">See how AI assistants evaluate your business for the recommendation question you submitted.</p></div>
        <span className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${mentioned ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}><span className={`h-1.5 w-1.5 rounded-full ${mentioned ? 'bg-primary' : 'bg-muted-foreground'}`} />{mentioned ? 'Agency mentioned' : 'Not mentioned'}</span>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(250px,.7fr)]">
        <section className="rounded-xl border border-primary/30 bg-primary/[0.04] p-6" aria-labelledby="recommendation-title"><div className="flex items-center justify-between gap-4"><h3 id="recommendation-title" className="text-lg font-semibold text-foreground">AI recommendation</h3><span className="text-xs font-medium text-primary">Live response</span></div><dl className="mt-5 space-y-4 border-t border-primary/10 pt-5"><div><dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Prompt</dt><dd className="mt-2 text-sm leading-6 text-foreground">{response.Prompt}</dd></div></dl><div className="mt-6 border-t border-primary/10 pt-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">AI response</p><div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">{response.Answer}</div></div></section>
        <section className="rounded-xl border border-border bg-background p-6" aria-labelledby="agency-result-title"><div className="flex items-start gap-3"><span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${mentioned ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>{mentioned ? <Check size={17} aria-hidden="true" /> : <X size={17} aria-hidden="true" />}</span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Agency signal</p><h3 id="agency-result-title" className="mt-2 text-lg font-semibold text-foreground">{mentioned ? 'You appeared in the answer.' : 'You did not appear in the answer.'}</h3></div></div><div className="mt-6 border-t border-border pt-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Agency checked</p><p className="mt-2 text-sm font-medium leading-6 text-foreground">{response['Agency Name']}</p><p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Context</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{response.Reason}</p></div></section>
      </div>
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
