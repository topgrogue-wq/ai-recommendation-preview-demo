// Mock Austin luxury real estate agencies and analysis scenarios
const austinAgencies = [
  'Prestige Luxury Homes Austin',
  'Hill Country Properties',
  'Lakeside Realty Group',
  'Downtown Austin Luxury',
  'Zilker Park Estates',
  'West Lake Hills Properties',
  'Barton Creek Luxury Homes',
  'South Congress Real Estate',
];

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

export function getMockAnalysisResults(agencyName: string): AnalysisResult {
  // Hash the agency name to determine which scenario to show
  const hash = agencyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const scenario = hash % 3;

  if (scenario === 0) {
    return getOpportunityFoundResult(agencyName);
  } else if (scenario === 1) {
    return getNoOpportunityResult(agencyName);
  } else {
    return getAnalysisFailedResult(agencyName);
  }
}

function getOpportunityFoundResult(agencyName: string): AnalysisResult {
  return {
    status: 'opportunity_found',
    title: '✨ High-Value Opportunity Detected',
    description: `Our AI identified a significant friction point on ${agencyName}'s website that's likely impacting lead conversion.`,
    friction:
      'The hero section lacks property showcase and clear call-to-action buttons. Visitors cannot quickly browse listings or schedule consultations, resulting in immediate bounce.',
    improvement:
      'Add a featured properties carousel with 3-5 showcase listings including price, beds/baths, and neighborhood. Include prominent "View All Listings" and "Schedule Tour" buttons above the fold.',
    direction:
      'By implementing this improvement, you can expect 25-40% increase in lead capture rate and improved Google ranking for local real estate searches.',
    stats: [
      { value: '32%', label: 'Est. Conversion Lift' },
      { value: '2.4s', label: 'Avg. Time to Action' },
      { value: 'High', label: 'Priority' },
    ],
    nextSteps: [
      'Review the improved version to see the recommended layout changes',
      'Consider adding property filters and search functionality',
      'Test with your marketing team before implementing',
      'Monitor conversion metrics after implementation',
    ],
  };
}

function getNoOpportunityResult(agencyName: string): AnalysisResult {
  return {
    status: 'no_opportunity',
    title: 'No Critical Opportunities Found',
    description: `${agencyName}'s website is performing well with clear CTAs and good user flow.`,
    friction:
      'The website layout effectively guides visitors through the property discovery process with minimal friction.',
    improvement:
      'While no critical improvements are needed, consider adding AI-powered property recommendations and live chat support to further enhance user experience.',
    direction:
      'Your website is already optimized for conversions. Focus on continuous A/B testing and monitoring user behavior to maintain competitive advantage.',
    stats: [
      { value: 'Good', label: 'Overall Health' },
      { value: '4.2s', label: 'Avg. Time to CTA' },
      { value: 'Low', label: 'Priority' },
    ],
    nextSteps: [
      'Continue monitoring analytics and user behavior',
      'Consider advanced features like AI recommendations',
      'Regular content updates and property listings refresh',
    ],
  };
}

function getAnalysisFailedResult(agencyName: string): AnalysisResult {
  return {
    status: 'analysis_failed',
    title: 'Unable to Complete Analysis',
    description: `Our AI encountered issues analyzing ${agencyName}'s website. This could be due to technical limitations or site structure.`,
    friction:
      'The website may have access restrictions, dynamic content loading, or unusual structure that prevents standard analysis.',
    improvement:
      'Verify that your website is publicly accessible and try submitting a different page URL. Ensure your website doesn\'t have robots.txt restrictions that block automated analysis.',
    direction:
      'Once you\'ve verified website accessibility, submit your URL again for a comprehensive analysis.',
    stats: [
      { value: 'Error', label: 'Status' },
      { value: '--', label: 'Details' },
      { value: 'Medium', label: 'Priority' },
    ],
    nextSteps: [
      'Check that the website URL is publicly accessible',
      'Verify robots.txt doesn\'t block crawlers',
      'Try a different page URL from your site',
      'Contact support if issues persist',
    ],
  };
}

export const mockAustinNeighborhoods = [
  'West Lake Hills',
  'Barton Creek',
  'South Congress',
  'Zilker Park Area',
  'Downtown Austin',
  'Lake Travis Area',
  'Hill Country',
];

export const mockPriceRanges = ['Under $1M', '$1M - $2M', '$2M - $3M', '$3M+'];
