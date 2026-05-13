import { useEffect, useState } from "react";
import api from "../api";

const Icons = {
  Wallet: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
  ),
  TrendingUp: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
  ),
  Percent: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="17.5" cy="17.5" r="2.5"></circle><circle cx="6.5" cy="6.5" r="2.5"></circle></svg>
  )
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics/overview")
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}><p>Loading Analytics...</p></div>;
  if (!data) return <div className="card" style={{ textAlign: "center", padding: "40px" }}><p>No data available.</p></div>;

  const ProgressBar = ({ value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div style={{ width: "100%", height: "8px", background: "var(--bg-main)", borderRadius: "4px", marginTop: "8px" }}>
        <div style={{ width: `${percentage}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}></div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1>Financial Analytics</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Monitor your WhatsApp business spending and performance metrics.</p>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ background: "rgba(18, 140, 126, 0.1)", color: "var(--primary)", padding: "12px", borderRadius: "12px" }}><Icons.Wallet /></div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.025em" }}>Total Estimated Spend</div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-main)" }}>${data.total_spend}</div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ background: "rgba(14, 165, 233, 0.1)", color: "var(--secondary)", padding: "12px", borderRadius: "12px" }}><Icons.TrendingUp /></div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.025em" }}>Cost Per Seen</div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-main)" }}>${data.performance.cost_per_read}</div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ background: "rgba(100, 116, 139, 0.1)", color: "var(--text-muted)", padding: "12px", borderRadius: "12px" }}><Icons.Percent /></div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.025em" }}>Conversion Rate</div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-main)" }}>
              {((data.performance.total_read / data.performance.total_sent) * 100 || 0).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "32px" }}>
        <div className="card">
          <h3 style={{ fontSize: "18px", marginBottom: "24px" }}>Spend by Category</h3>
          <div className="flex-col" style={{ gap: "24px" }}>
            <div>
              <div className="flex justify-between" style={{ marginBottom: "4px" }}>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Marketing (Templates)</span>
                <span style={{ fontWeight: "700" }}>${data.breakdown.marketing}</span>
              </div>
              <ProgressBar value={data.breakdown.marketing} total={data.total_spend} color="var(--primary)" />
            </div>
            
            <div>
              <div className="flex justify-between" style={{ marginBottom: "4px" }}>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Service (User-Initiated)</span>
                <span style={{ fontWeight: "700" }}>${data.breakdown.service}</span>
              </div>
              <ProgressBar value={data.breakdown.service} total={data.total_spend} color="var(--secondary)" />
            </div>

            <div>
              <div className="flex justify-between" style={{ marginBottom: "4px" }}>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Utility (Updates)</span>
                <span style={{ fontWeight: "700" }}>${data.breakdown.utility}</span>
              </div>
              <ProgressBar value={data.breakdown.utility} total={data.total_spend} color="var(--text-muted)" />
            </div>

            {data.breakdown.other > 0 && (
              <div>
                <div className="flex justify-between" style={{ marginBottom: "4px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>Other / Legacy</span>
                  <span style={{ fontWeight: "700" }}>${data.breakdown.other}</span>
                </div>
                <ProgressBar value={data.breakdown.other} total={data.total_spend} color="#e2e8f0" />
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Recent Activity Spend</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th style={{ textAlign: "right" }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: "600" }}>Campaign #{c.id}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{c.name}</div>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "700", color: c.cost > 0 ? "var(--primary)" : "var(--text-muted)" }}>
                      ${c.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}