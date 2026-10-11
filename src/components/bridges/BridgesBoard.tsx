import "./bridges.css";
import { islandCounts, type Puzzle } from "./logic";

// SVG units. Each grid cell is CELL wide and islands sit in cell centres.
const CELL = 40;
const R = 15;
const DOUBLE_GAP = 4.5;

const centre = (i: number) => i * CELL + CELL / 2;

type Props = {
  puzzle: Puzzle;
  bridges: number[];
  locked?: boolean[];
  /** Edges to flash, e.g. the bridges blocking the one just tapped. */
  flash?: number[];
  onCycle?: (edge: number, step: 1 | -1) => void;
  className?: string;
};

/**
 * The board as an SVG. It has no state of its own, so it can render on the
 * server (the arcade preview) or inside the client game. Each pair of
 * islands that see each other gets an invisible tap target over the water
 * between them. Tapping it cycles 0 → 1 → 2 → 0 bridges.
 */
export default function BridgesBoard({ puzzle, bridges, locked = [], flash = [], onCycle, className = "" }: Props) {
  const { size, islands, edges } = puzzle;
  const counts = islandCounts(puzzle, bridges);
  const span = size * CELL;

  return (
    <svg className={`bridges-svg ${className}`} viewBox={`0 0 ${span} ${span}`} aria-hidden={onCycle ? undefined : true}>
      {/* Faint dots on every cell help line islands up by eye. */}
      <g className="bridges-dots">
        {Array.from({ length: size * size }, (_, i) => (
          <circle key={i} cx={centre(i % size)} cy={centre(Math.floor(i / size))} r={1.6} />
        ))}
      </g>

      {edges.map((e, i) => {
        const a = islands[e.a];
        const b = islands[e.b];
        const [x1, y1, x2, y2] = [centre(a.c), centre(a.r), centre(b.c), centre(b.r)];
        // Offsets for the two lines of a double bridge, at right angles to it.
        const [ox, oy] = e.across ? [0, DOUBLE_GAP] : [DOUBLE_GAP, 0];
        const count = bridges[i];
        const lines = count === 2 ? [-1, 1] : count === 1 ? [0] : [];
        // The tap target covers the water between the two islands.
        const hit = e.across
          ? { x: x1 + R, y: y1 - 14, width: x2 - x1 - 2 * R, height: 28 }
          : { x: x1 - 14, y: y1 + R, width: 28, height: y2 - y1 - 2 * R };
        const label = `Bridge between the ${a.n} at row ${a.r + 1}, column ${a.c + 1} and the ${b.n} at row ${b.r + 1}, column ${b.c + 1}: ${
          count === 0 ? "none" : count === 1 ? "single" : "double"
        }${locked[i] ? ", set by a hint" : ""}`;

        return (
          <g
            key={i}
            className="bridges-slot"
            data-count={count}
            data-locked={!!locked[i]}
            data-flash={flash.includes(i)}
            data-interactive={!!onCycle}
            role={onCycle ? "button" : undefined}
            tabIndex={onCycle ? 0 : undefined}
            aria-label={onCycle ? label : undefined}
            onClick={onCycle && ((ev) => onCycle(i, ev.shiftKey ? -1 : 1))}
            onContextMenu={
              onCycle &&
              ((ev) => {
                ev.preventDefault();
                onCycle(i, -1);
              })
            }
            onKeyDown={
              onCycle &&
              ((ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  onCycle(i, ev.shiftKey ? -1 : 1);
                }
              })
            }
          >
            <rect className="bridges-hit" rx={8} {...hit} />
            {onCycle && count === 0 && <line className="bridges-ghost" x1={x1} y1={y1} x2={x2} y2={y2} />}
            {/* Keyed by count, so each change remounts the lines and replays the draw-in animation. */}
            <g key={count}>
              {lines.map((k) => (
                <line
                  key={k}
                  className="bridges-line"
                  pathLength={1}
                  x1={x1 + k * ox}
                  y1={y1 + k * oy}
                  x2={x2 + k * ox}
                  y2={y2 + k * oy}
                />
              ))}
            </g>
          </g>
        );
      })}

      {islands.map((isl, i) => {
        const state = counts[i] === isl.n ? "done" : counts[i] > isl.n ? "over" : "open";
        return (
          <g key={i} className="bridges-island" data-state={state} transform={`translate(${centre(isl.c)} ${centre(isl.r)})`}>
            <circle r={R} />
            <text dominantBaseline="central" textAnchor="middle">
              {isl.n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
