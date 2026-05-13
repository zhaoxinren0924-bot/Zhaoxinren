export type ProductAudience = 'user' | 'creator';
export type ProductStatus = 'SHOWABLE' | 'SELLABLE' | 'SCALABLE';

export type ProductScreen = {
  name: string;
  purpose: string;
  primaryRule: string;
  items: string[];
};

export type UserTodayCard = {
  clarity: 'HIGH' | 'MEDIUM' | 'AMBIGUOUS';
  headline: string;
  consensusDelta: 'ABOVE' | 'BELOW' | 'ORTHOGONAL';
  alphaBand: [number, number, number];
  falsification: string;
  cascade?: string;
  yesterdayDiff?: string;
};

export type UserProductSnapshot = {
  audience: 'user';
  promise: string;
  designRules: string[];
  today: UserTodayCard;
  screens: ProductScreen[];
  trackRecord: {
    accuracy: string;
    consensusLeadTime: string;
    reliabilityByBand: string;
    recentOutcomes: string[];
  };
  apiContract: {
    allowedTables: Record<string, string[]>;
    hiddenTables: string[];
  };
};

export type PipelineStep = {
  name: 'INGEST' | 'SCORE' | 'LAYERS' | 'CONSENSUS' | 'CRITIC' | 'JUDGMENT' | 'INFERENCE' | 'REPORT';
  status: 'pass' | 'fail';
  durationSeconds: number;
  signalCount: number;
  message: string;
  errorMessage?: string;
  suggestedAction?: string;
};

export type CreatorProductSnapshot = {
  audience: 'creator';
  promise: string;
  status: ProductStatus;
  pipeline: PipelineStep[];
  pipelineRun?: { id: string; started_at: string; completed_at: string; status: 'pass' | 'fail'; summary: string };
  pipelineHealth?: { failedSteps: number; totalSignals: number; totalDurationSeconds: number };
  annotationGate: {
    unannotatedFailures: number;
    status: 'clear' | 'warn' | 'blocked';
    message: string;
  };
  maturity: {
    trackRecordDepth: string;
    predictionAccuracy: string;
    consensusLeadTime: string;
    causalCalibration: string;
    failureUnderstanding: string;
  };
  gradient: {
    bottleneck: string;
    topProposal: string;
    expectedRoi: string;
  };
  screens: ProductScreen[];
  apiContract: {
    fullAccessTables: string[];
    writableTables: string[];
  };
};

export type FeatureAccess = {
  feature: string;
  userProduct: 'full' | 'aggregate' | 'hidden';
  creatorProduct: 'full' | 'write';
};

export const userForbiddenTerms = [
  'edge confidence',
  'natural gradient',
  'annotation',
  'calibration',
  'entropy',
  'llm',
  'pipeline',
  'ontology',
];

export const buildUserProductSnapshot = (): UserProductSnapshot => ({
  audience: 'user',
  promise: 'The intelligence consumption product: fast judgment, visible proof, and trust over time.',
  designRules: [
    'Deliver the core judgment in 30 seconds on a phone.',
    'Keep the Track Record one tap away for every paying client.',
    'Use plain language and never expose operator-only controls.',
    'Make every claim falsifiable with a date, metric, and source.',
  ],
  today: {
    clarity: 'HIGH',
    headline: 'AI infrastructure supply constraints are easing faster than consensus expects.',
    consensusDelta: 'ABOVE',
    alphaBand: [0.18, 0.31, 0.46],
    falsification: 'We will know by May 30, 2026 via Nikkei Asia and Digitimes supplier checks.',
    cascade: '⚠ L2 packaging relief may lower L3 training cost pressure within 14-21 days.',
    yesterdayDiff: '↑ Upgraded from MEDIUM after new Samsung SoIC qualification data.',
  },
  screens: [
    {
      name: 'Today',
      purpose: '30-second judgment card for mobile clients.',
      primaryRule: 'Answer what changed, where we differ from consensus, and when we will know.',
      items: ['Clarity badge', 'Headline judgment', 'Consensus delta', 'Alpha band', 'Falsification date'],
    },
    {
      name: 'See why we believe this',
      purpose: 'Readable evidence and causal argument for the current judgment.',
      primaryRule: 'Show reasoning and source trail without raw scoring math.',
      items: ['4-paragraph argument', '3-7 supporting signals', 'Causal chain', 'Market snapshot', 'Falsification plan'],
    },
    {
      name: 'Track Record',
      purpose: 'Trust engine that proves the system is accountable over time.',
      primaryRule: 'Never hide the record behind a tier; all users can see it.',
      items: ['Accuracy trend', 'Consensus lead time', 'By-layer breakdown', 'Reliability curve', 'Recent verified predictions'],
    },
    {
      name: 'Alerts',
      purpose: 'Digest of cascades, upcoming checks, and judgment changes.',
      primaryRule: 'Alert only when there is a decision-relevant change.',
      items: ['Cascade warning', 'Falsification approaching', 'Judgment upgraded or downgraded', 'New judgment published'],
    },
  ],
  trackRecord: {
    accuracy: '68% ± 8% over rolling 90 days',
    consensusLeadTime: 'Median 14 days before consensus',
    reliabilityByBand: 'Predicted strength vs actual outcomes, simplified for client review',
    recentOutcomes: ['Confirmed: CoWoS lead-time relief', 'Missed: HBM3e timing by 5 days', 'Confirmed: B200 procurement delay'],
  },
  apiContract: {
    allowedTables: {
      judgment_packages: ['statement', 'alpha', 'clarity', 'evidence_ids'],
      consensus_snapshots: ['consensus_statement', 'our_delta', 'direction', 'falsification', 'falsification_date', 'falsification_metric'],
      verification_results: ['aggregate_accuracy', 'aggregate_lead_time'],
      source_timing_aggregates: ['median_lead_days_by_source', 'sample_count', 'timing_premium'],
      prediction_failure_records: ['aggregate_failure_distribution'],
    },
    hiddenTables: ['edge_confidence_log', 'agent_telemetry', 'source_timing_records', 'consensus_validations', 'active_learning_designs', 'model_configs'],
  },
});

