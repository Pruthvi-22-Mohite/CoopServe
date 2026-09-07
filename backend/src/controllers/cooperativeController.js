import { inMemoryStore } from '../store/inMemoryStore.js';
import { calculateWorkloadFairnessScore } from '../services/matchingEngine.js';
import CooperativeVote from '../models/CooperativeVote.js';
import Provider from '../models/Provider.js';
import Booking from '../models/Booking.js';

const DEFAULT_GOVERNANCE_POLL = {
  id: 'commission_rate_2026_q4',
  title: 'Should the cooperative commission rate remain at 10%?',
  question: 'Should the cooperative commission rate remain at 10%?',
  status: 'ACTIVE',
  summary: 'Annual cooperative commission review for member governance.',
  options: [
    { value: 'KEEP_10', label: 'Yes, keep 10%' },
    { value: 'REVIEW_RATE', label: 'No, review the commission rate' }
  ]
};

const ACTIVE_GOVERNANCE_POLL_ID = DEFAULT_GOVERNANCE_POLL.id;

const isActiveGovernancePoll = (pollId) => String(pollId || '') === ACTIVE_GOVERNANCE_POLL_ID;

const normalizeVoteOption = (rawOption) => {
  if (!rawOption) return null;
  const value = String(rawOption).trim().toUpperCase();
  const mapped = {
    YES: 'KEEP_10',
    NO: 'REVIEW_RATE',
    FOR: 'KEEP_10',
    AGAINST: 'REVIEW_RATE',
    KEEP_10: 'KEEP_10',
    REVIEW_RATE: 'REVIEW_RATE',
    KEEP10: 'KEEP_10',
    REVIEWRATE: 'REVIEW_RATE'
  };
  return mapped[value] || null;
};

const resolvePollResults = async (pollId = DEFAULT_GOVERNANCE_POLL.id) => {
  const votes = await CooperativeVote.find({
    $or: [
      { pollId },
      { initiativeId: pollId }
    ]
  }).sort({ createdAt: -1 });

  const tally = {
    KEEP_10: 0,
    REVIEW_RATE: 0
  };

  votes.forEach((vote) => {
    const optionValue = normalizeVoteOption(vote.selectedOption || vote.decision || vote.option || 'KEEP_10');
    if (optionValue && tally[optionValue] !== undefined) {
      tally[optionValue] += 1;
    }
  });

  const totalVotes = votes.length;
  const yesVotes = tally.KEEP_10;
  const noVotes = tally.REVIEW_RATE;

  return {
    pollId,
    totalVotes,
    tally,
    percentages: {
      KEEP_10: totalVotes ? Number(((yesVotes / totalVotes) * 100).toFixed(1)) : 0,
      REVIEW_RATE: totalVotes ? Number(((noVotes / totalVotes) * 100).toFixed(1)) : 0
    },
    votes
  };
};

const getGovernancePollPayload = async (user = null) => {
  const results = await resolvePollResults(DEFAULT_GOVERNANCE_POLL.id);
  const hasVoted = await getCurrentProviderVoteStatus(user, DEFAULT_GOVERNANCE_POLL.id);
  return {
    ...DEFAULT_GOVERNANCE_POLL,
    hasVoted,
    results
  };
};

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

    const governancePoll = await getGovernancePollPayload();

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
        currentPoll: governancePoll,
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

export const getActiveGovernancePoll = async (req, res) => {
  try {
    const poll = await getGovernancePollPayload(req.user || null);
    return res.status(200).json({
      success: true,
      poll
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

export const castGovernanceVote = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to vote.' });
    }

    if ((req.user.role || '').toUpperCase() !== 'SERVICE_PROVIDER') {
      return res.status(403).json({
        success: false,
        message: 'Only authenticated service providers can vote on cooperative governance polls.'
      });
    }

    const pollId = req.params?.pollId || req.body?.pollId || DEFAULT_GOVERNANCE_POLL.id;
    if (!isActiveGovernancePoll(pollId)) {
      return res.status(404).json({
        success: false,
        message: 'Governance poll not found.'
      });
    }

    const selectedOption = normalizeVoteOption(req.body?.selectedOption || req.body?.option || req.body?.decision);

    if (!selectedOption || !DEFAULT_GOVERNANCE_POLL.options.some(option => option.value === selectedOption)) {
      return res.status(400).json({
        success: false,
        message: 'Please choose a valid vote option.'
      });
    }

    const providerId = req.user.id || req.user._id?.toString();
    const existingVote = await CooperativeVote.findOne({
      $or: [
        { pollId, providerId },
        { pollId, voterId: providerId },
        { initiativeId: pollId, voterId: providerId }
      ]
    });

    if (existingVote) {
      const results = await resolvePollResults(pollId);
      return res.status(409).json({
        success: false,
        message: 'This provider has already voted on the active governance poll.',
        vote: existingVote,
        poll: { ...DEFAULT_GOVERNANCE_POLL, hasVoted: true, results }
      });
    }

    let vote;
    try {
      vote = await CooperativeVote.create({
        pollId,
        initiativeId: pollId,
        initiativeTitle: DEFAULT_GOVERNANCE_POLL.question,
        providerId,
        voterId: providerId,
        voterName: req.user.name || 'Provider',
        voterRole: req.user.role || 'SERVICE_PROVIDER',
        selectedOption,
        optionLabel: DEFAULT_GOVERNANCE_POLL.options.find(option => option.value === selectedOption)?.label || selectedOption,
        decision: selectedOption === 'KEEP_10' ? 'YES' : 'NO',
        voteWeight: 1
      });
    } catch (err) {
      if (err?.code === 11000) {
        const results = await resolvePollResults(pollId);
        return res.status(409).json({
          success: false,
          message: 'This provider has already voted on the active governance poll.',
          poll: { ...DEFAULT_GOVERNANCE_POLL, hasVoted: true, results }
        });
      }
      throw err;
    }

    const results = await resolvePollResults(pollId);

    return res.status(201).json({
      success: true,
      message: 'Your governance vote was recorded successfully.',
      vote,
      poll: { ...DEFAULT_GOVERNANCE_POLL, hasVoted: true, results }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getGovernanceResults = async (req, res) => {
  try {
    const pollId = req.params?.pollId || DEFAULT_GOVERNANCE_POLL.id;
    if (!isActiveGovernancePoll(pollId)) {
      return res.status(404).json({
        success: false,
        message: 'Governance poll not found.'
      });
    }

    const results = await resolvePollResults(pollId);
    const hasVoted = req.user ? await getCurrentProviderVoteStatus(req.user, pollId) : false;
    return res.status(200).json({
      success: true,
      poll: { ...DEFAULT_GOVERNANCE_POLL, hasVoted, results }
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

const getCurrentProviderVoteStatus = async (user, pollId) => {
  if (!user || !pollId || String(user.role || '').toUpperCase() !== 'SERVICE_PROVIDER') {
    return false;
  }

  const providerId = user.id || user._id?.toString();
  if (!providerId) {
    return false;
  }

  const existingVote = await CooperativeVote.findOne({
    $or: [
      { pollId, providerId },
      { pollId, voterId: providerId },
      { initiativeId: pollId, voterId: providerId }
    ]
  }).select('_id');

  return Boolean(existingVote);
};
