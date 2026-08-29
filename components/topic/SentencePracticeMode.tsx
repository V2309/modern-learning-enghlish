'use client';

import React, { useState } from 'react';
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
  Check,
  HelpCircle,
  ListRestart
} from 'lucide-react';
import { evaluateSentenceAction } from '@/actions/vocabulary.action';
import { cn } from '@/lib/utils';

interface WordItem {
  id: string;
  word: string;
  meaning: string;
  partOfSpeech?: string;
  pronunciation?: string;
  definition?: string;
  example?: string;
}

interface EvaluationResult {
  isCorrect: boolean;
  score: number;
  targetWordUsed: boolean;
  feedback: string;
  grammarErrors: string[];
  suggestedSentence: string;
  suggestedSentenceMeaning: string;
}

interface SentencePracticeModeProps {
  words: WordItem[];
  onFinish?: () => void;
}

export const SentencePracticeMode: React.FC<SentencePracticeModeProps> = ({ words, onFinish }) => {
  const [shuffledWords, setShuffledWords] = useState<WordItem[]>(() =>
    [...words].sort(() => 0.5 - Math.random())
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSentence, setUserSentence] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [history, setHistory] = useState<Record<string, { sentence: string; eval: EvaluationResult }>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Sync shuffled words if props change
  React.useEffect(() => {
    setShuffledWords([...words].sort(() => 0.5 - Math.random()));
  }, [words]);

  if (!words || words.length === 0) {
    return (
      <div className="p-12 text-center bg-card border border-border rounded-[2.5rem] space-y-4">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
        <h3 className="text-xl font-bold text-foreground">Không có từ vựng nào để luyện tập</h3>
        <p className="text-sm text-muted-foreground">Chủ đề này chưa có từ vựng. Hãy thêm từ mới để bắt đầu đặt câu!</p>
      </div>
    );
  }

  const currentWord = shuffledWords[currentIndex];

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

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
        setEvaluation(res.evaluation);
        setHistory((prev) => ({
          ...prev,
          [currentWord.id]: {
            sentence: userSentence.trim(),
            eval: res.evaluation,
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

  const handleNextWord = () => {
    if (currentIndex < shuffledWords.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const prevData = history[shuffledWords[nextIdx].id];
      setUserSentence(prevData ? prevData.sentence : '');
      setEvaluation(prevData ? prevData.eval : null);
      setShowHint(false);
      setErrorMsg(null);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevWord = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevData = history[shuffledWords[prevIdx].id];
      setUserSentence(prevData ? prevData.sentence : '');
      setEvaluation(prevData ? prevData.eval : null);
      setShowHint(false);
      setErrorMsg(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserSentence('');
    setEvaluation(null);
    setHistory({});
    setIsCompleted(false);
    setShowHint(false);
    setErrorMsg(null);
    setShuffledWords([...words].sort(() => 0.5 - Math.random()));
  };

  // Completion Summary Screen
  if (isCompleted) {
    const historyList = Object.values(history);
    const totalScore = historyList.reduce((acc, curr) => acc + curr.eval.score, 0);
    const avgScore = historyList.length > 0 ? Math.round(totalScore / historyList.length) : 0;

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
            Bạn đã tự đặt câu và nhận phản hồi AI cho tất cả <span className="font-bold text-foreground">{words.length} từ vựng</span> trong chủ đề này.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
            <div className="p-4 bg-muted/40 rounded-2xl border border-border">
              <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Số từ hoàn thành</span>
              <span className="text-2xl font-black text-foreground">{historyList.length} / {words.length}</span>
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
              className="px-6 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <RotateCcw className="h-4 w-4" />
              Luyện tập lại chủ đề này
            </button>
            {onFinish && (
              <button
                onClick={onFinish}
                className="px-6 py-3.5 bg-muted border border-border text-foreground font-bold rounded-2xl hover:bg-muted/80 transition-all"
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
            {shuffledWords.map((w, idx) => {
              const item = history[w.id];
              return (
                <div key={w.id} className="p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                      <span className="font-extrabold text-foreground text-base">{w.word}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                        {w.meaning}
                      </span>
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

  const progressPercent = Math.round(((currentIndex + 1) / shuffledWords.length) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-3">
      {/* Top Header & Progress */}
      <div className="px-4 py-2.5 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Luyện tập đặt câu với AI
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Viết câu tiếng Anh và nhận đánh giá từ Gemini AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-32 sm:w-44 bg-muted rounded-full h-1.5 overflow-hidden border border-border">
            <motion.div
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 whitespace-nowrap">
            {currentIndex + 1} / {shuffledWords.length}
          </span>
        </div>
      </div>

      {/* 2-Column Main Layout: Left = Word + Input, Right = AI Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
        {/* Left Column: Target Word & Input */}
        <div className="space-y-3">
          {/* Target Word Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-3xl font-black text-foreground tracking-tight">
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

                <div className="flex items-center gap-2 pt-0.5">
                  {currentWord.partOfSpeech && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold text-xs uppercase border border-primary/30">
                      {currentWord.partOfSpeech}
                    </span>
                  )}
                  {currentWord.pronunciation && (
                    <span className="text-xs font-mono text-muted-foreground">
                      {currentWord.pronunciation}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right space-y-0.5 shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Nghĩa</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 block">
                  {currentWord.meaning}
                </span>
              </div>
            </div>

            {/* Toggle Hint */}
            {currentWord.example && (
              <div className="pt-2 border-t border-border/60">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  {showHint ? 'Ẩn câu ví dụ' : 'Xem câu ví dụ mẫu'}
                </button>

                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 p-2.5 rounded-xl bg-muted/60 border border-border text-xs space-y-0.5"
                  >
                    <p className="font-semibold text-foreground italic">&quot;{currentWord.example}&quot;</p>
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
                    <span>Nộp câu & Nhận xét AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Feedback or Empty Placeholder */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {evaluation ? (
              <motion.div
                key="evaluation-result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-md space-y-3.5"
              >
                {/* Badge Score & Status */}
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

                  <div className="text-right shrink-0">
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
                </div>

                {/* AI Feedback */}
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Nhận xét chi tiết từ AI
                  </h5>
                  <p className="text-sm text-foreground/90 leading-relaxed bg-muted/40 p-3 rounded-xl border border-border">
                    {evaluation.feedback}
                  </p>
                </div>

                {/* Grammar Errors / Notes */}
                {evaluation.grammarErrors && evaluation.grammarErrors.length > 0 && (
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Lưu ý ngữ pháp / dùng từ
                    </h5>
                    <ul className="space-y-1 pl-1">
                      {evaluation.grammarErrors.map((err, i) => (
                        <li key={i} className="text-xs text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span>{err}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Sentence */}
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5" />
                      Gợi ý viết câu tự nhiên hơn
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
                    <span>{currentIndex < shuffledWords.length - 1 ? 'Từ tiếp theo' : 'Xem tổng kết'}</span>
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
                  Hãy viết một câu tiếng Anh hoàn chỉnh chứa từ khóa và nhấn <strong>&quot;Nộp câu &amp; Nhận xét AI&quot;</strong> để nhận điểm số cùng gợi ý chi tiết.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
