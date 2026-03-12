import { useNavigate } from "react-router-dom";

/* ── Mini puzzle preview: a 3×3 grid of tiny squares ── */
function MiniPuzzle({ pattern, color }: { pattern: number[]; color: string }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 10px)",
      gap: 2,
    }}>
      {pattern.map((filled, i) => (
        <div
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            background: filled
              ? color
              : "rgba(255,255,255,0.04)",
            border: filled
              ? `1px solid ${color}60`
              : "1px solid rgba(255,255,255,0.06)",
            boxShadow: filled ? `0 0 4px ${color}80` : "none",
            transition: "background 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

/* ── Card data ── */
const MODES = [
  {
    id:    "manual",
    path:  "/play",
    index: "01",
    title: "Manual Mode",
    subtitle: "Play",
    description:
      "Take direct control of the 8-puzzle. Slide tiles with precision, track your move count and solve time. Pure human vs. puzzle.",
    color:     "#00f5ff",
    dimColor:  "rgba(0, 245, 255, 0.08)",
    tag:       "interactive",
    // solved state — mostly filled
    pattern: [1,1,1, 1,0,1, 1,1,1],
    features: ["Move counter", "Live timer", "Solved detection"],
  },
  {
    id:    "ai",
    path:  "/ai",
    index: "02",
    title: "AI Solver",
    subtitle: "Autonomous",
    description:
      "Watch BFS, DFS, or A* algorithms unravel any board configuration in real time. Tune speed and observe heuristic search in motion.",
    color:     "#8b5cf6",
    dimColor:  "rgba(139, 92, 246, 0.08)",
    tag:       "algorithmic",
    pattern: [1,0,1, 0,1,0, 1,0,1],
    features: ["3 algorithms", "Speed control", "Node metrics"],
  },
  {
    id:    "compare",
    path:  "/compare",
    index: "03",
    title: "Comparison",
    subtitle: "Benchmark",
    description:
      "Race all three algorithms simultaneously on the same board. Visualise performance with radar charts, bar graphs, and ranked speed tables.",
    color:     "#38bdf8",
    dimColor:  "rgba(56, 189, 248, 0.08)",
    tag:       "analytics",
    pattern: [1,1,0, 1,0,1, 0,1,1],
    features: ["Live race", "Performance graphs", "Efficiency scores"],
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="hp-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=Syne:wght@500;600;700&display=swap');

        /* ── Root ── */
        .hp-root {
          min-height: 100vh;
          background: #0f0f14;
          font-family: 'IBM Plex Mono', monospace;
          color: #dde4ed;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          position: relative;
        }

        /* ── Background dot-grid ── */
        .hp-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Corner glow blobs ── */
        .hp-root::after {
          content: '';
          position: fixed;
          top: -80px; left: -80px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        .hp-glow-br {
          position: fixed;
          bottom: -80px; right: -80px;
          width: 360px; height: 360px;
          background: radial-gradient(circle, rgba(0,245,255,0.05) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Topbar ── */
        .hp-topbar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: clamp(16px, 2.5vw, 24px) clamp(20px, 5vw, 56px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          animation: hp-fade-down 0.5s ease forwards;
        }

        .hp-wordmark {
          font-family: 'Syne', sans-serif;
          font-size: clamp(13px, 2vw, 16px);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #dde4ed;
        }

        .hp-wordmark span {
          color: #00f5ff;
        }

        .hp-topbar-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hp-status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #00f5ff;
          box-shadow: 0 0 6px #00f5ff;
          animation: hp-pulse 2.4s ease-in-out infinite;
        }

        .hp-status-text {
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #2d3748;
        }

        /* ── Hero ── */
        .hp-hero {
          position: relative;
          z-index: 5;
          padding: clamp(48px, 8vw, 96px) clamp(20px, 5vw, 56px) clamp(32px, 5vw, 56px);
          animation: hp-fade-up 0.6s 0.1s ease both;
        }

        .hp-hero-tag {
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #8b5cf6;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .hp-hero-tag::before {
          content: '';
          display: block;
          width: 24px; height: 1px;
          background: #8b5cf6;
        }

        .hp-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 5vw, 52px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #e8edf5;
          max-width: 640px;
          margin-bottom: 20px;
        }

        .hp-hero-title .accent {
          color: #00f5ff;
          position: relative;
        }

        .hp-hero-desc {
          font-size: clamp(11px, 1.5vw, 13px);
          color: #4a5568;
          letter-spacing: 0.04em;
          line-height: 1.7;
          max-width: 480px;
        }

        /* ── Cards grid ── */
        .hp-cards {
          position: relative;
          z-index: 5;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(14px, 2.5vw, 24px);
          padding: 0 clamp(20px, 5vw, 56px) clamp(56px, 8vw, 96px);
        }

        /* ── Single card ── */
        .hp-card {
          position: relative;
          background: rgba(255,255,255,0.022);
          border-radius: 14px;
          padding: clamp(20px, 3vw, 32px);
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          transition:
            transform 0.22s cubic-bezier(0.16,1,0.3,1),
            border-color 0.22s ease,
            box-shadow 0.22s ease;
          animation: hp-fade-up 0.5s ease both;
          display: flex;
          flex-direction: column;
          gap: 0;
          text-decoration: none;
          color: inherit;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .hp-card:nth-child(1) { animation-delay: 0.18s; }
        .hp-card:nth-child(2) { animation-delay: 0.28s; }
        .hp-card:nth-child(3) { animation-delay: 0.38s; }

        .hp-card:hover {
          transform: translateY(-4px);
          border-color: var(--card-color, #00f5ff);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.6),
            0 12px 40px rgba(0,0,0,0.4),
            0 0 40px var(--card-dim, rgba(0,245,255,0.08));
        }

        /* Scanline overlay per card */
        .hp-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            0deg, transparent, transparent 3px,
            rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px
          );
          pointer-events: none;
          z-index: 0;
          border-radius: 14px;
        }

        /* Top accent line */
        .hp-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: var(--card-color, #00f5ff);
          opacity: 0;
          transition: opacity 0.22s ease;
        }

        .hp-card:hover::after { opacity: 1; }

        .hp-card > * { position: relative; z-index: 1; }

        /* Card top row */
        .hp-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .hp-card-index {
          font-size: 9px;
          letter-spacing: 0.22em;
          color: #2d3748;
        }

        /* Card title block */
        .hp-card-title-block {
          margin-bottom: 14px;
        }

        .hp-card-subtitle {
          font-size: 9px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--card-color, #00f5ff);
          margin-bottom: 6px;
          opacity: 0.8;
        }

        .hp-card-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(16px, 2.2vw, 22px);
          font-weight: 600;
          color: #e8edf5;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        /* Description */
        .hp-card-desc {
          font-size: clamp(10px, 1.2vw, 11px);
          color: #4a5568;
          line-height: 1.75;
          letter-spacing: 0.02em;
          margin-bottom: 24px;
          flex: 1;
        }

        /* Feature pills */
        .hp-card-features {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 24px;
        }

        .hp-card-pill {
          padding: 4px 10px;
          border-radius: 3px;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          color: #4a5568;
          white-space: nowrap;
          transition: border-color 0.2s, color 0.2s;
        }

        .hp-card:hover .hp-card-pill {
          border-color: var(--card-color, #00f5ff);
          color: var(--card-color, #00f5ff);
          opacity: 0.6;
        }

        /* CTA row */
        .hp-card-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .hp-card-cta-text {
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--card-color, #00f5ff);
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.22s ease, transform 0.22s ease;
        }

        .hp-card:hover .hp-card-cta-text {
          opacity: 1;
          transform: translateX(0);
        }

        .hp-card-arrow {
          font-size: 14px;
          color: var(--card-color, #00f5ff);
          opacity: 0.3;
          transition: opacity 0.22s ease, transform 0.22s ease;
        }

        .hp-card:hover .hp-card-arrow {
          opacity: 1;
          transform: translateX(4px);
        }

        /* ── Footer ── */
        .hp-footer {
          position: relative;
          z-index: 5;
          padding: clamp(16px, 3vw, 24px) clamp(20px, 5vw, 56px);
          border-top: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: auto;
          animation: hp-fade-up 0.5s 0.5s ease both;
        }

        .hp-footer-left {
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #2d3748;
        }

        .hp-footer-right {
          display: flex;
          gap: 20px;
        }

        .hp-footer-link {
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #2d3748;
          cursor: pointer;
          transition: color 0.2s;
          background: none;
          border: none;
          font-family: inherit;
          padding: 0;
        }

        .hp-footer-link:hover { color: #4a5568; }

        /* ── Keyframes ── */
        @keyframes hp-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes hp-fade-down {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes hp-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .hp-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .hp-card:nth-child(3) {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 600px) {
          .hp-cards {
            grid-template-columns: 1fr;
          }

          .hp-card:nth-child(3) {
            grid-column: auto;
          }

          .hp-hero-title { font-size: clamp(22px, 7vw, 32px); }

          .hp-footer-right { display: none; }
        }
      `}</style>

      {/* Bottom-right glow */}
      <div className="hp-glow-br" />

      {/* ── Topbar ── */}
      <header className="hp-topbar">
        <span className="hp-wordmark">
          Puzzle<span>Verse</span>
        </span>
        <div className="hp-topbar-right">
          <div className="hp-status-dot" />
          <span className="hp-status-text">v1.0 · ready</span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hp-hero">
        <p className="hp-hero-tag">8-puzzle research platform</p>
        <h1 className="hp-hero-title">
          Choose your<br />
          <span className="accent">mode of play.</span>
        </h1>
        <p className="hp-hero-desc">
          Explore the 8-puzzle through three distinct lenses — manual control,
          autonomous AI solving, and algorithmic benchmarking.
        </p>
      </section>

      {/* ── Mode Cards ── */}
      <section className="hp-cards">
        {MODES.map((mode) => (
          <div
            key={mode.id}
            className="hp-card"
            style={{
              "--card-color": mode.color,
              "--card-dim":   mode.dimColor,
            } as React.CSSProperties}
            onClick={() => navigate(mode.path)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(mode.path)}
          >
            {/* Top row: index + mini puzzle */}
            <div className="hp-card-top">
              <span className="hp-card-index">{mode.index}</span>
              <MiniPuzzle pattern={mode.pattern} color={mode.color} />
            </div>

            {/* Title */}
            <div className="hp-card-title-block">
              <p className="hp-card-subtitle">{mode.subtitle}</p>
              <h2 className="hp-card-title">{mode.title}</h2>
            </div>

            {/* Description */}
            <p className="hp-card-desc">{mode.description}</p>

            {/* Feature pills */}
            <div className="hp-card-features">
              {mode.features.map((f) => (
                <span key={f} className="hp-card-pill">{f}</span>
              ))}
            </div>

            {/* CTA */}
            <div className="hp-card-cta">
              <span className="hp-card-cta-text">Launch →</span>
              <span className="hp-card-arrow">→</span>
            </div>
          </div>
        ))}
      </section>

      {/* ── Footer ── */}
      <footer className="hp-footer">
        <span className="hp-footer-left">PuzzleVerse · 8-Puzzle AI Platform</span>
        <div className="hp-footer-right">
          <button className="hp-footer-link" onClick={() => navigate("/play")}>Manual</button>
          <button className="hp-footer-link" onClick={() => navigate("/ai")}>AI Solver</button>
          <button className="hp-footer-link" onClick={() => navigate("/compare")}>Compare</button>
        </div>
      </footer>
    </div>
  );
}