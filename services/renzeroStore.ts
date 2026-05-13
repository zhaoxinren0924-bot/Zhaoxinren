import {
  buildCreatorProductSnapshot,
  buildUserProductSnapshot,
  userForbiddenTerms,
  type PipelineStep,
  type UserTodayCard,
} from './renzeroProductArchitecture.js';

export type JudgmentPackageRecord = {
  id: string;
  statement: string;
  alpha: [number, number, number];
  clarity: UserTodayCard['clarity'];
  evidence_ids: string[];
  published_at: string;
  creator_notes: string;
};

export type ConsensusSnapshotRecord = {
  id: string;
  judgment_id: string;
  snapshot_ts: string;
  consensus_statement: string;
  consensus_sources: string[];
  consensus_confidence: number;
  our_delta: UserTodayCard['consensusDelta'];
  direction: 'ABOVE' | 'BELOW' | 'ORTHOGONAL';
  falsification: string;
  falsification_date: string;
  falsification_metric: string;
  conflict_score: number;
};

export type VerificationResultRecord = {
  id: string;
  judgment_id: string;
  outcome: 'CONFIRMED' | 'REFUTED' | 'INCONCLUSIVE' | 'PENDING';
  lead_time_days: number;
  missed_alpha?: boolean;
  verified_at?: string;
};

export type SourceTimingRecord = {
  id: string;
  judgment_id: string;
  earliest_signal_source: string;
  earliest_signal_ts: string;
  market_consensus_ts: string;
  lead_days: number;
  topic_layer: SourceLayer;
};

export type SourceTimingAggregateRecord = {
  id: string;
  source: string;
  layer: SourceLayer;
  sample_count: number;
  median_lead_days: number;
  p25_lead_days: number;
  p75_lead_days: number;
  timing_premium: number;
};

export type SourceLayer =
  | 'L0_ENERGY'
  | 'L1_DEMAND'
  | 'L2_SUPPLY'
  | 'L3_HARDWARE'
  | 'L4_ECONOMICS'
  | 'L5_POLICY_CAPITAL';

export type SourceCatalogRecord = {
  id: string;
  name: string;
  layer: SourceLayer;
  category:
    | 'media'
    | 'supplier-check'
    | 'market-consensus'
    | 'expert-review'
    | 'company-disclosure'
    | 'regulatory'
    | 'technical-benchmark'
    | 'financial-filing'
    | 'developer-signal'
    | 'procurement-signal'
    | 'utility-disclosure'
    | 'grid-operator';
  reliability: number;
  userVisible: boolean;
  evidenceIds: string[];
  notes: string;
};

export type PredictionFailureRecord = {
  id: string;
  judgment_id: string;
  failure_type: 'TIMING' | 'DIRECTION' | 'MAGNITUDE' | 'SCOPE' | 'CONSENSUS' | 'SIGNAL';
  human_annotation?: string;
  root_cause?: string;
  condition_text?: string;
  prevents_type?: string;
  causal_chain_iris?: string[];
};

export type EdgeConfidenceLogRecord = {
  id: string;
  edge: string;
  old_confidence: number;
  new_confidence: number;
  p: number;
  n_verifications: number;
  rule_applied: 'natural_gradient_confirmed' | 'natural_gradient_refuted' | 'manual_audit';
  updated_at: string;
};

export type AgentTelemetryRecord = {
  id: string;
  agent: string;
  failure_rate: number;
  output_variance: number;
  calls_7d: number;
};

export type ActiveLearningDesignRecord = {
  id: string;
  source_target: string;
  horizon_days: number;
  eig_bits: number;
  verification_source: string;
};

export type ModelConfigRecord = {
  id: string;
  role: 'Critical' | 'Standard' | 'Fast';
  provider: string;
  model: string;
  max_cost_per_run_usd: number;
};

export type PipelineRunRecord = {
  id: string;
  started_at: string;
  completed_at: string;
  status: 'pass' | 'fail';
  summary: string;
};

export type RenzeroDatabase = {
  pipeline_runs: PipelineRunRecord[];
  source_catalog: SourceCatalogRecord[];
  judgment_packages: JudgmentPackageRecord[];
  consensus_snapshots: ConsensusSnapshotRecord[];
  verification_results: VerificationResultRecord[];
  source_timing_records: SourceTimingRecord[];
  source_timing_aggregates: SourceTimingAggregateRecord[];
  prediction_failure_records: PredictionFailureRecord[];
  edge_confidence_log: EdgeConfidenceLogRecord[];
  agent_telemetry: AgentTelemetryRecord[];
  active_learning_designs: ActiveLearningDesignRecord[];
  model_configs: ModelConfigRecord[];
  pipeline_run_steps: PipelineStep[];
};

