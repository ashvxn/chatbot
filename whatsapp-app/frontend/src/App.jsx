import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Contacts from "./pages/Contacts";
import CreateContact from "./pages/CreateContact";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetail from "./pages/CampaignDetail";
import Analytics from "./pages/Analytics";

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || (path === "/campaigns" && location.pathname.startsWith("/campaigns/"));

  const navItemStyle = (path) => ({
    padding: "10px 20px",
    borderRadius: "20px",
    background: location.pathname === path ? "var(--primary)" : "transparent",
    color: location.pathname === path ? "var(--white)" : "var(--text-muted)",
    fontWeight: "600",
    transition: "all 0.3s ease",
  });

  return (
    <nav style={{ 
      background: "var(--white)", 
      padding: "15px 40px", 
      display: "flex", 
      gap: "20px", 
      alignItems: "center",
      boxShadow: "var(--shadow)",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary-dark)", marginRight: "40px" }}>
        Obsidyne Bot Admin
      </div>
      <Link to="/" style={navItemStyle("/")}>Contacts</Link>
      <Link to="/add-contact" style={navItemStyle("/add-contact")}>Add Contact</Link>
      <Link to="/campaigns" style={navItemStyle("/campaigns")}>Campaigns</Link>
      <Link to="/create-campaign" style={navItemStyle("/create-campaign")}>Create Campaign</Link>
      <Link to="/analytics" style={navItemStyle("/analytics")}>Analytics</Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "var(--bg-light)" }}>
        <Navbar />
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
      </div>
    </BrowserRouter>
  );
}