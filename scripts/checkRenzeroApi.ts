import assert from 'node:assert/strict';
import {
  annotateFailure,
  createCreatorSession,
  createUserSession,
  getCreatorGradient,
  getCreatorInternals,
  getCreatorMaturity,
  getCreatorPipeline,
  getCreatorSources,
  getUserSources,
  getUserToday,
  getUserTrackRecord,
  naturalGradientEdgeUpdate,
  verifyPrediction,
} from '../services/renzeroApi.js';
import { createSeedRenzeroDatabase } from '../services/renzeroStore.js';

const database = createSeedRenzeroDatabase();
const userSession = createUserSession('client@example.com');
const creatorSession = createCreatorSession('operator@example.com');

const today = getUserToday(database, userSession);
const trackRecord = getUserTrackRecord(database, userSession);
const userSources = getUserSources(database, userSession);
const todayJson = JSON.stringify(today);
const trackRecordJson = JSON.stringify(trackRecord);

assert.equal(today.headline, database.judgment_packages[0].statement);
assert.equal(today.falsificationDate, '2026-05-30', 'user today response should expose falsification date');
assert.match(today.falsificationMetric, /lead-time/, 'user today response should expose falsification metric');
assert.ok(today.evidenceCount > 0, 'user today response should expose evidence count, not raw internal records');
assert.ok(trackRecord.aggregate_accuracy > 0, 'user track record should expose aggregate accuracy');
assert.deepEqual(
  userSources.map((source) => source.name),
  database.source_catalog.filter((source) => source.userVisible).map((source) => source.name),
  'user sources should only include user-visible sources',
);
assert.deepEqual(
  [...new Set(userSources.map((source) => source.layer))],
  ['L0_ENERGY', 'L1_DEMAND', 'L2_SUPPLY', 'L3_HARDWARE', 'L4_ECONOMICS', 'L5_POLICY_CAPITAL'],
  'user sources should include the energy layer and the downstream source stack',
);
assert.ok(!todayJson.includes('creator_notes'), 'user today response must not expose creator notes');
assert.ok(!todayJson.includes('conflict_score'), 'user today response must not expose consensus validation scores');
assert.ok(!trackRecordJson.includes('edge_confidence_log'), 'user track record must not expose edge confidence history');

assert.throws(() => getCreatorPipeline(database, userSession), /Forbidden/, 'user session must not access creator API');
assert.throws(() => getUserToday(database, creatorSession), /Forbidden/, 'creator token must not be accepted by user API');

const pipeline = getCreatorPipeline(database, creatorSession);
const maturity = getCreatorMaturity(database, creatorSession);
const gradient = getCreatorGradient(database, creatorSession);
const internals = getCreatorInternals(database, creatorSession);
const creatorSources = getCreatorSources(database, creatorSession);
assert.equal(pipeline.run.id, 'run-2026-05-09-daily', 'creator pipeline response should include latest persisted run id');
assert.equal(pipeline.steps.length, 8, 'creator pipeline response should include 8-step run status');
assert.equal(pipeline.health.failedSteps, 0, 'pipeline health should summarize failed steps');
assert.ok(pipeline.health.totalDurationSeconds > 0, 'pipeline health should summarize total duration');
assert.equal(pipeline.annotationGate.unannotatedFailures, 1, 'annotation gate should be computed from unannotated failure records');
assert.match(maturity.predictionAccuracy, /67%/, 'maturity should be derived from verification result accuracy');
assert.match(gradient.bottleneck, /CriticAgent/, 'gradient bottleneck should be derived from agent telemetry');
assert.equal(creatorSources.length, 60, 'creator sources should include full source inventory');
assert.ok(creatorSources.some((source) => source.name === 'Samsung SoIC supplier check' && !source.userVisible), 'creator sources should include creator-only supplier checks');
assert.ok(internals.edge_confidence_log.length > 0, 'creator internals should include edge confidence history');
assert.ok(internals.agent_telemetry.length > 0, 'creator internals should include agent telemetry');
assert.ok(internals.active_learning_designs.length > 0, 'creator internals should include active learning designs');
assert.ok(internals.source_timing_aggregates.every((record) => record.sample_count >= 10), 'creator internals should include reportable source timing aggregates');

const updated = annotateFailure(database, creatorSession, 'pf-scope', {
  human_annotation: 'Scope failure reviewed by operator.',
  root_cause: 'Prediction statement covered too broad a supplier set.',
});
const annotated = updated.prediction_failure_records.find((record) => record.id === 'pf-scope');
assert.equal(annotated?.human_annotation, 'Scope failure reviewed by operator.');
assert.equal(annotated?.root_cause, 'Prediction statement covered too broad a supplier set.');
assert.equal(getCreatorPipeline(updated, creatorSession).annotationGate.unannotatedFailures, 0, 'annotation gate should clear after creator annotation write');

const gradientUpdate = naturalGradientEdgeUpdate(0.5, 1, 'CONFIRMED');
assert.equal(gradientUpdate.step, 0.125, 'natural gradient should use lr × p × (1-p) / n');
assert.equal(gradientUpdate.newConfidence, 0.625, 'confirmed outcome should increase confidence by the natural-gradient step');
assert.equal(naturalGradientEdgeUpdate(0.9, 50, 'REFUTED').newConfidence, 0.898, 'refuted outcome should apply the asymmetric negative update');

const verified = verifyPrediction(updated, creatorSession, {
  predictionId: 'jp-energy-constraint',
  outcome: 'CONFIRMED',
  verifiedAt: '2026-05-12T00:00:00.000Z',
  leadTimeDays: 12,
  causalEdge: 'L0 energy availability -> L3 hardware deployment',
  earliestSignalSource: 'EIA power demand monitor',
  earliestSignalTs: '2026-04-30T00:00:00.000Z',
  marketConsensusTs: '2026-05-12T00:00:00.000Z',
  topicLayer: 'L0_ENERGY',
});
assert.ok(verified.verification_results.some((record) => record.judgment_id === 'jp-energy-constraint' && record.outcome === 'CONFIRMED'), 'verifyPrediction should write verification results');
assert.ok(verified.source_timing_records.some((record) => record.judgment_id === 'jp-energy-constraint' && record.topic_layer === 'L0_ENERGY'), 'confirmed verification should write source timing evidence');
assert.ok(verified.edge_confidence_log.some((record) => record.edge === 'L0 energy availability -> L3 hardware deployment' && record.rule_applied === 'natural_gradient_confirmed'), 'confirmed verification should write natural-gradient edge audit log');

const refuted = verifyPrediction(verified, creatorSession, {
  predictionId: 'jp-policy-test',
  outcome: 'REFUTED',
  verifiedAt: '2026-05-13T00:00:00.000Z',
  leadTimeDays: 0,
  causalEdge: 'L5 policy tightening -> L2 supply delay',
  failureType: 'DIRECTION',
  rootCause: 'Policy waiver invalidated the expected restriction path.',
});
assert.ok(refuted.prediction_failure_records.some((record) => record.judgment_id === 'jp-policy-test' && record.failure_type === 'DIRECTION'), 'refuted verification should create failure taxonomy entry');
assert.ok(refuted.edge_confidence_log.some((record) => record.edge === 'L5 policy tightening -> L2 supply delay' && record.rule_applied === 'natural_gradient_refuted'), 'refuted verification should write asymmetric natural-gradient edge audit log');
assert.throws(() => verifyPrediction(refuted, userSession, { predictionId: 'blocked', outcome: 'CONFIRMED', verifiedAt: '2026-05-14T00:00:00.000Z' }), /Forbidden/, 'user session must not verify predictions');

console.log('Renzero API checks passed');
