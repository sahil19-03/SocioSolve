import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Cpu, Users, Award, ArrowRight,
  CheckCircle2, Sparkles, ChevronRight, HelpCircle,
  ShieldCheck, Rocket, Lightbulb
} from 'lucide-react';

const steps = [
  {
    num: '01',
    role: 'FOR CITIZENS & LOCAL BODIES',
    roleBadge: 'badge-blue',
    icon: <FileText size={24} color="#60a5fa" />,
    title: 'Submit Real-World Problem',
    tagline: 'Civic Problem Intake',
    desc: 'Citizens, NGOs, or municipalities submit grassroots bottleneck statements. The admin console verifies scope suitability for open engineering innovation.',
    features: [
      'Locality & district geo-tagging',
      'Admin scope verification',
      'No bureaucratic red tape'
    ],
    actionText: 'Submit Problem',
    actionLink: '/submit-challenge',
    accentColor: '#3b82f6'
  },
  {
    num: '02',
    role: 'FOR STUDENT INNOVATORS',
    roleBadge: 'badge-purple',
    icon: <Cpu size={24} color="#c084fc" />,
    title: 'AI Skill Matching & Teams',
    tagline: 'TF-IDF Compatibility Engine',
    desc: 'Our AI engine compares problem requirements with student skills (IoT, AI, Robotics, GIS) and recommends compatible peers to assemble interdisciplinary teams.',
    features: [
      'TF-IDF skill match percentage',
      'Complementary skill matching',
      'Direct team collaboration hub'
    ],
    actionText: 'Form or Join Team',
    actionLink: '/team-formation',
    accentColor: '#a855f7'
  },
  {
    num: '03',
    role: 'FOR FACULTY & ADVISORS',
    roleBadge: 'badge-emerald',
    icon: <Users size={24} color="#34d399" />,
    title: 'Mentorship & Sprints',
    tagline: 'Milestone Guided Progress',
    desc: 'University professors and domain specialists guide teams through system architecture, lab validation, and structured sprint deliverables.',
    features: [
      'Structured milestone deliverables',
      'Academic rigor & ethics oversight',
      'Live sprint feedback tracking'
    ],
    actionText: 'Explore Challenges',
    actionLink: '/explore',
    accentColor: '#10b981'
  },
  {
    num: '04',
    role: 'FOR INDUSTRY & EVALUATORS',
    roleBadge: 'badge-amber',
    icon: <Award size={24} color="#fbbf24" />,
    title: 'Rubric Evaluation & Scale',
    tagline: 'Verified Real-World Impact',
    desc: 'Standardized evaluation rubrics score technical feasibility, scalability, and societal impact. Top prototypes receive CSR grants and municipal pilot deployment.',
    features: [
      'Multi-criteria scoring rubrics',
      'Community & expert validation',
      'CSR & Industry pilot pipeline'
    ],
    actionText: 'Industry Portal',
    actionLink: '/industry',
    accentColor: '#f59e0b'
  }
];

const caseStudySteps = [
  {
    step: '1',
    stage: 'The Civic Challenge',
    actor: 'Gram Vikas NGO · Nadia District',
    icon: '💧',
    summary: 'High Arsenic Contamination in Tube Wells',
    details: '14 rural villages drinking from unmonitored groundwater. Lab testing takes 3 weeks per sample, delaying vital health warnings.',
    tag: 'Problem Identified'
  },
  {
    step: '2',
    stage: 'AI Matching & Team',
    actor: 'SocioSolve TF-IDF Matcher',
    icon: '🤖',
    summary: 'Team "AquaSense" Formed in 48 Hours',
    details: 'Matched 3 students across Electronics, Environmental Chemistry, and Computer Science who had IoT, spectrometry, and cloud skills.',
    tag: 'Team Assembled'
  },
  {
    step: '3',
    stage: 'Faculty Mentorship',
    actor: 'Prof. S. Mukherjee · Jadavpur Univ.',
    icon: '🔬',
    summary: 'Sensor Architecture & Field Testing',
    details: 'Guide advised team to use optical colorimetric reagent cartridges with low-cost GSM telemetry instead of expensive optical spectrometers.',
    tag: 'Milestone Verified'
  },
  {
    step: '4',
    stage: 'Pilot & Impact',
    actor: 'State Water Authority & CSR Sponsor',
    icon: '🚀',
    summary: '10-Village Autonomous Pilot Deployed',
    details: 'Scored 9.2/10 on the Expert Rubric. Received ₹2.5 Lakh seed grant to install 10 solar telemetry nodes broadcasting live SMS water quality alerts.',
    tag: 'Real-World Solution'
  }
];

