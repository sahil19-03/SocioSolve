import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Lightbulb, Code2, Link as LinkIcon, Video, Upload, X,
  ShieldCheck, GraduationCap, Building2, CheckCircle2, Clock, ArrowRight, AlertCircle
} from 'lucide-react';

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

  // Proposal fields (Phase 6)
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
        console.warn(err);
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
          console.warn(e);
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

  const handleRemoveTech = (index) => {
    setTechStack(techStack.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.info('Please log in as a student to submit a proposal');
      navigate(`/login?redirect=/submit-solution?challengeId=${selectedChallengeId}`);
      return;
    }

    if (!selectedChallengeId) {
      toast.error('Please select the target challenge');
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
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 880 }}>

        {/* Header Hero */}
        <div className="mb-8">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="badge badge-purple">Phase 6: Solution Proposal</span>
            <span className="badge badge-cyan">3-Tier Multi-Stakeholder Endorsement</span>
          </div>
          <h1 style={{ fontSize: '2.3rem', marginBottom: 8 }}>
            Engineering & Social Impact Solution Proposal
          </h1>
          <p className="text-secondary" style={{ maxWidth: 720 }}>
            Structured engineering proposal required under the SocioSolve innovation pipeline. Submissions undergo a sequential 3-tier validation (Faculty Academic Mentor &rarr; University Coordinator &rarr; Government Nodal Officer) prior to field prototyping clearance.
          </p>
        </div>

        {/* 3-Tier Review Pipeline Banner */}
        <div className="card p-6 mb-8" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)', borderColor: 'rgba(99,102,241,0.25)' }}>
          <h4 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#818cf8', marginBottom: 12 }}>
            Sequential 3-Tier Multi-Stakeholder Validation Sequence
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.9rem', color: '#60a5fa' }}>
                <GraduationCap size={16} /> Tier 1: Faculty Mentor
              </div>
              <p className="text-muted" style={{ fontSize: '0.78rem', margin: '4px 0 0' }}>
                Validates technical architecture, feasibility, sensor choices & academic rigour.
              </p>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.9rem', color: '#c084fc' }}>
                <Building2 size={16} /> Tier 2: University Coordinator
              </div>
              <p className="text-muted" style={{ fontSize: '0.78rem', margin: '4px 0 0' }}>
                Confirms institutional lab access, hardware safety, and student IP backing.
              </p>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.9rem', color: '#34d399' }}>
                <ShieldCheck size={16} /> Tier 3: Govt Nodal Officer
              </div>
              <p className="text-muted" style={{ fontSize: '0.78rem', margin: '4px 0 0' }}>
                Confirms ground district priority alignment and issues pilot deployment sanction.
              </p>
            </div>
          </div>
        </div>

        {/* Target Challenge & Team Selector */}
        <div className="card p-6 mb-8">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label className="form-label">Target Societal Problem *</label>
              <select
                className="form-control"
                value={selectedChallengeId}
                onChange={(e) => setSelectedChallengeId(e.target.value)}
                required
              >
                <option value="">-- Select Target Challenge --</option>
                {challenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.submissionCode ? `[${c.submissionCode}] ` : ''}{c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Submitting Squad</label>
              <select
                className="form-control"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
              >
                <option value="">-- Choose or Auto-Create Squad --</option>
                {userTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.members?.length || 1} members)
                  </option>
                ))}
              </select>
              <span className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
                No squad? You can also <Link to="/team-formation" style={{ color: '#818cf8' }}>create a squad here</Link>.
              </span>
            </div>
          </div>

          {targetChallenge && (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
              <strong>Location:</strong> {targetChallenge.district ? `${targetChallenge.district}, ` : ''}{targetChallenge.state || 'Jharkhand'} &bull;{' '}
              <strong>Department:</strong> {targetChallenge.responsibleDepartment || 'Under Nodal Review'} &bull;{' '}
              <strong>Affected Population:</strong> {targetChallenge.affectedPopulation || targetChallenge.impactArea || 'Community level'}
            </div>
          )}
        </div>

        {/* Main Proposal Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Section 0: Title */}
          <div className="card p-6">
            <label className="form-label" style={{ fontSize: '1rem', fontWeight: 700 }}>
              Proposal Title *
            </label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Smart Solar Borewell Telemetry Kiosk & Equitable Allocation Controller"
              required
            />
          </div>

          {/* Section 1: Problem & Root Cause */}
          <div className="card p-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-blue">Section 1</span>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Problem Understanding & Root Cause Analysis *</h3>
            </div>
            <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
              Explain why this problem exists on the ground and why conventional municipal or commercial interventions have failed.
            </p>
            <textarea
              className="form-control"
              rows={4}
              value={rootCauseAnalysis}
              onChange={(e) => setRootCauseAnalysis(e.target.value)}
              placeholder="e.g. Over-extraction during summer plunges the groundwater table past 80 meters. Static municipal hand pumps dry up, and sporadic tanker supplies lack equitable rationing..."
              required
            />
          </div>

          {/* Section 2: Technical Design & Architecture */}
          <div className="card p-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-purple">Section 2</span>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Proposed Technical Design & Systems Architecture *</h3>
            </div>
            <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
              Detail hardware schematics, firmware telemetry protocols (LoRaWAN/GSM), cloud APIs, edge controller logic, and user interfaces.
            </p>
            <textarea
              className="form-control"
              rows={5}
              value={technicalArchitecture}
              onChange={(e) => setTechnicalArchitecture(e.target.value)}
              placeholder="e.g. 1. Ultrasonic depth sensor in bore casing. 2. Solar MPPT controller powering an ESP32 edge node. 3. LoRaWAN telemetry bursts sent every 15 min. 4. Cloud telemetry dashboard in React/Node.js with automated SMS alerts..."
              required
            />

            <div style={{ marginTop: 16 }}>
              <label className="form-label">Core Technologies & Hardware Components</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {techStack.map((tech, i) => (
                  <span key={i} className="skill-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {tech}
                    <button type="button" onClick={() => handleRemoveTech(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Type technology (e.g. ESP32, LoRaWAN, PyTorch) and press Enter"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleAddTech}
              />
            </div>
          </div>

          {/* Section 3: Social & Community Impact Metrics */}
          <div className="card p-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-green">Section 3</span>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Social & Community Impact Metrics *</h3>
            </div>
            <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
              State measurable, verifiable key performance indicators (KPIs) for the target beneficiaries.
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
          <div className="card p-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-amber">Section 4</span>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Estimated Budget & Execution Timeline</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">Estimated Prototype / Pilot Budget (INR)</label>
                <input
                  type="text"
                  className="form-control"
                  value={budgetEstimate}
                  onChange={(e) => setBudgetEstimate(e.target.value)}
                  placeholder="e.g. ₹1,20,000"
                />
              </div>

              <div>
                <label className="form-label">Estimated Build Timeline (Weeks)</label>
                <input
                  type="number"
                  className="form-control"
                  min="2"
                  max="52"
                  value={timelineWeeks}
                  onChange={(e) => setTimelineWeeks(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Risk Mitigation & Field Testing */}
          <div className="card p-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-cyan">Section 5</span>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Risk Assessment & Ground Mitigation Plan</h3>
            </div>
            <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
              Anticipate field failure modes: weather extremes, vandalism, power loss, sensor fouling, and how your team safeguards against them.
            </p>
            <textarea
              className="form-control"
              rows={3}
              value={riskMitigation}
              onChange={(e) => setRiskMitigation(e.target.value)}
              placeholder="e.g. IP67 rated weatherproof enclosure; manual override mechanical valve; 48-hour battery buffer for monsoon overcast; anti-theft locking brackets..."
            />
          </div>

          {/* Section 6: Artifacts & Repositories */}
          <div className="card p-6">
            <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Repositories & Project Artifacts</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label"><Code2 size={14} style={{ marginRight: 4 }} /> GitHub Repository URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label"><LinkIcon size={14} style={{ marginRight: 4 }} /> Interactive Demo / Cloud URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://..."
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label"><Video size={14} style={{ marginRight: 4 }} /> Demonstration Video URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://youtube.com/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label"><Upload size={14} style={{ marginRight: 4 }} /> Upload CAD Schematics / PDF Dossiers</label>
              <input
                type="file"
                className="form-control"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.zip"
                onChange={(e) => setFiles(Array.from(e.target.files))}
              />
              {files.length > 0 && (
                <div style={{ marginTop: 8, fontSize: '0.8rem', color: '#10b981' }}>
                  {files.length} file(s) staged for upload.
                </div>
              )}
            </div>
          </div>

          {/* Submission Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Link to="/team-formation" className="btn btn-outline">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '1rem' }}
            >
              {submitting ? 'Submitting to Tier 1 Review...' : 'Submit Solution Proposal 🚀'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