export const buildCreatorProductSnapshot = (): CreatorProductSnapshot => ({
  audience: 'creator',
  promise: 'The operator product: pipeline health, calibration state, learning progress, and controlled evolution.',
  status: 'SELLABLE',
  pipeline: [
    { name: 'INGEST', status: 'pass', durationSeconds: 18, signalCount: 53, message: 'Sources collected and deduplicated.' },
    { name: 'SCORE', status: 'pass', durationSeconds: 11, signalCount: 41, message: 'Threshold survivors ready for layer synthesis.' },
    { name: 'LAYERS', status: 'pass', durationSeconds: 29, signalCount: 18, message: 'Layer arguments generated.' },
    { name: 'CONSENSUS', status: 'pass', durationSeconds: 7, signalCount: 5, message: 'ConsensusSnapshot consistent.' },
    { name: 'CRITIC', status: 'pass', durationSeconds: 14, signalCount: 4, message: 'No blocking contradictions.' },
    { name: 'JUDGMENT', status: 'pass', durationSeconds: 9, signalCount: 1, message: 'Daily package ready.' },
    { name: 'INFERENCE', status: 'pass', durationSeconds: 6, signalCount: 2, message: 'Cascade scan complete.' },
    { name: 'REPORT', status: 'pass', durationSeconds: 4, signalCount: 1, message: 'User-facing report generated.' },
  ],
  annotationGate: {
    unannotatedFailures: 4,
    status: 'clear',
    message: 'All clear — publication allowed.',
  },
  maturity: {
    trackRecordDepth: 'Level 3: 30+ verified predictions',
    predictionAccuracy: 'Level 3: 65-74% with statistical margin',
    consensusLeadTime: 'Level 3: median ≥14 days',
    causalCalibration: 'Level 3: 25%+ causal edges have ≥3 verifications',
    failureUnderstanding: 'Level 2: dominant failure type emerging',
  },
  gradient: {
    bottleneck: 'CriticAgent variance contributed 0.34 to this week\'s error surface.',
    topProposal: 'Tighten timing-window prompt and require explicit invalidation source.',
    expectedRoi: 'R1 risk, estimated +6% verified timing accuracy.',
  },
  screens: [
    {
      name: 'Pipeline',
      purpose: '3-second answer to whether today\'s run is healthy.',
      primaryRule: 'Any failed step turns red with inline error and suggested action.',
      items: ['8-step run status', 'Agent health', 'Signal metrics', 'Consensus validation', 'Annotation gate'],
    },
    {
      name: 'Maturity',
      purpose: 'Commercial readiness across five maturity signals.',
      primaryRule: 'SHOWABLE / SELLABLE / SCALABLE is driven by verified lead time and accuracy.',
      items: ['Track record depth', 'Prediction accuracy', 'Consensus lead time', 'Causal calibration', 'Failure understanding'],
    },
    {
      name: 'Gradient',
      purpose: 'Weekly evolution report ranked by ROI.',
      primaryRule: 'Implement top R0/R1 proposal; escalate R2+.',
      items: ['Failure distribution', 'Pipeline bottleneck', 'Top proposals', 'Edge entropy map', 'Weekly loop tracker'],
    },
    {
      name: 'Annotation',
      purpose: 'Clear failure backlog before it blocks publication.',
      primaryRule: '0-4 clear, 5-9 warn, 10+ blocked.',
      items: ['Gate banner', 'Queue list', 'Inline annotation form', 'Latency tracking', 'History'],
    },
    {
      name: 'Causal Graph',
      purpose: 'Validate domain structure and edge confidence history.',
      primaryRule: 'Every edge shows current p, n verifications, mechanism, and audit trail.',
      items: ['Graph view', 'Edge detail', 'Verification recorder', 'Edge history', 'Seed vs calibrated'],
    },
  ],
  apiContract: {
    fullAccessTables: [
      'judgment_packages',
      'consensus_snapshots',
      'verification_results',
      'source_timing_records',
      'source_timing_aggregates',
      'prediction_failure_records',
      'edge_confidence_log',
      'agent_telemetry',
      'consensus_validations',
      'active_learning_designs',
      'model_configs',
    ],
    writableTables: [
      'judgment_packages',
      'consensus_snapshots',
      'verification_results',
      'source_timing_records',
      'prediction_failure_records',
      'edge_confidence_log',
      'agent_telemetry',
      'active_learning_designs',
      'model_configs',
    ],
  },
});

