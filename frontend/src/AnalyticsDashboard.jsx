export default function AnalyticsDashboard({ findings = [] }) {
  // Safe fallback if findings is undefined
  const safeFindings = Array.isArray(findings) ? findings : [];
  
  const totalFindings = safeFindings.length;
  const highRiskCount = safeFindings.filter(f => f.risk_level?.toLowerCase() === 'high').length;
  const mediumRiskCount = safeFindings.filter(f => f.risk_level?.toLowerCase() === 'medium').length;
  const lowRiskCount = safeFindings.filter(f => f.risk_level?.toLowerCase() === 'low').length;

  const highPercent = totalFindings ? (highRiskCount / totalFindings) * 100 : 0;
  const mediumPercent = totalFindings ? (mediumRiskCount / totalFindings) * 100 : 0;
  const lowPercent = totalFindings ? (lowRiskCount / totalFindings) * 100 : 0;

  return (
    <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
          📊 Forensic Risk Heatmap & Analytics
        </h3>
        <span style={{ fontSize: '0.75rem', backgroundColor: '#1e293b', padding: '4px 10px', borderRadius: '12px', color: '#94a3b8', border: '1px solid #334155' }}>
          Live Telemetry
        </span>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '1rem', borderRadius: '6px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Total Audited</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{totalFindings}</p>
        </div>
        <div style={{ backgroundColor: 'rgba(127, 29, 29, 0.3)', border: '1px solid rgba(127, 29, 29, 0.5)', padding: '1rem', borderRadius: '6px' }}>
          <p style={{ color: '#fca5a5', fontSize: '0.75rem', textTransform: 'uppercase', margin: '0 0 4px 0' }}>High Risk</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fca5a5', margin: 0 }}>{highRiskCount}</p>
        </div>
        <div style={{ backgroundColor: 'rgba(120, 53, 15, 0.3)', border: '1px solid rgba(120, 53, 15, 0.5)', padding: '1rem', borderRadius: '6px' }}>
          <p style={{ color: '#fde047', fontSize: '0.75rem', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Medium Risk</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fde047', margin: 0 }}>{mediumRiskCount}</p>
        </div>
        <div style={{ backgroundColor: 'rgba(6, 78, 59, 0.3)', border: '1px solid rgba(6, 78, 59, 0.5)', padding: '1rem', borderRadius: '6px' }}>
          <p style={{ color: '#6ee7b7', fontSize: '0.75rem', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Low Risk</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6ee7b7', margin: 0 }}>{lowRiskCount}</p>
        </div>
      </div>

      {/* Visual Risk Distribution Heatmap Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
          <span>Risk Severity Distribution Heatmap</span>
          <span>{totalFindings > 0 ? `${totalFindings} Documents Analyzed` : 'Awaiting Data'}</span>
        </div>
        <div style={{ width: '100%', height: '16px', backgroundColor: '#1e293b', borderRadius: '8px', overflow: 'hidden', display: 'flex', border: '1px solid #334155' }}>
          <div style={{ width: `${highPercent}%`, backgroundColor: '#ef4444', transition: 'width 0.5s ease' }} title={`High Risk: ${highRiskCount}`} />
          <div style={{ width: `${mediumPercent}%`, backgroundColor: '#f59e0b', transition: 'width 0.5s ease' }} title={`Medium Risk: ${mediumRiskCount}`} />
          <div style={{ width: `${lowPercent}%`, backgroundColor: '#10b981', transition: 'width 0.5s ease' }} title={`Low Risk: ${lowRiskCount}`} />
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span> High Severity</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span> Medium Severity</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span> Low Severity</span>
        </div>
      </div>
    </div>
  );
}