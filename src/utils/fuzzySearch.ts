/**
 * Fast, lightweight fuzzy matching and scoring algorithm.
 * Handles typos, subsequence matching, token permutations, and case-insensitivity.
 */

export interface FuzzyMatchResult {
  isMatch: boolean;
  score: number; // Higher is better
  highlightRanges?: [number, number][]; // [start, end] indices for matched substrings
}

export function fuzzyMatch(text: string, query: string): FuzzyMatchResult {
  if (!query || !query.trim()) {
    return { isMatch: true, score: 1 };
  }

  const t = text.toLowerCase();
  const q = query.trim().toLowerCase();

  // 1. Exact match bonus
  if (t === q) {
    return { isMatch: true, score: 1000 };
  }

  // 2. Starts with query bonus
  if (t.startsWith(q)) {
    return { isMatch: true, score: 500 + (100 / (t.length - q.length + 1)) };
  }

  // 3. Substring match bonus
  const subIdx = t.indexOf(q);
  if (subIdx !== -1) {
    const score = 300 - subIdx * 5 + (100 / (t.length - q.length + 1));
    return { isMatch: true, score, highlightRanges: [[subIdx, subIdx + q.length]] };
  }

  // 4. Token-level matching (e.g. "basmati 50kg" matches "1121 Supreme Aged Basmati Rice ... 50kg")
  const tokens = q.split(/\s+/).filter(Boolean);
  let allTokensMatch = true;
  let tokenScore = 0;
  const highlightRanges: [number, number][] = [];

  for (const token of tokens) {
    const idx = t.indexOf(token);
    if (idx !== -1) {
      tokenScore += 50 + (10 / (idx + 1));
      highlightRanges.push([idx, idx + token.length]);
    } else {
      // Subsequence check for the token
      let tIdx = 0;
      let matchedChars = 0;
      for (let i = 0; i < token.length; i++) {
        const char = token[i];
        const nextIdx = t.indexOf(char, tIdx);
        if (nextIdx !== -1) {
          matchedChars++;
          tIdx = nextIdx + 1;
        }
      }
      if (matchedChars / token.length >= 0.7) {
        tokenScore += 20 * (matchedChars / token.length);
      } else {
        allTokensMatch = false;
      }
    }
  }

  if (allTokensMatch && tokens.length > 0) {
    return { isMatch: true, score: 150 + tokenScore, highlightRanges };
  }

  // 5. General Subsequence Fuzzy Match with penalty for gaps
  let tPointer = 0;
  let qPointer = 0;
  let consecutiveMatches = 0;
  let seqScore = 0;

  while (tPointer < t.length && qPointer < q.length) {
    if (t[tPointer] === q[qPointer]) {
      qPointer++;
      consecutiveMatches++;
      seqScore += 10 + consecutiveMatches * 4;
    } else {
      consecutiveMatches = 0;
      seqScore -= 1;
    }
    tPointer++;
  }

  if (qPointer === q.length) {
    return { isMatch: true, score: Math.max(10, seqScore) };
  }

  return { isMatch: false, score: 0 };
}

/**
 * Score a multi-attribute item against a query string.
 */
export function scoreItem(fields: { text: string; weight: number }[], query: string): number {
  let totalScore = 0;
  let hasAnyMatch = false;

  for (const { text, weight } of fields) {
    if (!text) continue;
    const match = fuzzyMatch(text, query);
    if (match.isMatch && match.score > 0) {
      hasAnyMatch = true;
      totalScore += match.score * weight;
    }
  }

  return hasAnyMatch ? totalScore : 0;
}
