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
            className="relative w-full max-w-md bg-white dark:bg-[#0f1115] border border-[#e5e7eb] dark:border-[#1f2937] rounded-none shadow-2xl overflow-hidden"
          >
            <div className="p-7 flex items-start gap-5">
              <div className="h-10 w-10 rounded-none bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground mb-1.5">{title}</h2>
                {description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                )}
              </div>
              <button
                onClick={onCancel}
                className="p-1.5 rounded-none hover:bg-muted text-muted-foreground transition-colors shrink-0 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-7 pb-7 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-none border border-[#e5e7eb] dark:border-[#1f2937] bg-transparent hover:bg-muted text-foreground text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Huỷ
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-none bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              >
                {isLoading ? 'Đang xoá...' : 'Xác nhận xoá'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
