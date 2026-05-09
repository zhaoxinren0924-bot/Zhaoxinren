import { buildCreatorProductSnapshot } from './renzeroProductArchitecture.js';
import {
  assertUserReadModelSafe,
  buildCreatorReadModel,
  buildUserReadModel,
  type PredictionFailureRecord,
  type RenzeroDatabase,
  type SourceCatalogRecord,
  type UserReadModel,
} from './renzeroStore.js';

export type ApiAudience = 'user' | 'creator';

export type ApiSession = {
  audience: ApiAudience;
  subject: string;
  issuedAt: string;
};

export type UserTodayResponse = {
  judgmentId: string;
  clarity: UserReadModel['latestJudgment']['clarity'];
  headline: string;
  consensusDelta: UserReadModel['consensusSnapshot']['our_delta'];
  alphaBand: UserReadModel['latestJudgment']['alpha'];
  falsification: string;
  falsificationDate: string;
  falsificationMetric: string;
  evidenceCount: number;
  publishedAt: string;
};

export type UserTrackRecordResponse = UserReadModel['trackRecord'];
export type UserSourcesResponse = UserReadModel['sources'];
export type CreatorSourcesResponse = SourceCatalogRecord[];

export type CreatorAnnotationGate = {
  unannotatedFailures: number;
  status: 'clear' | 'warn' | 'blocked';
  message: string;
};

export type CreatorPipelineResponse = {
  run: RenzeroDatabase['pipeline_runs'][number];
  steps: RenzeroDatabase['pipeline_run_steps'];
  annotationGate: CreatorAnnotationGate;
  health: {
    failedSteps: number;
    totalSignals: number;
    totalDurationSeconds: number;
  };
};

export type CreatorMaturityResponse = ReturnType<typeof buildCreatorProductSnapshot>['maturity'];
export type CreatorGradientResponse = ReturnType<typeof buildCreatorProductSnapshot>['gradient'];

export type CreatorInternalsResponse = Pick<
  RenzeroDatabase,
  'edge_confidence_log' | 'agent_telemetry' | 'active_learning_designs' | 'model_configs' | 'source_timing_aggregates'
>;

export const createUserSession = (subject: string): ApiSession => ({
  audience: 'user',
  subject,
  issuedAt: new Date().toISOString(),
});

export const createCreatorSession = (subject: string): ApiSession => ({
  audience: 'creator',
  subject,
  issuedAt: new Date().toISOString(),
});

const requireAudience = (session: ApiSession, audience: ApiAudience) => {
  if (session.audience !== audience) {
    throw new Error(`Forbidden: ${session.audience} session cannot access ${audience} API`);
  }
};

const buildAnnotationGate = (database: RenzeroDatabase): CreatorAnnotationGate => {
  const unannotatedFailures = database.prediction_failure_records.filter((record) => !record.human_annotation || !record.root_cause).length;
  if (unannotatedFailures >= 10) {
    return {
      unannotatedFailures,
      status: 'blocked',
      message: 'BLOCKED — judgment publication halted until failures are annotated.',
    };
  }
  if (unannotatedFailures >= 5) {
    return {
      unannotatedFailures,
      status: 'warn',
      message: 'Annotate within 48h — backlog is approaching publication gate.',
    };
  }
  return {
    unannotatedFailures,
    status: 'clear',
    message: 'All clear — publication allowed.',
  };
};

const level = (name: string, value: string) => `${name}: ${value}`;

const buildMaturity = (database: RenzeroDatabase): CreatorMaturityResponse => {
  const completed = database.verification_results.filter((record) => record.outcome === 'CONFIRMED' || record.outcome === 'REFUTED');
  const confirmed = completed.filter((record) => record.outcome === 'CONFIRMED').length;
  const accuracy = completed.length === 0 ? 0 : Math.round((confirmed / completed.length) * 100);
  const medianLead = completed.length === 0 ? 0 : Math.round(completed.reduce((sum, record) => sum + record.lead_time_days, 0) / completed.length);
  const verifiedEdges = database.edge_confidence_log.filter((edge) => edge.n_verifications >= 3).length;
  const annotatedFailures = database.prediction_failure_records.filter((record) => record.human_annotation && record.root_cause).length;

  return {
    trackRecordDepth: level(completed.length >= 30 ? 'Level 3' : 'Level 1', `${completed.length} verified predictions`),
    predictionAccuracy: level(accuracy >= 65 ? 'Level 3' : 'Level 1', `${accuracy}% verified accuracy`),
    consensusLeadTime: level(medianLead >= 14 ? 'Level 3' : 'Level 2', `median ${medianLead} days`),
    causalCalibration: level(verifiedEdges > 0 ? 'Level 2' : 'Level 0', `${verifiedEdges} causal edges have ≥3 verifications`),
    failureUnderstanding: level(annotatedFailures >= 10 ? 'Level 3' : annotatedFailures > 0 ? 'Level 1' : 'Level 0', `${annotatedFailures} failures annotated`),
  };
};

