import { Card, Cards, Figure, Flow, Lane, Lanes, Step } from "./primitives";
import { ChunkingStrategies, EmbeddingDecision, KnowledgeSpectrum, PromptAnatomy, SimilarityMetrics } from "./retrieval";
import { AgentAnatomy, AgenticVsNot, AliasTimeline, MlflowCycle, RagEvalMap, ReactLoop, SystemIntents } from "./systems";
import { DeploymentSpectrum, EnvPromotion, NgramMatch, PerplexityChart, TrafficSplit } from "./operations";

/** Every diagram component, keyed by the tag name MDX posts use. */
export const diagramComponents = {
  Figure,
  Flow,
  Step,
  Lanes,
  Lane,
  Cards,
  Card,
  PromptAnatomy,
  KnowledgeSpectrum,
  ChunkingStrategies,
  EmbeddingDecision,
  SimilarityMetrics,
  MlflowCycle,
  AliasTimeline,
  RagEvalMap,
  SystemIntents,
  AgenticVsNot,
  AgentAnatomy,
  ReactLoop,
  PerplexityChart,
  NgramMatch,
  DeploymentSpectrum,
  TrafficSplit,
  EnvPromotion,
};
