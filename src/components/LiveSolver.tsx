import { useEffect, useState } from "react";
import PuzzleGrid from "./PuzzleGrid";
import type { Board } from "../types/puzzle";

type Props = {
  title: string;
  result: any;
  winner?: string | null;
  onFinish?: (time: number) => void;
};

const ALGO_COLORS: Record<string, string> = {
  BFS: "#00f5ff",
  DFS: "#8b5cf6",
  "A*": "#38bdf8",
};


function ProgressBar({ current, total, color }: {
  current: number; total: number; color: string;
}) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <div style={{
      height: 2,
      background: "rgba(255,255,255,0.06)",
      borderRadius: 2,
      overflow: "hidden",
      marginTop: 12,
    }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        background: color,
        boxShadow: `0 0 6px ${color}`,
        borderRadius: 2,
        transition: "width 0.18s linear",
      }} />
    </div>
  );
}

export default function LiveSolver({ title, result, onFinish, winner }: Props) {
  const [currentBoard, setCurrentBoard] = useState<Board>(result.solutionPath[0]);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const isWinner = winner === title;
  const color = ALGO_COLORS[title] ?? "#00f5ff";
  const total = result.solutionPath.length - 1;

  useEffect(() => {
    let i = 0;
    setCurrentBoard(result.solutionPath[0]);
    setStep(0);
    setDone(false);

    const interval = setInterval(() => {
      i++;
      if (i >= result.solutionPath.length) {
        clearInterval(interval);
        setDone(true);
        onFinish?.(result.timeMs);
        return;
      }
      setCurrentBoard(result.solutionPath[i]);
      setStep(i);
    }, 200);

    return () => clearInterval(interval);
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: `1px solid ${isWinner ? color : "rgba(0,245,255,0.1)"}`,
      borderRadius: 14,
      padding: "24px 20px",
      textAlign: "center",
      backdropFilter: "blur(10px)",
      boxShadow: isWinner
        ? `0 0 40px ${color}33, 0 0 12px ${color}22, inset 0 1px 0 rgba(255,255,255,0.06)`
        : "0 0 40px rgba(0,245,255,0.02), inset 0 1px 0 rgba(255,255,255,0.03)",
      transition: "box-shadow 0.4s ease, border-color 0.4s ease",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Corner accent line */}
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: 30, height: 1,
        background: color,
        opacity: 0.5,
      }} />

      {/* Header row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginBottom: 18,
      }}>
        <span style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 13,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color,
          fontWeight: 500,
        }}>
          {title}
        </span>

        {isWinner && (
          <span style={{
            fontSize: 14,
            animation: "winnerPop 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
          }}>🥇</span>
        )}

        {done && !isWinner && (
          <span style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 9,
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.2)",
            textTransform: "uppercase",
          }}>done</span>
        )}
      </div>

      {/* Puzzle board */}
      <div style={{
        display: "inline-block",
        filter: isWinner ? `drop-shadow(0 0 10px ${color}44)` : "none",
        transition: "filter 0.4s ease",
      }}>
        <PuzzleGrid board={currentBoard} moveTile={() => {}} />
      </div>

      {/* Progress bar */}
      <ProgressBar current={step} total={total} color={color} />

      {/* Stats */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 16,
        marginTop: 16,
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 10,
        letterSpacing: "0.1em",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
          <span style={{ color: "rgba(148,163,184,0.5)", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase" }}>step</span>
          <span style={{ color: "rgba(148,163,184,0.8)" }}>{step}/{total}</span>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
          <span style={{ color: "rgba(148,163,184,0.5)", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase" }}>nodes</span>
          <span style={{ color: "rgba(148,163,184,0.8)" }}>{result.stepsExplored.toLocaleString()}</span>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
          <span style={{ color: "rgba(148,163,184,0.5)", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase" }}>time</span>
          <span style={{ color }}>
            {result.timeMs < 0.01 ? "<0.01" : result.timeMs.toFixed(3)}ms
          </span>
        </div>
      </div>

      <style>{`
        @keyframes winnerPop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}