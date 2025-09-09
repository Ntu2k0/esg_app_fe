import React, {useState} from "react";

export default function UploadDocument() {
    const [file, setFile] = useState(null);
    const [scores, setScores] = useState(null);
    const [error, setError] = useState("");


    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!file) return alert("Please select a file first.");


        const formData = new FormData()
        formData.append("document", file);


        try{

            const response = await fetch("http://localhost:5000/upload" , {
                method: "POST",
                body: formData
            });
            //const jsonResponse = await response.json();


            if(!response.ok){
                const text  = await response.text();
                throw new Error(text || response.statusText)
            }

            const jsonResponse = await response.json();
            setScores(jsonResponse.scores)
            //setFile(jsonResponse.file)


        } catch (err) {
            console.error("Document upload failed:", err);
            setError(err.message)
            setScores(null)
            setFile(null)
        }

    };

     const chartData = scores
    ? {
        labels: Object.keys(scores).filter((k) => k !== "overall_weight"),
        datasets: [
          {
            label: "ESG Category Scores",
            data: Object.entries(scores)
              .filter(([k]) => k !== "overall_weight")
              .map(([, v]) => v),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#C9CBCF",
              "#8DD1E1",
              "#FFBB28",
            ],
          },
        ],
      }
    : null;



    return (
        <>
        
        <form onSubmit={handleSubmit}>
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <h2>Please upload a sustainability report</h2>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <br /><br />
                <button type="submit">Upload</button>
                {/* <h3>Or</h3>
                <button>View Report</button> */}
                <h3>Or</h3>
                <button>Download Report</button>
           </div>
        </form>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {scores && (
        <div style={{ maxWidth: 600, margin: "2rem auto" }}>
          <h3>Category Scores</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "2rem",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Category
                </th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scores).map(([cat, val]) => (
                <tr key={cat}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {cat}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {val.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

        
        
      )}

        </>
    );
}

