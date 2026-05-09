import React, { useMemo, useState } from 'react';
import {
  buildCreatorProductSnapshot,
  buildUserProductSnapshot,
  buildImplementationPlan,
  buildSystemReadinessAssessment,
  featureMatrix,
  validateUserProductIsolation,
  type CreatorProductSnapshot,
  type ProductScreen,
  type UserProductSnapshot,
} from './services/renzeroProductArchitecture';
import { createCreatorSession, createUserSession, getCreatorGradient, getCreatorMaturity, getCreatorPipeline, getUserToday, getUserTrackRecord } from './services/renzeroApi';
import { createSeedRenzeroDatabase } from './services/renzeroStore';

type ProductMode = 'user' | 'creator';

const badgeClass = {
  HIGH: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
  AMBIGUOUS: 'bg-red-100 text-red-800 border-red-200',
};

const SectionCard: React.FC<{ title: string; eyebrow?: string; children: React.ReactNode; className?: string }> = ({
  title,
  eyebrow,
  children,
  className = '',
}) => (
  <section className={`rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,43,61,0.10)] ${className}`}>
    {eyebrow && <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-700">{eyebrow}</p>}
    <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
    {children}
  </section>
);

const ScreenList: React.FC<{ screens: ProductScreen[]; compact?: boolean }> = ({ screens, compact = false }) => (
  <div className={`mt-5 grid gap-4 ${compact ? 'lg:grid-cols-2' : 'lg:grid-cols-4'}`}>
    {screens.map((screen) => (
      <article key={screen.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-black text-slate-950">{screen.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{screen.purpose}</p>
        <p className="mt-3 rounded-xl bg-white p-3 text-xs font-bold leading-5 text-slate-700">{screen.primaryRule}</p>
        <ul className="mt-3 space-y-1 text-xs text-slate-500">
          {screen.items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </article>
    ))}
  </div>
);

const UserProductView: React.FC<{ product: UserProductSnapshot }> = ({ product }) => {
  const isolation = useMemo(() => validateUserProductIsolation(product), [product]);
  const [low, mid, high] = product.today.alphaBand;

  return (
    <div className="grid gap-6">
      <SectionCard title="User Product — Intelligence Client" eyebrow="⬡ decision-focused · mobile-first">
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-cyan-50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`rounded-full border px-4 py-2 text-xs font-black ${badgeClass[product.today.clarity]}`}>{product.today.clarity}</span>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">30-second card</span>
            </div>
            <h3 className="mt-6 text-3xl font-black leading-tight text-slate-950">{product.today.headline}</h3>
            <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <b className="block text-slate-950">Consensus delta</b>
                Our position is {product.today.consensusDelta} consensus.
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <b className="block text-slate-950">Falsification date</b>
                {product.today.falsification}
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex justify-between text-xs font-black text-slate-500">
                <span>Low {Math.round(low * 100)}%</span>
                <span>Mid {Math.round(mid * 100)}%</span>
                <span>High {Math.round(high * 100)}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600" style={{ width: `${high * 100}%` }} />
              </div>
            </div>
            {product.today.cascade && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{product.today.cascade}</p>}
            {product.today.yesterdayDiff && <p className="mt-3 text-sm font-bold text-emerald-700">{product.today.yesterdayDiff}</p>}
          </article>

          <article className="rounded-[2rem] bg-slate-950 p-6 text-white">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Trust engine</p>
            <h3 className="mt-4 text-3xl font-black">Track Record is always visible</h3>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl bg-white/10 p-4"><b>Accuracy</b><br />{product.trackRecord.accuracy}</div>
              <div className="rounded-2xl bg-white/10 p-4"><b>Lead time</b><br />{product.trackRecord.consensusLeadTime}</div>
              <div className="rounded-2xl bg-white/10 p-4"><b>Reliability view</b><br />{product.trackRecord.reliabilityByBand}</div>
            </div>
            <ul className="mt-5 space-y-2 text-sm text-cyan-50">
              {product.trackRecord.recentOutcomes.map((outcome) => (
                <li key={outcome}>✓ {outcome}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {product.designRules.map((rule) => (
            <div key={rule} className="rounded-2xl bg-cyan-50 p-4 text-sm font-bold leading-6 text-cyan-950">{rule}</div>
          ))}
        </div>

        <div className={`mt-5 rounded-2xl p-4 text-sm font-black ${isolation.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {isolation.ok ? 'User API isolation check: PASS — operator-only terms and tables stay out of the client contract.' : 'User API isolation check: FAIL'}
        </div>
      </SectionCard>

      <SectionCard title="User screens" eyebrow="client navigation">
        <ScreenList screens={product.screens} />
      </SectionCard>
    </div>
  );
};

const CreatorProductView: React.FC<{ product: CreatorProductSnapshot }> = ({ product }) => {
  const failedSteps = product.pipeline.filter((step) => step.status === 'fail').length;

  return (
    <div className="grid gap-6">
      <SectionCard title="Creator Product — Operator Dashboard" eyebrow="⬢ health-focused · desktop-first">
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Pipeline dashboard</p>
                <h3 className="mt-2 text-3xl font-black text-slate-950">{failedSteps === 0 ? 'Healthy run today' : 'Action required'}</h3>
              </div>
              <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-800">{product.status}</span>
            </div>
            <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-xs font-bold text-slate-600 md:grid-cols-3">
              <span>Run: {product.pipelineRun?.id ?? 'latest'}</span>
              <span>Duration: {product.pipelineHealth?.totalDurationSeconds ?? product.pipeline.reduce((sum, step) => sum + step.durationSeconds, 0)}s</span>
              <span>Signals: {product.pipelineHealth?.totalSignals ?? product.pipeline.reduce((sum, step) => sum + step.signalCount, 0)}</span>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {product.pipeline.map((step) => (
                <div key={step.name} className={`rounded-2xl border p-4 ${step.status === 'pass' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center justify-between">
                    <b className="text-slate-950">{step.name}</b>
                    <span>{step.status === 'pass' ? '✓' : '✕'}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{step.durationSeconds}s · {step.signalCount} signals</p>
                  <p className="mt-2 text-xs font-bold leading-5 text-slate-700">{step.message}</p>
                  {step.errorMessage && <p className="mt-2 text-xs font-black text-red-700">{step.errorMessage}</p>}
                  {step.suggestedAction && <p className="mt-2 text-[11px] leading-4 text-slate-500">Action: {step.suggestedAction}</p>}
                </div>
              ))}
            </div>
          </article>

          <aside className="grid gap-4">
            <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-300">Annotation gate</p>
              <h3 className="mt-3 text-4xl font-black">{product.annotationGate.unannotatedFailures}</h3>
              <p className="mt-2 text-sm text-slate-200">{product.annotationGate.message}</p>
            </div>
            <div className="rounded-[2rem] border border-orange-200 bg-orange-50 p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-700">Gradient</p>
              <h3 className="mt-3 text-xl font-black text-slate-950">{product.gradient.topProposal}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">{product.gradient.bottleneck}</p>
              <p className="mt-3 text-sm font-black text-orange-700">{product.gradient.expectedRoi}</p>
            </div>
          </aside>
        </div>
      </SectionCard>

      <SectionCard title="Maturity assessment" eyebrow="commercial readiness">
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {Object.entries(product.maturity).map(([key, value]) => (
            <div key={key} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-800">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Creator screens" eyebrow="operator navigation">
        <ScreenList screens={product.screens} compact />
      </SectionCard>
    </div>
  );
};


const ReadinessPanel: React.FC<{ assessment: ReturnType<typeof buildSystemReadinessAssessment> }> = ({ assessment }) => (
  <SectionCard title="System usability / readiness" eyebrow="what is usable today">
    <div className="mt-5 grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Overall</p>
        <div className="mt-4 text-6xl font-black">{assessment.overallScore}%</div>
        <p className="mt-3 rounded-full bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-100">{assessment.overallLevel}</p>
        <p className="mt-5 text-sm leading-7 text-slate-200">{assessment.summary}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {assessment.areas.map((area) => (
          <article key={area.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black text-slate-950">{area.name}</h3>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">{area.score}% · {area.level}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-500" style={{ width: `${area.score}%` }} />
            </div>
            <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Implemented</p>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
              {area.implemented.map((item) => <li key={item}>✓ {item}</li>)}
            </ul>
            <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-orange-700">Missing</p>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
              {area.missing.map((item) => <li key={item}>• {item}</li>)}
            </ul>
            <p className="mt-3 rounded-xl bg-white p-3 text-xs font-bold leading-5 text-slate-700">Next: {area.nextStep}</p>
          </article>
        ))}
      </div>
    </div>
  </SectionCard>
);


const ImplementationPlanPanel: React.FC<{ plan: ReturnType<typeof buildImplementationPlan> }> = ({ plan }) => (
  <SectionCard title="What is not implemented yet — and how we implement it" eyebrow="execution backlog">
    <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Principle</p>
      <h3 className="mt-3 text-2xl font-black">{plan.principle}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-200">Immediate focus: {plan.immediateFocus}</p>
    </div>
    <div className="mt-5 grid gap-3 md:grid-cols-4">
      {plan.milestones.map((milestone) => (
        <article key={milestone.phase} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{milestone.phase}</p>
          <h3 className="mt-2 font-black text-slate-950">{milestone.target}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-600">{milestone.outcome}</p>
        </article>
      ))}
    </div>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      {plan.workItems.map((item) => (
        <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">{item.id}</span>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase text-cyan-800">{item.phase}</span>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-800">{item.priority}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{item.status}</span>
          </div>
          <h3 className="mt-4 text-xl font-black text-slate-950">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.why}</p>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Implementation approach</p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
            {item.approach.map((step) => <li key={step}>• {step}</li>)}
          </ul>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Acceptance criteria</p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
            {item.acceptanceCriteria.map((criterion) => <li key={criterion}>✓ {criterion}</li>)}
          </ul>
        </article>
      ))}
    </div>
  </SectionCard>
);

const FeatureMatrix: React.FC = () => (
  <SectionCard title="Feature access matrix" eyebrow="architectural exclusion, not permission hiding">
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-slate-950 text-white">
          <tr>
            <th className="p-4">Feature</th>
            <th className="p-4">User Product</th>
            <th className="p-4">Creator Product</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {featureMatrix.map((row) => (
            <tr key={row.feature}>
              <td className="p-4 font-bold text-slate-900">{row.feature}</td>
              <td className={`p-4 font-black ${row.userProduct === 'hidden' ? 'text-red-600' : 'text-emerald-700'}`}>{row.userProduct}</td>
              <td className="p-4 font-black text-cyan-700">{row.creatorProduct}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SectionCard>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<ProductMode>('user');
  const database = useMemo(() => createSeedRenzeroDatabase(), []);
  const userSession = useMemo(() => createUserSession('demo-client'), []);
  const creatorSession = useMemo(() => createCreatorSession('demo-operator'), []);
  const userToday = useMemo(() => getUserToday(database, userSession), [database, userSession]);
  const userTrackRecord = useMemo(() => getUserTrackRecord(database, userSession), [database, userSession]);
  const creatorPipeline = useMemo(() => getCreatorPipeline(database, creatorSession), [database, creatorSession]);
  const creatorMaturity = useMemo(() => getCreatorMaturity(database, creatorSession), [database, creatorSession]);
  const creatorGradient = useMemo(() => getCreatorGradient(database, creatorSession), [database, creatorSession]);
  const userProduct = useMemo(() => {
    const base = buildUserProductSnapshot();
    return {
      ...base,
      today: {
        ...base.today,
        clarity: userToday.clarity,
        headline: userToday.headline,
        consensusDelta: userToday.consensusDelta,
        alphaBand: userToday.alphaBand,
        falsification: userToday.falsification,
      },
      trackRecord: {
        ...base.trackRecord,
        accuracy: `${userTrackRecord.aggregate_accuracy}% verified outcomes`,
        consensusLeadTime: `Median ${userTrackRecord.aggregate_lead_time} days before consensus`,
        recentOutcomes: userTrackRecord.recent_outcomes.map(
          (outcome) => `${outcome.outcome}: ${outcome.judgment_id} · ${outcome.lead_time_days}d lead`,
        ),
      },
    };
  }, [userToday, userTrackRecord]);
  const creatorProduct = useMemo(
    () => ({
      ...buildCreatorProductSnapshot(),
      pipeline: creatorPipeline.steps,
      annotationGate: creatorPipeline.annotationGate,
      pipelineRun: creatorPipeline.run,
      pipelineHealth: creatorPipeline.health,
      maturity: creatorMaturity,
      gradient: creatorGradient,
    }),
    [creatorGradient, creatorMaturity, creatorPipeline],
  );
  const readiness = useMemo(() => buildSystemReadinessAssessment(), []);
  const implementationPlan = useMemo(() => buildImplementationPlan(), []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f7fbff] via-[#eef7f4] to-[#fff5eb] p-5 text-slate-900 md:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)] md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">Renzero Brain · PRD v5.0 · 2026</p>
              <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Two-Product Architecture</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-200">
                One intelligence system, two separate human relationships: clients consume judgments; operators maintain system health and evolution.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white/10 p-2">
              <button
                onClick={() => setMode('user')}
                className={`rounded-xl px-5 py-3 text-sm font-black transition ${mode === 'user' ? 'bg-white text-slate-950' : 'text-white/70 hover:text-white'}`}
              >
                ⬡ User Product
              </button>
              <button
                onClick={() => setMode('creator')}
                className={`rounded-xl px-5 py-3 text-sm font-black transition ${mode === 'creator' ? 'bg-white text-slate-950' : 'text-white/70 hover:text-white'}`}
              >
                ⬢ Creator Product
              </button>
            </div>
          </div>
        </header>

        <div className="mt-6">
          <ReadinessPanel assessment={readiness} />
        </div>

        <div className="mt-6">
          {mode === 'user' ? <UserProductView product={userProduct} /> : <CreatorProductView product={creatorProduct} />}
        </div>

        <div className="mt-6">
          <ImplementationPlanPanel plan={implementationPlan} />
        </div>

        <div className="mt-6">
          <FeatureMatrix />
        </div>
      </div>
    </main>
  );
};

export default App;