export type UserReadModel = {
  sources: Array<Pick<SourceCatalogRecord, 'name' | 'layer' | 'category' | 'reliability'> & { median_lead_days?: number }>;
  latestJudgment: Pick<JudgmentPackageRecord, 'id' | 'statement' | 'alpha' | 'clarity' | 'evidence_ids' | 'published_at'>;
  consensusSnapshot: Pick<ConsensusSnapshotRecord, 'consensus_statement' | 'our_delta' | 'direction' | 'falsification' | 'falsification_date' | 'falsification_metric'>;
  trackRecord: {
    aggregate_accuracy: number;
    aggregate_lead_time: number;
    recent_outcomes: Array<Pick<VerificationResultRecord, 'judgment_id' | 'outcome' | 'lead_time_days'>>;
  };
  sourceTiming: Array<Pick<SourceTimingAggregateRecord, 'source' | 'layer' | 'sample_count' | 'median_lead_days' | 'timing_premium'>>;
  failureDistribution: Record<PredictionFailureRecord['failure_type'], number>;
};

export type CreatorReadModel = RenzeroDatabase;

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const STORE_KEY = 'renzero_brain_store_v1';

export const createSeedRenzeroDatabase = (): RenzeroDatabase => {
  const user = buildUserProductSnapshot();
  const creator = buildCreatorProductSnapshot();

  return {
    pipeline_runs: [
      {
        id: 'run-2026-05-09-daily',
        started_at: '2026-05-09T08:00:00.000Z',
        completed_at: '2026-05-09T08:01:38.000Z',
        status: 'pass',
        summary: 'Daily run completed: 53 ingested signals, 41 scored, 1 judgment package published.',
      },
    ],
    source_catalog: [
      {
        id: 'src-eia-power-demand',
        name: 'EIA power demand monitor',
        layer: 'L0_ENERGY',
        category: 'regulatory',
        reliability: 0.84,
        userVisible: true,
        evidenceIds: ['ev-eia-power-demand'],
        notes: 'Public electricity demand baseline for AI data center load growth.',
      },
      {
        id: 'src-ercot-interconnection',
        name: 'ERCOT interconnection queue',
        layer: 'L0_ENERGY',
        category: 'grid-operator',
        reliability: 0.82,
        userVisible: true,
        evidenceIds: ['ev-ercot-interconnection'],
        notes: 'Public grid interconnection queue signal for new compute load.',
      },
      {
        id: 'src-pjm-load-forecast',
        name: 'PJM load forecast updates',
        layer: 'L0_ENERGY',
        category: 'grid-operator',
        reliability: 0.81,
        userVisible: true,
        evidenceIds: ['ev-pjm-load-forecast'],
        notes: 'Public regional transmission operator demand signal.',
      },
      {
        id: 'src-utility-rate-cases',
        name: 'Utility rate case AI load mentions',
        layer: 'L0_ENERGY',
        category: 'utility-disclosure',
        reliability: 0.79,
        userVisible: true,
        evidenceIds: ['ev-utility-rate-cases'],
        notes: 'Public regulated utility filings that mention data center load.',
      },
      {
        id: 'src-data-center-ppa',
        name: 'Data center PPA contract monitor',
        layer: 'L0_ENERGY',
        category: 'procurement-signal',
        reliability: 0.83,
        userVisible: false,
        evidenceIds: ['ev-data-center-ppa'],
        notes: 'Creator-only power purchase agreement channel checks.',
      },
      {
        id: 'src-transformer-leadtime',
        name: 'Grid transformer lead-time panel',
        layer: 'L0_ENERGY',
        category: 'supplier-check',
        reliability: 0.8,
        userVisible: false,
        evidenceIds: ['ev-transformer-leadtime'],
        notes: 'Creator-only grid equipment bottleneck signal.',
      },
      {
        id: 'src-natural-gas-basis',
        name: 'Natural gas basis monitor',
        layer: 'L0_ENERGY',
        category: 'market-consensus',
        reliability: 0.74,
        userVisible: true,
        evidenceIds: ['ev-natural-gas-basis'],
        notes: 'Public fuel-cost proxy for incremental power generation economics.',
      },
      {
        id: 'src-nuclear-restart-tracker',
        name: 'Nuclear restart and uprate tracker',
        layer: 'L0_ENERGY',
        category: 'regulatory',
        reliability: 0.78,
        userVisible: true,
        evidenceIds: ['ev-nuclear-restart-tracker'],
        notes: 'Public regulatory signal for firm clean power availability.',
      },
      {
        id: 'src-renewable-curtailment',
        name: 'Renewable curtailment and congestion index',
        layer: 'L0_ENERGY',
        category: 'grid-operator',
        reliability: 0.73,
        userVisible: true,
        evidenceIds: ['ev-renewable-curtailment'],
        notes: 'Public grid congestion signal for power siting constraints.',
      },
      {
        id: 'src-private-utility-checks',
        name: 'Private utility load-service checks',
        layer: 'L0_ENERGY',
        category: 'expert-review',
        reliability: 0.85,
        userVisible: false,
        evidenceIds: ['ev-private-utility-checks'],
        notes: 'Creator-only utility interviews on data center energization timelines.',
      },
      {
        id: 'src-nikkei',
        name: 'Nikkei Asia',
        layer: 'L1_DEMAND',
        category: 'media',
        reliability: 0.82,
        userVisible: true,
        evidenceIds: ['ev-cowos-leadtime'],
        notes: 'External publication used for falsification checks and lead-time context.',
      },
      {
        id: 'src-digitimes',
        name: 'Digitimes',
        layer: 'L1_DEMAND',
        category: 'media',
        reliability: 0.78,
        userVisible: true,
        evidenceIds: ['ev-digitimes-supplier'],
        notes: 'External supplier reporting used for timing and qualification checks.',
      },
      {
        id: 'src-gartner-ai-infra',
        name: 'Gartner AI Infrastructure Forecast',
        layer: 'L1_DEMAND',
        category: 'market-consensus',
        reliability: 0.8,
        userVisible: true,
        evidenceIds: ['ev-gartner-ai-infra'],
        notes: 'Market forecast baseline for demand and consensus lag.',
      },
      {
        id: 'src-idc-server-tracker',
        name: 'IDC Server Tracker',
        layer: 'L1_DEMAND',
        category: 'market-consensus',
        reliability: 0.79,
        userVisible: true,
        evidenceIds: ['ev-idc-server-tracker'],
        notes: 'Quarterly server demand and deployment signal.',
      },
      {
        id: 'src-cloud-spend-survey',
        name: 'Enterprise Cloud Spend Survey',
        layer: 'L1_DEMAND',
        category: 'expert-review',
        reliability: 0.76,
        userVisible: true,
        evidenceIds: ['ev-cloud-spend-survey'],
        notes: 'Aggregated expert survey for AI capex appetite.',
      },
      {
        id: 'src-hyperscaler-procurement',
        name: 'Hyperscaler procurement pulse',
        layer: 'L1_DEMAND',
        category: 'procurement-signal',
        reliability: 0.88,
        userVisible: false,
        evidenceIds: ['ev-hyperscaler-procurement'],
        notes: 'Creator-only procurement channel checks.',
      },
      {
        id: 'src-gpu-backlog-panel',
        name: 'GPU backlog expert panel',
        layer: 'L1_DEMAND',
        category: 'expert-review',
        reliability: 0.84,
        userVisible: false,
        evidenceIds: ['ev-gpu-backlog-panel'],
        notes: 'Creator-only analyst interviews on backlog quality.',
      },
      {
        id: 'src-reseller-quote-index',
        name: 'AI server reseller quote index',
        layer: 'L1_DEMAND',
        category: 'procurement-signal',
        reliability: 0.77,
        userVisible: false,
        evidenceIds: ['ev-reseller-quote-index'],
        notes: 'Creator-only quote dispersion monitor.',
      },
      {
        id: 'src-bloomberg-ai-capex',
        name: 'Bloomberg AI capex transcript monitor',
        layer: 'L1_DEMAND',
        category: 'media',
        reliability: 0.81,
        userVisible: true,
        evidenceIds: ['ev-bloomberg-ai-capex'],
        notes: 'Public transcript and news signal for capex revisions.',
      },
      {
        id: 'src-sec-ai-capex-mentions',
        name: 'SEC AI capex mentions',
        layer: 'L1_DEMAND',
        category: 'financial-filing',
        reliability: 0.83,
        userVisible: true,
        evidenceIds: ['ev-sec-ai-capex-mentions'],
        notes: 'Public filing mentions for demand-side capex commitments.',
      },
      {
        id: 'src-samsung-soic',
        name: 'Samsung SoIC supplier check',
        layer: 'L2_SUPPLY',
        category: 'supplier-check',
        reliability: 0.86,
        userVisible: false,
        evidenceIds: ['ev-samsung-soic'],
        notes: 'Creator-only source detail; summarized to users as supporting supplier checks.',
      },
      {
        id: 'src-tsmc-cowos-capacity',
        name: 'TSMC CoWoS capacity tracker',
        layer: 'L2_SUPPLY',
        category: 'company-disclosure',
        reliability: 0.87,
        userVisible: true,
        evidenceIds: ['ev-tsmc-cowos-capacity'],
        notes: 'Public capacity and packaging expansion disclosures.',
      },
      {
        id: 'src-ase-capex-watch',
        name: 'ASE packaging capex watch',
        layer: 'L2_SUPPLY',
        category: 'company-disclosure',
        reliability: 0.8,
        userVisible: true,
        evidenceIds: ['ev-ase-capex-watch'],
        notes: 'Public OSAT capacity signal.',
      },
      {
        id: 'src-umc-substrate-check',
        name: 'ABF substrate supplier check',
        layer: 'L2_SUPPLY',
        category: 'supplier-check',
        reliability: 0.82,
        userVisible: false,
        evidenceIds: ['ev-abf-substrate-check'],
        notes: 'Creator-only substrate channel verification.',
      },
      {
        id: 'src-hbm-supply-pulse',
        name: 'HBM supplier allocation pulse',
        layer: 'L2_SUPPLY',
        category: 'supplier-check',
        reliability: 0.85,
        userVisible: false,
        evidenceIds: ['ev-hbm-supply-pulse'],
        notes: 'Creator-only HBM allocation checks.',
      },
      {
        id: 'src-sk-hynix-earnings',
        name: 'SK Hynix earnings commentary',
        layer: 'L2_SUPPLY',
        category: 'company-disclosure',
        reliability: 0.82,
        userVisible: true,
        evidenceIds: ['ev-sk-hynix-earnings'],
        notes: 'Public memory supplier commentary.',
      },
      {
        id: 'src-micron-earnings',
        name: 'Micron earnings commentary',
        layer: 'L2_SUPPLY',
        category: 'company-disclosure',
        reliability: 0.81,
        userVisible: true,
        evidenceIds: ['ev-micron-earnings'],
        notes: 'Public memory supply and pricing commentary.',
      },
      {
        id: 'src-trendforce-hbm',
        name: 'TrendForce HBM tracker',
        layer: 'L2_SUPPLY',
        category: 'market-consensus',
        reliability: 0.78,
        userVisible: true,
        evidenceIds: ['ev-trendforce-hbm'],
        notes: 'Market estimate for HBM supply-demand balance.',
      },
      {
        id: 'src-customs-advanced-packaging',
        name: 'Advanced packaging customs flow',
        layer: 'L2_SUPPLY',
        category: 'procurement-signal',
        reliability: 0.76,
        userVisible: false,
        evidenceIds: ['ev-customs-advanced-packaging'],
        notes: 'Creator-only shipping and customs proxy.',
      },
      {
        id: 'src-tool-delivery-leadtime',
        name: 'Packaging tool delivery lead-time panel',
        layer: 'L2_SUPPLY',
        category: 'supplier-check',
        reliability: 0.83,
        userVisible: false,
        evidenceIds: ['ev-tool-delivery-leadtime'],
        notes: 'Creator-only equipment lead-time signal.',
      },
      {
        id: 'src-nvidia-datacenter',
        name: 'NVIDIA data center disclosures',
        layer: 'L3_HARDWARE',
        category: 'company-disclosure',
        reliability: 0.89,
        userVisible: true,
        evidenceIds: ['ev-nvidia-datacenter'],
        notes: 'Public hardware demand and supply disclosure.',
      },
      {
        id: 'src-amd-instinct',
        name: 'AMD Instinct roadmap disclosures',
        layer: 'L3_HARDWARE',
        category: 'company-disclosure',
        reliability: 0.84,
        userVisible: true,
        evidenceIds: ['ev-amd-instinct'],
        notes: 'Public accelerator roadmap and supply commentary.',
      },
      {
        id: 'src-oam-board-supplier',
        name: 'OAM board supplier check',
        layer: 'L3_HARDWARE',
        category: 'supplier-check',
        reliability: 0.82,
        userVisible: false,
        evidenceIds: ['ev-oam-board-supplier'],
        notes: 'Creator-only board and module channel check.',
      },
      {
        id: 'src-serdes-benchmark',
        name: 'SerDes and interconnect benchmark feed',
        layer: 'L3_HARDWARE',
        category: 'technical-benchmark',
        reliability: 0.78,
        userVisible: true,
        evidenceIds: ['ev-serdes-benchmark'],
        notes: 'Public technical benchmark source.',
      },
      {
        id: 'src-mlperf-training',
        name: 'MLPerf Training results',
        layer: 'L3_HARDWARE',
        category: 'technical-benchmark',
        reliability: 0.86,
        userVisible: true,
        evidenceIds: ['ev-mlperf-training'],
        notes: 'Public performance benchmark for training economics.',
      },
      {
        id: 'src-server-oem-backlog',
        name: 'Server OEM backlog channel',
        layer: 'L3_HARDWARE',
        category: 'supplier-check',
        reliability: 0.83,
        userVisible: false,
        evidenceIds: ['ev-server-oem-backlog'],
        notes: 'Creator-only OEM backlog check.',
      },
      {
        id: 'src-pcie-retimer-supply',
        name: 'PCIe retimer supply pulse',
        layer: 'L3_HARDWARE',
        category: 'supplier-check',
        reliability: 0.75,
        userVisible: false,
        evidenceIds: ['ev-pcie-retimer-supply'],
        notes: 'Creator-only component bottleneck indicator.',
      },
      {
        id: 'src-cooling-vendor-pulse',
        name: 'Liquid cooling vendor pulse',
        layer: 'L3_HARDWARE',
        category: 'supplier-check',
        reliability: 0.79,
        userVisible: false,
        evidenceIds: ['ev-cooling-vendor-pulse'],
        notes: 'Creator-only rack-scale cooling signal.',
      },
      {
        id: 'src-supermicro-filings',
        name: 'Supermicro filings and commentary',
        layer: 'L3_HARDWARE',
        category: 'financial-filing',
        reliability: 0.8,
        userVisible: true,
        evidenceIds: ['ev-supermicro-filings'],
        notes: 'Public server OEM filing signal.',
      },
      {
        id: 'src-dell-ai-server',
        name: 'Dell AI server commentary',
        layer: 'L3_HARDWARE',
        category: 'company-disclosure',
        reliability: 0.79,
        userVisible: true,
        evidenceIds: ['ev-dell-ai-server'],
        notes: 'Public enterprise AI server signal.',
      },
      {
        id: 'src-cloud-gpu-pricing',
        name: 'Cloud GPU spot pricing index',
        layer: 'L4_ECONOMICS',
        category: 'market-consensus',
        reliability: 0.76,
        userVisible: true,
        evidenceIds: ['ev-cloud-gpu-pricing'],
        notes: 'Public pricing proxy for accelerator scarcity.',
      },
      {
        id: 'src-training-cost-benchmark',
        name: 'Training cost benchmark panel',
        layer: 'L4_ECONOMICS',
        category: 'technical-benchmark',
        reliability: 0.81,
        userVisible: true,
        evidenceIds: ['ev-training-cost-benchmark'],
        notes: 'Public model training cost benchmark.',
      },
      {
        id: 'src-open-model-release-cadence',
        name: 'Open model release cadence',
        layer: 'L4_ECONOMICS',
        category: 'developer-signal',
        reliability: 0.74,
        userVisible: true,
        evidenceIds: ['ev-open-model-release-cadence'],
        notes: 'Developer ecosystem pace signal.',
      },
      {
        id: 'src-github-ai-infra-stars',
        name: 'GitHub AI infra momentum',
        layer: 'L4_ECONOMICS',
        category: 'developer-signal',
        reliability: 0.7,
        userVisible: true,
        evidenceIds: ['ev-github-ai-infra-stars'],
        notes: 'Public developer adoption proxy.',
      },
      {
        id: 'src-arxiv-scaling-papers',
        name: 'arXiv scaling-law paper monitor',
        layer: 'L4_ECONOMICS',
        category: 'technical-benchmark',
        reliability: 0.73,
        userVisible: true,
        evidenceIds: ['ev-arxiv-scaling-papers'],
        notes: 'Public research signal for compute intensity.',
      },
      {
        id: 'src-private-training-budget',
        name: 'Private training budget checks',
        layer: 'L4_ECONOMICS',
        category: 'expert-review',
        reliability: 0.84,
        userVisible: false,
        evidenceIds: ['ev-private-training-budget'],
        notes: 'Creator-only buyer interview signal.',
      },
      {
        id: 'src-token-price-monitor',
        name: 'Inference token price monitor',
        layer: 'L4_ECONOMICS',
        category: 'market-consensus',
        reliability: 0.77,
        userVisible: true,
        evidenceIds: ['ev-token-price-monitor'],
        notes: 'Public inference price compression signal.',
      },
      {
        id: 'src-energy-ppa-checks',
        name: 'AI data center PPA checks',
        layer: 'L4_ECONOMICS',
        category: 'supplier-check',
        reliability: 0.82,
        userVisible: false,
        evidenceIds: ['ev-energy-ppa-checks'],
        notes: 'Creator-only power procurement bottleneck signal.',
      },
      {
        id: 'src-cloud-margin-commentary',
        name: 'Cloud gross margin commentary',
        layer: 'L4_ECONOMICS',
        category: 'financial-filing',
        reliability: 0.79,
        userVisible: true,
        evidenceIds: ['ev-cloud-margin-commentary'],
        notes: 'Public margin pressure signal.',
      },
      {
        id: 'src-colocation-leasing',
        name: 'Colocation leasing channel checks',
        layer: 'L4_ECONOMICS',
        category: 'supplier-check',
        reliability: 0.81,
        userVisible: false,
        evidenceIds: ['ev-colocation-leasing'],
        notes: 'Creator-only data center capacity signal.',
      },
      {
        id: 'src-us-export-controls',
        name: 'US export control updates',
        layer: 'L5_POLICY_CAPITAL',
        category: 'regulatory',
        reliability: 0.9,
        userVisible: true,
        evidenceIds: ['ev-us-export-controls'],
        notes: 'Public regulatory constraint source.',
      },
      {
        id: 'src-bis-entity-list',
        name: 'BIS Entity List monitor',
        layer: 'L5_POLICY_CAPITAL',
        category: 'regulatory',
        reliability: 0.92,
        userVisible: true,
        evidenceIds: ['ev-bis-entity-list'],
        notes: 'Public restriction and licensing signal.',
      },
      {
        id: 'src-eu-ai-act',
        name: 'EU AI Act implementation tracker',
        layer: 'L5_POLICY_CAPITAL',
        category: 'regulatory',
        reliability: 0.78,
        userVisible: true,
        evidenceIds: ['ev-eu-ai-act'],
        notes: 'Public policy implementation signal.',
      },
      {
        id: 'src-china-gpu-procurement',
        name: 'China GPU procurement tender monitor',
        layer: 'L5_POLICY_CAPITAL',
        category: 'procurement-signal',
        reliability: 0.8,
        userVisible: false,
        evidenceIds: ['ev-china-gpu-procurement'],
        notes: 'Creator-only tender aggregation signal.',
      },
      {
        id: 'src-taiwan-power-policy',
        name: 'Taiwan power policy monitor',
        layer: 'L5_POLICY_CAPITAL',
        category: 'regulatory',
        reliability: 0.76,
        userVisible: true,
        evidenceIds: ['ev-taiwan-power-policy'],
        notes: 'Public infrastructure policy signal.',
      },
      {
        id: 'src-japan-subsidy',
        name: 'Japan semiconductor subsidy tracker',
        layer: 'L5_POLICY_CAPITAL',
        category: 'regulatory',
        reliability: 0.75,
        userVisible: true,
        evidenceIds: ['ev-japan-subsidy'],
        notes: 'Public industrial policy funding signal.',
      },
      {
        id: 'src-sec-risk-factors',
        name: 'SEC AI risk factor monitor',
        layer: 'L5_POLICY_CAPITAL',
        category: 'financial-filing',
        reliability: 0.82,
        userVisible: true,
        evidenceIds: ['ev-sec-risk-factors'],
        notes: 'Public filing risk disclosures.',
      },
      {
        id: 'src-credit-spread-ai',
        name: 'AI infrastructure credit spread monitor',
        layer: 'L5_POLICY_CAPITAL',
        category: 'market-consensus',
        reliability: 0.74,
        userVisible: true,
        evidenceIds: ['ev-credit-spread-ai'],
        notes: 'Public capital markets risk proxy.',
      },
      {
        id: 'src-private-policy-counsel',
        name: 'Private policy counsel checks',
        layer: 'L5_POLICY_CAPITAL',
        category: 'expert-review',
        reliability: 0.83,
        userVisible: false,
        evidenceIds: ['ev-private-policy-counsel'],
        notes: 'Creator-only regulatory interpretation signal.',
      },
      {
        id: 'src-sovereign-ai-tenders',
        name: 'Sovereign AI tender monitor',
        layer: 'L5_POLICY_CAPITAL',
        category: 'procurement-signal',
        reliability: 0.79,
        userVisible: true,
        evidenceIds: ['ev-sovereign-ai-tenders'],
        notes: 'Public procurement signal for sovereign demand.',
      },
    ],
    judgment_packages: [
      {
        id: 'jp-2026-05-09-ai-infra',
        statement: user.today.headline,
        alpha: user.today.alphaBand,
        clarity: user.today.clarity,
        evidence_ids: ['ev-samsung-soic', 'ev-cowos-leadtime', 'ev-digitimes-supplier'],
        published_at: '2026-05-09T09:00:00.000Z',
        creator_notes: 'Internal note: monitor packaging qualification and consensus lag before next publication.',
      },
    ],
    consensus_snapshots: [
      {
        id: 'cs-2026-05-09-ai-infra',
        judgment_id: 'jp-2026-05-09-ai-infra',
        snapshot_ts: '2026-05-09T08:58:00.000Z',
        consensus_statement: 'Consensus still expects AI infrastructure supply tightness to persist through Q2.',
        consensus_sources: ['Nikkei Asia', 'Digitimes', 'Bloomberg AI capex transcript monitor'],
        consensus_confidence: 0.74,
        our_delta: user.today.consensusDelta,
        direction: user.today.consensusDelta,
        falsification: user.today.falsification,
        falsification_date: '2026-05-30',
        falsification_metric: 'Supplier-reported H200/B200 packaging lead-time movement versus market consensus.',
        conflict_score: 0.18,
      },
    ],
    verification_results: [
      { id: 'vr-cowos', judgment_id: 'jp-cowos-relief', outcome: 'CONFIRMED', lead_time_days: 16, missed_alpha: false, verified_at: '2026-04-12T00:00:00.000Z' },
      { id: 'vr-hbm3e', judgment_id: 'jp-hbm3e-timing', outcome: 'REFUTED', lead_time_days: 5, missed_alpha: true, verified_at: '2026-04-20T00:00:00.000Z' },
      { id: 'vr-b200', judgment_id: 'jp-b200-delay', outcome: 'CONFIRMED', lead_time_days: 21, missed_alpha: false, verified_at: '2026-05-01T00:00:00.000Z' },
    ],
    source_timing_records: [
      {
        id: 'str-cowos-nikkei',
        judgment_id: 'jp-cowos-relief',
        earliest_signal_source: 'Nikkei Asia',
        earliest_signal_ts: '2026-03-27T00:00:00.000Z',
        market_consensus_ts: '2026-04-12T00:00:00.000Z',
        lead_days: 16,
        topic_layer: 'L2_SUPPLY',
      },
      {
        id: 'str-b200-digitimes',
        judgment_id: 'jp-b200-delay',
        earliest_signal_source: 'Digitimes',
        earliest_signal_ts: '2026-04-10T00:00:00.000Z',
        market_consensus_ts: '2026-05-01T00:00:00.000Z',
        lead_days: 21,
        topic_layer: 'L3_HARDWARE',
      },
    ],
    source_timing_aggregates: [
      { id: 'sta-nikkei-l2', source: 'Nikkei Asia', layer: 'L2_SUPPLY', sample_count: 18, median_lead_days: 14, p25_lead_days: 9, p75_lead_days: 18, timing_premium: 1.47 },
      { id: 'sta-digitimes-l3', source: 'Digitimes', layer: 'L3_HARDWARE', sample_count: 22, median_lead_days: 11, p25_lead_days: 7, p75_lead_days: 16, timing_premium: 1.37 },
    ],
    prediction_failure_records: [
      {
        id: 'pf-hbm3e',
        judgment_id: 'jp-hbm3e-timing',
        failure_type: 'TIMING',
        human_annotation: 'Timing miss by five days.',
        root_cause: 'Supplier qualification window too narrow.',
        condition_text: 'Samsung SoIC qualification entered NVIDIA review earlier than expected.',
        prevents_type: 'Overly narrow packaging bottleneck timing windows.',
        causal_chain_iris: ['iri:tsmc-cowos', 'iri:hbm3e', 'iri:h200-lead-time'],
      },
      { id: 'pf-scope', judgment_id: 'jp-scope-test', failure_type: 'SCOPE', causal_chain_iris: ['iri:tsmc-cowos', 'iri:samsung-soic'] },
    ],
    edge_confidence_log: [
      {
        id: 'ec-packaging-training-cost',
        edge: 'L2 packaging relief -> L3 training cost pressure',
        old_confidence: 0.71,
        new_confidence: 0.76,
        p: 0.76,
        n_verifications: 4,
        rule_applied: 'natural_gradient_confirmed',
        updated_at: '2026-05-09T08:30:00.000Z',
      },
    ],
    agent_telemetry: [
      { id: 'at-critic', agent: 'CriticAgent', failure_rate: 0.12, output_variance: 0.31, calls_7d: 48 },
    ],
    active_learning_designs: [
      { id: 'al-soic', source_target: 'Samsung SoIC -> AI accelerator packaging relief', horizon_days: 21, eig_bits: 0.08, verification_source: 'Digitimes supplier check' },
    ],
    model_configs: [
      { id: 'mc-critical', role: 'Critical', provider: 'operator-configured', model: 'critical-reasoner', max_cost_per_run_usd: 4.5 },
    ],
    pipeline_run_steps: creator.pipeline.map((step) => ({
      ...step,
      suggestedAction: step.status === 'fail' ? 'Open the failed step log and rerun after correcting the input.' : 'No action required.',
    })),
  };
};

