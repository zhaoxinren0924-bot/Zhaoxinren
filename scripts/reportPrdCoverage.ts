import { buildPrdV5CoverageReport } from '../services/renzeroProductArchitecture.js';

const report = buildPrdV5CoverageReport();

console.log('\n=== Renzero Brain PRD v5.0 Coverage ===');
console.table({
  complete: report.complete,
  totalRequirements: report.totalRequirements,
  implemented: report.implemented,
  inProgress: report.inProgress,
  notStarted: report.notStarted,
  blocked: report.blocked,
});

console.log('\n--- Open requirements: do not stop until these are implemented ---');
console.table(
  report.requirements
    .filter((item) => item.status !== 'implemented')
    .map((item) => ({
      id: item.id,
      part: item.part,
      status: item.status,
      nextStep: item.nextStep,
    })),
);
