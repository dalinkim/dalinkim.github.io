import "./skew.css";
import { HUES } from "./logic";

// A frozen mid-game board: three lanes, one straggler running past par.
const LANES = [
  [{ size: 9, origin: 0 }, { size: 4, origin: 4 }],
  [{ size: 7, origin: 1 }, { size: 6, origin: 3 }, { size: 3, origin: 5 }],
  [{ size: 7, origin: 2 }, { size: 5, origin: 6 }],
];
const PAR = 14;
const STRAGGLER = 1;

/** A static Skew board for the arcade cards. The lane labels are left out at this size. */
export default function SkewPreview({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`skew-wrap ${className}`}>
      <div
        className="skew-board space-y-1.5"
        style={{ "--scale": 18, "--par": PAR, "--pad": "0.5rem", "--label": "0px", "--gap": "0px", borderRadius: "1rem" } as React.CSSProperties}
      >
        <div className="relative space-y-1.5">
          <div className="skew-par" />
          {LANES.map((lane, i) => (
            <div key={i} className="skew-zone skew-track !h-6 !rounded-md" data-straggler={i === STRAGGLER}>
              {lane.map((t) => (
                <div
                  key={t.origin}
                  className="skew-task !h-6 !rounded-[0.3rem]"
                  style={{ "--size": t.size, "--hue": HUES[t.origin] } as React.CSSProperties}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
