import { useEffect, useState } from "react";
import api from "../api";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDetails = () => {
    api.get(`/campaigns/${id}`)
      .then(res => setCampaign(res.data))
      .catch(err => {
        console.error(err);
        navigate("/campaigns");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(fetchDetails, 5000); 
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !campaign) return <p>Loading campaign details...</p>;
  if (!campaign) return null;

  const recipients = campaign.recipients || [];
  const payload = campaign.payload || {};
  const stats = {
    sent: recipients.length,
    delivered: recipients.filter(r => r.status === 'delivered' || r.status === 'read').length,
    read: recipients.filter(r => r.status === 'read').length
  };

  const isTemplate = !["CUSTOM_TEXT", "CUSTOM_IMAGE"].includes(campaign.template_name);

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/campaigns" style={{ color: "var(--primary)", fontWeight: "bold" }}>← Back to Campaigns</Link>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
          <div>
            <h1 style={{ marginBottom: "5px" }}>{isTemplate ? "Meta Template Campaign" : "Custom Direct Campaign"}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Campaign ID: #{campaign.id} • {campaign.template_name}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className={`badge badge-${campaign.status || 'unknown'}`} style={{ padding: "8px 16px", fontSize: "14px" }}>
                {(campaign.status || 'SCHEDULED').toUpperCase()}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "40px" }}>
          <div>
            <h3 style={{ borderBottom: "1px solid var(--border)", paddingBottom: "10px", marginBottom: "20px" }}>Campaign Preview</h3>
            
            <div style={{ 
                background: "#e5ddd5", 
                padding: "20px", 
                borderRadius: "15px", 
                maxWidth: "400px",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)",
                position: "relative"
            }}>
                <div style={{ 
                    background: "white", 
                    padding: "8px", 
                    borderRadius: "8px", 
                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    maxWidth: "100%"
                }}>
                    {payload.image_url ? (
                        <img 
                            src={payload.image_url} 
                            alt="Campaign Poster" 
                            style={{ width: "100%", borderRadius: "5px", marginBottom: "8px", display: "block", background: "#f0f0f0", minHeight: "150px" }} 
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                    ) : null}
                    <div style={{ display: "none", padding: "40px 20px", background: "#eee", borderRadius: "5px", textAlign: "center", marginBottom: "8px" }}>
                        <div style={{ fontSize: "30px" }}>📷</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>Poster Link: {payload.image_url}</div>
                        <div style={{ fontSize: "11px", color: "red", marginTop: "10px" }}>Image failed to load (Check tunnel visibility)</div>
                    </div>
                    
                    <div style={{ padding: "5px 8px", fontSize: "14px", whiteSpace: "pre-wrap", color: "#111" }}>
                        {isTemplate && (
                            <div style={{ color: "var(--primary)", fontWeight: "bold", fontSize: "11px", marginBottom: "5px" }}>
                                [META TEMPLATE: {campaign.template_name}]
                            </div>
                        )}
                        {payload.message || "(No message text provided)"}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: "30px" }}>
                <h3 style={{ borderBottom: "1px solid var(--border)", paddingBottom: "10px", marginBottom: "15px" }}>Campaign Stats</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                    <div className="card" style={{ textAlign: "center", padding: "15px", background: "var(--bg-light)" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.sent}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Sent</div>
                    </div>
                    <div className="card" style={{ textAlign: "center", padding: "15px", background: "var(--bg-light)" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--secondary)" }}>{stats.delivered}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Delivered</div>
                    </div>
                    <div className="card" style={{ textAlign: "center", padding: "15px", background: "var(--bg-light)" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)" }}>{stats.read}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Read (Seen)</div>
                    </div>
                </div>
            </div>
          </div>

          <div>
            <h3 style={{ borderBottom: "1px solid var(--border)", paddingBottom: "10px", marginBottom: "20px" }}>Recipients List</h3>
            <div style={{ maxHeight: "600px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 1 }}>
                  <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-muted)", fontSize: "13px" }}>
                    <th style={{ padding: "12px" }}>Contact</th>
                    <th style={{ padding: "12px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)", fontSize: "14px" }}>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "600" }}>{r.contact_name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{r.phone}</div>
                      </td>
                      <td style={{ padding: "12px" }}>
                         <span className={`badge badge-${r.status}`} style={{ fontSize: "10px", padding: "4px 8px" }}>
                           {r.status.toUpperCase()}
                         </span>
                         {r.status === 'read' && <span style={{ marginLeft: "5px" }}>✅✅</span>}
                      </td>
                    </tr>
                  ))}
                  {recipients.length === 0 && (
                    <tr><td colSpan="2" style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>Waiting for campaign to start...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}