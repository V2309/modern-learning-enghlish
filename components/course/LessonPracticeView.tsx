'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Check,
  FileQuestion,
  Award,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: number;
  question: string;
  category?: string;
  options: { key: string; text: string }[];
  correct: string;
  explanation: string;
}

interface LessonPracticeViewProps {
  lesson: any;
  topicTitle?: string;
  isCompleted?: boolean;
  onCompletePractice: () => void;
  onNextLesson?: () => void;
  onBackToVideo: () => void;
}

function parsePracticeQuestions(
  dbQuestions?: any[],
  practiceContent?: string | null
): Question[] {
  // 1. Relational Question records from database
  if (dbQuestions && Array.isArray(dbQuestions) && dbQuestions.length > 0) {
    return dbQuestions.map((q: any, idx: number) => {
      const options = Array.isArray(q.options)
        ? q.options.map((opt: any, optIdx: number) => ({
            key: opt.key || String.fromCharCode(65 + optIdx),
            text: opt.content || opt.text || '',
            isCorrect: !!opt.isCorrect,
          }))
        : [];
      const correctOpt = options.find((o: any) => o.isCorrect)?.key || 'A';
      return {
        id: idx + 1,
        question: q.content || q.question || '',
        category: q.category || 'Liên từ',
        options: options.map(({ key, text }: any) => ({ key, text })),
        correct: correctOpt,
        explanation: q.explanation || '',
      };
    });
  }

  // 2. JSON practiceContent from database
  if (practiceContent && practiceContent.trim()) {
    try {
      const parsed = JSON.parse(practiceContent);
      const list = Array.isArray(parsed) ? parsed : (parsed.questions && Array.isArray(parsed.questions) ? parsed.questions : []);
      if (list.length > 0) {
        return list.map((item: any, idx: number) => ({
          id: item.id ?? idx + 1,
          question: item.question || item.content || '',
          category: item.category || 'Liên từ',
          options: Array.isArray(item.options)
            ? item.options.map((opt: any, optIdx: number) => {
                if (typeof opt === 'string') {
                  return { key: String.fromCharCode(65 + optIdx), text: opt };
                }
                return { key: opt.key || String.fromCharCode(65 + optIdx), text: opt.text || opt.content || '' };
              })
            : [],
          correct: item.correct || item.answer || 'A',
          explanation: item.explanation || item.explain || '',
        }));
      }
    } catch {
      // fallback if invalid JSON
    }
  }

  return [];
}

