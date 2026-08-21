'use client';

import { useState } from 'react';
import WizardContainer from '@/components/wizard/wizard-container';
import Step1AgencyInfo from '@/components/wizard/step-1-agency-info';
import Step2WebsitePreview from '@/components/wizard/step-2-website-preview';
import Step3Results from '@/components/wizard/step-3-results';

export interface AgencyProfile {
  markets: string[];
  propertyTypes: string[];
  services: string[];
  audiences: string[];
  specializations: string[];
  commercialThemes: string[];
  summary: string;
}

export interface PromptOption {
  id: string;
  prompt: string;
  commercialReason: string;
  evidence: string;
  confidence: 'high' | 'medium' | 'low' | string;
}

export interface Phase1AnalysisResponse {
  status: string;
  agency?: { name: string; website: string };
  agencyProfile?: AgencyProfile;
  promptOptions?: PromptOption[];
  message?: string;
}

export type Phase2AnalysisResult = Record<string, unknown>;

export interface WizardFormData {
  agencyName: string;
  websiteUrl: string;
  originalPrompt: string;
  analysisPrompt: string;
  aiRecommendationPrompt: string;
  selectedScenarios: string[];
  agencyProfile: AgencyProfile | null;
  promptOptions: PromptOption[];
  selectedPrompt: PromptOption | null;
  phase1Analysis: Phase1AnalysisResponse | null;
  phase2Result: Phase2AnalysisResult | null;
  isRunningPhase2: boolean;
  phase2Error: string | null;
  liveAnalysis?: {
    status: string;
    input?: Record<string, unknown>;
    responses?: Array<{ model: string; rawAnswer: string }>;
    errors?: Array<{ model: string; message: string }>;
    message?: string;
    n8nResponse?: {
      Model: string;
      'Agency Name': string;
      Website: string;
      Location: string;
      Prompt: string;
      Answer: string;
      'Mentioned?': boolean;
      Reason: string;
    };
  };
  phase3Response?: unknown;
}

const initialFormData: WizardFormData = {
  agencyName: '',
  websiteUrl: '',
  originalPrompt: '',
  agencyProfile: null,
  promptOptions: [],
  selectedPrompt: null,
  phase1Analysis: null,
  phase2Result: null,
  isRunningPhase2: false,
  phase2Error: null,
  analysisPrompt: '',
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
