import React from 'react';
import { Link } from 'react-router-dom';
import { utils } from '../services/api';
import { Users, Lightbulb, Eye, Clock, ArrowUpRight } from 'lucide-react';

export default function ChallengeCard({ challenge, showMatch = false }) {
  const catColor = utils.categoryColor(challenge.category);

  return (
    <Link 
      to={`/challenge/${challenge.id}`} 
      className="card card-lift"
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Category Indicator Accent Line */}
      <div style={{ height: 4, width: '100%', background: catColor }} />

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Top Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="badge badge-blue">
              {utils.categoryLabel(challenge.category)}
            </span>
            <span className={`badge ${utils.difficultyBadge(challenge.difficulty)}`}>
              {challenge.difficulty}
            </span>
          </div>

          {showMatch && challenge.matchPercent ? (
            <span className="match-badge">
              ⚡ {challenge.matchPercent}% match
            </span>
          ) : (
            <span className="text-muted" style={{ display: 'flex', alignItems: 'center', fontSize: 13 }}>
              <ArrowUpRight size={16} />
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1.2rem', marginBottom: 10, color: 'var(--text-primary)', lineHeight: 1.35 }}>
          {challenge.title}
        </h3>

        {/* Description preview */}
        <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: 1.55, marginBottom: 16, flex: 1 }}>
          {challenge.shortDescription || (challenge.description ? challenge.description.slice(0, 140) + '...' : '')}
        </p>

        {/* Required Skills Chips */}
        {challenge.requiredSkills && challenge.requiredSkills.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {challenge.requiredSkills.slice(0, 3).map((skill, i) => (
              <span key={i} className="skill-chip">
                {skill}
              </span>
            ))}
            {challenge.requiredSkills.length > 3 && (
              <span className="skill-chip" style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                +{challenge.requiredSkills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer Stats Row */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: 14, 
          marginTop: 'auto',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={14} /> {challenge.teamCount || 0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Lightbulb size={14} /> {challenge.solutionCount || 0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Eye size={14} /> {challenge.viewCount || 0}
            </span>
          </div>

          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={13} /> {utils.timeAgo(challenge.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
