'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, PlayCircle, Sparkles, Languages } from 'lucide-react';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Language Learning</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
            Master Vocabulary with <span className="text-primary italic">Linguify</span>
          </h1>
          
          <p className="text-xl text-muted-foreground">
            Expand your vocabulary with AI word families, pronunciation guides, and interactive lessons tailored for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
            <Link
              href="/vocabulary"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group"
            >
              <BookOpen className="h-5 w-5" />
              Start Learning
              <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            </Link>
            <Link
              href="/courses"
              className="w-full sm:w-auto px-8 py-4 bg-muted border border-border text-foreground rounded-xl font-bold hover:bg-muted/80 transition-all flex items-center justify-center gap-2"
            >
              <PlayCircle className="h-5 w-5" />
              Explore Courses
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-32">
        {[
          {
            title: "AI Word Families",
            description: "Go beyond definitions. Understand how words are related and how to use them in different contexts.",
            icon: Sparkles,
          },
          {
            title: "IPA & Audio Guides",
            description: "Perfect your pronunciation with international phonetic symbols and high-quality audio examples.",
            icon: Languages,
          },
          {
            title: "Practice Mode",
            description: "Interactive exercises designed to reinforce your learning and ensure long-term retention.",
            icon: BookOpen,
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors group shadow-sm"
          >
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
