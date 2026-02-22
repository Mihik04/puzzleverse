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

/* ── Colour tokens (mirror CSS vars) ── */
const C = {
  electric: "#00f5ff",
  violet:   "#8b5cf6",
  sky:      "#38bdf8",
  amber:    "#f59e0b",
  grid:     "#1a2235",
  muted:    "#4a5568",
  text:     "#94a3b8",
};

const ALGO_COLORS: Record<string, string> = {
  BFS: C.electric,
  DFS: C.violet,
  "A*": C.sky,
};

/* ── Animated counter hook ── */
function useCountUp(target: number, duration = 800): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const from = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setVal(Math.round(from + (target - from) * eased));
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
      background: "rgba(10,14,26,0.95)",
      border: "1px solid rgba(0,245,255,0.15)",
      borderRadius: 6,
      padding: "10px 14px",
      fontFamily: "var(--font-mono, monospace)",
      fontSize: 11,
      color: "#e2e8f0",
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


/* ── Ranking bar component ── */
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
      <div style={{
        height: 4, background: "rgba(255,255,255,0.05)",
        borderRadius: 2, overflow: "hidden",
      }}>
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
        fontSize: 9,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: C.electric,
        marginBottom: 4,
      }}>{label}</p>
      {sub && (
        <p style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 10,
          color: C.muted,
          letterSpacing: "0.08em",
        }}>{sub}</p>
      )}
    </div>
  );
}

/* ── Glass card ── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(0,245,255,0.1)",
      borderRadius: 12,
      padding: "28px 32px",
      backdropFilter: "blur(10px)",
      boxShadow: "0 0 40px rgba(0,245,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04)",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Animated metric chip ── */
function MetricChip({ label, value, unit, color }: {
  label: string; value: number; unit?: string; color: string;
}) {
  const display = useCountUp(Math.round(value));
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 4,
      padding: "14px 20px",
      background: "rgba(0,0,0,0.2)",
      border: `1px solid ${color}22`,
      borderRadius: 8,
      minWidth: 100,
    }}>
      <span style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 8, letterSpacing: "0.2em",
        textTransform: "uppercase", color: C.muted,
      }}>{label}</span>
      <span style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 20, fontWeight: 300,
        color, lineHeight: 1,
      }}>
        {display.toLocaleString()}
        {unit && <span style={{ fontSize: 10, marginLeft: 3, opacity: 0.5 }}>{unit}</span>}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */
