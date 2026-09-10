import { describe, it, expect } from 'vitest';
import { calculateSrsNextReview, MAX_SRS_INTERVAL } from '@/services/srs.service';

describe('SRS SM-2 Algorithm (calculateSrsNextReview)', () => {
  it('should reset interval to 0 and schedule +10m on "again"', () => {
    const current = { interval: 30, easeFactor: 2.5, repetitions: 5 };
    const result = calculateSrsNextReview(current, 'again');

    expect(result.interval).toBe(0);
    expect(result.repetitions).toBe(0);
    expect(result.status).toBe('learning');
    expect(result.lapseCountDelta).toBe(1);
    expect(result.easeFactor).toBe(2.3);
  });

  it('should gradually progress intervals on "good" (1 -> 3 -> 7 -> ...)', () => {
    // Rep 0 -> 1 day
    let state = { interval: 0, easeFactor: 2.5, repetitions: 0 };
    let res = calculateSrsNextReview(state, 'good');
    expect(res.interval).toBe(1);
    expect(res.repetitions).toBe(1);
    expect(res.status).toBe('reviewing');

    // Rep 1 -> 3 days
    state = { interval: res.interval, easeFactor: res.easeFactor, repetitions: res.repetitions };
    res = calculateSrsNextReview(state, 'good');
    expect(res.interval).toBe(3);
    expect(res.repetitions).toBe(2);

    // Rep 2 -> 7 days
    state = { interval: res.interval, easeFactor: res.easeFactor, repetitions: res.repetitions };
    res = calculateSrsNextReview(state, 'good');
    expect(res.interval).toBe(7);
    expect(res.repetitions).toBe(3);

    // Rep 3 -> 7 * 2.5 = 18 days
    state = { interval: res.interval, easeFactor: res.easeFactor, repetitions: res.repetitions };
    res = calculateSrsNextReview(state, 'good');
    expect(res.interval).toBe(18);
    expect(res.repetitions).toBe(4);

    // Rep 4 -> 18 * 2.5 = 45 days (Mastered >= 21 days)
    state = { interval: res.interval, easeFactor: res.easeFactor, repetitions: res.repetitions };
    res = calculateSrsNextReview(state, 'good');
    expect(res.interval).toBe(45);
    expect(res.repetitions).toBe(5);
    expect(res.status).toBe('mastered');
  });

  it('should never exceed MAX_SRS_INTERVAL even after 8+ successive "easy" reviews', () => {
    let state = { interval: 0, easeFactor: 2.5, repetitions: 0 };

    for (let i = 0; i < 15; i++) {
      const res = calculateSrsNextReview(state, 'easy');
      expect(res.interval).toBeLessThanOrEqual(MAX_SRS_INTERVAL);
      state = { interval: res.interval, easeFactor: res.easeFactor, repetitions: res.repetitions };
    }

    // At the end, interval must be capped at MAX_SRS_INTERVAL (180 days)
    expect(state.interval).toBe(MAX_SRS_INTERVAL);
    expect(state.repetitions).toBe(15);
  });
});
