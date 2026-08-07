// Generic demo data for recommendation analysis
interface AnalysisResult {
  status: 'opportunity_found' | 'no_opportunity' | 'analysis_failed';
  title: string;
  description: string;
  friction?: string;
  improvement?: string;
  direction?: string;
  stats?: Array<{ value: string; label: string }>;
  nextSteps?: string[];
}

export function getMockAnalysisResults(agencyName: string, businessLocation = 'your local market'): AnalysisResult {
  const hash = agencyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const scenario = hash % 3;
  if (scenario === 0) return getOpportunityFoundResult(agencyName, businessLocation);
  if (scenario === 1) return getNoOpportunityResult(agencyName, businessLocation);
  return getAnalysisFailedResult(agencyName);
}

function getOpportunityFoundResult(agencyName: string, businessLocation: string): AnalysisResult {
  return { status: 'opportunity_found', title: 'High-Value Opportunity Detected', description: `Our AI identified a significant friction point on ${agencyName}'s website that's likely impacting lead conversion.`, friction: `The primary page doesn't clearly establish local authority in ${businessLocation} or give visitors a strong next step.`, improvement: `Add a location-specific authority statement for ${businessLocation} near the primary CTA, supported by clear service categories and proof points.`, direction: 'Making these signals explicit can improve recommendation confidence and help qualified visitors understand the business faster.', stats: [{ value: '32%', label: 'Est. Conversion Lift' }, { value: '2.4s', label: 'Avg. Time to Action' }, { value: 'High', label: 'Priority' }], nextSteps: ['Review the improved version to see the recommended layout changes', 'Add proof points that support your local expertise', 'Test the revised CTA with your marketing team', 'Monitor recommendation and conversion signals after implementation'] };
}

function getNoOpportunityResult(agencyName: string, businessLocation: string): AnalysisResult {
  return { status: 'no_opportunity', title: 'No Critical Opportunities Found', description: `${agencyName}'s website is performing well with clear CTAs and good user flow for ${businessLocation}.`, friction: 'The website layout effectively guides visitors through the discovery process with minimal friction.', improvement: 'While no critical improvements are needed, consider adding more specific recommendation signals and live support to further enhance user experience.', direction: 'Your website is already optimized for conversions. Focus on continuous testing and monitoring user behavior to maintain your advantage.', stats: [{ value: 'Good', label: 'Overall Health' }, { value: '4.2s', label: 'Avg. Time to CTA' }, { value: 'Low', label: 'Priority' }], nextSteps: ['Continue monitoring analytics and user behavior', 'Consider adding AI-readable expertise signals', 'Keep service and location content current'] };
}

function getAnalysisFailedResult(agencyName: string): AnalysisResult {
  return { status: 'analysis_failed', title: 'Unable to Complete Analysis', description: `Our AI encountered issues analyzing ${agencyName}'s website. This could be due to technical limitations or site structure.`, friction: 'The website may have access restrictions, dynamic content loading, or unusual structure that prevents standard analysis.', improvement: "Verify that your website is publicly accessible and try submitting a different page URL. Ensure your website doesn't have robots.txt restrictions that block automated analysis.", direction: 'Once you have verified website accessibility, submit your URL again for a comprehensive analysis.', stats: [{ value: 'Error', label: 'Status' }, { value: '--', label: 'Details' }, { value: 'Medium', label: 'Priority' }], nextSteps: ['Check that the website URL is publicly accessible', "Verify robots.txt doesn't block crawlers", 'Try a different page URL from your site', 'Contact support if issues persist'] };
}
