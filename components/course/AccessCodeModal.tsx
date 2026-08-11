'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Loader2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { redeemAccessCodeAction } from '@/actions/courseAccess.action';
import { toast } from 'react-hot-toast';

interface AccessCodeModalProps {
  show: boolean;
  course: {
    id: string;
    title: string;
    thumbnail: string;
    price?: number | null;
  };
  onClose: () => void;
  onSuccess: (courseId: string) => void;
}

export const AccessCodeModal = ({ show, course, onClose, onSuccess }: AccessCodeModalProps) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!show) {
      setCode('');
      setError('');
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() && (course.price ?? 0) > 0) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await redeemAccessCodeAction(course.id, code.trim());
      if (res.success) {
        toast.success('Truy cập thành công! Chào mừng bạn đến với khóa học.');
        onSuccess(course.id);
      } else {
        setError(res.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFree = (course.price ?? 0) === 0;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header with thumbnail */}
            <div className="relative h-36 overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-4 left-5 right-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-0.5">
                  {isFree ? 'Khóa học miễn phí' : 'Cần mã truy cập'}
                </p>
                <h3 className="text-white font-extrabold text-lg leading-tight line-clamp-1">
                  {course.title}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-7 space-y-5">
              {isFree ? (
                <div className="text-center space-y-3">
                  <div className="h-14 w-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Khóa học miễn phí!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bạn có thể truy cập ngay mà không cần mã.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">Nhập mã truy cập</p>
                      <p className="text-xs text-muted-foreground">
                        Nhận mã khi mua khóa học từ chúng tôi.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                        placeholder="VD: TOEIC-2025-ABCD"
                        autoFocus
                        className="w-full pl-11 pr-4 py-3 bg-muted border border-border rounded-2xl text-foreground font-mono text-sm tracking-widest focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground placeholder:tracking-normal placeholder:font-sans"
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-destructive text-xs font-semibold px-1"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-7 pb-7">
              <button
                onClick={handleSubmit}
                disabled={isLoading || (!isFree && !code.trim())}
                className="w-full py-3.5 bg-primary disabled:opacity-50 disabled:grayscale text-white rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xác thực...
                  </>
                ) : isFree ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Đăng ký miễn phí ngay
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    Xác nhận mã truy cập
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
