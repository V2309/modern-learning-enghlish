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
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md bg-card border border-border rounded-none shadow-2xl overflow-hidden"
          >
            {/* Header with thumbnail */}
            <div className="relative h-36 overflow-hidden border-b border-border">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-3.5 right-3.5 p-2 rounded-none bg-black/60 border border-white/20 text-white hover:bg-black/80 transition-all cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>
              <div className="absolute bottom-3.5 left-5 right-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-2 py-0.5 rounded-none border border-brand/20 inline-block mb-1">
                  {isFree ? 'Khóa học miễn phí' : 'Cần mã truy cập'}
                </p>
                <h3 className="text-white font-bold text-lg leading-tight line-clamp-1">
                  {course.title}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-7 space-y-4">
              {isFree ? (
                <div className="text-center space-y-3 py-2">
                  <div className="h-12 w-12 rounded-none bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6 text-brand stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-base">Khóa học hoàn toàn miễn phí!</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      Bạn có thể truy cập và bắt đầu học ngay mà không cần mã.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-none bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                      <Lock className="h-5 w-5 text-brand stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">Nhập Mã Truy Cập</p>
                      <p className="text-xs text-muted-foreground font-medium">
                        Nhận mã kích hoạt khi đăng ký khóa học từ hệ thống.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-2.5">
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                        placeholder="VD: TOEIC-2026-ABCD"
                        autoFocus
                        className="w-full pl-11 pr-4 py-3 bg-muted/40 border border-border rounded-none text-foreground font-bold text-sm tracking-widest uppercase focus:outline-none focus:border-brand transition-all placeholder:text-muted-foreground/60 placeholder:tracking-normal"
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-destructive text-xs font-bold px-1"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 sm:px-7 sm:pb-7">
              <button
                onClick={handleSubmit}
                disabled={isLoading || (!isFree && !code.trim())}
                className="w-full py-3 rounded-none border border-border bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang xác thực mã...</span>
                  </>
                ) : isFree ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                    <span>Đăng Ký Miễn Phí Ngay</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 stroke-[2.5]" />
                    <span>Xác Nhận &amp; Mở Khóa Học</span>
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
