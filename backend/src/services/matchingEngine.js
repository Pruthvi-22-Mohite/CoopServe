/**
 * CoopServe Smart Provider Matching Engine
 * Multi-factor rule-based scoring algorithm with cooperative fair workload balancing.
 * 
 * Modular architecture: structured for drop-in replacement/proxy to Python FastAPI + Scikit-Learn.
 */

// Weight distribution (Sums to 1.0 / 100%)
export const MATCHING_WEIGHTS = {
  SKILL: 0.30,        // 30% - Trade expertise & exact skill alignment
  DISTANCE: 0.15,     // 15% - Proximity to customer location
  AVAILABILITY: 0.15, // 15% - Real-time slot availability
  RATING: 0.15,       // 15% - Customer rating performance
  WORKLOAD: 0.10,     // 10% - Cooperative fair workload balancing
  TRUST_SCORE: 0.10,  // 10% - Platform trust & dispute-free history
  EXPERIENCE: 0.05    // 5%  - Years in trade
};

/**
 * Calculates Skill Match Score (0 - 100)
 */
export const calculateSkillScore = (provider, categoryId, serviceTitle = '') => {
  if (!categoryId) return 70;
  
  const hasExactCategory = provider.categories?.includes(categoryId.toLowerCase());
  const skillText = (provider.skill || '').toLowerCase();
  const searchCat = categoryId.toLowerCase();

  if (hasExactCategory || skillText.includes(searchCat)) {
    return 100;
  }

  // Related category matches
  if (
    (searchCat === 'plumbing' && (skillText.includes('pipe') || skillText.includes('plumb'))) ||
    (searchCat === 'electrical' && (skillText.includes('wiring') || skillText.includes('electric'))) ||
    (searchCat === 'cleaning' && skillText.includes('sanitization')) ||
    (searchCat === 'appliance' && (skillText.includes('ac') || skillText.includes('technician')))
  ) {
    return 90;
  }

  return 20;
};

/**
 * Calculates Proximity Score (0 - 100) based on distance in km
 */
export const calculateDistanceScore = (distanceKm = null, maxAcceptableKm = 10.0) => {
  if (!Number.isFinite(Number(distanceKm))) return 0;
  if (distanceKm <= 1.0) return 100;
  if (distanceKm <= 2.5) return 92;
  if (distanceKm <= 5.0) return 80;
  if (distanceKm <= 7.5) return 65;
  if (distanceKm <= maxAcceptableKm) return 50;
  return Math.max(10, Math.round(100 - (distanceKm / maxAcceptableKm) * 80));
};

/**
 * Calculates Availability Score (0 - 100)
 */
export const calculateAvailabilityScore = (provider, urgency = 'today') => {
  if (!isProviderEligible(provider)) return 0;

  if (provider.availabilityStatus === 'Available Today') {
    return 100;
  }
  if (provider.availabilityStatus === 'Available Tomorrow') {
    return urgency === 'today' ? 65 : 95;
  }
  return 50;
};

export const isProviderEligible = (provider, customerLocation = '') => {
  if (!provider || provider.status === 'Suspended' || provider.isAvailable === false || provider.availabilityStatus === 'Off Duty') {
    return false;
  }

  const requestedLocation = String(customerLocation || '').trim().toLowerCase();
  if (!requestedLocation || !provider.serviceAreas?.length) return true;

  const providerCoverage = provider.serviceAreas.map((area) => String(area).toLowerCase());
  return providerCoverage.some((area) => requestedLocation.includes(area) || area.includes(requestedLocation));
};

/**
 * Calculates Rating Score (0 - 100)
 */
export const calculateRatingScore = (rating = 4.5) => {
  return Math.min(100, Math.round((rating / 5.0) * 100));
};

/**
 * Calculates Cooperative Fair Workload Score (0 - 100)
 * Evaluates recent job queue to prevent starvation and prevent top star burnout.
 */
export const calculateWorkloadFairnessScore = (provider) => {
  // Weekly job load simulation from jobsCompleted or simulated weekly count
  const weeklyJobs = provider.weeklyJobsCount !== undefined 
    ? provider.weeklyJobsCount 
    : Math.max(4, Math.round((provider.jobsCompleted || 50) % 22));

  // Providers with fewer jobs this week (e.g. 4-8 jobs) get 95-100% fairness score
  // Providers with high workload (e.g. 18-25 jobs) get 50-65% fairness score
  if (weeklyJobs <= 6) return 98;
  if (weeklyJobs <= 10) return 90;
  if (weeklyJobs <= 15) return 78;
  if (weeklyJobs <= 20) return 62;
  return 45;
};

/**
 * Generates clear, human-readable explanatory reasons for why the provider was recommended
 */
