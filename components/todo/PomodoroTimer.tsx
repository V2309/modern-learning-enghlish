'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, Timer, Flame, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { savePomodoroSessionAction } from '@/actions/pomodoro.action';
import { toast } from 'react-hot-toast';

// ─── Types & Constants ────────────────────────────────────────────────────────

type Mode = 'work' | 'short' | 'long';

const MODES: Record<Mode, { label: string; seconds: number; color: string; ring: string; bg: string }> = {
  work:  { label: 'Tập trung', seconds: 25 * 60, color: 'text-rose-500',    ring: '#f43f5e', bg: 'bg-rose-500/10 border-rose-500/20'    },
  short: { label: 'Nghỉ ngắn', seconds:  5 * 60, color: 'text-emerald-500', ring: '#10b981', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  long:  { label: 'Nghỉ dài',  seconds: 15 * 60, color: 'text-blue-500',    ring: '#3b82f6', bg: 'bg-blue-500/10 border-blue-500/20'    },
};

interface PomodoroStats {
  todaySessions: number;
  todayMinutes: number;
  allTimeSessions: number;
  allTimeMinutes: number;
}

interface Props {
  userId: string;
  initialStats: PomodoroStats;
}

// ─── Persistence (plain functions, no React) ──────────────────────────────────

const LS_KEY = 'linguify_pomodoro_v3';

interface PersistedState {
  mode: Mode;
  /** Wall-clock ms when the timer started counting. null = paused/stopped. */
  startTime: number | null;
  /** Seconds remaining when the timer was last started (or full duration if reset). */
  baseSeconds: number;
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch { return null; }
}

function savePersisted(s: PersistedState) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
}

