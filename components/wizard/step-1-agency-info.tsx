'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import type { PromptOption, WizardFormData } from '@/app/page';

type Phase1PromptResponse = { status: 'success'; promptOptions: PromptOption[] };

interface Step1Props {
  formData: WizardFormData;
  onNext: (data: Partial<WizardFormData>) => void;
}

const inputClass = 'w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary';

export default function Step1AgencyInfo({ formData, onNext }: Step1Props) {
  const [localData, setLocalData] = useState({ agencyName: formData.agencyName || '', websiteUrl: formData.websiteUrl || '' });
  const [phase1, setPhase1] = useState<Phase1PromptResponse | null>(formData.phase1Analysis as Phase1PromptResponse | null);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptOption | null>(formData.selectedPrompt);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [promptGenerationError, setPromptGenerationError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState('Analyzing your agency...');
  const [isRunningPhase2, setIsRunningPhase2] = useState(false);
  const [phase2Error, setPhase2Error] = useState<string | null>(formData.phase2Error);

  const updateField = (field: keyof typeof localData, value: string) => {
    setLocalData((current) => ({ ...current, [field]: value }));
    setPhase1(null);
    setSelectedPrompt(null);
    setPromptGenerationError(null);
    if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }));
  };

  useEffect(() => {
    if (formData.agencyName !== localData.agencyName || formData.websiteUrl !== localData.websiteUrl) {
      setPhase1(null);
      setSelectedPrompt(null);
    }
  }, [formData.agencyName, formData.websiteUrl, localData.agencyName, localData.websiteUrl]);

  const validInputs = localData.agencyName.trim().length > 0 && /^https?:\/\/.+/.test(localData.websiteUrl.trim());

  const handleFindPrompts = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!localData.agencyName.trim()) nextErrors.agencyName = 'Agency name is required';
    if (!localData.websiteUrl.trim()) nextErrors.websiteUrl = 'Website URL is required';
    else if (!/^https?:\/\/.+/.test(localData.websiteUrl.trim())) nextErrors.websiteUrl = 'Please enter a valid URL (e.g., https://example.com)';
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }

    setIsGeneratingPrompts(true);
    setPromptGenerationError(null);
    setPhase1(null);
    setSelectedPrompt(null);
    setLoadingStage('Analyzing your agency...');
    const timers = [
      window.setTimeout(() => setLoadingStage('Reviewing your website...'), 1400),
      window.setTimeout(() => setLoadingStage('Understanding your services...'), 2800),
      window.setTimeout(() => setLoadingStage('Finding commercially relevant AI questions...'), 4200),
    ];
    try {
      const response = await fetch('/api/phase-1-prompts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agencyName: localData.agencyName.trim(), websiteUrl: localData.websiteUrl.trim() }) });
      const result = await response.json() as Partial<Phase1PromptResponse>;
      if (!response.ok || result.status !== 'success' || !Array.isArray(result.promptOptions) || result.promptOptions.length === 0) {
        setPromptGenerationError("We couldn't generate relevant AI questions.");
        return;
      }
      const normalizedResult = result as Phase1PromptResponse;
      setPhase1(normalizedResult);
      setSelectedPrompt(null);
    } catch (error) {
      console.error('[v0] Phase 1 request failed:', error);
      setPromptGenerationError("We couldn't generate relevant AI questions.");
    } finally {
      timers.forEach(window.clearTimeout);
      setIsGeneratingPrompts(false);
    }
  };

  const handleContinue = async () => {
    if (!phase1 || !selectedPrompt || isRunningPhase2) return;
    const agencyName = localData.agencyName.trim();
    const websiteUrl = localData.websiteUrl.trim();
    setIsRunningPhase2(true);
    setPhase2Error(null);
    console.log('[Phase 2 selected prompt]', selectedPrompt);
    console.log('[Phase 2 request]', { agencyName, websiteUrl, recommendationPrompt: selectedPrompt.prompt });
    try {
      const response = await fetch('/api/phase-2-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyName, websiteUrl, recommendationPrompt: selectedPrompt.prompt, selectedPrompt }),
      });
      const result = await response.json() as Record<string, unknown>;
      if (!response.ok || result.status === 'error') throw new Error("We couldn't complete the AI recommendation check.");
      onNext({ agencyName, websiteUrl, agencyProfile: null, promptOptions: phase1.promptOptions, selectedPrompt, phase1Analysis: phase1, originalPrompt: selectedPrompt.prompt, analysisPrompt: selectedPrompt.prompt, aiRecommendationPrompt: selectedPrompt.prompt, selectedScenarios: [selectedPrompt.prompt], phase2Result: result, isRunningPhase2: false, phase2Error: null, liveAnalysis: undefined });
    } catch (error) {
      console.error('[v0] Phase 2 request failed:', error);
      setPhase2Error("We couldn't complete the AI recommendation check.");
    } finally {
      setIsRunningPhase2(false);
    }
  };

  return <div className="space-y-8">
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Step 01 / Agency profile</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Start with the essentials.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Enter your agency and website. We&apos;ll analyze what your business actually offers and generate the AI recommendation questions most relevant to your agency.</p></div>
      <span className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">Takes about 2 minutes</span>
    </div>

    <form onSubmit={handleFindPrompts} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-5">
        <Field label="Agency Name" id="agencyName" error={errors.agencyName}><input id="agencyName" type="text" placeholder="e.g., KAYE & CO" value={localData.agencyName} onChange={(event) => updateField('agencyName', event.target.value)} className={inputClass} /></Field>
        <Field label="Website URL" id="websiteUrl" error={errors.websiteUrl} hint="We'll analyze publicly available information from your website."><input id="websiteUrl" type="url" placeholder="https://yourwebsite.com" value={localData.websiteUrl} onChange={(event) => updateField('websiteUrl', event.target.value)} className={inputClass} /></Field>
        {promptGenerationError && <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3"><p className="text-sm font-medium text-destructive">{promptGenerationError}</p><p className="mt-1 text-xs leading-5 text-destructive/80">Please check the website and try again.</p><button type="submit" className="mt-3 text-xs font-semibold text-destructive underline underline-offset-4">Try Again</button></div>}
        <button type="submit" disabled={!validInputs || isGeneratingPrompts} className="w-full rounded-lg bg-primary px-4 py-3.5 font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-50">{isGeneratingPrompts ? <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" aria-hidden="true" />{loadingStage}</span> : 'Find Relevant AI Prompts →'}</button>

        {isGeneratingPrompts && <div className="rounded-xl border border-border bg-background p-5" aria-live="polite"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Generating prompt options</p><p className="mt-3 text-sm text-muted-foreground">{loadingStage}</p></div>}

        {phase1 && <section aria-labelledby="prompt-options-title" className="space-y-5 border-t border-border pt-7"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Relevant AI questions</p><h3 id="prompt-options-title" className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Which recommendation do you want to test?</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">These questions are based on what your website currently shows your agency offers. Choose the one that matters most to your business.</p></div><div className="space-y-3">{(phase1.promptOptions || []).map((option) => <PromptCard key={option.id} option={option} selected={selectedPrompt?.id === option.id} onSelect={() => setSelectedPrompt(option)} />)}</div>{phase2Error && <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3"><p className="text-sm font-medium text-destructive">{phase2Error}</p><p className="mt-1 text-xs leading-5 text-destructive/80">Please try again.</p></div>}<button type="button" onClick={handleContinue} disabled={!selectedPrompt || isRunningPhase2} className="w-full rounded-lg bg-primary px-4 py-3.5 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-50">{isRunningPhase2 ? <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" aria-hidden="true" />Checking AI Recommendations...</span> : 'AI Recommendation Preview →'}</button></section>}
      </div>

      <aside className="rounded-xl border border-border bg-background p-5 lg:self-start"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">What we&apos;ll analyze</p><div className="mt-5 space-y-5"><InfoItem label="Public website" value="We use your website to understand your markets, services and specializations." /><InfoItem label="Relevant AI questions" value="We'll generate recommendation questions grounded in what your agency actually offers." /></div><div className="mt-6 border-t border-border pt-5"><p className="text-xs leading-5 text-muted-foreground">You&apos;ll choose which recommendation question you want to test before we run the AI visibility check.</p></div></aside>
    </form>
  </div>;
}

function PromptCard({ option, selected, onSelect }: { option: PromptOption; selected: boolean; onSelect: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return <div className={`rounded-xl border p-4 transition ${selected ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50'}`}><button type="button" role="radio" aria-checked={selected} onClick={onSelect} className="flex w-full items-start gap-3 text-left"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/50'}`}>{selected && <Check size={13} aria-hidden="true" />}</span><span className="flex-1"><span className="block text-sm font-medium leading-6 text-foreground">{option.prompt}</span><span className="mt-3 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Why this matters</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">{option.commercialReason}</span></span><span className="shrink-0 rounded-full border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{option.confidence} relevance</span></button><button type="button" onClick={() => setExpanded((value) => !value)} className="mt-3 inline-flex items-center gap-1 pl-8 text-xs font-medium text-primary">Why was this suggested? <ChevronDown size={13} className={`transition ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" /></button>{expanded && <p className="mt-3 border-t border-border pt-3 pl-8 text-xs leading-5 text-muted-foreground">{option.evidence}</p>}</div>;
}

function InfoItem({ label, value }: { label: string; value: string }) { return <div><p className="text-sm font-medium text-foreground">{label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{value}</p></div>; }
function Field({ label, id, hint, error, children }: { label: string; id: string; hint?: string; error?: string; children: React.ReactNode }) { return <div><label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">{label} *</label>{children}{hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}{error && <p className="mt-1 text-sm text-destructive">{error}</p>}</div>; }
