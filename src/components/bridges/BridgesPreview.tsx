import BridgesBoard from "./BridgesBoard";
import { buildPuzzle } from "./logic";

/**
 * A solved, non-interactive board for the arcade cards. This is a server
 * component: the puzzle is generated once at build time from a fixed seed.
 */
export default function BridgesPreview({ seed = 3, className = "" }: { seed?: number; className?: string }) {
  const puzzle = buildPuzzle("easy", seed);

  return (
    <div aria-hidden="true" className={`bridges-board !p-2 ${className}`}>
      <div className="bridges-sea">
        <BridgesBoard puzzle={puzzle} bridges={puzzle.solution} />
      </div>
    </div>
  );
}
