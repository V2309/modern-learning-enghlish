"use client";

import React, { useState, useEffect } from "react";
import { Headphones, CheckCircle2, ArrowLeft, Loader2, Sparkles, HelpCircle, Check, Award } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import DictationAudioPlayer from "./DictationAudioPlayer";
import DictationProgress from "./DictationProgress";
import DictationResult from "./DictationResult";
import DictationCompletion from "./DictationCompletion";
import DictationMistakes from "./DictationMistakes";
import { submitDictationAnswer, getTopicAttempts } from "@/actions/dictation/attempt.actions";
import { toggleDictationTopicCompletionAction } from "@/actions/dictation/topic.actions";
import toast from "react-hot-toast";

interface Sentence {
  id: string;
  audioUrl: string;
  duration: number;
  order: number;
}

interface Topic {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  level: string;
  isCompleted?: boolean;
}

interface DictationPracticeProps {
  topic: Topic;
  sentences: Sentence[];
  startFromIndex: number;
}

export default function DictationPractice({
  topic,
  sentences,
  startFromIndex = 0,
}: DictationPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(startFromIndex);
  const [userAnswer, setUserAnswer] = useState("");
  const [status, setStatus] = useState<"practice" | "submitting" | "result" | "completed" | "mistakes">("practice");
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [completing, setCompleting] = useState(false);
  const [isTopicCompleted, setIsTopicCompleted] = useState(!!topic.isCompleted);

  // Track best score for each sentence in this session to calculate overall average
  const [bestScores, setBestScores] = useState<Record<string, number>>({});

  // Reference trigger to programmatically handle player audio triggers if needed
  const [audioKey, setAudioKey] = useState(0);

  // Load previous attempts on mount to pre-populate best scores
  useEffect(() => {
    async function loadAttempts() {
      const res = await getTopicAttempts(topic.id);
      if (res.success && res.attempts) {
        const scores: Record<string, number> = {};
        res.attempts.forEach((att: any) => {
          if (scores[att.sentenceId] === undefined || att.accuracy > scores[att.sentenceId]) {
            scores[att.sentenceId] = att.accuracy;
          }
        });
        setBestScores(scores);
      }
    }
    loadAttempts();
  }, [topic.id]);

  if (!sentences || sentences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-3xl bg-muted/20">
        <Headphones className="h-12 w-12 text-muted-foreground/60 mb-3 animate-bounce" />
        <h3 className="text-lg font-bold text-foreground">No sentences found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          This topic doesn't have any sentences added yet. Please contact an admin.
        </p>
        <Link href="/dictation" className="mt-5">
          <button className="px-5 py-2.5 rounded-xl border border-border bg-card font-semibold text-sm hover:bg-muted text-foreground transition-all">
            Back to Topics
          </button>
        </Link>
      </div>
    );
  }

  const currentSentence = sentences[currentIndex];

  const handleSubmit = async () => {
    if (status !== "practice") return;
    if (!userAnswer.trim()) {
      toast.error("Please type what you hear before checking!");
      return;
    }

    setStatus("submitting");
    try {
      const res = await submitDictationAnswer(currentSentence.id, userAnswer);
      if (res.success && res.comparison && res.attempt) {
        setCurrentResult(res.comparison);

        // Update best score map
        setBestScores((prev) => ({
          ...prev,
          [currentSentence.id]: Math.max(prev[currentSentence.id] || 0, res.attempt!.accuracy),
        }));

        setStatus("result");
      } else {
        toast.error(res.error || "Failed to check answer. Please try again.");
        setStatus("practice");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during submission.");
      setStatus("practice");
    }
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer("");
      setCurrentResult(null);
      setStatus("practice");
      setAudioKey((k) => k + 1); // trigger audio player reload
    } else {
      toast.success("Last sentence reached! You can keep practicing or click 'Mark as Completed' above.");
    }
  };

  const handleReplayAudio = () => {
    setAudioKey((k) => k + 1);
  };

  const handleTryAgain = () => {
    setCurrentIndex(0);
    setUserAnswer("");
    setCurrentResult(null);
    setStatus("practice");
    setAudioKey((k) => k + 1);
  };

  const handleMarkCompleted = async () => {
    setCompleting(true);
    try {
      const res = await toggleDictationTopicCompletionAction(topic.id, true);
      if (res.success) {
        setIsTopicCompleted(true);
        setStatus("completed");
        toast.success("Topic completed!");
      } else {
        toast.error(res.error || "Failed to save completion status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error occurred while saving progress.");
    } finally {
      setCompleting(false);
    }
  };

  const handleMarkIncomplete = async () => {
    setCompleting(true);
    try {
      const res = await toggleDictationTopicCompletionAction(topic.id, false);
      if (res.success) {
        setIsTopicCompleted(false);
        toast.success("Topic marked as incomplete.");
      } else {
        toast.error(res.error || "Failed to update completion status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error occurred while saving progress.");
    } finally {
      setCompleting(false);
    }
  };

  // Keyboard shortcut Ctrl + Enter to submit or go next
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      if (status === "practice") {
        handleSubmit();
      } else if (status === "result") {
        handleNext();
      }
    }
  };

  // Calculate stats for completion screen
  const completedSentencesCount = sentences.filter((s) => bestScores[s.id] !== undefined).length;
  const totalAccuracySum = sentences.reduce((sum, s) => sum + (bestScores[s.id] || 0), 0);
  const averageAccuracy = completedSentencesCount > 0
    ? Math.round(totalAccuracySum / completedSentencesCount)
    : 0;

  // Mistakes filter
  const mistakesList = sentences
    .map((s, idx) => ({
      index: idx,
      sentenceId: s.id,
      accuracy: bestScores[s.id] || 0,
    }))
    .filter((item) => bestScores[item.sentenceId] !== undefined && item.accuracy < 90);

  if (status === "completed") {
    return (
      <DictationCompletion
        topicTitle={topic.title}
        totalSentences={sentences.length}
        averageAccuracy={averageAccuracy}
        hasMistakes={mistakesList.length > 0}
        onReviewMistakes={() => setStatus("mistakes")}
        onTryAgain={handleTryAgain}
      />
    );
  }

  if (status === "mistakes") {
    return (
      <DictationMistakes
        mistakes={mistakesList}
        onSelectSentence={(idx) => {
          setCurrentIndex(idx);
          setUserAnswer("");
          setCurrentResult(null);
          setStatus("practice");
          setAudioKey((k) => k + 1);
        }}
        onBack={() => setStatus("completed")}
      />
    );
  }

  return (
    <div className=" mx-auto w-full flex flex-col gap-6" onKeyDown={handleKeyDown}>
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <Link href="/dictation" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft size={16} />
          <span>Exit Practice</span>
        </Link>

        {/* Mark Completed Button */}
        {isTopicCompleted ? (
          <button
            onClick={handleMarkIncomplete}
            disabled={completing}
            className="cursor-pointer inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-2xl bg-green-500/10 hover:bg-green-500/20 text-green-600 border border-green-500/20 font-bold text-xs transition-all active:scale-98 disabled:opacity-50"
            title="Click to mark as incomplete"
          >
            {completing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            <span>Completed</span>
          </button>
        ) : (
          <button
            onClick={handleMarkCompleted}
            disabled={completing}
            className="cursor-pointer inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs transition-all active:scale-98 disabled:opacity-50 shadow-sm"
          >
            {completing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}
            <span>Mark Completed</span>
          </button>
        )}
      </div>

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground mb-1">
            {topic.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Switch sentences using numbers, listen and transcribe your answer.
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary uppercase self-start sm:self-auto">
          {topic.level}
        </span>
      </div>

      {/* Sentence Selector Grid */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/20 border border-border/80 rounded-2xl">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-2 ml-1">Sentences:</span>
        {sentences.map((sentence, idx) => {
          const hasAttempt = bestScores[sentence.id] !== undefined;
          const isActive = idx === currentIndex;
          return (
            <button
              key={sentence.id}
              onClick={() => {
                setCurrentIndex(idx);
                setUserAnswer("");
                setCurrentResult(null);
                setStatus("practice");
                setAudioKey((k) => k + 1);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs cursor-pointer border transition-all ${isActive
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : hasAttempt
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Side-by-Side Symmetrical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Player, Textarea input & Check button */}
        <div className="border border-border bg-card rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
            <Headphones size={16} className="text-primary" />
            <span>Practice Area &mdash; Sentence {currentIndex + 1}</span>
          </h3>

          {/* Custom Audio Player */}
          <DictationAudioPlayer
            key={`${currentSentence.id}-${audioKey}`}
            audioUrl={currentSentence.audioUrl}
          />

          {/* Input box */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Your Transcription
            </label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={status !== "practice"}
              placeholder="Type what you hear..."
              className="w-full min-h-[120px] p-4 border border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-2xl bg-muted/10 outline-none text-foreground text-base leading-relaxed resize-none transition-all placeholder:text-muted-foreground/60 font-medium"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
              <span>Shortcut: <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono font-bold text-[10px]">Ctrl + Enter</kbd> to check</span>
              <span>{userAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>

          {/* Check Button (active during practice status) */}
          {status === "practice" && (
            <button
              onClick={handleSubmit}
              className="w-full cursor-pointer flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-bold text-sm transition-all active:scale-98 shadow-sm"
            >
              <CheckCircle2 size={16} />
              <span>Check Transcription</span>
            </button>
          )}

          {status === "submitting" && (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-muted text-muted-foreground font-bold text-sm border border-border"
            >
              <Loader2 size={16} className="animate-spin" />
              <span>Checking answer...</span>
            </button>
          )}

          {status === "result" && (
            <button
              onClick={() => {
                setUserAnswer("");
                setCurrentResult(null);
                setStatus("practice");
              }}
              className="w-full cursor-pointer flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-sm text-foreground transition-all active:scale-98"
            >
              <span>Practice Again</span>
            </button>
          )}
        </div>

        {/* RIGHT COLUMN: Submission results card or visual instructions placeholder */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {status === "result" && currentResult ? (
              <motion.div
                key="result-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DictationResult
                  accuracy={currentResult.accuracy}
                  correctWords={currentResult.correctWords}
                  wrongWords={currentResult.wrongWords}
                  missingWords={currentResult.missingWords}
                  extraWords={currentResult.extraWords}
                  words={currentResult.words}
                  transcript={currentResult.transcript}
                  userAnswer={userAnswer}
                  onNext={handleNext}
                  onReplayAudio={handleReplayAudio}
                  isLastSentence={currentIndex === sentences.length - 1}
                />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-dashed border-border rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[420px] bg-muted/5"
              >
                <HelpCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <h3 className="text-base font-bold text-foreground">Waiting for submission</h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
                  Listen to the sentence audio on the left, type what you hear, and click <strong className="text-foreground">Check Transcription</strong> to see comparison analysis here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
