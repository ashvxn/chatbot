import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
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
      <div style={{ padding: "32px 24px", fontSize: "20px", fontWeight: "bold", color: "var(--white)", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "20px" }}>
        Obsidyne Bot
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