export const featureMatrix: FeatureAccess[] = [
  { feature: "Today's judgment", userProduct: 'full', creatorProduct: 'full' },
  { feature: 'Evidence chain and source trail', userProduct: 'full', creatorProduct: 'full' },
  { feature: 'Track record', userProduct: 'full', creatorProduct: 'full' },
  { feature: 'Cascade alerts', userProduct: 'full', creatorProduct: 'full' },
  { feature: 'Pipeline run status', userProduct: 'hidden', creatorProduct: 'full' },
  { feature: 'Agent health metrics', userProduct: 'hidden', creatorProduct: 'full' },
  { feature: 'Maturity assessment', userProduct: 'hidden', creatorProduct: 'full' },
  { feature: 'Gradient evolution proposals', userProduct: 'hidden', creatorProduct: 'full' },
  { feature: 'Active learning targets', userProduct: 'hidden', creatorProduct: 'full' },
  { feature: 'Annotation queue and backlog gate', userProduct: 'hidden', creatorProduct: 'write' },
  { feature: 'Model settings', userProduct: 'hidden', creatorProduct: 'write' },
  { feature: 'Domain builder', userProduct: 'hidden', creatorProduct: 'write' },
];

export const validateUserProductIsolation = (snapshot: UserProductSnapshot = buildUserProductSnapshot()) => {
  const lower = JSON.stringify(snapshot).toLowerCase();
  const forbiddenTermHits = userForbiddenTerms.filter((term) => lower.includes(term));
  const exposedHiddenTables = snapshot.apiContract.hiddenTables.filter((table) =>
    Object.keys(snapshot.apiContract.allowedTables).includes(table),
  );

  return {
    ok: forbiddenTermHits.length === 0 && exposedHiddenTables.length === 0,
    forbiddenTermHits,
    exposedHiddenTables,
  };
};

export type ReadinessLevel = 'prototype' | 'demo-ready' | 'operator-mvp' | 'client-mvp' | 'production-ready';

export type ReadinessArea = {
  name: string;
  score: number;
  level: ReadinessLevel;
  implemented: string[];
  missing: string[];
  nextStep: string;
};

export type SystemReadinessAssessment = {
  overallScore: number;
  overallLevel: ReadinessLevel;
  summary: string;
  areas: ReadinessArea[];
};

const average = (values: number[]) => Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

const readinessLevelFor = (score: number): ReadinessLevel => {
  if (score >= 90) return 'production-ready';
  if (score >= 70) return 'client-mvp';
  if (score >= 50) return 'operator-mvp';
  if (score >= 30) return 'demo-ready';
  return 'prototype';
};

