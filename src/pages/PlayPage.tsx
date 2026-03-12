import { usePuzzle } from "../hooks/usePuzzle";
import PuzzleGrid from "../components/PuzzleGrid";
import "../styles/puzzle.css";
import { useNavigate } from "react-router-dom";

export default function PlayPage() {
  const { board, moves, seconds, isSolved, moveTile, shuffle } = usePuzzle();
  const navigate = useNavigate();

  return (
    <div className="play-root">
      <style>{`
        .play-root {
          min-height: 100vh;
          background: var(--bg, #0f0f14);
          color: var(--text-primary, #dde4ed);
          font-family: var(--font-mono, 'IBM Plex Mono', monospace);
          display: grid;
          grid-template-rows: auto 1fr auto;
          overflow-x: hidden;
          position: relative;
        }

        /* scanline texture — matches ai-container */
        .play-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px
          );
          pointer-events: none;
          z-index: 0;
        }

        /* corner glow */
        .play-root::after {
          content: '';
          position: fixed;
          top: 0; left: 0;
          width: min(240px, 40vw); height: min(240px, 40vw);
          background: radial-gradient(circle at 0% 0%, rgba(0,245,255,0.05) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Topbar ── */
        .play-topbar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          padding: clamp(12px, 2vw, 20px) clamp(16px, 4vw, 40px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .play-topbar-left {
          display: flex;
          align-items: center;
          gap: clamp(10px, 2vw, 20px);
        }

        .play-topbar-wordmark {
          font-family: var(--font-label, 'Syne', sans-serif);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--text-muted, #4a5568);
        }

        .play-topbar-sep {
          width: 1px; height: 16px;
          background: rgba(255,255,255,0.06);
          flex-shrink: 0;
        }

        .play-topbar-mode {
          font-size: 11px;
          letter-spacing: 0.12em;
          color: var(--electric, #00f5ff);
          opacity: 0.7;
        }

        .play-topbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .play-status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--electric, #00f5ff);
          box-shadow: 0 0 6px var(--electric, #00f5ff);
          animation: play-pulse 2.4s ease-in-out infinite;
          flex-shrink: 0;
        }

        .play-status-dot.solved {
          background: #38bdf8;
          box-shadow: 0 0 10px #38bdf8;
          animation: none;
        }

        .play-status-label {
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted, #4a5568);
          white-space: nowrap;
        }

        .play-nav-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.06);
          color: var(--text-muted, #4a5568);
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          letter-spacing: 0.08em;
          transition: border-color 0.2s, color 0.2s, box-shadow 0.2s;
          white-space: nowrap;
          touch-action: manipulation;
        }

        .play-nav-btn:hover {
          border-color: var(--electric, #00f5ff);
          color: var(--electric, #00f5ff);
          box-shadow: 0 0 10px rgba(0,245,255,0.15);
        }

        .play-nav-btn.violet:hover {
          border-color: var(--violet, #8b5cf6);
          color: var(--violet, #8b5cf6);
          box-shadow: 0 0 10px rgba(139,92,246,0.15);
        }

        /* ── Main content ── */
        .play-main {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(32px, 5vw, 64px) clamp(16px, 4vw, 40px);
        }

        .play-grid-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted, #4a5568);
          margin-bottom: clamp(16px, 3vw, 28px);
          align-self: center;
        }

        /* Glass wrapper around the puzzle grid */
        .play-grid-glass {
          padding: clamp(14px, 3vw, 28px);
          border-radius: 14px;
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(0,245,255,0.18);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.5),
            0 0 40px rgba(0,245,255,0.04),
            inset 0 1px 0 rgba(255,255,255,0.04);
          backdrop-filter: blur(10px);
          transition: box-shadow 0.4s ease, border-color 0.4s ease;
          position: relative;
        }

        /* Corner crosshairs */
        .play-grid-glass::before,
        .play-grid-glass::after {
          content: '';
          position: absolute;
          width: 16px; height: 16px;
          border-color: rgba(0,245,255,0.2);
          border-style: solid;
        }
        .play-grid-glass::before { top: 12px; left: 12px; border-width: 1px 0 0 1px; }
        .play-grid-glass::after  { bottom: 12px; right: 12px; border-width: 0 1px 1px 0; }

        .play-grid-glass.solved {
          border-color: rgba(56,189,248,0.45);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.5),
            0 0 60px rgba(56,189,248,0.14),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }

        /* ── Metrics strip ── */
        .play-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          margin-top: clamp(20px, 3vw, 32px);
          width: 100%;
          max-width: calc(var(--tile-size, 80px) * 3 + 2 * clamp(14px,3vw,28px) + 2 * clamp(5px,1vw,8px));
          overflow: hidden;
          background: rgba(255,255,255,0.015);
        }

        .play-metric-cell {
          padding: clamp(12px, 2vw, 18px) clamp(14px, 2.5vw, 24px);
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: relative;
        }

        .play-metric-cell + .play-metric-cell {
          border-left: 1px solid rgba(255,255,255,0.06);
        }

        .play-metric-cell::before {
          content: '';
          position: absolute;
          top: 0; left: clamp(14px,2.5vw,24px);
          width: 20px; height: 1px;
          background: var(--electric, #00f5ff);
          opacity: 0;
          transition: opacity 0.4s;
        }

        .play-metric-cell.active::before { opacity: 1; }

        .play-metric-label {
          font-size: 8px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted, #4a5568);
          white-space: nowrap;
        }

        .play-metric-value {
          font-size: clamp(20px, 3.5vw, 26px);
          font-weight: 300;
          color: var(--electric, #00f5ff);
          letter-spacing: -0.02em;
          line-height: 1;
          transition: color 0.3s;
        }

        .play-metric-value.solved-val { color: #38bdf8; }
        .play-metric-value.zero       { color: var(--text-dim, #2d3748); }

        .play-metric-unit {
          font-size: 9px;
          color: var(--text-muted, #4a5568);
          letter-spacing: 0.08em;
        }

        /* Solved banner */
        .play-solved-banner {
          margin-top: clamp(14px, 2.5vw, 22px);
          padding: 9px 20px;
          border: 1px solid rgba(56,189,248,0.25);
          border-radius: 5px;
          background: rgba(56,189,248,0.05);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #38bdf8;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.35s ease, transform 0.35s ease;
          pointer-events: none;
          height: 0;
          overflow: hidden;
          padding: 0;
        }

        .play-solved-banner.visible {
          opacity: 1;
          transform: translateY(0);
          height: auto;
          padding: 9px 20px;
          margin-top: clamp(14px, 2.5vw, 22px);
        }

        /* ── Footer actions ── */
        .play-footer {
          position: relative;
          z-index: 5;
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .play-footer-action {
          padding: clamp(14px, 2vw, 20px) clamp(16px, 3vw, 32px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          background: transparent;
          border: none;
          font-family: var(--font-mono, monospace);
          color: var(--text-muted, #4a5568);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: color 0.2s, background 0.2s;
          touch-action: manipulation;
        }

        .play-footer-action + .play-footer-action {
          border-left: 1px solid rgba(255,255,255,0.06);
        }

        .play-footer-action:hover {
          color: var(--electric, #00f5ff);
          background: rgba(0,245,255,0.03);
        }

        .play-footer-action.shuffle:hover {
          color: var(--violet, #8b5cf6);
          background: rgba(139,92,246,0.03);
        }

        .play-footer-icon { font-size: 13px; opacity: 0.7; }

        /* ── Keyframes ── */
        @keyframes play-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          .play-topbar-sep,
          .play-topbar-mode,
          .play-status-label { display: none; }
          .play-nav-btn { padding: 5px 10px; font-size: 10px; }
          .play-metrics { max-width: 100%; }
        }
      `}</style>

      {/* ── Topbar ── */}
      <header className="play-topbar">
        <div className="play-topbar-left">
          <span className="play-topbar-wordmark">PuzzleVerse</span>
          <div className="play-topbar-sep" />
          <span className="play-topbar-mode">manual mode</span>
        </div>

        <div className="play-topbar-right">
          <div className={`play-status-dot ${isSolved ? "solved" : ""}`} />
          <span className="play-status-label">
            {isSolved ? "solved" : "playing"}
          </span>
          <button className="play-nav-btn" onClick={() => navigate("/")}>
            ← Home
          </button>
          <button className="play-nav-btn" onClick={() => navigate("/ai")}>
            AI Solver
          </button>
          <button className="play-nav-btn violet" onClick={() => navigate("/compare")}>
            Compare
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="play-main">
        <span className="play-grid-label">state space</span>

        <div className={`play-grid-glass ${isSolved ? "solved" : ""}`}>
          <PuzzleGrid board={board} moveTile={moveTile} isSolved={isSolved} />
        </div>

        {/* Metrics */}
        <div className="play-metrics">
          <div className={`play-metric-cell ${moves > 0 ? "active" : ""}`}>
            <span className="play-metric-label">Moves</span>
            <span className={`play-metric-value ${moves === 0 ? "zero" : ""} ${isSolved ? "solved-val" : ""}`}>
              {moves}
            </span>
          </div>

          <div className={`play-metric-cell ${seconds > 0 ? "active" : ""}`}>
            <span className="play-metric-label">Time</span>
            <span className={`play-metric-value ${seconds === 0 ? "zero" : ""} ${isSolved ? "solved-val" : ""}`}>
              {seconds}
            </span>
            <span className="play-metric-unit">s</span>
          </div>

          <div className="play-metric-cell">
            <span className="play-metric-label">Status</span>
            <span
              className={`play-metric-value ${!isSolved ? "zero" : "solved-val"}`}
              style={{ fontSize: "clamp(11px,2vw,13px)", letterSpacing: "0.06em" }}
            >
              {isSolved ? "✦ done" : "active"}
            </span>
          </div>
        </div>

        {/* Solved banner */}
        <div className={`play-solved-banner ${isSolved ? "visible" : ""}`}>
          ✦ &nbsp; Puzzle Solved &nbsp; ✦
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="play-footer">
        <button className="play-footer-action shuffle" onClick={shuffle}>
          <span className="play-footer-icon">↺</span>
          Shuffle
        </button>
        <button className="play-footer-action" onClick={() => navigate("/ai")}>
          <span className="play-footer-icon">→</span>
          AI Solve Mode
        </button>
      </footer>
    </div>
  );
}