const latestByPublishedAt = (records: JudgmentPackageRecord[]) =>
  [...records].sort((left, right) => right.published_at.localeCompare(left.published_at))[0];

const countFailures = (records: PredictionFailureRecord[]) =>
  records.reduce<Record<PredictionFailureRecord['failure_type'], number>>(
    (counts, record) => ({ ...counts, [record.failure_type]: counts[record.failure_type] + 1 }),
    { TIMING: 0, DIRECTION: 0, MAGNITUDE: 0, SCOPE: 0, CONSENSUS: 0, SIGNAL: 0 },
  );

export const buildUserReadModel = (database: RenzeroDatabase): UserReadModel => {
  const latestJudgment = latestByPublishedAt(database.judgment_packages);
  const consensusSnapshot = database.consensus_snapshots.find((snapshot) => snapshot.judgment_id === latestJudgment.id);
  if (!consensusSnapshot) {
    throw new Error(`Missing consensus snapshot for ${latestJudgment.id}`);
  }

  const completedVerifications = database.verification_results.filter((record) => record.outcome === 'CONFIRMED' || record.outcome === 'REFUTED');
  const confirmedCount = completedVerifications.filter((record) => record.outcome === 'CONFIRMED').length;
  const aggregate_accuracy = completedVerifications.length === 0 ? 0 : Math.round((confirmedCount / completedVerifications.length) * 100);
  const aggregate_lead_time =
    completedVerifications.length === 0
      ? 0
      : Math.round(completedVerifications.reduce((sum, record) => sum + record.lead_time_days, 0) / completedVerifications.length);

  const sourceTimingByName = new Map(database.source_timing_aggregates.map((record) => [record.source, record.median_lead_days]));

  return {
    sources: database.source_catalog
      .filter((source) => source.userVisible)
      .map(({ name, layer, category, reliability }) => ({
        name,
        layer,
        category,
        reliability,
        median_lead_days: sourceTimingByName.get(name),
      })),
    latestJudgment: {
      id: latestJudgment.id,
      statement: latestJudgment.statement,
      alpha: latestJudgment.alpha,
      clarity: latestJudgment.clarity,
      evidence_ids: latestJudgment.evidence_ids,
      published_at: latestJudgment.published_at,
    },
    consensusSnapshot: {
      consensus_statement: consensusSnapshot.consensus_statement,
      our_delta: consensusSnapshot.our_delta,
      direction: consensusSnapshot.direction,
      falsification: consensusSnapshot.falsification,
      falsification_date: consensusSnapshot.falsification_date,
      falsification_metric: consensusSnapshot.falsification_metric,
    },
    trackRecord: {
      aggregate_accuracy,
      aggregate_lead_time,
      recent_outcomes: completedVerifications.slice(-10).map(({ judgment_id, outcome, lead_time_days }) => ({ judgment_id, outcome, lead_time_days })),
    },
    sourceTiming: database.source_timing_aggregates.map(({ source, layer, sample_count, median_lead_days, timing_premium }) => ({ source, layer, sample_count, median_lead_days, timing_premium })),
    failureDistribution: countFailures(database.prediction_failure_records),
  };
};

