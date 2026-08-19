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
  work:  { label: 'Tập trung',    seconds: 25 * 60, color: 'text-rose-500',   ring: '#f43f5e', bg: 'bg-rose-500/10 border-rose-500/20' },
  short: { label: 'Nghỉ ngắn',   seconds: 5  * 60, color: 'text-emerald-500', ring: '#10b981', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  long:  { label: 'Nghỉ dài',    seconds: 15 * 60, color: 'text-blue-500',    ring: '#3b82f6', bg: 'bg-blue-500/10 border-blue-500/20' },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatMinutes(mins: number) {
  if (mins < 60) return `${mins} phút`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}g ${m}p` : `${h} giờ`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PomodoroTimer({ userId, initialStats }: Props) {
  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.seconds);
  const [running, setRunning] = useState(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null); // timestamp
  const [stats, setStats] = useState<PomodoroStats>(initialStats);
  const [collapsed, setCollapsed] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cfg = MODES[mode];
  const total = cfg.seconds;
  const pct = ((total - timeLeft) / total) * 100;

  // ── SVG ring params ─────────────────────────────────────────────────────────
  const R = 54;
  const CIRC = 2 * Math.PI * R;
  const dash = (pct / 100) * CIRC;

  // ── Timer tick ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  // ── Update document title ───────────────────────────────────────────────────
  useEffect(() => {
    if (running) {
      document.title = `${formatTime(timeLeft)} — ${cfg.label} | Linguify`;
    } else {
      document.title = 'Todo List – Linguify';
    }
    return () => { document.title = 'Todo List – Linguify'; };
  }, [running, timeLeft, cfg.label]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSessionComplete = useCallback(async () => {
    setRunning(false);

    // Play notification sound (Web Audio API)
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (_) {}

    if (mode === 'work') {
      const duration = MODES.work.seconds;
      const res = await savePomodoroSessionAction(userId, duration, 'work');
      if (res.success) {
        const addedMins = Math.floor(duration / 60);
        setStats((prev) => ({
          todaySessions: prev.todaySessions + 1,
          todayMinutes: prev.todayMinutes + addedMins,
          allTimeSessions: prev.allTimeSessions + 1,
          allTimeMinutes: prev.allTimeMinutes + addedMins,
        }));
        toast.success('🍅 Hoàn thành 1 Pomodoro! Hãy nghỉ ngơi nhé.');
      }
    } else {
      toast.success('☕ Hết giờ nghỉ! Sẵn sàng tập trung chưa?');
    }

    // Auto switch to next mode
    if (mode === 'work') {
      switchMode('short');
    } else {
      switchMode('work');
    }
  }, [mode, userId]);

  const switchMode = (newMode: Mode) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].seconds);
    setSessionStart(null);
  };

  const handleStart = () => {
    if (!running) setSessionStart(Date.now());
    setRunning((r) => !r);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setTimeLeft(MODES[mode].seconds);
    setSessionStart(null);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={cn(
      'rounded-3xl border bg-card shadow-lg overflow-hidden transition-all duration-300',
      cfg.bg
    )}>
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-xl border', cfg.bg)}>
            <Timer className={cn('h-4 w-4', cfg.color)} />
          </div>
          <div className="text-left">
            <p className="text-sm font-extrabold text-foreground">Pomodoro Timer</p>
            <p className={cn('text-xs font-semibold', running ? cfg.color : 'text-muted-foreground')}>
              {running ? `${cfg.label} · ${formatTime(timeLeft)}` : 'Bấm để bắt đầu'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini stats */}
          <div className="hidden sm:flex items-center gap-3 text-right">
            <div>
              <p className={cn('text-xs font-black', cfg.color)}>{stats.todaySessions}</p>
              <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">Hôm nay</p>
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <p className={cn('text-xs font-black', cfg.color)}>{formatMinutes(stats.todayMinutes)}</p>
              <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">Tập trung</p>
            </div>
          </div>
          {collapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
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
                    {/* Track */}
                    <circle cx="64" cy="64" r={R} fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
                    {/* Progress */}
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

                  {/* Center display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn('text-3xl font-black tabular-nums tracking-tight', cfg.color)}>
                      {formatTime(timeLeft)}
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
                      mode === 'work'
                        ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
                        : mode === 'short'
                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
                        : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/25'
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

              {/* Stats bar */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-background/70 border border-border/60 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Hôm nay</span>
                  </div>
                  <p className={cn('text-xl font-black', cfg.color)}>{stats.todaySessions} 🍅</p>
                  <p className="text-xs text-muted-foreground font-semibold">{formatMinutes(stats.todayMinutes)} tập trung</p>
                </div>
                <div className="p-3 rounded-2xl bg-background/70 border border-border/60 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tổng cộng</span>
                  </div>
                  <p className={cn('text-xl font-black', cfg.color)}>{stats.allTimeSessions} 🍅</p>
                  <p className="text-xs text-muted-foreground font-semibold">{formatMinutes(stats.allTimeMinutes)} tập trung</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