export const buildSystemReadinessAssessment = (): SystemReadinessAssessment => {
  const user = buildUserProductSnapshot();
  const creator = buildCreatorProductSnapshot();
  const isolation = validateUserProductIsolation(user);

  const areas: ReadinessArea[] = [
    {
      name: 'Architecture contract',
      score: 72,
      level: 'client-mvp',
      implemented: [
        'Separate User Product and Creator Product snapshots',
        'Feature matrix distinguishes user-visible, aggregate, hidden, and creator-write access',
        'User API contract excludes operator-only tables',
      ],
      missing: ['No real auth boundary yet', 'No SQLite view layer or API gateway enforcement yet'],
      nextStep: 'Create separate user and creator API adapters backed by the same persisted store.',
    },
    {
      name: 'User Product',
      score: 46,
      level: 'demo-ready',
      implemented: [
        `${user.screens.length} client screens modeled`,
        '30-second judgment card shape is present',
        'Track Record is always accessible in the model',
      ],
      missing: ['No real judgment feed', 'No authentication', 'No mobile interaction test coverage', 'No alert delivery'],
      nextStep: 'Build read-only Today and Track Record routes on real judgment package data.',
    },
    {
      name: 'Creator Product',
      score: 54,
      level: 'operator-mvp',
      implemented: [
        `${creator.pipeline.length}-step pipeline dashboard model`,
        'Annotation gate model',
        'Maturity, Gradient, Annotation, and Causal Graph screen definitions',
      ],
      missing: ['No persisted run logs', 'No annotation write form wired to storage', 'No model settings backend', 'No active-learning endpoint'],
      nextStep: 'Implement the Creator dashboard first: Pipeline, Maturity, Gradient, Annotation, Causal Graph.',
    },
    {
      name: 'Cognition engine',
      score: 38,
      level: 'demo-ready',
      implemented: [
        'Deterministic local signal normalization, scoring, fact materialization, reasoning, and checks',
        'Opportunity, risk, and weak-signal paths covered by script assertions',
      ],
      missing: ['No LLM extraction', 'No graph database', 'No consensus snapshot validation service', 'No real verification update loop'],
      nextStep: 'Replace deterministic heuristics with pipeline-backed extractors and persisted verification records.',
    },
    {
      name: 'Operational readiness',
      score: 24,
      level: 'prototype',
      implemented: ['TypeScript checks', 'Architecture checks', 'Engine checks'],
      missing: ['No deployment target', 'No observability', 'No error budget', 'No security model', 'No data migration path'],
      nextStep: 'Add persistence, API boundaries, audit logs, monitoring, and environment-specific deployment configuration.',
    },
  ];

  const adjustedAreas = areas.map((area) =>
    area.name === 'Architecture contract' && !isolation.ok
      ? { ...area, score: 20, level: 'prototype' as const, missing: [...area.missing, 'User Product isolation check is failing'] }
      : area,
  );
  const overallScore = average(adjustedAreas.map((area) => area.score));

  return {
    overallScore,
    overallLevel: readinessLevelFor(overallScore),
    summary:
      'The system is usable as an architecture prototype and operator-facing MVP starting point. It is not yet client-production-ready because real data, persistence, API isolation, auth, observability, and verification loops are still missing.',
    areas: adjustedAreas,
  };
};

export type ImplementationPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type ImplementationPhase = 'foundation' | 'creator-mvp' | 'user-mvp' | 'production-hardening';
export type ImplementationStatus = 'not-started' | 'in-progress' | 'blocked';

export type ImplementationWorkItem = {
  id: string;
  phase: ImplementationPhase;
  priority: ImplementationPriority;
  title: string;
  why: string;
  approach: string[];
  acceptanceCriteria: string[];
  status: ImplementationStatus;
};

export type ImplementationPlan = {
  principle: string;
  immediateFocus: string;
  milestones: Array<{
    phase: ImplementationPhase;
    target: string;
    outcome: string;
  }>;
  workItems: ImplementationWorkItem[];
};

