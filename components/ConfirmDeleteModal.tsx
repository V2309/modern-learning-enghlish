'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  show: boolean;
  title: string;
  description?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  show,
  title,
  description,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-background/90 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-card border border-border rounded-4xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 flex items-start gap-5">
              <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
                {description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                )}
              </div>
              <button
                onClick={onCancel}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-8 pb-8 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-2xl border border-border bg-muted hover:bg-muted/80 text-foreground font-bold transition-all"
              >
                Huỷ
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold transition-all"
              >
                {isLoading ? 'Đang xoá...' : 'Xoá'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
