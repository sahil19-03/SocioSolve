import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api, utils } from '../services/api';
import ChallengeCard from '../components/ChallengeCard';
import { Search, Filter, SlidersHorizontal, AlertCircle, PlusCircle, Sparkles, Layers } from 'lucide-react';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const categories = [
    { id: '', label: 'All Domains' },
    { id: 'smart_city', label: '🏙️ Smart City' },
    { id: 'water', label: '💧 Water & Sanitation' },
    { id: 'environment', label: '🌱 Environment' },
    { id: 'agriculture', label: '🌾 Agriculture' },
    { id: 'healthcare', label: '🏥 Healthcare' },
    { id: 'education', label: '🎓 Education' },
    { id: 'waste_management', label: '🚮 Waste Mgmt' },
    { id: 'energy', label: '🔋 Clean Energy' },
    { id: 'public_safety', label: '🚦 Safety & Mobility' },
    { id: 'accessibility', label: '♿ Accessibility' },
  ];

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      if (search.trim()) params.append('search', search.trim());
      params.append('sortBy', sortBy);
      params.append('page', page);
      params.append('limit', 12); // Balanced for 3 or 4 column wide layout

      const res = await api.get(`/challenges?${params.toString()}`);
      if (res.success && res.data) {
        setChallenges(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.pages || 1);
          setTotalCount(res.pagination.total || res.data.length);
        } else {
          setTotalCount(res.data.length);
        }
      }
    } catch (err) {
      console.warn('Could not fetch challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [category, difficulty, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchChallenges();
  };

  const handleCategorySelect = (catId) => {
    setCategory(catId);
    setPage(1);
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setDifficulty('');
    setSortBy('createdAt');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(search || category || difficulty || sortBy !== 'createdAt');

  return (
    <div style={{ padding: '48px 0 96px' }}>
      <div className="container">

        {/* ── Header Title & Stats Strip ────────────────────────── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
          marginBottom: 36
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 9999, padding: '4px 14px', marginBottom: 12 }}>
              <Layers size={14} color="#60a5fa" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#93c5fd' }}>
                Open Societal Catalog
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 3.5vw, 2.8rem)', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Explore <span className="text-gradient">Challenges</span>
            </h1>
            <p className="text-secondary" style={{ maxWidth: 680, fontSize: '1rem', lineHeight: 1.6 }}>
              Discover open, mentor-verified civic problem statements across India. Form a multidisciplinary team or submit a technical solution.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/submit-challenge" className="btn btn-primary">
              <PlusCircle size={16} /> Submit a Problem
            </Link>
          </div>
        </div>

        {/* ── Search & Filter Command Center ───────────────────── */}
        <div className="card p-6" style={{ marginBottom: 36, background: 'var(--bg-card)' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) auto auto', gap: 16, alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 46, height: 44, fontSize: '0.925rem' }}
                placeholder="Search challenges by keyword (e.g. IoT, groundwater, telemedicine, traffic)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Difficulty Filter */}
            <select
              className="form-select"
              style={{ width: 180, height: 44 }}
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            >
              <option value="">Any Difficulty</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Sort Filter */}
            <select
              className="form-select"
              style={{ width: 190, height: 44 }}
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            >
              <option value="createdAt">Newest First</option>
              <option value="teamCount">Most Teams</option>
              <option value="solutionCount">Most Solutions</option>
              <option value="viewCount">Most Viewed</option>
            </select>
          </form>

          {/* Category Filter Chips Bar */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 18, borderTop: '1px solid var(--border-color)', marginTop: 18, alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>
              Domain:
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`btn btn-sm ${category === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.825rem' }}
              >
                {cat.label}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="btn btn-ghost btn-sm"
                style={{ color: '#f43f5e', fontSize: '0.8rem', marginLeft: 'auto' }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* ── Active Status Strip ──────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <div>
            Showing <strong>{challenges.length}</strong> {totalCount ? `of ${totalCount}` : ''} verified challenges
            {category && <span> in <strong>{categories.find(c => c.id === category)?.label}</strong></span>}
          </div>
          <span className="badge badge-outline" style={{ fontSize: 11 }}>
            Page {page} of {totalPages}
          </span>
        </div>

        {/* ── Challenges Grid (Spacious & Breathable) ──────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 28 }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="card p-6" style={{ height: 290 }}>
                <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 28, width: '85%', marginBottom: 14 }} />
                <div className="skeleton" style={{ height: 75, width: '100%', marginBottom: 18 }} />
                <div className="skeleton" style={{ height: 18, width: '50%' }} />
              </div>
            ))}
          </div>
        ) : challenges.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 28 }}>
              {challenges.map((c) => (
                <ChallengeCard key={c.id} challenge={c} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginTop: 56 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  &larr; Previous Page
                </button>
                <span className="text-secondary" style={{ fontSize: '0.9rem', padding: '0 8px' }}>
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  Next Page &rarr;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card p-12 text-center" style={{ maxWidth: 640, margin: '48px auto' }}>
            <AlertCircle size={48} color="#60a5fa" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: 10, fontSize: '1.4rem' }}>No Challenges Found</h3>
            <p className="text-secondary" style={{ marginBottom: 24, lineHeight: 1.6 }}>
              There are no challenges matching your current search term or filter parameters.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleResetFilters}
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
