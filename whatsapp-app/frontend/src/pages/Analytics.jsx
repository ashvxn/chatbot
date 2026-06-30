import { useEffect, useState } from "react";
import api from "../api";

// ── Helpers ────────────────────────────────────────────────────
const inr   = (v) => `₹${parseFloat(v || 0).toFixed(2)}`;
const pct   = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);
const fmt   = (n) => Number(n || 0).toLocaleString();

// ── Icons ──────────────────────────────────────────────────────
const Ic = {
  Wallet:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>,
  Send:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Eye:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Users:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Target:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Activity: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Bot:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M12 11V5"/><path d="M8 11V7"/><path d="M16 11V7"/><circle cx="12" cy="3" r="2"/><path d="M7 15h.01M17 15h.01"/></svg>,
  Phone:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Star:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Zap:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Refresh:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Tag:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Check:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Clock:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Msg:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
};

const CAT_COLORS = { marketing: "#128c7e", service: "#0ea5e9", utility: "#f59e0b", other: "#94a3b8" };

const STATUS_META = {
  completed:  { color: "#16a34a", label: "Completed"  },
  partial:    { color: "#ea580c", label: "Partial"    },
  failed:     { color: "#dc2626", label: "Failed"     },
  scheduled:  { color: "#1d4ed8", label: "Scheduled"  },
  processing: { color: "#d97706", label: "Processing" },
};

const TAG_COLORS = {
  LEAD:                { bg: "#f1f5f9", color: "#64748b" },
  QUALIFIED_LEAD:      { bg: "#dbeafe", color: "#1d4ed8" },
  CALL_REQUESTED:      { bg: "#fee2e2", color: "#b91c1c" },
  CALL_SCHEDULED:      { bg: "#dcfce7", color: "#15803d" },
  DEV_INTEREST:        { bg: "#ede9fe", color: "#6d28d9" },
  MARKETING_INTEREST:  { bg: "#ffedd5", color: "#c2410c" },
  AUTOMATION_INTEREST: { bg: "#d1fae5", color: "#065f46" },
  PORTFOLIO_INTEREST:  { bg: "#fef9c3", color: "#854d0e" },
};

// ── KPI Card ───────────────────────────────────────────────────
function KPICard({ icon, label, value, sub, color, bg, highlight }) {
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "18px 20px", borderLeft: highlight ? `3px solid ${color}` : undefined }}>
      <div style={{ background: bg, color, padding: "10px", borderRadius: "10px", flexShrink: 0, display: "flex" }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{label}</div>
        <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-main)", lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Section Title ──────────────────────────────────────────────
