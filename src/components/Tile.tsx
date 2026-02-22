type TileProps = {
  value: number;
  onClick: () => void;
  isSolved?: boolean;
};

export default function Tile({ value, onClick, isSolved }: TileProps) {
  const isEmpty = value === 0;
  const className = [
    "tile-btn",
    isEmpty ? "empty" : isSolved ? "solved-state" : "active",
  ].join(" ");

  return (
    <button
      onClick={onClick}
      className={className}
      disabled={isEmpty}
    >
      {isEmpty ? "" : value}
    </button>
  );
}