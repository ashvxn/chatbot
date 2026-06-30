import { useEffect, useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";

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
  ),
  Campaign: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
  ),
  ChevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  ),
  List: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
  ),
  Clock: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  )
};

const TAG_COLORS = {
  LEAD:               { bg: "#f1f5f9", color: "#64748b" },
  QUALIFIED_LEAD:     { bg: "#dbeafe", color: "#1d4ed8" },
  CALL_REQUESTED:     { bg: "#fee2e2", color: "#b91c1c" },
  CALL_SCHEDULED:     { bg: "#dcfce7", color: "#15803d" },
  DEV_INTEREST:       { bg: "#ede9fe", color: "#6d28d9" },
  MARKETING_INTEREST: { bg: "#ffedd5", color: "#c2410c" },
  AUTOMATION_INTEREST:{ bg: "#d1fae5", color: "#065f46" },
  PORTFOLIO_INTEREST: { bg: "#fef9c3", color: "#854d0e" },
};

function TagBadge({ tag }) {
  const style = TAG_COLORS[tag] || { bg: "var(--bg-main)", color: "var(--text-muted)" };
  return (
    <span className="badge" style={{ background: style.bg, color: style.color, fontSize: "10px", fontWeight: "700" }}>
      {tag}
    </span>
  );
}

const CALL_STATUS_STYLE = {
  pending:   { color: "#b45309", bg: "#fef9c3", icon: <Icons.Clock /> },
  confirmed: { color: "#0369a1", bg: "#dbeafe", icon: <Icons.Clock /> },
  done:      { color: "#15803d", bg: "#dcfce7", icon: <Icons.Check /> },
};

function CallDetails({ cr, contactName }) {
  if (!cr) return null;
  const s = CALL_STATUS_STYLE[cr.status] || CALL_STATUS_STYLE.pending;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
      <span style={{ background: s.bg, color: s.color, fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "999px", display: "flex", alignItems: "center", gap: "3px" }}>
        {s.icon} {cr.status?.toUpperCase()}
      </span>
      {cr.preferred_time && (
        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px" }}>
          <Icons.Clock /> {cr.preferred_time}
        </span>
      )}
      {cr.caller_name && cr.caller_name !== contactName && (
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>· as {cr.caller_name}</span>
      )}
    </div>
  );
}