export const buildImplementationPlan = (): ImplementationPlan => ({
  principle: 'Build bottom-up: durable data contracts and creator operations first, then client-facing intelligence consumption.',
  immediateFocus: 'Finish the foundation and Creator Product MVP before expanding the User Product beyond Today + Track Record.',
  milestones: [
    {
      phase: 'foundation',
      target: 'Weeks 1-2',
      outcome: 'Persisted store, API contracts, token separation, and run log schema exist behind the current UI models.',
    },
    {
      phase: 'creator-mvp',
      target: 'Weeks 3-6',
      outcome: 'Operators can inspect pipeline health, annotate failures, verify predictions, and see maturity/gradient reports.',
    },
    {
      phase: 'user-mvp',
      target: 'Weeks 7-10',
      outcome: 'Clients can use a read-only mobile Today card and Track Record backed by real judgment packages.',
    },
    {
      phase: 'production-hardening',
      target: 'Weeks 11-12',
      outcome: 'Observability, audit logs, security checks, and deployment automation make the MVP safe to pilot.',
    },
  ],
  workItems: [
    {
      id: 'FND-001',
      phase: 'foundation',
      priority: 'P0',
      title: 'Persist the shared intelligence database',
      why: 'The current snapshots are in-memory. Real products need a single durable source of truth with user-safe views.',
      approach: [
        'Create tables for judgment_packages, consensus_snapshots, verification_results, source_timing_records, prediction_failure_records, edge_confidence_log, agent_telemetry, active_learning_designs, and model_configs.',
        'Create read-only user views that expose only fields listed in UserProductSnapshot.apiContract.allowedTables.',
        'Create migration and seed scripts for the sample PRD data.',
      ],
      acceptanceCriteria: [
        'A local database can be created from scratch with one command.',
        'User views cannot select hidden tables or hidden columns.',
        'Architecture check fails if a hidden table is added to the user contract.',
      ],
      status: 'in-progress',
    },
    {
      id: 'FND-002',
      phase: 'foundation',
      priority: 'P0',
      title: 'Split User API and Creator API adapters',
      why: 'The PRD requires architectural exclusion, not permission-level hiding in one product.',
      approach: [
        'Add separate API modules for user read-only routes and creator read/write routes.',
        'Use separate token issuers or token audiences for user and creator sessions.',
        'Add contract tests that attempt to fetch creator-only data from user routes and expect rejection.',
      ],
      acceptanceCriteria: [
        'User API returns Today and Track Record contracts only.',
        'Creator API returns pipeline, annotation, maturity, gradient, graph, active learning, and model config data.',
        'Tokens are not interchangeable across product APIs.',
      ],
      status: 'in-progress',
    },
    {
      id: 'CRT-001',
      phase: 'creator-mvp',
      priority: 'P0',
      title: 'Implement Creator Pipeline dashboard from persisted run logs',
      why: 'Creators need to know in 3 seconds whether today’s system run is healthy.',
      approach: [
        'Persist every pipeline run step with status, duration, signal count, and inline error.',
        'Replace static pipeline snapshot data with a query over the latest run.',
        'Add failure states and suggested action copy for failed steps.',
      ],
      acceptanceCriteria: [
        'The Pipeline screen renders the latest 8-step run from storage.',
        'Any failed step turns red and displays a specific error message.',
        'Signal count below threshold triggers an insufficient-signal warning.',
      ],
      status: 'in-progress',
    },
    {
      id: 'CRT-002',
      phase: 'creator-mvp',
      priority: 'P0',
      title: 'Implement Annotation and Verification workflows',
      why: 'The system cannot improve without failure annotation and prediction verification.',
      approach: [
        'Build pending failure queue with age, type, annotation state, and gate status.',
        'Add inline annotation form that writes root cause and prevention metadata.',
        'Add verification recorder that updates prediction outcomes and feeds maturity metrics.',
      ],
      acceptanceCriteria: [
        'Annotation gate shows 0-4 clear, 5-9 warn, and 10+ blocked.',
        'Submitting annotation removes the item from pending queue.',
        'Verification results update Track Record aggregates.',
      ],
      status: 'in-progress',
    },
    {
      id: 'CRT-003',
      phase: 'creator-mvp',
      priority: 'P1',
      title: 'Wire Maturity, Gradient, Causal Graph, and Active Learning screens',
      why: 'Operators need visibility into improvement strategy, not just daily status.',
      approach: [
        'Compute maturity signals from verification and edge history records.',
        'Generate gradient proposals from failure distribution and bottleneck metrics.',
        'Render causal graph edge detail and active learning targets from persisted edge records.',
      ],
      acceptanceCriteria: [
        'Maturity status is derived from real counts and lead-time aggregates.',
        'Gradient proposals include ROI, risk, and the metric they intend to improve.',
        'Active learning targets show horizon mix and verification source.',
      ],
      status: 'not-started',
    },
    {
      id: 'USR-001',
      phase: 'user-mvp',
      priority: 'P1',
      title: 'Ship mobile User Product Today and Track Record',
      why: 'Users pay for a fast decision and proof that the system deserves trust.',
      approach: [
        'Build read-only Today route from latest judgment package and consensus snapshot.',
        'Build Track Record aggregates from verification_results and source_timing_records.',
        'Add 375px viewport tests for Today and Alerts-critical states.',
      ],
      acceptanceCriteria: [
        'Today card loads from user API and includes clarity, headline, consensus delta, alpha band, and falsification date.',
        'Track Record is always accessible and never tier-gated.',
        'No user-facing screen contains forbidden internal terms.',
      ],
      status: 'not-started',
    },
    {
      id: 'ENG-001',
      phase: 'foundation',
      priority: 'P1',
      title: 'Replace deterministic engine heuristics with pipeline-backed extraction',
      why: 'The local engine proves shape, but production intelligence needs real extraction, evidence, and verification loops.',
      approach: [
        'Keep AphlaCognitionEngine contracts but add adapters for model extraction and consensus validation.',
        'Persist generated facts with evidence IDs and source reliability.',
        'Feed verified outcomes back into scoring and maturity aggregates.',
      ],
      acceptanceCriteria: [
        'Engine output includes evidence-backed facts, not keyword-only facts.',
        'ConsensusSnapshot validation can block publication on strong conflict.',
        'Verification results can update future confidence and readiness metrics.',
      ],
      status: 'not-started',
    },
    {
      id: 'OPS-001',
      phase: 'production-hardening',
      priority: 'P2',
      title: 'Add observability, audit logs, and deployment gates',
      why: 'A client-facing intelligence product needs operational safety before paid pilots.',
      approach: [
        'Add structured logs and metrics for pipeline runs, API requests, and annotation latency.',
        'Add audit trail for creator writes and model configuration changes.',
        'Add CI checks for typecheck, architecture checks, engine checks, and build.',
      ],
      acceptanceCriteria: [
        'Every creator write has actor, timestamp, old value, and new value.',
        'Failed pipeline runs create an operator-visible alert.',
        'Production deploy is blocked when checks fail.',
      ],
      status: 'not-started',
    },
  ],
});


