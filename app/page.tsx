'use client';

import { useState } from 'react';
import WizardContainer from '@/components/wizard/wizard-container';
import Step1AgencyInfo from '@/components/wizard/step-1-agency-info';
import Step2WebsitePreview from '@/components/wizard/step-2-website-preview';
import Step3Results from '@/components/wizard/step-3-results';

export interface WizardFormData {
  agencyName: string;
  websiteUrl: string;
  businessLocation: string;
  aiRecommendationPrompt: string;
  selectedScenarios: string[];
}

const initialFormData: WizardFormData = {
  agencyName: '',
  websiteUrl: '',
  businessLocation: '',
  aiRecommendationPrompt: '',
  selectedScenarios: [],
};

export default function Page() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(initialFormData);

  const handleNext = (data: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    if (currentStep < 3) {
      setCurrentStep((step) => step + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
  };

  return (
    <main className="min-h-screen bg-background">
      <WizardContainer>
        {currentStep === 1 && <Step1AgencyInfo formData={formData} onNext={handleNext} />}
        {currentStep === 2 && (
          <Step2WebsitePreview formData={formData} onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 3 && (
          <Step3Results formData={formData} onBack={handleBack} onReset={handleReset} />
        )}
      </WizardContainer>
    </main>
  );
}
