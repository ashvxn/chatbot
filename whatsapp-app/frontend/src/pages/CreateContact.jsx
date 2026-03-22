import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateContact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contacts", { name, phone, tags });
      navigate("/");
    } catch (err) {
      alert("Error adding contact. Make sure the backend is running and CORS is enabled.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1>Add New Contact</h1>
      <div className="card">
        <form onSubmit={submit}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Full Name</label>
          <input
            placeholder="e.g. John Doe"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Phone Number</label>
          <input
            placeholder="e.g. 919876543210 (with country code)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Tags (comma separated)</label>
          <input
            placeholder="e.g. customer, student, vip"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "10px" }} disabled={loading}>
            {loading ? "Adding..." : "Save Contact"}
          </button>
        </form>
      </div>
    </div>
  );
}