const buildGradient = (database: RenzeroDatabase): CreatorGradientResponse => {
  const bottleneck = [...database.agent_telemetry].sort(
    (left, right) => right.failure_rate * 0.7 + right.output_variance * 0.3 - (left.failure_rate * 0.7 + left.output_variance * 0.3),
  )[0];
  const failuresByType = database.prediction_failure_records.reduce<Record<string, number>>((counts, record) => {
    counts[record.failure_type] = (counts[record.failure_type] ?? 0) + 1;
    return counts;
  }, {});
  const dominantFailure = Object.entries(failuresByType).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'NONE';

  return {
    bottleneck: bottleneck
      ? `${bottleneck.agent} contribution score ${Math.round((bottleneck.failure_rate * 0.7 + bottleneck.output_variance * 0.3) * 100) / 100}`
      : 'No telemetry bottleneck detected.',
    topProposal: dominantFailure === 'TIMING'
      ? 'Tighten timing windows and require explicit verification source.'
      : `Reduce ${dominantFailure.toLowerCase()} failures with stricter critic constraints.`,
    expectedRoi: dominantFailure === 'NONE' ? 'No action required.' : 'R1 risk, estimated +4-6% verified accuracy.',
  };
};

export const getUserToday = (database: RenzeroDatabase, session: ApiSession): UserTodayResponse => {
  requireAudience(session, 'user');
  const view = buildUserReadModel(database);
  const safety = assertUserReadModelSafe(view);
  if (!safety.ok) {
    throw new Error(`Unsafe user read model: ${[...safety.forbiddenTermHits, ...safety.hiddenTableHits].join(', ')}`);
  }

  return {
    judgmentId: view.latestJudgment.id,
    clarity: view.latestJudgment.clarity,
    headline: view.latestJudgment.statement,
    consensusDelta: view.consensusSnapshot.our_delta,
    alphaBand: view.latestJudgment.alpha,
    falsification: view.consensusSnapshot.falsification,
    falsificationDate: view.consensusSnapshot.falsification_date,
    falsificationMetric: view.consensusSnapshot.falsification_metric,
    evidenceCount: view.latestJudgment.evidence_ids.length,
    publishedAt: view.latestJudgment.published_at,
  };
};

export const getUserTrackRecord = (database: RenzeroDatabase, session: ApiSession): UserTrackRecordResponse => {
  requireAudience(session, 'user');
  const view = buildUserReadModel(database);
  const safety = assertUserReadModelSafe(view);
  if (!safety.ok) {
    throw new Error(`Unsafe user read model: ${[...safety.forbiddenTermHits, ...safety.hiddenTableHits].join(', ')}`);
  }
  return view.trackRecord;
};

export const getUserSources = (database: RenzeroDatabase, session: ApiSession): UserSourcesResponse => {
  requireAudience(session, 'user');
  const view = buildUserReadModel(database);
  const safety = assertUserReadModelSafe(view);
  if (!safety.ok) {
    throw new Error(`Unsafe user read model: ${[...safety.forbiddenTermHits, ...safety.hiddenTableHits].join(', ')}`);
  }
  return view.sources;
};

export const getCreatorPipeline = (database: RenzeroDatabase, session: ApiSession): CreatorPipelineResponse => {
  requireAudience(session, 'creator');
  const creatorView = buildCreatorReadModel(database);
  const latestRun = [...creatorView.pipeline_runs].sort((left, right) => right.started_at.localeCompare(left.started_at))[0];
  if (!latestRun) {
    throw new Error('No pipeline run records found');
  }
  const steps = creatorView.pipeline_run_steps;
  return {
    run: latestRun,
    steps,
    annotationGate: buildAnnotationGate(database),
    health: {
      failedSteps: steps.filter((step) => step.status === 'fail').length,
      totalSignals: steps.reduce((sum, step) => sum + step.signalCount, 0),
      totalDurationSeconds: steps.reduce((sum, step) => sum + step.durationSeconds, 0),
    },
  };
};

export const getCreatorMaturity = (database: RenzeroDatabase, session: ApiSession): CreatorMaturityResponse => {
  requireAudience(session, 'creator');
  return buildMaturity(database);
};

export const getCreatorGradient = (database: RenzeroDatabase, session: ApiSession): CreatorGradientResponse => {
  requireAudience(session, 'creator');
  return buildGradient(database);
};

export const getCreatorSources = (database: RenzeroDatabase, session: ApiSession): CreatorSourcesResponse => {
  requireAudience(session, 'creator');
  return buildCreatorReadModel(database).source_catalog;
};

export const getCreatorInternals = (database: RenzeroDatabase, session: ApiSession): CreatorInternalsResponse => {
  requireAudience(session, 'creator');
  const creatorView = buildCreatorReadModel(database);
  return {
    edge_confidence_log: creatorView.edge_confidence_log,
    agent_telemetry: creatorView.agent_telemetry,
    active_learning_designs: creatorView.active_learning_designs,
    model_configs: creatorView.model_configs,
    source_timing_aggregates: creatorView.source_timing_aggregates,
  };
};

export const annotateFailure = (
  database: RenzeroDatabase,
  session: ApiSession,
  failureId: string,
  annotation: Pick<PredictionFailureRecord, 'human_annotation' | 'root_cause'>,
): RenzeroDatabase => {
  requireAudience(session, 'creator');
  return {
    ...database,
    prediction_failure_records: database.prediction_failure_records.map((record) =>
      record.id === failureId ? { ...record, ...annotation } : record,
    ),
  };
};
