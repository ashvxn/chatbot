import { useEffect, useState } from "react";
import api from "../api";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics/overview")
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading Analytics...</p>;
  if (!data) return <p>No data available.</p>;

  // Progress bar helper
  const ProgressBar = ({ value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div style={{ width: "100%", height: "8px", background: "#eee", borderRadius: "4px", marginTop: "5px" }}>
        <div style={{ width: `${percentage}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 0.5s ease" }}></div>
      </div>
    );
  };

  return (
    <div>
      <h1>Financial Analytics</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Total Estimated Spend</div>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--primary-dark)" }}>${data.total_spend}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Cost Per Seen Message</div>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--secondary)" }}>${data.performance.cost_per_read}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Conversion Efficiency</div>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>
            {((data.performance.total_read / data.performance.total_sent) * 100 || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "30px" }}>
        <div className="card">
          <h3>Spend by Category</h3>
          <div style={{ marginTop: "25px" }}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Marketing (Templates)</span>
                <span style={{ fontWeight: "bold" }}>${data.breakdown.marketing}</span>
              </div>
              <ProgressBar value={data.breakdown.marketing} total={data.total_spend} color="var(--primary)" />
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Service (User-Initiated)</span>
                <span style={{ fontWeight: "bold" }}>${data.breakdown.service}</span>
              </div>
              <ProgressBar value={data.breakdown.service} total={data.total_spend} color="var(--secondary)" />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Utility (Updates)</span>
                <span style={{ fontWeight: "bold" }}>${data.breakdown.utility}</span>
              </div>
              <ProgressBar value={data.breakdown.utility} total={data.total_spend} color="#667781" />
            </div>

            {data.breakdown.other > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Other / Legacy</span>
                  <span style={{ fontWeight: "bold" }}>${data.breakdown.other}</span>
                </div>
                <ProgressBar value={data.breakdown.other} total={data.total_spend} color="#ddd" />
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Recent Activity Spend</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee", fontSize: "13px", color: "#666" }}>
                <th style={{ padding: "10px 0" }}>Campaign ID</th>
                <th style={{ textAlign: "right" }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                  <td style={{ padding: "12px 0" }}>
                    <div style={{ fontWeight: "600" }}>#{c.id}</div>
                    <div style={{ fontSize: "11px", color: "#999" }}>{c.name}</div>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "600", color: c.cost > 0 ? "var(--primary-dark)" : "#999" }}>
                    ${c.cost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}