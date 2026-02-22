import { useState } from "react";
import { solveWithBFS } from "../utils/solver";
import type { Board } from "../types/puzzle";
import { GOAL_STATE } from "../types/puzzle";
import PuzzleGrid from "../components/PuzzleGrid";
import AIControlPanel from "../components/AIControlPanel";
import "../styles/puzzle.css";
import { useNavigate } from "react-router-dom";
import { solveWithAStar } from "../utils/solver";
import { solveWithDFS } from "../utils/solver";

/* ---------- Helper: Get Neighbors ---------- */
function getNeighbors(board: Board): Board[] {
  const neighbors: Board[] = [];
  const zeroIndex = board.indexOf(0);
  const row = Math.floor(zeroIndex / 3);
  const col = zeroIndex % 3;
  const moves = [
    [row - 1, col], [row + 1, col],
    [row, col - 1], [row, col + 1],
  ];
  for (const [newRow, newCol] of moves) {
    if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
      const newIndex = newRow * 3 + newCol;
      const newBoard = [...board];
      [newBoard[zeroIndex], newBoard[newIndex]] = [newBoard[newIndex], newBoard[zeroIndex]];
      neighbors.push(newBoard);
    }
  }
  return neighbors;
}

/* ---------- Generate Solvable Board ---------- */
function generateRandomBoard(): Board {
  let board = [...GOAL_STATE];
  for (let i = 0; i < 30; i++) {
    const neighbors = getNeighbors(board);
    board = neighbors[Math.floor(Math.random() * neighbors.length)];
  }
  return board;
}

export default function AISolvePage() {
  const navigate = useNavigate();

  const [board, setBoard] = useState<Board>(generateRandomBoard());
  const [algorithm, setAlgorithm] = useState("bfs");
  const [speed, setSpeed] = useState(300);
  const [isSolving, setIsSolving] = useState(false);
  const [stepsExplored, setStepsExplored] = useState(0);
  const [timeMs, setTimeMs] = useState(0);
  const [solutionLength, setSolutionLength] = useState(0);

  async function handleSolve() {
    setIsSolving(true);
    let result;
    if (algorithm === "bfs")        result = solveWithBFS(board);
    else if (algorithm === "astar") result = solveWithAStar(board);
    else if (algorithm === "dfs")   result = solveWithDFS(board, 30);
    else                            result = solveWithBFS(board);

    setStepsExplored(result.stepsExplored);
    setTimeMs(result.timeMs);
    setSolutionLength(result.solutionPath.length - 1);

    for (let i = 0; i < result.solutionPath.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, speed));
      setBoard(result.solutionPath[i]);
    }
    setIsSolving(false);
  }

  function handleShuffle() {
    setBoard(generateRandomBoard());
    setStepsExplored(0);
    setTimeMs(0);
    setSolutionLength(0);
  }

  return (
    <div className="ai-container">

      {/* ── Top Bar ── */}
      <header className="ai-topbar">
        <div className="ai-topbar-left">
          <span className="ai-wordmark">PuzzleVerse</span>
          <div className="ai-topbar-divider" />
          <span className="ai-topbar-title">8-puzzle / heuristic search</span>
        </div>

        <div className="ai-topbar-right">
          <div className="ai-status-dot" />
          <span className="ai-status-label">
            {isSolving ? "running" : "ready"}
          </span>
          <button className="ai-back-btn" onClick={() => navigate("/")}>
            ← Manual
          </button>
          {/*
            CHANGE: replaced duplicate className with correct one.
            On mobile this button stacks below the back button (flex-wrap handles it).
          */}
          <button className="ctrl-btn-secondary" onClick={() => navigate("/compare")}>
            Compare
          </button>
        </div>
      </header>

      {/* ── Main: Grid + Sidebar ──
          CSS handles the column → row switch at ≤1024px.
          No inline grid styles here — layout is 100% CSS-driven.
      ── */}
      <main className="ai-main">

        <div className="ai-grid-panel">
          <span className="ai-grid-label">state space</span>
          <div className="ai-grid-inner">
            <PuzzleGrid board={board} moveTile={() => {}} />
          </div>
        </div>

        <aside className="ai-sidebar">
          <div className="ai-sidebar-header">
            <span className="ai-sidebar-title">Parameters</span>
          </div>

          <div className="ai-sidebar-body">
            <AIControlPanel
              algorithm={algorithm}
              setAlgorithm={setAlgorithm}
              speed={speed}
              setSpeed={setSpeed}
              onSolve={handleSolve}
              onShuffle={handleShuffle}
              isSolving={isSolving}
            />
          </div>

          <div className="ai-sidebar-footer">
            {isSolving ? (
              <>
                <div className="solving-bar">
                  <div className="solving-bar-fill" />
                </div>
                <span className="solving-status-text">solving</span>
              </>
            ) : (
              <span className="idle-status-text">awaiting input</span>
            )}
          </div>
        </aside>
      </main>

      {/* ── Metrics Strip ──
          CSS collapses from 3-col to 1-col on mobile.
      ── */}
      <footer className="ai-metrics">
        <div className={`metric-cell ${stepsExplored > 0 ? "has-value" : ""}`}>
          <span className="metric-label">Nodes Expanded</span>
          <span className={`metric-value ${stepsExplored === 0 ? "zero" : ""}`}>
            {stepsExplored.toLocaleString()}
          </span>
        </div>

        <div className={`metric-cell ${solutionLength > 0 ? "has-value" : ""}`}>
          <span className="metric-label">Solution Depth</span>
          <span className={`metric-value ${solutionLength === 0 ? "zero" : ""}`}>
            {solutionLength}
          </span>
        </div>

        <div className={`metric-cell ${timeMs > 0 ? "has-value" : ""}`}>
          <span className="metric-label">Exec. Time</span>
          <span className={`metric-value ${timeMs === 0 ? "zero" : ""}`}>
            {timeMs.toFixed(2)}
          </span>
          <span className="metric-unit">ms</span>
        </div>
      </footer>
    </div>
  );
}