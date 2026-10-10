import "./pipeline.css";
import { DIRS, E, N, S, W, countBits, rotateMask, sourceOf, type Cell } from "./logic";

export type TileKind = "source" | "table" | "pipe";

/** The source sits in the middle. Every other dead end is a table waiting for data. */
export function tileKind(size: number, index: number, cell: Cell): TileKind {
  if (index === sourceOf(size)) return "source";
  return countBits(cell.shape) === 1 ? "table" : "pipe";
}

type Props = {
  cell: Cell;
  kind: TileKind;
  lit: boolean;
  /** The side data enters from, in board directions. */
  from: number;
  /** Open sides with nothing to join, in board directions. */
  leaks: number;
};

// Where each arm meets the tile edge, in the SVG's 100 × 100 space.
const EDGE: Record<number, [number, number]> = { [N]: [50, 0], [E]: [100, 50], [S]: [50, 100], [W]: [0, 50] };

/**
 * The drawing inside one tile. Used by the game board and the static previews.
 * Arms are drawn in the tile's home orientation and the whole SVG is rotated
 * by CSS, so `from` and `leaks` (board directions) are turned back to match.
 */
export default function PipeTile({ cell, kind, lit, from, leaks }: Props) {
  return (
    <>
      <svg viewBox="0 0 100 100" className="pipe-svg" style={{ "--rot": cell.rot } as React.CSSProperties} aria-hidden="true">
        {DIRS.filter((d) => cell.shape & d).map((d) => {
          const side = rotateMask(d, cell.rot);
          const state = !lit ? "idle" : leaks & side ? "leak" : "lit";
          const [x, y] = EDGE[d];
          // Each path runs the way the data travels, so the flow dots move
          // in from the parent side and out along every other arm.
          const path = side === from ? `M${x} ${y}L50 50` : `M50 50L${x} ${y}`;
          return (
            <g key={d}>
              <path d={path} className="pipe-arm" data-state={state} />
              {state === "lit" && <path d={path} className="pipe-flow" />}
            </g>
          );
        })}
      </svg>
      {kind === "source" && (
        <span className="pipe-icon pipe-source" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" />
            <path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13" />
            <path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" />
          </svg>
        </span>
      )}
      {kind === "table" && (
        <span className="pipe-icon pipe-table" data-lit={lit} aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
            <path d="M3.5 9.5h17M3.5 14.5h17M10 9.5v10" />
          </svg>
        </span>
      )}
    </>
  );
}