export default function HowItWorksWorkflow() {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'casestudy'
  const [activeCaseStep, setActiveCaseStep] = useState(0);

  return (
    <section className="workflow-section">
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: 9999,
            padding: '5px 16px',
            marginBottom: 14
          }}>
            <Sparkles size={14} color="#c084fc" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Step-by-Step Architecture
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: 14, letterSpacing: '-0.02em' }}>
            How <span style={{ color: 'var(--color-primary-400)' }}>SocioSolve</span> Works
          </h2>

          <p className="text-secondary" style={{ maxWidth: 720, margin: '0 auto 28px', fontSize: '1.05rem', lineHeight: 1.7 }}>
            A transparent 4-stage pipeline connecting civic problem holders, student engineering teams, 
            academic mentors, and industrial evaluators.
          </p>

          {/* Interactive Mode Toggle */}
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            padding: 4,
            gap: 4
          }}>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`btn btn-sm ${activeTab === 'pipeline' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.85rem', padding: '6px 18px', borderRadius: 8 }}
            >
              Four-Stage Pipeline
            </button>
            <button
              onClick={() => setActiveTab('casestudy')}
              className={`btn btn-sm ${activeTab === 'casestudy' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.85rem', padding: '6px 18px', borderRadius: 8 }}
            >
              See Real Example (Case Study)
            </button>
          </div>
        </div>

        {/* ── Mode 1: Four-Stage Pipeline (Always 4 Columns on Wide Displays) ── */}
        {activeTab === 'pipeline' && (
          <div>
            {/* Connected Stage Progression Tracker */}
            <div className="workflow-stepper-bar">
              <div className="workflow-stepper-line" />
              <div className="workflow-stepper-nodes">
                {steps.map((st, i) => (
                  <div key={st.num} className="workflow-stepper-node">
                    <div className="workflow-node-circle" style={{ borderColor: st.accentColor }}>
                      <span>{st.num}</span>
                    </div>
                    <span className="workflow-node-label">{st.tagline}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Cards Grid - 4 Columns Across Full Width */}
            <div className="workflow-grid-4">
              {steps.map((s, idx) => (
                <div
                  key={s.num}
                  className="card workflow-card"
                  style={{ '--card-accent': s.accentColor }}
                >
                  {/* Top indicator & Role Tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span className="workflow-num-pill" style={{ color: s.accentColor }}>
                      STAGE {s.num}
                    </span>
                    <div className="workflow-icon-bubble" style={{ background: `${s.accentColor}18`, borderColor: `${s.accentColor}35` }}>
                      {s.icon}
                    </div>
                  </div>

                  <span className={`badge ${s.roleBadge}`} style={{ alignSelf: 'flex-start', fontSize: 10, marginBottom: 10, letterSpacing: '0.04em' }}>
                    {s.role}
                  </span>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: 8, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {s.title}
                  </h3>

                  <p className="text-secondary" style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 18, flex: 1 }}>
                    {s.desc}
                  </p>

                  {/* Feature checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                    {s.features.map((feat, fIdx) => (
                      <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={13} color={s.accentColor} style={{ flexShrink: 0 }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Link */}
                  <Link
                    to={s.actionLink}
                    className="btn btn-secondary btn-sm w-full workflow-action-btn"
                    style={{ justifyContent: 'center', fontSize: '0.825rem' }}
                  >
                    {s.actionText} <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Mode 2: Interactive Real-World Case Study Walkthrough ── */}
        {activeTab === 'casestudy' && (
          <div className="card p-8" style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(139,92,246,0.06) 100%)',
            borderColor: 'rgba(59,130,246,0.28)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <span className="badge badge-emerald" style={{ marginBottom: 8 }}>Case Study Walkthrough</span>
              <h3 style={{ fontSize: '1.6rem', marginBottom: 8 }}>
                How a Village Water Crisis Was Solved in 6 Weeks
              </h3>
              <p className="text-secondary" style={{ maxWidth: 600, margin: '0 auto', fontSize: '0.925rem' }}>
                Follow the journey of a single challenge from citizen submission to funded municipal deployment.
              </p>
            </div>

            {/* Step navigation tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
              {caseStudySteps.map((cs, cIdx) => (
                <button
                  key={cs.step}
                  onClick={() => setActiveCaseStep(cIdx)}
                  className={`card p-4 text-left ${activeCaseStep === cIdx ? 'workflow-case-btn--active' : ''}`}
                  style={{
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    background: activeCaseStep === cIdx ? 'rgba(59,130,246,0.14)' : 'rgba(255,255,255,0.02)',
                    borderColor: activeCaseStep === cIdx ? 'var(--color-primary-500)' : 'var(--border-color)',
                    borderWidth: activeCaseStep === cIdx ? 2 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '1.2rem' }}>{cs.icon}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: activeCaseStep === cIdx ? 'var(--color-primary-400)' : 'var(--text-muted)' }}>
                      STEP 0{cs.step}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {cs.stage}
                  </div>
                </button>
              ))}
            </div>

            {/* Active Stage Detailed Spotlight */}
            <div className="card p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 18,
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.4rem', flexShrink: 0
                }}>
                  {caseStudySteps[activeCaseStep].icon}
                </div>

                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                    <span className="badge badge-blue">{caseStudySteps[activeCaseStep].tag}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Key Stakeholder: <strong>{caseStudySteps[activeCaseStep].actor}</strong>
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.4rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                    {caseStudySteps[activeCaseStep].summary}
                  </h4>

                  <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: 1.65 }}>
                    {caseStudySteps[activeCaseStep].details}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={activeCaseStep === 0}
                    onClick={() => setActiveCaseStep(s => Math.max(0, s - 1))}
                  >
                    &larr; Prev
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={activeCaseStep === caseStudySteps.length - 1}
                    onClick={() => setActiveCaseStep(s => Math.min(caseStudySteps.length - 1, s + 1))}
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
