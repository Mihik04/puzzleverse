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
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];
  for (const [newRow, newCol] of moves) {
    if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
      const newIndex = newRow * 3 + newCol;
      const newBoard = [...board];
      [newBoard[zeroIndex], newBoard[newIndex]] =
        [newBoard[newIndex], newBoard[zeroIndex]];
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
      const prevTime = winnerTimes.current[prevWinner];
      return time < prevTime ? name : prevWinner;
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
    <div style={{
      minHeight: "100vh",
      background: "var(--bg, #0f0f14)",
      color: "var(--text-primary, #dde4ed)",
      fontFamily: "var(--font-mono, 'IBM Plex Mono', monospace)",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ══ Top Bar ══ */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 48px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(15,15,20,0.85)",
        backdropFilter: "blur(16px)",
      }}>
        {/* Left: brand + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{
            fontFamily: "var(--font-label, 'Syne', sans-serif)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#4a5568",
          }}>PuzzleVerse</span>

          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.08)" }} />

          <span style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "rgba(0,245,255,0.6)",
          }}>algorithm performance benchmarking</span>
        </div>

        {/* Right: status + back */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {isRunning && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#00f5ff",
                boxShadow: "0 0 6px #00f5ff",
                animation: "blink 1.2s ease-in-out infinite",
              }} />
              <span style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4a5568" }}>
                running
              </span>
            </div>
          )}
          <button
            onClick={() => navigate("/")}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#4a5568",
              padding: "6px 14px",
              borderRadius: 4,
              cursor: "pointer",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 10,
              letterSpacing: "0.1em",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#00f5ff";
              (e.target as HTMLButtonElement).style.color = "#00f5ff";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
              (e.target as HTMLButtonElement).style.color = "#4a5568";
            }}
          >
            ← Manual
          </button>
        </div>
      </header>

      {/* ══ Page Body ══ */}
      <main style={{ flex: 1, padding: "48px 48px 80px" }}>

        {/* ── Section: Controls ── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{
              fontSize: 9,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#8b5cf6",
              marginBottom: 6,
            }}>Algorithm Performance Lab</p>
            <p style={{
              fontSize: 10,
              color: "rgba(148,163,184,0.4)",
              letterSpacing: "0.08em",
            }}>
              BFS · DFS · A* — simultaneous solve race on identical board state
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={runComparison}
              disabled={isRunning}
              style={{
                padding: "10px 22px",
                background: "transparent",
                border: "1px solid #00f5ff",
                color: "#00f5ff",
                borderRadius: 5,
                cursor: isRunning ? "not-allowed" : "pointer",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                opacity: isRunning ? 0.4 : 1,
                transition: "background 0.2s, box-shadow 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!isRunning) {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,245,255,0.07)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 18px rgba(0,245,255,0.2)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              {isRunning ? "running..." : "▶  Start Race"}
            </button>

            <button
              onClick={handleShuffle}
              disabled={isRunning}
              style={{
                padding: "10px 22px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#4a5568",
                borderRadius: 5,
                cursor: isRunning ? "not-allowed" : "pointer",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                opacity: isRunning ? 0.4 : 1,
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isRunning) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.5)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#8b5cf6";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLButtonElement).style.color = "#4a5568";
              }}
            >
              ↺  Shuffle State
            </button>

            {winner && (
              <div style={{
                marginLeft: 8,
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px",
                background: "rgba(0,245,255,0.05)",
                border: "1px solid rgba(0,245,255,0.2)",
                borderRadius: 5,
                animation: "fadeSlideIn 0.4s ease forwards",
              }}>
                <span style={{ fontSize: 14 }}>🥇</span>
                <span style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#00f5ff",
                }}>
                  {winner} wins
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Section: Live Race ── */}
        {results && (
          <>
            <div style={{ marginBottom: 14 }}>
              <p style={{
                fontSize: 9, letterSpacing: "0.22em",
                textTransform: "uppercase", color: "#4a5568",
              }}>Live Solve Race</p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
              marginBottom: 60,
            }}>
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

            {/* ── Section: Analytics ── */}
            <div style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              paddingTop: 48,
            }}>
              <p style={{
                fontSize: 9, letterSpacing: "0.28em",
                textTransform: "uppercase", color: "#4a5568",
                marginBottom: 32,
              }}>Performance Analytics</p>

              <CompareGraph results={results} />
            </div>
          </>
        )}

        {/* ── Empty state ── */}
        {!results && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 340,
            gap: 14,
            opacity: 0.3,
          }}>
            <div style={{
              width: 40, height: 40,
              border: "1px solid rgba(0,245,255,0.3)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>⚡</div>
            <p style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 15, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "#dee4f0",
            }}>Press Start Race to begin benchmarking</p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}