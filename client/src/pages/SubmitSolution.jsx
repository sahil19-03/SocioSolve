import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Lightbulb, Code2, Link as LinkIcon, Video, Upload, X,
  ShieldCheck, GraduationCap, Building2, CheckCircle2, Clock,
  ArrowRight, AlertCircle, Sparkles, MapPin, Users, FileText,
  ExternalLink, Layers, DollarSign, Calendar, ChevronRight
} from 'lucide-react';

const SUGGESTED_TECH = [
  'IoT Sensors', 'ESP32 / Arduino', 'LoRaWAN', 'React', 'Node.js',
  'Python', 'Machine Learning', 'Solar MPPT', 'Embedded C', 'PostgreSQL'
];

export default function SubmitSolution() {
  const [searchParams] = useSearchParams();
  const initialChallengeId = searchParams.get('challengeId') || '';
  const initialTeamId = searchParams.get('teamId') || '';
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const toast = useToast();

  const [challenges, setChallenges] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState(initialChallengeId);
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId);
  const [targetChallenge, setTargetChallenge] = useState(null);

  // Proposal fields
  const [title, setTitle] = useState('');
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState('');
  const [technicalArchitecture, setTechnicalArchitecture] = useState('');
  const [impactMetrics, setImpactMetrics] = useState('');
  const [budgetEstimate, setBudgetEstimate] = useState('₹1,25,000');
  const [timelineWeeks, setTimelineWeeks] = useState(8);
  const [riskMitigation, setRiskMitigation] = useState('');
  const [techStack, setTechStack] = useState(['IoT', 'Embedded C', 'React', 'Node.js']);
  const [techInput, setTechInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [chalRes, teamsRes] = await Promise.all([
          api.get('/challenges?limit=50'),
          isLoggedIn ? api.get('/teams/my').catch(() => ({ success: true, data: [] })) : Promise.resolve({ success: true, data: [] })
        ]);

        if (chalRes.success && chalRes.data) {
          setChallenges(chalRes.data);
        }
        if (teamsRes.success && teamsRes.data) {
          setUserTeams(teamsRes.data);
          if (!initialTeamId && teamsRes.data.length > 0) {
            setSelectedTeamId(teamsRes.data[0].id);
            if (!initialChallengeId && teamsRes.data[0].challengeId) {
              setSelectedChallengeId(teamsRes.data[0].challengeId);
            }
          }
        }
      } catch (err) {
        console.warn('Init data load error:', err);
      }
    };
    fetchInitData();
  }, [isLoggedIn, initialChallengeId, initialTeamId]);

  useEffect(() => {
    if (selectedChallengeId) {
      const loadBrief = async () => {
        try {
          const res = await api.get(`/challenges/${selectedChallengeId}`);
          if (res.success) {
            setTargetChallenge(res.data);
            if (!title) {
              setTitle(`Solution: ${res.data.title}`);
            }
          }
        } catch (e) {
          console.warn('Challenge brief error:', e);
        }
      };
      loadBrief();
    } else {
      setTargetChallenge(null);
    }
  }, [selectedChallengeId]);

  const handleAddTech = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = techInput.trim().replace(',', '');
      if (val && !techStack.includes(val)) {
        setTechStack([...techStack, val]);
      }
      setTechInput('');
    }
  };

  const addSuggestedTech = (tech) => {
    if (!techStack.includes(tech)) {
      setTechStack([...techStack, tech]);
    }
  };

  const handleRemoveTech = (index) => {
    setTechStack(techStack.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.info('Please log in as a student to submit a proposal');
      navigate(`/login?redirect=/submit-solution?challengeId=${selectedChallengeId}`);
      return;
    }

    if (!selectedChallengeId) {
      toast.error('Please select the target societal challenge');
      return;
    }

    if (!title.trim()) {
      toast.error('Please provide a title for your proposal');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('challengeId', selectedChallengeId);
      if (selectedTeamId) formData.append('teamId', selectedTeamId);
      formData.append('rootCauseAnalysis', rootCauseAnalysis);
      formData.append('technicalArchitecture', technicalArchitecture);
      formData.append('impactMetrics', impactMetrics);
      formData.append('budgetEstimate', budgetEstimate);
      formData.append('timelineWeeks', timelineWeeks);
      formData.append('riskMitigation', riskMitigation);
      formData.append('techStack', JSON.stringify(techStack));
      formData.append('githubUrl', githubUrl);
      formData.append('demoUrl', demoUrl);
      formData.append('videoUrl', videoUrl);

      for (let i = 0; i < files.length; i++) {
        formData.append('attachments', files[i]);
      }

      const res = await api.post('/solutions/proposal', formData);
      if (res.success) {
        toast.success(res.message || 'Proposal submitted for 3-Tier Multi-Stakeholder Review!');
        navigate('/dashboard/student');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '36px 20px 90px' }}>
      <div className="container" style={{ maxWidth: 960 }}>

        {/* ── Breadcrumb & Hero Header ────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <GraduationCap size={13} /> Student Innovator Portal
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/</span>
            <span className="badge badge-blue">Solution Proposal Intake</span>
          </div>

          <h1 style={{ fontSize: '2.35rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 12, lineHeight: 1.25 }}>
            Engineering & Social Impact <span className="text-gradient">Solution Proposal</span>
          </h1>

          <p className="text-secondary" style={{ fontSize: '1.02rem', lineHeight: 1.6, maxWidth: 780, margin: 0 }}>
            Submit your team's structured engineering blueprint and deployment feasibility plan. All proposals undergo SocioSolve's sequential 3-Tier multi-stakeholder governance before pilot prototyping clearance.
          </p>
        </div>

        {/* ── 3-Tier Governance Pipeline Visual ──────────────── */}
        <div
          className="card"
          style={{
            marginBottom: 32,
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(139,92,246,0.06) 100%)',
            border: '1px solid rgba(139,92,246,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="#818cf8" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                Sequential 3-Tier Multi-Stakeholder Endorsement Pipeline
              </h3>
            </div>
            <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
              Standard Protocol
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 16,
              position: 'relative'
            }}
          >
            {/* Tier 1 */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid rgba(59,130,246,0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.92rem', color: '#60a5fa' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GraduationCap size={16} />
                  </div>
                  Tier 1: Faculty Guide
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>STEP 01</span>
              </div>
              <p className="text-secondary" style={{ fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
                Validates technical architecture, sensor selections, code feasibility & academic rigour.
              </p>
            </div>

            {/* Tier 2 */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid rgba(139,92,246,0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.92rem', color: '#c084fc' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={16} />
                  </div>
                  Tier 2: University HEI
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>STEP 02</span>
              </div>
              <p className="text-secondary" style={{ fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
                Confirms institutional lab access, hardware safety clearance & student IP protection.
              </p>
            </div>

            {/* Tier 3 */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid rgba(16,185,129,0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.92rem', color: '#34d399' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={16} />
                  </div>
                  Tier 3: Govt Nodal
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>STEP 03</span>
              </div>
              <p className="text-secondary" style={{ fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
                Confirms ground district priority alignment and issues pilot deployment sanction.
              </p>
            </div>
          </div>
        </div>

        {/* ── Problem & Team Selection Card ───────────────────── */}
        <div className="card" style={{ marginBottom: 32, padding: '28px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <Layers size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Target Societal Problem & Submitting Team
              </h3>
              <p className="text-muted" style={{ fontSize: '0.83rem', margin: '2px 0 0' }}>
                Select which verified problem you are addressing and the squad collaborating on it.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div>
              <label className="form-label">
                Target Societal Problem <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="form-control"
                value={selectedChallengeId}
                onChange={(e) => setSelectedChallengeId(e.target.value)}
                required
              >
                <option value="">-- Choose Target Problem --</option>
                {challenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.submissionCode ? `[${c.submissionCode}] ` : ''}{c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Submitting Team / Squad</label>
              <select
                className="form-control"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
              >
                <option value="">-- Select Team (or submit as Solo Innovator) --</option>
                {userTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.members?.length || 1} members)
                  </option>
                ))}
              </select>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span className="text-muted">Need a cross-functional squad?</span>
                <Link to="/team-formation" style={{ color: 'var(--color-primary-400)', fontWeight: 600, textDecoration: 'none' }}>
                  Form or join a team &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Target Problem Spotlight Card */}
          {targetChallenge && (
            <div
              style={{
                marginTop: 22,
                padding: '20px 22px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.20)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className="badge" style={{ background: 'rgba(59,130,246,0.12)', color: utils.categoryColor(targetChallenge.category) }}>
                      {utils.categoryLabel(targetChallenge.category)}
                    </span>
                    <span className={`badge ${utils.difficultyBadge(targetChallenge.difficulty)}`}>
                      {targetChallenge.difficulty}
                    </span>
                    {targetChallenge.submissionCode && (
                      <span className="badge badge-purple">
                        {targetChallenge.submissionCode}
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '1.08rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {targetChallenge.title}
                  </h4>
                </div>

                <Link
                  to={`/challenge/${targetChallenge.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <ExternalLink size={13} /> View Full Problem Brief
                </Link>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <MapPin size={14} color="#60a5fa" />
                  <strong>Location:</strong> {targetChallenge.district ? `${targetChallenge.district}, ` : ''}{targetChallenge.state || 'Jharkhand'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Building2 size={14} color="#c084fc" />
                  <strong>Dept:</strong> {targetChallenge.responsibleDepartment || 'Under Nodal Review'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Users size={14} color="#34d399" />
                  <strong>Impact Area:</strong> {targetChallenge.affectedPopulation || targetChallenge.impactArea || 'Community level'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Main Proposal Form ──────────────────────────────── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Section 0: Title */}
          <div className="card" style={{ padding: '26px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                <Lightbulb size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  Proposal Title <span style={{ color: '#ef4444' }}>*</span>
                </h3>
                <p className="text-muted" style={{ fontSize: '0.82rem', margin: '2px 0 0' }}>
                  A crisp, descriptive engineering title for your proposed innovation.
                </p>
              </div>
            </div>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Smart Solar Borewell Telemetry Kiosk & Equitable Allocation Controller"
              required
              style={{ fontSize: '0.98rem', fontWeight: 500 }}
            />
          </div>

          {/* Section 1: Problem & Root Cause */}
          <div className="card" style={{ padding: '26px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <AlertCircle size={18} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  Problem Understanding & Root Cause Analysis <span style={{ color: '#ef4444' }}>*</span>
                </h3>
              </div>
              <span className="badge badge-blue">Section 01</span>
            </div>

            <p className="text-secondary" style={{ fontSize: '0.86rem', lineHeight: 1.55, marginBottom: 14 }}>
              Explain why this problem persists on the ground and why previous municipal or commercial interventions have failed. Include field observations and community context.
            </p>
            <textarea
              className="form-control"
              rows={4}
              value={rootCauseAnalysis}
              onChange={(e) => setRootCauseAnalysis(e.target.value)}
              placeholder="e.g. Over-extraction during summer plunges the groundwater table past 80 meters. Static municipal hand pumps dry up, and sporadic tanker supplies lack equitable rationing, leaving lower-elevation hamlets without drinking water..."
              required
            />
          </div>

          {/* Section 2: Technical Design & Architecture */}
          <div className="card" style={{ padding: '26px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                  <Code2 size={18} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  Proposed Technical Design & Systems Architecture <span style={{ color: '#ef4444' }}>*</span>
                </h3>
              </div>
              <span className="badge badge-purple">Section 02</span>
            </div>

            <p className="text-secondary" style={{ fontSize: '0.86rem', lineHeight: 1.55, marginBottom: 14 }}>
              Detail hardware schematics, firmware telemetry protocols (LoRaWAN/GSM), cloud APIs, edge controller logic, and end-user dashboards.
            </p>
            <textarea
              className="form-control"
              rows={5}
              value={technicalArchitecture}
              onChange={(e) => setTechnicalArchitecture(e.target.value)}
              placeholder="e.g. 1. Submersible hydrostatic pressure transducer in bore casing. 2. Solar MPPT controller powering an ESP32 edge node with solar backup. 3. LoRaWAN telemetry bursts sent every 15 min to local gateway. 4. Cloud telemetry dashboard in React/Node.js with automated SMS alerts to Panchayat operators..."
              required
            />

            {/* Core Tech Stack Selection */}
            <div style={{ marginTop: 20 }}>
              <label className="form-label" style={{ marginBottom: 8 }}>
                Core Technologies & Hardware Components
              </label>

              {/* Active Chips */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="skill-chip"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 12px',
                      fontSize: '0.82rem',
                    }}
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(i)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Remove technology"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Input field */}
              <input
                type="text"
                className="form-control"
                placeholder="Type technology (e.g. ESP32, LoRaWAN, PyTorch) and press Enter or comma"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleAddTech}
                style={{ marginBottom: 10 }}
              />

              {/* Quick suggestions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span className="text-muted" style={{ fontSize: '0.78rem' }}>Quick suggestions:</span>
                {SUGGESTED_TECH.filter(s => !techStack.includes(s)).slice(0, 6).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSuggestedTech(s)}
                    className="btn btn-ghost btn-sm"
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: '1px dashed var(--border-color)',
                    }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Social & Community Impact Metrics */}
          <div className="card" style={{ padding: '26px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <CheckCircle2 size={18} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  Social & Community Impact Metrics <span style={{ color: '#ef4444' }}>*</span>
                </h3>
              </div>
              <span className="badge badge-emerald">Section 03</span>
            </div>

            <p className="text-secondary" style={{ fontSize: '0.86rem', lineHeight: 1.55, marginBottom: 14 }}>
              State measurable, verifiable key performance indicators (KPIs) for the target beneficiaries. How will success be proven during the field pilot?
            </p>
            <textarea
              className="form-control"
              rows={3}
              value={impactMetrics}
              onChange={(e) => setImpactMetrics(e.target.value)}
              placeholder="e.g. Zero dry pump days across 8 panchayats; guaranteed 25L/day potable water per household; 100% reduction in water collection walking distance for 12,000 villagers..."
              required
            />
          </div>

          {/* Section 4: Budget & Timeline */}
          <div className="card" style={{ padding: '26px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                  <Clock size={18} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  Estimated Budget & Execution Timeline
                </h3>
              </div>
              <span className="badge badge-amber">Section 04</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <DollarSign size={14} color="#f59e0b" /> Estimated Prototype Budget (INR)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={budgetEstimate}
                  onChange={(e) => setBudgetEstimate(e.target.value)}
                  placeholder="e.g. ₹1,20,000"
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={14} color="#f59e0b" /> Build & Testing Timeline (Weeks)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="number"
                    className="form-control"
                    min="2"
                    max="52"
                    value={timelineWeeks}
                    onChange={(e) => setTimelineWeeks(parseInt(e.target.value) || 2)}
                  />
                  <span className="badge badge-purple" style={{ whiteSpace: 'nowrap', padding: '10px 14px' }}>
                    {timelineWeeks} Weeks Total
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Risk Mitigation & Field Testing */}
          <div className="card" style={{ padding: '26px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(6,182,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                  <ShieldCheck size={18} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  Risk Assessment & Ground Mitigation Plan
                </h3>
              </div>
              <span className="badge badge-cyan">Section 05</span>
            </div>

            <p className="text-secondary" style={{ fontSize: '0.86rem', lineHeight: 1.55, marginBottom: 14 }}>
              Anticipate field failure modes: weather extremes, power outages, vandalism, sensor fouling, and how your engineering team safeguards against them.
            </p>
            <textarea
              className="form-control"
              rows={3}
              value={riskMitigation}
              onChange={(e) => setRiskMitigation(e.target.value)}
              placeholder="e.g. IP67 rated weatherproof enclosure; manual override mechanical valve; 48-hour battery buffer for monsoon overcast; anti-theft locking brackets with tamper sensors..."
            />
          </div>

          {/* Section 6: Artifacts & Repositories */}
          <div className="card" style={{ padding: '26px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  <Upload size={18} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  Repositories & Project Artifacts
                </h3>
              </div>
              <span className="badge badge-indigo">Section 06</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Code2 size={14} color="#60a5fa" /> GitHub Repository URL
                </label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <LinkIcon size={14} color="#c084fc" /> Interactive Demo URL
                </label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://my-demo-app.com"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Video size={14} color="#f43f5e" /> Video Demonstration URL
                </label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>
            </div>

            {/* File Upload Dropzone */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <FileText size={14} color="#10b981" /> Upload CAD Schematics, Circuit Diagrams or PDF Dossier
              </label>

              <div
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px 20px',
                  textAlign: 'center',
                  background: 'var(--bg-input)',
                  transition: 'border-color var(--transition-fast)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.zip"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                    <Upload size={20} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    Choose files or drag & drop here
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                    Supported formats: PDF, PNG, JPG, ZIP (CAD/Firmware packages up to 25MB)
                  </span>
                </div>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {files.map((file, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.84rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={16} color="#3b82f6" />
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{file.name}</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(i)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f43f5e',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 4
                        }}
                        title="Remove file"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Submission Action Bar ──────────────────────────── */}
          <div
            className="card"
            style={{
              padding: '20px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--card-shadow-hover)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
              <span className="text-secondary" style={{ fontSize: '0.86rem' }}>
                Your proposal will be immediately routed to Faculty Mentors for Tier-1 evaluation.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/team-formation" className="btn btn-secondary">
                Back to Squads
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  padding: '12px 28px',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {submitting ? 'Submitting for Tier-1 Review...' : (
                  <>
                    Submit Solution Proposal <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