export const LessonPracticeView = ({
  lesson,
  topicTitle = '',
  isCompleted = false,
  onCompletePractice,
  onNextLesson,
  onBackToVideo,
}: LessonPracticeViewProps) => {
  const questions = useMemo(
    () => parsePracticeQuestions(lesson?.questions, lesson?.practiceContent),
    [lesson?.questions, lesson?.practiceContent]
  );

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Reset internal practice state whenever switching to another lesson
  React.useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSubmittedQuestions({});
    setIsFinished(false);
  }, [lesson?.id]);

  const currentQ = questions[currentIndex];
  const totalCount = questions.length;

  // Answer stats
  const answeredCount = Object.keys(selectedAnswers).length;
  const submittedCount = Object.keys(submittedQuestions).length;
  const progressPercent = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  const correctCount = questions.filter(
    (q) => submittedQuestions[q.id] && selectedAnswers[q.id] === q.correct
  ).length;

  // Handle selecting an option
  const handleSelectOption = (optionKey: string) => {
    if (!currentQ) return;
    if (submittedQuestions[currentQ.id]) return; // locked after submit

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionKey,
    }));
  };

  // Submit current question
  const handleSubmitCurrent = () => {
    if (!currentQ || !selectedAnswers[currentQ.id]) return;
    setSubmittedQuestions((prev) => ({
      ...prev,
      [currentQ.id]: true,
    }));
  };

  // Navigation
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalCount - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    if (index >= 0 && index < totalCount) {
      setCurrentIndex(index);
      if (isFinished) setIsFinished(false);
    }
  };

  const handleResetPractice = () => {
    setSelectedAnswers({});
    setSubmittedQuestions({});
    setCurrentIndex(0);
    setIsFinished(false);
  };

  // If no questions exist in DB for this lesson
  if (questions.length === 0) {
    return (
      <div className="p-8 md:p-12 rounded-2xl bg-card border border-border/70 text-center space-y-5 shadow-2xs">
        <div className="h-12 w-12 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center mx-auto text-muted-foreground">
          <FileQuestion className="h-6 w-6 text-brand" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-lg font-semibold text-foreground">
            Chưa có bài tập thực hành
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bài giảng "{lesson?.title || 'này'}" hiện chưa có câu hỏi trắc nghiệm đính kèm.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onBackToVideo}
            className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-medium flex items-center gap-2 hover:bg-brand/90 transition-colors cursor-pointer shadow-xs"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Xem Video bài giảng</span>
          </button>

          {onNextLesson && (
            <button
              type="button"
              onClick={onNextLesson}
              className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Bài học tiếp theo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Summary Finished View
  if (isFinished) {
    const isPassed = correctCount >= Math.ceil(totalCount * 0.7);

    return (
      <div className="p-8 md:p-12 rounded-2xl bg-card border border-border/70 text-center space-y-6 shadow-2xs">
        <div className="max-w-md mx-auto space-y-3">
          <div
            className={cn(
              'h-16 w-16 rounded-2xl flex items-center justify-center mx-auto border',
              isPassed
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400'
            )}
          >
            <Award className="h-8 w-8 stroke-[2]" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Kết Quả Luyện Tập
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Bạn đã trả lời <strong className="text-foreground font-semibold">{submittedCount}/{totalCount}</strong> câu hỏi.
          </p>
          <div className="text-3xl font-bold text-brand py-1">
            {correctCount} / {totalCount} đúng
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isPassed
              ? 'Xuất sắc! Bạn đã nắm vững các kiến thức trọng tâm của bài học.'
              : 'Hãy xem lại các câu giải thích bên dưới để củng cố thêm kiến thức nhé.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleResetPractice}
            className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Làm lại từ đầu</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsFinished(false);
              setCurrentIndex(0);
            }}
            className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Xem lại từng câu</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onCompletePractice();
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Xác nhận hoàn thành</span>
          </button>

          {onNextLesson && (
            <button
              type="button"
              onClick={onNextLesson}
              className="px-4 py-2 rounded-xl bg-brand hover:bg-brand/90 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <span>Bài tiếp theo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  const isCurrentSubmitted = !!submittedQuestions[currentQ?.id];
  const currentSelectedKey = selectedAnswers[currentQ?.id];
  const isCurrentCorrect = isCurrentSubmitted && currentSelectedKey === currentQ?.correct;
  const currentCorrectOption = currentQ?.options.find((o) => o.key === currentQ?.correct);
  const currentSelectedOption = currentQ?.options.find((o) => o.key === currentSelectedKey);

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        {/* Left Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToVideo}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Play className="h-3 w-3 fill-current opacity-70" />
              <span>Xem Video bài giảng</span>
            </button>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-xs font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded-md">
              {currentQ?.category || 'Trắc nghiệm'}
            </span>
          </div>
          <h2 className="text-sm md:text-base font-semibold text-foreground truncate">
            Luyện tập: {lesson?.title || 'Bài học'}
          </h2>
        </div>

        {/* Right Progress */}
        <div className="flex items-center gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
          <div className="text-right">
            <div className="text-[11px] text-muted-foreground">
              Tiến độ: <strong className="text-foreground font-semibold">{answeredCount}/{totalCount}</strong>
            </div>
          </div>
          <div className="w-24 sm:w-32 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Grid: Question Card (Left) & Question Palette (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Focus: Question Card ── */}
        <div className="lg:col-span-8 space-y-5">
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/70 space-y-6 shadow-2xs">
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Câu Hỏi {currentIndex + 1} / {totalCount}
              </span>
              {currentQ?.category && (
                <span className="text-[11px] font-medium bg-muted/60 px-2.5 py-0.5 rounded-md text-muted-foreground">
                  {currentQ.category}
                </span>
              )}
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
              {currentIndex + 1}. {currentQ?.question}
            </div>

            {/* Options List */}
            <div className="space-y-2.5 pt-1">
              {currentQ?.options.map((opt) => {
                const isSelected = currentSelectedKey === opt.key;
                const isCorrectOpt = opt.key === currentQ.correct;

                let rowStyle = 'border-border/60 bg-card hover:border-brand/40 hover:bg-muted/30 text-foreground';

                if (isCurrentSubmitted) {
                  if (isCorrectOpt) {
                    rowStyle = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 font-medium';
                  } else if (isSelected && !isCorrectOpt) {
                    rowStyle = 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200 font-medium';
                  } else {
                    rowStyle = 'border-border/30 bg-muted/20 opacity-50 text-muted-foreground';
                  }
                } else if (isSelected) {
                  rowStyle = 'border-brand bg-brand/5 text-foreground font-medium';
                }

                return (
                  <div
                    key={opt.key}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectOption(opt.key)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectOption(opt.key);
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none text-xs sm:text-sm',
                      rowStyle
                    )}
                  >
                    {/* Key badge (A, B, C, D) */}
                    <div
                      className={cn(
                        'h-6 w-6 rounded-lg border flex items-center justify-center shrink-0 transition-all font-semibold text-xs',
                        isCurrentSubmitted
                          ? isCorrectOpt
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : isSelected
                            ? 'border-rose-500 bg-rose-500 text-white'
                            : 'border-border text-muted-foreground bg-muted/40'
                          : isSelected
                          ? 'border-brand bg-brand text-white shadow-xs'
                          : 'border-border text-muted-foreground bg-muted/30'
                      )}
                    >
                      {isCurrentSubmitted ? (
                        isCorrectOpt ? (
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        ) : isSelected ? (
                          <span className="text-xs">✕</span>
                        ) : opt.key
                      ) : (
                        opt.key
                      )}
                    </div>

                    {/* Option Text */}
                    <div className="flex-1 min-w-0 font-normal leading-relaxed">
                      {opt.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons: Previous | Submit Answer | Next */}
            <div className="flex items-center justify-between pt-4 border-t border-border/60 gap-3">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={handlePrevious}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-colors',
                  currentIndex > 0
                    ? 'border-border bg-card text-foreground hover:bg-muted cursor-pointer'
                    : 'border-border/30 opacity-40 text-muted-foreground cursor-not-allowed'
                )}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Câu trước</span>
              </button>

              <div className="flex items-center gap-2">
                {!isCurrentSubmitted ? (
                  <button
                    type="button"
                    disabled={!currentSelectedKey}
                    onClick={handleSubmitCurrent}
                    className={cn(
                      'px-4 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5',
                      currentSelectedKey
                        ? 'bg-brand hover:bg-brand/90 text-white shadow-xs cursor-pointer'
                        : 'bg-muted border border-border/50 text-muted-foreground opacity-60 cursor-not-allowed'
                    )}
                  >
                    <span>Kiểm tra đáp án</span>
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground px-2 font-medium">
                    Đã trả lời
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-1.5 rounded-xl bg-brand hover:bg-brand/90 text-white font-medium text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                >
                  <span>{currentIndex === totalCount - 1 ? 'Tổng kết' : 'Câu tiếp'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Instant Feedback Card (Correct / Incorrect + Explanation) */}
            <AnimatePresence>
              {isCurrentSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className={cn(
                    'p-4 sm:p-5 rounded-xl border space-y-2.5 mt-4 text-xs sm:text-sm',
                    isCurrentCorrect
                      ? 'bg-emerald-500/8 border-emerald-500/25'
                      : 'bg-rose-500/8 border-rose-500/25'
                  )}
                >
                  {/* Status Banner */}
                  <div className="flex items-center gap-2 font-semibold">
                    {isCurrentCorrect ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-300 font-medium">Chính xác! Làm rất tốt.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        <span className="text-rose-700 dark:text-rose-300 font-medium">Chưa chính xác!</span>
                      </>
                    )}
                  </div>

                  {/* Answers recap */}
                  <div className="space-y-1 text-xs">
                    {!isCurrentCorrect && (
                      <div>
                        <span className="text-muted-foreground">Đáp án của bạn: </span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          {currentSelectedKey}. {currentSelectedOption?.text}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Đáp án đúng: </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {currentQ.correct}. {currentCorrectOption?.text}
                      </span>
                    </div>
                  </div>

                  {/* Explanation */}
                  {currentQ.explanation && (
                    <div className="pt-2 border-t border-border/40 text-xs text-foreground/80 leading-relaxed">
                      <div className="font-semibold text-foreground mb-1">Giải thích chi tiết:</div>
                      <p className="font-normal">{currentQ.explanation}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right Side: Questions Palette Grid ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 space-y-4 shadow-2xs sticky top-24">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Bảng Câu Hỏi
              </h3>
              <span className="text-xs text-muted-foreground font-medium">
                {answeredCount}/{totalCount}
              </span>
            </div>

            {/* Questions Grid 5 items per row */}
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isSub = !!submittedQuestions[q.id];
                const isSelected = !!selectedAnswers[q.id];
                const isCorrect = isSub && selectedAnswers[q.id] === q.correct;

                let btnStyle = 'border-border/60 bg-card text-foreground/80 hover:bg-muted/60';

                if (isSub) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-500 text-white font-medium';
                  } else {
                    btnStyle = 'border-rose-500 bg-rose-500 text-white font-medium';
                  }
                } else if (isSelected) {
                  btnStyle = 'border-brand bg-brand/10 text-brand font-medium';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleJumpToQuestion(idx)}
                    className={cn(
                      'h-8 rounded-lg border text-xs font-medium transition-all flex items-center justify-center cursor-pointer',
                      btnStyle,
                      isCurrent && 'ring-2 ring-brand ring-offset-1 ring-offset-background'
                    )}
                    title={`Câu ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend indicator */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-2.5 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-emerald-500 shrink-0" />
                <span>Đúng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-rose-500 shrink-0" />
                <span>Sai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded ring-2 ring-brand bg-brand/10 shrink-0" />
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded border border-border bg-card shrink-0" />
                <span>Chưa làm</span>
              </div>
            </div>

            {/* Finish practice button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsFinished(true)}
                className="w-full py-2 rounded-xl bg-muted/50 hover:bg-muted text-foreground font-medium text-xs border border-border/60 transition-colors cursor-pointer"
              >
                Kết thúc &amp; Xem tổng kết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
