import PipeTile, { tileKind } from "./PipeTile";
import { analyze, buildPuzzle, type Cell } from "./logic";

type Props = {
  size?: number;
  /** A fixed seed, so the preview is identical on every build. */
  seed?: number;
  className?: string;
};

/**
 * A solved, non-interactive board for the arcade cards. This is a server
 * component: the puzzle is generated once at build time and shipped as HTML.
 */
export default function PipelinePreview({ size = 4, seed = 11, className = "" }: Props) {
  const cells: Cell[] = buildPuzzle(size, seed).map((c) => ({ ...c, rot: 0 }));
  const flow = analyze(size, cells);

  return (
    <div aria-hidden="true" className={`pipe-board-wrap ${className}`}>
      <div className="pipe-board">
        <div className="pipe-grid" style={{ "--size": size } as React.CSSProperties}>
          {cells.map((cell, i) => (
            <div key={i} className="pipe-cell">
              <PipeTile cell={cell} kind={tileKind(size, i, cell)} lit={flow.lit[i]} from={flow.from[i]} leaks={flow.leaks[i]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
