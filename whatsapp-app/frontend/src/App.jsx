import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import api from "./api";
import Contacts from "./pages/Contacts";
import CreateContact from "./pages/CreateContact";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetail from "./pages/CampaignDetail";
import Analytics from "./pages/Analytics";

const Icons = {
  Contacts: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  ),
  AddContact: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
  ),
  Campaigns: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
  ),
  CreateCampaign: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
  ),
  Analytics: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
  )
};

const QUALITY_CONFIG = {
  GREEN:   { color: "#22c55e", label: "High",    dot: "●" },
  YELLOW:  { color: "#f59e0b", label: "Medium",  dot: "●" },
  RED:     { color: "#ef4444", label: "Low",     dot: "●" },
  UNKNOWN: { color: "#64748b", label: "Unknown", dot: "○" },
};

function PhoneStatusWidget() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      api.get("/analytics/phone-status")
        .then(res => setStatus(res.data))
        .catch(() => setStatus(null))
        .finally(() => setLoading(false));
    };
    load();
    const iv = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  if (loading) return (
    <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
      Checking status…
    </div>
  );
  if (!status || status.error) return null;

  const q = QUALITY_CONFIG[status.quality] || QUALITY_CONFIG.UNKNOWN;

  return (
    <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "auto" }}>
      <div style={{ fontSize: "10px", fontWeight: "600", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
        WA Number Status
      </div>
      {status.phone && (
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginBottom: "6px", fontFamily: "monospace" }}>
          {status.phone}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <span style={{ color: q.color, fontSize: "14px", lineHeight: 1 }}>{q.dot}</span>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: "500" }}>
          Quality: <span style={{ color: q.color }}>{q.label}</span>
        </span>
      </div>
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
        Limit: <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: "500" }}>{status.tier_label}</span>
      </div>
    </div>
  );
}

function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || (path === "/campaigns" && location.pathname.startsWith("/campaigns/"));

  const navItemStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px",
    borderRadius: "var(--radius)",
    background: isActive(path) ? "var(--sidebar-active)" : "transparent",
    color: isActive(path) ? "var(--white)" : "var(--text-sidebar)",
    fontWeight: "500",
    transition: "all 0.2s ease",
    marginBottom: "4px",
    fontSize: "14px"
  });

  return (
    <div className="sidebar">
      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/image.png"
            alt="Obsidyne"
            style={{
              width: "36px",
              height: "36px",
              objectFit: "contain",
              filter: "brightness(0) invert(1)",
              flexShrink: 0
            }}
          />
          <div>
            <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--white)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
              Obsidyne
            </div>
            <div style={{ fontSize: "11px", fontWeight: "500", color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Automations
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: "0 12px" }}>
        <Link to="/" style={navItemStyle("/")}>
          <Icons.Contacts /> Contacts
        </Link>
        <Link to="/add-contact" style={navItemStyle("/add-contact")}>
          <Icons.AddContact /> Add Contact
        </Link>
        <Link to="/campaigns" style={navItemStyle("/campaigns")}>
          <Icons.Campaigns /> Campaigns
        </Link>
        <Link to="/create-campaign" style={navItemStyle("/create-campaign")}>
          <Icons.CreateCampaign /> New Campaign
        </Link>
        <Link to="/analytics" style={navItemStyle("/analytics")}>
          <Icons.Analytics /> Analytics
        </Link>
      </div>
      <PhoneStatusWidget />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout-wrapper">
        <Sidebar />
        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<Contacts />} />
              <Route path="/add-contact" element={<CreateContact />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              <Route path="/create-campaign" element={<CreateCampaign />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}