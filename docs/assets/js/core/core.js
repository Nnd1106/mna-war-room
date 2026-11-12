/* ---------------------------------------------------------------------
 * core.js: seeded randomness and small helpers shared by every engine.
 * Runs unchanged in the browser and under Node (tests/run.js).
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR = root.WR || {};
  WR.sim = WR.sim || {};
  WR.data = WR.data || { files: {} };
  WR.ui = WR.ui || {};

  /* ---------------- seeded RNG ---------------- */
  function hash(str) {
    let h = 1779033703 ^ String(str).length;
    for (let i = 0; i < String(str).length; i++) {
      h = Math.imul(h ^ String(str).charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }

  function make(seed) {
    let a = (typeof seed === 'number' ? seed : hash(seed)) >>> 0;
    const next = function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const rng = {
      next,
      range: (lo, hi) => lo + (hi - lo) * next(),
      int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
      chance: (p) => next() < p,
      pick: (arr) => arr[Math.floor(next() * arr.length)],
      normal: (mu = 0, sd = 1) => {
        let u = 0, v = 0;
        while (u === 0) u = next();
        while (v === 0) v = next();
        return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      },
      shuffle: (arr) => {
        const out = arr.slice();
        for (let i = out.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          [out[i], out[j]] = [out[j], out[i]];
        }
        return out;
      },
    };
    return rng;
  }

  WR.rng = { hash, make, sub: (seed, label) => make(hash(seed + '::' + label)) };

  /* ---------------- helpers ---------------- */
  const U = WR.util = {
    clamp: (x, lo, hi) => Math.max(lo, Math.min(hi, x)),
    sum: (arr) => arr.reduce((s, x) => s + x, 0),
    mean: (arr) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0),
    round: (x, dp = 0) => { const k = Math.pow(10, dp); return Math.round(x * k) / k; },
    lerp: (a, b, t) => a + (b - a) * t,
    val: (v, ...args) => (typeof v === 'function' ? v(...args) : v),
    /** Internal rate of return of yearly cash flows by bisection; null without a sign change. */
    irr: (flows) => {
      const npv = (r) => flows.reduce((s, cf, t) => s + cf / Math.pow(1 + r, t), 0);
      let lo = -0.99, hi = 10, fLo = npv(lo);
      const fHi = npv(hi);
      if (!Number.isFinite(fLo) || !Number.isFinite(fHi) || fLo * fHi > 0) return null;
      for (let i = 0; i < 200; i++) {
        const mid = 0.5 * (lo + hi), fMid = npv(mid);
        if (fMid === 0 || hi - lo < 1e-12) return mid;
        if (fLo * fMid < 0) hi = mid; else { lo = mid; fLo = fMid; }
      }
      return 0.5 * (lo + hi);
    },
    newSeed: () => {
      const words = ['AMBER', 'BRAVO', 'CEDAR', 'DELTA', 'EMBER', 'FALCON', 'GRANITE', 'HARBOR', 'INDIGO', 'JADE',
        'KESTREL', 'LOTUS', 'MERIDIAN', 'NOVA', 'ONYX', 'PIVOT', 'QUARTZ', 'RAVEN', 'SABLE', 'TIDAL', 'UMBRA', 'VECTOR', 'WILLOW', 'ZENITH'];
      return words[Math.floor(Math.random() * words.length)] + '-' + String(Math.floor(1000 + Math.random() * 9000));
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
