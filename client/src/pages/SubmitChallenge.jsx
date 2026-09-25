import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, HelpCircle, X, Plus } from 'lucide-react';

export default function SubmitChallenge() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('smart_city');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [location, setLocation] = useState('');
  const [impactArea, setImpactArea] = useState('');
  const [deadline, setDeadline] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [impactScope, setImpactScope] = useState('district');
  const [aiLoading, setAiLoading] = useState(false);

  // Phase 1 fields
  const [affectedPopulation, setAffectedPopulation] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [expectedOutcome, setExpectedOutcome] = useState('');

  // Skills Tags
  const [skills, setSkills] = useState(['IoT', 'Data Analytics', 'Web Platform']);
  const [skillInput, setSkillInput] = useState('');

  // Files
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const INDIAN_STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
    'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
    'Uttarakhand','West Bengal',
    'Andaman & Nicobar Islands','Chandigarh','Dadra & Nagar Haveli','Daman & Diu',
    'Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry'
  ];

  const categories = [
    { id: 'smart_city',         label: 'Smart City',          icon: '🏙️' },
    { id: 'environment',        label: 'Environment',          icon: '🌱' },
    { id: 'water',              label: 'Water & Sanitation',   icon: '💧' },
    { id: 'agriculture',        label: 'Agriculture',          icon: '🌾' },
    { id: 'healthcare',         label: 'Healthcare',           icon: '🏥' },
    { id: 'education',          label: 'Education',            icon: '🎓' },
    { id: 'waste_management',   label: 'Waste Mgmt',           icon: '🚮' },
    { id: 'energy',             label: 'Clean Energy',         icon: '🔋' },
    { id: 'public_safety',      label: 'Public Safety',        icon: '🚦' },
    { id: 'accessibility',      label: 'Accessibility',        icon: '♿' },
    { id: 'rural_livelihoods',  label: 'Rural Livelihoods',    icon: '🌻' },
    { id: 'urban_infrastructure',label: 'Urban Infra',         icon: '🏗️' },
    { id: 'public_administration',label:'Public Admin',        icon: '🏛️' },
    { id: 'social_welfare',     label: 'Social Welfare',       icon: '👴' },
    { id: 'digital_services',   label: 'Digital Services',     icon: '🌐' },
  ];

  const handleAiCategorize = async () => {
    if (!title && !description) return;
    setAiLoading(true);
    try {
      const res = await api.post('/ai/categorize', { title, description });
      if (res.success) {
        setCategory(res.data.suggestedCategory);
        toast.info(`AI suggests: ${res.data.suggestedCategory} (${res.data.confidence}% confidence)`);
      }
    } catch (_) {}
    setAiLoading(false);
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInput.trim().replace(',', '');
      if (val && !skills.includes(val)) {
        setSkills([...skills, val]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.info('Please log in to submit a challenge');
      navigate('/login?redirect=/submit-challenge');
      return;
    }

    if (title.length < 10) {
      toast.error('Title must be at least 10 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title, description, category, difficulty,
        location, impactArea, state, district, pincode, impactScope,
        deadline: deadline || null, requiredSkills: skills, tags: [category, difficulty],
        affectedPopulation, urgency, expectedOutcome
      };
      if (files.length > 0) {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => formData.append(k, typeof v === 'object' ? JSON.stringify(v) : v));
        for (let i = 0; i < files.length; i++) formData.append('attachments', files[i]);
        await api.postForm('/challenges', formData);
      } else {
        await api.post('/challenges', payload);
      }

      toast.success('Challenge submitted! You will receive a tracking code shortly. Check your Submitter Dashboard.');
      navigate('/dashboard/submitter');
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 880 }}>
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span className="badge badge-blue" style={{ marginBottom: 12 }}>Problem Intake Portal</span>
          <h1 style={{ fontSize: '2.4rem', marginBottom: 12 }}>Submit a Societal Challenge</h1>
          <p className="text-secondary" style={{ maxWidth: 640, margin: '0 auto' }}>
            Bring real bottlenecks from your community, municipality, or domain to university student engineering teams.
          </p>
        </div>

        {/* Scope Guidance Box */}
        <div className="card p-6" style={{ 
          marginBottom: 32, 
          background: 'rgba(59, 130, 246, 0.08)', 
          borderColor: 'rgba(59, 130, 246, 0.3)',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 16,
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '2rem' }}>💡</div>
          <div>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
              Guidelines for SocioSolve Challenges
            </h4>
            <p className="text-secondary" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
              Propose open-ended problems requiring technological innovation, sensor networks, data science, or engineering prototypes (e.g., <em>“Real-time groundwater salinity forecasting for coastal aquifers”</em>) rather than everyday single-point civic maintenance tickets.
            </p>
          </div>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="card p-8">
          {/* 1. Category Selection Grid */}
          <div className="form-group mb-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>1. Primary Domain / Category *</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAiCategorize} disabled={aiLoading}>
                {aiLoading ? '⏳ Detecting...' : '🤖 AI Auto-Detect'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginTop: 8 }}>
              {categories.map((cat) => (
                <div 
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: category === cat.id ? '1px solid var(--color-primary-500)' : '1px solid var(--border-color)',
                    background: category === cat.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{cat.icon}</div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600, color: category === cat.id ? 'var(--color-primary-400)' : 'var(--text-primary)' }}>
                    {cat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Challenge Title */}
          <div className="form-group mb-6">
            <label className="form-label" htmlFor="title">2. Challenge Title *</label>
            <input 
              id="title"
              type="text"
              className="form-input"
              placeholder="e.g. IoT-Enabled Early Warning Flood Sensor Network for Slum Clusters"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={10}
            />
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
              Clear summary of the technical/societal bottleneck (minimum 10 characters).
            </span>
          </div>

          {/* 3. Description & Scope */}
          <div className="form-group mb-6">
            <label className="form-label" htmlFor="desc">3. Detailed Problem Statement & Constraints *</label>
            <textarea 
              id="desc"
              className="form-textarea"
              rows={6}
              placeholder="Describe the context:
- What causes this problem?
- Who is most severely impacted?
- Why do existing solutions fail?
- What technological intervention is needed?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={30}
            />
          </div>

          {/* 4. Location Details */}
          <div style={{ marginBottom: 24 }}>
            <label className="form-label" style={{ marginBottom: 12 }}>4. Location Details</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="state">State / UT *</label>
                <select id="state" className="form-select" value={state} onChange={e => setState(e.target.value)} required>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="district">District</label>
                <input id="district" type="text" className="form-input" placeholder="e.g. Pune" value={district} onChange={e => setDistrict(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="pincode">Pincode</label>
                <input id="pincode" type="text" className="form-input" placeholder="e.g. 411001" maxLength={6} value={pincode} onChange={e => setPincode(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="scope">Impact Scope</label>
                <select id="scope" className="form-select" value={impactScope} onChange={e => setImpactScope(e.target.value)}>
                  <option value="district">District Level</option>
                  <option value="state">State Level</option>
                  <option value="national">National Level</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="loc">Specific Area / Locality (Optional)</label>
                <input id="loc" type="text" className="form-input" placeholder="e.g. Dharavi, Mumbai" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="imp">Beneficiaries / Community Impact</label>
                <input id="imp" type="text" className="form-input" placeholder="e.g. 15,000+ coastal residents" value={impactArea} onChange={e => setImpactArea(e.target.value)} />
              </div>
            </div>
          </div>

          {/* 4b. Phase 1 — Impact & Urgency */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="affected">Approximate Affected Population</label>
              <input
                id="affected"
                type="text"
                className="form-input"
                placeholder="e.g. 12,000 rural villagers"
                value={affectedPopulation}
                onChange={e => setAffectedPopulation(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="urgency">Urgency Level *</label>
              <select id="urgency" className="form-select" value={urgency} onChange={e => setUrgency(e.target.value)}>
                <option value="low">🟢 Low — Can wait months</option>
                <option value="medium">🟡 Medium — Within 3 months</option>
                <option value="high">🟠 High — Within 4–6 weeks</option>
                <option value="critical">🔴 Critical — Immediate intervention needed</option>
              </select>
            </div>
          </div>

          {/* 4c. Expected Outcome */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label" htmlFor="outcome">Expected Outcome / Success Criteria</label>
            <textarea
              id="outcome"
              className="form-textarea"
              rows={3}
              placeholder="What would a successful solution look like? e.g. Zero dry pump days, automated SMS alerts, 25L/day potable water per household"
              value={expectedOutcome}
              onChange={e => setExpectedOutcome(e.target.value)}
            />
          </div>

          {/* 5. Complexity & Required Skills */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 24 }}>
            <div className="form-group">
              <label className="form-label">Estimated Complexity</label>
              <select 
                className="form-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="beginner">Beginner (Web UI / Dashboards)</option>
                <option value="intermediate">Intermediate (IoT / APIs / Mobile)</option>
                <option value="advanced">Advanced (ML / Embedded / Distributed)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Key Skills / Domains (Press Enter to add)</label>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 6, 
                padding: '6px 10px', 
                background: 'rgba(8, 15, 38, 0.85)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)',
                minHeight: 44,
                alignItems: 'center'
              }}>
                {skills.map((skill, idx) => (
                  <span key={idx} className="skill-chip">
                    {skill}
                    <X size={12} style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => handleRemoveSkill(idx)} />
                  </span>
                ))}
                <input 
                  type="text"
                  placeholder="Type skill & press Enter..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', flex: 1, minWidth: 120, fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* 6. Deadline & Attachments */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="deadline">Submission Deadline (Optional)</label>
              <input 
                id="deadline"
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="attach">Supporting Documents (PDF/Images)</label>
              <input 
                id="attach"
                type="file"
                className="form-input"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={(e) => setFiles(Array.from(e.target.files))}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={() => navigate('/explore')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="btn btn-primary"
              style={{ padding: '12px 32px' }}
            >
              {submitting ? 'Submitting Challenge...' : '🚀 Submit Challenge for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
