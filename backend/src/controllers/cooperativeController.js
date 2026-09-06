import { inMemoryStore } from '../store/inMemoryStore.js';
import { calculateWorkloadFairnessScore } from '../services/matchingEngine.js';
import CooperativeVote from '../models/CooperativeVote.js';
import Provider from '../models/Provider.js';
import Booking from '../models/Booking.js';

export const getCooperativeOverview = async (req, res) => {
  try {
    const completedBookings = await Booking.find({ status: 'COMPLETED' });

    const liveWorkerEarnings = completedBookings.reduce(
      (sum, b) => sum + (b.pricing?.workerEarnings || 450),
      0
    );

    const baseJobs = inMemoryStore.cooperative.totalJobsCompleted || 1240;
    const currentTotalJobs = baseJobs + completedBookings.length;

    const baseEarnings = 558000;
    const currentTotalEarnings = baseEarnings + liveWorkerEarnings;

    // Fetch recorded votes from MongoDB
    const allVotes = await CooperativeVote.find({});
    const votesByInitiative = allVotes.reduce((acc, v) => {
      acc[v.initiativeId] = (acc[v.initiativeId] || 0) + 1;
      return acc;
    }, {});

    // Fetch providers from MongoDB
    const providersList = await Provider.find({});
    const allBookings = await Booking.find({});

    // Build Workload Distribution across providers
    const workloadDistribution = providersList.map((prov) => {
      const provId = prov.id || prov._id?.toString();
      const provBookings = allBookings.filter(b => b.providerId === provId || b.providerId === prov.id);
      const activeCount = provBookings.filter(b => ['BOOKED', 'PROVIDER_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)).length;
      const completedCount = provBookings.filter(b => b.status === 'COMPLETED').length;

      // Simulated weekly baseline + live activity
      const simulatedWeeklyBase = prov.weeklyJobsCount !== undefined ? prov.weeklyJobsCount : ((prov.jobsCompleted || 10) % 15) + 4;
      const totalWeeklyJobs = simulatedWeeklyBase + activeCount;
      const fairnessScore = calculateWorkloadFairnessScore({ ...(prov.toObject ? prov.toObject() : prov), weeklyJobsCount: totalWeeklyJobs });

      let fairnessTier = 'Balanced Queue';
      if (totalWeeklyJobs <= 7) {
        fairnessTier = 'Priority Boost (Low Queue)';
      } else if (totalWeeklyJobs >= 16) {
        fairnessTier = 'Heavy Queue (Load Balanced)';
      }

      return {
        id: prov.id || prov._id?.toString(),
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

    const communityInitiatives = [
      {
        id: 'init_1',
        title: 'Cooperative Standards & Certification Ballot',
        status: 'Voting Open',
        desc: 'Members vote on adopting new precision tool and green service standards.',
        votesCount: votesByInitiative['init_1'] || 0
      },
      {
        id: 'init_2',
        title: 'Monsoon Tool Emergency Replacement Support',
        status: 'Active',
        desc: 'Peer tool sharing and equipment assistance for rainy season dispatches.',
        votesCount: votesByInitiative['init_2'] || 0
      },
      {
        id: 'init_3',
        title: 'Pune Gig Workers Skill & Wellness Day',
        status: 'Upcoming (15 Sep)',
        desc: 'Free annual ergonomic health checkup and masterclass workshop in Kothrud.',
        votesCount: votesByInitiative['init_3'] || 0
      }
    ];

    return res.status(200).json({
      success: true,
      cooperative: {
        name: inMemoryStore.cooperative.name,
        totalMembers: inMemoryStore.cooperative.totalMembers || 128,
        totalCompletedJobs: currentTotalJobs,
        totalWorkerEarnings: currentTotalEarnings,
        totalVotesCast: allVotes.length,
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
        communityInitiatives
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const castCooperativeVote = async (req, res) => {
  try {
    const voterId = req.user?.id || req.body?.voterId || 'usr_provider_demo';
    const voterName = req.user?.name || req.body?.voterName || 'Cooperative Member';
    const voterRole = req.user?.role || req.body?.voterRole || 'SERVICE_PROVIDER';
    const initiativeId = req.body?.initiativeId || req.params?.id || 'init_1';
    const initiativeTitle = req.body?.initiativeTitle || 'Cooperative Standards & Certification Ballot';
    const decision = req.body?.decision || 'FOR';

    // Enforce 1 Member 1 Vote policy
    const existingVote = await CooperativeVote.findOne({ initiativeId, voterId });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'Member has already cast their democratic vote for this initiative (1 Member 1 Vote policy).',
        vote: existingVote
      });
    }

    const vote = await CooperativeVote.create({
      initiativeId,
      initiativeTitle,
      voterId,
      voterName,
      voterRole,
      decision,
      voteWeight: 1
    });

    return res.status(201).json({
      success: true,
      message: 'Democratic member vote successfully recorded on the cooperative ledger!',
      vote
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getCooperativeVotes = async (req, res) => {
  try {
    const initiativeId = req.query?.initiativeId || req.params?.id;
    const filter = initiativeId ? { initiativeId } : {};

    const votes = await CooperativeVote.find(filter).sort({ createdAt: -1 });
    const totalVotes = votes.length;
    const forVotes = votes.filter(v => ['FOR', 'YES'].includes(v.decision)).length;
    const againstVotes = votes.filter(v => ['AGAINST', 'NO'].includes(v.decision)).length;

    return res.status(200).json({
      success: true,
      totalVotes,
      tally: {
        for: forVotes,
        against: againstVotes
      },
      votes
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
