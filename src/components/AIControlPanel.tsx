type Props = {
  algorithm: string;
  setAlgorithm: (value: string) => void;
  speed: number;
  setSpeed: (value: number) => void;
  onSolve: () => void;
  onShuffle: () => void;
  isSolving: boolean;
};

const ALGORITHMS: { id: string; label: string; sub: string }[] = [
  { id: "bfs",   label: "BFS", sub: "breadth-first search" },
  { id: "dfs",   label: "DFS", sub: "depth-first (stub)"   },
  { id: "astar", label: "A*",  sub: "manhattan heuristic"  },
];

export default function AIControlPanel({
  algorithm,
  setAlgorithm,
  speed,
  setSpeed,
  onSolve,
  onShuffle,
  isSolving,
}: Props) {
  return (
    <div className="ai-control-panel">

      {/* ── Algorithm ── */}
      <div>
        <p className="ctrl-label">Algorithm</p>
        <div className="ctrl-algo-group">
          {ALGORITHMS.map((algo) => (
            <button
              key={algo.id}
              className={`ctrl-algo-btn ${algorithm === algo.id ? "active" : ""}`}
              onClick={() => setAlgorithm(algo.id)}
              disabled={isSolving}
            >
              <span className="algo-indicator" />
              <span>
                <span style={{ fontWeight: 500 }}>{algo.label}</span>
                <span style={{ marginLeft: 8, opacity: 0.4, fontSize: "10px" }}>
                  {algo.sub}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="ctrl-divider" />

      {/* ── Speed ── */}
      <div>
        <div className="ctrl-speed-row">
          <p className="ctrl-label" style={{ margin: 0 }}>Step Delay</p>
          <span className="ctrl-speed-val">{speed}ms</span>
        </div>
        <input
          type="range"
          className="ctrl-slider"
          min="50"
          max="1000"
          step="50"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={isSolving}
        />
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
          opacity: 0.3,
          fontSize: 9,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.12em",
        }}>
          <span>50ms</span>
          <span>1000ms</span>
        </div>
      </div>

      <div className="ctrl-divider" />

      {/* ── Actions ── */}
      <div className="ctrl-actions">
        <button
          className={`ctrl-btn-primary ${isSolving ? "solving" : ""}`}
          onClick={onSolve}
          disabled={isSolving}
        >
          {isSolving ? "solving..." : "▶  Run Solver"}
        </button>
        <button
          className="ctrl-btn-secondary"
          onClick={onShuffle}
          disabled={isSolving}
        >
          ↺  Shuffle State
        </button>
      </div>

      {/* Preserves the original conditional render */}
      {isSolving && (
        <div style={{
          marginTop: 4,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase" as const,
          color: "var(--electric)",
          opacity: 0.6,
        }}>
          Running Search...
        </div>
      )}
    </div>
  );
}