import { AphlaCognitionEngine, sampleSignal } from '../services/aphlaEngine.js';
import {
  annotateFailure,
  createCreatorSession,
  createUserSession,
  getCreatorGradient,
  getCreatorInternals,
  getCreatorMaturity,
  getCreatorPipeline,
  getUserToday,
  getUserTrackRecord,
} from '../services/renzeroApi.js';
import { createSeedRenzeroDatabase } from '../services/renzeroStore.js';

const printSection = (title: string) => {
  console.log(`\n=== ${title} ===`);
};

let database = createSeedRenzeroDatabase();
const userSession = createUserSession('demo-client@renzero.ai');
const creatorSession = createCreatorSession('demo-operator@renzero.ai');

printSection('User Product: Today card');
const today = getUserToday(database, userSession);
console.table({
  clarity: today.clarity,
  headline: today.headline,
  consensusDelta: today.consensusDelta,
  alphaBand: today.alphaBand.join(' / '),
  falsification: today.falsification,
  evidenceCount: today.evidenceCount,
});

printSection('User Product: Track Record');
const trackRecord = getUserTrackRecord(database, userSession);
console.table({
  aggregateAccuracy: `${trackRecord.aggregate_accuracy}%`,
  aggregateLeadTime: `${trackRecord.aggregate_lead_time} days`,
  recentOutcomes: trackRecord.recent_outcomes.map((outcome) => `${outcome.outcome}:${outcome.lead_time_days}d`).join(', '),
});

printSection('Creator Product: Pipeline and gate before annotation');
const pipelineBefore = getCreatorPipeline(database, creatorSession);
console.table(pipelineBefore.steps.map((step) => ({ step: step.name, status: step.status, seconds: step.durationSeconds, signals: step.signalCount })));
console.table(pipelineBefore.annotationGate);

printSection('Creator Product: Maturity and gradient');
console.table(getCreatorMaturity(database, creatorSession));
console.table(getCreatorGradient(database, creatorSession));

printSection('Creator Product: Internals visible only to creator');
const internals = getCreatorInternals(database, creatorSession);
console.table({
  edgeConfidenceRecords: internals.edge_confidence_log.length,
  agentTelemetryRecords: internals.agent_telemetry.length,
  activeLearningDesigns: internals.active_learning_designs.length,
  modelConfigs: internals.model_configs.length,
});

printSection('Creator action: annotate pending failure');
database = annotateFailure(database, creatorSession, 'pf-scope', {
  human_annotation: 'Scope failure reviewed in demo run.',
  root_cause: 'Prediction statement covered too broad a supplier set.',
});
console.table(getCreatorPipeline(database, creatorSession).annotationGate);

printSection('Cognition Engine: signal to reasoning');
const engine = new AphlaCognitionEngine();
const cognition = engine.run({ rawText: sampleSignal, sourceName: 'demo-run', sourceReliability: 0.9 });
console.table({
  score: cognition.score,
  confidence: `${Math.round(cognition.confidence * 100)}%`,
  entity: cognition.entity,
  thesis: cognition.thesis,
  action: cognition.action,
  facts: cognition.facts.length,
});
console.table(cognition.stages.map((stage) => ({ stage: stage.label, output: stage.value })));

printSection('Result');
console.log('Renzero Brain demo completed: user-safe consumption, creator operations, annotation write, and cognition engine all ran locally.');
