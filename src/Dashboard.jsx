import { useState, useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, Cell, AreaChart, Area
} from "recharts";

/* ────────────────────────────────────────────────────────────
   DESIGN TOKENS
   Instrument-panel aesthetic. Calm slate canvas, one confident
   indigo primary, a warm rose accent as a quiet nod to the
   matrimonial context. Signal colors do the loud talking.
──────────────────────────────────────────────────────────── */
const T = {
  bg: "#0F1117",
  panel: "#171A22",
  panel2: "#1C2029",
  line: "#2A2F3A",
  ink: "#EDEFF4",
  sub: "#9BA2B0",
  faint: "#5C6373",
  indigo: "#7C83FF",
  rose: "#E8709A",
  up: "#4ADE9E",
  down: "#F1657A",
  watch: "#E8B04A",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

/* ── SEGMENT DEFINITIONS ── */
const SEGMENTS = {
  gender: { label: "Gender", opts: ["All", "Women", "Men"] },
  platform: { label: "Platform", opts: ["All", "iOS", "Android", "Web"] },
  sub: { label: "Subscription", opts: ["All", "Free", "Paid"] },
  age: { label: "Age", opts: ["All", "21–26", "27–32", "33–40", "40+"] },
  income: { label: "Income", opts: ["All", "<5L", "5–12L", "12–25L", "25L+"] },
  marital: { label: "Marital status", opts: ["All", "Never married", "Divorced", "Widowed"] },
};

/* ── TABS ── */
const TABS = [
  "Overview", "Acquisition", "Matchmaking", "Conversion",
  "Monetisation", "Retention", "Technical & Trust",
];

/* deterministic pseudo-variation so filters feel alive */
function jitter(seed, base, spread) {
  const x = Math.sin(seed * 999.7) * 10000;
  const f = x - Math.floor(x);
  return +(base * (1 + (f - 0.5) * spread)).toFixed(base < 10 ? 2 : 0);
}
function segSeed(f) {
  return Object.values(f).join("|").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

/* ── SIGNAL DATA (baseline vs today) ── */
function buildSignals(seed) {
  const raw = [
    { m: "Successful subscriptions", tab: "Monetisation", base: 412, dir: -1, spread: 0.22,
      why: "Trial-start CTR steady, but payment failures up on Android. Likely a gateway or SKU issue, not demand." },
    { m: "Women reply rate", tab: "Matchmaking", base: 38, unit: "%", dir: -1, spread: 0.14,
      why: "Female DAU flat, inbound interests up 19%. Supply strain, not a UX regression. Watch inbox volume per woman." },
    { m: "Crash-free sessions", tab: "Technical & Trust", base: 99.1, unit: "%", dir: -1, spread: 0.02,
      why: "Concentrated on iOS 17.4 after yesterday's release. Isolate build, consider staged rollback." },
    { m: "Interests sent / day", tab: "Matchmaking", base: 18400, dir: 1, spread: 0.10,
      why: "Up after home-feed ranking change. Healthy, but check it converts to replies, not just sends." },
    { m: "Revenue / day", tab: "Overview", base: 486000, unit: "₹", dir: -1, spread: 0.12,
      why: "Tracks the subscription dip above. Same root cause, not a second problem." },
    { m: "Onboarding completion", tab: "Acquisition", base: 61, unit: "%", dir: 1, spread: 0.08,
      why: "Caste-preference step reorder lifted completion. Roll the pattern to the income step next." },
  ];
  return raw.map((r, i) => {
    const today = jitter(seed + i * 7, r.base, r.spread);
    const delta = ((today - r.base) / r.base) * 100;
    return { ...r, today, base: r.base, delta: +delta.toFixed(1) };
  });
}

/* ── fmt ── */
function fmt(v, unit) {
  if (unit === "₹") return "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v);
  if (unit === "%") return v + "%";
  if (v >= 1000) return (v / 1000).toFixed(1) + "k";
  return v;
}

export default function Dashboard() {
  const [tab, setTab] = useState("Overview");
  const [filters, setFilters] = useState(
    Object.fromEntries(Object.keys(SEGMENTS).map(k => [k, "All"]))
  );
  const seed = segSeed(filters);
  const signals = useMemo(() => buildSignals(seed), [seed]);
  const movers = signals.filter(s => Math.abs(s.delta) >= 3);

  const activeFilters = Object.entries(filters).filter(([, v]) => v !== "All");

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.ink,
      fontFamily: "'Inter', sans-serif", paddingBottom: 60 }}>
      <style>{FONTS}{`
        * { box-sizing: border-box; }
        .num { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
        .disp { font-family: 'Fraunces', serif; }
        button { font-family: inherit; cursor: pointer; }
        select { font-family: 'Inter', sans-serif; }
        .tabbtn { transition: color .15s, border-color .15s; }
        .tabbtn:hover { color: ${T.ink}; }
        .card { transition: transform .15s, border-color .15s; }
        .sig:hover { border-color: ${T.faint} !important; transform: translateY(-2px); }
        @media (prefers-reduced-motion: reduce){ .card,.sig{transition:none;} }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ borderBottom: `1px solid ${T.line}`, padding: "20px 28px 0",
        position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
          flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="disp" style={{ fontSize: 25, fontWeight: 600, letterSpacing: -0.3 }}>
              Product Pulse
              <span style={{ color: T.rose }}>.</span>
            </div>
            <div style={{ fontSize: 12.5, color: T.sub, marginTop: 2 }}>
              Matrimonial app · daily health instrument
            </div>
          </div>
          <div style={{ fontSize: 12, color: T.faint, textAlign: "right" }}>
            <div className="num" style={{ color: T.sub }}>Today vs trailing 7-day baseline</div>
            <div className="num" style={{ marginTop: 2 }}>05 Jul 2026 · 09:14 IST</div>
          </div>
        </div>

        {/* SEGMENT FILTER BAR */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "14px 0 12px" }}>
          {Object.entries(SEGMENTS).map(([k, s]) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <label style={{ fontSize: 9.5, letterSpacing: 0.6, textTransform: "uppercase",
                color: T.faint, paddingLeft: 2 }}>{s.label}</label>
              <select value={filters[k]}
                onChange={e => setFilters(f => ({ ...f, [k]: e.target.value }))}
                style={{
                  background: filters[k] === "All" ? T.panel : T.panel2,
                  color: filters[k] === "All" ? T.sub : T.ink,
                  border: `1px solid ${filters[k] === "All" ? T.line : T.indigo}`,
                  borderRadius: 7, padding: "6px 8px", fontSize: 12.5, outline: "none",
                  minWidth: k === "marital" ? 118 : 78,
                }}>
                {s.opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {activeFilters.length > 0 && (
            <button onClick={() => setFilters(Object.fromEntries(Object.keys(SEGMENTS).map(k => [k, "All"])))}
              style={{ alignSelf: "flex-end", background: "none", border: `1px solid ${T.line}`,
                color: T.sub, borderRadius: 7, padding: "6px 10px", fontSize: 12, marginBottom: 0 }}>
              Reset · {activeFilters.length}
            </button>
          )}
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 22, overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t} className="tabbtn" onClick={() => setTab(t)}
              style={{ background: "none", border: "none", padding: "8px 0 12px",
                fontSize: 13.5, fontWeight: tab === t ? 600 : 400,
                color: tab === t ? T.ink : T.sub,
                borderBottom: `2px solid ${tab === t ? T.rose : "transparent"}`,
                whiteSpace: "nowrap" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "22px 28px 0", maxWidth: 1180, margin: "0 auto" }}>

        {/* ── SIGNAL BAND (signature element) ── */}
        <SignalBand movers={movers} onJump={setTab} />

        {/* ── TAB CONTENT ── */}
        <div style={{ marginTop: 26 }}>
          {tab === "Overview" && <Overview seed={seed} />}
          {tab === "Acquisition" && <Acquisition seed={seed} />}
          {tab === "Matchmaking" && <Matchmaking seed={seed} filters={filters} />}
          {tab === "Conversion" && <Conversion seed={seed} />}
          {tab === "Monetisation" && <Monetisation seed={seed} />}
          {tab === "Retention" && <Retention seed={seed} />}
          {tab === "Technical & Trust" && <Technical seed={seed} />}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ SIGNAL BAND ═══════════════ */
function SignalBand({ movers, onJump }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14,
      padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 7, height: 7, borderRadius: 9, background: T.rose,
            boxShadow: `0 0 0 4px ${T.rose}22` }} />
          <span className="disp" style={{ fontSize: 17, fontWeight: 600 }}>What moved today</span>
        </div>
        <span style={{ fontSize: 12, color: T.faint }} className="num">
          {movers.length} signal{movers.length !== 1 ? "s" : ""} past threshold
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(268px, 1fr))",
        gap: 12 }}>
        {movers.map((s, i) => {
          const good = (s.dir === 1 && s.delta > 0) || (s.dir === -1 && s.delta > 0 && s.m.includes("Interest"));
          const col = s.delta > 0 ? T.up : T.down;
          const arrow = s.delta > 0 ? "▲" : "▼";
          return (
            <div key={i} className="card sig" onClick={() => onJump(s.tab)}
              style={{ background: T.panel2, border: `1px solid ${T.line}`, borderRadius: 11,
                padding: "13px 14px", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, maxWidth: 168 }}>{s.m}</span>
                <span className="num" style={{ color: col, fontSize: 13, fontWeight: 600,
                  whiteSpace: "nowrap" }}>{arrow} {Math.abs(s.delta)}%</span>
              </div>
              <div className="num" style={{ fontSize: 20, marginTop: 6, letterSpacing: -0.5 }}>
                {fmt(s.today, s.unit)}
                <span style={{ fontSize: 11.5, color: T.faint, marginLeft: 7 }}>
                  from {fmt(s.base, s.unit)}
                </span>
              </div>
              <div style={{ marginTop: 9, paddingTop: 9, borderTop: `1px solid ${T.line}`,
                fontSize: 11.5, color: T.sub, lineHeight: 1.45 }}>
                <span style={{ color: T.watch, fontWeight: 600 }}>Likely cause · </span>
                {s.why}
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: T.indigo, fontWeight: 500 }}>
                Open {s.tab} →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════ SHARED PRIMITIVES ═══════════════ */
function Section({ title, note, children }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
        <h3 className="disp" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3>
        {note && <span style={{ fontSize: 11.5, color: T.faint }}>{note}</span>}
      </div>
      {children}
    </div>
  );
}
function Grid({ children, min = 175 }) {
  return <div style={{ display: "grid",
    gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 11 }}>{children}</div>;
}
function Stat({ label, value, unit, seed, i, spread = 0.1, dir }) {
  const base = value;
  const v = jitter(seed + i * 3.1, base, spread);
  const delta = +(((v - base) / base) * 100).toFixed(1);
  const col = delta > 0 ? T.up : delta < 0 ? T.down : T.sub;
  return (
    <div className="card" style={{ background: T.panel, border: `1px solid ${T.line}`,
      borderRadius: 10, padding: "13px 14px" }}>
      <div style={{ fontSize: 11.5, color: T.sub, lineHeight: 1.3, minHeight: 30 }}>{label}</div>
      <div className="num" style={{ fontSize: 21, marginTop: 4, letterSpacing: -0.5 }}>
        {fmt(v, unit)}
      </div>
      {delta !== 0 && (
        <div className="num" style={{ fontSize: 11, color: col, marginTop: 3 }}>
          {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}% <span style={{ color: T.faint }}>vs base</span>
        </div>
      )}
    </div>
  );
}
function chartData(seed, n, base, spread) {
  return Array.from({ length: n }, (_, i) => ({
    d: `D${i + 1}`, v: jitter(seed + i * 2.3, base, spread),
  }));
}

/* ═══════════════ TABS ═══════════════ */
function Overview({ seed }) {
  const dau = chartData(seed, 14, 84000, 0.08);
  return (
    <>
      <Section title="Daily glance" note="the six numbers I read first">
        <Grid>
          <Stat label="DAU" value={84200} seed={seed} i={1} />
          <Stat label="WAU" value={312000} seed={seed} i={2} spread={0.06} />
          <Stat label="MAU" value={910000} seed={seed} i={3} spread={0.04} />
          <Stat label="Subscribers (DoD)" value={41200} seed={seed} i={4} spread={0.05} />
          <Stat label="Subscribers / DAU" value={12.4} unit="%" seed={seed} i={5} />
          <Stat label="Revenue / day" value={486000} unit="₹" seed={seed} i={6} spread={0.12} />
          <Stat label="Avg session time" value={9.2} unit=" min" seed={seed} i={7} />
          <Stat label="Conversion (app)" value={3.1} unit="%" seed={seed} i={8} />
        </Grid>
      </Section>
      <Section title="DAU · trailing 14 days">
        <Panel>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={dau} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
              <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.indigo} stopOpacity={0.35} />
                <stop offset="100%" stopColor={T.indigo} stopOpacity={0} />
              </linearGradient></defs>
              <XAxis dataKey="d" tick={{ fill: T.faint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.faint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} />
              <Area type="monotone" dataKey="v" stroke={T.indigo} strokeWidth={2} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </Section>
    </>
  );
}

function Acquisition({ seed }) {
  const steps = [
    ["Profile for", 94], ["Gender", 91], ["Religion", 88], ["Caste", 84],
    ["Openness to other castes", 71], ["Mother tongue", 79], ["Name", 96],
    ["Height", 82], ["Age", 90], ["Diet", 74], ["Occupation", 77],
    ["Salary", 58], ["Profile photo", 63],
  ].map(([name, v], i) => ({ name, v: jitter(seed + i * 4, v, 0.06) }));
  return (
    <>
      <Section title="Entry funnel">
        <Grid>
          <Stat label="Download → landing" value={72} unit="%" seed={seed} i={1} />
          <Stat label="Download → login" value={54} unit="%" seed={seed} i={2} />
          <Stat label="Login success" value={91} unit="%" seed={seed} i={3} spread={0.04} />
          <Stat label="Download → onboarding done" value={61} unit="%" seed={seed} i={4} />
          <Stat label="Notification allow" value={47} unit="%" seed={seed} i={5} />
        </Grid>
      </Section>
      <Section title="Onboarding step completion" note="where profiles leak, field by field">
        <Panel>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={steps} layout="vertical" margin={{ left: 40, right: 20, top: 4, bottom: 4 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: T.faint, fontSize: 10 }}
                axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={128}
                tick={{ fill: T.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} cursor={{ fill: T.panel2 }} />
              <Bar dataKey="v" radius={[0, 4, 4, 0]}>
                {steps.map((s, i) => (
                  <Cell key={i} fill={s.v < 65 ? T.down : s.v < 80 ? T.watch : T.indigo} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 11.5, color: T.faint, marginTop: 8 }}>
            Red steps are the leak points. Salary and photo are the usual suspects, and both are optional-feeling fields worth reordering or softening.
          </div>
        </Panel>
      </Section>
    </>
  );
}

function Matchmaking({ seed, filters }) {
  const genderNote = filters.gender === "All"
    ? "gender is a default cut here, not an optional filter"
    : `viewing: ${filters.gender}`;
  const bars = [
    { name: "Sent", v: jitter(seed, 18400, 0.1) },
    { name: "Accepted", v: jitter(seed + 5, 7100, 0.12) },
    { name: "Msg sent", v: jitter(seed + 9, 12800, 0.1) },
    { name: "Msg replied", v: jitter(seed + 13, 4900, 0.16) },
  ];
  return (
    <>
      <Section title="Core value · matchmaking" note={genderNote}>
        <Grid>
          <Stat label="Interests sent / day" value={18400} seed={seed} i={1} />
          <Stat label="Interests accepted / day" value={7100} seed={seed} i={2} spread={0.12} />
          <Stat label="Messages sent / day" value={12800} seed={seed} i={3} />
          <Stat label="Messages replied / day" value={4900} seed={seed} i={4} spread={0.16} />
          <Stat label="Avg time to first reply" value={4.6} unit=" hr" seed={seed} i={5} />
          <Stat label="Dormant conversation" value={31} unit="%" seed={seed} i={6} />
          <Stat label="No conversation initiated" value={22} unit="%" seed={seed} i={7} />
          <Stat label="Avg texts / user" value={7.3} seed={seed} i={8} />
        </Grid>
      </Section>
      <Section title="The funnel that matters" note="sent does not equal landed">
        <Panel>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={bars} margin={{ top: 6, right: 10, bottom: 0, left: -14 }}>
              <XAxis dataKey="name" tick={{ fill: T.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.faint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} cursor={{ fill: T.panel2 }} />
              <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                {bars.map((b, i) => <Cell key={i} fill={i % 2 ? T.rose : T.indigo} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 11.5, color: T.faint, marginTop: 8 }}>
            The drop from sent to replied is the health of the marketplace. Read it split by gender, or a supply problem reads as a UX one.
          </div>
        </Panel>
      </Section>
    </>
  );
}

function Conversion({ seed }) {
  const mediums = [
    { name: "Message", v: jitter(seed, 44, 0.1) },
    { name: "WhatsApp", v: jitter(seed + 3, 28, 0.14) },
    { name: "Phone", v: jitter(seed + 6, 18, 0.16) },
    { name: "Contact now", v: jitter(seed + 9, 10, 0.2) },
  ];
  return (
    <>
      <Section title="Conversion actions" note="what a profile view turns into">
        <Grid>
          <Stat label="Profiles w/ CTA clicked / user" value={3.4} seed={seed} i={1} />
          <Stat label="Bio-data CTR (overall)" value={19} unit="%" seed={seed} i={2} />
          <Stat label="Bio-data download CTR" value={7.2} unit="%" seed={seed} i={3} />
          <Stat label="Shortlist icon click" value={26} unit="%" seed={seed} i={4} />
          <Stat label="Report CTR" value={0.8} unit="%" seed={seed} i={5} />
          <Stat label="Get-help CTR" value={2.1} unit="%" seed={seed} i={6} />
        </Grid>
      </Section>
      <Section title="Medium of conversion" note="how people choose to reach out">
        <Panel>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mediums} margin={{ top: 6, right: 10, bottom: 0, left: -18 }}>
              <XAxis dataKey="name" tick={{ fill: T.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis unit="%" tick={{ fill: T.faint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} cursor={{ fill: T.panel2 }} />
              <Bar dataKey="v" radius={[4, 4, 0, 0]} fill={T.rose} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </Section>
    </>
  );
}

function Monetisation({ seed }) {
  const funnel = [
    { name: "Banner CTR", v: jitter(seed, 8.4, 0.12) },
    { name: "Start trial", v: jitter(seed + 4, 5.1, 0.14) },
    { name: "Subscribed", v: jitter(seed + 8, 3.2, 0.2) },
  ];
  return (
    <>
      <Section title="Subscription funnel">
        <Grid>
          <Stat label="Banner click CTR" value={8.4} unit="%" seed={seed} i={1} />
          <Stat label="Start-trial CTR" value={5.1} unit="%" seed={seed} i={2} />
          <Stat label="Successful subscription" value={3.2} unit="%" seed={seed} i={3} spread={0.2} />
          <Stat label="Back-button click" value={41} unit="%" seed={seed} i={4} />
          <Stat label="Repeat / renewal rate" value={68} unit="%" seed={seed} i={5} />
          <Stat label="Avg session-time to subscribe" value={6.8} unit=" min" seed={seed} i={6} />
        </Grid>
      </Section>
      <Section title="Trigger source" note="which page the subscribe flow starts from">
        <Grid min={150}>
          <Stat label="From profile view" value={52} unit="%" seed={seed} i={7} />
          <Stat label="From messages" value={29} unit="%" seed={seed} i={8} />
          <Stat label="From chats" value={19} unit="%" seed={seed} i={9} />
        </Grid>
      </Section>
      <Section title="Where the funnel leaks">
        <Panel>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={funnel} margin={{ top: 6, right: 10, bottom: 0, left: -18 }}>
              <XAxis dataKey="name" tick={{ fill: T.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis unit="%" tick={{ fill: T.faint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} cursor={{ fill: T.panel2 }} />
              <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                {funnel.map((f, i) => <Cell key={i} fill={[T.indigo, T.indigo, T.rose][i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </Section>
    </>
  );
}

function Retention({ seed }) {
  const curve = [
    ["D1", 62], ["D7", 41], ["W1", 38], ["M1", 27], ["M2", 21], ["M3", 17],
  ].map(([d, v], i) => ({ d, v: jitter(seed + i * 3, v, 0.05) }));
  return (
    <>
      <Section title="Retention & churn" note="remember: a match leaving is good churn">
        <Grid>
          <Stat label="D1 retention" value={62} unit="%" seed={seed} i={1} spread={0.05} />
          <Stat label="D7 retention" value={41} unit="%" seed={seed} i={2} spread={0.05} />
          <Stat label="M1 retention" value={27} unit="%" seed={seed} i={3} spread={0.06} />
          <Stat label="M3 retention" value={17} unit="%" seed={seed} i={4} spread={0.07} />
          <Stat label="Uninstalls / day" value={2140} seed={seed} i={5} spread={0.14} />
        </Grid>
      </Section>
      <Section title="Retention curve">
        <Panel>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={curve} margin={{ top: 6, right: 10, bottom: 0, left: -18 }}>
              <XAxis dataKey="d" tick={{ fill: T.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis unit="%" tick={{ fill: T.faint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} />
              <Line type="monotone" dataKey="v" stroke={T.rose} strokeWidth={2.5} dot={{ r: 3, fill: T.rose }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </Section>
    </>
  );
}

function Technical({ seed }) {
  return (
    <>
      <Section title="Technical & stability" note="this layer quietly explains everything above">
        <Grid>
          <Stat label="Crash count / day" value={1280} seed={seed} i={1} spread={0.22} />
          <Stat label="Crash-free sessions" value={99.1} unit="%" seed={seed} i={2} spread={0.02} />
          <Stat label="App load (cold start)" value={2.4} unit=" s" seed={seed} i={3} />
          <Stat label="Screen load · profile" value={0.9} unit=" s" seed={seed} i={4} />
          <Stat label="API errors / day (4xx/5xx)" value={3400} seed={seed} i={5} spread={0.18} />
        </Grid>
      </Section>
      <Section title="Trust & safety" note="earliest warning in a high-stakes vertical">
        <Grid>
          <Stat label="Profiles verified / day (ID)" value={1820} seed={seed} i={6} spread={0.1} />
          <Stat label="Profiles reported / day" value={214} seed={seed} i={7} spread={0.2} />
        </Grid>
      </Section>
      <Section title="Unit economics">
        <Grid>
          <Stat label="LTV" value={1840} unit="₹" seed={seed} i={8} spread={0.06} />
          <Stat label="CAC" value={410} unit="₹" seed={seed} i={9} spread={0.08} />
        </Grid>
      </Section>
    </>
  );
}

/* ── panel + tooltip ── */
function Panel({ children }) {
  return <div style={{ background: T.panel, border: `1px solid ${T.line}`,
    borderRadius: 12, padding: 16 }}>{children}</div>;
}
const tipStyle = {
  background: T.panel2, border: `1px solid ${T.line}`, borderRadius: 8,
  fontSize: 12, color: T.ink, fontFamily: "'IBM Plex Mono', monospace",
};
