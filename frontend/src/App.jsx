import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AnalyticsDashboard from './AnalyticsDashboard';

function App() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseName, setCaseName] = useState('');
  const [description, setDescription] = useState('');
  const [findings, setFindings] = useState([]);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/cases/');
      setCases(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/cases/', {
        case_name: caseName,
        description: description,
      });
      setCases([...cases, res.data]);
      setSelectedCase(res.data);
      setCaseName('');
      setDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedCase) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`http://127.0.0.1:8000/cases/${selectedCase.id}/upload-evidence/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const taskId = res.data.task_id;
      alert(`File uploaded! Background audit queued (Task ID: ${taskId}). Polling for results...`);

      const interval = setInterval(async () => {
        try {
          const taskRes = await axios.get(`http://127.0.0.1:8000/tasks/${taskId}`);
          const data = taskRes.data;

          if (data.status === 'SUCCESS' || data.status === 'completed') {
            clearInterval(interval);
            
            const auditResult = data.result;
            
            const newFinding = {
              title: `Audit Report: ${file.name}`,
              risk_level: "High", 
              description: typeof auditResult === 'object' ? auditResult.analysis : auditResult,
              confidence_score: "0.95"
            };

            setFindings(prev => [newFinding, ...prev]);
            alert("✨ Background AI Audit Complete! Findings loaded.");
          } else if (data.status === 'FAILURE') {
            clearInterval(interval);
            alert("Task failed during background execution. Check Celery logs.");
          }
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
        }
      }, 3000);

    } catch (err) {
      console.error(err);
      alert("Error uploading file. Check backend console.");
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Top Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🛡️</span> Autonomous Forensic Audit Platform
        </h1>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', color: '#16a34a', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          ● System Online
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Create Case & Case List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Create New Audit Case</h2>
            <form onSubmit={handleCreateCase}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: '#475569', fontWeight: '500' }}>Case Name</label>
                <input 
                  type="text" 
                  value={caseName} 
                  onChange={(e) => setCaseName(e.target.value)} 
                  placeholder="e.g., Q3 Financial Fraud Audit" 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box', outline: 'none' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: '#475569', fontWeight: '500' }}>Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Case objectives and scope..." 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', height: '60px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#ffffff', padding: '0.65rem', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>
                Create Case
              </button>
            </form>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Active Cases</h2>
            {cases.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No cases found. Create one above!</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '350px', overflowY: 'auto' }}>
                {cases.map((c) => (
                  <li 
                    key={c.id} 
                    onClick={() => setSelectedCase(c)}
                    style={{ 
                      padding: '0.8rem', 
                      marginBottom: '0.5rem', 
                      borderRadius: '6px', 
                      backgroundColor: selectedCase?.id === c.id ? '#eff6ff' : '#f8fafc', 
                      cursor: 'pointer',
                      border: selectedCase?.id === c.id ? '1px solid #3b82f6' : '1px solid #e2e8f0'
                    }}
                  >
                    <strong style={{ display: 'block', wordBreak: 'break-word', color: '#0f172a' }}>{c.case_name}</strong>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0', wordBreak: 'break-word' }}>{c.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* Right Column: Case Workspace */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', minHeight: '400px' }}>
          {selectedCase ? (
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.3rem', color: '#0f172a' }}>📁 {selectedCase.case_name}</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{selectedCase.description}</p>
              
              {/* Evidence Upload Section */}
              <div style={{ marginBottom: '1.5rem', padding: '1.2rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#0f172a' }}>Upload Evidence Document</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.8rem' }}>Upload a PDF contract, CSV financial record, or log text file for Gemini AI forensic auditing.</p>
                <input 
                  type="file" 
                  onChange={handleFileUpload}
                  style={{ display: 'block', width: '100%', color: '#475569', fontSize: '0.85rem', padding: '0.5rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                />
              </div>

              {/* Analytics Dashboard Component */}
              <AnalyticsDashboard findings={findings} />

              {/* Export JSON Report Bar */}
              {findings.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem' }}>
                  <button
                    onClick={() => {
                      const reportData = {
                        case: selectedCase,
                        exported_at: new Date().toISOString(),
                        total_findings: findings.length,
                        findings: findings
                      };
                      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${selectedCase.case_name.replace(/\s+/g, '_')}_audit_report.json`;
                      link.click();
                    }}
                    style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                  >
                    📥 Export JSON Report
                  </button>
                </div>
              )}

              <hr style={{ borderColor: '#e2e8f0', marginBottom: '1.5rem' }} />
              
              {/* Findings Section */}
              <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: '#0f172a' }}>Audit Findings</h3>
              {findings.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No findings yet. Choose a document above to trigger Gemini AI analysis.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {findings.map((f, index) => (
                    <div key={index} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{f.title}</strong>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold',
                          backgroundColor: f.risk_level === 'High' ? '#fee2e2' : '#fef3c7',
                          color: f.risk_level === 'High' ? '#991b1b' : '#92400e',
                          border: f.risk_level === 'High' ? '1px solid #fca5a5' : '1px solid #fde047'
                        }}>
                          {f.risk_level} Risk
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.5rem 0' }}>{f.description}</p>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Confidence Score: {f.confidence_score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#64748b', textAlign: 'center' }}>
              <p>Select or create a case on the left to start uploading evidence and reviewing audit findings.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;