import assert from 'node:assert/strict';
import { AphlaCognitionEngine, sampleSignal } from '../services/aphlaEngine.js';

const engine = new AphlaCognitionEngine();

const opportunity = engine.run({
  rawText: sampleSignal,
  sourceName: 'engine-check',
  sourceReliability: 0.9,
  observedAt: '2026-05-09T00:00:00.000Z',
});

assert.equal(opportunity.stages.length, 6, 'engine should return six explainable stages');
assert.equal(opportunity.facts.length, 2, 'engine should materialize traceable facts');
assert.match(opportunity.normalized, /^已标准化 sig-[0-9a-f]{8}/, 'engine should create stable signal ids');
assert.ok(opportunity.score >= 72, 'high-quality opportunity signal should pass the reasoning threshold');
assert.ok(opportunity.confidence > 0.7, 'high-reliability source should raise confidence');
assert.match(opportunity.thesis, /需求拐点|放量阶段/, 'opportunity signal should produce opportunity cognition');
assert.match(opportunity.action, /客户简报|销售跟进/, 'opportunity signal should produce monetizable workflow action');
assert.deepEqual(
  opportunity.facts.flatMap((fact) => fact.evidenceIds),
  [opportunity.normalized.match(/sig-[0-9a-f]{8}/)?.[0], opportunity.normalized.match(/sig-[0-9a-f]{8}/)?.[0]],
  'facts should point back to the normalized signal evidence id',
);

const risk = engine.run({
  rawText: '核心供应商交付延迟并出现客户投诉，渠道订单连续减少。',
  sourceName: 'risk-check',
  sourceReliability: 0.85,
});

assert.match(risk.thesis, /异常/, 'risk keywords should produce risk cognition');
assert.match(risk.action, /风险预警|专家复核/, 'risk cognition should produce review workflow');
assert.ok(risk.facts.some((fact) => fact.object === '风险异常'), 'risk facts should mark abnormal movement');

const weak = engine.run({
  rawText: '行业有一些讨论。',
  sourceReliability: 0.2,
});

assert.ok(weak.score < 72, 'weak signal should stay below publish threshold');
assert.match(weak.action, /观察池/, 'weak signal should be held for more evidence');

console.log('Aphla cognition engine checks passed');
