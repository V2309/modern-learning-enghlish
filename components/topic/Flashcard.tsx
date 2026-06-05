'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Languages, RefreshCw, Sparkles } from 'lucide-react';
import { Vocabulary } from '@/data/mockData';

export const Flashcard = ({
  word,
  speak,
}: {
  word: Vocabulary;
  speak: (t: string) => void;
}) => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  return (
    <div
      className="relative w-full h-[380px] cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -180 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-2xl flex flex-col items-center justify-center space-y-6 text-slate-900 backface-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider border border-primary/20">
              {word.partOfSpeech}
            </span>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-center text-slate-900">
              {word.word}
            </h1>
            <div className="flex items-center gap-4 text-slate-500 text-sm font-medium mt-4">
              <Sparkles className="h-4 w-4" />
              Click to Reveal Meaning
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ opacity: 0, rotateY: -180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 180 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-2xl flex flex-col items-center justify-center space-y-8 relative text-slate-900 backface-hidden"
          >
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -ml-32 -mb-32" />
            <div className="absolute top-6 right-6 flex items-center gap-2 text-primary/60 text-xs font-bold uppercase tracking-widest">
              <RefreshCw className="h-3 w-3" />
              Click to Hide
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-primary mb-1">Meaning</h2>
              <p className="text-3xl font-medium text-slate-900">{word.meaning}</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                <Languages className="h-5 w-5 text-primary" />
                <span className="font-mono text-xl tracking-wide">
                  {word.pronunciation || '/.../'}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speak(word.word);
                }}
                className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all group"
              >
                <Volume2 className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="w-full space-y-2 text-center pt-4 border-t border-slate-100 max-h-[140px] overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Example Usage</h4>
              {(word.examples && word.examples.length > 0 ? word.examples : [word.example]).map((ex, exIdx) => (
                <p key={exIdx} className="text-sm italic leading-relaxed px-4 text-slate-600">
                  "{ex}"
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
