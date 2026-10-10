import "./game1024.css";
import { GOAL } from "./logic";

type Props = {
  value: number;
  kind?: "start" | "new" | "merged";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/** A coloured 1024 tile. Used by the board, the ladder, the page title and the home teaser. */
export default function TileFace({ value, kind, className = "", style, children }: Props) {
  return (
    <div
      className={`tile-face ${className}`}
      data-value={value > GOAL ? "super" : value}
      data-digits={String(value).length}
      data-kind={kind}
      style={style}
    >
      {children ?? value}
    </div>
  );
}
