import "./mobiles.css";
import { weigh, type Guesses, type Mobile } from "./logic";

// Drawing sizes in SVG user units. The SVG scales to its container, so only
// the proportions matter.
const SHAPE = 46;
const STACK_GAP = 8;
const STRING = 22;
const SIDE_GAP = 20;
const PAD = 14;
const MAX_TILT = 10;
const SCALE = 1.5;
const SIN_MAX = Math.sin((MAX_TILT * Math.PI) / 180);

/** Colour hue per shape kind: coral, teal, violet, gold. */
export const SHAPE_HUES = [12, 174, 262, 42];
export const SHAPE_NAMES = ["circle", "triangle", "square", "hexagon"];

type Box = { half: number; height: number };

/**
 * How much room a node needs around the point it hangs from. Bars have equal
 * arms, so each child hangs one arm's length either side of the middle, and
 * the arm is long enough that the two sides never touch.
 */
function measure(node: Mobile): Box & { arm: number } {
  if (node.kind === "stack") {
    const n = node.items.length;
    return { half: SHAPE / 2, height: STRING + n * SHAPE + (n - 1) * STACK_GAP, arm: 0 };
  }
  const l = measure(node.left);
  const r = measure(node.right);
  const widest = Math.max(l.half, r.half);
  const arm = widest + SIDE_GAP / 2;
  // Leave room below for the low side when the bar tips.
  return { half: arm + widest, height: STRING + Math.max(l.height, r.height) + arm * SIN_MAX, arm };
}

/**
 * How far a bar tips, in degrees. Positive tips the right side down (SVG y
 * points down). Unknown sides hang level. Even a small difference gets a
 * clearly visible tilt.
 */
function tilt(node: Mobile, weights: Guesses) {
  if (node.kind === "stack") return 0;
  const left = weigh(node.left, weights);
  const right = weigh(node.right, weights);
  if (left === null || right === null || left === right) return 0;
  const lean = Math.min(MAX_TILT, 4 + (20 * Math.abs(right - left)) / (left + right));
  return Math.sign(right - left) * lean;
}

type Props = {
  mobile: Mobile;
  /** The weights used to tip the bars and label the shapes. */
  guesses: Guesses;
  /** Show "?" on every shape instead of the guesses (the arcade preview). */
  hideValues?: boolean;
  selected?: number | null;
  onPick?: (shape: number) => void;
  className?: string;
};

/**
 * The mobile as an SVG. It has no state of its own, so it can render on the
 * server (the arcade preview) or inside the client game.
 */
export default function MobileView({ mobile, guesses, hideValues, selected = null, onPick, className = "" }: Props) {
  const box = measure(mobile);
  const width = 2 * (box.half + PAD);
  const height = box.height + 2 * PAD + 10;

  function node(n: Mobile, path: string): React.ReactNode {
    if (n.kind === "stack") {
      const length = STRING + n.items.length * SHAPE + (n.items.length - 1) * STACK_GAP;
      return (
        <g key={path}>
          <line className="mobile-string" x1={0} y1={0} x2={0} y2={length - SHAPE / 2} />
          {n.items.map((shape, i) => (
            <ShapeMark
              key={i}
              shape={shape}
              y={STRING + SHAPE / 2 + i * (SHAPE + STACK_GAP)}
              value={hideValues ? null : guesses[shape]}
              selected={selected === shape}
              onPick={onPick}
            />
          ))}
        </g>
      );
    }

    const { arm } = measure(n);
    const angle = tilt(n, guesses);
    const rad = (angle * Math.PI) / 180;
    const dx = arm * Math.cos(rad);
    const dy = arm * Math.sin(rad);
    const left = weigh(n.left, guesses);
    const right = weigh(n.right, guesses);
    const state = left === null || right === null ? "unknown" : left === right ? "level" : "tipped";

    // The bar turns about its pivot. The two sides move with the bar's ends
    // but stay upright, the way real strings hang. Both use CSS transforms,
    // so changing a guess animates the swing.
    return (
      <g key={path}>
        <line className="mobile-string" x1={0} y1={0} x2={0} y2={STRING} />
        <g transform={`translate(0 ${STRING})`}>
          <g className="mobile-swing" style={{ transform: `rotate(${angle}deg)` }}>
            <rect className="mobile-bar" data-state={state} x={-arm - 5} y={-3.5} width={2 * arm + 10} height={7} rx={3.5} />
          </g>
          <circle className="mobile-pivot" r={5} />
          <g className="mobile-swing" style={{ transform: `translate(${-dx}px, ${-dy}px)` }}>
            {node(n.left, path + "L")}
          </g>
          <g className="mobile-swing" style={{ transform: `translate(${dx}px, ${dy}px)` }}>
            {node(n.right, path + "R")}
          </g>
        </g>
      </g>
    );
  }

  return (
    <svg
      className={`mobile-svg ${className}`}
      viewBox={`${-width / 2} 0 ${width} ${height}`}
      // Drawn at its natural size, so a small mobile stays small. CSS caps
      // the width to the tray and scales big mobiles down.
      width={width * SCALE}
      height={height * SCALE}
      aria-hidden="true"
    >
      <rect className="mobile-hook" x={-14} y={0} width={28} height={6} rx={3} />
      <g transform={`translate(0 ${PAD - 8})`}>{node(mobile, "")}</g>
    </svg>
  );
}

type ShapeProps = {
  shape: number;
  y?: number;
  value: number | null;
  selected?: boolean;
  onPick?: (shape: number) => void;
};

function ShapeMark({ shape, y = 0, value, selected, onPick }: ShapeProps) {
  return (
    <g
      className="mobile-shape"
      data-selected={selected}
      data-clickable={!!onPick}
      transform={`translate(0 ${y})`}
      style={{ "--hue": SHAPE_HUES[shape] } as React.CSSProperties}
      onClick={onPick && (() => onPick(shape))}
    >
      <ShapePath shape={shape} />
      <text y={shape === 1 ? 7 : 1} dominantBaseline="middle" textAnchor="middle" data-empty={value === null}>
        {value ?? "?"}
      </text>
    </g>
  );
}

/** One shape outline centred on (0, 0), about SHAPE units across. */
export function ShapePath({ shape }: { shape: number }) {
  const r = SHAPE / 2;
  switch (shape) {
    case 0:
      return <circle className="mobile-body" r={r - 1} />;
    case 1:
      return <path className="mobile-body" d={`M0 ${-r - 2} L${r + 3} ${r - 2} L${-r - 3} ${r - 2} Z`} strokeLinejoin="round" />;
    case 2:
      return <rect className="mobile-body" x={-r + 2} y={-r + 2} width={SHAPE - 4} height={SHAPE - 4} rx={7} />;
    default: {
      const points = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
      });
      return <polygon className="mobile-body" points={points.join(" ")} strokeLinejoin="round" />;
    }
  }
}

/** A single shape as a small standalone icon, for the guess boxes. */
export function ShapeIcon({ shape, className = "" }: { shape: number; className?: string }) {
  return (
    <svg
      viewBox={`${-SHAPE / 2 - 4} ${-SHAPE / 2 - 4} ${SHAPE + 8} ${SHAPE + 8}`}
      className={`mobile-shape ${className}`}
      style={{ "--hue": SHAPE_HUES[shape] } as React.CSSProperties}
      aria-hidden="true"
    >
      <ShapePath shape={shape} />
    </svg>
  );
}
