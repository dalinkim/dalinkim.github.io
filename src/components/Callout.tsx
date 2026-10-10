import type { ReactNode } from "react";

const VARIANTS = {
  info: { label: "Note", box: "border-secondary bg-secondary-soft", tag: "bg-secondary" },
  tip: { label: "Tip", box: "border-accent bg-surface-muted", tag: "bg-accent" },
  warning: {
    label: "Heads up",
    box: "border-[var(--warning)] bg-[var(--warning-soft)]",
    tag: "bg-[var(--warning)]",
  },
};

export default function Callout({
  variant = "info",
  children,
}: {
  variant?: keyof typeof VARIANTS;
  children: ReactNode;
}) {
  const v = VARIANTS[variant];
  return (
    <aside className={`relative my-8 rounded-xl border-l-4 px-5 py-4 sm:px-6 ${v.box} [&>p]:m-0`}>
      <span
        className={`absolute -top-3 left-4 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-bg ${v.tag}`}
      >
        {v.label}
      </span>
      {children}
    </aside>
  );
}
