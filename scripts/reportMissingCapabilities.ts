import { buildImplementationPlan, buildMissingCapabilityReport } from '../services/renzeroProductArchitecture.js';

const plan = buildImplementationPlan();
const report = buildMissingCapabilityReport(plan);

console.log('\n=== Renzero Missing Capability Report ===');
console.table({
  totalMissing: report.totalMissing,
  p0Missing: report.p0Missing,
  nextFocus: report.nextThree.map((item) => item.id).join(' → '),
});

for (const [phase, items] of Object.entries(report.byPhase)) {
  console.log(`\n--- ${phase} ---`);
  if (items.length === 0) {
    console.log('No open work items in this phase.');
    continue;
  }
  console.table(
    items.map((item) => ({
      id: item.id,
      priority: item.priority,
      status: item.status,
      title: item.title,
      nextStep: item.approach[0],
      doneWhen: item.acceptanceCriteria[0],
    })),
  );
}

console.log('\n--- Production blockers ---');
report.productionBlockers.forEach((blocker) => console.log(`• ${blocker}`));