function SectionTitle({ icon, title, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
      <span style={{ color: "var(--primary)" }}>{icon}</span>
      <div>
        <div style={{ fontWeight: "700", fontSize: "15px" }}>{title}</div>
        {sub && <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Funnel Stage ───────────────────────────────────────────────
function FunnelStage({ label, value, pct: p, color, sub }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
          <span style={{ fontWeight: "600", fontSize: "13px" }}>{label}</span>
          {sub && <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: "700", fontSize: "14px" }}>{fmt(value)}</span>
          <span style={{ background: color + "22", color, fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "999px", minWidth: "38px", textAlign: "center" }}>{p}%</span>
        </div>
      </div>
      <div style={{ height: "7px", background: "var(--bg-main)", borderRadius: "6px", overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", background: color, borderRadius: "6px", transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

// ── Tag Distribution ───────────────────────────────────────────
function TagBar({ tag, count, max }) {
  const meta  = TAG_COLORS[tag] || { bg: "var(--bg-main)", color: "var(--text-muted)" };
  const width = max > 0 ? Math.max((count / max) * 100, 4) : 4;
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ background: meta.bg, color: meta.color, fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "999px" }}>{tag}</span>
        <span style={{ fontWeight: "700", fontSize: "13px" }}>{count}</span>
      </div>
      <div style={{ height: "5px", background: "var(--bg-main)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ width: `${width}%`, height: "100%", background: meta.color, borderRadius: "4px", transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

// ── Read Rate Mini Bar ─────────────────────────────────────────
function RateBar({ pct: p, color }) {
  const c = color || (p >= 50 ? "#128c7e" : p >= 25 ? "#f59e0b" : "#ef4444");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ flex: 1, height: "5px", background: "var(--bg-main)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", background: c, borderRadius: "3px" }} />
      </div>
      <span style={{ fontSize: "11px", fontWeight: "700", color: c, minWidth: "30px" }}>{p}%</span>
    </div>
  );
}

// ── Trend Chart (Campaign + Bot overlay) ───────────────────────
function TrendChart({ data, mode }) {
  if (!data || data.length === 0) return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>No data for this period</div>
  );

  const maxSent   = Math.max(...data.map(d => d.sent), 1);
  const maxChats  = Math.max(...data.map(d => d.unique_chats), 1);
  const showCamp  = mode === "campaign";

  return (
    <div>
      <div style={{ display: "flex", gap: "20px", marginBottom: "12px", flexWrap: "wrap" }}>
        {showCamp ? (
          <>
            <Legend color="rgba(14,165,233,0.3)"  label="Sent" />
            <Legend color="#128c7e"                label="Read" />
            <Legend color="#ef4444"                label="Failed" />
          </>
        ) : (
          <>
            <Legend color="#8b5cf6" label="Unique Chats" />
            <Legend color="rgba(139,92,246,0.3)" label="User Messages" />
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "150px", overflowX: "auto", paddingBottom: "32px" }}>
        {data.map((d, i) => {
          const label = d.date?.slice(5);
          if (showCamp) {
            const sentH   = maxSent > 0 ? (d.sent / maxSent) * 100   : 0;
            const readH   = maxSent > 0 ? (d.read / maxSent) * 100   : 0;
            const failH   = maxSent > 0 ? (d.failed / maxSent) * 100 : 0;
            return (
              <div key={i} style={{ flex: "1", minWidth: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", gap: "1px" }}>
                  <div title={`Sent: ${d.sent}`}   style={{ flex: 1, background: "rgba(14,165,233,0.25)", borderRadius: "3px 3px 0 0", height: `${sentH}%`, minHeight: d.sent > 0 ? "4px" : 0 }} />
                  <div title={`Read: ${d.read}`}   style={{ flex: 1, background: "#128c7e",              borderRadius: "3px 3px 0 0", height: `${readH}%`, minHeight: d.read > 0 ? "4px" : 0 }} />
                  <div title={`Failed: ${d.failed}`} style={{ flex: 1, background: "#ef444480",          borderRadius: "3px 3px 0 0", height: `${failH}%`, minHeight: d.failed > 0 ? "4px" : 0 }} />
                </div>
                <div style={{ fontSize: "8px", color: "var(--text-muted)", whiteSpace: "nowrap", transform: "rotate(-45deg)", transformOrigin: "top center", marginTop: "4px", width: "26px", textAlign: "center" }}>{label}</div>
              </div>
            );
          } else {
            const chatH = maxChats > 0 ? (d.unique_chats  / maxChats) * 100 : 0;
            const msgH  = maxChats > 0 ? (d.user_messages / maxChats) * 100 : 0;
            return (
              <div key={i} style={{ flex: "1", minWidth: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", gap: "1px" }}>
                  <div title={`Msgs: ${d.user_messages}`} style={{ flex: 1, background: "rgba(139,92,246,0.25)", borderRadius: "3px 3px 0 0", height: `${msgH}%`, minHeight: d.user_messages > 0 ? "4px" : 0 }} />
                  <div title={`Chats: ${d.unique_chats}`} style={{ flex: 1, background: "#8b5cf6",             borderRadius: "3px 3px 0 0", height: `${chatH}%`, minHeight: d.unique_chats > 0 ? "4px" : 0 }} />
                </div>
                <div style={{ fontSize: "8px", color: "var(--text-muted)", whiteSpace: "nowrap", transform: "rotate(-45deg)", transformOrigin: "top center", marginTop: "4px", width: "26px", textAlign: "center" }}>{label}</div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
      <div style={{ width: "12px", height: "10px", borderRadius: "2px", background: color }} />
      {label}
    </div>
  );
}

// ── Donut Chart ────────────────────────────────────────────────
function DonutChart({ segments, size = 140, thickness = 24 }) {
  const r = (size - thickness) / 2, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
  const total = segments.reduce((s, g) => s + g.value, 0);
  let cumulative = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      {total === 0
        ? <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={thickness} />
        : segments.map((seg, i) => {
            const dash = (seg.value / total) * circ;
            const offset = circ - (cumulative / total) * circ;
            cumulative += seg.value;
            return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={thickness} strokeDasharray={`${dash} ${circ}`} strokeDashoffset={offset} style={{ transition: "stroke-dasharray 0.8s ease" }} />;
          })
      }
    </svg>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function Analytics() {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange]           = useState(30);
  const [trendMode, setTrendMode]   = useState("campaign");

  const fetchData = (r = range, showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    api.get(`/analytics/overview?range=${r}`)
      .then(res => { setData(res.data); setLastUpdated(new Date()); })
      .catch(console.error)
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchData(range); const iv = setInterval(() => fetchData(range), 30000); return () => clearInterval(iv); }, [range]);

  const changeRange = (r) => { setRange(r); fetchData(r, true); };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "100px", color: "var(--text-muted)" }}>Loading analytics...</div>;
  if (!data)   return <div className="card" style={{ textAlign: "center", padding: "40px" }}>No data available.</div>;

  const { kpis, lead_kpis, conversation_kpis, call_pipeline, tag_distribution, campaign_status, breakdown, top_campaigns, daily_trend, funnel } = data;

  const statusTotal = Object.values(campaign_status).reduce((s, v) => s + v, 0);
  const donutSegs   = Object.entries(breakdown).map(([cat, v]) => ({ label: cat, value: v.spend, color: CAT_COLORS[cat] || "#94a3b8" }));
  const totalCatSpend = donutSegs.reduce((s, d) => s + d.value, 0);
  const maxTag = tag_distribution.length > 0 ? tag_distribution[0].count : 1;

  const callPending   = call_pipeline.pending   || 0;
  const callConfirmed = call_pipeline.confirmed  || 0;
  const callDone      = call_pipeline.done       || 0;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 style={{ marginBottom: "4px" }}>Analytics</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>Campaign performance, lead intelligence &amp; bot activity</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Range tabs */}
          <div style={{ display: "flex", background: "var(--bg-main)", borderRadius: "var(--radius)", padding: "4px", gap: "4px" }}>
            {[7, 30, 90].map(r => (
              <button key={r} onClick={() => changeRange(r)} style={{ padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", border: "none", cursor: "pointer", background: range === r ? "var(--primary)" : "transparent", color: range === r ? "white" : "var(--text-muted)" }}>
                {r}D
              </button>
            ))}
          </div>
          {lastUpdated && <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>}
          <button className="btn-outline" onClick={() => fetchData(range, true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", fontSize: "13px" }}>
            <span style={{ display: "flex", animation: refreshing ? "spin 1s linear infinite" : "none" }}><Ic.Refresh /></span> Refresh
          </button>
        </div>
      </div>

      {/* ── Campaign KPIs ── */}
      <div style={{ marginBottom: "8px" }}>
        <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "10px" }}>Campaign Performance</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "14px" }}>
          <KPICard icon={<Ic.Wallet />}   label="Total Spend"    value={inr(kpis.total_spend)}                 sub={`${inr(kpis.cost_per_sent)} / message`}      color="#128c7e" bg="rgba(18,140,126,0.1)" />
          <KPICard icon={<Ic.Activity />} label="Campaigns Run"  value={fmt(kpis.total_campaigns)}             sub="Completed + partial"                          color="#8b5cf6" bg="rgba(139,92,246,0.1)" />
          <KPICard icon={<Ic.Send />}     label="Messages Sent"  value={fmt(kpis.total_sent)}                  sub={`${fmt(kpis.total_delivered)} delivered`}     color="#0ea5e9" bg="rgba(14,165,233,0.1)" />
          <KPICard icon={<Ic.Eye />}      label="Messages Read"  value={fmt(kpis.total_read)}                  sub={`Read rate: ${kpis.read_rate}%`}              color="#128c7e" bg="rgba(18,140,126,0.1)" />
          <KPICard icon={<Ic.Target />}   label="Delivery Rate"  value={`${kpis.delivery_rate}%`}              sub={`${fmt(kpis.total_failed)} failed`}           color="#f59e0b" bg="rgba(245,158,11,0.1)"  highlight />
          <KPICard icon={<Ic.Wallet />}   label="Cost per Read"  value={inr(kpis.cost_per_read)}               sub="All-time average"                             color="#ec4899" bg="rgba(236,72,153,0.1)" />
        </div>
      </div>

      {/* ── Lead KPIs ── */}
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "10px" }}>Lead Intelligence</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px" }}>
          <KPICard icon={<Ic.Users />}  label="Total Contacts"    value={fmt(lead_kpis.total_contacts)}     sub={`${fmt(lead_kpis.new_in_range)} new in ${range}d`} color="#64748b" bg="rgba(100,116,139,0.1)" />
          <KPICard icon={<Ic.Target />} label="Qualified Leads"   value={fmt(lead_kpis.qualified_leads)}    sub={`${pct(lead_kpis.qualified_leads, lead_kpis.total_contacts)}% of contacts`} color="#1d4ed8" bg="rgba(29,78,216,0.1)" highlight />
          <KPICard icon={<Ic.Phone />}  label="Call Requests"     value={fmt(lead_kpis.call_req_contacts)}  sub={`${fmt(callPending)} pending`}                    color="#b91c1c" bg="rgba(185,28,28,0.1)" />
          <KPICard icon={<Ic.Wallet />} label="Cost / Qual. Lead" value={inr(lead_kpis.cost_per_lead)}      sub="Total spend ÷ qualified leads"                    color="#7c3aed" bg="rgba(124,58,237,0.1)" />
          <KPICard icon={<Ic.Zap />}    label="Dev Interest"      value={fmt(lead_kpis.dev_interest)}       sub="Software / app inquiries"                         color="#6d28d9" bg="rgba(109,40,217,0.1)" />
          <KPICard icon={<Ic.Activity />} label="Mktg + Auto"     value={fmt(lead_kpis.mkt_interest + lead_kpis.auto_interest)} sub="Marketing & automation interest" color="#c2410c" bg="rgba(194,65,12,0.1)" />
        </div>
      </div>

      {/* ── Funnel + Campaign Status + Call Pipeline ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        {/* Delivery Funnel */}
        <div className="card">
          <SectionTitle icon={<Ic.Zap />} title="Delivery Funnel" sub="All-time message flow" />
          <FunnelStage label="Sent"      value={funnel.sent}      pct={100}                                        color="#0ea5e9" />
          <FunnelStage label="Delivered" value={funnel.delivered} pct={pct(funnel.delivered, funnel.sent)}         color="#128c7e" />
          <FunnelStage label="Read"      value={funnel.read}      pct={pct(funnel.read, funnel.sent)}              color="#8b5cf6" />
          {funnel.failed > 0 && (
            <FunnelStage label="Failed"  value={funnel.failed}    pct={pct(funnel.failed, funnel.sent)}            color="#ef4444" sub="(errors)" />
          )}
          <div style={{ marginTop: "12px", padding: "8px 12px", background: "var(--bg-main)", borderRadius: "var(--radius)", fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Cost per read</span>
            <strong>{inr(kpis.cost_per_read)}</strong>
          </div>
        </div>

        {/* Campaign Status */}
        <div className="card">
          <SectionTitle icon={<Ic.Activity />} title="Campaign Status" />
          <div style={{ marginBottom: "16px" }}>
            {Object.entries(STATUS_META).map(([status, meta]) => {
              const count = campaign_status[status] || 0;
              const p     = statusTotal > 0 ? Math.round((count / statusTotal) * 100) : 0;
              return (
                <div key={status} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: "13px" }}>{meta.label}</span>
                  <span style={{ fontWeight: "700", fontSize: "14px", minWidth: "24px", textAlign: "right" }}>{count}</span>
                  <div style={{ width: "60px", height: "5px", background: "var(--bg-main)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${p}%`, height: "100%", background: meta.color, borderRadius: "3px" }} />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Spend donut */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0 0", borderTop: "1px solid var(--border)" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <DonutChart segments={donutSegs} size={80} thickness={16} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "800", textAlign: "center", lineHeight: 1.2 }}>
                {inr(totalCatSpend).replace("₹", "₹\n")}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {donutSegs.map((seg, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: seg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "11px", flex: 1, textTransform: "capitalize" }}>{seg.label}</span>
                  <span style={{ fontSize: "11px", fontWeight: "700" }}>{inr(seg.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call Pipeline */}
        <div className="card">
          <SectionTitle icon={<Ic.Phone />} title="Call Pipeline" sub="Scheduled call requests" />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Pending",   count: callPending,   icon: <Ic.Clock />,  color: "#f59e0b", bg: "#fef9c3" },
              { label: "Confirmed", count: callConfirmed, icon: <Ic.Zap />,    color: "#0ea5e9", bg: "#dbeafe" },
              { label: "Done",      count: callDone,      icon: <Ic.Check />,  color: "#16a34a", bg: "#dcfce7" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: item.bg, borderRadius: "var(--radius)" }}>
                <span style={{ color: item.color }}>{item.icon}</span>
                <span style={{ flex: 1, fontWeight: "600", fontSize: "13px", color: item.color }}>{item.label}</span>
                <span style={{ fontWeight: "800", fontSize: "22px", color: item.color }}>{item.count}</span>
              </div>
            ))}
          </div>
          {(callPending + callConfirmed + callDone) === 0 && (
            <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", marginTop: "12px" }}>No call requests yet</p>
          )}
          <div style={{ marginTop: "14px", padding: "8px 12px", background: "var(--bg-main)", borderRadius: "var(--radius)", fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Conversion rate</span>
            <strong>{pct(callDone, callPending + callConfirmed + callDone)}%</strong>
          </div>
        </div>
      </div>

      {/* ── Trend Chart ── */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <SectionTitle icon={<Ic.Activity />} title={`Activity — Last ${range} Days`} />
          <div style={{ display: "flex", background: "var(--bg-main)", borderRadius: "var(--radius)", padding: "3px", gap: "3px" }}>
            {[{ k: "campaign", label: "Campaign Volume" }, { k: "bot", label: "Bot Conversations" }].map(tab => (
              <button key={tab.k} onClick={() => setTrendMode(tab.k)} style={{ padding: "5px 12px", borderRadius: "5px", fontSize: "12px", fontWeight: "600", border: "none", cursor: "pointer", background: trendMode === tab.k ? "var(--primary)" : "transparent", color: trendMode === tab.k ? "white" : "var(--text-muted)" }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <TrendChart data={daily_trend} mode={trendMode} />
      </div>

      {/* ── Tag Distribution + Conversation Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px", marginBottom: "20px" }}>
        {/* Tag Distribution */}
        <div className="card">
          <SectionTitle icon={<Ic.Tag />} title="Tag Distribution" sub="Contacts per tag (can overlap)" />
          {tag_distribution.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No tags assigned yet</p>
          ) : (
            tag_distribution.slice(0, 10).map((t, i) => (
              <TagBar key={i} tag={t.tag} count={t.count} max={maxTag} />
            ))
          )}
        </div>

        {/* Conversation Stats */}
        <div className="card">
          <SectionTitle icon={<Ic.Bot />} title="Bot Conversations" sub={`Active chats in last ${range} days`} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            {[
              { label: "Unique Contacts", value: fmt(conversation_kpis.total_conversations), color: "#8b5cf6" },
              { label: `Active (${range}D)`,     value: fmt(conversation_kpis.active_in_range),    color: "#128c7e" },
              { label: "Bot Replies",     value: fmt(conversation_kpis.total_bot_messages),  color: "#0ea5e9" },
              { label: "User Messages",   value: fmt(conversation_kpis.total_user_messages), color: "#f59e0b" },
            ].map(item => (
              <div key={item.label} style={{ padding: "14px", background: "var(--bg-main)", borderRadius: "var(--radius)", textAlign: "center" }}>
                <div style={{ fontWeight: "800", fontSize: "20px", color: item.color }}>{item.value}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>{item.label}</div>
              </div>
            ))}
          </div>
          {conversation_kpis.total_conversations > 0 && (
            <div style={{ padding: "8px 12px", background: "var(--bg-main)", borderRadius: "var(--radius)", fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Avg msgs / conversation</span>
              <strong>{(conversation_kpis.total_user_messages / conversation_kpis.total_conversations).toFixed(1)}</strong>
            </div>
          )}
        </div>
      </div>

      {/* ── Top Campaigns Table ── */}
      <div className="card">
        <SectionTitle icon={<Ic.Send />} title="Top Campaigns by Reach" sub="★ = best read rate (min 3 sent)" />
        <div className="table-wrapper" style={{ maxHeight: "400px" }}>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Campaign</th>
                <th style={{ textAlign: "center" }}>Sent</th>
                <th style={{ textAlign: "center" }}>Deliv.</th>
                <th style={{ textAlign: "center" }}>Read</th>
                <th style={{ textAlign: "center" }}>Failed</th>
                <th style={{ minWidth: "100px" }}>Read Rate</th>
                <th style={{ minWidth: "100px" }}>Deliv. Rate</th>
                <th style={{ textAlign: "right" }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {top_campaigns.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>No completed campaigns yet</td></tr>
              ) : (
                top_campaigns.map(c => (
                  <tr key={c.id} style={{ background: c.is_best ? "rgba(18,140,126,0.04)" : undefined }}>
                    <td style={{ paddingRight: 0, width: "20px", color: "#f59e0b" }}>
                      {c.is_best ? <Ic.Star /> : null}
                    </td>
                    <td>
                      <div style={{ fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                        {c.name}
                        <span className="badge" style={{ background: CAT_COLORS[c.category] + "22", color: CAT_COLORS[c.category], fontSize: "9px", fontWeight: "700" }}>{c.category}</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        #{c.id} · {c.date ? new Date(c.date).toLocaleDateString() : "—"}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "700" }}>{fmt(c.sent)}</td>
                    <td style={{ textAlign: "center", fontWeight: "600", color: "#0ea5e9" }}>{fmt(c.delivered)}</td>
                    <td style={{ textAlign: "center", fontWeight: "600", color: "#128c7e" }}>{fmt(c.read)}</td>
                    <td style={{ textAlign: "center", fontWeight: "600", color: c.failed > 0 ? "#ef4444" : "var(--text-muted)" }}>{fmt(c.failed)}</td>
                    <td><RateBar pct={c.read_rate} /></td>
                    <td><RateBar pct={c.delivery_rate} color="#0ea5e9" /></td>
                    <td style={{ textAlign: "right", fontWeight: "700", fontSize: "13px" }}>{inr(c.cost)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
