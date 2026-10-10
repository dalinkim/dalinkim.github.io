// Placeholder portrait: the old site's me.jpg is an abstract gradient, so it
// sits behind initials. Swap in a real photo with next/image when available.
export default function Avatar({ className = "" }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Dalin Kim"
      className={`relative grid aspect-[306/394] place-items-center overflow-hidden bg-[url(/images/me.jpg)] bg-cover shadow-[var(--shadow)] ${className}`}
    >
      <span className="font-display text-5xl font-extrabold tracking-tight text-white drop-shadow md:text-7xl">
        DK
      </span>
    </div>
  );
}
