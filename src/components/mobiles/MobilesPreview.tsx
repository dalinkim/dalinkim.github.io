import MobileView from "./MobileView";
import { buildPuzzle } from "./logic";

/**
 * A non-interactive mobile for the arcade cards. This is a server component:
 * the puzzle is generated once at build time from a fixed seed. One guess is
 * off by one, so the lower bar tips and shows what the game is about.
 */
export default function MobilesPreview({ seed = 4, className = "" }: { seed?: number; className?: string }) {
  const puzzle = buildPuzzle("medium", seed);
  const guesses = puzzle.weights.map((w, i) => (i === 0 ? w + 1 : w));

  return (
    <div aria-hidden="true" className={`mobile-board !p-3 ${className}`}>
      <MobileView mobile={puzzle.mobile} guesses={guesses} hideValues />
    </div>
  );
}
