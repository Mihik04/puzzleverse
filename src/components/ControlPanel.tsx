type ControlPanelProps = {
  moves: number;
  seconds: number;
  isSolved: boolean;
  shuffle: () => void;
};

export default function ControlPanel({
  moves,
  seconds,
  isSolved,
  shuffle,
}: ControlPanelProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-label">Moves</span>
          <span className="stat-value">{moves}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-label">Time</span>
          <span className="stat-value">{seconds}s</span>
        </div>
      </div>
        <p className={`success-msg ${isSolved ? "visible" : ""}`}>
        ✦ Solved ✦
        </p>

      <button className="shuffle-btn" onClick={shuffle}>
        Shuffle
      </button>
    </div>
  );
}