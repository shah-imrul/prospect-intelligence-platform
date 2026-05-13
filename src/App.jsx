import React, { useState } from 'react';

const App = () => {
  const [criteria, setCriteria] = useState({
    industry: 'Software & AI',
    company_size: 'Series B-D (100-500 employees)',
    role: 'Customer Success Manager',
    location: 'US, Australia, Remote',
    keywords: 'AI, SaaS, enterprise customer success',
    account_value: '$100K-$5M ACV'
  });
  
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setCriteria({ ...criteria, [field]: value });
  };

  const generateProspects = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);
    
    try {
      const prompt = `You are a sales prospecting expert. Based on these criteria, generate 8-12 highly qualified prospects.

CRITERIA:
- Industry: ${criteria.industry}
- Company Size: ${criteria.company_size}
- Target Role: ${criteria.role}
- Location: ${criteria.location}
- Key Keywords: ${criteria.keywords}
- Typical Account Value: ${criteria.account_value}

For EACH prospect, provide:
1. Company name
2. Website/headquarters
3. Why they fit (2-3 sentences)
4. Key decision-maker title/profile
5. Growth signals (why they'd need your services now)
6. Personalized outreach angle (1-2 sentences)

Format as a JSON array with objects containing: company_name, website, fit_reason, decision_maker, growth_signals, outreach_angle

Respond ONLY with valid JSON, no preamble.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const responseText = data.content[0].text;
      
      try {
        const parsedProspects = JSON.parse(responseText);
        setProspects(Array.isArray(parsedProspects) ? parsedProspects : []);
        setSummary({
          total: parsedProspects.length,
          industry: criteria.industry,
          role: criteria.role
        });
      } catch (e) {
        setError('Failed to parse prospects. Please try again.');
      }
    } catch (err) {
      setError('Failed to generate prospects. Please try again.');
    }
    
    setLoading(false);
  };

  const downloadCSV = () => {
    if (prospects.length === 0) return;
    
    const headers = ['Company', 'Website', 'Fit Reason', 'Decision Maker', 'Growth Signals', 'Outreach Angle'];
    const rows = prospects.map(p => [
      p.company_name,
      p.website,
      p.fit_reason,
      p.decision_maker,
      p.growth_signals,
      p.outreach_angle
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prospects.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', margin: '0 0 0.5rem', color: '#1a1a1a' }}>
          Prospect Intelligence Platform
        </h1>
        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          AI-powered research to identify and qualify your ideal prospects
        </p>
      </div>

      <div style={{ 
        background: '#f5f5f5', 
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 1.25rem', color: '#1a1a1a' }}>
          Research Criteria
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '6px' }}>
              Industry / Market
            </label>
            <input
              type="text"
              value={criteria.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              placeholder="e.g., Software & AI"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '6px' }}>
              Company Size
            </label>
            <input
              type="text"
              value={criteria.company_size}
              onChange={(e) => handleInputChange('company_size', e.target.value)}
              placeholder="e.g., Series B-D"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '6px' }}>
              Target Role
            </label>
            <input
              type="text"
              value={criteria.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              placeholder="e.g., Customer Success Manager"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '6px' }}>
              Location
            </label>
            <input
              type="text"
              value={criteria.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., US, Australia, Remote"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '6px' }}>
            Keywords / Pain Points
          </label>
          <input
            type="text"
            value={criteria.keywords}
            onChange={(e) => handleInputChange('keywords', e.target.value)}
            placeholder="e.g., AI, SaaS, enterprise customer success"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', marginBottom: '12px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '6px' }}>
            Typical Account Value (ACV)
          </label>
          <input
            type="text"
            value={criteria.account_value}
            onChange={(e) => handleInputChange('account_value', e.target.value)}
            placeholder="e.g., $100K-$5M"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', marginBottom: '16px' }}
          />
        </div>

        <button
          onClick={generateProspects}
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Researching...' : 'Generate Prospects'}
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '6px',
          padding: '12px 16px',
          marginBottom: '2rem',
          color: '#c33',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '2rem' }}>
          <div style={{
            background: '#f5f5f5',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            padding: '1rem'
          }}>
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 6px' }}>Prospects found</p>
            <p style={{ fontSize: '22px', fontWeight: '600', margin: 0, color: '#1a1a1a' }}>{summary.total}</p>
          </div>
          <div style={{
            background: '#f5f5f5',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            padding: '1rem'
          }}>
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 6px' }}>Industry focus</p>
            <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#1a1a1a' }}>{summary.industry}</p>
          </div>
          <div style={{
            background: '#f5f5f5',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            padding: '1rem'
          }}>
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 6px' }}>Target role</p>
            <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#1a1a1a' }}>{summary.role}</p>
          </div>
        </div>
      )}

      {prospects.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1a1a1a' }}>
              Qualified Prospects
            </h2>
            <button
              onClick={downloadCSV}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '500',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '6px',
                color: '#1a1a1a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ⬇️ Export CSV
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {prospects.map((prospect, idx) => (
              <div
                key={idx}
                style={{
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px', color: '#1a1a1a' }}>
                      {prospect.company_name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                      {prospect.website}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    background: '#dbeafe',
                    color: '#1e40af',
                    padding: '4px 10px',
                    borderRadius: '4px'
                  }}>
                    Qualified
                  </span>
                </div>

                <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                  <p style={{ color: '#333', margin: '0 0 8px' }}>
                    <strong>Why they fit:</strong> {prospect.fit_reason}
                  </p>
                  <p style={{ color: '#333', margin: '0 0 8px' }}>
                    <strong>Decision maker:</strong> {prospect.decision_maker}
                  </p>
                  <p style={{ color: '#333', margin: '0 0 8px' }}>
                    <strong>Growth signals:</strong> {prospect.growth_signals}
                  </p>
                  <p style={{ color: '#333', margin: 0 }}>
                    <strong>Outreach angle:</strong> {prospect.outreach_angle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && prospects.length === 0 && !summary && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: '#666',
          fontSize: '14px'
        }}>
          <p style={{ margin: 0 }}>
            Fill in your prospecting criteria and click "Generate Prospects" to start researching qualified leads.
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
