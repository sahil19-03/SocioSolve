import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, utils } from '../services/api';
import {
  User, Mail, Phone, MapPin, Building, Globe, Shield, KeyRound,
  GraduationCap, Sparkles, CheckCircle2, Award, Briefcase,
  FileText, ExternalLink, Save, RefreshCw, AlertCircle
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry'
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80'
];

const ROLE_META = {
  student: {
    title: 'Student Innovator',
    badge: '🎓 Innovator',
    color: '#3b82f6',
    desc: 'Building cutting-edge prototypes for civic and societal challenges'
  },
  nodal_officer: {
    title: 'Government Nodal Officer',
    badge: '🏛️ Govt Authority',
    color: '#10b981',
    desc: 'Verifying authentic citizen problems, assigning dept ownership, and approving field pilots'
  },
  faculty: {
    title: 'Faculty Mentor & Guide',
    badge: '📚 Academic Guide',
    color: '#8b5cf6',
    desc: 'Supervising student team research, technical feasibility, and milestone validation'
  },
  expert: {
    title: 'Domain Expert Evaluator',
    badge: '⭐ Independent Evaluator',
    color: '#f59e0b',
    desc: 'Evaluating prototypes on Technical, Social Impact, and Deployment Readiness'
  },
  university_admin: {
    title: 'University / HEI Coordinator',
    badge: '🏫 Institutional Partner',
    color: '#06b6d4',
    desc: 'Connecting institutional labs, approving student teams, and claiming societal problems'
  },
  industry_partner: {
    title: 'Industry & CSR Partner',
    badge: '🤝 Industry / CSR Partner',
    color: '#ec4899',
    desc: 'Offering CSR grants, sensor hardware, mentorship, and pilot incubation support'
  },
  citizen: {
    title: 'Citizen Problem Submitter',
    badge: '👤 Community Submitter',
    color: '#14b8a6',
    desc: 'Reporting grassroots civic issues and validating real pilot impact on-ground'
  },
  community: {
    title: 'Community Member & Voter',
    badge: '🗳️ Community Voter',
    color: '#64748b',
    desc: 'Supporting civic solutions through community voting and feedback'
  },
  admin: {
    title: 'Platform Administrator',
    badge: '⚡ Platform Admin',
    color: '#ef4444',
    desc: 'Platform health monitoring, audit oversight, and system security management'
  }
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // Form State initialized from user
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    state: '',
    district: '',
    bio: '',
    avatar: '',
    university: '',
    organization: '',
    organizationType: 'individual',
    institutionType: '',
    website: '',
    registrationNo: '',
    skills: '',
    interests: ''
  });

  // Password state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        state: user.state || '',
        district: user.district || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        university: user.university || '',
        organization: user.organization || '',
        organizationType: user.organizationType || 'individual',
        institutionType: user.institutionType || '',
        website: user.website || '',
        registrationNo: user.registrationNo || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
        interests: Array.isArray(user.interests) ? user.interests.join(', ') : (user.interests || '')
      });
    }
  }, [user]);

  if (!user) return null;

  const roleInfo = ROLE_META[user.role] || ROLE_META.student;

  // Calculate Profile Completion
  const calculateCompletion = () => {
    let fields = ['name', 'phone', 'state', 'district', 'bio'];
    if (user.role === 'student') fields.push('university', 'skills');
    if (['faculty', 'university_admin'].includes(user.role)) fields.push('university', 'organization');
    if (['nodal_officer', 'industry_partner', 'expert'].includes(user.role)) fields.push('organization', 'website');

    let filled = fields.filter(f => formData[f] && formData[f].toString().trim().length > 0);
    return Math.round((filled.length / fields.length) * 100);
  };

  const completionPct = calculateCompletion();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.put('/auth/profile', formData);
      if (res.success && res.user) {
        updateUser(res.user);
        toast.success('Profile details saved to database successfully!');
      } else {
        toast.error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error(err.message || 'Error saving profile to database');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    if (passData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setPassLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      if (res.success) {
        toast.success('Password changed successfully!');
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(res.message || 'Failed to update password');
      }
    } catch (err) {
      toast.error(err.message || 'Error updating password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 20px 60px' }}>
      {/* ── Top Header Banner ── */}
      <div
        className="card profile-banner"
        style={{
          padding: '32px 28px',
          marginBottom: 24,
          border: '1px solid var(--border-color)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}>
          {/* Avatar with role ring */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                background: formData.avatar ? `url(${formData.avatar}) center/cover no-repeat` : 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                color: '#fff',
                boxShadow: `0 0 0 3px ${roleInfo.color}44`,
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {!formData.avatar && utils.initials(user.name)}
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                background: roleInfo.color,
                color: '#fff',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
              }}
              title={roleInfo.title}
            >
              ✓
            </div>
          </div>

          {/* User Headline */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {user.name}
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: `${roleInfo.color}22`,
                  color: roleInfo.color,
                  border: `1px solid ${roleInfo.color}44`
                }}
              >
                {roleInfo.badge}
              </span>
            </div>

            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Mail size={14} /> {user.email}
              </span>
              {user.phone && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Phone size={14} /> {user.phone}
                </span>
              )}
              {user.state && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <MapPin size={14} /> {user.district ? `${user.district}, ` : ''}{user.state}
                </span>
              )}
            </p>

            <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {roleInfo.desc}
            </div>
          </div>

          {/* Profile Completion Widget */}
          <div
            className="profile-widget"
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              minWidth: 190,
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Profile Strength
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: completionPct >= 80 ? 'var(--color-emerald-500)' : 'var(--color-primary-400)' }}>
              {completionPct}%
            </div>
            <div
              className="profile-progress-bg"
              style={{
                width: '100%',
                height: 6,
                borderRadius: 4,
                overflow: 'hidden',
                marginTop: 8
              }}
            >
              <div
                style={{
                  width: `${completionPct}%`,
                  height: '100%',
                  background: completionPct >= 80 ? 'var(--color-emerald-500)' : 'var(--gradient-primary)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6 }}>
              {completionPct >= 80 ? 'Verified & Complete' : 'Add phone & details to finish'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab('profile')}
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <User size={16} /> Personal & Role Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <KeyRound size={16} /> Password & Security
        </button>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {/* ── Basic Personal Information Card ── */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ padding: 8, borderRadius: 8, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary-400)' }}>
                  <User size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>Personal Information</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Identifies you across the SocioSolve network</span>
                </div>
              </div>

              {/* Full Name */}
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email (Read Only) */}
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="email">Email Address (Registered Login)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    value={user.email}
                    disabled
                    style={{ opacity: 0.75, cursor: 'not-allowed', paddingRight: 80 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--color-emerald-500)',
                      background: 'rgba(16, 185, 129, 0.12)',
                      padding: '3px 8px',
                      borderRadius: 4
                    }}
                  >
                    Verified
                  </span>
                </div>
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>Account email cannot be modified directly for audit integrity.</span>
              </div>

              {/* Phone Number */}
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="phone">Phone / Mobile Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>Used for critical milestone approvals and nodal pilot alerts.</span>
              </div>

              {/* Location: State & District */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group mb-4">
                  <label className="form-label">State / UT</label>
                  <select
                    className="form-select"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-4">
                  <label className="form-label" htmlFor="district">District / City</label>
                  <input
                    id="district"
                    type="text"
                    name="district"
                    className="form-input"
                    placeholder="e.g. Gumla, Ranchi, Pune"
                    value={formData.district}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="form-group mb-2">
                <label className="form-label" htmlFor="bio">Bio / Statement of Focus</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  className="form-input"
                  placeholder="Share a brief introduction or civic mission..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ── Role-Specific Professional Information Card ── */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ padding: 8, borderRadius: 8, background: `${roleInfo.color}22`, color: roleInfo.color }}>
                  <Award size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>{roleInfo.title} Details</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Role-tailored credentials stored in database</span>
                </div>
              </div>

              {/* STUDENT FIELDS */}
              {user.role === 'student' && (
                <>
                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="university">University / Higher Education Institution</label>
                    <input
                      id="university"
                      type="text"
                      name="university"
                      className="form-input"
                      placeholder="e.g. BIT Mesra / IIT Madras"
                      value={formData.university}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="skills">Technical Skills (Comma separated)</label>
                    <input
                      id="skills"
                      type="text"
                      name="skills"
                      className="form-input"
                      placeholder="e.g. React, IoT Sensors, Python, Solar Telemetry, Embedded C"
                      value={formData.skills}
                      onChange={handleChange}
                    />
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>Helps SocioSolve match you with open societal problem statements.</span>
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="interests">Domain Interests / SDGs</label>
                    <input
                      id="interests"
                      type="text"
                      name="interests"
                      className="form-input"
                      placeholder="e.g. Clean Water, Smart Agriculture, Healthcare"
                      value={formData.interests}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* NODAL OFFICER FIELDS */}
              {user.role === 'nodal_officer' && (
                <>
                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="organization">Government Department / Ministry *</label>
                    <input
                      id="organization"
                      type="text"
                      name="organization"
                      className="form-input"
                      placeholder="e.g. Dept of Drinking Water & Sanitation, Govt of Jharkhand"
                      value={formData.organization}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="registrationNo">Official Officer ID / Employee Code</label>
                    <input
                      id="registrationNo"
                      type="text"
                      name="registrationNo"
                      className="form-input"
                      placeholder="e.g. GOV-JH-DWSD-044"
                      value={formData.registrationNo}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="website">Official Department Portal</label>
                    <input
                      id="website"
                      type="url"
                      name="website"
                      className="form-input"
                      placeholder="https://jharkhand.gov.in/water"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* FACULTY GUIDE FIELDS */}
              {user.role === 'faculty' && (
                <>
                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="university">University / Institution *</label>
                    <input
                      id="university"
                      type="text"
                      name="university"
                      className="form-input"
                      placeholder="e.g. National Institute of Technology (NIT)"
                      value={formData.university}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="organization">Academic Department / Lab</label>
                    <input
                      id="organization"
                      type="text"
                      name="organization"
                      className="form-input"
                      placeholder="e.g. Dept of Civil & Environmental Engineering"
                      value={formData.organization}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="skills">Research Domains / Lab Specializations</label>
                    <input
                      id="skills"
                      type="text"
                      name="skills"
                      className="form-input"
                      placeholder="e.g. IoT Water Quality, Solar Pumping, Structural Resilience"
                      value={formData.skills}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* UNIVERSITY HEI COORDINATOR FIELDS */}
              {user.role === 'university_admin' && (
                <>
                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="organization">Higher Education Institution Name *</label>
                    <input
                      id="organization"
                      type="text"
                      name="organization"
                      className="form-input"
                      placeholder="e.g. Indian Institute of Technology Madras"
                      value={formData.organization}
                      onChange={handleChange}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group mb-4">
                      <label className="form-label">Institution Type</label>
                      <select
                        className="form-select"
                        name="institutionType"
                        value={formData.institutionType}
                        onChange={handleChange}
                      >
                        <option value="hei">Higher Education Institution (HEI)</option>
                        <option value="research_lab">Research Laboratory</option>
                      </select>
                    </div>
                    <div className="form-group mb-4">
                      <label className="form-label" htmlFor="registrationNo">AISHE / NAAC / NIRF ID</label>
                      <input
                        id="registrationNo"
                        type="text"
                        name="registrationNo"
                        className="form-input"
                        placeholder="e.g. U-0123 / NAAC A++"
                        value={formData.registrationNo}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="website">Official University Website</label>
                    <input
                      id="website"
                      type="url"
                      name="website"
                      className="form-input"
                      placeholder="https://www.iitm.ac.in"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* INDUSTRY & CSR PARTNER FIELDS */}
              {user.role === 'industry_partner' && (
                <>
                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="organization">Company / Foundation Name *</label>
                    <input
                      id="organization"
                      type="text"
                      name="organization"
                      className="form-input"
                      placeholder="e.g. TechInnovate CSR Foundation"
                      value={formData.organization}
                      onChange={handleChange}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group mb-4">
                      <label className="form-label">Partner Entity Type</label>
                      <select
                        className="form-select"
                        name="institutionType"
                        value={formData.institutionType}
                        onChange={handleChange}
                      >
                        <option value="csr">CSR Foundation / Trust</option>
                        <option value="startup">Startup</option>
                        <option value="msme">MSME</option>
                        <option value="research_lab">Corporate R&D Lab</option>
                        <option value="other">Other Entity</option>
                      </select>
                    </div>
                    <div className="form-group mb-4">
                      <label className="form-label" htmlFor="registrationNo">MCA / CIN / GSTIN</label>
                      <input
                        id="registrationNo"
                        type="text"
                        name="registrationNo"
                        className="form-input"
                        placeholder="e.g. U72200MH2021PTC123456"
                        value={formData.registrationNo}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="website">Corporate / CSR Website</label>
                    <input
                      id="website"
                      type="url"
                      name="website"
                      className="form-input"
                      placeholder="https://techinnovate.in/csr"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* EXPERT EVALUATOR FIELDS */}
              {user.role === 'expert' && (
                <>
                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="organization">Affiliated Organization / Industry</label>
                    <input
                      id="organization"
                      type="text"
                      name="organization"
                      className="form-input"
                      placeholder="e.g. Tata Consultancy Services / Global Water Institute"
                      value={formData.organization}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="skills">Evaluation Domains / Specializations</label>
                    <input
                      id="skills"
                      type="text"
                      name="skills"
                      className="form-input"
                      placeholder="e.g. Embedded IoT, CleanTech, Social ROI, Regulatory Compliance"
                      value={formData.skills}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* CITIZEN & COMMUNITY FIELDS */}
              {['citizen', 'community', 'admin'].includes(user.role) && (
                <>
                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="organization">Community Group / Resident Association / NGO</label>
                    <input
                      id="organization"
                      type="text"
                      name="organization"
                      className="form-input"
                      placeholder="e.g. Gumla Farmers Cooperative / Gram Vikas NGO"
                      value={formData.organization}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label" htmlFor="interests">Community Priority Issues</label>
                    <input
                      id="interests"
                      type="text"
                      name="interests"
                      className="form-input"
                      placeholder="e.g. Drinking Water, Solar Irrigation, Rural Health Centers"
                      value={formData.interests}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* Avatar Image Selection */}
              <div className="form-group mb-2">
                <label className="form-label">Profile Avatar Image</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                  {PRESET_AVATARS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Avatar option ${i + 1}`}
                      onClick={() => setFormData(p => ({ ...p, avatar: url }))}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        objectFit: 'cover',
                        border: formData.avatar === url ? '3px solid var(--color-primary-500)' : '2px solid transparent',
                        opacity: formData.avatar === url ? 1 : 0.7,
                        transition: 'all 0.15s ease'
                      }}
                    />
                  ))}
                </div>
                <input
                  type="url"
                  name="avatar"
                  className="form-input"
                  placeholder="Or paste custom image URL (https://...)"
                  value={formData.avatar}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* ── Save Action Bar ── */}
          <div
            style={{
              marginTop: 24,
              padding: '16px 24px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={16} color="var(--color-emerald-500)" />
              All changes are committed directly to your database profile record.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Changes to Database
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'security' && (
        <div style={{ maxWidth: 540 }}>
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ padding: 8, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-rose-500)' }}>
                <KeyRound size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Change Password</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enhance your account credentials</span>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="currPass">Current Password *</label>
                <input
                  id="currPass"
                  type="password"
                  className="form-input"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData(p => ({ ...p, currentPassword: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label" htmlFor="newPass">New Password *</label>
                <input
                  id="newPass"
                  type="password"
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={passData.newPassword}
                  onChange={(e) => setPassData(p => ({ ...p, newPassword: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group mb-6">
                <label className="form-label" htmlFor="confPass">Confirm New Password *</label>
                <input
                  id="confPass"
                  type="password"
                  className="form-input"
                  placeholder="Re-enter new password"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                {passLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
