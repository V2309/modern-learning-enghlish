import React from 'react';
import { getCurrentUser } from '@/services/user.service';
import { getDashboardStats } from '@/services/dashboard.service';
import { User, Mail, Shield, Calendar, ShieldCheck } from 'lucide-react';

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Vui lòng đăng nhập để xem thông tin cá nhân.
      </div>
    );
  }

  const stats = await getDashboardStats(user.uid);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Tài khoản cá nhân</h1>
        <p className="text-muted-foreground text-lg">Quản lý thông tin hồ sơ và thông số thiết lập tài khoản.</p>
      </div>

      {/* Main card */}
      <div className="bg-card border border-border rounded-[2.5rem] p-8 sm:p-10 shadow-xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-border">
          <div className="h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-bold text-4xl text-primary shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{user.name}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Đã kích hoạt
              </span>
              <span>•</span>
              <span>Học viên thông thái</span>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="grid sm:grid-cols-2 gap-8 pt-4">
          <div className="space-y-6">
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Thông tin cơ bản</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-muted rounded-xl text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Họ và tên</span>
                  <span className="text-sm font-semibold text-foreground">{user.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-muted rounded-xl text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Địa chỉ Email</span>
                  <span className="text-sm font-semibold text-foreground">{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Bảo mật & Hệ thống</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-muted rounded-xl text-muted-foreground">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Mã định danh User</span>
                  <span className="text-sm font-mono font-bold text-foreground/80">{user.uid}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-muted rounded-xl text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Ngày tham gia hệ thống</span>
                  <span className="text-sm font-semibold text-foreground">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Short stats summary */}
        <div className="pt-8 border-t border-border grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Từ vựng đã tích luỹ</span>
            <span className="text-2xl font-black text-emerald-500">{stats.vocabMastered} từ</span>
          </div>
          <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Chương học đã qua</span>
            <span className="text-2xl font-black text-primary">{stats.lessonsCompleted} bài</span>
          </div>
        </div>
      </div>
    </div>
  );
}