function ContactRow({ c, onDelete }) {
  const hasCallTag = c.tags && (c.tags.includes("CALL_REQUESTED") || c.tags.includes("CALL_SCHEDULED"));
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "600", fontSize: "14px" }}>{c.name || "Unknown"}</div>
        <div style={{ color: "var(--text-muted)", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
          <Icons.Phone /> {c.phone}
        </div>
        {hasCallTag && c.call_request && <CallDetails cr={c.call_request} contactName={c.name} />}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", flex: 1, justifyContent: "flex-end", marginRight: "12px" }}>
        {c.tags && c.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
      <button className="btn-danger" style={{ padding: "6px" }} onClick={() => onDelete(c.id)}>
        <Icons.Trash />
      </button>
    </div>
  );
}

function TagGroup({ tag, contacts, onDelete, navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const style = TAG_COLORS[tag] || { bg: "var(--bg-main)", color: "var(--text-muted)" };

  return (
    <div className="card" style={{ marginBottom: "20px", padding: "0", overflow: "hidden" }}>
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer", background: style.bg, borderBottom: collapsed ? "none" : "1px solid var(--border)" }}
        onClick={() => setCollapsed(c => !c)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: collapsed ? "var(--text-muted)" : style.color }}>
            {collapsed ? <Icons.ChevronRight /> : <Icons.ChevronDown />}
          </span>
          <span style={{ fontWeight: "700", fontSize: "14px", color: style.color }}>{tag}</span>
          <span className="badge" style={{ background: "rgba(0,0,0,0.08)", color: style.color, fontSize: "11px" }}>
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          className="btn-primary"
          style={{ padding: "6px 14px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
          onClick={e => { e.stopPropagation(); navigate(`/create-campaign?tag=${encodeURIComponent(tag)}`); }}
        >
          <Icons.Campaign /> Start Campaign
        </button>
      </div>
      {!collapsed && (
        <div style={{ padding: "0 20px" }}>
          {contacts.map(c => (
            <ContactRow key={c.id} c={c} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grouped"); // "grouped" | "flat"
  const navigate = useNavigate();

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
      .catch(() => setError("Unable to reach backend."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchContacts(); }, []);

  const deleteContact = async (id) => {
    if (window.confirm("Remove this contact?")) {
      await api.delete(`/contacts/${id}`);
      fetchContacts();
    }
  };

  const filteredContacts = contacts.filter(c =>
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const callRequests = filteredContacts.filter(c => c.tags && (c.tags.includes("CALL_REQUESTED") || c.tags.includes("CALL_SCHEDULED")));

  // Build tag → contacts map (a contact can appear in multiple groups)
  const tagGroups = {};
  filteredContacts.forEach(c => {
    if (!c.tags) return;
    c.tags.split(",").forEach(t => {
      const tag = t.trim();
      if (!tag) return;
      if (!tagGroups[tag]) tagGroups[tag] = [];
      tagGroups[tag].push(c);
    });
  });

  // Priority order for tag sections
  const TAG_ORDER = ["QUALIFIED_LEAD", "CALL_REQUESTED", "CALL_SCHEDULED", "DEV_INTEREST", "MARKETING_INTEREST", "AUTOMATION_INTEREST", "PORTFOLIO_INTEREST", "LEAD"];
  const sortedTags = Object.keys(tagGroups).sort((a, b) => {
    const ai = TAG_ORDER.indexOf(a);
    const bi = TAG_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const untagged = filteredContacts.filter(c => !c.tags || !c.tags.trim());

  if (error) return (
    <div className="card" style={{ textAlign: "center", padding: "40px" }}>
      <h2 style={{ color: "var(--text-muted)" }}>⚠️ {error}</h2>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: "32px" }}>
        <div>
          <h1>Lead Management</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            {contacts.length} total contacts · {contacts.filter(c => c.tags && c.tags.includes("QUALIFIED_LEAD")).length} qualified leads
          </p>
        </div>
        <Link to="/add-contact">
          <button className="btn-primary"><Icons.Plus /> Add New Lead</button>
        </Link>
      </div>

      {/* Search + View Toggle */}
      <div className="card" style={{ padding: "16px", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: "12px", top: "10px", color: "var(--text-muted)" }}><Icons.Search /></span>
            <input
              type="text"
              placeholder="Search by name or phone..."
              style={{ paddingLeft: "40px", marginBottom: 0 }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", background: "var(--bg-main)", borderRadius: "var(--radius)", padding: "4px", gap: "4px", flexShrink: 0 }}>
            <button
              onClick={() => setViewMode("grouped")}
              style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", background: viewMode === "grouped" ? "var(--primary)" : "transparent", color: viewMode === "grouped" ? "white" : "var(--text-muted)" }}
            >
              <Icons.Users /> By Tag
            </button>
            <button
              onClick={() => setViewMode("flat")}
              style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", background: viewMode === "flat" ? "var(--primary)" : "transparent", color: viewMode === "flat" ? "white" : "var(--text-muted)" }}
            >
              <Icons.List /> All Leads
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Call Requests */}
      {callRequests.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#b91c1c", display: "flex", alignItems: "center", gap: "10px", fontSize: "16px", marginBottom: "12px" }}>
            <Icons.Alert /> Urgent Call Requests
            <span className="badge" style={{ background: "#fee2e2", color: "#b91c1c" }}>{callRequests.length}</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {callRequests.map(c => {
              const cr = c.call_request;
              const isScheduled = c.tags && c.tags.includes("CALL_SCHEDULED");
              return (
                <div key={c.id} className="card" style={{ borderLeft: `4px solid ${isScheduled ? "#16a34a" : "#ef4444"}`, padding: "16px" }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>{c.name || "Unknown"}</div>
                      <div style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
                        <Icons.Phone /> {c.phone}
                      </div>
                    </div>
                    <button className="btn-danger" style={{ padding: "6px" }} onClick={() => deleteContact(c.id)}>
                      <Icons.Trash />
                    </button>
                  </div>
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {cr?.preferred_time && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#374151", background: "#f9fafb", padding: "5px 9px", borderRadius: "6px" }}>
                        <Icons.Clock /> <strong>Preferred time:</strong> {cr.preferred_time}
                      </div>
                    )}
                    {cr?.caller_name && (
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Name given: <strong>{cr.caller_name}</strong>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                      {isScheduled
                        ? <span className="badge" style={{ background: "#dcfce7", color: "#15803d", fontSize: "10px" }}>SCHEDULED</span>
                        : <span className="badge badge-failed" style={{ fontSize: "10px" }}>FOLLOW UP ASAP</span>
                      }
                      {cr?.status && (
                        <span className="badge" style={{ background: "#f1f5f9", color: "#64748b", fontSize: "10px" }}>
                          {cr.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && contacts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>Loading contacts...</div>
      ) : viewMode === "grouped" ? (
        /* GROUPED VIEW */
        <div>
          {sortedTags.length === 0 && untagged.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>No contacts found.</div>
          )}
          {sortedTags.map(tag => (
            <TagGroup key={tag} tag={tag} contacts={tagGroups[tag]} onDelete={deleteContact} navigate={navigate} />
          ))}
          {untagged.length > 0 && (
            <div className="card" style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontWeight: "700", color: "var(--text-muted)", fontSize: "14px" }}>Untagged · {untagged.length}</span>
              </div>
              {untagged.map(c => <ContactRow key={c.id} c={c} onDelete={deleteContact} />)}
            </div>
          )}
        </div>
      ) : (
        /* FLAT TABLE VIEW */
        <div>
          <h2 style={{ fontSize: "16px", marginBottom: "16px" }}>All Leads ({filteredContacts.length})</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Tags</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No leads found.</td></tr>
                ) : (
                  filteredContacts.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: "600" }}>{c.name || "Unknown"}</td>
                      <td style={{ color: "var(--text-muted)" }}>{c.phone}</td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {c.tags && c.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                            <TagBadge key={tag} tag={tag} />
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
      )}
    </div>
  );
}
