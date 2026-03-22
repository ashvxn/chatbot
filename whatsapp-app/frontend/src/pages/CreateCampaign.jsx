import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateCampaign() {
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [template, setTemplate] = useState("");
  const [tag, setTag] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/templates")
      .then(res => setTemplates(res.data))
      .catch(err => console.error("Could not fetch templates", err));
      
    api.get("/contacts")
      .then(res => setContacts(res.data))
      .catch(err => console.error("Could not fetch contacts", err));
  }, []);

  // Extract unique tags from all contacts
  const getUniqueTags = () => {
    const allTags = new Set();
    contacts.forEach(c => {
      if (c.tags) {
        c.tags.split(",").forEach(t => allTags.add(t.trim()));
      }
    });
    return Array.from(allTags).sort();
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("template_name", template);
    formData.append("tag", tag);
    formData.append("message", message);
    
    if (imageFile) {
        formData.append("image", imageFile);
    } else {
        formData.append("image_url", imageUrl);
    }

    try {
      await api.post("/campaigns", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
      });
      navigate("/campaigns");
    } catch (err) {
      alert("Error creating campaign. Check console for details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h1>Launch Campaign (Obsidyne)</h1>
      <div className="card">
        <form onSubmit={submit}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Select Content Type</label>
          <select onChange={e => setTemplate(e.target.value)} required value={template}>
            <option value="">-- Choose template --</option>
            {templates.map(t => (
              <option key={t.name} value={t.name}>{t.label}</option>
            ))}
            <option value="CUSTOM_TEXT">Custom Text (Within 24hr Window)</option>
            <option value="CUSTOM_IMAGE">Custom Image (Within 24hr Window)</option>
          </select>

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Target Segment (Tag)</label>
          <select onChange={e => setTag(e.target.value)} value={tag}>
            <option value="">All Contacts</option>
            {getUniqueTags().map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {(template === "campaign_poster" || template === "CUSTOM_IMAGE") && (
            <>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Upload Poster (Image File)</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files[0])}
                required={!imageUrl}
                style={{ border: "1px dashed var(--border)", padding: "20px" }}
              />
              
              <div style={{ textAlign: "center", margin: "10px 0" }}>OR</div>

              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Image Link (URL)</label>
              <input
                placeholder="https://example.com/your-poster.jpg"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                disabled={imageFile}
              />
            </>
          )}

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            Message Content
          </label>
          <textarea
            placeholder="Type your campaign text here..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            style={{ height: "120px" }}
          />

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "10px" }} disabled={loading}>
            {loading ? "Launching..." : "Launch Campaign"}
          </button>
        </form>
      </div>
    </div>
  );
}