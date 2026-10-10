import type { ReactNode } from "react";
import { Figure } from "./primitives";

/* Diagrams for Part 3 of the Databricks GenAI study guide: evaluation, deployment and LLMOps. */

function Distribution({ peaked, label, note }: { peaked: boolean; label: string; note: string }) {
  // Bars stand for the model's probability over the vocabulary; the highlighted bar is the correct token.
  const heights = peaked
    ? [6, 9, 5, 8, 7, 82, 9, 6, 10, 5, 7, 6]
    : [18, 26, 22, 30, 24, 34, 28, 21, 27, 19, 25, 20];
  return (
    <div className="rounded-xl border-2 border-line bg-surface p-3 text-center">
      <svg viewBox="0 0 180 110" className="mx-auto w-full max-w-[14rem]" role="img" aria-label={`${label}: ${note}`}>
        <path d="M8 96 H172" className="stroke-ink-muted" strokeWidth="1.5" />
        {heights.map((h, i) => (
          <rect
            key={i}
            x={12 + i * 13.5}
            y={96 - h}
            width="10"
            height={h}
            rx="2"
            className={i === 5 ? "fill-primary" : "fill-ink-muted/40"}
          />
        ))}
        <text x="91" y="108" textAnchor="middle" className="fill-ink-muted" fontSize="9">vocabulary</text>
      </svg>
      <div className="font-display font-bold">{label}</div>
      <div className="text-xs leading-snug text-ink-muted">{note}</div>
    </div>
  );
}

export function PerplexityChart() {
  return (
    <Figure caption="Perplexity asks whether the model was surprised that it was correct. The orange bar is the correct token.">
      <div className="grid gap-3 sm:grid-cols-2">
        <Distribution peaked label="Low perplexity" note="A sharp peak on the correct token means high confidence." />
        <Distribution peaked={false} label="High perplexity" note="A flat distribution means low confidence." />
      </div>
    </Figure>
  );
}

function Hit({ children, tone }: { children: ReactNode; tone: "phrase" | "word" }) {
  const cls = tone === "phrase" ? "bg-secondary-soft text-secondary" : "bg-[color-mix(in_srgb,var(--accent)_16%,var(--surface))] text-accent";
  return <mark className={`rounded px-1 font-semibold ${cls}`}>{children}</mark>;
}

export function NgramMatch() {
  return (
    <Figure caption="BLEU and ROUGE both score an output by its n-gram overlap with a reference. Longer shared n-grams count for more than single words.">
      <div className="flex flex-col gap-3 text-[0.95rem]">
        <div className="grid gap-1 sm:grid-cols-[7.5rem_1fr] sm:items-baseline">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">LLM output</span>
          <span className="rounded-lg border-2 border-line bg-surface px-3 py-2 leading-relaxed">
            <Hit tone="phrase">What happens when you&rsquo;re busy</Hit> <Hit tone="word">is</Hit> <Hit tone="word">life</Hit>{" "}
            happens.
          </span>
        </div>
        <div className="grid gap-1 sm:grid-cols-[7.5rem_1fr] sm:items-baseline">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Reference</span>
          <span className="rounded-lg border-2 border-line bg-surface px-3 py-2 leading-relaxed">
            <Hit tone="word">Life</Hit> <Hit tone="word">is</Hit> <Hit tone="phrase">what happens when you&rsquo;re busy</Hit>{" "}
            making other plans.
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
          <span>
            <Hit tone="phrase">shared</Hit> multi-word n-grams (bi-grams, tri-grams…)
          </span>
          <span>
            <Hit tone="word">shared</Hit> single words (unigrams)
          </span>
        </div>
      </div>
    </Figure>
  );
}

export function DeploymentSpectrum() {
  const modes = [
    { name: "Batch", desc: "Generate (and store) completions on a table of text inputs or prompts." },
    { name: "Streaming", desc: "Generate (and store) completions on micro-batches of inputs as they're processed." },
    { name: "Real-time", desc: "Generate completions asynchronously in real time on individual inputs." },
  ];
  return (
    <Figure caption="Deployment paradigms carry over from traditional ML. Edge (on-device) deployment is hard with LLMs because of their size.">
      <div className="mb-3 flex flex-col gap-1.5">
        <div className="flex items-center rounded-full bg-primary px-4 py-1 text-sm font-bold text-bg">
          <span className="flex-1 text-center">Latency decreases</span>
          <span aria-hidden="true">→</span>
        </div>
        <div className="flex items-center rounded-full bg-secondary px-4 py-1 text-sm font-bold text-bg">
          <span className="flex-1 text-center">Throughput decreases</span>
          <span aria-hidden="true">→</span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {modes.map((m) => (
          <div key={m.name} className="rounded-xl border-2 border-ink bg-surface p-3.5 text-center">
            <div className="font-display text-lg font-bold">{m.name}</div>
            <div className="mt-1 text-sm leading-snug text-ink-muted">{m.desc}</div>
          </div>
        ))}
      </div>
    </Figure>
  );
}

