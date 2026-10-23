import React, { useState, useEffect } from 'react';
import { api, utils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Handshake, Building2, ArrowRight, Plus, CheckCircle2, Clock, Award, ShieldCheck, Sparkles } from 'lucide-react';

const PARTNERSHIP_TYPES = [
  { id: 'mentoring',           label: 'Mentoring',            icon: '🎓', desc: 'Provide domain expertise and guidance to student teams' },
  { id: 'funding',             label: 'Funding / Grant',      icon: '💰', desc: 'Provide financial support for R&D or prototyping' },
  { id: 'prototyping',         label: 'Prototyping Support',  icon: '🔧', desc: 'Offer facilities, equipment, or technical help for building prototypes' },
  { id: 'csr',                 label: 'CSR Initiative',       icon: '🌱', desc: 'Support as part of your Corporate Social Responsibility programme' },
  { id: 'technology_transfer', label: 'Technology Transfer',  icon: '🔄', desc: 'License or transfer technology to deploy at scale' },
  { id: 'co_development',      label: 'Co-Development',       icon: '🤝', desc: 'Jointly develop the solution alongside the student team' },
  { id: 'pilot_implementation',label: 'Pilot Implementation', icon: '🚀', desc: 'Host or fund the deployment of a pilot programme' },
];

const STATUS_BADGE = {
  proposed:     { class: 'badge-blue',    label: 'Proposed' },
  under_review: { class: 'badge-amber',   label: 'Under Review' },
  accepted:     { class: 'badge-emerald', label: 'Accepted' },
  active:       { class: 'badge-cyan',    label: 'Active' },
  completed:    { class: 'badge-purple',  label: 'Completed' },
  rejected:     { class: 'badge-rose',    label: 'Rejected' },
};

