import { Children, Fragment, isValidElement, type ReactNode } from "react";

/*
 * Building blocks for diagrams inside MDX posts. They are plain server components styled with the
 * site's colour tokens, so every diagram follows the light/dark theme and reflows on small screens
 * (rows of steps stack vertically below the `sm` breakpoint).
 */

export type Tone = "primary" | "secondary" | "accent" | "warning" | "neutral";

const TONE_BOX: Record<Tone, string> = {
  primary: "border-primary/50 bg-primary-soft",
  secondary: "border-secondary/50 bg-secondary-soft",
  accent: "border-accent/50 bg-[color-mix(in_srgb,var(--accent)_12%,var(--surface))]",
  warning: "border-[var(--warning)]/60 bg-[var(--warning-soft)]",
  neutral: "border-line bg-surface",
};

const TONE_TEXT: Record<Tone, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  warning: "text-[var(--warning)]",
  neutral: "text-ink",
};

/** Frame shared by every diagram: a soft panel with an optional caption underneath. */
export function Figure({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <figure className="my-10 rounded-2xl border border-line bg-surface-muted/60 p-4 sm:p-6">
      {children}
      {caption && (
        <figcaption className="mt-4 text-center text-sm leading-snug text-ink-muted">{caption}</figcaption>
      )}
    </figure>
  );
}

function Arrow({ dense }: { dense: boolean }) {
  return (
    <div aria-hidden="true" className="flex shrink-0 items-center justify-center text-ink-muted">
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 rotate-90 sm:rotate-0 ${dense ? "sm:w-3.5" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M4 12h15m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function StepRow({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement);
  // Five or more steps in one row get tighter padding and smaller titles so long words still fit.
  const dense = items.length >= 5;
  return (
    <div
      className={`flex flex-col items-stretch gap-1.5 sm:flex-row ${
        dense ? "sm:gap-1 sm:[&_[data-step]]:px-1.5 sm:[&_[data-step-title]]:text-[0.8rem]" : ""
      }`}
    >
      {items.map((child, i) => (
        <Fragment key={i}>
          {i > 0 && <Arrow dense={dense} />}
          <div className="flex min-w-0 flex-1">{child}</div>
        </Fragment>
      ))}
    </div>
  );
}

/** A left-to-right pipeline of `<Step>`s. `footer` draws a full-width bar under the steps. */
export function Flow({ caption, footer, children }: { caption?: string; footer?: string; children: ReactNode }) {
  return (
    <Figure caption={caption}>
      <StepRow>{children}</StepRow>
      {footer && (
        <div className="mt-3 rounded-lg border border-dashed border-ink-muted/40 bg-surface px-3 py-2 text-center text-sm font-semibold text-ink-muted">
          {footer}
        </div>
      )}
    </Figure>
  );
}

/** One box in a Flow or Lane. `tag` is a small label above the title (for example "Step 1"). */
export function Step({
  title,
  tag,
  tone = "neutral",
  children,
}: {
  title: string;
  tag?: string;
  tone?: Tone;
  children?: ReactNode;
}) {
  return (
    <div data-step className={`flex w-full flex-col justify-center rounded-xl border-2 px-3 py-2.5 text-center ${TONE_BOX[tone]}`}>
      {tag && <div className="text-[0.7rem] font-bold uppercase tracking-wider text-ink-muted">{tag}</div>}
      <div data-step-title className={`font-display text-[0.95rem] font-bold leading-tight ${TONE_TEXT[tone]}`}>
        {title}
      </div>
      {children && <div className="mt-1 text-xs leading-snug text-ink-muted">{children}</div>}
    </div>
  );
}

/** Several labelled rows of steps stacked in one figure, for architectures with distinct phases. */
export function Lanes({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <Figure caption={caption}>
      <div className="flex flex-col gap-4">{children}</div>
    </Figure>
  );
}

export function Lane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-muted/40 p-3">
      <div className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink-muted">{label}</div>
      <StepRow>{children}</StepRow>
    </div>
  );
}

const COLS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-3",
  "4": "sm:grid-cols-2 md:grid-cols-4",
};

/** A grid of `<Card>`s. `cols` is "2", "3" or "4" (one column on phones). */
export function Cards({ cols = "2", caption, children }: { cols?: string; caption?: string; children: ReactNode }) {
  return (
    <Figure caption={caption}>
      <div className={`grid gap-3 ${COLS[cols] ?? COLS["2"]}`}>{children}</div>
    </Figure>
  );
}

/** A titled card. Children can be plain text or Markdown (lists render with the article's bullets). */
export function Card({
  title,
  tag,
  tone = "neutral",
  children,
}: {
  title: string;
  tag?: string;
  tone?: Tone;
  children?: ReactNode;
}) {
  return (
    <div className={`rounded-xl border-2 p-4 text-[0.95rem] leading-snug ${TONE_BOX[tone]} [&_li+li]:mt-1 [&_p+*]:mt-2 [&_ul]:mt-1`}>
      {tag && <div className="text-[0.7rem] font-bold uppercase tracking-wider text-ink-muted">{tag}</div>}
      <div className={`font-display text-lg font-bold leading-tight ${TONE_TEXT[tone]}`}>{title}</div>
      {children && <div className="mt-2 text-ink-muted">{children}</div>}
    </div>
  );
}
