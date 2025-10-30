import React, { useState, useRef } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function UploadDocument() {
  const [file, setFile] = useState(null);
  const [scores, setScores] = useState(null);
  const [overall, setOverall] = useState(null);
  const [esg, setEsg] = useState(null);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const reportRef = useRef(null);
  const API = "https://esg-app-1-7w6d.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("document", file);

    try {
      const response = await fetch(`${API}/upload`, { method: "POST", body: formData });
      if (!response.ok) throw new Error(await response.text() || response.statusText);
      const json = await response.json();

      setScores(json.scores || null);
      setOverall(typeof json.overal_score === "number" ? json.overal_score : json.overall);
      setEsg(json.esg || null);
      setFilename(json.filename || "");
      setDocId(json.doc_id ?? null);
      setError("");
    } catch (err) {
      console.error("Document upload failed:", err);
      setError(err.message);
      setScores(null); setOverall(null); setEsg(null); setFilename(""); setDocId(null);
    } finally {
      setFile(null);
    }
  };

  
  const downloadPNG = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const link = document.createElement("a");
    link.download = `ESG-${(filename || "report").replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const imgW = pageW - 60;
    const imgH = (canvas.height * imgW) / canvas.width;

    pdf.setFontSize(14);
    pdf.text(`ESG Report — ${filename || "report"}`, 30, 22);
    pdf.addImage(imgData, "PNG", 30, 30, imgW, imgH, undefined, "FAST");
    pdf.save(`ESG-${(filename || "report").replace(/\s+/g, "_")}.pdf`);
  };

  const ESG_COLORS = ["#2ca02c", "#ff7f0e", "#1f77b4"];

  const toNum = (x) => {
    const n = Number(x);
    return Number.isFinite(n) ? n : 0;
  };

  const esgData = (() => {
      if (!esg || typeof esg !== "object") return null;

      const raw = {
        E: toNum(esg.E),
        S: toNum(esg.S),
        G: toNum(esg.G),
      };
      const total = raw.E + raw.S + raw.G;
      if (total <= 0) return null;

      return [
        { name: "E", value: (raw.E / total) * 100, raw: raw.E },
        { name: "S", value: (raw.S / total) * 100, raw: raw.S },
        { name: "G", value: (raw.G / total) * 100, raw: raw.G },
      ];
    })();

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2>Please upload a sustainability report</h2>
          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <br /><br />
          <button type="submit">Upload</button>
          {filename ? <h4 style={{ marginTop: "1rem", color: "#666" }}>Report: {filename}</h4> : null}
        </div>
      </form>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {(scores || esg) && (
        <>
          <div style={{ maxWidth: 1100, margin: "0 auto 1rem", display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={downloadPNG}>Download PNG</button>
            <button onClick={downloadPDF}>Download PDF</button>
          </div>

          
          <div
            ref={reportRef}
            style={{
              maxWidth: 1100,
              margin: "0 auto 2rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              alignItems: "start",
              background: "#fff",
              padding: "1rem",
              borderRadius: 12,
            }}
          >
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ marginTop: 0 }}>ESG Rating</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                <div style={{ minWidth: 160, textAlign: "center", padding: "0.75rem 1rem", borderRadius: 10, background: "#f7f7f7" }}>
                  <div style={{ fontSize: 14, color: "#666" }}>ESG Rating</div>
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
                          label={({ name, value, payload }) =>
                              `${name}: ${value.toFixed(1)}%`
                              }
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

            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ marginTop: 0 }}>Category Scores</h3>
              {scores ? (
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0.5rem" }}>
                  <thead>
                    <tr>
                      <th style={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Category</th>
                      <th style={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(scores).map(([cat, val]) => {
                      const num = Number(val);
                      return (
                        <tr key={cat}>
                          <td style={{ borderBottom: "1px solid #f0f0f0", padding: "8px" }}>{cat}</td>
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
            <div
              style={{
                gridColumn: "1 / -1",
                background: "#fafafa",
                border: "1px solid #eee",
                borderRadius: 12,
                padding: "14px 16px",
                lineHeight: 1.5,
                color: "#333",
              }}
            >
              <strong>What does the ESG rating mean?</strong>
              <div style={{ marginTop: 6 }}>
                A <strong>{overall}</strong> ESG score indicates a good Sustainability performance. ESG rating score
                is between is between 60-69, which according to the ESG score Rating system is a <strong>Good</strong> rating. Companies that obtain
                 a good ESG rating follow most ESG best practices, and their work does little to harm the environment or society.
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
