import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = () => {
    api.get("/campaigns")
      .then(res => {
        if (Array.isArray(res.data)) {
          setCampaigns(res.data);
          setError(null);
        } else {
          console.error("API returned non-array data:", res.data);
          setError("Invalid data received from server.");
        }
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setError("Unable to reach backend.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 5000);
    return () => clearInterval(interval);
  }, []);

  const deleteCampaign = async (e, id) => {
    e.preventDefault(); 
    if (window.confirm("Delete this campaign record?")) {
      try {
        await api.delete(`/campaigns/${id}`);
        fetchCampaigns();
      } catch (err) {
        alert("Error deleting campaign.");
      }
    }
  };

  const getStatusClass = (status) => {
    return `badge badge-${status || 'unknown'}`;
  };

  if (error) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <h2 style={{ color: "#ff4d4f" }}>⚠️ {error}</h2>
        <button className="btn-primary" onClick={fetchCampaigns}>Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between align-center" style={{ marginBottom: "30px" }}>
        <h1>Campaigns</h1>
        <Link to="/create-campaign">
          <button className="btn-primary">Start New Campaign</button>
        </Link>
      </div>

      {loading && campaigns.length === 0 ? (
        <p>Loading...</p>
      ) : campaigns.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p>No campaigns created yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {[...campaigns].sort((a,b) => b.id - a.id).map(c => (
            <div key={c.id} style={{ position: "relative" }}>
              <button 
                onClick={(e) => deleteCampaign(e, c.id)}
                style={{ position: "absolute", right: "10px", top: "10px", zIndex: 10, background: "none", color: "#ff4d4f", fontSize: "12px", padding: "5px" }}
              >
                Delete Record
              </button>
              <Link to={`/campaigns/${c.id}`} style={{ display: "block", textDecoration: "none" }}>
                <div className="card" style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "20px",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                >
                  <div style={{ display: "flex", gap: "20px", alignItems: "center", flex: 1 }}>
                    {c.payload?.image_url && (
                      <img src={c.payload.image_url} alt="" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }} />
                    )}
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "16px", color: "var(--text-main)" }}>{c.template_name}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>{new Date(c.scheduled_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: "120px", marginRight: "80px" }}>
                    <span className={getStatusClass(c.status)}>{(c.status || 'unknown').toUpperCase()}</span>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px", fontSize: "13px" }}>
                       <span>🚀 {c.stats?.sent}</span>
                       <span style={{ color: "var(--primary)" }}>👁️ {c.stats?.read}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}