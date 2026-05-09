import assert from 'node:assert/strict';
import {
  buildCreatorProductSnapshot,
  buildImplementationPlan,
  buildMissingCapabilityReport,
  buildUserProductSnapshot,
  buildSystemReadinessAssessment,
  buildPrdV5CoverageReport,
  featureMatrix,
  userForbiddenTerms,
  validateUserProductIsolation,
} from '../services/renzeroProductArchitecture.js';

const userProduct = buildUserProductSnapshot();
const creatorProduct = buildCreatorProductSnapshot();
const isolation = validateUserProductIsolation(userProduct);
const readiness = buildSystemReadinessAssessment();
const implementationPlan = buildImplementationPlan();
const missingReport = buildMissingCapabilityReport(implementationPlan);
const prdCoverage = buildPrdV5CoverageReport();

assert.equal(isolation.ok, true, `user product leaked internal terms: ${isolation.forbiddenTermHits.join(', ')}`);
assert.equal(userProduct.audience, 'user');
assert.equal(creatorProduct.audience, 'creator');
assert.equal(userProduct.screens[0].name, 'Today');
assert.ok(userProduct.screens.some((screen) => screen.name === 'Track Record'), 'Track Record must always be accessible');
assert.ok(userProduct.today.headline.split(/\s+/).length <= 25, 'Today headline should fit the 30-second card');
assert.ok(userProduct.apiContract.hiddenTables.includes('edge_confidence_log'), 'user API must hide edge confidence history');
assert.ok(!Object.keys(userProduct.apiContract.allowedTables).includes('edge_confidence_log'), 'user API must not expose edge confidence history');

const creatorStepNames = creatorProduct.pipeline.map((step) => step.name);
assert.deepEqual(creatorStepNames, ['INGEST', 'SCORE', 'LAYERS', 'CONSENSUS', 'CRITIC', 'JUDGMENT', 'INFERENCE', 'REPORT']);
assert.ok(creatorProduct.screens.some((screen) => screen.name === 'Annotation'), 'creator product needs annotation workflow');
assert.ok(creatorProduct.screens.some((screen) => screen.name === 'Causal Graph'), 'creator product needs causal graph manager');
assert.ok(creatorProduct.apiContract.fullAccessTables.includes('active_learning_designs'), 'creator API must expose active learning designs');

const hiddenFromUsers = featureMatrix.filter((row) => row.userProduct === 'hidden').map((row) => row.feature);
assert.ok(hiddenFromUsers.includes('Pipeline run status'), 'pipeline status must be hidden from users');
assert.ok(hiddenFromUsers.includes('Model settings'), 'model settings must be hidden from users');
assert.equal(readiness.overallLevel, 'demo-ready', 'current system should be classified as demo-ready overall');
assert.ok(readiness.overallScore >= 40 && readiness.overallScore < 50, 'overall readiness should reflect architecture prototype, not production');
assert.ok(readiness.areas.some((area) => area.name === 'Operational readiness' && area.level === 'prototype'), 'operational readiness must remain prototype until deployment/observability exist');
assert.ok(readiness.areas.some((area) => area.name === 'Architecture contract' && area.score >= 70), 'architecture contract should be the strongest implemented area');
assert.equal(implementationPlan.workItems[0].id, 'FND-001', 'implementation must start with persistence foundation');
assert.ok(implementationPlan.workItems.some((item) => item.id === 'FND-002' && item.priority === 'P0'), 'API split must be a P0 foundation item');
assert.ok(implementationPlan.workItems.some((item) => item.id === 'CRT-001' && item.phase === 'creator-mvp'), 'creator pipeline dashboard must be a creator MVP item');
assert.ok(implementationPlan.workItems.some((item) => item.id === 'USR-001' && item.phase === 'user-mvp'), 'user MVP must remain after foundation and creator MVP');
assert.ok(implementationPlan.workItems.every((item) => item.acceptanceCriteria.length > 0), 'every implementation item needs acceptance criteria');
assert.ok(missingReport.totalMissing > 0, 'system should report remaining missing capabilities');
assert.ok(missingReport.productionBlockers.some((blocker) => blocker.startsWith('USR-001')), 'user MVP must remain a production blocker until implemented');
assert.ok(missingReport.productionBlockers.some((blocker) => blocker.startsWith('OPS-001')), 'production hardening must remain a blocker until implemented');
assert.equal(prdCoverage.version, 'v5.0', 'PRD coverage report must track the v5.0 reference document');
assert.equal(prdCoverage.complete, false, 'PRD coverage must not claim completion until every v5.0 requirement is implemented');
assert.ok(prdCoverage.mustNotStopUntil.some((item) => item.startsWith('V5-SERVE-001')), 'serve/provenance browser must remain an explicit stop condition');
assert.ok(prdCoverage.requirements.some((item) => item.id === 'V5-DATA-001' && item.status === 'blocked'), 'durable database must remain a blocking PRD requirement');

const userCopy = JSON.stringify({
  promise: userProduct.promise,
  designRules: userProduct.designRules,
  today: userProduct.today,
  screens: userProduct.screens,
  trackRecord: userProduct.trackRecord,
}).toLowerCase();
assert.deepEqual(
  userForbiddenTerms.filter((term) => userCopy.includes(term)),
  [],
  'client-facing copy must avoid internal jargon',
);

console.log('Renzero two-product architecture checks passed');
