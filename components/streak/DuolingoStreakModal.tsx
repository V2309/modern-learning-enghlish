'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Check, Sparkles, X, ChevronRight, Zap, Trophy, Volume2, VolumeX } from 'lucide-react';
import { StreakDayInfo } from '@/services/dashboard.service';
import Link from 'next/link';

interface DuolingoStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  totalActiveDays?: number;
  weeklyCalendar?: StreakDayInfo[];
  isNewCelebration?: boolean;
}

// Web Audio API synthesizer for flame ignition & celebratory chime
function playDuolingoChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // 1. Whoosh / Flame ignition burst sound (noise + lowpass filter)
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.35);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start(now);

    // 2. Victorious Duolingo-style major chime chord (C5 - E5 - G5 - C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.12 + index * 0.07);

      gain.gain.setValueAtTime(0, now + 0.12 + index * 0.07);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.14 + index * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + index * 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + 0.12 + index * 0.07);
      osc.stop(now + 0.9 + index * 0.07);
    });
  } catch (e) {
    // Audio autoplay restrictions or unsupported
  }
}

export function DuolingoStreakModal({
  isOpen,
  onClose,
  streak,
  totalActiveDays,
  weeklyCalendar = [],
  isNewCelebration = true,
}: DuolingoStreakModalProps) {
  const [displayedStreak, setDisplayedStreak] = useState(isNewCelebration ? Math.max(1, streak - 1) : streak);
  const [isIgnited, setIsIgnited] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsIgnited(false);
      const startVal = isNewCelebration && streak > 1 ? streak - 1 : streak;
      setDisplayedStreak(startVal);

      if (soundEnabled) {
        playDuolingoChime();
      }

      const timer1 = setTimeout(() => {
        setIsIgnited(true);
      }, 350);

      const timer2 = setTimeout(() => {
        setDisplayedStreak(streak);
      }, 650);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen, streak, isNewCelebration, soundEnabled]);

  // Generate fallback 7 days if weeklyCalendar is empty
  const days: StreakDayInfo[] = weeklyCalendar.length > 0 ? weeklyCalendar : [
    { dayLabel: 'T2', dateStr: '1', isCompleted: true, isToday: false, isFuture: false },
    { dayLabel: 'T3', dateStr: '2', isCompleted: true, isToday: false, isFuture: false },
    { dayLabel: 'T4', dateStr: '3', isCompleted: true, isToday: false, isFuture: false },
    { dayLabel: 'T5', dateStr: '4', isCompleted: true, isToday: true, isFuture: false },
    { dayLabel: 'T6', dateStr: '5', isCompleted: false, isToday: false, isFuture: true },
    { dayLabel: 'T7', dateStr: '6', isCompleted: false, isToday: false, isFuture: true },
    { dayLabel: 'CN', dateStr: '7', isCompleted: false, isToday: false, isFuture: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur & Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.82, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-background via-card to-background border border-orange-500/30 p-6 sm:p-8 shadow-2xl shadow-orange-500/20 text-center z-10"
          >
            {/* Ambient Fiery Glow Background Effects */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-orange-500/30 via-amber-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 -left-12 w-36 h-36 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-1/3 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Top Bar: Sound toggle & Close Button */}
            <div className="flex items-center justify-between relative z-20 mb-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-xs flex items-center gap-1 cursor-pointer"
                title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              >
                {soundEnabled ? <Volume2 size={16} className="text-orange-500" /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── DUOLINGO ANIMATED FLAME HERO ── */}
            <div className="relative py-4 flex flex-col items-center justify-center">
              {/* Floating Spark Particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      opacity: 0,
                      scale: 0.3,
                      x: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: [0, 1, 0.8, 0],
                      scale: [0.3, 1, 0.6],
                      x: (i % 2 === 0 ? 1 : -1) * (15 + (i * 9) % 60),
                      y: -70 - (i * 12) % 60,
                    }}
                    transition={{
                      duration: 1.6 + (i % 3) * 0.4,
                      repeat: Infinity,
                      delay: 0.1 * i,
                      ease: 'easeOut',
                    }}
                    className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full ${
                      i % 3 === 0
                        ? 'bg-amber-300 shadow-[0_0_10px_#fde047]'
                        : i % 3 === 1
                        ? 'bg-orange-500 shadow-[0_0_10px_#f97316]'
                        : 'bg-red-500 shadow-[0_0_10px_#ef4444]'
                    }`}
                  />
                ))}
              </div>

              {/* Flame Glowing Aura Disc */}
              <motion.div
                animate={{
                  scale: isIgnited ? [1, 1.15, 1.05] : 0.9,
                  opacity: isIgnited ? [0.6, 0.9, 0.75] : 0.4,
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-36 h-36 rounded-full bg-radial from-orange-500/40 via-amber-500/20 to-transparent blur-xl pointer-events-none"
              />

              {/* Duolingo Stylized 3D Multi-Layer Fire Graphic */}
              <motion.div
                initial={{ scale: 0.6, rotate: -8 }}
                animate={{
                  scale: isIgnited ? [1, 1.1, 1] : 0.9,
                  rotate: [0, -3, 3, -1, 0],
                  y: [0, -4, 0],
                }}
                transition={{
                  scale: { duration: 0.5, ease: 'easeOut' },
                  rotate: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
                  y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                }}
                className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(249,115,22,0.45)]"
              >
                <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="flameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#dc2626" />
                      <stop offset="50%" stopColor="#ea580c" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <linearGradient id="flameInner" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#ea580c" />
                      <stop offset="60%" stopColor="#facc15" />
                      <stop offset="100%" stopColor="#fef08a" />
                    </linearGradient>
                    <linearGradient id="flameCore" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#fde047" />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                    <filter id="flameGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Outer Fiery Layer */}
                  <motion.path
                    d="M 50 5 C 40 30, 20 45, 20 70 C 20 95, 35 115, 50 115 C 65 115, 80 95, 80 70 C 80 48, 65 25, 50 5 Z"
                    fill="url(#flameOuter)"
                    filter="url(#flameGlow)"
                    animate={{
                      d: [
                        'M 50 5 C 40 30, 18 45, 18 70 C 18 95, 33 115, 50 115 C 67 115, 82 95, 82 70 C 82 48, 62 25, 50 5 Z',
                        'M 50 2 C 38 28, 22 43, 22 70 C 22 95, 36 115, 50 115 C 64 115, 78 95, 78 70 C 78 46, 60 22, 50 2 Z',
                        'M 50 5 C 40 30, 18 45, 18 70 C 18 95, 33 115, 50 115 C 67 115, 82 95, 82 70 C 82 48, 62 25, 50 5 Z',
                      ],
                    }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  {/* Middle Warm Yellow Layer */}
                  <motion.path
                    d="M 50 25 C 42 45, 30 58, 30 78 C 30 96, 40 108, 50 108 C 60 108, 70 96, 70 78 C 70 60, 58 42, 50 25 Z"
                    fill="url(#flameInner)"
                    animate={{
                      d: [
                        'M 50 25 C 42 45, 30 58, 30 78 C 30 96, 40 108, 50 108 C 60 108, 70 96, 70 78 C 70 60, 58 42, 50 25 Z',
                        'M 50 22 C 40 43, 33 56, 33 78 C 33 96, 42 108, 50 108 C 58 108, 67 96, 67 78 C 67 58, 56 40, 50 22 Z',
                        'M 50 25 C 42 45, 30 58, 30 78 C 30 96, 40 108, 50 108 C 60 108, 70 96, 70 78 C 70 60, 58 42, 50 25 Z',
                      ],
                    }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  {/* Bright Core White/Yellow Spark */}
                  <motion.path
                    d="M 50 55 C 45 68, 40 76, 40 88 C 40 98, 45 104, 50 104 C 55 104, 60 98, 60 88 C 60 76, 55 68, 50 55 Z"
                    fill="url(#flameCore)"
                    animate={{
                      scale: [1, 1.12, 1],
                      opacity: [0.9, 1, 0.9],
                    }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  {/* Cute Duolingo Styled Eyes */}
                  <circle cx="43" cy="74" r="3.2" fill="#1e1e24" />
                  <circle cx="57" cy="74" r="3.2" fill="#1e1e24" />
                  <circle cx="44.2" cy="72.8" r="1.2" fill="#ffffff" />
                  <circle cx="58.2" cy="72.8" r="1.2" fill="#ffffff" />
                  {/* Happy mouth curve */}
                  <path d="M 46 81 Q 50 85 54 81" stroke="#1e1e24" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                </svg>
              </motion.div>

              {/* +1 Streak Badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 10 }}
                animate={{
                  scale: isIgnited ? [0, 1.25, 1] : 0,
                  opacity: isIgnited ? 1 : 0,
                }}
                transition={{ duration: 0.45, delay: 0.4 }}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black shadow-lg shadow-orange-500/30 uppercase tracking-wider"
              >
                <Sparkles size={13} className="animate-spin" />
                <span>+1 Chuỗi Hôm Nay!</span>
              </motion.div>
            </div>

            {/* ── STREAK COUNT & HEADLINE ── */}
            <div className="space-y-1 my-3">
              <div className="flex items-center justify-center gap-2">
                <motion.span
                  key={displayedStreak}
                  initial={{ scale: 1.4, color: '#f59e0b' }}
                  animate={{ scale: 1, color: 'var(--foreground)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="text-4xl sm:text-5xl font-black tracking-tight"
                >
                  {displayedStreak}
                </motion.span>
                <span className="text-xl sm:text-2xl font-extrabold text-orange-500">
                  Ngày Liên Tục! 🔥
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
                Bạn đã kích hoạt chuỗi học tập hôm nay. Ngọn lửa tri thức đang rực sáng!
              </p>
            </div>

            {/* ── DUOLINGO 7-DAY WEEKLY CALENDAR ROW ── */}
            <div className="my-5 p-3.5 rounded-2xl bg-muted/40 border border-border/80">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-left mb-2.5 flex items-center justify-between">
                <span>Tuần Này</span>
                {totalActiveDays && (
                  <span className="text-orange-500 font-bold">{totalActiveDays} ngày tích lũy</span>
                )}
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {days.map((day, idx) => {
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {day.dayLabel}
                      </span>
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{
                          scale: day.isToday ? [1, 1.15, 1] : 1,
                        }}
                        transition={
                          day.isToday
                            ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                            : {}
                        }
                        className={`h-9 w-9 rounded-2xl flex items-center justify-center transition-all ${
                          day.isToday
                            ? 'bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/40 ring-2 ring-orange-500/50'
                            : day.isCompleted
                            ? 'bg-orange-500/15 border border-orange-500/30 text-orange-500'
                            : 'bg-muted/70 text-muted-foreground/50 border border-border/40'
                        }`}
                      >
                        {day.isToday ? (
                          <Flame className="h-5 w-5 fill-white" />
                        ) : day.isCompleted ? (
                          <Check className="h-4 w-4 stroke-[3]" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── ACTION BUTTONS ── */}
            <div className="space-y-2 pt-1">
              <button
                onClick={onClose}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>Tiếp Tục Học Ngay</span>
              </button>

              <Link
                href="/dashboard"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all flex items-center justify-center gap-1"
              >
                <span>Xem Thống Kê Chi Tiết</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
