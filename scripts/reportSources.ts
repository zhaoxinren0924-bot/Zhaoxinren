import { createCreatorSession, createUserSession, getCreatorSources, getUserSources } from '../services/renzeroApi.js';
import { createSeedRenzeroDatabase } from '../services/renzeroStore.js';

const database = createSeedRenzeroDatabase();
const userSession = createUserSession('demo-client@renzero.ai');
const creatorSession = createCreatorSession('demo-operator@renzero.ai');

console.log('\n=== User-visible sources ===');
console.table(getUserSources(database, userSession));

console.log('\n=== Creator full source inventory ===');
console.table(
  getCreatorSources(database, creatorSession).map((source) => ({
    id: source.id,
    name: source.name,
    category: source.category,
    reliability: source.reliability,
    userVisible: source.userVisible,
    evidenceIds: source.evidenceIds.join(', '),
  })),
);
