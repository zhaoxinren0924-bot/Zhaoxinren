import assert from 'node:assert/strict';
import {
  assertUserReadModelSafe,
  buildCreatorReadModel,
  buildUserReadModel,
  createSeedRenzeroDatabase,
  loadRenzeroDatabase,
  saveRenzeroDatabase,
  type StorageLike,
} from '../services/renzeroStore.js';

const database = createSeedRenzeroDatabase();
const userView = buildUserReadModel(database);
const creatorView = buildCreatorReadModel(database);
const safety = assertUserReadModelSafe(userView);

assert.equal(safety.ok, true, `user read model leaked internals: ${safety.hiddenTableHits.join(', ')}`);
assert.equal(database.pipeline_runs[0].id, 'run-2026-05-09-daily', 'seed store should include a persisted pipeline run log');
assert.equal(database.source_catalog.length, 60, 'seed store should include a full layered source catalog');
assert.deepEqual(
  userView.sources.map((source) => source.name),
  database.source_catalog.filter((source) => source.userVisible).map((source) => source.name),
  'user read model should only expose user-visible source names',
);
assert.deepEqual(
  [...new Set(userView.sources.map((source) => source.layer))],
  ['L0_ENERGY', 'L1_DEMAND', 'L2_SUPPLY', 'L3_HARDWARE', 'L4_ECONOMICS', 'L5_POLICY_CAPITAL'],
  'user read model should preserve source layer coverage',
);
assert.equal(userView.latestJudgment.statement, database.judgment_packages[0].statement);
assert.equal(userView.consensusSnapshot.falsification, database.consensus_snapshots[0].falsification);
assert.equal(userView.consensusSnapshot.falsification_date, '2026-05-30', 'user read model should expose falsification date');
assert.ok(database.consensus_snapshots.every((snapshot) => snapshot.snapshot_ts && snapshot.consensus_sources.length > 0), 'every consensus snapshot should capture non-reconstructible consensus context');
assert.ok(database.source_timing_records.every((record) => record.earliest_signal_ts && record.market_consensus_ts && record.topic_layer), 'source timing records should retain per-prediction timing evidence');
assert.ok(database.source_timing_aggregates.every((record) => record.sample_count >= 10 && record.timing_premium > 1), 'source timing aggregates should only expose reportable calibrated timing premiums');
assert.ok(userView.trackRecord.aggregate_accuracy > 0, 'user read model should expose aggregate accuracy');
assert.ok(!JSON.stringify(userView).includes('creator_notes'), 'user read model must strip creator notes');
assert.ok(!JSON.stringify(userView).includes('conflict_score'), 'user read model must strip consensus validation score');
assert.ok(creatorView.edge_confidence_log.every((record) => record.old_confidence < record.new_confidence && record.rule_applied), 'creator read model should expose edge confidence audit details');
assert.ok(creatorView.edge_confidence_log.length > 0, 'creator read model should expose edge confidence history');
assert.ok(creatorView.agent_telemetry.length > 0, 'creator read model should expose agent telemetry');
assert.ok(creatorView.active_learning_designs.length > 0, 'creator read model should expose active learning designs');

const memory = new Map<string, string>();
const storage: StorageLike = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
};

saveRenzeroDatabase(database, storage);
const loaded = loadRenzeroDatabase(storage);
assert.deepEqual(loaded.judgment_packages, database.judgment_packages, 'stored database should round-trip through storage adapter');

console.log('Renzero store checks passed');
