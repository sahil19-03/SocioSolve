/**
 * AI Challenge Recommendation Engine
 * Uses TF-IDF cosine similarity to match student skills/interests with challenge descriptions
 * No external API needed — runs entirely in Node.js
 */

/**
 * Build a term frequency map from a list of words/phrases
 */
function buildTermFrequency(tokens) {
  const tf = {};
  tokens.forEach(token => {
    const t = token.toLowerCase().trim();
    if (t) tf[t] = (tf[t] || 0) + 1;
  });
  return tf;
}

/**
 * Compute cosine similarity between two TF maps
 */
function cosineSimilarity(tfA, tfB) {
  const allTerms = new Set([...Object.keys(tfA), ...Object.keys(tfB)]);
  let dotProduct = 0, magA = 0, magB = 0;

  allTerms.forEach(term => {
    const a = tfA[term] || 0;
    const b = tfB[term] || 0;
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  });

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Tokenize text: lowercase, split by non-alphanumeric, remove short words
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[\s,;.!?\-_/\\]+/)
    .filter(w => w.length > 2);
}

/**
 * Get AI-recommended challenges for a student
 * @param {Object} student - { skills: [], interests: [], bio: '' }
 * @param {Array} challenges - Array of Challenge objects
 * @param {number} topN - Number of recommendations to return
 */
function getRecommendations(student, challenges, topN = 6) {
  // Build student profile vector
  const studentTokens = [
    ...(student.skills || []),
    ...(student.interests || []),
    ...tokenize(student.bio || ''),
    ...tokenize(student.university || '')
  ];

  const studentTF = buildTermFrequency(studentTokens);

  // Score each challenge
  const scored = challenges.map(challenge => {
    const challengeTokens = [
      ...tokenize(challenge.title),
      ...tokenize(challenge.description),
      ...(challenge.tags || []),
      ...(challenge.requiredSkills || []),
      challenge.category ? [challenge.category.replace(/_/g, ' ')] : []
    ].flat();

    const challengeTF = buildTermFrequency(challengeTokens);
    const similarity = cosineSimilarity(studentTF, challengeTF);
    const matchPercent = Math.round(similarity * 100);

    return {
      challenge,
      matchPercent: Math.min(matchPercent + 30, 99), // normalize to meaningful range
      rawScore: similarity
    };
  });

  // Sort by score, return topN
  return scored
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, topN)
    .map(({ challenge, matchPercent }) => ({ ...challenge.toJSON(), matchPercent }));
}

module.exports = { getRecommendations };
