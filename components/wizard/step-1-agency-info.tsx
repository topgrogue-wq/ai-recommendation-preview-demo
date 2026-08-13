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
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="mb-2 font-serif text-2xl font-bold text-foreground">Step 1: Analyze Your Website</h2>
        <p className="text-muted-foreground">
          Tell us about your business and the exact recommendation question you want AI platforms to answer.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Agency Name" id="agencyName" error={errors.agencyName}>
          <input id="agencyName" type="text" placeholder="e.g., District UAE" value={localData.agencyName} onChange={(event) => updateField('agencyName', event.target.value)} className={inputClass} />
        </Field>

        <Field label="Website URL" id="websiteUrl" error={errors.websiteUrl} hint="We&apos;ll analyze publicly available information from your website.">
          <input id="websiteUrl" type="url" placeholder="https://yourwebsite.com" value={localData.websiteUrl} onChange={(event) => updateField('websiteUrl', event.target.value)} className={inputClass} />
        </Field>

        <Field label="Business Location" id="businessLocation" error={errors.businessLocation} hint="Use the city, region, country, or service area you want AI to associate with your business.">
          <input id="businessLocation" type="text" placeholder="e.g., Dubai, UAE" value={localData.businessLocation} onChange={(event) => updateField('businessLocation', event.target.value)} className={inputClass} />
        </Field>

        <Field label="AI Recommendation Prompt" id="originalPrompt" error={errors.originalPrompt} hint="Write the question a potential customer might ask an AI assistant.">
          <textarea id="originalPrompt" rows={3} placeholder={DEFAULT_PROMPT} value={localData.originalPrompt} onChange={(event) => updateField('originalPrompt', event.target.value)} className={`${inputClass} resize-y`} />
        </Field>

        {analysisError && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">{analysisError}</p>}

        <div className="pt-4">
          <button type="submit" disabled={isAnalyzing} className="w-full rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:bg-primary/90 active:scale-95 disabled:cursor-wait disabled:opacity-60">
            {isAnalyzing ? 'Analyzing website and AI recommendations…' : 'Analyze AI Recommendations →'}
          </button>
        </div>
      </form>
    </div>
  );
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
