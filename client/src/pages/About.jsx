import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export default function About() {
  return (
    <div style={{ padding: '56px 0 96px' }}>
      <div className="container" style={{ maxWidth: 1040 }}>

        {/* ─── Hero Header ─── */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 9999,
            padding: '6px 18px',
            marginBottom: 16
          }}>
            <Sparkles size={15} color="#60a5fa" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#93c5fd' }}>
              National Innovation Network
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)',
            fontWeight: 800,
            marginBottom: 18,
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-outfit)'
          }}>
            What is <span style={{ color: 'var(--color-primary-400)' }}>SocioSolve</span>?
          </h1>

          <p className="text-secondary" style={{
            fontSize: '1.2rem',
            maxWidth: 720,
            margin: '0 auto',
            lineHeight: 1.7
          }}>
            SocioSolve is a national platform connecting <strong>real grassroots civic problems</strong> directly with <strong>university engineering talent</strong> to build verified, scalable technology prototypes.
          </p>
        </div>

        {/* ─── In A Nutshell: 3-Step Flow ─── */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span className="badge badge-purple" style={{ marginBottom: 8 }}>In a Nutshell</span>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 800 }}>How the Platform Connects the Dots</h3>
            <p className="text-secondary" style={{ maxWidth: 580, margin: '0 auto', fontSize: '0.95rem' }}>
              A continuous 3-stage lifecycle from local civic intake to deployed technical prototype.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', borderTop: '3px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '2rem' }}>📢</span>
                <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>Step 01</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>1. Civic Problem Intake</h4>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
                Citizens, local municipalities, and NGOs submit real community challenges — from drinking water testing to traffic bottleneck automation.
              </p>
            </div>

            <div className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', borderTop: '3px solid #a855f7' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '2rem' }}>⚡</span>
                <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>Step 02</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>2. AI Matching &amp; R&amp;D</h4>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
                Our TF-IDF AI engine matches technical requirements to university student engineering teams across IoT, AI, and robotics faculties.
              </p>
            </div>

            <div className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', borderTop: '3px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '2rem' }}>🚀</span>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>Step 03</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>3. Evaluation &amp; Pilots</h4>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
                Prototypes undergo expert rubric evaluation and community voting. Top solutions receive seed grants and are deployed into field pilots.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Why SocioSolve? The Contrast Matrix ─── */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span className="badge badge-cyan" style={{ marginBottom: 8 }}>The Difference</span>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Why Not Just Another Complaint Portal?</h3>
            <p className="text-secondary" style={{ maxWidth: 620, margin: '0 auto', fontSize: '0.95rem' }}>
              How SocioSolve turns dead-end complaint tickets into active engineering breakthroughs.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 24,
            alignItems: 'stretch'
          }}>
            {/* Column 1: Traditional Portals */}
            <div className="card" style={{
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              borderTop: '4px solid #ef4444'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem'
                }}>
                  ❌
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Traditional Portals
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Surface-Level Maintenance
                  </span>
                </div>
              </div>

              {/* 4 Rich Comparative Aspects */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f87171', marginBottom: 4 }}>
                    1. Problem Framing
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Treated as simple repair tickets (e.g., fill pothole, clear drain) with zero investigation into recurring root causes.
                  </div>
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f87171', marginBottom: 4 }}>
                    2. Solving Power
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Piled onto overloaded municipal departments and slow contractor tenders without technical R&amp;D capabilities.
                  </div>
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f87171', marginBottom: 4 }}>
                    3. Technology Depth
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Quick manual patches that fail repeatedly within months because the systemic infrastructure remains unaddressed.
                  </div>
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f87171', marginBottom: 4 }}>
                    4. Community Outcome
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Closed bureaucratic loop where citizens submit complaints into a black hole with no feedback or innovation.
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: SocioSolve Platform */}
            <div className="card" style={{
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              borderTop: '4px solid var(--color-primary-500)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem'
                }}>
                  ✨
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    The SocioSolve Platform
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-400)', fontWeight: 600 }}>
                    Systemic Engineering Pipeline
                  </span>
                </div>
              </div>

              {/* 4 Rich Comparative Aspects */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary-400)', marginBottom: 4 }}>
                    1. Problem Framing
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Formulated as open-ended engineering challenges — like solar IoT telemetry, water purity sensors, or AI vision models.
                  </div>
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary-400)', marginBottom: 4 }}>
                    2. Solving Power
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    AI matches technical requirements to multidisciplinary student innovator teams guided by university faculty researchers.
                  </div>
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary-400)', marginBottom: 4 }}>
                    3. Technology Depth
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Rigorous hardware testbeds, embedded firmware, sensor arrays, and production software designed for long-term reliability.
                  </div>
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary-400)', marginBottom: 4 }}>
                    4. Community Outcome
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Transparent expert rubrics, community upvoting, competitive seed funding, and pilot deployment in local districts.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Who Is This For? ─── */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span className="badge badge-emerald" style={{ marginBottom: 8 }}>Ecosystem</span>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Who SocioSolve Is Built For</h3>
            <p className="text-secondary" style={{ maxWidth: 580, margin: '0 auto', fontSize: '0.95rem' }}>
              Bringing all three pillars of national innovation together onto one platform.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
              <div style={{ fontSize: '2.2rem' }}>🏘️</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Citizens &amp; Municipalities</h4>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
                Submit chronic community problems and connect directly with engineering colleges to build working technology solutions.
              </p>
              <Link to="/submit-challenge" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                Submit a Problem &rarr;
              </Link>
            </div>

            <div className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
              <div style={{ fontSize: '2.2rem' }}>🎓</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Students &amp; Innovators</h4>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
                Build high-value capstone prototypes on real-world civic challenges, assemble multidisciplinary teams, and win seed grants.
              </p>
              <Link to="/explore" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                Explore Challenges &rarr;
              </Link>
            </div>

            <div className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
              <div style={{ fontSize: '2.2rem' }}>🔬</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Faculty &amp; Industry</h4>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
                Supervise lab R&amp;D, review milestone deliverables, and bridge student innovations into corporate CSR testbed deployments.
              </p>
              <Link to="/industry" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                Industry Portal &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Bottom Call to Action ─── */}
        <div className="card" style={{
          padding: 'clamp(44px, 5vw, 64px) clamp(24px, 4vw, 48px)',
          textAlign: 'center',
          background: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.14) 0%, var(--bg-card) 80%)',
          borderColor: 'rgba(59,130,246,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--card-shadow)'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.85rem, 3.5vw, 2.3rem)',
            fontWeight: 800,
            marginBottom: 14,
            textAlign: 'center',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-outfit)',
            letterSpacing: '-0.01em'
          }}>
            Ready to Explore SocioSolve?
          </h2>
          <p className="text-secondary" style={{
            maxWidth: 580,
            margin: '0 auto 28px',
            fontSize: '1.05rem',
            lineHeight: 1.65,
            textAlign: 'center'
          }}>
            Browse active civic engineering challenges or post a real problem statement that needs an innovative tech solution.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/explore" className="btn btn-primary btn-md">
              Browse Challenges <ArrowRight size={16} />
            </Link>
            <Link to="/submit-challenge" className="btn btn-secondary btn-md">
              Submit a Problem
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

