const express = require('express');
const { Challenge, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { getRecommendations } = require('../utils/aiMatcher');
const { Op } = require('sequelize');

const router = express.Router();

// ─── Category keyword map for auto-classification ─────────────────
const CATEGORY_KEYWORDS = {
  smart_city:         ['traffic', 'parking', 'street light', 'public transport', 'bus', 'metro', 'road', 'city', 'urban transport'],
  environment:        ['pollution', 'air quality', 'carbon', 'emission', 'green', 'forest', 'climate', 'biodiversity'],
  water:              ['water', 'groundwater', 'sanitation', 'drainage', 'flood', 'irrigation', 'sewage', 'drinking'],
  agriculture:        ['crop', 'farm', 'agriculture', 'soil', 'fertiliser', 'pesticide', 'harvest', 'farmer', 'kisan'],
  healthcare:         ['health', 'hospital', 'medicine', 'disease', 'patient', 'telemedicine', 'ambulance', 'clinic'],
  education:          ['school', 'education', 'student', 'teacher', 'literacy', 'learning', 'curriculum', 'college'],
  accessibility:      ['disability', 'wheelchair', 'blind', 'deaf', 'accessible', 'ramp', 'barrier'],
  waste_management:   ['waste', 'garbage', 'recycling', 'landfill', 'e-waste', 'plastic', 'segregation'],
  public_safety:      ['crime', 'safety', 'accident', 'emergency', 'fire', 'police', 'disaster'],
  energy:             ['solar', 'energy', 'electricity', 'power', 'renewable', 'wind', 'grid', 'battery'],
  social_welfare:     ['poverty', 'hunger', 'welfare', 'elderly', 'women', 'child', 'migrant', 'homeless'],
  digital_services:   ['digital', 'app', 'portal', 'e-governance', 'online', 'internet', 'connectivity'],
  rural_livelihoods:  ['rural', 'village', 'livelihood', 'MGNREGA', 'SHG', 'tribal', 'artisan'],
  urban_infrastructure: ['building', 'construction', 'infrastructure', 'bridge', 'metro', 'corridor', 'flyover'],
  public_administration: ['government', 'ration', 'panchayat', 'municipality', 'service delivery', 'corruption', 'grievance']
};

// Static list of major Indian HEIs with their domain strengths
const UNIVERSITIES = [
  { id: 'iit_bombay',   name: 'IIT Bombay',          state: 'Maharashtra', domains: ['smart_city','energy','digital_services','urban_infrastructure'] },
  { id: 'iit_delhi',    name: 'IIT Delhi',            state: 'Delhi',       domains: ['healthcare','environment','digital_services','public_safety'] },
  { id: 'iit_madras',   name: 'IIT Madras',           state: 'Tamil Nadu',  domains: ['water','energy','agriculture','rural_livelihoods'] },
  { id: 'iit_kharagpur',name: 'IIT Kharagpur',        state: 'West Bengal', domains: ['agriculture','environment','rural_livelihoods','water'] },
  { id: 'iit_roorkee',  name: 'IIT Roorkee',          state: 'Uttarakhand', domains: ['water','urban_infrastructure','environment','public_safety'] },
  { id: 'iit_guwahati', name: 'IIT Guwahati',         state: 'Assam',       domains: ['rural_livelihoods','agriculture','environment','education'] },
  { id: 'nit_warangal', name: 'NIT Warangal',         state: 'Telangana',   domains: ['smart_city','digital_services','agriculture','energy'] },
  { id: 'bits_pilani',  name: 'BITS Pilani',          state: 'Rajasthan',   domains: ['healthcare','digital_services','smart_city','energy'] },
  { id: 'du',           name: 'University of Delhi',  state: 'Delhi',       domains: ['social_welfare','education','public_administration','healthcare'] },
  { id: 'pune_univ',    name: 'Savitribai Phule Pune University', state: 'Maharashtra', domains: ['agriculture','healthcare','social_welfare','education'] },
  { id: 'au_chennai',   name: 'Anna University',      state: 'Tamil Nadu',  domains: ['smart_city','energy','water','digital_services'] },
  { id: 'bu_bangalore', name: 'Bangalore University', state: 'Karnataka',   domains: ['digital_services','healthcare','social_welfare','education'] },
  { id: 'iit_bhu',      name: 'IIT BHU Varanasi',     state: 'Uttar Pradesh', domains: ['rural_livelihoods','public_administration','social_welfare','water'] },
  { id: 'nit_rourkela', name: 'NIT Rourkela',         state: 'Odisha',      domains: ['agriculture','rural_livelihoods','environment','water'] },
  { id: 'tezpur_univ',  name: 'Tezpur University',    state: 'Assam',       domains: ['rural_livelihoods','environment','agriculture','accessibility'] },
];

/** Simple TF-like keyword match returning a 0–1 score */
function keywordScore(text, keywords) {
  const lower = text.toLowerCase();
  const hits = keywords.filter(kw => lower.includes(kw)).length;
  return hits / keywords.length;
}

// ─── GET /api/ai/recommend — Challenge recommendations ────────────
router.get('/recommend', protect, authorize('student'), async (req, res) => {
  try {
    const challenges = await Challenge.findAll({ where: { status: 'published' } });
    if (challenges.length === 0) {
      return res.json({ success: true, data: [], message: 'No published challenges yet.' });
    }
    const recommendations = getRecommendations(req.user, challenges, 6);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// ─── POST /api/ai/categorize — Auto-classify a challenge ──────────
router.post('/categorize', protect, async (req, res) => {
  try {
    const { title = '', description = '' } = req.body;
    const text = `${title} ${description}`;

    let bestCategory = 'social_welfare';
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const score = keywordScore(text, keywords);
      if (score > bestScore) { bestScore = score; bestCategory = category; }
    }

    res.json({
      success: true,
      data: { suggestedCategory: bestCategory, confidence: Math.round(bestScore * 100) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/ai/deduplicate — Check for duplicate submissions ───
router.post('/deduplicate', protect, async (req, res) => {
  try {
    const { title = '', description = '' } = req.body;
    const inputText = `${title} ${description}`.toLowerCase().split(/\s+/);

    const existing = await Challenge.findAll({
      where: { status: { [Op.ne]: 'rejected' } },
      attributes: ['id', 'title', 'description'],
      limit: 200
    });

    let topMatch = null;
    let topScore = 0;

    for (const ch of existing) {
      const chText = `${ch.title} ${ch.description}`.toLowerCase().split(/\s+/);
      const inputSet = new Set(inputText);
      const chSet    = new Set(chText);
      const intersection = [...inputSet].filter(w => chSet.has(w) && w.length > 3).length;
      const union = new Set([...inputSet, ...chSet]).size;
      const jaccard = union > 0 ? intersection / union : 0;

      if (jaccard > topScore) { topScore = jaccard; topMatch = ch; }
    }

    const isDuplicate = topScore > 0.5;
    res.json({
      success: true,
      data: {
        isDuplicate,
        similarityScore: Math.round(topScore * 100),
        similarChallenge: isDuplicate ? { id: topMatch.id, title: topMatch.title } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/ai/route-university — Match challenge to HEI ───────
router.post('/route-university', protect, authorize('admin'), async (req, res) => {
  try {
    const { challengeId } = req.body;
    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const text = `${challenge.title} ${challenge.description}`;

    // Score each university by domain match + same-state preference
    const scored = UNIVERSITIES.map(uni => {
      const domainMatch = uni.domains.includes(challenge.category) ? 2 : 0;
      const kwScore = uni.domains.reduce((acc, d) => acc + keywordScore(text, CATEGORY_KEYWORDS[d] || []), 0);
      const stateBonus = uni.state === challenge.state ? 1 : 0;
      return { ...uni, score: domainMatch + kwScore + stateBonus };
    });

    scored.sort((a, b) => b.score - a.score);
    const top3 = scored.slice(0, 3).map(({ id, name, state, score }) => ({ id, name, state, score: Math.round(score * 10) / 10 }));

    res.json({ success: true, data: { recommendations: top3, challenge: { id: challenge.id, title: challenge.title, category: challenge.category } } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
