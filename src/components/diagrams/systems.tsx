import { Fragment, type ReactNode } from "react";
import { Figure } from "./primitives";

/* Diagrams for Part 2 of the Databricks GenAI study guide: assembling RAG apps, compound AI and agents. */

const MLFLOW_NODES = [
  { label: "Experiment tracking", x: 180, y: 42 },
  { label: "Evaluation", x: 290, y: 98 },
  { label: "Model Registry", x: 290, y: 202 },
  { label: "Serving", x: 180, y: 258 },
  { label: "Generative AI", x: 70, y: 202 },
  { label: "Visualization", x: 70, y: 98 },
];

export function MlflowCycle() {
  return (
    <Figure caption="MLflow covers the whole lifecycle. The course recommends using the Model Registry in Unity Catalog.">
      <svg viewBox="0 0 360 300" className="mx-auto w-full max-w-md" role="img" aria-label="MLflow components arranged in a cycle: experiment tracking, evaluation, model registry, serving, generative AI and visualization">
        <ellipse cx="180" cy="150" rx="110" ry="104" className="fill-none stroke-secondary" strokeWidth="6" strokeOpacity="0.35" />
        <text x="180" y="158" textAnchor="middle" className="fill-ink font-display" fontSize="26" fontWeight="800">
          MLflow
        </text>
        {MLFLOW_NODES.map((n) => (
          <g key={n.label}>
            <rect x={n.x - 62} y={n.y - 17} width="124" height="34" rx="9" className="fill-surface stroke-line" strokeWidth="2" />
            <text x={n.x} y={n.y + 4.5} textAnchor="middle" className="fill-ink" fontSize="12.5" fontWeight="700">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </Figure>
  );
}

export function AliasTimeline() {
  const versions = [
    { v: "v1" },
    { v: "v2", alias: "@challenger", cls: "bg-accent" },
    { v: "v3", alias: "@champion", cls: "bg-secondary" },
  ];
  return (
    <Figure caption="Registered models in Unity Catalog are versioned. Aliases such as @champion mark the version that production should load.">
      <div className="rounded-xl border-2 border-dashed border-[var(--warning)]/60 bg-[var(--warning-soft)] p-4">
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-muted">Unity Catalog · Model Registry</div>
        <div className="flex items-end gap-2">
          {versions.map((ver, i) => (
            <Fragment key={ver.v}>
              {i > 0 && <div aria-hidden="true" className="mb-4 h-0.5 flex-1 bg-ink-muted/40" />}
              <div className="flex flex-col items-center gap-1.5">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-bg ${ver.cls ?? "invisible"}`}>
                  {ver.alias ?? "none"}
                </span>
                <span className="rounded-lg border-2 border-ink bg-surface px-3 py-1.5 font-mono text-sm font-bold">{ver.v}</span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </Figure>
  );
}

const EVAL_METRICS = [
  { name: "Context precision", kind: "Retrieval", uses: "Query + Context", desc: "Signal-to-noise of the retrieved context: are relevant chunks ranked above irrelevant ones?" },
  { name: "Context relevancy", kind: "Retrieval", uses: "Query + Context", desc: "How relevant the retrieved context is to the question, not whether it is factually right." },
  { name: "Context recall", kind: "Retrieval", uses: "Ground truth + Context", desc: "Were all the relevant entities and facts retrieved into the context?" },
  { name: "Faithfulness", kind: "Generation", uses: "Response + Context", desc: "Is the generated answer factually accurate with respect to the provided context?" },
  { name: "Answer relevancy", kind: "Generation", uses: "Response + Query", desc: "How pertinent the response is to the user's intent and the query's specifics." },
  { name: "Answer correctness", kind: "Generation", uses: "Ground truth + Response", desc: "Semantic and factual similarity of the answer to the ground truth." },
];

export function RagEvalMap() {
  return (
    <Figure caption="Every RAG metric compares two of four things: the query, the retrieved context, the response and the ground truth.">
      <svg viewBox="0 0 420 250" className="mx-auto w-full max-w-lg" role="img" aria-label="Query at the top, context at the bottom right, response at the bottom left and ground truth in the middle, with the question each edge asks">
        <defs>
          <marker id="rag-eval-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" className="fill-ink-muted" />
          </marker>
        </defs>
        <path d="M232 52 L318 178" className="stroke-ink-muted" strokeWidth="2" markerEnd="url(#rag-eval-arrow)" />
        <path d="M300 200 H128" className="stroke-ink-muted" strokeWidth="2" markerEnd="url(#rag-eval-arrow)" />
        <path d="M100 178 L186 52" className="stroke-ink-muted" strokeWidth="2" markerEnd="url(#rag-eval-arrow)" />

        <rect x="160" y="16" width="100" height="34" rx="17" className="fill-secondary-soft stroke-secondary" strokeWidth="2" />
        <text x="210" y="38" textAnchor="middle" className="fill-ink" fontSize="14" fontWeight="700">Query</text>
        <rect x="300" y="183" width="104" height="34" rx="17" className="fill-surface stroke-accent" strokeWidth="2" />
        <text x="352" y="205" textAnchor="middle" className="fill-ink" fontSize="14" fontWeight="700">Context</text>
        <rect x="16" y="183" width="110" height="34" rx="17" className="fill-primary-soft stroke-primary" strokeWidth="2" />
        <text x="71" y="205" textAnchor="middle" className="fill-ink" fontSize="14" fontWeight="700">Response</text>
        <rect x="155" y="108" width="110" height="32" rx="6" className="fill-ink" />
        <text x="210" y="129" textAnchor="middle" className="fill-bg" fontSize="13" fontWeight="700">Ground truth</text>

        <text x="288" y="86" className="fill-ink-muted" fontSize="11.5">Is the context</text>
        <text x="288" y="100" className="fill-ink-muted" fontSize="11.5">related to</text>
        <text x="288" y="114" className="fill-ink-muted" fontSize="11.5">the query?</text>
        <text x="214" y="234" textAnchor="middle" className="fill-ink-muted" fontSize="11.5">Is the response supported by the context?</text>
        <text x="12" y="86" className="fill-ink-muted" fontSize="11.5">Is the answer</text>
        <text x="12" y="100" className="fill-ink-muted" fontSize="11.5">relevant and</text>
        <text x="12" y="114" className="fill-ink-muted" fontSize="11.5">accurate?</text>
      </svg>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {EVAL_METRICS.map((m) => {
          const retrieval = m.kind === "Retrieval";
          return (
            <div key={m.name} className={`rounded-xl border-2 p-3.5 ${retrieval ? "border-accent/50 bg-surface" : "border-primary/50 bg-surface"}`}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-display font-bold">{m.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-bg ${retrieval ? "bg-accent" : "bg-primary"}`}>
                  {m.kind}
                </span>
              </div>
              <div className="mt-1 font-mono text-xs font-semibold text-secondary">{m.uses}</div>
              <div className="mt-1 text-sm leading-snug text-ink-muted">{m.desc}</div>
            </div>
          );
        })}
      </div>
    </Figure>
  );
}

export function SystemIntents() {
  const intents = [
    { name: "Intent A", tasks: 2 },
    { name: "Intent B", tasks: 1 },
    { name: "Intent C", tasks: 3 },
  ];
  return (
    <Figure caption="A system serves several intents, and each intent is made of one or more tasks.">
      <div className="grid gap-5 sm:grid-cols-[1fr_1fr] sm:items-center">
        <div className="rounded-2xl border-2 border-[var(--warning)]/60 bg-[var(--warning-soft)] p-4">
          <div className="mb-3 text-center font-display font-bold">System</div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {intents.map((intent) => (
              <div key={intent.name} className="rounded-xl border-2 border-secondary/50 bg-secondary-soft px-3 py-2 text-center">
                <div className="text-sm font-bold text-secondary">{intent.name}</div>
                <div className="mt-1.5 flex justify-center gap-1.5">
                  {Array.from({ length: intent.tasks }, (_, i) => (
                    <span key={i} className="rounded-full border-2 border-secondary/60 bg-surface px-2 py-0.5 text-[0.65rem] font-semibold">
                      Task
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-sm leading-relaxed">
          <p>
            <strong className="text-[var(--warning)]">System:</strong> create a personalized response to a customer question.
          </p>
          <p className="mt-2">
            <strong className="text-secondary">Intents:</strong> identify the question type (for example, a complaint), identify
            the language of the message…
          </p>
          <p className="mt-2">
            <strong>Tasks:</strong> retrieve the customer&rsquo;s purchase history, create a message…
          </p>
        </div>
      </div>
    </Figure>
  );
}

function MiniStep({ children, tone = "border-line bg-surface" }: { children: ReactNode; tone?: string }) {
  return <div className={`rounded-lg border-2 px-3 py-1.5 text-center text-sm font-semibold ${tone}`}>{children}</div>;
}

function Down() {
  return (
    <div aria-hidden="true" className="text-center leading-none text-ink-muted">
      ↓
    </div>
  );
}

export function AgenticVsNot() {
  return (
    <Figure caption="Same question, “Should I invest in NVIDIA stock?” On the left the steps are hard-coded; on the right the agent picks the actions and their order.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 rounded-xl border-2 border-line bg-surface p-4">
          <div className="mb-1 text-center font-display font-bold">Non-agentic workflow</div>
          <MiniStep>User prompt</MiniStep>
          <Down />
          <MiniStep>Action 1 (hard-coded)</MiniStep>
          <Down />
          <MiniStep>Action 2 (hard-coded)</MiniStep>
          <Down />
          <MiniStep>Final output</MiniStep>
        </div>
        <div className="flex flex-col gap-1.5 rounded-xl border-2 border-secondary/50 bg-secondary-soft p-4">
          <div className="mb-1 text-center font-display font-bold text-secondary">Agentic workflow</div>
          <MiniStep>User prompt</MiniStep>
          <Down />
          <div className="rounded-xl border-2 border-dashed border-secondary/70 p-2">
            <div className="mb-1.5 text-center text-[0.7rem] font-bold uppercase tracking-wider text-secondary">
              Agent decides actions and their order
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="flex-1"><MiniStep>Action 1</MiniStep></div>
                <span className="text-xs font-bold text-accent">⇄ LLM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1"><MiniStep>Action 2</MiniStep></div>
                <span className="text-xs font-bold text-accent">⇄ LLM</span>
              </div>
            </div>
          </div>
          <Down />
          <MiniStep>Final output</MiniStep>
        </div>
      </div>
    </Figure>
  );
}

export function AgentAnatomy() {
  const satellites = [
    { label: "Planning", x: 72, y: 210 },
    { label: "Memory", x: 288, y: 210 },
    { label: "Tools", x: 180, y: 304 },
  ];
  return (
    <Figure caption="The core components of a typical agent: a task, an LLM as the brain, and tools, memory and planning around it.">
      <svg viewBox="0 0 360 340" className="mx-auto w-full max-w-sm" role="img" aria-label="An agent: the user request feeds an LLM brain connected to planning, memory and tools">
        <rect x="110" y="10" width="140" height="40" rx="10" className="fill-secondary" />
        <text x="180" y="35" textAnchor="middle" className="fill-bg" fontSize="14" fontWeight="700">User request (task)</text>
        <path d="M180 50 V98" className="stroke-ink-muted" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="180" cy="205" r="122" className="fill-[var(--warning-soft)] stroke-[var(--warning)]" strokeWidth="2" strokeDasharray="6 6" />
        <text x="180" y="118" textAnchor="middle" className="fill-[var(--warning)]" fontSize="13" fontWeight="800" letterSpacing="2">AGENT</text>
        {satellites.map((s) => (
          <g key={s.label}>
            <path d={`M180 196 L${s.x} ${s.y}`} className="stroke-ink-muted" strokeWidth="2" />
            <rect x={s.x - 46} y={s.y - 16} width="92" height="32" rx="16" className="fill-surface stroke-line" strokeWidth="2" />
            <text x={s.x} y={s.y + 5} textAnchor="middle" className="fill-ink" fontSize="13" fontWeight="700">{s.label}</text>
          </g>
        ))}
        <circle cx="180" cy="190" r="44" className="fill-[color-mix(in_srgb,var(--accent)_18%,var(--surface))] stroke-accent" strokeWidth="2.5" />
        <text x="180" y="187" textAnchor="middle" className="fill-accent" fontSize="17" fontWeight="800">LLM</text>
        <text x="180" y="205" textAnchor="middle" className="fill-ink-muted" fontSize="11.5" fontWeight="600">the brain</text>
      </svg>
    </Figure>
  );
}

export function ReactLoop() {
  const nodes = [
    { label: "Thought", note: "Reflect on the problem and past actions", x: 180, y: 46, tone: "fill-[color-mix(in_srgb,var(--accent)_16%,var(--surface))] stroke-accent" },
    { label: "Act", note: "Choose the tool and input format", x: 306, y: 196, tone: "fill-primary-soft stroke-primary" },
    { label: "Observe", note: "Evaluate the result, then think again", x: 54, y: 196, tone: "fill-secondary-soft stroke-secondary" },
  ];
  return (
    <Figure caption="ReAct (Reason + Act) makes the model produce verbal reasoning traces and actions, looping until it can answer.">
      <svg viewBox="0 0 360 260" className="mx-auto w-full max-w-md" role="img" aria-label="The ReAct loop: Thought leads to Act, Act leads to Observe, Observe leads back to Thought">
        <defs>
          <marker id="react-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0L10 5L0 10z" className="fill-ink-muted" />
          </marker>
        </defs>
        <path d="M232 52 Q300 80 312 160" className="fill-none stroke-ink-muted" strokeWidth="2" markerEnd="url(#react-arrow)" />
        <path d="M252 214 Q180 248 110 214" className="fill-none stroke-ink-muted" strokeWidth="2" markerEnd="url(#react-arrow)" />
        <path d="M46 160 Q58 80 126 52" className="fill-none stroke-ink-muted" strokeWidth="2" markerEnd="url(#react-arrow)" />
        <text x="180" y="150" textAnchor="middle" className="fill-ink font-display" fontSize="22" fontWeight="800">ReAct</text>
        {nodes.map((n) => (
          <g key={n.label}>
            <rect x={n.x - 52} y={n.y - 20} width="104" height="40" rx="20" className={n.tone} strokeWidth="2.5" />
            <text x={n.x} y={n.y + 5.5} textAnchor="middle" className="fill-ink" fontSize="15" fontWeight="800">{n.label}</text>
          </g>
        ))}
      </svg>
      <div className="mt-2 grid gap-2 text-center text-xs leading-snug text-ink-muted sm:grid-cols-3">
        {nodes.map((n) => (
          <div key={n.label}>
            <strong className="text-ink">{n.label}:</strong> {n.note}
          </div>
        ))}
      </div>
    </Figure>
  );
}