export default function CompareGraph({ results }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slight delay so charts fade in after render
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [results]);

  /* ── Derived data ── */
  const algos = [
    { name: "BFS",  r: results.bfs },
    { name: "DFS",  r: results.dfs },
    { name: "A*",   r: results.astar },
  ];

  const barData = algos.map(({ name, r }) => ({
    name,
    Nodes:   r.stepsExplored,
    "Time (ms)": parseFloat((r.timeMs || 0.001).toFixed(3)),
    Depth:   r.solutionPath.length - 1,
  }));

  const maxNodes = Math.max(...algos.map(a => a.r.stepsExplored));
  const maxTime  = Math.max(...algos.map(a => a.r.timeMs || 0.001));
  const maxDepth = Math.max(...algos.map(a => a.r.solutionPath.length - 1));

  // Radar: normalise each metric 0–100 (lower = better, so invert)
  const radarData = [
    { metric: "Speed",      ...Object.fromEntries(algos.map(a => [a.name, Math.round((1 - (a.r.timeMs || 0.001) / maxTime) * 100)])) },
    { metric: "Efficiency", ...Object.fromEntries(algos.map(a => [a.name, Math.round((1 - a.r.stepsExplored / maxNodes) * 100)])) },
    { metric: "Optimality", ...Object.fromEntries(algos.map(a => [a.name, Math.round((1 - (a.r.solutionPath.length - 1) / maxDepth) * 100)])) },
    { metric: "Nodes↓",    ...Object.fromEntries(algos.map(a => [a.name, Math.round((1 - a.r.stepsExplored / maxNodes) * 100)])) },
  ];

  // Ranking by time
  const ranked = [...algos].sort((a, b) => (a.r.timeMs || 0.001) - (b.r.timeMs || 0.001));

  const containerStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition: "opacity 0.5s ease, transform 0.5s ease",
    display: "flex",
    flexDirection: "column",
    gap: 28,
    marginTop: 40,
  };

  return (
    <div style={containerStyle}>

      {/* ══ Row 1: Summary chips ══ */}
      <Card>
        <SectionHeader label="Run Summary" sub="Aggregated metrics from this benchmark run" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {algos.map(({ name, r }) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10, letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: ALGO_COLORS[name],
                borderBottom: `1px solid ${ALGO_COLORS[name]}30`,
                paddingBottom: 6, marginBottom: 4,
              }}>{name}</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <MetricChip label="Nodes"  value={r.stepsExplored}         color={ALGO_COLORS[name]} />
                <MetricChip label="Depth"  value={r.solutionPath.length-1} color={ALGO_COLORS[name]} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ══ Row 2: Grouped bar + Radar ══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 28 }}>

        {/* Grouped Bar */}
        <Card>
          <SectionHeader label="Grouped Benchmark" sub="Nodes expanded · Solution depth per algorithm" />
          <ResponsiveContainer width="100%" height={280}>
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
                axisLine={false} tickLine={false} width={50}
              />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Legend
                wrapperStyle={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: C.text,
                }}
              />
              <Bar dataKey="Nodes" fill={C.electric} radius={[3,3,0,0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={[C.electric, C.violet, C.sky][i]} />
                ))}
              </Bar>
              <Bar dataKey="Depth" fill={C.amber} radius={[3,3,0,0]} opacity={0.7}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={[`${C.electric}80`, `${C.violet}80`, `${C.sky}80`][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Radar */}
        <Card>
          <SectionHeader label="Performance Radar" sub="Higher = better across all axes" />
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} outerRadius={90}>
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
              <Legend
                wrapperStyle={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: C.text,
                }}
              />
              <Tooltip content={<DarkTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ══ Row 3: Time bar chart + Speed ranking ══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28 }}>

        {/* Execution time bar */}
        <Card>
          <SectionHeader label="Execution Time" sub="Wall-clock time in milliseconds" />
          <ResponsiveContainer width="100%" height={220}>
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
                axisLine={false} tickLine={false} width={55}
                tickFormatter={(v) => `${v}ms`}
              />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="Time (ms)" radius={[3,3,0,0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={[C.electric, C.violet, C.sky][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Speed ranking */}
        <Card>
          <SectionHeader label="Speed Ranking" sub="Sorted by execution time (fastest first)" />
          <div style={{ marginTop: 8 }}>
            {ranked.map(({ name, r }, i) => (
              <div key={name} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 22, height: 22,
                  borderRadius: "50%",
                  border: `1px solid ${ALGO_COLORS[name]}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 9, color: ALGO_COLORS[name],
                  flexShrink: 0, marginTop: 2,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
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
            marginTop: 24,
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            <p style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 9, letterSpacing: "0.2em",
              textTransform: "uppercase", color: C.muted,
              marginBottom: 10,
            }}>Efficiency Score <span style={{ opacity: 0.5 }}>(depth/nodes ×1000)</span></p>
            {algos.map(({ name, r }) => {
              const score = calcEfficiency(r);
              return (
                <div key={name} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 11, marginBottom: 7,
                  color: C.text,
                }}>
                  <span style={{ color: ALGO_COLORS[name] }}>{name}</span>
                  <span>{score}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

    </div>
  );
}

/* ── re-export helper so ComparePage can use it ── */
export function calcEfficiency(result: AlgoResult): number {
  const depth = result.solutionPath.length - 1;
  if (result.stepsExplored === 0) return 0;
  return parseFloat(((depth / result.stepsExplored) * 1000).toFixed(2));
}