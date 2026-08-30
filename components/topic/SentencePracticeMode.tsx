'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Volume2,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Award,
  Lightbulb,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  Save,
  Check,
} from 'lucide-react';
import { evaluateSentenceAction } from '@/actions/vocabulary.action';
import { saveSentencePracticeAction } from '@/actions/sentencePractice.action';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export interface WordItem {
  id: string;
  word: string;
  meaning: string;
  partOfSpeech?: string;
  pronunciation?: string;
  definition?: string;
  example?: string;
}

export interface EvaluationResult {
  isCorrect: boolean;
  score: number;
  targetWordUsed: boolean;
  feedback: string;
  grammarErrors: string[];
  suggestedSentence: string;
  suggestedSentenceMeaning: string;
}

export interface SavedPracticeItem {
  id?: string;
  vocabularyId: string;
  userSentence: string;
  isCorrect: boolean;
  score: number;
  targetWordUsed: boolean;
  feedback: string;
  grammarErrors: string[];
  suggestedSentence: string;
  suggestedSentenceMeaning: string;
  updatedAt?: Date | string;
}

interface SentencePracticeModeProps {
  words: WordItem[];
  topicId?: string;
  initialPractices?: SavedPracticeItem[];
  onFinish?: () => void;
}

interface WordHistoryState {
  sentence: string;
  eval: EvaluationResult;
  isSaved?: boolean;
  savedAt?: Date | string;
}

