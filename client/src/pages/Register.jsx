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
  const [organizationType, setOrganizationType] = useState('individual');
  const [university, setUniversity] = useState('');
  const [skills, setSkills] = useState('React, IoT, Python');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
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

  const roles = [
    { id: 'student',          title: 'Student Innovator',  icon: '🎓', desc: 'Discover challenges, build solutions' },
    { id: 'citizen',          title: 'Problem Submitter',  icon: '📢', desc: 'Citizen, Panchayat, ULB, NGO' },
    { id: 'nodal_officer',    title: 'Govt Nodal Officer', icon: '🏛️', desc: 'Verify, prioritize & route to HEIs' },
    { id: 'faculty',          title: 'Faculty Mentor',     icon: '📚', desc: 'Guide university teams on R&D' },
    { id: 'expert',           title: 'Domain Evaluator',   icon: '⭐', desc: 'Independent scoring & rubrics' },
    { id: 'university_admin', title: 'HEI Coordinator',    icon: '🏫', desc: 'Manage institutional participation' },
    { id: 'industry_partner', title: 'Industry / CSR',     icon: '🤝', desc: 'Sponsorship, mentoring & adoption' },
    { id: 'community',        title: 'Community Member',   icon: '🗳️', desc: 'Follow challenges & validate impact' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
      await register({
        name,
        email,
        password,
        role,
        organization: organization || university || (role === 'student' ? 'Student Innovator' : ''),
        organizationType: role === 'citizen' ? organizationType : (role === 'nodal_officer' ? 'government' : (role === 'industry_partner' ? 'industry' : 'individual')),
        university: ['student', 'faculty', 'university_admin'].includes(role) ? (university || organization) : (university || null),
        skills: ['student', 'faculty', 'expert'].includes(role) ? skillsArray : [],
        state: state || null,
        district: district || null,
        institutionType: role === 'university_admin' ? 'hei' : (institutionType || null),
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
          {role === 'student' && (
            <>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="uni">University / College Name *</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Building size={18} /></span>
                  <input
                    id="uni"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Anna Technical University"
                    value={organization}
                    onChange={(e) => { setOrganization(e.target.value); setUniversity(e.target.value); }}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div className="form-group mb-4">
                  <label className="form-label">State</label>
                  <select className="form-select" value={state} onChange={(e) => setState(e.target.value)}>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">District</label>
                  <input type="text" className="form-input" placeholder="e.g. Chennai" value={district} onChange={(e) => setDistrict(e.target.value)} />
                </div>
              </div>
              <div className="form-group mb-5">
                <label className="form-label" htmlFor="skills">Technical Skills (Comma-separated for AI Matching)</label>
                <input
                  id="skills"
                  type="text"
                  className="form-input"
                  placeholder="e.g. React, Node.js, Python, IoT, Embedded C"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
                <span className="text-muted" style={{ fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                  Used by SocioSolve AI to compute match % for societal challenges.
                </span>
              </div>
            </>
          )}

          {role === 'citizen' && (
            <>
              <div className="form-group mb-4">
                <label className="form-label">Submitter Category (submitter_type) *</label>
                <select
                  className="form-select"
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value)}
                  required
                >
                  <option value="individual">Individual Citizen</option>
                  <option value="community_org">Gram Panchayat / Village Authority</option>
                  <option value="government">Urban Local Body / Municipality</option>
                  <option value="ngo">NGO / Non-Profit Organisation</option>
                  <option value="community_org">Community Group / SHG</option>
                  <option value="government">Government Department</option>
                </select>
                <span className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
                  SocioSolve accommodates citizens, panchayats, ULBs, NGOs, and departments under one verified submitter workflow.
                </span>
              </div>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="org">Organization / Locality / Panchayat Name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Building size={18} /></span>
                  <input
                    id="org"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Jal-Drishti NGO or Gumla Block Panchayat"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div className="form-group mb-4">
                  <label className="form-label">State *</label>
                  <select className="form-select" value={state} onChange={(e) => setState(e.target.value)} required>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">District *</label>
                  <input type="text" className="form-input" placeholder="e.g. Gumla" value={district} onChange={(e) => setDistrict(e.target.value)} required />
                </div>
              </div>
            </>
          )}

          {role === 'nodal_officer' && (
            <>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="org">Responsible Government Department *</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Building size={18} /></span>
                  <input
                    id="org"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Jharkhand Jal Mission / Dept of Drinking Water"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div className="form-group mb-4">
                  <label className="form-label">State *</label>
                  <select className="form-select" value={state} onChange={(e) => setState(e.target.value)} required>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Jurisdiction District *</label>
                  <input type="text" className="form-input" placeholder="e.g. Ranchi" value={district} onChange={(e) => setDistrict(e.target.value)} required />
                </div>
              </div>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="regNo">Officer ID / Employee Designation No. *</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><FileText size={18} /></span>
                  <input
                    id="regNo"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. JH-OFFICER-001"
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {role === 'faculty' && (
            <>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="uni">University / Institution Name *</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Building size={18} /></span>
                  <input
                    id="uni"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Anna Technical University"
                    value={university}
                    onChange={(e) => { setUniversity(e.target.value); }}
                    required
                  />
                </div>
              </div>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="org">Academic Department *</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Building size={18} /></span>
                  <input
                    id="org"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Department of Electronics & Communication"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Mentoring Domain & Skills (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. IoT, Embedded Systems, LoRaWAN, Water Quality"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">State</label>
                <select className="form-select" value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
            </>
          )}

          {role === 'expert' && (
            <>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="org">Research Lab / Organization / Institution *</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Building size={18} /></span>
                  <input
                    id="org"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Indian Institute of Science"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Evaluation Domain Areas (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. IoT, Solar Energy, System Architecture, Water Treatment"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">State</label>
                <select className="form-select" value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
            </>
          )}

          {(role === 'university_admin' || role === 'industry_partner') && (
            <>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="org">
                  {role === 'university_admin' ? 'University / Institution Name *' : 'Company / Foundation Name *'}
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Building size={18} /></span>
                  <input
                    id="org"
                    type="text"
                    className="auth-input"
                    placeholder={role === 'university_admin' ? 'e.g. Anna Technical University' : 'e.g. GreenEdge Technologies Pvt Ltd'}
                    value={organization}
                    onChange={(e) => { setOrganization(e.target.value); if (role === 'university_admin') setUniversity(e.target.value); }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div className="form-group mb-4">
                  <label className="form-label">Entity Type *</label>
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
                        <option value="csr">CSR / Corporate Foundation</option>
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
                    {INDIAN_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div className="form-group mb-4">
                  <label className="form-label" htmlFor="website">Official Website</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Globe size={18} /></span>
                    <input
                      id="website"
                      type="url"
                      className="auth-input"
                      placeholder="https://example.edu"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group mb-4">
                  <label className="form-label" htmlFor="regNo">
                    {role === 'university_admin' ? 'NAAC / UGC Reg. No.' : 'CIN / GST / MSME Reg. No.'}
                  </label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><FileText size={18} /></span>
                    <input
                      id="regNo"
                      type="text"
                      className="auth-input"
                      placeholder={role === 'university_admin' ? 'e.g. TN-HEI-2024-001' : 'e.g. KA-STARTUP-2024-112'}
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {role === 'community' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <div className="form-group mb-4">
                <label className="form-label">Your State</label>
                <select className="form-select" value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">District / City</label>
                <input type="text" className="form-input" placeholder="e.g. Gumla" value={district} onChange={(e) => setDistrict(e.target.value)} />
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
