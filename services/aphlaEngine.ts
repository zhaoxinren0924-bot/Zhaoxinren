export type SourceSignal = {
  rawText: string;
  sourceName?: string;
  sourceReliability?: number;
  observedAt?: string;
};

export type NormalizedSignal = {
  id: string;
  canonicalText: string;
  sourceName: string;
  sourceReliability: number;
  observedAt: string;
  entities: string[];
  keywords: string[];
};

export type ScoredSignal = {
  normalized: NormalizedSignal;
  score: number;
  admissible: boolean;
  reasons: string[];
};

export type KnowledgeFact = {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  confidence: number;
  evidenceIds: string[];
};

export type EngineStage = {
  label: string;
  value: string;
};

export type CognitionOutput = {
  normalized: string;
  score: number;
  entity: string;
  thesis: string;
  action: string;
  confidence: number;
  stages: EngineStage[];
  facts: KnowledgeFact[];
};

type EngineConfig = {
  admissibleThreshold: number;
  baseReliability: number;
};

const opportunityKeywords = ['增加', '扩产', '招标', '增长', '合作', '缩短', '放量', '中标', '采购'];
const riskKeywords = ['下滑', '延迟', '取消', '风险', '投诉', '减少', '违约', '断供', '召回'];
const entityHints = ['客户', '供应商', '企业', '工厂', '渠道', '机器人', '零部件', '招标', '供应链'];

export const sampleSignal = '某头部客户连续两周增加机器人零部件招标，同时供应商交期从 45 天缩短到 21 天。';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const stableId = (text: string) => {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
};

const collectMatches = (text: string, dictionary: string[]) => dictionary.filter((keyword) => text.includes(keyword));

export class AphlaCognitionEngine {
  private readonly config: EngineConfig;

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = {
      admissibleThreshold: 72,
      baseReliability: 0.68,
      ...config,
    };
  }

  run(signal: string | SourceSignal): CognitionOutput {
    const sourceSignal = typeof signal === 'string' ? { rawText: signal } : signal;
    const normalized = this.normalize(sourceSignal);
    const scored = this.score(normalized);
    const facts = this.materializeFacts(scored);
    return this.reason(scored, facts);
  }

  private normalize(signal: SourceSignal): NormalizedSignal {
    const canonicalText = (signal.rawText.trim() || sampleSignal)
      .replace(/\s+/g, ' ')
      .replace(/[，,]+/g, '，')
      .replace(/[。\.]+$/g, '。');
    const keywords = [...collectMatches(canonicalText, opportunityKeywords), ...collectMatches(canonicalText, riskKeywords)];
    const entities = collectMatches(canonicalText, entityHints);

    return {
      id: `sig-${stableId(canonicalText)}`,
      canonicalText,
      sourceName: signal.sourceName ?? 'manual-intake',
      sourceReliability: clamp(signal.sourceReliability ?? this.config.baseReliability, 0, 1),
      observedAt: signal.observedAt ?? new Date().toISOString(),
      entities: entities.length > 0 ? entities : ['未知实体'],
      keywords,
    };
  }

  private score(normalized: NormalizedSignal): ScoredSignal {
    const opportunityHits = collectMatches(normalized.canonicalText, opportunityKeywords);
    const riskHits = collectMatches(normalized.canonicalText, riskKeywords);
    const evidenceDensity = clamp(normalized.canonicalText.length / 80, 0, 1);
    const entityCoverage = clamp(normalized.entities.length / 4, 0, 1);
    const score = Math.round(
      40 +
        normalized.sourceReliability * 20 +
        opportunityHits.length * 8 +
        riskHits.length * 9 +
        evidenceDensity * 10 +
        entityCoverage * 10,
    );
    const reasons = [
      `source=${normalized.sourceName} reliability=${normalized.sourceReliability.toFixed(2)}`,
      `keywords=${normalized.keywords.join('/') || 'none'}`,
      `entities=${normalized.entities.join('/')}`,
    ];

    return {
      normalized,
      score: clamp(score, 0, 98),
      admissible: score >= this.config.admissibleThreshold,
      reasons,
    };
  }

  private materializeFacts(scored: ScoredSignal): KnowledgeFact[] {
    const { normalized } = scored;
    const subject = normalized.entities[0] ?? '未知实体';
    const movement = riskKeywords.some((keyword) => normalized.canonicalText.includes(keyword)) ? '风险异常' : '机会增强';

    return [
      {
        id: `fact-${stableId(`${normalized.id}:movement`)}`,
        subject,
        predicate: 'signal_movement',
        object: movement,
        confidence: clamp(scored.score / 100, 0.4, 0.96),
        evidenceIds: [normalized.id],
      },
      {
        id: `fact-${stableId(`${normalized.id}:entities`)}`,
        subject,
        predicate: 'related_entities',
        object: normalized.entities.join(' / '),
        confidence: clamp(0.45 + normalized.entities.length * 0.1, 0.45, 0.92),
        evidenceIds: [normalized.id],
      },
    ];
  }

  private reason(scored: ScoredSignal, facts: KnowledgeFact[]): CognitionOutput {
    const { normalized } = scored;
    const hasRisk = riskKeywords.some((keyword) => normalized.canonicalText.includes(keyword));
    const entity = normalized.entities.join(' / ');
    const confidence = clamp((scored.score / 100 + normalized.sourceReliability) / 2, 0.35, 0.96);
    const thesis = hasRisk
      ? '领先认知：该信号提示需求或交付链路存在异常，需要优先验证是否会影响收入确认。'
      : '领先认知：采购、交付或合作信号正在同步改善，可能预示下游需求拐点或供应链进入放量阶段。';
    const action = scored.admissible
      ? hasRisk
        ? '自动动作：推送风险预警，创建专家复核任务，并要求补充反证来源。'
        : '自动动作：生成客户简报、更新 API 机会评分，并创建销售跟进任务。'
      : '自动动作：暂不发布结论，进入观察池并等待更多证据。';

    return {
      normalized: `已标准化 ${normalized.id}：${normalized.canonicalText}`,
      score: scored.score,
      entity,
      thesis,
      action,
      confidence,
      facts,
      stages: [
        { label: 'Signal Normalizer', value: `清洗文本、统一标点和时间，生成 ${normalized.id}` },
        { label: 'Relevance Scorer', value: `评分 ${scored.score}/100；${scored.reasons.join('；')}` },
        { label: 'Entity Registry', value: `归一实体：${entity}` },
        { label: 'Ontology Graph Store', value: `写入 ${facts.length} 条 fact，并保留证据 ${normalized.id}` },
        { label: 'Reasoning Engine', value: `${thesis} 置信度 ${Math.round(confidence * 100)}%` },
        { label: 'Workflow Automation', value: action },
      ],
    };
  }
}

export const aphlaEngine = new AphlaCognitionEngine();
