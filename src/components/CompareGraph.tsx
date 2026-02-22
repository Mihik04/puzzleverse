import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";

/* ── Types ── */
type AlgoResult = {
  stepsExplored: number;
  timeMs: number;
  solutionPath: unknown[];
};

type Props = {
  results: {
    bfs: AlgoResult;
    dfs: AlgoResult;
    astar: AlgoResult;
  };
};

/* ── Colour tokens ── */
const C = {
  electric: "#00f5ff",
  violet:   "#8b5cf6",
  sky:      "#38bdf8",
  grid:     "#1a2235",
  muted:    "#4a5568",
  text:     "#94a3b8",
};

const ALGO_COLORS: Record<string, string> = {
  BFS: C.electric,
  DFS: C.violet,
  "A*": C.sky,
};

/* ── Animated counter ── */
function useCountUp(target: number, duration = 800): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

/* ── Custom tooltip ── */
function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,14,26,0.97)",
      border: "1px solid rgba(0,245,255,0.15)",
      borderRadius: 6,
      padding: "10px 14px",
      fontFamily: "var(--font-mono, monospace)",
      fontSize: 11,
      color: "#e2e8f0",
      maxWidth: 180,
    }}>
      <p style={{ color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, margin: "3px 0" }}>
          {p.name}: <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</strong>
        </p>
      ))}
    </div>
  );
}

/* ── Ranking bar ── */
function RankingBar({ name, value, max, color }: {
  name: string; value: number; max: number; color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 11, marginBottom: 5, color: C.text,
        letterSpacing: "0.1em",
      }}>
        <span>{name}</span>
        <span style={{ color }}>{value.toFixed(3)} ms</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          boxShadow: `0 0 8px ${color}80`,
          borderRadius: 2,
          transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
    </div>
  );
}

/* ── Section header ── */
function SectionHeader({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 9, letterSpacing: "0.25em",
        textTransform: "uppercase", color: C.electric, marginBottom: 4,
      }}>{label}</p>
      {sub && (
        <p style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 10, color: C.muted, letterSpacing: "0.08em",
        }}>{sub}</p>
      )}
    </div>
  );
}

/* ── Glass card ──
   Uses a className hook so padding/radius come from CSS,
   but callers can still pass extra inline style overrides. */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="cg-card" style={style}>
      {children}
    </div>
  );
}

/* ── Animated metric chip ── */
function MetricChip({ label, value, color }: {
  label: string; value: number; color: string;
}) {
  const display = useCountUp(Math.round(value));
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 4,
      padding: "12px 16px",
      background: "rgba(0,0,0,0.2)",
      border: `1px solid ${color}22`,
      borderRadius: 8,
      flex: "1 1 80px",
      minWidth: 0,
    }}>
      <span style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 8, letterSpacing: "0.2em",
        textTransform: "uppercase", color: C.muted,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{label}</span>
      <span style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: "clamp(16px, 3vw, 20px)", fontWeight: 300,
        color, lineHeight: 1,
      }}>
        {display.toLocaleString()}
      </span>
    </div>
  );
}

