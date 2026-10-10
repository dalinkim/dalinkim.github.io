import type { ReactNode } from "react";
import { Figure } from "./primitives";

/* Diagrams for Part 1 of the Databricks GenAI study guide: prompts, RAG data prep and vector search. */

const PROMPT_PARTS = [
  { name: "Instruction", desc: "A clear directive that says what the model should do.", cls: "bg-secondary-soft text-secondary" },
  { name: "Context", desc: "Background information the model needs to understand the task.", cls: "bg-[color-mix(in_srgb,var(--accent)_16%,var(--surface))] text-accent" },
  { name: "Input / question", desc: "The specific query or data to process.", cls: "bg-primary-soft text-primary" },
  { name: "Output format", desc: "The structure or style of the response.", cls: "bg-[var(--warning-soft)] text-[var(--warning)]" },
];

function Mark({ part, children }: { part: number; children: ReactNode }) {
  return <mark className={`rounded px-1 py-0.5 font-semibold ${PROMPT_PARTS[part].cls}`}>{children}</mark>;
}

export function PromptAnatomy() {
  return (
    <Figure caption="The four components of a good prompt, colour-coded in the course's polar bear example.">
      <div className="grid gap-5 sm:grid-cols-[1fr_1.2fr] sm:items-center">
        <div className="flex flex-col gap-2.5">
          {PROMPT_PARTS.map((p) => (
            <div key={p.name} className="flex items-start gap-2.5 text-sm leading-snug">
              <span className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${p.cls}`}>{p.name}</span>
              <span className="text-ink-muted">{p.desc}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border-2 border-line bg-surface p-4 font-mono text-[0.8rem] leading-relaxed">
          <Mark part={0}>Summarize</Mark> the following article and write a list of{" "}
          <Mark part={3}>top 3 important points in markdown format</Mark> that answer the following{" "}
          <Mark part={2}>question</Mark>: &ldquo;How is climate change affecting polar bear habitats and their ability
          to find food?&rdquo;
          <br />
          <br />
          <Mark part={1}>Article:</Mark> &lt;The article discusses the impact of climate change on polar bear
          populations in the Arctic.&gt;
        </div>
      </div>
    </Figure>
  );
}

const KNOWLEDGE = [
  { title: "Model pre-training", points: ["Train an LLM from scratch", "Needs billions to trillions of tokens"] },
  { title: "Model fine-tuning", points: ["Adapt a pre-trained LLM to a domain or dataset", "Needs thousands of domain or instruction examples"] },
  { title: "Passing context", points: ["Combine an LLM with external knowledge retrieval", "Needs an external knowledge base"], focus: true },
];

export function KnowledgeSpectrum() {
  return (
    <Figure caption="Three ways a language model learns knowledge. The certification focuses on the right-hand one.">
      <div className="grid gap-3 sm:grid-cols-3">
        {KNOWLEDGE.map((k) => (
          <div
            key={k.title}
            className={`relative rounded-xl border-2 p-4 ${k.focus ? "border-secondary bg-secondary-soft" : "border-line bg-surface"}`}
          >
            {k.focus && (
              <span className="absolute -top-3 right-3 rounded-full bg-secondary px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-bg">
                RAG lives here
              </span>
            )}
            <div className={`font-display text-lg font-bold ${k.focus ? "text-secondary" : ""}`}>{k.title}</div>
            {k.points.map((p) => (
              <p key={p} className="mt-1.5 text-sm leading-snug text-ink-muted">
                {p}
              </p>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm font-bold text-secondary">
        <span className="h-2 flex-1 rounded-full bg-linear-to-r from-line to-secondary" />
        <span>Less complexity and compute</span>
        <span aria-hidden="true">→</span>
      </div>
    </Figure>
  );
}

const CHUNK_COLORS = ["bg-primary", "bg-secondary", "bg-accent", "bg-[var(--warning)]"];

function StrategyRow({ name, note, children }: { name: string; note: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[11rem_1fr] sm:items-center">
      <div>
        <div className="font-display font-bold leading-tight">{name}</div>
        <div className="text-xs leading-snug text-ink-muted">{note}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function ChunkingStrategies() {
  const fixed = [25, 25, 25, 25];
  const aware = [38, 17, 30, 15];
  const overlap = [
    { left: 0, width: 38 },
    { left: 30, width: 38 },
    { left: 60, width: 40 },
  ];
  return (
    <Figure caption="The same document split four ways. Each coloured bar is one chunk that gets embedded on its own.">
      <div className="flex flex-col gap-5">
        <StrategyRow name="Fixed-size" note="Divide by a set number of tokens. Simple and cheap.">
          <div className="flex h-5 gap-1">
            {fixed.map((w, i) => (
              <div key={i} className={`rounded ${CHUNK_COLORS[i]}`} style={{ width: `${w}%` }} />
            ))}
          </div>
        </StrategyRow>
        <StrategyRow name="Context-aware" note="Split by sentence, paragraph or section, using punctuation like “.” or “\n”.">
          <div className="flex h-5 gap-1">
            {aware.map((w, i) => (
              <div key={i} className={`rounded ${CHUNK_COLORS[i]}`} style={{ width: `${w}%` }} />
            ))}
          </div>
        </StrategyRow>
        <StrategyRow name="Overlap" note="Consecutive chunks share text so no context is lost at the edges.">
          <div className="relative h-[3.25rem]">
            {overlap.map((c, i) => (
              <div
                key={i}
                className={`absolute h-3.5 rounded opacity-85 ${CHUNK_COLORS[i]}`}
                style={{ left: `${c.left}%`, width: `${c.width}%`, top: `${i * 1.1}rem` }}
              />
            ))}
          </div>
        </StrategyRow>
        <StrategyRow name="Windowed summarization" note="Each chunk carries a summary of the previous few chunks.">
          <div className="flex h-5 gap-1">
            <div className={`rounded ${CHUNK_COLORS[0]}`} style={{ width: "32%" }} />
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-0.5" style={{ width: "34%" }}>
                <div className="flex w-1/3 items-center justify-center rounded border-2 border-dashed border-ink-muted/60 text-[0.6rem] font-bold text-ink-muted">
                  Σ prev
                </div>
                <div className={`w-2/3 rounded ${CHUNK_COLORS[i]}`} />
              </div>
            ))}
          </div>
        </StrategyRow>
      </div>
    </Figure>
  );
}

export function EmbeddingDecision() {
  const outcomes = [
    { label: "Yes", title: "Keep using that model", tone: "border-secondary bg-secondary-soft text-secondary" },
    { label: "No", title: "Choose another pre-trained embedding model", tone: "border-primary/50 bg-primary-soft text-primary" },
    { label: "No", title: "Train or fine-tune embeddings on your data (e.g. fine-tune BERT)", tone: "border-primary/50 bg-primary-soft text-primary" },
  ];
  return (
    <Figure caption="Choosing an embedding model. It has to represent both your documents and your users' queries.">
      <div className="mx-auto max-w-sm rounded-xl border-2 border-ink bg-surface px-4 py-3 text-center font-display font-bold">
        Was the embedding model trained on data similar to yours?
      </div>
      <div className="mx-auto h-5 w-0.5 bg-ink-muted/50" />
      <div className="grid gap-3 sm:grid-cols-3">
        {outcomes.map((o, i) => (
          <div key={i} className={`rounded-xl border-2 px-3 py-3 text-center ${o.tone}`}>
            <div className="text-xs font-bold uppercase tracking-wider">{o.label}</div>
            <div className="mt-1 text-sm font-semibold leading-snug text-ink">{o.title}</div>
          </div>
        ))}
      </div>
    </Figure>
  );
}

function Axes() {
  return <path d="M20 112V14M20 112h124" className="stroke-ink-muted" strokeWidth="1.5" fill="none" />;
}

export function SimilarityMetrics() {
  return (
    <Figure caption="Distance metrics: higher means less similar. Similarity metrics: higher means more similar. Cosine similarity behaves like L2 distance once vectors are normalized.">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border-2 border-line bg-surface p-3 text-center">
          <svg viewBox="0 0 160 124" className="mx-auto w-full max-w-[12rem]" role="img" aria-label="Euclidean distance as a straight line between two points">
            <Axes />
            <path d="M52 88 L112 40" className="stroke-secondary" strokeWidth="3" strokeDasharray="5 4" />
            <circle cx="52" cy="88" r="7" className="fill-accent" />
            <circle cx="112" cy="40" r="7" className="fill-primary" />
          </svg>
          <div className="font-display font-bold">Euclidean (L2)</div>
          <div className="text-xs text-ink-muted">Distance. The most popular one.</div>
        </div>
        <div className="rounded-xl border-2 border-line bg-surface p-3 text-center">
          <svg viewBox="0 0 160 124" className="mx-auto w-full max-w-[12rem]" role="img" aria-label="Manhattan distance as a right-angled path between two points">
            <Axes />
            <path d="M52 88 H112 V40" className="stroke-secondary" strokeWidth="3" strokeDasharray="5 4" fill="none" />
            <circle cx="52" cy="88" r="7" className="fill-accent" />
            <circle cx="112" cy="40" r="7" className="fill-primary" />
          </svg>
          <div className="font-display font-bold">Manhattan (L1)</div>
          <div className="text-xs text-ink-muted">Distance along each axis.</div>
        </div>
        <div className="rounded-xl border-2 border-line bg-surface p-3 text-center">
          <svg viewBox="0 0 160 124" className="mx-auto w-full max-w-[12rem]" role="img" aria-label="Cosine similarity as the angle between two vectors">
            <Axes />
            <path d="M20 112 L96 20" className="stroke-accent" strokeWidth="3" />
            <path d="M20 112 L138 50" className="stroke-primary" strokeWidth="3" />
            <path d="M56 69 A56 56 0 0 1 70 86" className="stroke-secondary" strokeWidth="2.5" fill="none" />
            <text x="74" y="74" className="fill-secondary" fontSize="13" fontWeight="700">θ</text>
          </svg>
          <div className="font-display font-bold">Cosine similarity</div>
          <div className="text-xs text-ink-muted">Angle between vectors. The most popular one.</div>
        </div>
      </div>
    </Figure>
  );
}
