import TileFace from "./TileFace";

// A frozen mid-game board: [value, col, row].
const PREVIEW: [number, number, number][] = [
  [2, 0, 0],
  [4, 2, 0],
  [2, 3, 0],
  [8, 1, 1],
  [4, 2, 1],
  [16, 0, 2],
  [32, 1, 2],
  [64, 2, 2],
  [128, 3, 2],
  [4, 0, 3],
  [2, 3, 3],
];

/** A static 128 board for the home teaser and the arcade cards. */
export default function BoardPreview({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`grid grid-cols-4 gap-1.5 rounded-2xl bg-surface-muted p-1.5 ${className}`}>
      {Array.from({ length: 16 }, (_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const tile = PREVIEW.find(([, c, r]) => c === col && r === row);
        return tile ? (
          <TileFace key={i} value={tile[0]} className="aspect-square rounded-md text-[0.6rem] [--tile-depth:2px]" />
        ) : (
          <div key={i} className="aspect-square rounded-md bg-bg/60" />
        );
      })}
    </div>
  );
}
