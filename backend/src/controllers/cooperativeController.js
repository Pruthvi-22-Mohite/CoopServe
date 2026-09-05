import { inMemoryStore } from '../store/inMemoryStore.js';
import { calculateWorkloadFairnessScore } from '../services/matchingEngine.js';

export const getCooperativeOverview = async (req, res) => {
  try {
    const completedBookings = inMemoryStore.bookings.filter(b => b.status === 'COMPLETED');

    const liveWorkerEarnings = completedBookings.reduce(
      (sum, b) => sum + (b.pricing?.workerEarnings || 450),
      0
    );

    const baseJobs = inMemoryStore.cooperative.totalJobsCompleted || 1240;
    const currentTotalJobs = baseJobs + completedBookings.length;

    const baseEarnings = 558000;
    const currentTotalEarnings = baseEarnings + liveWorkerEarnings;

    // Build Workload Distribution across providers
    const workloadDistribution = inMemoryStore.providers.map((prov) => {
      const provBookings = inMemoryStore.bookings.filter(b => b.providerId === prov.id);
      const activeCount = provBookings.filter(b => ['BOOKED', 'PROVIDER_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)).length;
      const completedCount = provBookings.filter(b => b.status === 'COMPLETED').length;

      // Simulated weekly baseline + live activity
      const simulatedWeeklyBase = prov.weeklyJobsCount !== undefined ? prov.weeklyJobsCount : ((prov.jobsCompleted || 10) % 15) + 4;
      const totalWeeklyJobs = simulatedWeeklyBase + activeCount;
      const fairnessScore = calculateWorkloadFairnessScore({ ...prov, weeklyJobsCount: totalWeeklyJobs });

      let fairnessTier = 'Balanced Queue';
      if (totalWeeklyJobs <= 7) {
        fairnessTier = 'Priority Boost (Low Queue)';
      } else if (totalWeeklyJobs >= 16) {
        fairnessTier = 'Heavy Queue (Load Balanced)';
      }

      return {
        id: prov.id,
        name: prov.name,
        skill: prov.skill,
        avatar: prov.avatar,
        location: prov.location,
        jobsThisWeek: totalWeeklyJobs,
        activeJobsCount: activeCount,
        completedLifetime: (prov.jobsCompleted || 0) + completedCount,
        trustScore: prov.trustScore || 94,
        fairnessScore,
        fairnessTier,
        isAvailable: prov.isAvailable ?? true
      };
    });

    return res.status(200).json({
      success: true,
      cooperative: {
        name: inMemoryStore.cooperative.name,
        totalMembers: inMemoryStore.cooperative.totalMembers || 128,
        totalCompletedJobs: currentTotalJobs,
        totalWorkerEarnings: currentTotalEarnings,
        trainingProgramsCount: 8,
        communityInitiativesCount: 12,
        fairWorkloadScore: '87%',
        averageTrustScore: inMemoryStore.cooperative.averageTrustScore || 94.2,
        fairWorkloadDistributionIndex: inMemoryStore.cooperative.fairWorkloadDistributionIndex || '87%',
        workloadDistribution,
        benefitsList: [
          { title: 'Verified Work History', desc: 'Every job creates portable, verified career credentials on-platform.' },
          { title: 'CoopServe Trust Score', desc: 'Dispute-free service history increases algorithm matching priority.' },
          { title: 'Fair Job Allocation', desc: 'Balanced workload distribution prevents worker fatigue and gig starvation.' },
          { title: '90% Direct Payouts', desc: 'Transparent 90% direct earnings with automatic weekly bank settlement.' },
          { title: 'Training Opportunities', desc: 'Vocational upskilling in solar, HVAC, EV charging, and precision craft.' },
          { title: 'Democratic Governance', desc: '1 Member 1 Vote policy on cooperative initiatives and standards.' },
          { title: 'Peer Dispute Support', desc: 'Fair arbitration by peer cooperative council rather than arbitrary bans.' }
        ],
        trainingPrograms: [
          { id: 'tr_1', title: 'Solar PV Rooftop & Micro-Inverter Wiring', duration: '2 Weeks (Weekend)', stipend: 'Certified Badge', seatsLeft: 4, date: '12 Sep 2026' },
          { id: 'tr_2', title: 'Inverter AC Diagnostics & Variable Refrigerant PCB Fix', duration: '10 Days', stipend: 'Certified Badge', seatsLeft: 6, date: '18 Sep 2026' },
          { id: 'tr_3', title: 'Modular Kitchen Hardware & Soft-Close Fitting', duration: '1 Week', stipend: 'Master Craftsman Tag', seatsLeft: 8, date: '25 Sep 2026' },
          { id: 'tr_4', title: 'EV Home Charging Point Certification (Level 2 AC)', duration: '2 Weeks', stipend: 'Certified Badge', seatsLeft: 5, date: '02 Oct 2026' }
        ],
        communityInitiatives: [
          { id: 'init_1', title: 'Cooperative Standards & Certification Ballot', status: 'Voting Open', desc: 'Members vote on adopting new precision tool and green service standards.' },
          { id: 'init_2', title: 'Monsoon Tool Emergency Replacement Support', status: 'Active', desc: 'Peer tool sharing and equipment assistance for rainy season dispatches.' },
          { id: 'init_3', title: 'Pune Gig Workers Skill & Wellness Day', status: 'Upcoming (15 Sep)', desc: 'Free annual ergonomic health checkup and masterclass workshop in Kothrud.' }
        ]
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