export type PrdCoverageStatus = 'implemented' | 'in-progress' | 'not-started' | 'blocked';

export type PrdRequirementCoverage = {
  id: string;
  part: string;
  requirement: string;
  status: PrdCoverageStatus;
  evidence: string[];
  nextStep: string;
};

export type PrdV5CoverageReport = {
  version: 'v5.0';
  complete: boolean;
  totalRequirements: number;
  implemented: number;
  inProgress: number;
  notStarted: number;
  blocked: number;
  mustNotStopUntil: string[];
  requirements: PrdRequirementCoverage[];
};

const prdV5Requirements: PrdRequirementCoverage[] = [
  {
    id: 'V5-TRACK-001',
    part: 'Vector 1: Track Record',
    requirement: 'Every published judgment captures a non-reconstructible ConsensusSnapshot with timestamp, sources, confidence, delta, falsification date, and falsification metric.',
    status: 'in-progress',
    evidence: ['ConsensusSnapshotRecord includes snapshot_ts, consensus_sources, consensus_confidence, falsification_date, and falsification_metric.', 'Seed judgment includes one populated ConsensusSnapshot.'],
    nextStep: 'Move ConsensusSnapshot writes into the publication path and block publishing when any field is missing.',
  },
  {
    id: 'V5-TRACK-002',
    part: 'Vector 1: Track Record',
    requirement: 'Track Record dashboard shows overall accuracy, consensus lead time, by-layer breakdown, failure distribution, and calibration curve.',
    status: 'in-progress',
    evidence: ['User read model exposes aggregate accuracy, lead time, recent outcomes, and failure distribution.'],
    nextStep: 'Add by-layer accuracy/lead-time aggregates and predicted-confidence calibration buckets.',
  },
  {
    id: 'V5-CAUSAL-001',
    part: 'Vector 2: Causal Model Calibration',
    requirement: 'Verification outcomes update causal edge confidence with the corrected natural-gradient rule and edge audit trail.',
    status: 'in-progress',
    evidence: ['EdgeConfidenceLogRecord stores old_confidence, new_confidence, n_verifications, and rule_applied.', 'naturalGradientEdgeUpdate computes lr × p×(1-p) / n and applies the asymmetric REFUTED multiplier.'],
    nextStep: 'Persist natural-gradient updates through the durable verification pipeline and add edge oscillation monitoring.',
  },
  {
    id: 'V5-FAIL-001',
    part: 'Vector 3: Failure Taxonomy',
    requirement: 'Prediction failures are typed as TIMING/DIRECTION/MAGNITUDE/SCOPE/CONSENSUS/SIGNAL and carry human root-cause annotations.',
    status: 'in-progress',
    evidence: ['PredictionFailureRecord stores failure_type, human_annotation, root_cause, condition_text, prevents_type, and causal_chain_iris.', 'annotateFailure writes operator annotations.'],
    nextStep: 'Persist annotation writes with actor audit data and enforce the backlog gate before publication.',
  },
  {
    id: 'V5-SOURCE-001',
    part: 'Vector 4: Source Timing Calibration',
    requirement: 'Per-prediction source timing records capture earliest signal timestamp, market consensus timestamp, lead days, and topic layer.',
    status: 'in-progress',
    evidence: ['SourceTimingRecord stores earliest_signal_source, earliest_signal_ts, market_consensus_ts, lead_days, and topic_layer.', 'verifyPrediction writes source timing evidence for CONFIRMED outcomes when timing fields are supplied.'],
    nextStep: 'Move source timing writes from the in-memory API helper to the durable verify command.',
  },
  {
    id: 'V5-SOURCE-002',
    part: 'Vector 4: Source Timing Calibration',
    requirement: 'Monthly source timing aggregates report median lead days and timing premium only after at least 10 samples.',
    status: 'in-progress',
    evidence: ['SourceTimingAggregateRecord stores sample_count, median_lead_days, p25/p75, and timing_premium.', 'Store checks require sample_count >= 10.'],
    nextStep: 'Add a monthly aggregation job and hide aggregates below the 10-sample threshold.',
  },
  {
    id: 'V5-SIGNAL-001',
    part: 'Causal Information Architecture',
    requirement: 'Signals are classified as CAUSE/MECHANISM/INDEPENDENT_EFFECT/INVALIDATION/COUNTERFACTUAL and scored with recency, reliability, entity alignment, novelty, and causal orthogonality.',
    status: 'not-started',
    evidence: ['Current AphlaCognitionEngine is deterministic and keyword-based.'],
    nextStep: 'Add CausalNodeType, coverage profiles, novelty scoring, and orthogonality scoring to the ingestion pipeline.',
  },
  {
    id: 'V5-GAP-001',
    part: 'Causal Information Architecture',
    requirement: 'MeasurementGapAnalyzer generates daily gap reports and recommends specialist sources for missing signal types.',
    status: 'not-started',
    evidence: ['No MeasurementGapAnalyzer exists yet.'],
    nextStep: 'Implement gap analysis over tracked causal chains and connect it to source onboarding recommendations.',
  },
  {
    id: 'V5-REASON-001',
    part: 'Causal Reasoning Engine',
    requirement: 'Causal engine supports all-path chain strength, intervention simulation, root-cause reverse traversal, and mechanism metadata.',
    status: 'not-started',
    evidence: ['Current engine materializes simple facts but does not traverse a causal graph.'],
    nextStep: 'Add graph-backed CausalChainAnalyzer, CausalInterventionSimulator, and root-cause traversal APIs.',
  },
  {
    id: 'V5-GRAD-001',
    part: 'Evolution System',
    requirement: 'Weekly gradient report computes failure gradient, pipeline Jacobian bottleneck, edge entropy, ranked proposals, ROI, and risk.',
    status: 'in-progress',
    evidence: ['Creator gradient response derives a bottleneck from agent telemetry and proposes a failure-driven action.'],
    nextStep: 'Add explicit failure-gradient magnitudes, edge entropy rankings, proposal ROI math, and Sunday report scheduling.',
  },
  {
    id: 'V5-UI-001',
    part: 'Human Interface',
    requirement: 'Five-layer UI covers 30-second Today card, 5-minute causal argument, role-specific implications, track record, and provenance graph.',
    status: 'in-progress',
    evidence: ['App renders Today/Track Record-oriented User Product and Creator Product panels.'],
    nextStep: 'Add role-specific layer-3 implications and provenance graph traversal UI.',
  },
  {
    id: 'V5-SERVE-001',
    part: 'Provenance Browser',
    requirement: 'serve command exposes the 5-tab Provenance Browser and all PRD status/judgment/consensus/cascade/health/pending/gradient endpoints.',
    status: 'not-started',
    evidence: ['No serve command or HTTP API server exists in this repository.'],
    nextStep: 'Create the HTTP server, endpoint contracts, and browser tabs backed by persisted store queries.',
  },
  {
    id: 'V5-CLI-001',
    part: 'Annotate CLI',
    requirement: 'annotate command lists pending failures and writes root cause, trigger condition, and prevents-type metadata.',
    status: 'in-progress',
    evidence: ['annotateFailure API writes human_annotation and root_cause in memory.'],
    nextStep: 'Build interactive CLI flow and persist condition_text/prevents_type with audit data.',
  },
  {
    id: 'V5-CLI-002',
    part: 'Verify CLI',
    requirement: 'verify command records CONFIRMED/REFUTED/INCONCLUSIVE outcomes and triggers edge updates, source timing, and failure taxonomy writes.',
    status: 'in-progress',
    evidence: ['verifyPrediction writes verification_results, source_timing_records, edge_confidence_log, and prediction_failure_records in the creator API surface.'],
    nextStep: 'Expose verifyPrediction through CLI flags and persist writes through the durable database adapter.',
  },
  {
    id: 'V5-OPS-001',
    part: 'Setup & Configuration',
    requirement: 'config.example.toml supports MiniMax primary model, Kimi backup, feed URLs, output directory, and database path.',
    status: 'not-started',
    evidence: ['No config.example.toml exists yet.'],
    nextStep: 'Add configuration schema and example file, then wire it into pipeline startup.',
  },
  {
    id: 'V5-OPS-002',
    part: 'Complete CLI Reference',
    requirement: 'All 8 commands exist: run, serve, annotate, verify, gradient, health, cascade, and seed-info.',
    status: 'not-started',
    evidence: ['package.json has TypeScript check/report scripts but not the PRD command surface.'],
    nextStep: 'Add command dispatcher and implement each command against the persisted database.',
  },
  {
    id: 'V5-GOV-001',
    part: 'Governance',
    requirement: 'Human-machine collaboration calendar tracks daily, weekly, monthly, and quarterly review obligations.',
    status: 'not-started',
    evidence: ['No governance calendar or review queue exists yet.'],
    nextStep: 'Add governance task records and overdue checks for annotation, entity review, calibration review, and audits.',
  },
  {
    id: 'V5-DATA-001',
    part: 'Data Model',
    requirement: 'Durable database tables exist for irreversible value vectors and creator telemetry.',
    status: 'blocked',
    evidence: ['Current RenzeroDatabase is an in-memory seeded object with localStorage-style serialization only.'],
    nextStep: 'Choose SQLite/Postgres, add migrations, and replace seed-only persistence with durable adapters.',
  },
  {
    id: 'V5-METRICS-001',
    part: 'Success Metrics',
    requirement: 'Operational, calibration, causal signal quality, and evolution ROI metrics are computed and monitored.',
    status: 'not-started',
    evidence: ['Readiness assessment is static and demo-oriented.'],
    nextStep: 'Implement metric collectors for pipeline completion, annotation latency, calibration, edge stability, mechanism-signal rate, and ROI realization.',
  },
  {
    id: 'V5-RISK-001',
    part: 'Risk Register',
    requirement: 'Known risks have runtime mitigations, alerts, and review workflows.',
    status: 'not-started',
    evidence: ['Risk register is not represented in runtime data.'],
    nextStep: 'Add risk controls for consensus sampling, annotation backlog, edge oscillation, sparse source timing, and provider failover.',
  },
];