export default function IndustryPortal() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('browse'); // 'browse' | 'certified' | 'my' | 'propose'
  const [challenges, setChallenges] = useState([]);
  const [partnerships, setPartnerships] = useState([]);
  const [certifiedPrototypes, setCertifiedPrototypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Propose form
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [partnerType, setPartnerType] = useState('mentoring');
  const [proposal, setProposal] = useState('');
  const [fundingAmount, setFundingAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chRes, ptRes, protoRes] = await Promise.all([
          api.get('/industry/challenges'),
          api.get('/industry/partnerships'),
          api.get('/industry/certified-prototypes')
        ]);
        if (chRes.success) setChallenges(chRes.data);
        if (ptRes.success) setPartnerships(ptRes.data);
        if (protoRes.success) setCertifiedPrototypes(protoRes.data || []);
      } catch (err) { console.warn(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handlePropose = async () => {
    if (!selectedChallenge || !proposal) return toast.error('Please select a challenge and describe your proposal');
    setSubmitting(true);
    try {
      const res = await api.post('/industry/partnerships', {
        challengeId: selectedChallenge,
        type: partnerType,
        proposal,
        fundingAmount: fundingAmount ? parseFloat(fundingAmount) : null
      });
      if (res.success) {
        setPartnerships(prev => [res.data, ...prev]);
        setTab('my');
        toast.success('Partnership proposal submitted! Our team will review and respond.');
        setProposal(''); setFundingAmount(''); setSelectedChallenge('');
      }
    } catch (err) { toast.error(err.message); }
    setSubmitting(false);
  };

  return (
    <div className="dashboard-container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="badge badge-amber" style={{ marginBottom: 14 }}>Industry & Innovation Partners</span>
          <h1 style={{ fontSize: '2.4rem', marginBottom: 14 }}>Industry Partnership Portal</h1>
          <p className="text-secondary" style={{ fontSize: '1.05rem', maxWidth: 680, margin: '0 auto', lineHeight: 1.7 }}>
            Connect your organisation's expertise, resources, and CSR goals with university teams solving real societal challenges across India.
          </p>
        </div>

        {/* Partnership Types Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18, marginBottom: 56 }}>
          {PARTNERSHIP_TYPES.map(pt => (
            <div key={pt.id} className="card card-lift p-5" style={{ cursor: 'pointer' }} onClick={() => { setPartnerType(pt.id); setTab('propose'); }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>{pt.icon}</div>
              <h4 style={{ fontSize: '1rem', marginBottom: 6 }}>{pt.label}</h4>
              <p className="text-secondary" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{pt.desc}</p>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-400)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
                Get Started <ArrowRight size={14} />
              </span>
            </div>
          ))}
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, borderBottom: '1px solid var(--border-color)', paddingBottom: 0, overflowX: 'auto' }}>
          {[
            ['browse', '🔍 Browse Challenges'],
            ['certified', `⭐ Certified Prototypes ${certifiedPrototypes.length > 0 ? `(${certifiedPrototypes.length})` : ''}`],
            ['propose', '➕ Propose Partnership'],
            ['my', `📋 My Partnerships ${partnerships.length > 0 ? `(${partnerships.length})` : ''}`]
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className="btn btn-ghost btn-sm" style={{
              borderRadius: '8px 8px 0 0',
              borderBottom: tab === id ? '2px solid var(--color-primary-500)' : '2px solid transparent',
              color: tab === id ? 'var(--color-primary-400)' : 'var(--text-secondary)',
              fontWeight: tab === id ? 700 : 500,
              paddingBottom: 12,
              whiteSpace: 'nowrap'
            }}>{label}</button>
          ))}
        </div>

        {/* Browse Tab */}
        {tab === 'browse' && (
          loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {[1,2,3].map(n => <div key={n} className="card p-6" style={{ height: 180 }}><div className="skeleton" style={{ height: '100%' }} /></div>)}
            </div>
          ) : challenges.length === 0 ? (
            <div className="card p-8" style={{ textAlign: 'center' }}>
              <Building2 size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
              <h3>No Open Challenges</h3>
              <p className="text-muted">Challenges will appear here once published by admins.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {challenges.map(ch => (
                <div key={ch.id} className="card card-lift p-6">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{utils.categoryLabel(ch.category)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {ch.state && `📍 ${ch.district ? ch.district + ', ' : ''}${ch.state}`}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1rem', marginBottom: 8, lineHeight: 1.4 }}>{ch.title}</h4>
                  <p className="text-secondary" style={{ fontSize: '0.825rem', lineHeight: 1.5, marginBottom: 14 }}>
                    {ch.description?.slice(0, 120)}...
                  </p>
                  {ch.requiredSkills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                      {ch.requiredSkills.slice(0, 3).map(s => <span key={s} className="skill-chip">{s}</span>)}
                    </div>
                  )}
                  <button className="btn btn-outline btn-sm w-full" onClick={() => { setSelectedChallenge(ch.id); setTab('propose'); }}>
                    <Handshake size={14} /> Propose Partnership
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Certified Prototypes Tab */}
        {tab === 'certified' && (
          loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {[1, 2, 3].map(n => <div key={n} className="card p-6" style={{ height: 220 }}><div className="skeleton" style={{ height: '100%' }} /></div>)}
            </div>
          ) : certifiedPrototypes.length === 0 ? (
            <div className="card p-8" style={{ textAlign: 'center' }}>
              <Award size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
              <h3>No Certified Prototypes Yet</h3>
              <p className="text-muted">Prototypes evaluated and certified by domain experts will appear here for CSR funding, pilot sponsorship, and technology transfer.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {certifiedPrototypes.map(sol => (
                <div key={sol.id} className="card card-lift p-6" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className="badge badge-amber" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Award size={12} /> Score: {sol.compositeScore ?? 85}/100
                      </span>
                      {sol.pilotReadinessCertified && (
                        <span className="badge badge-emerald" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ShieldCheck size={12} /> Pilot Certified
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '1.05rem', marginBottom: 6, lineHeight: 1.4 }}>
                      {sol.title || `${sol.Challenge?.title} Solution`}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                      Challenge: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{sol.Challenge?.title}</span>
                    </div>

                    <p className="text-secondary" style={{ fontSize: '0.825rem', lineHeight: 1.5, marginBottom: 14 }}>
                      {sol.description?.slice(0, 140)}...
                    </p>

                    {/* Rubric Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '10px 12px', background: 'var(--bg-glass)', borderRadius: 8, marginBottom: 16 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Technical</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>{sol.technicalScore ?? (sol.feasibilityScore ? sol.feasibilityScore * 10 : 80)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Impact</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>{sol.socialImpactScore ?? (sol.impactScore ? sol.impactScore * 10 : 80)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Readiness</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>{sol.deploymentReadinessScore ?? (sol.innovationScore ? sol.innovationScore * 10 : 80)}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                      👥 <strong>Team:</strong> {sol.Team?.name || 'Student Team'} {sol.submittedBy?.university ? `(${sol.submittedBy.university})` : ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, fontSize: '0.8rem' }}
                      onClick={() => {
                        setSelectedChallenge(sol.challengeId || sol.Challenge?.id || '');
                        setPartnerType('csr');
                        setProposal(`We would like to propose a CSR grant / sponsorship for the prototype "${sol.title || sol.Challenge?.title}" developed by ${sol.Team?.name || 'the student team'}.`);
                        setTab('propose');
                      }}
                    >
                      🌱 CSR Sponsor
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, fontSize: '0.8rem' }}
                      onClick={() => {
                        setSelectedChallenge(sol.challengeId || sol.Challenge?.id || '');
                        setPartnerType('pilot_implementation');
                        setProposal(`We would like to support or host a field pilot implementation for prototype "${sol.title || sol.Challenge?.title}".`);
                        setTab('propose');
                      }}
                    >
                      🚀 Host Pilot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Propose Tab */}
        {tab === 'propose' && (
          <div className="card p-8" style={{ maxWidth: 700, margin: '0 auto' }}>
            <h3 style={{ marginBottom: 24, fontSize: '1.3rem' }}>Propose a Partnership</h3>

            <div className="form-group">
              <label className="form-label">Select Challenge *</label>
              <select className="form-select" value={selectedChallenge} onChange={e => setSelectedChallenge(e.target.value)}>
                <option value="">-- Choose a challenge --</option>
                {challenges.map(ch => <option key={ch.id} value={ch.id}>{ch.title}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Partnership Type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginTop: 8 }}>
                {PARTNERSHIP_TYPES.map(pt => (
                  <div key={pt.id} onClick={() => setPartnerType(pt.id)} style={{
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    border: partnerType === pt.id ? '1px solid var(--color-primary-500)' : '1px solid var(--border-color)',
                    background: partnerType === pt.id ? 'rgba(59,130,246,0.12)' : 'var(--bg-card)',
                    transition: 'var(--transition-fast)'
                  }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{pt.icon}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: partnerType === pt.id ? 'var(--color-primary-400)' : 'var(--text-primary)' }}>{pt.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Partnership Proposal *</label>
              <textarea className="form-textarea" rows={5} placeholder="Describe what your organisation can offer, your timeline, team, and expected outcomes..." value={proposal} onChange={e => setProposal(e.target.value)} />
            </div>

            {partnerType === 'funding' && (
              <div className="form-group">
                <label className="form-label">Proposed Funding Amount (₹ INR)</label>
                <input type="number" className="form-input" placeholder="e.g. 500000" value={fundingAmount} onChange={e => setFundingAmount(e.target.value)} />
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={handlePropose} disabled={submitting}>
              {submitting ? 'Submitting...' : '🤝 Submit Partnership Proposal'}
            </button>
          </div>
        )}

        {/* My Partnerships Tab */}
        {tab === 'my' && (
          <div>
            {partnerships.length === 0 ? (
              <div className="card p-8" style={{ textAlign: 'center' }}>
                <Handshake size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
                <h3>No Partnerships Yet</h3>
                <p className="text-muted">Your submitted partnership proposals will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {partnerships.map(p => {
                  const badge = STATUS_BADGE[p.status] || STATUS_BADGE.proposed;
                  const pt = PARTNERSHIP_TYPES.find(t => t.id === p.type);
                  return (
                    <div key={p.id} className="card p-6" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'center' }}>
                      <div style={{ fontSize: '2rem' }}>{pt?.icon || '🤝'}</div>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{pt?.label || p.type}</div>
                        <div className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 6 }}>{p.Challenge?.title || 'Challenge'}</div>
                        {p.proposal && <p className="text-muted" style={{ fontSize: '0.8rem' }}>{p.proposal.slice(0, 100)}...</p>}
                        {p.fundingAmount && <div style={{ marginTop: 6, fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>₹{Number(p.fundingAmount).toLocaleString('en-IN')}</div>}
                      </div>
                      <span className={`badge ${badge.class}`}>{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
    </div>
  );
}
