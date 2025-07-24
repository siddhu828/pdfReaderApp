import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function App() {
  const [message, setMessage] = useState("Drag & drop a PDF file or click to upload");
  const [outlineData, setOutlineData] = useState(null);  // ⬅️ new
  const [extractedText, setExtractedText] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [personaResult, setPersonaResult] = useState(null); // ⬅️ NEW state

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/extract-outline`, {
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        setOutlineData(data); // ⬅️ full object with title+outline
        setExtractedText(JSON.stringify(data.outline, null , 2)); // optionally keep for analyze
        setMessage("✅ File processed successfully!");
        console.log("OUTLINE DATA:", data.outline);  // debug only
      })
      .catch(err => {
        setMessage("❌ Error uploading file.");
        console.error(err);
      });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': [] }
  });

  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed #999',
          borderRadius: '10px',
          padding: '40px',
          backgroundColor: isDragActive ? '#f0f8ff' : '#fff',
          cursor: 'pointer',
          maxWidth: '400px',
          margin: '0 auto',
          color: '#333',
        }}
      >
        <input {...getInputProps()} />
        <p style={{ margin: 0 }}>
          {isDragActive
            ? "Drop the PDF file here..."
            : "📄 Drag & drop a PDF file here, or click to upload"}
        </p>
      </div>

      <p style={{ marginTop: '20px', color: '#007bff' }}>{message}</p>

      {outlineData && (
        <div style={{
          marginTop: '30px',
          textAlign: 'left',
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '10px',
          backgroundColor: '#f9f9f9',
          maxWidth: '800px',
          margin: '30px auto',
          color: '#222'
        }}>
          <h3>📄 Document Outline</h3>
          <h4>Title: {outlineData.title}</h4>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #bbb", textAlign: "left" }}>Level</th>
                <th style={{ borderBottom: "1px solid #bbb", textAlign: "left" }}>Text</th>
                <th style={{ borderBottom: "1px solid #bbb", textAlign: "left" }}>Page</th>
              </tr>
            </thead>
            <tbody>
              {outlineData.outline.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.level}</td>
                  <td>{item.text}</td>
                  <td>{item.page}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Download Outline JSON button */}
      <button
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px'
        }}
        onClick={() => {
          if (!outlineData) return;
          const blob = new Blob([JSON.stringify(outlineData, null, 2)], { type: 'application/json' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = "document_outline.json";
          link.click();
        }}
        disabled={!outlineData}
      >⬇️ Download JSON</button>

      <h3>🧠 Persona-Driven Extract (Round 1B)</h3>

      <input type="text" placeholder="Enter Persona" id="personaInput"
        style={{ padding: '10px', margin: '5px' }} />
      <input type="text" placeholder="Enter Job to be Done" id="jobInput"
        style={{ padding: '10px', margin: '5px' }} />
      <input type="file" id="multiPdfInput" multiple accept="application/pdf"
        style={{ display: 'block', margin: '10px auto' }} />

      <button
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '5px'
        }}
        onClick={() => {
          const input = document.getElementById("multiPdfInput");
          const persona = document.getElementById("personaInput").value;
          const job = document.getElementById("jobInput").value;
          const files = input.files;

          if (!files.length || !persona || !job) {
            alert("Please fill all fields and upload at least one PDF.");
            return;
          }

          const formData = new FormData();
          formData.append("persona", persona);
          formData.append("job", job);
          for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
          }

          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/persona-extract`, {
            method: "POST",
            body: formData
          })
            .then(res => res.json())
            .then(data => {
              console.log("1B RESULT:", data);
              setPersonaResult(data); // Save for download button
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = "persona_extract_output.json";
              link.click();
            })
            .catch(err => {
              console.error("Error:", err);
              alert("Something went wrong.");
            });
        }}
      >
        🚀 Run Persona Extract
      </button>

      {/* Download Persona JSON button */}
      {personaResult && (
        <button
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#17a2b8',
            color: '#fff',
            border: 'none',
            borderRadius: '5px'
          }}
          onClick={() => {
            const blob = new Blob([JSON.stringify(personaResult, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = "persona_extract_output.json";
            link.click();
          }}
        >
          ⬇️ Download Persona JSON
        </button>
      )}
    </div>
  );
}

export default App;