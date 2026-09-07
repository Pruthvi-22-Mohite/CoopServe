/**
 * CoopServe AI Predictive Insights & Demand Allocation Engine
 * Rule-based insights derived from live provider and booking records.
 */

const CATEGORY_LABELS = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  cleaning: 'Cleaning',
  appliance: 'Appliance Repair',
  carpentry: 'Carpentry',
  gardening: 'Gardening',
  painting: 'Painting',
  community: 'Community Care',
  general: 'General'
};

const demandLevel = (count, available) => {
  if (count === 0) return 'Low';
  if (available === 0 && count > 0) return 'High';
  const ratio = count / Math.max(available, 1);
  if (ratio >= 3) return 'High';
  if (ratio >= 1.5) return 'Medium';
  return 'Low';
};

export const generateAIDemandInsights = (providers = [], bookings = []) => {
  const categoryIds = Object.keys(CATEGORY_LABELS);
  const bookingByCategory = {};
  bookings.forEach((b) => {
    const cat = (b.category || 'general').toLowerCase();
    bookingByCategory[cat] = (bookingByCategory[cat] || 0) + 1;
  });

  const providerByCategory = {};
  providers.forEach((p) => {
    const cats = (p.categories && p.categories.length ? p.categories : [p.skill])
      .map((c) => String(c || '').toLowerCase());
    const matched = categoryIds.filter((id) =>
      cats.some((c) => c.includes(id) || String(p.skill || '').toLowerCase().includes(id))
    );
    const keys = matched.length ? matched : ['general'];
    keys.forEach((id) => {
      providerByCategory[id] = (providerByCategory[id] || 0) + (p.isAvailable === false ? 0 : 1);
    });
  });

  const serviceDemand = categoryIds.map((id) => {
    const count = bookingByCategory[id] || 0;
    const availableProviders = providerByCategory[id] || 0;
    const requiredProviders = Math.max(availableProviders, count > 0 ? Math.ceil(count / 4) : 0);
    const shortage = Math.max(0, requiredProviders - availableProviders);
    const level = demandLevel(count, availableProviders);
    const growthRate = bookings.length > 0
      ? `${Math.round((count / bookings.length) * 100)}%`
      : '0%';

    return {
      category: CATEGORY_LABELS[id],
      level,
      growthRate,
      demandIndex: bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0,
      availableProviders,
      requiredProviders,
      shortage,
      peakHours: '—',
      predictionText: `${count} live bookings in ${CATEGORY_LABELS[id]} with ${availableProviders} on-duty providers.`,
      recommendation: shortage > 0
        ? `${shortage} additional ${CATEGORY_LABELS[id]} provider(s) would cover current demand.`
        : 'Current capacity matches recorded demand.'
    };
  }).filter((row) => row.demandIndex > 0 || row.availableProviders > 0);

  const hourBuckets = {};
  for (let h = 7; h <= 20; h += 1) {
    const label = `${String(h).padStart(2, '0')}:00`;
    hourBuckets[h] = { hour: label, demand: 0, capacity: providers.filter((p) => p.isAvailable !== false).length };
  }
  bookings.forEach((b) => {
    const d = new Date(b.createdAt);
    if (Number.isNaN(d.getTime())) return;
    const h = d.getHours();
    if (hourBuckets[h]) hourBuckets[h].demand += 1;
  });
  const hourlyPeakTrend = Object.values(hourBuckets);

  const weeklyForecast = [];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(now.getDate() - i);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const count = bookings.filter((b) => {
      const created = new Date(b.createdAt);
      return created >= day && created < next;
    }).length;
    weeklyForecast.push({
      day: day.toLocaleDateString('en-GB', { weekday: 'short' }),
      bookings: count,
      predicted: count
    });
  }

  const localityMap = {};
  bookings.forEach((b) => {
    const loc = b.serviceArea || b.serviceCity || 'Unspecified';
    if (!localityMap[loc]) localityMap[loc] = { locality: loc, demandScore: 0, activePros: 0, status: 'Optimal' };
    localityMap[loc].demandScore += 1;
  });
  providers.forEach((p) => {
    const loc = p.location || (p.serviceAreas && p.serviceAreas[0]) || 'Unspecified';
    if (!localityMap[loc]) localityMap[loc] = { locality: loc, demandScore: 0, activePros: 0, status: 'Optimal' };
    if (p.isAvailable !== false) localityMap[loc].activePros += 1;
  });
  const localityBalance = Object.values(localityMap).map((row) => {
    const status = row.demandScore > row.activePros * 4
      ? 'Shortage'
      : row.activePros > 0 && row.demandScore === 0
        ? 'Surplus Capacity'
        : 'Optimal';
    return { ...row, status };
  }).sort((a, b) => b.demandScore - a.demandScore).slice(0, 12);

  const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
  const matchingEfficiencyScore = bookings.length > 0
    ? `${Math.round((completed / bookings.length) * 100)}%`
    : '0%';

  const ecosystemFeedback = {
    matchingEfficiencyScore,
    averageResponseTimeMins: null,
    fairWorkloadBalanceIndex: providers.length > 0 ? `${Math.round((providers.filter((p) => p.isAvailable !== false).length / providers.length) * 100)}%` : '0%',
    surgePricingAvoidance: '100% Fixed Rates Maintained',
    architectureModel: 'Rule-Based Engine (live booking & provider counts)'
  };

  return {
    success: true,
    serviceDemand,
    hourlyPeakTrend,
    weeklyForecast,
    localityBalance,
    ecosystemFeedback,
    generatedAt: new Date().toISOString()
  };
};
