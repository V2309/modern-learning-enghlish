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
      <div className="p-8 md:p-12 rounded-3xl bg-card border border-border text-center space-y-6">
        <div className="h-14 w-14 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
          <FileQuestion className="h-7 w-7" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-foreground">
            Chưa có bài tập thực hành
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bài học "{lesson?.title || 'này'}" hiện chưa có câu hỏi luyện tập trong cơ sở dữ liệu.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBackToVideo}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/95 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Xem Video bài học</span>
          </button>

          {onNextLesson && (
            <button
              type="button"
              onClick={onNextLesson}
              className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted font-bold text-xs text-foreground transition-all flex items-center gap-2 cursor-pointer"
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
      <div className="p-8 md:p-12 rounded-3xl bg-card border border-border text-center space-y-8 shadow-sm">
        <div className="max-w-md mx-auto space-y-3">
          <div
            className={cn(
              'h-16 w-16 rounded-2xl flex items-center justify-center mx-auto',
              isPassed ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
            )}
          >
            <Award className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            Kết quả bài luyện tập
          </h3>
          <p className="text-sm text-muted-foreground">
            Bạn đã hoàn thành <strong className="text-foreground">{submittedCount}/{totalCount}</strong> câu hỏi.
          </p>
          <div className="text-3xl font-extrabold text-primary py-2">
            {correctCount} / {totalCount} đúng
          </div>
          <p className="text-xs text-muted-foreground">
            {isPassed
              ? 'Xuất sắc! Bạn đã vượt qua bài luyện tập này.'
              : 'Hãy xem lại các câu sai để nắm vững kiến thức hơn nhé.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleResetPractice}
            className="px-5 py-3 rounded-xl border border-border bg-card hover:bg-muted font-bold text-xs text-foreground transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Làm lại từ đầu</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsFinished(false);
              setCurrentIndex(0);
            }}
            className="px-5 py-3 rounded-xl border border-border bg-card hover:bg-muted font-bold text-xs text-foreground transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Xem lại từng câu</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onCompletePractice();
            }}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Hoàn thành bài tập</span>
          </button>

          {onNextLesson && (
            <button
              type="button"
              onClick={onNextLesson}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Bài tiếp theo</span>
              <ArrowRight className="h-4 w-4" />
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
      <div className="p-5 md:p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        {/* Left Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToVideo}
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Play className="h-3 w-3" />
              <span>Xem Video bài học</span>
            </button>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-xs font-bold text-primary">
              {currentQ?.category || 'Luyện tập'}
            </span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-foreground truncate">
            Luyện tập: {lesson?.title || 'Bài học'}
          </h2>
        </div>

        {/* Right Progress */}
        <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-border/60">
          <div className="text-right">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Progress
            </div>
            <div className="text-xs font-extrabold text-foreground">
              {answeredCount} / {totalCount} answered
            </div>
          </div>
          <div className="w-28 sm:w-36 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Grid: Question Card (Left) & Question Palette (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left / Center Focus: Question Card ── */}
        <div className="lg:col-span-8 space-y-5">
          <div className="p-6 md:p-8 rounded-2xl bg-card border border-border space-y-6 shadow-sm">
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Question {currentIndex + 1} of {totalCount}
              </span>
              {currentQ?.category && (
                <span className="text-[11px] font-semibold bg-muted px-2.5 py-1 rounded-md text-muted-foreground">
                  {currentQ.category}
                </span>
              )}
            </div>

            {/* Question Text */}
            <div className="text-base md:text-lg font-semibold text-foreground leading-relaxed">
              {currentIndex + 1}. {currentQ?.question}
            </div>

            {/* Options List (Single-choice row cards) */}
            <div className="space-y-3 pt-2">
              {currentQ?.options.map((opt) => {
                const isSelected = currentSelectedKey === opt.key;
                const isCorrectOpt = opt.key === currentQ.correct;

                let rowStyle = 'border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/30 text-foreground';

                if (isCurrentSubmitted) {
                  if (isCorrectOpt) {
                    rowStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold';
                  } else if (isSelected && !isCorrectOpt) {
                    rowStyle = 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold';
                  } else {
                    rowStyle = 'border-border/40 bg-muted/20 opacity-50 text-muted-foreground';
                  }
                } else if (isSelected) {
                  rowStyle = 'border-primary bg-primary/5 text-primary font-semibold shadow-xs';
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
                      'w-full flex items-center gap-3.5 p-4 rounded-xl border transition-all cursor-pointer select-none text-sm',
                      rowStyle
                    )}
                  >
                    {/* Radio circle */}
                    <div
                      className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                        isCurrentSubmitted
                          ? isCorrectOpt
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : isSelected
                            ? 'border-rose-500 bg-rose-500 text-white'
                            : 'border-muted-foreground/40'
                          : isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-muted-foreground/40'
                      )}
                    >
                      {isCurrentSubmitted ? (
                        isCorrectOpt ? (
                          <Check className="h-3 w-3 stroke-[3]" />
                        ) : isSelected ? (
                          <span className="text-[10px] font-bold">✕</span>
                        ) : null
                      ) : isSelected ? (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      ) : null}
                    </div>

                    {/* Option Text */}
                    <div className="flex-1 min-w-0">
                      <span className="font-bold mr-2">{opt.key}.</span>
                      <span>{opt.text}</span>
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
                  'px-4 py-2.5 rounded-xl border border-border font-bold text-xs flex items-center gap-1.5 transition-all',
                  currentIndex > 0
                    ? 'hover:bg-muted text-foreground cursor-pointer'
                    : 'opacity-40 text-muted-foreground cursor-not-allowed'
                )}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {!isCurrentSubmitted ? (
                  <button
                    type="button"
                    disabled={!currentSelectedKey}
                    onClick={handleSubmitCurrent}
                    className={cn(
                      'px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm',
                      currentSelectedKey
                        ? 'bg-primary hover:bg-primary/95 text-white cursor-pointer'
                        : 'bg-muted text-muted-foreground opacity-60 cursor-not-allowed'
                    )}
                  >
                    <span>Submit Answer</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-muted-foreground px-2">
                    Submitted
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span>{currentIndex === totalCount - 1 ? 'Finish' : 'Next'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Instant Feedback Card (Correct / Incorrect + Explanation) */}
            <AnimatePresence>
              {isCurrentSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={cn(
                    'p-5 rounded-xl border space-y-3 mt-4 text-xs md:text-sm',
                    isCurrentCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-rose-500/10 border-rose-500/30'
                  )}
                >
                  {/* Status Banner */}
                  <div className="flex items-center gap-2 font-bold text-sm md:text-base">
                    {isCurrentCorrect ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-300">✓ Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                        <span className="text-rose-700 dark:text-rose-300">✕ Incorrect</span>
                      </>
                    )}
                  </div>

                  {/* Answers recap */}
                  <div className="space-y-1 text-xs">
                    {!isCurrentCorrect && (
                      <div>
                        <span className="text-muted-foreground">Your Answer: </span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {currentSelectedKey}. {currentSelectedOption?.text}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Correct Answer: </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {currentQ.correct}. {currentCorrectOption?.text}
                      </span>
                    </div>
                  </div>

                  {/* Explanation */}
                  {currentQ.explanation && (
                    <div className="pt-2 border-t border-border/40 text-xs text-foreground/80 leading-relaxed">
                      <div className="font-bold text-foreground mb-1">Explanation:</div>
                      <p>{currentQ.explanation}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right Side: Questions Palette Grid (1 to N) ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 md:p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm sticky top-24">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Questions
              </h3>
              <span className="text-xs text-muted-foreground font-semibold">
                {answeredCount}/{totalCount}
              </span>
            </div>

            {/* Questions Grid 5 items per row */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isSub = !!submittedQuestions[q.id];
                const isSelected = !!selectedAnswers[q.id];
                const isCorrect = isSub && selectedAnswers[q.id] === q.correct;

                let btnStyle = 'border-border bg-card text-foreground hover:bg-muted';

                if (isSub) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-500 text-white font-bold';
                  } else {
                    btnStyle = 'border-rose-500 bg-rose-500 text-white font-bold';
                  }
                } else if (isSelected) {
                  btnStyle = 'border-primary/50 bg-primary/10 text-primary font-bold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleJumpToQuestion(idx)}
                    className={cn(
                      'h-10 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer',
                      btnStyle,
                      isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    )}
                    title={`Câu ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend indicator */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-3 border-t border-border/60">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-emerald-500 shrink-0" />
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-rose-500 shrink-0" />
                <span>Incorrect</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md ring-2 ring-primary bg-primary/10 shrink-0" />
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md border border-border bg-card shrink-0" />
                <span>Unanswered</span>
              </div>
            </div>

            {/* Finish practice button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsFinished(true)}
                className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted-foreground/10 text-foreground font-bold text-xs border border-border transition-all cursor-pointer"
              >
                Kết thúc & Xem tổng kết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