export const buildPrdV5CoverageReport = (): PrdV5CoverageReport => {
  const count = (status: PrdCoverageStatus) => prdV5Requirements.filter((item) => item.status === status).length;
  const openRequirements = prdV5Requirements.filter((item) => item.status !== 'implemented');

  return {
    version: 'v5.0',
    complete: openRequirements.length === 0,
    totalRequirements: prdV5Requirements.length,
    implemented: count('implemented'),
    inProgress: count('in-progress'),
    notStarted: count('not-started'),
    blocked: count('blocked'),
    mustNotStopUntil: openRequirements.map((item) => `${item.id}: ${item.requirement}`),
    requirements: prdV5Requirements,
  };
};

export type MissingCapabilityReport = {
  totalMissing: number;
  p0Missing: number;
  byPhase: Record<ImplementationPhase, ImplementationWorkItem[]>;
  nextThree: ImplementationWorkItem[];
  productionBlockers: string[];
};

export const buildMissingCapabilityReport = (plan: ImplementationPlan = buildImplementationPlan()): MissingCapabilityReport => {
  const missing = plan.workItems.filter((item) => item.status !== 'in-progress');
  const foundationStillOpen = plan.workItems.filter((item) => item.phase === 'foundation' && item.status !== 'in-progress');
  const creatorStillOpen = plan.workItems.filter((item) => item.phase === 'creator-mvp' && item.status !== 'in-progress');
  const userStillOpen = plan.workItems.filter((item) => item.phase === 'user-mvp' && item.status !== 'in-progress');
  const productionStillOpen = plan.workItems.filter((item) => item.phase === 'production-hardening' && item.status !== 'in-progress');

  return {
    totalMissing: missing.length,
    p0Missing: missing.filter((item) => item.priority === 'P0').length,
    byPhase: {
      foundation: foundationStillOpen,
      'creator-mvp': creatorStillOpen,
      'user-mvp': userStillOpen,
      'production-hardening': productionStillOpen,
    },
    nextThree: missing.slice(0, 3),
    productionBlockers: [
      ...foundationStillOpen.map((item) => `${item.id}: ${item.title}`),
      ...creatorStillOpen.map((item) => `${item.id}: ${item.title}`),
      ...userStillOpen.map((item) => `${item.id}: ${item.title}`),
      ...productionStillOpen.map((item) => `${item.id}: ${item.title}`),
    ],
  };
};