export const generateMatchReasons = (provider, breakdown, categoryId) => {
  const reasons = [];

  // Skill reason
  if (breakdown.skillScore >= 90) {
    reasons.push(`✓ Required skill match in ${provider.skill}`);
  }

  // Availability reason
  if (breakdown.availabilityScore >= 90) {
    reasons.push('✓ Available for instant dispatch today');
  } else if (breakdown.availabilityScore >= 65) {
    reasons.push('✓ Next day slot open');
  }

  // Distance reason
  if (provider.distanceKm) {
    reasons.push(`✓ Proximity: ${provider.distanceKm} km away (${provider.location})`);
  }

  // Rating & experience reason
  if (provider.rating >= 4.8) {
    reasons.push(`✓ High satisfaction: ${provider.rating} ⭐ rating (${provider.reviewsCount || 50}+ reviews)`);
  }

  if (provider.experienceYears >= 5) {
    reasons.push(`✓ Experienced professional (${provider.experienceYears}+ years in trade)`);
  }

  // Cooperative fairness reason
  if (breakdown.workloadFairnessScore >= 80) {
    reasons.push('✓ Fair Workload Match: Balanced allocation priority this week');
  }

  // Trust score reason
  if (provider.trustScore >= 90) {
    reasons.push(`✓ Verified Trust Score: ${provider.trustScore}/100 (Dispute-free record)`);
  }

  return reasons;
};

/**
 * Main Smart Matching Function
 * Ranks all candidate providers for a given service request.
 */
export const matchProviders = (providers, criteria = {}) => {
  const {
    categoryId = 'all',
    serviceTitle = '',
    customerLocation = '',
    urgency = 'today',
    maxPrice,
    minRating
  } = criteria;

  let candidates = providers.filter((provider) => isProviderEligible(provider, customerLocation));

  if (categoryId && categoryId !== 'all') {
    candidates = candidates.filter((provider) => calculateSkillScore(provider, categoryId, serviceTitle) >= 90);
  }

  // Optional pre-filters
  if (maxPrice) {
    candidates = candidates.filter(p => p.startingPrice <= parseFloat(maxPrice));
  }
  if (minRating) {
    candidates = candidates.filter(p => p.rating >= parseFloat(minRating));
  }

  const scoredProviders = candidates.map((provider) => {
    const skillScore = calculateSkillScore(provider, categoryId, serviceTitle);
    const distanceScore = calculateDistanceScore(provider.distanceKm);
    const availabilityScore = calculateAvailabilityScore(provider, urgency);
    const ratingScore = calculateRatingScore(provider.rating || 0);
    const experienceScore = Math.min(100, (provider.experienceYears || 3) * 10);
    const workloadFairnessScore = calculateWorkloadFairnessScore(provider);
    const trustScore = provider.trustScore || 85;

    // Weighted composite match score
    const compositeScore =
      skillScore * MATCHING_WEIGHTS.SKILL +
      distanceScore * MATCHING_WEIGHTS.DISTANCE +
      availabilityScore * MATCHING_WEIGHTS.AVAILABILITY +
      ratingScore * MATCHING_WEIGHTS.RATING +
      workloadFairnessScore * MATCHING_WEIGHTS.WORKLOAD +
      trustScore * MATCHING_WEIGHTS.TRUST_SCORE +
      experienceScore * MATCHING_WEIGHTS.EXPERIENCE;

    const normalizedMatchScore = Math.min(99, Math.max(60, Math.round(compositeScore)));

    const scoreBreakdown = {
      skillScore: Math.round(skillScore),
      distanceScore: Math.round(distanceScore),
      availabilityScore: Math.round(availabilityScore),
      ratingScore: Math.round(ratingScore),
      experienceScore: Math.round(experienceScore),
      workloadFairnessScore: Math.round(workloadFairnessScore),
      trustScore: Math.round(trustScore)
    };

    const reasons = generateMatchReasons(provider, scoreBreakdown, categoryId);

    return {
      ...provider,
      matchScore: normalizedMatchScore,
      scoreBreakdown,
      reasons,
      isTopMatch: false
    };
  });

  // Sort descending by match score
  scoredProviders.sort((a, b) => b.matchScore - a.matchScore);

  if (scoredProviders.length > 0) {
    scoredProviders[0].isTopMatch = true;
  }

  return {
    success: true,
    totalCandidates: candidates.length,
    matchedCount: scoredProviders.length,
    topMatch: scoredProviders[0] || null,
    rankedProviders: scoredProviders,
    matchingWeights: MATCHING_WEIGHTS,
    algorithm: 'CoopServe Multi-Factor Fair Workload Engine v1.0'
  };
};