export const buildCreatorReadModel = (database: RenzeroDatabase): CreatorReadModel => database;

export const assertUserReadModelSafe = (view: UserReadModel) => {
  const serialized = JSON.stringify(view).toLowerCase();
  const forbiddenTermHits = userForbiddenTerms.filter((term) => serialized.includes(term));
  const hiddenTableHits = ['edge_confidence_log', 'agent_telemetry', 'source_timing_records', 'active_learning_designs', 'model_configs', 'consensus_validations'].filter((table) =>
    serialized.includes(table),
  );

  return {
    ok: forbiddenTermHits.length === 0 && hiddenTableHits.length === 0,
    forbiddenTermHits,
    hiddenTableHits,
  };
};

export const saveRenzeroDatabase = (database: RenzeroDatabase, storage: StorageLike) => {
  storage.setItem(STORE_KEY, JSON.stringify(database));
};

export const loadRenzeroDatabase = (storage?: StorageLike): RenzeroDatabase => {
  if (!storage) return createSeedRenzeroDatabase();
  const stored = storage.getItem(STORE_KEY);
  if (!stored) {
    const seeded = createSeedRenzeroDatabase();
    saveRenzeroDatabase(seeded, storage);
    return seeded;
  }
  return JSON.parse(stored) as RenzeroDatabase;
};
