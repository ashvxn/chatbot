import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const Icons = {
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
  ),
  Phone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  ),
  Alert: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
  )
};

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchContacts = () => {
    setLoading(true);
    api.get("/contacts")
      .then(res => {
        if (Array.isArray(res.data)) {
          setContacts(res.data);
          setError(null);
        } else {
          setError("Invalid data received.");
        }
      })
      .catch(err => {
        setError("Unable to reach backend.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const deleteContact = async (id) => {
    if (window.confirm("Are you sure?")) {
      await api.delete(`/contacts/${id}`);
      fetchContacts();
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const callRequests = filteredContacts.filter(c => c.tags && c.tags.includes("CALL_REQUESTED"));
  const regularContacts = filteredContacts.filter(c => !c.tags || !c.tags.includes("CALL_REQUESTED"));

  if (error) return <div className="card" style={{ textAlign: "center", padding: "40px" }}><h2 style={{ color: "var(--text-muted)" }}>⚠️ {error}</h2></div>;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: "32px" }}>
        <div>
          <h1>Lead Management</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Manage your contacts and follow up with interested leads.</p>
        </div>
        <Link to="/add-contact">
          <button className="btn-primary"><Icons.Plus /> Add New Lead</button>
        </Link>
      </div>

      <div className="card" style={{ padding: "16px" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", top: "10px", color: "var(--text-muted)" }}><Icons.Search /></span>
          <input 
            type="text" 
            placeholder="Search leads by name or phone..." 
            style={{ paddingLeft: "40px", marginBottom: 0 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* CALL REQUESTS PANEL */}
      {callRequests.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "#b91c1c", display: "flex", alignItems: "center", gap: "10px", fontSize: "18px", marginBottom: "16px" }}>
            <Icons.Alert /> Urgent Call Requests
            <span className="badge" style={{ background: "#fee2e2", color: "#b91c1c" }}>{callRequests.length}</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {callRequests.map(c => (
              <div key={c.id} className="card" style={{ borderLeft: "4px solid #ef4444", padding: "20px" }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>{c.name}</div>
                    <div style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
                      <Icons.Phone /> {c.phone}
                    </div>
                  </div>
                  <button className="btn-danger" style={{ padding: "6px" }} onClick={() => deleteContact(c.id)}>
                    <Icons.Trash />
                  </button>
                </div>
                <div style={{ marginTop: "16px" }}>
                  <span className="badge badge-failed" style={{ fontSize: "10px" }}>FOLLOW UP ASAP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REGULAR CONTACTS */}
      <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>All Leads</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Tags</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && contacts.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Loading leads...</td></tr>
            ) : regularContacts.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No leads found.</td></tr>
            ) : (
              regularContacts.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: "600" }}>{c.name}</td>
                  <td style={{ color: "var(--text-muted)" }}>{c.phone}</td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {c.tags && c.tags.split(",").map(tag => (
                        <span key={tag} className="badge" style={{ background: "var(--bg-main)", color: "var(--text-muted)", fontSize: "10px" }}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn-danger" style={{ padding: "6px" }} onClick={() => deleteContact(c.id)}>
                      <Icons.Trash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}