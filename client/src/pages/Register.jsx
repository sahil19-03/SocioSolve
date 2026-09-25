import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, ArrowRight, User, Mail, Lock, Building, GraduationCap, Award } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register, getDashboardPath } = useAuth();
  const toast = useToast();

  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    { id: 'student',          title: 'Student Innovator',        icon: '🎓', desc: 'Discover challenges, form teams, build solutions' },
    { id: 'citizen',          title: 'Problem Submitter',        icon: '🏛️', desc: 'Submit real challenges from your community or NGO' },
    { id: 'nodal_officer',    title: 'Govt Nodal Officer',       icon: '🏛️', desc: 'Verify citizen problems, assign priority & publish to HEIs' },
    { id: 'faculty',          title: 'Faculty Mentor',           icon: '📚', desc: 'Guide university teams with academic research' },
    { id: 'expert',           title: 'Industry Expert',          icon: '⭐', desc: 'Evaluate solution feasibility and industry readiness' },
    { id: 'university_admin', title: 'HEI Coordinator',          icon: '🏫', desc: 'Register your Higher Education Institution as a partner' },
    { id: 'industry_partner', title: 'Industry Partner',         icon: '🤝', desc: 'Offer mentoring, funding, or prototyping support' },
    { id: 'community',        title: 'Community Member',         icon: '🗳️', desc: 'Vote on solutions, follow challenges and track progress' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await register({
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
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: 640, padding: '40px 36px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="brand-icon" style={{ margin: '0 auto 16px', width: 44, height: 44, fontSize: '1.4rem' }}>⚡</div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Join the SocioSolve Ecosystem</h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            Select your primary role to customize your platform experience
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Selection Cards */}
          <div className="form-group mb-6">
            <label className="form-label">Select Your Role *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginTop: 6 }}>
              {roles.map((r) => (
                <div 
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: role === r.id ? '1px solid var(--color-primary-500)' : '1px solid var(--border-color)',
                    background: role === r.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{r.icon}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: role === r.id ? 'var(--color-primary-400)' : 'var(--text-primary)' }}>
                    {r.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="regName">Full Name *</label>
            <input 
              id="regName"
              type="text"
              className="form-input"
              placeholder="e.g. Sahil Raj"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="regEmail">Email Address *</label>
            <input 
              id="regEmail"
              type="email"
              className="form-input"
              placeholder="name@university.edu or domain.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="regPass">Password *</label>
            <input 
              id="regPass"
              type="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Role-specific fields */}
          {role === 'student' ? (
            <div className="form-group mb-4">
              <label className="form-label" htmlFor="skills">Technical Skills (Comma separated for AI Matching)</label>
              <input
                id="skills" type="text" className="form-input"
                placeholder="e.g. React, Node.js, Python, IoT, ML, Flutter"
                value={skills} onChange={(e) => setSkills(e.target.value)}
              />
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>Used by SocioSolve AI to compute match % for societal challenges.</span>
            </div>
          ) : isInstitution ? (
            <>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="org">{role === 'university_admin' ? 'University / Institution Name *' : 'Company / Organisation Name *'}</label>
                <input id="org" type="text" className="form-input"
                  placeholder={role === 'university_admin' ? 'e.g. IIT Bombay' : 'e.g. TechVentures Pvt Ltd'}
                  value={organization} onChange={(e) => setOrganization(e.target.value)} required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group mb-4">
                  <label className="form-label">Institution Type *</label>
                  <select className="form-select" value={institutionType} onChange={(e) => setInstitutionType(e.target.value)} required>
                    <option value="">-- Select --</option>
                    {role === 'university_admin'
                      ? <option value="hei">Higher Education Institution (HEI)</option>
                      : <>
                          <option value="startup">Startup</option>
                          <option value="msme">MSME</option>
                          <option value="csr">CSR / Foundation</option>
                          <option value="research_lab">Research Laboratory</option>
                          <option value="govt">Government Agency</option>
                          <option value="other">Other</option>
                        </>
                    }
                  </select>
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">State *</label>
                  <select className="form-select" value={state} onChange={(e) => setState(e.target.value)} required>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group mb-4">
                  <label className="form-label" htmlFor="website">Website</label>
                  <input id="website" type="url" className="form-input" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
                <div className="form-group mb-4">
                  <label className="form-label" htmlFor="regNo">{role === 'university_admin' ? 'NAAC / UGC Reg. No.' : 'MCA / GST Reg. No.'}</label>
                  <input id="regNo" type="text" className="form-input" placeholder="Optional" value={registrationNo} onChange={(e) => setRegistrationNo(e.target.value)} />
                </div>
              </div>
            </>
          ) : (
            <div className="form-group mb-4">
              <label className="form-label" htmlFor="org">Organization / Department / Affiliation</label>
              <input
                id="org" type="text" className="form-input"
                placeholder={role === 'faculty' ? 'e.g. Dept of Computer Engineering' : 'e.g. Green Earth Foundation / Municipal Corp'}
                value={organization} onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary w-full"
            style={{ padding: '12px', fontSize: '0.95rem' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.875rem' }}>
          <span className="text-secondary">Already have an account? </span>
          <Link to="/login" className="text-primary hover:underline" style={{ fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