function clearPersisted() {
  try { localStorage.removeItem(LS_KEY); } catch {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function fmtMins(mins: number) {
  if (mins < 60) return `${mins} phut`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}g ${m}p` : `${h} gio`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PomodoroTimer({ userId, initialStats }: Props) {
  // UI state — server-safe defaults (no localStorage touch here)
  const [mode,     setMode]     = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.seconds);
  const [running,  setRunning]  = useState(false);
  const [stats,    setStats]    = useState<PomodoroStats>(initialStats);
  const [collapsed, setCollapsed] = useState(false);

  // ── Timer refs (never trigger re-renders) ─────────────────────────────────
  const startTimeRef    = useRef<number | null>(null); // wall-clock ms when counting started
  const baseSecondsRef  = useRef(MODES.work.seconds);  // seconds left at last start
  const modeRef         = useRef<Mode>('work');
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef    = useRef(false);
  const sessionDoneRef  = useRef<() => void>(() => {});

  // ── Core imperative helpers ───────────────────────────────────────────────

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (startTimeRef.current === null) return;
    const elapsed    = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const remaining  = Math.max(0, baseSecondsRef.current - elapsed);
    setTimeLeft(remaining);
    if (remaining <= 0) {
      stopInterval();
      if (!completedRef.current) {
        completedRef.current = true;
        sessionDoneRef.current();
      }
    }
  }, [stopInterval]);

  /** Start the setInterval loop (always call stopInterval first). */
  const beginCounting = useCallback(() => {
    stopInterval();
    intervalRef.current = setInterval(tick, 500);
  }, [tick, stopInterval]);

  // ── Mount: restore from localStorage ─────────────────────────────────────
  useEffect(() => {
    const saved = loadPersisted();
    if (!saved) return;

    if (saved.startTime !== null) {
      // Was counting when the page closed — compute elapsed
      const elapsed    = Math.floor((Date.now() - saved.startTime) / 1000);
      const remaining  = Math.max(0, saved.baseSeconds - elapsed);

      if (remaining > 0) {
        // Resume: reset startTime to now so elapsed starts fresh from `remaining`
        const newStart = Date.now();
        startTimeRef.current   = newStart;
        baseSecondsRef.current = remaining;
        modeRef.current        = saved.mode;

        // Persist the corrected state immediately (no effect, no batching issue)
        savePersisted({ mode: saved.mode, startTime: newStart, baseSeconds: remaining });

        // Update UI
        setMode(saved.mode);
        setTimeLeft(remaining);
        setRunning(true);

        // Start interval directly here — bypasses the React effect system entirely
        completedRef.current = false;
        beginCounting();
      } else {
        // Expired while away — reset to fresh
        clearPersisted();
        modeRef.current        = saved.mode;
        baseSecondsRef.current = MODES[saved.mode].seconds;
        setMode(saved.mode);
        setTimeLeft(MODES[saved.mode].seconds);
      }
    } else {
      // Was paused — restore paused display
      modeRef.current        = saved.mode;
      baseSecondsRef.current = saved.baseSeconds;
      setMode(saved.mode);
      setTimeLeft(saved.baseSeconds);
    }

    // Cleanup on unmount
    return () => stopInterval();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Visibility: catch up immediately when tab regains focus ───────────────
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (startTimeRef.current === null) return;
      tick();
      beginCounting(); // restart to clear any throttle drift
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [tick, beginCounting]);

  // ── Tab title ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (running) {
      document.title = `${fmt(timeLeft)} — ${MODES[mode].label} | Linguify`;
    } else {
      document.title = 'Todo List – Linguify';
    }
    return () => { document.title = 'Todo List – Linguify'; };
  }, [running, timeLeft, mode]);

  // ── Derived display values ────────────────────────────────────────────────
  const cfg   = MODES[mode];
  const total = cfg.seconds;
  const pct   = ((total - timeLeft) / total) * 100;
  const R     = 54;
  const CIRC  = 2 * Math.PI * R;
  const dash  = (pct / 100) * CIRC;

  const sessionDoneHandler = useRef<() => void>(() => {});

  // ── Handlers ─────────────────────────────────────────────────────────────

  const switchMode = useCallback((newMode: Mode) => {
    stopInterval();
    startTimeRef.current   = null;
    completedRef.current   = false;
    const secs = MODES[newMode].seconds;
    modeRef.current        = newMode;
    baseSecondsRef.current = secs;
    setRunning(false);
    setMode(newMode);
    setTimeLeft(secs);
    savePersisted({ mode: newMode, startTime: null, baseSeconds: secs });
  }, [stopInterval]);

  const handleSessionComplete = useCallback(async () => {
    stopInterval();
    startTimeRef.current = null;
    setRunning(false);
    clearPersisted();

    const currentMode = modeRef.current;

    // Completion beep
    try {
      const ctx  = new AudioContext();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}

    if (currentMode === 'work') {
      const duration = MODES.work.seconds;
      const res = await savePomodoroSessionAction(userId, duration, 'work');
      if (res.success) {
        const addedMins = Math.floor(duration / 60);
        setStats(prev => ({
          todaySessions:    prev.todaySessions + 1,
          todayMinutes:     prev.todayMinutes + addedMins,
          allTimeSessions:  prev.allTimeSessions + 1,
          allTimeMinutes:   prev.allTimeMinutes + addedMins,
        }));
        toast.success('🍅 Hoàn thành 1 phiên tập trung (25 phút)! Hãy nghỉ ngơi nhé.');
      }
      switchMode('short');
    } else {
      const duration = MODES[currentMode].seconds;
      await savePomodoroSessionAction(userId, duration, 'break');
      toast.success('☕ Hết giờ nghỉ ngơi! Sẵn sàng cho phiên tập trung mới nhé.');
      switchMode('work');
    }
  }, [userId, switchMode, stopInterval]);

  sessionDoneRef.current = handleSessionComplete;

  const handleStart = () => {
    if (!running) {
      // ── Play ──
      startTimeRef.current   = Date.now();
      baseSecondsRef.current = timeLeft;
      completedRef.current   = false;
      savePersisted({ mode, startTime: startTimeRef.current, baseSeconds: timeLeft });
      setRunning(true);
      beginCounting();
    } else {
      // ── Pause ──
      stopInterval();
      if (startTimeRef.current !== null) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        baseSecondsRef.current = Math.max(0, baseSecondsRef.current - elapsed);
      }
      startTimeRef.current = null;
      savePersisted({ mode, startTime: null, baseSeconds: baseSecondsRef.current });
      setRunning(false);
    }
  };

  const handleReset = () => {
    stopInterval();
    startTimeRef.current   = null;
    completedRef.current   = false;
    const secs = MODES[mode].seconds;
    baseSecondsRef.current = secs;
    setRunning(false);
    setTimeLeft(secs);
    savePersisted({ mode, startTime: null, baseSeconds: secs });
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={cn(
      'rounded-3xl border bg-card shadow-lg overflow-hidden transition-all duration-300',
      cfg.bg
    )}>
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-xl border', cfg.bg)}>
            <Timer className={cn('h-4 w-4', cfg.color)} />
          </div>
          <div className="text-left">
            <p className="text-sm font-extrabold text-foreground">Pomodoro Timer</p>
            <p className={cn('text-xs font-semibold', running ? cfg.color : 'text-muted-foreground')}>
              {running ? `${cfg.label} · ${fmt(timeLeft)}` : 'Bấm để bắt đầu'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-right">
            <div>
              <p className={cn('text-xs font-black', cfg.color)}>{stats.todaySessions}</p>
              <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">Hôm nay</p>
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <p className={cn('text-xs font-black', cfg.color)}>{fmtMins(stats.todayMinutes)}</p>
              <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">Tập trung</p>
            </div>
          </div>
          {collapsed
            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
            : <ChevronUp   className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 space-y-5">
              {/* Mode selector */}
              <div className="flex gap-2 p-1 bg-background/60 rounded-2xl border border-border/60">
                {(Object.entries(MODES) as [Mode, typeof MODES[Mode]][]).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => switchMode(key)}
                    className={cn(
                      'flex-1 py-1.5 rounded-xl text-xs font-bold transition-all',
                      mode === key
                        ? 'bg-background shadow-sm border border-border text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {val.label}
                  </button>
                ))}
              </div>

              {/* Ring + Time */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <svg width="148" height="148" viewBox="0 0 128 128" className="-rotate-90">
                    <circle cx="64" cy="64" r={R} fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
                    <motion.circle
                      cx="64" cy="64" r={R}
                      fill="none"
                      stroke={cfg.ring}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={CIRC}
                      strokeDashoffset={CIRC - dash}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn('text-3xl font-black tabular-nums tracking-tight', cfg.color)}>
                      {fmt(timeLeft)}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReset}
                    className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                    title="Đặt lại"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleStart}
                    className={cn(
                      'flex items-center gap-2 px-6 py-2.5 rounded-2xl font-extrabold text-sm text-white transition-all shadow-lg',
                      mode === 'work'  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'       :
                      mode === 'short' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25' :
                                         'bg-blue-500 hover:bg-blue-600 shadow-blue-500/25'
                    )}
                  >
                    {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {running ? 'Tạm dừng' : 'Bắt đầu'}
                  </button>

                  <button
                    onClick={() => switchMode(mode === 'work' ? 'short' : 'work')}
                    className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                    title={mode === 'work' ? 'Chuyển sang nghỉ' : 'Chuyển sang tập trung'}
                  >
                    {mode === 'work' ? <Coffee className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-background/70 border border-border/60 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Hôm nay</span>
                  </div>
                  <p className={cn('text-xl font-black', cfg.color)}>{stats.todaySessions} 🍅</p>
                  <p className="text-xs text-muted-foreground font-semibold">{fmtMins(stats.todayMinutes)} tập trung</p>
                </div>
                <div className="p-3 rounded-2xl bg-background/70 border border-border/60 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tổng cộng</span>
                  </div>
                  <p className={cn('text-xl font-black', cfg.color)}>{stats.allTimeSessions} 🍅</p>
                  <p className="text-xs text-muted-foreground font-semibold">{fmtMins(stats.allTimeMinutes)} tập trung</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