export const SentencePracticeMode: React.FC<SentencePracticeModeProps> = ({
  words,
  topicId = '',
  initialPractices = [],
  onFinish,
}) => {
  const [activeWords, setActiveWords] = useState<WordItem[]>(() =>
    [...words].sort(() => 0.5 - Math.random())
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSentence, setUserSentence] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // History mapping vocabularyId -> user sentence + AI evaluation + saved status
  const [history, setHistory] = useState<Record<string, WordHistoryState>>(() => {
    const map: Record<string, WordHistoryState> = {};
    if (initialPractices && initialPractices.length > 0) {
      initialPractices.forEach((p) => {
        map[p.vocabularyId] = {
          sentence: p.userSentence,
          eval: {
            isCorrect: p.isCorrect,
            score: p.score,
            targetWordUsed: p.targetWordUsed,
            feedback: p.feedback,
            grammarErrors: p.grammarErrors || [],
            suggestedSentence: p.suggestedSentence,
            suggestedSentenceMeaning: p.suggestedSentenceMeaning,
          },
          isSaved: true,
          savedAt: p.updatedAt,
        };
      });
    }
    return map;
  });

  const wordsKey = React.useMemo(() => words.map((w) => w.id).join(','), [words]);

  // Sync words only when the actual word list or topic changes
  useEffect(() => {
    if (words && words.length > 0) {
      setActiveWords([...words].sort(() => 0.5 - Math.random()));
      setCurrentIndex(0);
    }
  }, [wordsKey]);

  // Sync history when initialPractices change from server
  useEffect(() => {
    if (initialPractices && initialPractices.length > 0) {
      setHistory((prev) => {
        const next = { ...prev };
        initialPractices.forEach((p) => {
          if (!next[p.vocabularyId]) {
            next[p.vocabularyId] = {
              sentence: p.userSentence,
              eval: {
                isCorrect: p.isCorrect,
                score: p.score,
                targetWordUsed: p.targetWordUsed,
                feedback: p.feedback,
                grammarErrors: p.grammarErrors || [],
                suggestedSentence: p.suggestedSentence,
                suggestedSentenceMeaning: p.suggestedSentenceMeaning,
              },
              isSaved: true,
              savedAt: p.updatedAt,
            };
          }
        });
        return next;
      });
    }
  }, [initialPractices]);

  const effectiveWords = activeWords && activeWords.length > 0 ? activeWords : words;
  const safeIndex = Math.min(Math.max(0, currentIndex), Math.max(0, effectiveWords.length - 1));
  const currentWord = effectiveWords && effectiveWords.length > 0 ? effectiveWords[safeIndex] : null;

  // Auto-restore saved sentence & feedback when viewing a word
  useEffect(() => {
    if (currentWord) {
      const saved = history[currentWord.id];
      if (saved) {
        setUserSentence(saved.sentence || '');
        setEvaluation(saved.eval || null);
      } else {
        setUserSentence('');
        setEvaluation(null);
      }
      setShowHint(false);
      setErrorMsg(null);
    }
  }, [safeIndex, currentWord?.id]);

  if (!words || words.length === 0 || !currentWord) {
    return (
      <div className="p-12 text-center bg-card border border-border rounded-[2.5rem] space-y-4">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
        <h3 className="text-xl font-bold text-foreground">
          {(!words || words.length === 0) ? 'Chưa có từ vựng nào để luyện tập' : 'Đang tải dữ liệu từ vựng...'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {(!words || words.length === 0)
            ? 'Chủ đề này chưa có từ vựng. Hãy thêm từ mới để bắt đầu đặt câu!'
            : 'Vui lòng chờ trong giây lát...'}
        </p>
      </div>
    );
  }

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Submit sentence to AI for evaluation
  const handleSubmit = async () => {
    if (!userSentence.trim()) {
      setErrorMsg('Vui lòng nhập câu tiếng Anh của bạn trước khi gửi.');
      return;
    }

    setErrorMsg(null);
    setIsEvaluating(true);

    try {
      const res = await evaluateSentenceAction({
        word: currentWord.word,
        meaning: currentWord.meaning,
        partOfSpeech: currentWord.partOfSpeech,
        userSentence: userSentence.trim(),
      });

      if (res.success && res.evaluation) {
        const evalData = res.evaluation;
        setEvaluation(evalData);
        setHistory((prev) => ({
          ...prev,
          [currentWord.id]: {
            sentence: userSentence.trim(),
            eval: evalData,
            isSaved: false, // Not yet saved to DB
          },
        }));
      } else {
        setErrorMsg(res.error || 'Đã xảy ra lỗi khi gửi câu cho AI.');
      }
    } catch (e: any) {
      setErrorMsg('Lỗi kết nối mạng hoặc hệ thống. Vui lòng thử lại.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Save current sentence & AI evaluation to DB
  const handleSaveToDb = async () => {
    if (!currentWord || !evaluation || !userSentence.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const res = await saveSentencePracticeAction(currentWord.id, topicId, {
        userSentence: userSentence.trim(),
        isCorrect: evaluation.isCorrect,
        score: evaluation.score,
        targetWordUsed: evaluation.targetWordUsed,
        feedback: evaluation.feedback,
        grammarErrors: evaluation.grammarErrors || [],
        suggestedSentence: evaluation.suggestedSentence,
        suggestedSentenceMeaning: evaluation.suggestedSentenceMeaning,
      });

      if (res.success) {
        setHistory((prev) => ({
          ...prev,
          [currentWord.id]: {
            sentence: userSentence.trim(),
            eval: evaluation,
            isSaved: true,
            savedAt: new Date(),
          },
        }));
        toast.success(`Đã lưu câu cho từ "${currentWord.word}" vào CSDL!`);
      } else {
        toast.error(res.error || 'Không thể lưu bài đặt câu.');
      }
    } catch (err: any) {
      toast.error('Lỗi khi lưu dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextWord = () => {
    if (currentIndex < activeWords.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setActiveWords([...words].sort(() => 0.5 - Math.random()));
    setCurrentIndex(0);
    setIsCompleted(false);
    setShowHint(false);
    setErrorMsg(null);
  };

  const currentHistoryItem = currentWord ? history[currentWord.id] : null;
  const isCurrentSaved = currentHistoryItem?.isSaved;

  // Completion Summary Screen
  if (isCompleted) {
    const historyList = Object.values(history);
    const totalScore = historyList.reduce((acc, curr) => acc + curr.eval.score, 0);
    const avgScore = historyList.length > 0 ? Math.round(totalScore / historyList.length) : 0;
    const totalSaved = historyList.filter((h) => h.isSaved).length;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-6">
            <Award className="h-10 w-10" />
          </div>

          <h2 className="text-3xl font-black text-foreground mb-2">Hoàn thành bài luyện tập đặt câu!</h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto mb-8">
            Bạn đã tự đặt câu và nhận phản hồi AI cho <span className="font-bold text-foreground">{words.length} từ vựng</span> trong chủ đề này.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
            <div className="p-4 bg-muted/40 rounded-2xl border border-border">
              <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Đã lưu vào CSDL</span>
              <span className="text-2xl font-black text-foreground">{totalSaved} / {words.length} từ</span>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase block mb-1">Điểm trung bình</span>
              <span className="text-2xl font-black text-emerald-500">{avgScore} / 100</span>
            </div>
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
              <span className="text-xs font-bold text-primary uppercase block mb-1">Đánh giá chung</span>
              <span className="text-lg font-extrabold text-primary">
                {avgScore >= 80 ? 'Rất Tự Nhiên' : avgScore >= 60 ? 'Khá Tốt' : 'Cần Rèn Luyện'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleRestart}
              className="px-6 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Luyện tập lại chủ đề này
            </button>
            {onFinish && (
              <button
                onClick={onFinish}
                className="px-6 py-3.5 bg-muted border border-border text-foreground font-bold rounded-2xl hover:bg-muted/80 transition-all cursor-pointer"
              >
                Trở về danh sách từ
              </button>
            )}
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground px-2">Chi tiết kết quả đặt câu:</h3>
          <div className="space-y-3">
            {activeWords.map((w, idx) => {
              const item = history[w.id];
              return (
                <div
                  key={w.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsCompleted(false);
                  }}
                  className="p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                      <span className="font-extrabold text-foreground text-base">{w.word}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                        {w.meaning}
                      </span>
                      {item?.isSaved && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <BookmarkCheck className="h-3 w-3" />
                          Đã lưu
                        </span>
                      )}
                    </div>
                    {item ? (
                      <p className="text-sm text-muted-foreground italic line-clamp-2">
                        &quot;{item.sentence}&quot;
                      </p>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Chưa thực hiện đặt câu</span>
                    )}
                  </div>

                  {item && (
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-xl text-xs font-black border',
                          item.eval.score >= 80
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : item.eval.score >= 60
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        )}
                      >
                        {item.eval.score} / 100 điểm
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  const progressPercent = Math.round(((safeIndex + 1) / effectiveWords.length) * 100);
  const completedCount = Object.keys(history).length;

  return (
    <div className="w-full max-w-[1550px] mx-auto space-y-4">
      {/* Top Header & Progress */}
      <div className="px-5 py-3 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground tracking-tight">
                Luyện tập đặt câu với AI
              </h2>
              {completedCount > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {completedCount}/{effectiveWords.length} từ đã làm
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Viết câu tiếng Anh và nhận đánh giá từ Gemini AI (Tự động khôi phục dữ liệu đã lưu)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-32 sm:w-48 bg-muted rounded-full h-2 overflow-hidden border border-border">
            <motion.div
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 whitespace-nowrap">
            {safeIndex + 1} / {effectiveWords.length}
          </span>
        </div>
      </div>

      {/* 2-Column Main Layout: Left = Word + Input, Right = AI Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Target Word & Input (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Target Word Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 shadow-sm space-y-4 relative overflow-hidden">
            {/* Row 1: English Word + Pronounce button + Saved badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                  {currentWord.word}
                </h3>
                <button
                  onClick={() => handleSpeak(currentWord.word)}
                  className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all active:scale-95 cursor-pointer"
                  title="Phát âm từ này"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>

              {isCurrentSaved && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <BookmarkCheck className="h-3.5 w-3.5" />
                  Đã lưu CSDL
                </span>
              )}
            </div>

            {/* Row 2: Part of Speech + IPA Pronunciation + Vietnamese Meaning (Responsive Wrap) */}
            <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
              {currentWord.partOfSpeech && (
                <span className="px-2.5 py-1 rounded-lg bg-primary/15 text-primary font-bold text-xs uppercase tracking-wider border border-primary/25 shrink-0">
                  {currentWord.partOfSpeech}
                </span>
              )}

              {currentWord.pronunciation && (
                <span className="text-xs sm:text-sm font-mono text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg border border-border/70 shrink-0">
                  {currentWord.pronunciation}
                </span>
              )}

              {/* Vietnamese Meaning pill (Tự động co giãn theo độ dài, không bao giờ bị cắt chữ) */}
              <div className="inline-flex items-start gap-2 text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 max-w-full leading-snug">
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70 shrink-0 mt-0.5">Nghĩa:</span>
                <span className="break-words">{currentWord.meaning}</span>
              </div>
            </div>

            {/* Toggle Hint */}
            {currentWord.example && (
              <div className="pt-2.5 border-t border-border/60">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  {showHint ? 'Ẩn câu ví dụ mẫu' : 'Xem câu ví dụ mẫu'}
                </button>

                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2.5 p-3 rounded-xl bg-muted/50 border border-border/80 text-xs sm:text-sm space-y-1"
                  >
                    <p className="font-semibold text-foreground italic leading-relaxed">&quot;{currentWord.example}&quot;</p>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Sentence Input Area */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>Viết câu tiếng Anh của bạn:</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  (Chứa từ <strong className="text-primary">&quot;{currentWord.word}&quot;</strong>)
                </span>
              </label>
              {userSentence && (
                <button
                  onClick={() => {
                    setUserSentence('');
                    setEvaluation(null);
                    setErrorMsg(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
                >
                  Xóa câu
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                value={userSentence}
                onChange={(e) => {
                  setUserSentence(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={`Ví dụ: ${currentWord.example ? currentWord.example : `Write a sentence containing "${currentWord.word}"...`}`}
                rows={3}
                className="w-full p-3 rounded-xl bg-muted/30 border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 text-foreground text-base placeholder:text-muted-foreground/60 resize-none outline-none transition-all"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handlePrevWord}
                disabled={currentIndex === 0 || isEvaluating}
                className="px-3.5 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Từ trước
              </button>

              <button
                onClick={handleSubmit}
                disabled={isEvaluating || !userSentence.trim()}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI đang phân tích...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Nộp câu &amp; Nhận xét AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 3-Part AI Feedback or Empty Placeholder (7 cols on lg) */}
        <div className="lg:col-span-7 w-full">
          <AnimatePresence mode="wait">
            {evaluation ? (
              <motion.div
                key="evaluation-result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-md space-y-4"
              >
                {/* Header: Score & Save Button */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'p-2 rounded-xl border flex items-center justify-center',
                        evaluation.isCorrect
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      )}
                    >
                      {evaluation.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">
                        {evaluation.isCorrect ? 'Sử dụng từ chính xác!' : 'Cần điều chỉnh thêm'}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {evaluation.targetWordUsed
                          ? `Đã chứa từ chìa khóa "${currentWord.word}"`
                          : `Chưa dùng đúng từ chìa khóa "${currentWord.word}"`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">Thang điểm</span>
                      <span
                        className={cn(
                          'text-2xl font-black',
                          evaluation.score >= 80
                            ? 'text-emerald-500'
                            : evaluation.score >= 60
                            ? 'text-amber-500'
                            : 'text-rose-500'
                        )}
                      >
                        {evaluation.score} / 100
                      </span>
                    </div>

                    {/* Button Save to DB */}
                    <button
                      onClick={handleSaveToDb}
                      disabled={isSaving}
                      title={isCurrentSaved ? 'Cập nhật lưu vào CSDL' : 'Lưu câu và nhận xét vào CSDL'}
                      className={cn(
                        'px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50',
                        isCurrentSaved
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20'
                      )}
                    >
                      {isSaving ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Đang lưu...</span>
                        </>
                      ) : isCurrentSaved ? (
                        <>
                          <BookmarkCheck className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Đã lưu</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-3.5 w-3.5" />
                          <span>Lưu vào DB</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ── 1. PHẦN 1: NHẬN XÉT CHI TIẾT TỪ AI ── */}
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    1. Nhận xét chi tiết từ AI
                  </h5>
                  <p className="text-sm text-foreground/90 leading-relaxed bg-muted/40 p-3 rounded-xl border border-border">
                    {evaluation.feedback}
                  </p>
                </div>

                {/* ── 2. PHẦN 2: LƯU Ý NGỮ PHÁP / DÙNG TỪ (LUÔN HIỂN THỊ) ── */}
                <div className="space-y-1.5">
                  <h5
                    className={cn(
                      'text-xs font-bold uppercase tracking-wider flex items-center gap-1.5',
                      evaluation.grammarErrors && evaluation.grammarErrors.length > 0
                        ? 'text-rose-500'
                        : 'text-emerald-600 dark:text-emerald-400'
                    )}
                  >
                    {evaluation.grammarErrors && evaluation.grammarErrors.length > 0 ? (
                      <AlertCircle className="h-3.5 w-3.5" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    )}
                    2. Lưu ý ngữ pháp / dùng từ
                  </h5>

                  {evaluation.grammarErrors && evaluation.grammarErrors.length > 0 ? (
                    <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1.5">
                      <ul className="space-y-1 pl-1">
                        {evaluation.grammarErrors.map((err, i) => (
                          <li key={i} className="text-xs text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <span>{err}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>Ngữ pháp &amp; chính tả chuẩn xác! Không phát hiện lỗi cấu trúc hay dùng từ.</span>
                    </div>
                  )}
                </div>

                {/* ── 3. PHẦN 3: GỢI Ý VIẾT CÂU TỰ NHIÊN HƠN ── */}
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5" />
                      3. Gợi ý viết câu tự nhiên hơn
                    </h5>
                    <button
                      onClick={() => handleSpeak(evaluation.suggestedSentence)}
                      className="p-1 rounded-lg hover:bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      Nghe
                    </button>
                  </div>

                  <p className="text-sm font-extrabold text-foreground italic">
                    &quot;{evaluation.suggestedSentence}&quot;
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Nghĩa: {evaluation.suggestedSentenceMeaning}
                  </p>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setEvaluation(null);
                    }}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Thử câu khác
                  </button>

                  <button
                    onClick={handleNextWord}
                    className="px-5 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{safeIndex < effectiveWords.length - 1 ? 'Từ tiếp theo' : 'Xem tổng kết'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 rounded-2xl bg-card/60 border border-dashed border-border/80 flex flex-col items-center justify-center text-center text-muted-foreground min-h-[320px] space-y-2.5"
              >
                <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  Phản hồi từ AI sẽ xuất hiện ở đây
                </h4>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Hãy viết một câu tiếng Anh hoàn chỉnh chứa từ khóa và nhấn <strong>&quot;Nộp câu &amp; Nhận xét AI&quot;</strong> để nhận điểm số cùng gợi ý chi tiết 3 phần.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
