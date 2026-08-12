import { normalizeText } from "./normalize-text";

export interface ComparisonWord {
  text: string;
  type: "correct" | "wrong" | "missing" | "extra";
}

export interface ComparisonResult {
  accuracy: number;
  correctWords: number;
  wrongWords: number;
  missingWords: number;
  extraWords: number;
  words: ComparisonWord[];
}

export function calculateAccuracy(transcript: string, answer: string): ComparisonResult {
  // Get original words for display
  const rawTranscriptWords = transcript.split(/\s+/).filter(Boolean);
  const rawUserWords = answer.split(/\s+/).filter(Boolean);

  // Get normalized words for matching
  const tWords = rawTranscriptWords.map(w => normalizeText(w));
  const uWords = rawUserWords.map(w => normalizeText(w));

  const M = tWords.length;
  const N = uWords.length;

  if (M === 0) {
    return {
      accuracy: N === 0 ? 100 : 0,
      correctWords: 0,
      wrongWords: 0,
      missingWords: 0,
      extraWords: N,
      words: rawUserWords.map(w => ({ text: w, type: "extra" }))
    };
  }

  // DP table for sequence alignment
  // dp[i][j] stores minimum cost to align tWords[0..i-1] and uWords[0..j-1]
  const dp: number[][] = Array.from({ length: M + 1 }, () => Array(N + 1).fill(0));

  // Initialize base cases
  for (let i = 0; i <= M; i++) dp[i][0] = i; // All deletions
  for (let j = 0; j <= N; j++) dp[0][j] = j; // All insertions

  // Populate DP table
  for (let i = 1; i <= M; i++) {
    for (let j = 1; j <= N; j++) {
      if (tWords[i - 1] === uWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // Cost is 0 for match
      } else {
        const replaceCost = dp[i - 1][j - 1] + 2; // Wrong word
        const deleteCost = dp[i - 1][j] + 1;      // Missing word
        const insertCost = dp[i][j - 1] + 1;      // Extra word
        dp[i][j] = Math.min(replaceCost, deleteCost, insertCost);
      }
    }
  }

  // Traceback to find the alignment path
  let i = M;
  let j = N;
  const alignment: ComparisonWord[] = [];

  let correctCount = 0;
  let wrongCount = 0;
  let missingCount = 0;
  let extraCount = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tWords[i - 1] === uWords[j - 1]) {
      alignment.push({ text: rawTranscriptWords[i - 1], type: "correct" });
      correctCount++;
      i--;
      j--;
    } else {
      const currentCost = dp[i][j];
      
      // Determine which transition was taken
      let isReplace = false;
      let isDelete = false;
      let isInsert = false;

      if (i > 0 && j > 0 && currentCost === dp[i - 1][j - 1] + 2) {
        isReplace = true;
      } else if (i > 0 && currentCost === dp[i - 1][j] + 1) {
        isDelete = true;
      } else if (j > 0 && currentCost === dp[i][j - 1] + 1) {
        isInsert = true;
      } else {
        // Fallbacks in case of ties or float representations
        if (i > 0 && j > 0) isReplace = true;
        else if (i > 0) isDelete = true;
        else if (j > 0) isInsert = true;
      }

      if (isReplace) {
        // Show correct word (or user's word marked wrong)
        alignment.push({ text: `${rawUserWords[j - 1]} (${rawTranscriptWords[i - 1]})`, type: "wrong" });
        wrongCount++;
        i--;
        j--;
      } else if (isDelete) {
        alignment.push({ text: rawTranscriptWords[i - 1], type: "missing" });
        missingCount++;
        i--;
      } else if (isInsert) {
        alignment.push({ text: rawUserWords[j - 1], type: "extra" });
        extraCount++;
        j--;
      }
    }
  }

  alignment.reverse();

  // Calculate accuracy: percentage of correct words relative to the total words in the transcript
  const accuracy = Math.round((correctCount / M) * 100);

  return {
    accuracy,
    correctWords: correctCount,
    wrongWords: wrongCount,
    missingWords: missingCount,
    extraWords: extraCount,
    words: alignment
  };
}