export function TrafficSplit() {
  return (
    <Figure caption="One serving endpoint can serve several models and split traffic between them, for A/B tests or canary deployments.">
      <svg viewBox="0 0 360 170" className="mx-auto w-full max-w-md" role="img" aria-label="fraud_classifier v1 receives 80% of traffic and v2 receives 20%, both behind one endpoint">
        <path d="M150 42 H210 Q230 42 230 62 V72 Q230 85 250 85 H262" className="fill-none stroke-secondary" strokeWidth="3" />
        <path d="M150 128 H210 Q230 128 230 108 V98 Q230 85 250 85 H262" className="fill-none stroke-primary" strokeWidth="3" />
        <rect x="10" y="24" width="140" height="36" rx="8" className="fill-surface stroke-line" strokeWidth="2" />
        <text x="80" y="47" textAnchor="middle" className="fill-ink" fontSize="13" fontWeight="700">fraud_classifier/v1</text>
        <rect x="10" y="110" width="140" height="36" rx="8" className="fill-surface stroke-line" strokeWidth="2" />
        <text x="80" y="133" textAnchor="middle" className="fill-ink" fontSize="13" fontWeight="700">fraud_classifier/v2</text>
        <rect x="164" y="30" width="44" height="22" rx="11" className="fill-secondary" />
        <text x="186" y="45.5" textAnchor="middle" className="fill-bg" fontSize="12" fontWeight="800">80%</text>
        <rect x="164" y="117" width="44" height="22" rx="11" className="fill-primary" />
        <text x="186" y="132.5" textAnchor="middle" className="fill-bg" fontSize="12" fontWeight="800">20%</text>
        <rect x="262" y="62" width="88" height="46" rx="10" className="fill-secondary-soft stroke-secondary" strokeWidth="2" />
        <text x="306" y="82" textAnchor="middle" className="fill-ink" fontSize="13" fontWeight="800">Endpoint</text>
        <text x="306" y="98" textAnchor="middle" className="fill-ink-muted" fontSize="10">fraud_prod</text>
      </svg>
    </Figure>
  );
}

function EnvBox({ name, code, model }: { name: string; code: boolean; model: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-lg border-2 border-line bg-surface px-2 py-2">
      <div className="text-xs font-bold uppercase tracking-wider text-ink-muted">{name}</div>
      <div className="flex gap-1">
        {code && <span className="rounded bg-accent px-1.5 py-0.5 text-[0.65rem] font-bold text-bg">code</span>}
        {model && <span className="rounded bg-primary px-1.5 py-0.5 text-[0.65rem] font-bold text-bg">model</span>}
      </div>
    </div>
  );
}

export function EnvPromotion() {
  return (
    <Figure caption="Two ways to move work from development to production. Databricks recommends deploying code.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-line p-3.5">
          <div className="font-display text-lg font-bold">Deploy model</div>
          <div className="my-3 flex gap-1.5">
            <EnvBox name="dev" code model />
            <EnvBox name="staging" code={false} model />
            <EnvBox name="prod" code={false} model />
          </div>
          <p className="text-sm leading-snug text-ink-muted">
            The model is trained in development, then the model artifact moves through staging to production. Other code
            (inference, monitoring, operational pipelines) needs its own separate process.
          </p>
        </div>
        <div className="rounded-xl border-2 border-secondary/60 bg-secondary-soft p-3.5">
          <div className="font-display text-lg font-bold text-secondary">Deploy code (recommended)</div>
          <div className="my-3 flex gap-1.5">
            <EnvBox name="dev" code model />
            <EnvBox name="staging" code model />
            <EnvBox name="prod" code model />
          </div>
          <p className="text-sm leading-snug text-ink-muted">
            Code is developed in dev, tested in staging and deployed to production. The training pipeline runs in each
            environment, and the model is deployed in production.
          </p>
        </div>
      </div>
    </Figure>
  );
}
