import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function UploadDocument() {
  const [file, setFile] = useState(null);
  const [scores, setScores] = useState(null);   // per-category dict
  const [overall, setOverall] = useState(null); // overall number
  const [esg, setEsg] = useState(null);         // {E,S,G}
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("document", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || response.statusText);
      }

      const json = await response.json();

      setScores(json.scores || null);
      setOverall(
        typeof json.overal_score === "number" ? json.overal_score : json.overall
      );
      setEsg(json.esg || null);
      setFilename(json.filename || "");
      setError("");
    } catch (err) {
      console.error("Document upload failed:", err);
      setError(err.message);
      setScores(null);
      setOverall(null);
      setEsg(null);
      setFilename("");
    } finally {
      setFile(null);
    }
  };

  const ESG_COLORS = ["#2ca02c", "#ff7f0e", "#1f77b4"]; // E, S, G
  const esgData =
    esg && typeof esg === "object"
      ? [
          { name: "E", value: Number(esg.E ?? 0) },
          { name: "S", value: Number(esg.S ?? 0) },
          { name: "G", value: Number(esg.G ?? 0) },
        ]
      : null;

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2>Please upload a sustainability report</h2>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <br />
          <br />
          <button type="submit">Upload</button>
          <h4 style={{ marginTop: "1rem", color: "#666" }}>
            {filename ? `File: ${filename}` : ""}
          </h4>
        </div>
      </form>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {(scores || esg) && (
        <div
          style={{
            maxWidth: 1100,
            margin: "2rem auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Left: Overall + ESG Pie */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: "1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Overall & ESG</h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  minWidth: 160,
                  textAlign: "center",
                  padding: "0.75rem 1rem",
                  borderRadius: 10,
                  background: "#f7f7f7",
                }}
              >
                <div style={{ fontSize: 14, color: "#666" }}>Overall Score</div>
                <div style={{ fontSize: 36, fontWeight: 700 }}>
                  {typeof overall === "number" ? overall.toFixed(2) : "—"}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 280, height: 300 }}>
                {esgData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={esgData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                      >
                        {esgData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={ESG_COLORS[idx % ESG_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ color: "#888" }}>No ESG data available</div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Category Table */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: "1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Category Scores</h3>
            {scores ? (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "0.5rem",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}>
                      Category
                    </th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(scores).map(([cat, val]) => {
                    const num = Number(val);
                    return (
                      <tr key={cat}>
                        <td style={{ borderBottom: "1px solid #f0f0f0", padding: "8px" }}>
                          {cat}
                        </td>
                        <td style={{ borderBottom: "1px solid #f0f0f0", padding: "8px", textAlign: "right" }}>
                          {Number.isFinite(num) ? num.toFixed(2) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ color: "#888" }}>No category scores available</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
