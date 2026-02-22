import { usePuzzle } from "../hooks/usePuzzle";
import PuzzleGrid from "../components/PuzzleGrid";
import ControlPanel from "../components/ControlPanel";
import "../styles/puzzle.css";
import { useNavigate } from "react-router-dom";

export default function PlayPage() {
  const { board, moves, seconds, isSolved, moveTile, shuffle } = usePuzzle();
  const navigate = useNavigate();

  return (
    <div className="play-container">

      <div className="play-header">
        <span className="play-wordmark">PuzzleVerse</span>
        <span className="play-divider" />
        <span className="play-mode-label">Manual Mode</span>
      </div>

      <p className="puzzle-title">8 — Puzzle</p>

      <div className={`play-grid-wrapper ${isSolved ? "solved" : ""}`}>
        <PuzzleGrid board={board} moveTile={moveTile} isSolved={isSolved} />
      </div>

      <ControlPanel
        moves={moves}
        seconds={seconds}
        isSolved={isSolved}
        shuffle={shuffle}
      />

      <button
        className="play-ai-btn"
        onClick={() => navigate("/ai")}
      >
        → AI Solve Mode
      </button>
      <button
  className="play-ai-btn"
  onClick={() => navigate("/compare")}
>
  → Compare Algorithms
</button>

    </div>
  );
}