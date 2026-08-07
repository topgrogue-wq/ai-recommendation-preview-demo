'use client';

import { useState } from 'react';
import { Check, ChevronLeft, X } from 'lucide-react';
import BrowserPreview from '@/components/wizard/browser-preview';

interface Step2Props {
  formData: {
    agencyName: string;
    websiteUrl: string;
    selectedScenarios: string[];
  };
  onNext: (data: any) => void;
  onBack: () => void;
}

const recommendedAgencies = ['Austin Premier Homes', 'Barton Luxury Group', 'Lake Austin Realty'];

export default function Step2WebsitePreview({ formData, onNext, onBack }: Step2Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const prompt = formData.selectedScenarios?.[0] || 'Best realtor for first-time buyers in Austin';
  const agencyName = formData.agencyName || 'Your agency';

  const handleContinue = async () => {
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsAnalyzing(false);
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="mb-2 font-serif text-2xl font-bold text-foreground">Step 2: One Friction</h2>
        <p className="max-w-2xl leading-6 text-muted-foreground">
          We reviewed the page AI is most likely to reference and identified one visible friction that could reduce recommendation confidence.
        </p>
      </div>

      <section className="rounded-lg border border-primary/40 bg-primary/[0.04] p-5" aria-labelledby="ai-summary-title">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 id="ai-summary-title" className="text-sm font-semibold text-foreground">AI Recommendation Summary</h3>
          <span className="text-xs text-primary">AI response</span>
        </div>
        <dl className="divide-y divide-primary/10">
          <div className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[8rem_1fr] sm:gap-5">
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Prompt</dt>
            <dd className="text-sm leading-6 text-foreground">{prompt}</dd>
          </div>
          <div className="grid gap-2 py-3 sm:grid-cols-[8rem_1fr] sm:gap-5">
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Recommended</dt>
            <dd className="space-y-1 text-sm leading-6 text-foreground">
              {recommendedAgencies.map((agency) => (
                <div key={agency} className="flex items-center gap-2"><Check size={15} className="text-primary" aria-hidden="true" />{agency}</div>
              ))}
            </dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-5">
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Your Agency</dt>
            <dd className="flex items-center gap-2 text-sm text-foreground"><X size={15} className="text-muted-foreground" aria-hidden="true" />{agencyName}</dd>
          </div>
          <div className="grid gap-1 pt-3 sm:grid-cols-[8rem_1fr] sm:gap-5">
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Reason</dt>
            <dd className="text-sm leading-6 text-muted-foreground">Your agency wasn&apos;t recommended because the homepage doesn&apos;t clearly establish local authority before asking visitors to contact the team.</dd>
          </div>
        </dl>
      </section>

      <BrowserPreview agencyName={formData.agencyName} websiteUrl={formData.websiteUrl} />

      <section className="rounded-lg border border-border bg-card p-6" aria-labelledby="friction-title">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Diagnosis</p>
        <h3 id="friction-title" className="mb-5 text-lg font-semibold text-foreground">One Friction</h3>
        <div className="space-y-5">
          <div>
            <h4 className="mb-1 text-sm font-medium text-foreground">Problem</h4>
            <p className="text-sm leading-6 text-muted-foreground">The homepage doesn&apos;t clearly establish local authority before asking visitors to contact the agency.</p>
          </div>
          <div>
            <h4 className="mb-1 text-sm font-medium text-foreground">Why it matters</h4>
            <p className="text-sm leading-6 text-muted-foreground">When buyers and AI systems can&apos;t quickly identify why this agency is the trusted local choice, they are more likely to recommend or choose another business with clearer signals.</p>
          </div>
          <div>
            <h4 className="mb-1 text-sm font-medium text-foreground">Opportunity</h4>
            <p className="text-sm leading-6 text-muted-foreground">Adding stronger local authority signals near the primary CTA makes it easier for both buyers and AI systems to understand why this agency should be recommended.</p>
          </div>
        </div>
      </section>

      <div className="flex gap-3 pt-4">
        <button onClick={onBack} className="flex items-center gap-2 rounded-md bg-secondary px-4 py-3 font-medium text-secondary-foreground transition hover:bg-secondary/90">
          <ChevronLeft size={18} />
          Back
        </button>
        <button onClick={handleContinue} disabled={isAnalyzing} className="flex-1 rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
          {isAnalyzing ? 'Preparing improvement...' : 'Continue to Improvement →'}
        </button>
      </div>
    </div>
  );
}
