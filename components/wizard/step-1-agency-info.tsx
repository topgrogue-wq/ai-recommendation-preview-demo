'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const AI_SEARCH_SCENARIOS = [
  'Best luxury real estate agencies in Austin',
  'Best realtor for first-time buyers',
  'Best waterfront property agency',
  'Best investment property agency',
  'Best real estate agent near me',
];

interface Step1Props {
  formData: {
    agencyName: string;
    websiteUrl: string;
    selectedScenarios: string[];
  };
  onNext: (data: any) => void;
}

export default function Step1AgencyInfo({ formData, onNext }: Step1Props) {
  const [localData, setLocalData] = useState({
    agencyName: formData.agencyName || '',
    websiteUrl: formData.websiteUrl || '',
    selectedScenarios: formData.selectedScenarios || AI_SEARCH_SCENARIOS,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!localData.agencyName.trim()) {
      newErrors.agencyName = 'Agency name is required';
    }
    if (!localData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'Website URL is required';
    } else if (!/^https?:\/\/.+/.test(localData.websiteUrl)) {
      newErrors.websiteUrl = 'Please enter a valid URL (e.g., https://example.com)';
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length === 0) {
      onNext(localData);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
          Step 1: Analyze Your Website
        </h2>
        <p className="text-muted-foreground">
          Enter your website and choose the AI search scenarios you&apos;d like to evaluate.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Agency Name */}
        <div>
          <label htmlFor="agencyName" className="block text-sm font-medium text-foreground mb-2">
            Agency Name *
          </label>
          <input
            id="agencyName"
            type="text"
            placeholder="e.g., Prestige Luxury Homes Austin"
            value={localData.agencyName}
            onChange={(e) => {
              setLocalData({ ...localData, agencyName: e.target.value });
              if (errors.agencyName) setErrors({ ...errors, agencyName: '' });
            }}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
          {errors.agencyName && (
            <p className="text-destructive text-sm mt-1">{errors.agencyName}</p>
          )}
        </div>

        {/* Website URL */}
        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-foreground mb-2">
            Website URL *
          </label>
          <input
            id="websiteUrl"
            type="text"
            placeholder="https://yourwebsite.com"
            value={localData.websiteUrl}
            onChange={(e) => {
              setLocalData({ ...localData, websiteUrl: e.target.value });
              if (errors.websiteUrl) setErrors({ ...errors, websiteUrl: '' });
            }}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            We&apos;ll analyze publicly available information from your website to identify one AI visibility opportunity.
          </p>
          {errors.websiteUrl && (
            <p className="text-destructive text-sm mt-1">{errors.websiteUrl}</p>
          )}
        </div>

        {/* Questions We'll Ask AI */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Questions We&apos;ll Ask AI
          </label>
          <div className="space-y-2">
            {AI_SEARCH_SCENARIOS.map((scenario, idx) => (
              <label key={idx} className="flex items-center gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-muted/30 transition">
                <input
                  type="checkbox"
                  checked={localData.selectedScenarios.includes(scenario)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setLocalData({
                        ...localData,
                        selectedScenarios: [...localData.selectedScenarios, scenario],
                      });
                    } else {
                      setLocalData({
                        ...localData,
                        selectedScenarios: localData.selectedScenarios.filter((s) => s !== scenario),
                      });
                    }
                  }}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-foreground">{scenario}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition active:scale-95"
          >
            Analyze AI Visibility →
          </button>
        </div>
      </form>
    </div>
  );
}
