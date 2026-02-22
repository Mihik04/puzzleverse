import Tile from "./Tile";

type PuzzleGridProps = {
  board: number[];
  moveTile: (index: number) => void;
  isSolved?: boolean;
};

export default function PuzzleGrid({ board, moveTile, isSolved }: PuzzleGridProps) {
  return (
    <div className="puzzle-grid">
      {board.map((value, index) => (
        <Tile
          key={index}
          value={value}
          onClick={() => moveTile(index)}
          isSolved={isSolved}
        />
      ))}
    </div>
  );
}