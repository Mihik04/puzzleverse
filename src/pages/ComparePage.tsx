import { useState, useEffect, useRef } from "react";
import {
  solveWithBFS,
  solveWithDFS,
  solveWithAStar,
} from "../utils/solver";
import type { Board } from "../types/puzzle";
import { GOAL_STATE } from "../types/puzzle";
import { useNavigate } from "react-router-dom";
import "../styles/puzzle.css";
import CompareGraph from "../components/CompareGraph";
import LiveSolver from "../components/LiveSolver";

/* ---------- Helpers (untouched) ---------- */

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

function generateRandomBoard(): Board {
  let board = [...GOAL_STATE];
  for (let i = 0; i < 30; i++) {
    const neighbors = getNeighbors(board);
    board = neighbors[Math.floor(Math.random() * neighbors.length)];
  }
  return board;
}

/* ---------- Compare Page ---------- */

export default function ComparePage() {
  const navigate = useNavigate();

  const [board, setBoard] = useState<Board>(generateRandomBoard());
  const [results, setResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [finishedCount, setFinishedCount] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const winnerTimes = useRef<{ [key: string]: number }>({});

  /* ---------- Run Race (untouched) ---------- */
  function runComparison() {
    if (isRunning) return;
    setIsRunning(true);
    setFinishedCount(0);
    setWinner(null);
    winnerTimes.current = {};
    setResults(null);

    try {
      const bfs = solveWithBFS(board);
      let dfs;
      try {
        dfs = solveWithDFS(board, 40);
      } catch {
        dfs = { stepsExplored: 0, solutionPath: bfs.solutionPath, timeMs: 0 };
      }
      const astar = solveWithAStar(board);
      setResults({ bfs, dfs, astar });
    } catch (err) {
      console.error(err);
      alert("Comparison failed. Try another shuffle.");
      setIsRunning(false);
    }
  }

  /* ---------- Finish Handler (untouched) ---------- */
  function handleSolverFinish(name: string, time: number) {
    if (winnerTimes.current[name] !== undefined) return;
    winnerTimes.current[name] = time;
    setFinishedCount((prev) => prev + 1);
    setWinner((prevWinner) => {
      if (!prevWinner) return name;
      return time < winnerTimes.current[prevWinner] ? name : prevWinner;
    });
  }

  useEffect(() => {
    if (finishedCount === 3) setIsRunning(false);
  }, [finishedCount]);

  /* ---------- Shuffle (untouched) ---------- */
  function handleShuffle() {
    if (isRunning) return;
    setBoard(generateRandomBoard());
    setResults(null);
    setWinner(null);
    winnerTimes.current = {};
  }

  /* ---------- Render ---------- */
  return (
    /*
      CHANGE: removed all hard-coded inline widths and fixed padding values.
      Layout is now fully CSS-driven via the .cp-* classes injected in <style>.
      The sticky topbar uses CSS variables for safe-area insets on notched phones.
    */
    <div className="cp-root">

      {/* Scoped page styles */}
      <style>{`
        .cp-root {
          min-height: 100vh;
          background: var(--bg, #0f0f14);
          color: var(--text-primary, #dde4ed);
          font-family: var(--font-mono, 'IBM Plex Mono', monospace);
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        /* ── Top Bar ── */
        .cp-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          padding: 16px clamp(16px, 4vw, 48px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(15,15,20,0.88);
          backdrop-filter: blur(16px);
        }

        .cp-topbar-left {
          display: flex;
          align-items: center;
          gap: clamp(10px, 2vw, 18px);
          min-width: 0;
          flex-wrap: wrap;
        }

        .cp-topbar-divider { width: 1px; height: 14px; background: rgba(255,255,255,0.08); flex-shrink: 0; }

        .cp-topbar-sub {
          font-size: clamp(9px, 1.5vw, 10px);
          letter-spacing: 0.14em;
          color: rgba(0,245,255,0.6);
          white-space: nowrap;
        }

        .cp-topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .cp-running-badge {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .cp-running-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #00f5ff;
          box-shadow: 0 0 6px #00f5ff;
          animation: blink 1.2s ease-in-out infinite;
          flex-shrink: 0;
        }

        .cp-running-text {
          font-size: 9px; letter-spacing: 0.18em;
          text-transform: uppercase; color: #4a5568;
          white-space: nowrap;
        }

        .cp-back-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          color: #4a5568;
          padding: 6px 14px;
          border-radius: 4px;
          cursor: pointer;
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          letter-spacing: 0.1em;
          transition: border-color 0.2s, color 0.2s;
          white-space: nowrap;
          touch-action: manipulation;
        }

        .cp-back-btn:hover { border-color: #00f5ff; color: #00f5ff; }

        /* ── Body ── */
        .cp-body {
          flex: 1;
          padding: clamp(28px, 5vw, 48px) clamp(16px, 5vw, 48px) clamp(40px, 6vw, 80px);
        }

        /* ── Controls section ── */
        .cp-section-meta { margin-bottom: clamp(16px, 3vw, 24px); }

        .cp-section-tag {
          font-size: 9px; letter-spacing: 0.28em;
          text-transform: uppercase; color: #8b5cf6;
          margin-bottom: 6px;
        }

        .cp-section-sub {
          font-size: 10px;
          color: rgba(148,163,184,0.4);
          letter-spacing: 0.08em;
        }

        /* Button row: flex on desktop, wrap to col on mobile */
        .cp-btn-row {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .cp-btn-primary {
          padding: 11px clamp(16px, 3vw, 22px);
          background: transparent;
          border: 1px solid #00f5ff;
          color: #00f5ff;
          border-radius: 5px;
          cursor: pointer;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          transition: background 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
          touch-action: manipulation;
          white-space: nowrap;
        }

        .cp-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        .cp-btn-primary:not(:disabled):hover {
          background: rgba(0,245,255,0.07);
          box-shadow: 0 0 18px rgba(0,245,255,0.2);
        }

        .cp-btn-secondary {
          padding: 11px clamp(16px, 3vw, 22px);
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: #4a5568;
          border-radius: 5px;
          cursor: pointer;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: border-color 0.2s, color 0.2s;
          touch-action: manipulation;
          white-space: nowrap;
        }

        .cp-btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

        .cp-btn-secondary:not(:disabled):hover {
          border-color: rgba(139,92,246,0.5);
          color: #8b5cf6;
        }

        .cp-winner-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(0,245,255,0.05);
          border: 1px solid rgba(0,245,255,0.2);
          border-radius: 5px;
          animation: fadeSlideIn 0.4s ease forwards;
        }

        .cp-winner-text {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #00f5ff;
          white-space: nowrap;
        }

        /* ── Race section ── */
        .cp-section-label {
          font-size: 9px; letter-spacing: 0.22em;
          text-transform: uppercase; color: #4a5568;
          margin-bottom: clamp(12px, 2.5vw, 16px);
        }

        /* 3 columns → 2 → 1 handled in puzzle.css via .compare-live-grid */

        /* ── Analytics section ── */
        .cp-analytics {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: clamp(28px, 5vw, 48px);
          margin-top: clamp(28px, 5vw, 48px);
        }

        /* ── Empty state ── */
        .cp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: clamp(200px, 30vh, 340px);
          gap: 14px;
          opacity: 0.3;
        }

        .cp-empty-icon {
          width: 40px; height: 40px;
          border: 1px solid rgba(0,245,255,0.3);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }

        .cp-empty-text {
          font-family: var(--font-mono, monospace);
          font-size: clamp(11px, 2.5vw, 15px);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #dee4f0;
          text-align: center;
        }

        /* ── Mobile overrides ── */
        @media (max-width: 480px) {
          .cp-topbar-divider,
          .cp-topbar-sub { display: none; }

          .cp-btn-primary,
          .cp-btn-secondary { width: 100%; text-align: center; justify-content: center; }

          .cp-btn-row { flex-direction: column; }

          .cp-winner-badge { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* ══ Top Bar ══ */}
      <header className="cp-topbar">
        <div className="cp-topbar-left">
          <span style={{
            fontFamily: "var(--font-label, 'Syne', sans-serif)",
            fontSize: 10, fontWeight: 600,
            letterSpacing: "0.28em", textTransform: "uppercase", color: "#4a5568",
            whiteSpace: "nowrap",
          }}>PuzzleVerse</span>
          <div className="cp-topbar-divider" />
          <span className="cp-topbar-sub">algorithm performance benchmarking</span>
        </div>

        <div className="cp-topbar-right">
          {isRunning && (
            <div className="cp-running-badge">
              <div className="cp-running-dot" />
              <span className="cp-running-text">running</span>
            </div>
          )}
          <button className="cp-back-btn" onClick={() => navigate("/")}>
            ← Manual
          </button>
        </div>
      </header>

      {/* ══ Page Body ══ */}
      <main className="cp-body">

        {/* ── Controls ── */}
        <div style={{ marginBottom: "clamp(28px, 5vw, 48px)" }}>
          <div className="cp-section-meta">
            <p className="cp-section-tag">Algorithm Performance Lab</p>
            <p className="cp-section-sub">
              BFS · DFS · A* — simultaneous solve race on identical board state
            </p>
          </div>

          <div className="cp-btn-row">
            <button
              className="cp-btn-primary"
              onClick={runComparison}
              disabled={isRunning}
            >
              {isRunning ? "running..." : "▶  Start Race"}
            </button>

            <button
              className="cp-btn-secondary"
              onClick={handleShuffle}
              disabled={isRunning}
            >
              ↺  Shuffle State
            </button>

            {winner && (
              <div className="cp-winner-badge">
                <span style={{ fontSize: 14 }}>🥇</span>
                <span className="cp-winner-text">{winner} wins</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Live Race ── */}
        {results && (
          <>
            <p className="cp-section-label">Live Solve Race</p>

            {/*
              CHANGE: use className="compare-live-grid" so CSS handles
              the 3→2→1 column collapse via media queries in puzzle.css.
              No inline gridTemplateColumns here.
            */}
            <div className="compare-live-grid" style={{ marginTop: 0, marginBottom: "clamp(28px,5vw,60px)" }}>
              <LiveSolver
                title="BFS"
                result={results.bfs}
                winner={winner}
                onFinish={(t) => handleSolverFinish("BFS", t)}
              />
              <LiveSolver
                title="DFS"
                result={results.dfs}
                winner={winner}
                onFinish={(t) => handleSolverFinish("DFS", t)}
              />
              <LiveSolver
                title="A*"
                result={results.astar}
                winner={winner}
                onFinish={(t) => handleSolverFinish("A*", t)}
              />
            </div>

            {/* ── Analytics ── */}
            <div className="cp-analytics">
              <p className="cp-section-label">Performance Analytics</p>
              <CompareGraph results={results} />
            </div>
          </>
        )}

        {/* ── Empty state ── */}
        {!results && (
          <div className="cp-empty">
            <div className="cp-empty-icon">⚡</div>
            <p className="cp-empty-text">Press Start Race to begin benchmarking</p>
          </div>
        )}
      </main>
    </div>
  );
}