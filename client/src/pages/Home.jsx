import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChallengeCard from '../components/ChallengeCard';
import HomeDashboardView from '../components/HomeDashboardView';
import HowItWorksWorkflow from '../components/HowItWorksWorkflow';
import {
  Sparkles, ArrowRight, Lightbulb, Compass,
  Users, ShieldCheck, Cpu, Rocket
} from 'lucide-react';

export default function Home() {
  const { user, isLoggedIn } = useAuth();
  const [featuredChallenges, setFeaturedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats] = useState({ challenges: 28, teams: 94, solutions: 65, mentors: 32 });

  useEffect(() => {
    api.get('/challenges?limit=6')
      .then(res => { if (res.success && res.data) setFeaturedChallenges(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { id: 'smart_city',      icon: '🏙️', name: 'Smart City',        desc: 'Urban congestion, public transit, smart lighting' },
    { id: 'water',           icon: '💧', name: 'Water & Sanitation', desc: 'Groundwater monitoring, leak detection, purity' },
    { id: 'environment',     icon: '🌱', name: 'Environment',        desc: 'Air quality, green spaces, carbon tracking' },
    { id: 'agriculture',     icon: '🌾', name: 'Agriculture',        desc: 'Crop disease detection, smallholder IoT' },
    { id: 'healthcare',      icon: '🏥', name: 'Healthcare',         desc: 'Telemedicine, supply triage, elderly care' },
    { id: 'education',       icon: '🎓', name: 'Education',          desc: 'Adaptive learning, localized tutoring tools' },
    { id: 'waste_management',icon: '🚮', name: 'Waste Management',   desc: 'E-waste logistics, segregation automation' },
    { id: 'public_safety',   icon: '🚦', name: 'Public Safety',      desc: 'Emergency response, pedestrian protection' },
  ];


  return (
    <div>
      {/* ─── Hero / Dashboard Command Center ─── */}
      {isLoggedIn && user ? (
        <HomeDashboardView user={user} />
      ) : (
        <section style={{
          position: 'relative',
          padding: '110px 0 90px',
          background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.18) 0%, transparent 65%)',
          borderBottom: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}>
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(139,92,246,0.07)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(6,182,212,0.07)', filter: 'blur(60px)', pointerEvents: 'none' }} />

          <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            {/* Pill badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 9999, padding: '6px 18px', marginBottom: 28 }}>
              <Sparkles size={16} color="#60a5fa" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#93c5fd' }}>
                Community-Powered Problem Solving
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4.2rem)', fontWeight: 800, marginBottom: 24, lineHeight: 1.12, letterSpacing: '-0.03em' }}>
              Turn Real-World Problems<br />
              into <span className="text-gradient">Tech-Driven Solutions</span>
            </h1>

            <p className="text-secondary" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: 720, margin: '0 auto 40px', lineHeight: 1.7 }}>
              SocioSolve bridges communities, innovators, mentors, and evaluators on a single platform — so every societal challenge finds a team ready to solve it.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 72 }}>
              <Link to="/explore" className="btn btn-primary btn-lg">
                Explore Open Challenges <ArrowRight size={18} />
              </Link>
              <Link to="/submit-challenge" className="btn btn-secondary btn-lg">
                Submit a Real-World Problem
              </Link>
            </div>

            {/* Stats strip */}
            <div className="card" style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 40px', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 28, textAlign: 'center' }}>
                <div>
                  <div className="font-outfit text-gradient" style={{ fontSize: '2.4rem', fontWeight: 800 }}>{stats.challenges}+</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 4 }}>Active Challenges</div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)' }}>
                  <div className="font-outfit" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#67e8f9' }}>{stats.teams}+</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 4 }}>Innovator Teams</div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)' }}>
                  <div className="font-outfit" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#c4b5fd' }}>{stats.solutions}+</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 4 }}>Solutions Submitted</div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)' }}>
                  <div className="font-outfit text-emerald" style={{ fontSize: '2.4rem', fontWeight: 800 }}>{stats.mentors}+</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 4 }}>Mentors & Experts</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Value Proposition ─── */}
      <section style={{ padding: '72px 0', background: 'rgba(8,15,38,0.4)' }}>
        <div className="container">
          <div className="card" style={{ padding: '40px 48px', background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(59,130,246,0.25)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 28, alignItems: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                🎯
              </div>
              <div>
                <h3 style={{ fontSize: '1.45rem', marginBottom: 10, color: 'var(--text-primary)' }}>
                  Innovation Challenges — Not Simple Complaint Tickets
                </h3>
                <p className="text-secondary" style={{ fontSize: '1rem', lineHeight: 1.7 }}>
                  SocioSolve is engineered for <strong>systemic, open-ended civic bottlenecks</strong> that require interdisciplinary solutions — sensor instrumentation, AI vision models, and student-led R&D — connecting real problems directly with engineering capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works (Connected Interactive Workflow) ─── */}
      <HowItWorksWorkflow />

      {/* ─── Featured Challenges ─── */}
      <section style={{ padding: '96px 0', background: 'rgba(8,15,38,0.4)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: 12 }}>Live Now</span>
              <h2 style={{ fontSize: '2.2rem', marginBottom: 8 }}>Featured Challenges</h2>
              <p className="text-secondary" style={{ fontSize: '1rem' }}>Verified real-world problems actively seeking tech-driven solutions.</p>
            </div>
            <Link to="/explore" className="btn btn-outline btn-sm">
              View All Challenges <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 28 }}>
              {[1, 2, 3].map(n => (
                <div key={n} className="card p-6" style={{ height: 280 }}>
                  <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 28, width: '90%', marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 64, width: '100%', marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 16, width: '60%' }} />
                </div>
              ))}
            </div>
          ) : featuredChallenges.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 28 }}>
              {featuredChallenges.map(c => <ChallengeCard key={c.id} challenge={c} />)}
            </div>
          ) : (
            <div className="card p-8" style={{ textAlign: 'center' }}>
              <Lightbulb size={48} color="#60a5fa" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ marginBottom: 8 }}>No Challenges Yet</h3>
              <p className="text-secondary">Be the first to submit a real-world problem and spark innovation!</p>
              <Link to="/submit-challenge" className="btn btn-primary" style={{ marginTop: 20 }}>
                Submit a Challenge
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section style={{ padding: '96px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="badge badge-emerald" style={{ marginBottom: 12 }}>Explore by Domain</span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: 12 }}>Find Your Focus Area</h2>
            <p className="text-secondary" style={{ maxWidth: 640, margin: '0 auto', fontSize: '1rem', lineHeight: 1.6 }}>
              From smart cities to healthcare & agriculture — pick a sector matching your passion and technical background.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/explore?category=${cat.id}`}
                className="card card-lift p-6"
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <div style={{ fontSize: '2.2rem' }}>{cat.icon}</div>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{cat.name}</h4>
                <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: 1.55, flex: 1 }}>{cat.desc}</p>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-primary-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Browse Domain &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section style={{ padding: '96px 0', background: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.14) 0%, transparent 70%)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 880 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', margin: '0 auto 24px' }}>🚀</div>
          <h2 style={{ fontSize: '2.4rem', marginBottom: 18 }}>Ready to Make a Real Difference?</h2>
          <p className="text-secondary" style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: 36 }}>
            Whether you have a challenge that needs solving, skills to contribute, or expertise to share — the SocioSolve community is waiting for you.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Create Your Account</Link>
            <Link to="/about" className="btn btn-secondary btn-lg">Learn More About SocioSolve</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