/* ── Efficiency helper ── */
export function calcEfficiency(result: AlgoResult): number {
  const depth = result.solutionPath.length - 1;
  if (result.stepsExplored === 0) return 0;
  return parseFloat(((depth / result.stepsExplored) * 1000).toFixed(2));
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */
export default function CompareGraph({ results }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [results]);

  const algos = [
    { name: "BFS", r: results.bfs },
    { name: "DFS", r: results.dfs },
    { name: "A*",  r: results.astar },
  ];

  const barData = algos.map(({ name, r }) => ({
    name,
    Nodes:       r.stepsExplored,
    "Time (ms)": parseFloat((r.timeMs || 0.001).toFixed(3)),
    Depth:       r.solutionPath.length - 1,
  }));

  const maxNodes = Math.max(...algos.map(a => a.r.stepsExplored));
  const maxTime  = Math.max(...algos.map(a => a.r.timeMs || 0.001));
  const maxDepth = Math.max(...algos.map(a => a.r.solutionPath.length - 1));

  const radarData = [
    { metric: "Speed",      ...Object.fromEntries(algos.map(a => [a.name, Math.round((1 - (a.r.timeMs || 0.001) / maxTime) * 100)])) },
    { metric: "Efficiency", ...Object.fromEntries(algos.map(a => [a.name, Math.round((1 - a.r.stepsExplored / maxNodes) * 100)])) },
    { metric: "Optimality", ...Object.fromEntries(algos.map(a => [a.name, Math.round((1 - (a.r.solutionPath.length - 1) / maxDepth) * 100)])) },
    { metric: "Nodes↓",    ...Object.fromEntries(algos.map(a => [a.name, Math.round((1 - a.r.stepsExplored / maxNodes) * 100)])) },
  ];

  const ranked = [...algos].sort((a, b) => (a.r.timeMs || 0.001) - (b.r.timeMs || 0.001));

  return (
    <>
      {/* Scoped styles injected once */}
      <style>{`
        .cg-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(0,245,255,0.1);
          border-radius: 12px;
          padding: clamp(16px, 3vw, 28px) clamp(16px, 3vw, 32px);
          backdrop-filter: blur(10px);
          box-shadow: 0 0 40px rgba(0,245,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04);
          min-width: 0;
        }

        /* Row 1: summary grid — 3 cols desktop, 1 col mobile */
        .cg-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        /* Row 2: grouped bar + radar side by side */
        .cg-row2 {
          display: grid;
          grid-template-columns: 1fr min(38%, 380px);
          gap: 24px;
          align-items: start;
        }

        /* Row 3: time bar + ranking side by side */
        .cg-row3 {
          display: grid;
          grid-template-columns: 1fr min(36%, 340px);
          gap: 24px;
          align-items: start;
        }

        /* Algo column inside summary */
        .cg-algo-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .cg-algo-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .cg-algo-label {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding-bottom: 6px;
          margin-bottom: 4px;
        }

        /* ── Tablet ── */
        @media (max-width: 1024px) {
          .cg-row2,
          .cg-row3 {
            grid-template-columns: 1fr;
          }
        }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          .cg-summary-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .cg-row2,
          .cg-row3 {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .cg-card {
            padding: 14px;
          }
        }
      `}</style>

      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        marginTop: 40,
      }}>

        {/* ══ Row 1: Summary chips ══ */}
        <Card>
          <SectionHeader label="Run Summary" sub="Aggregated metrics from this benchmark run" />
          <div className="cg-summary-grid">
            {algos.map(({ name, r }) => (
              <div key={name} className="cg-algo-col">
                <span
                  className="cg-algo-label"
                  style={{
                    color: ALGO_COLORS[name],
                    borderBottom: `1px solid ${ALGO_COLORS[name]}30`,
                  }}
                >{name}</span>
                <div className="cg-algo-chips">
                  <MetricChip label="Nodes" value={r.stepsExplored}         color={ALGO_COLORS[name]} />
                  <MetricChip label="Depth" value={r.solutionPath.length-1} color={ALGO_COLORS[name]} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ══ Row 2: Grouped bar + Radar ══ */}
        <div className="cg-row2">

          <Card>
            <SectionHeader label="Grouped Benchmark" sub="Nodes expanded · Solution depth per algorithm" />
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barCategoryGap="28%" barGap={4}>
                <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke={C.muted}
                  tick={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, fill: C.text }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  stroke={C.muted}
                  tick={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, fill: C.muted }}
                  axisLine={false} tickLine={false} width={48}
                />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Legend wrapperStyle={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, letterSpacing: "0.1em", color: C.text }} />
                <Bar dataKey="Nodes" radius={[3,3,0,0]}>
                  {barData.map((_, i) => <Cell key={i} fill={[C.electric, C.violet, C.sky][i]} />)}
                </Bar>
                <Bar dataKey="Depth" radius={[3,3,0,0]} opacity={0.7}>
                  {barData.map((_, i) => <Cell key={i} fill={[`${C.electric}80`, `${C.violet}80`, `${C.sky}80`][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <SectionHeader label="Performance Radar" sub="Higher = better" />
            {/* RadarChart needs an explicit pixel height to render; ResponsiveContainer handles width */}
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} outerRadius="38%">
                <PolarGrid stroke={C.grid} />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, fill: C.text }}
                />
                {algos.map(({ name }) => (
                  <Radar
                    key={name}
                    name={name}
                    dataKey={name}
                    stroke={ALGO_COLORS[name]}
                    fill={ALGO_COLORS[name]}
                    fillOpacity={0.08}
                    strokeWidth={1.5}
                  />
                ))}
                <Legend wrapperStyle={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, letterSpacing: "0.1em", color: C.text }} />
                <Tooltip content={<DarkTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ══ Row 3: Time bar + Speed ranking ══ */}
        <div className="cg-row3">

          <Card>
            <SectionHeader label="Execution Time" sub="Wall-clock time in milliseconds" />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barCategoryGap="40%">
                <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke={C.muted}
                  tick={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, fill: C.text }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  stroke={C.muted}
                  tick={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, fill: C.muted }}
                  axisLine={false} tickLine={false} width={52}
                  tickFormatter={(v) => `${v}ms`}
                />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="Time (ms)" radius={[3,3,0,0]}>
                  {barData.map((_, i) => <Cell key={i} fill={[C.electric, C.violet, C.sky][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <SectionHeader label="Speed Ranking" sub="Fastest first" />
            <div style={{ marginTop: 8 }}>
              {ranked.map(({ name, r }, i) => (
                <div key={name} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 18 }}>
                  <div style={{
                    width: 22, height: 22,
                    borderRadius: "50%",
                    border: `1px solid ${ALGO_COLORS[name]}50`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: 9, color: ALGO_COLORS[name],
                    flexShrink: 0, marginTop: 2,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <RankingBar
                      name={name}
                      value={r.timeMs || 0.001}
                      max={maxTime}
                      color={ALGO_COLORS[name]}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Efficiency scores */}
            <div style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              <p style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 9, letterSpacing: "0.2em",
                textTransform: "uppercase", color: C.muted,
                marginBottom: 10,
              }}>
                Efficiency Score
                <span style={{ opacity: 0.4, marginLeft: 4 }}>(depth/nodes ×1000)</span>
              </p>
              {algos.map(({ name, r }) => (
                <div key={name} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 11, marginBottom: 7, color: C.text,
                }}>
                  <span style={{ color: ALGO_COLORS[name] }}>{name}</span>
                  <span>{calcEfficiency(r)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </>
  );
}