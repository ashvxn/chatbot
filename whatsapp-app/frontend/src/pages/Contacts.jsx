import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.error(err);
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

  if (error) return <div className="card"><h2>⚠️ {error}</h2></div>;

  const callRequests = contacts.filter(c => c.tags && c.tags.includes("CALL_REQUESTED"));
  const regularContacts = contacts.filter(c => !c.tags || !c.tags.includes("CALL_REQUESTED"));

  return (
    <div>
      <div className="flex justify-between align-center" style={{ marginBottom: "30px" }}>
        <h1>Lead Management</h1>
        <Link to="/add-contact">
          <button className="btn-primary">+ Add New Lead</button>
        </Link>
      </div>

      {/* CALL REQUESTS PANEL */}
      {callRequests.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "#d32f2f", display: "flex", alignItems: "center", gap: "10px" }}>
            📞 Call Requests Needed
            <span className="badge" style={{ background: "#d32f2f", color: "white" }}>{callRequests.length}</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {callRequests.map(c => (
              <div key={c.id} className="card" style={{ borderLeft: "5px solid #d32f2f" }}>
                <button onClick={() => deleteContact(c.id)} style={{ float: "right", color: "#ff4d4f", background: "none" }}>Delete</button>
                <div style={{ fontWeight: "bold", fontSize: "18px" }}>{c.name}</div>
                <div style={{ color: "var(--primary-dark)", margin: "10px 0" }}>{c.phone}</div>
                <div className="badge badge-failed" style={{ background: "#ffebee", color: "#d32f2f" }}>FOLLOW UP ASAP</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REGULAR CONTACTS */}
      <h2>All Contacts</h2>
      {loading && contacts.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {regularContacts.map(c => (
            <div key={c.id} className="card">
              <button onClick={() => deleteContact(c.id)} style={{ float: "right", color: "#ff4d4f", background: "none", fontSize: "12px" }}>Delete</button>
              <div style={{ fontWeight: "bold", fontSize: "18px" }}>{c.name}</div>
              <div style={{ color: "var(--primary-dark)", margin: "5px 0" }}>{c.phone}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
                {c.tags && c.tags.split(",").map(tag => (
                  <span key={tag} className="badge" style={{ background: "#e9edef", color: "#3b4a54", fontSize: "10px" }}>
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}