import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, User, Mail, Lock, Eye, EyeOff, Building, Globe, FileText } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register, getDashboardPath } = useAuth();
  const toast = useToast();

  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [organization, setOrganization] = useState('');
  const [skills, setSkills] = useState('React, IoT, Python');
  const [state, setState] = useState('');
  const [institutionType, setInstitutionType] = useState('');
  const [website, setWebsite] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [loading, setLoading] = useState(false);

  const INDIAN_STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
    'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
    'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry'
  ];

  const isInstitution = ['university_admin', 'industry_partner'].includes(role);

  const roles = [
    { id: 'student',          title: 'Student Innovator',  icon: '🎓', desc: 'Discover challenges, build solutions' },
    { id: 'citizen',          title: 'Problem Submitter',  icon: '📢', desc: 'Submit real civic & NGO problems' },
    { id: 'nodal_officer',    title: 'Govt Nodal Officer', icon: '🏛️', desc: 'Verify, prioritize & route to HEIs' },
    { id: 'faculty',          title: 'Faculty Mentor',     icon: '📚', desc: 'Guide university teams on R&D' },
    { id: 'expert',           title: 'Domain Expert',      icon: '⭐', desc: 'Evaluate feasibility & readiness' },
    { id: 'university_admin', title: 'HEI Coordinator',    icon: '🏫', desc: 'Manage institutional innovation cell' },
    { id: 'industry_partner', title: 'Industry Partner',   icon: '🤝', desc: 'Sponsorship, mentoring & adoption' },
    { id: 'community',        title: 'Community Member',   icon: '🗳️', desc: 'Follow challenges & vote on impact' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      await register({
        name,
        email,
        password,
        role,
        organization: organization || (role === 'student' ? 'University Student' : ''),
        skills: role === 'student' ? skillsArray : [],
        state: state || null,
        institutionType: institutionType || null,
        website: website || null,
        registrationNo: registrationNo || null
      });

      toast.success(`Welcome to SocioSolve, ${name}!`);
      navigate(getDashboardPath(role));
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-ambient-glow" />

      <div className="card auth-card auth-card--register">
        {/* Brand & Emblem Header */}
        <div className="auth-header">
          <Link to="/" className="auth-brand-link" title="SocioSolve National Platform">
            <div className="auth-logo-badge">
              <img src="/logo.png" alt="SocioSolve Emblem" />
            </div>
            <div className="auth-brand-title">
              Socio<span>Solve</span>
            </div>
            <span className="auth-brand-pill">
              National Innovation Network
            </span>
          </Link>

          <h1 className="auth-heading">Join the <span style={{ color: 'var(--color-primary-400)' }}>SocioSolve</span> Ecosystem</h1>
          <p className="auth-lead">
            Select your primary role to customize your platform experience and innovation tools
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Selection Grid */}
          <div className="form-group mb-6">
            <label className="form-label" style={{ fontSize: '0.92rem' }}>
              Select Your Role <span style={{ color: 'var(--color-primary-400)' }}>*</span>
            </label>
            <div className="auth-role-grid">
              {roles.map((r) => {
                const isActive = role === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`auth-role-item ${isActive ? 'auth-role-item--active' : ''}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setRole(r.id); }}
                  >
                    <div className="auth-role-icon">{r.icon}</div>
                    <div className="auth-role-title">{r.title}</div>
                    <div className="auth-role-desc">{r.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Full Name */}
            <div className="form-group mb-4">
              <label className="form-label" htmlFor="regName">Full Name *</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <User size={18} />
                </span>
                <input
                  id="regName"
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Sahil Raj"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group mb-4">
              <label className="form-label" htmlFor="regEmail">Email Address *</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <Mail size={18} />
                </span>
                <input
                  id="regEmail"
                  type="email"
                  className="auth-input"
                  placeholder="name@university.edu or domain.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="form-group mb-5">
            <label className="form-label" htmlFor="regPass">Password *</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <Lock size={18} />
              </span>
              <input
                id="regPass"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-input-action"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Role-specific fields */}
          {role === 'student' ? (
            <div className="form-group mb-5">
              <label className="form-label" htmlFor="skills">Technical Skills (Comma separated for AI Matching)</label>
              <input
                id="skills"
                type="text"
                className="form-input"
                placeholder="e.g. React, Node.js, Python, IoT, ML, Flutter"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <span className="text-muted" style={{ fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                Used by SocioSolve AI to compute match % for societal challenges.
              </span>
            </div>
          ) : isInstitution ? (
            <>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="org">
                  {role === 'university_admin' ? 'University / Institution Name *' : 'Company / Organisation Name *'}
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <Building size={18} />
                  </span>
                  <input
                    id="org"
                    type="text"
                    className="auth-input"
                    placeholder={role === 'university_admin' ? 'e.g. IIT Bombay' : 'e.g. TechVentures Pvt Ltd'}
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div className="form-group mb-4">
                  <label className="form-label">Institution Type *</label>
                  <select
                    className="form-select"
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value)}
                    required
                  >
                    <option value="">-- Select --</option>
                    {role === 'university_admin' ? (
                      <option value="hei">Higher Education Institution (HEI)</option>
                    ) : (
                      <>
                        <option value="startup">Startup</option>
                        <option value="msme">MSME</option>
                        <option value="csr">CSR / Foundation</option>
                        <option value="research_lab">Research Laboratory</option>
                        <option value="govt">Government Agency</option>
                        <option value="other">Other</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group mb-4">
                  <label className="form-label">State *</label>
                  <select
                    className="form-select"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div className="form-group mb-4">
                  <label className="form-label" htmlFor="website">Website</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <Globe size={18} />
                    </span>
                    <input
                      id="website"
                      type="url"
                      className="auth-input"
                      placeholder="https://institution.edu"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group mb-4">
                  <label className="form-label" htmlFor="regNo">
                    {role === 'university_admin' ? 'NAAC / UGC Reg. No.' : 'MCA / GST Reg. No.'}
                  </label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <FileText size={18} />
                    </span>
                    <input
                      id="regNo"
                      type="text"
                      className="auth-input"
                      placeholder="e.g. NAAC-A-2024"
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="form-group mb-5">
              <label className="form-label" htmlFor="org">Organization / Department / Affiliation</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <Building size={18} />
                </span>
                <input
                  id="org"
                  type="text"
                  className="auth-input"
                  placeholder={role === 'faculty' ? 'e.g. Dept of Computer Engineering' : 'e.g. Green Earth Foundation / Municipal Corp'}
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full"
            style={{ padding: '13px', fontSize: '0.98rem', marginTop: 8 }}
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                Create Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: 28, textAlign: 'center', fontSize: '0.9rem' }}>
          <span className="text-secondary">Already have an account? </span>
          <Link to="/login" className="text-primary hover:underline" style={{ fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
