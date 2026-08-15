'use client';

import { useState } from 'react';
import type { WizardFormData } from '@/app/page';

const DEFAULT_PROMPT = 'Best real estate agency for luxury buyers';

interface Step1Props {
  formData: WizardFormData;
  onNext: (data: Partial<WizardFormData>) => void;
}

export default function Step1AgencyInfo({ formData, onNext }: Step1Props) {
  const [localData, setLocalData] = useState({
    agencyName: formData.agencyName || '',
    websiteUrl: formData.websiteUrl || '',
    businessLocation: formData.businessLocation || '',
    originalPrompt: formData.originalPrompt || formData.aiRecommendationPrompt || DEFAULT_PROMPT,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  const updateField = (field: keyof typeof localData, value: string) => {
    setLocalData((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!localData.agencyName.trim()) newErrors.agencyName = 'Agency name is required';
    if (!localData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'Website URL is required';
    } else if (!/^https?:\/\/.+/.test(localData.websiteUrl)) {
      newErrors.websiteUrl = 'Please enter a valid URL (e.g., https://example.com)';
    }
    if (!localData.businessLocation.trim()) newErrors.businessLocation = 'Business location is required';
    if (!localData.originalPrompt.trim()) {
      newErrors.originalPrompt = 'AI recommendation prompt is required';
    }
    return newErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAnalysisError('');
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const originalPrompt = localData.originalPrompt.trim();
    const businessLocation = localData.businessLocation.trim();
    const locationPattern = new RegExp(`\\b${escapeRegExp(businessLocation)}\\b`, 'i');
    const analysisPrompt = locationPattern.test(originalPrompt)
      ? originalPrompt
      : `${originalPrompt} in ${businessLocation}`;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          agencyName: localData.agencyName.trim(),
          websiteUrl: localData.websiteUrl.trim(),
          businessLocation,
          originalPrompt,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.status === 'analysis_failed' || result.status === 'website_unavailable') {
        throw new Error(result.message || 'The live analysis could not be completed.');
      }
      onNext({
        agencyName: localData.agencyName.trim(),
        websiteUrl: localData.websiteUrl.trim(),
        businessLocation,
        originalPrompt,
        analysisPrompt,
        aiRecommendationPrompt: originalPrompt,
        selectedScenarios: [originalPrompt],
        liveAnalysis: result,
      });
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'The live analysis could not be completed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Step 01 / Agency profile</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Start with the essentials.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Give the analysis enough context to understand your agency, market, and the recommendation question that matters most.</p>
        </div>
        <span className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">Takes about 2 minutes</span>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Agency Name" id="agencyName" error={errors.agencyName}>
            <input id="agencyName" type="text" placeholder="e.g., District UAE" value={localData.agencyName} onChange={(event) => updateField('agencyName', event.target.value)} className={inputClass} />
          </Field>

          <Field label="Business Location" id="businessLocation" error={errors.businessLocation} hint="City, region, country, or service area.">
            <input id="businessLocation" type="text" placeholder="e.g., Dubai, UAE" value={localData.businessLocation} onChange={(event) => updateField('businessLocation', event.target.value)} className={inputClass} />
          </Field>
          </div>

          <Field label="Website URL" id="websiteUrl" error={errors.websiteUrl} hint="We&apos;ll analyze publicly available information from your website.">
            <input id="websiteUrl" type="url" placeholder="https://yourwebsite.com" value={localData.websiteUrl} onChange={(event) => updateField('websiteUrl', event.target.value)} className={inputClass} />
          </Field>

          <Field label="AI Recommendation Prompt" id="originalPrompt" error={errors.originalPrompt} hint="Write the question a potential customer might ask an AI assistant.">
            <textarea id="originalPrompt" rows={5} placeholder={DEFAULT_PROMPT} value={localData.originalPrompt} onChange={(event) => updateField('originalPrompt', event.target.value)} className={`${inputClass} resize-y`} />
          </Field>

          {analysisError && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">{analysisError}</p>}

          <button type="submit" disabled={isAnalyzing} className="w-full rounded-lg bg-primary px-4 py-3.5 font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[.99] disabled:cursor-wait disabled:opacity-60">
            {isAnalyzing ? 'Analyzing website and AI recommendations…' : 'Analyze AI Recommendations →'}
          </button>
        </div>

        <aside className="rounded-xl border border-border bg-background p-5 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Your inputs</p>
          <div className="mt-5 space-y-5">
            <InfoItem label="Public website" value="Used to ground the analysis in evidence." />
            <InfoItem label="Business location" value="Used to add market context to the AI prompt." />
            <InfoItem label="Recommendation question" value="Passed through unchanged before analysis." />
          </div>
          <div className="mt-6 border-t border-border pt-5"><p className="text-xs leading-5 text-muted-foreground">Your original prompt is preserved exactly. A separate analysis prompt adds location context only when needed.</p></div>
        </aside>
      </form>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return <div><p className="text-sm font-medium text-foreground">{label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{value}</p></div>;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const inputClass = 'w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary';

function Field({ label, id, hint, error, children }: { label: string; id: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">{label} *</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
