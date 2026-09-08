import React from 'react';
import { getCurrentUser } from '@/services/user.service';
import {
  getDashboardStats,
  getRecentLearning,
  getLearningStreak,
  getDailyActivity,
  getTodoDashboardSummary,
} from '@/services/dashboard.service';
import {
  BookOpen,
  CheckCircle,
  Award,
  Flame,
  Calendar,
  BookOpenCheck,
  ChevronRight,
  Video,
  ListTodo,
  CheckSquare,
  Headphones,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import LearningHeatmap from '@/components/dashboard/LearningHeatmap';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import TopicProgressList from '@/components/dashboard/TopicProgressList';
import { DashboardStreakCard } from '@/components/streak/DashboardStreakCard';
import { ClayMedalDuo, ClayBookBrand, ClayTodoSky } from '@/components/dashboard/ThreeDClayIcons';

export const dynamic = 'force-dynamic';



export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="w-full py-16 text-center text-muted-foreground">
        Vui lòng đăng nhập để xem bảng thống kê học tập.
      </div>
    );
  }

  const [stats, recentActivity, streakData, activityMap, todoSummary] = await Promise.all([
    getDashboardStats(user.uid),
    getRecentLearning(user.uid),
    getLearningStreak(user.uid),
    getDailyActivity(user.uid),
    getTodoDashboardSummary(user.uid),
  ]);

  const userInitials = (user.name || 'User')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="w-full space-y-8">
      {/* ── 1. COMPACT PREMIUM HEADER ── */}

      <div className="p-6 sm:p-7 rounded-3xl card-3d-surface flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Specular highlight */}
        <div className="absolute inset-x-6 top-1 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-brand/15 text-brand text-[10px] font-black tracking-wider uppercase border border-brand/30 shadow-[0_2px_0_0_rgba(241,116,99,0.3)]">
              Tổng Quan Cá Nhân
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-bold">
              <Calendar className="h-3.5 w-3.5 text-brand" />
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Chào mừng trở lại, <span className="text-brand drop-shadow-xs">{user.name}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Hôm nay bạn đã sẵn sàng bứt phá mục tiêu tiếng Anh chưa?
          </p>
        </div>

        {/* Quick Action 3D Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <Link
            href="/courses"
            className="btn-3d-brand px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <BookOpen className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Tiếp Tục Học</span>
          </Link>
          <Link
            href="/vocabulary"
            className="btn-3d-duo px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Ôn Từ Vựng</span>
          </Link>
          <Link
            href="/shadowing"
            className="btn-3d-sky px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Video className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Shadowing</span>
          </Link>
        </div>
      </div>

      {/* ── 2. 3D CALIBRATED BENTO METRIC GRID (4 Primary KPI Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: 3D Streak & Consistency */}
        <DashboardStreakCard initialStreakData={streakData} />

        {/* Card 2: 3D Vocabulary Retention (Duo Banana Green #58CC02) */}
        <div className="p-6 rounded-3xl card-3d-duo flex flex-col justify-between space-y-4 relative overflow-hidden group select-none">
          <div className="absolute inset-x-4 top-1 h-1.5 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <span className="text-[11px] font-black text-[#46A302] dark:text-[#58CC02] uppercase tracking-wider drop-shadow-xs pt-1">
              Từ Vựng Đã Thuộc
            </span>
            <ClayMedalDuo size={52} className="-mt-1 -mr-1" />
          </div>
          <div className="relative z-10 space-y-2.5">
            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight drop-shadow-xs group-hover:text-[#58CC02] transition-colors">
              {stats.vocabMastered} <span className="text-sm font-bold text-muted-foreground">/ {stats.totalVocab} từ</span>
            </div>
            {/* 3D Chunky Inset Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800/90 rounded-full h-3.5 p-[2px] border border-black/10 dark:border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)]">
              <div
                className="bg-gradient-to-r from-[#46A302] to-[#58CC02] h-full rounded-full transition-all duration-700 shadow-[0_2px_0_0_#388202] relative"
                style={{ width: `${stats.totalVocab > 0 ? Math.max(6, Math.min(100, Math.round((stats.vocabMastered / stats.totalVocab) * 100))) : 0}%` }}
              >
                <div className="h-1 bg-white/40 rounded-full mx-1 mt-0.5" />
              </div>
            </div>
            <p className="text-[11px] text-[#46A302] dark:text-[#58CC02] font-black">
              Đạt {stats.totalVocab > 0 ? Math.round((stats.vocabMastered / stats.totalVocab) * 100) : 0}% kho từ vựng cốt lõi
            </p>
          </div>
        </div>

        {/* Card 3: 3D Curriculum Progress */}
        <div className="p-6 rounded-3xl card-3d-brand flex flex-col justify-between space-y-4 relative overflow-hidden group select-none">
          <div className="absolute inset-x-4 top-1 h-1.5 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <span className="text-[11px] font-black text-brand uppercase tracking-wider drop-shadow-xs pt-1">
              Bài Học Đã Xong
            </span>
            <ClayBookBrand size={52} className="-mt-1 -mr-1" />
          </div>
          <div className="relative z-10 space-y-2.5">
            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight drop-shadow-xs group-hover:text-brand transition-colors">
              {stats.lessonsCompleted} <span className="text-sm font-bold text-muted-foreground">/ {stats.totalLessons} bài</span>
            </div>
            {/* 3D Chunky Inset Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800/90 rounded-full h-3.5 p-[2px] border border-black/10 dark:border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)]">
              <div
                className="bg-gradient-to-r from-brand to-amber-500 h-full rounded-full transition-all duration-700 shadow-[0_2px_0_0_#b94637] relative"
                style={{ width: `${stats.totalLessons > 0 ? Math.max(6, Math.min(100, Math.round((stats.lessonsCompleted / stats.totalLessons) * 100))) : 0}%` }}
              >
                <div className="h-1 bg-white/40 rounded-full mx-1 mt-0.5" />
              </div>
            </div>
            <p className="text-[11px] text-brand font-bold">
              Đạt {stats.totalLessons > 0 ? Math.round((stats.lessonsCompleted / stats.totalLessons) * 100) : 0}% chương trình học
            </p>
          </div>
        </div>

        {/* Card 4: 3D Today's Tasks / Focus */}
        <div className="p-6 rounded-3xl card-3d-sky flex flex-col justify-between space-y-4 relative overflow-hidden group select-none">
          <div className="absolute inset-x-4 top-1 h-1.5 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <span className="text-[11px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider drop-shadow-xs pt-1">
              Todo Hôm Nay
            </span>
            <ClayTodoSky size={52} className="-mt-1 -mr-1" />
          </div>
          <div className="relative z-10 space-y-2.5">
            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight drop-shadow-xs group-hover:text-sky-500 transition-colors">
              {todoSummary.completedToday} <span className="text-sm font-bold text-muted-foreground">/ {todoSummary.totalTasks} việc</span>
            </div>
            {/* 3D Chunky Inset Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800/90 rounded-full h-3.5 p-[2px] border border-black/10 dark:border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)]">
              <div
                className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full transition-all duration-700 shadow-[0_2px_0_0_#0369a1] relative"
                style={{ width: `${todoSummary.totalTasks > 0 ? Math.max(6, Math.min(100, Math.round((todoSummary.completedToday / todoSummary.totalTasks) * 100))) : 0}%` }}
              >
                <div className="h-1 bg-white/40 rounded-full mx-1 mt-0.5" />
              </div>
            </div>
            <p className="text-[11px] text-sky-600 dark:text-sky-400 font-bold">
              {todoSummary.pendingToday > 0 ? `Còn ${todoSummary.pendingToday} mục tiêu cần hoàn thành` : 'Đã hoàn thành toàn bộ mục tiêu!'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN DASHBOARD CONTENT (8 Cols vs 4 Cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Trackers, Analytics & Heatmap (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Learning Tracks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-brand" />
                <h2 className="text-base font-black text-foreground">Lộ Trình Đang Theo Dõi</h2>
              </div>
              <Link href="/courses" className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {/* Courses Progress Cards */}
              {stats.courseCompletionRates.map((course) => (
                <div
                  key={course.id}
                  className="p-5 sm:p-6 rounded-3xl card-3d-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative group transition-all"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-brand/15 text-brand text-[10px] font-black uppercase border border-brand/30 shadow-[0_2px_0_0_rgba(241,116,99,0.3)]">
                        {course.level}
                      </span>
                      <h3 className="text-base font-bold text-foreground truncate group-hover:text-brand transition-colors">
                        {course.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground font-medium">
                      <span>{course.completedCount} / {course.totalCount} bài học</span>
                      <span>•</span>
                      <span>{course.completedTopicsCount} / {course.totalTopicsCount} chủ đề</span>
                    </div>
                  </div>

                  <div className="w-full sm:w-44 flex items-center gap-3">
                    <div className="flex-1 bg-muted/90 rounded-full h-3 overflow-hidden border border-border/60 shadow-inner p-0.5">
                      <div
                        className="bg-gradient-to-r from-brand to-orange-400 h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{ width: `${course.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-brand w-10 text-right">{course.percentage}%</span>
                  </div>

                  <Link
                    href={`/courses/${course.id}`}
                    className="btn-3d-brand px-5 py-2.5 text-xs font-black rounded-2xl shrink-0 w-full sm:w-auto text-center"
                  >
                    Học Tiếp
                  </Link>
                </div>
              ))}

              {/* Vocabulary Progress Card */}
              {(() => {
                const vocabPercentage =
                  stats.totalTopicsCount > 0
                    ? Math.round((stats.completedTopicsCount / stats.totalTopicsCount) * 100)
                    : 0;
                return (
                  <div className="p-5 sm:p-6 rounded-3xl card-3d-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative group transition-all">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#58CC02]/15 text-[#46A302] dark:text-[#58CC02] text-[10px] font-black uppercase border border-[#58CC02]/30 shadow-[0_2px_0_0_#46A302]">
                          Thư Viện Từ Vựng
                        </span>
                        <h3 className="text-base font-bold text-foreground truncate group-hover:text-[#58CC02] transition-colors">
                          Từ Vựng Theo Chủ Đề
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground font-medium">
                        <span>{stats.vocabMastered} / {stats.totalVocab} từ đã thuộc</span>
                        <span>•</span>
                        <span>{stats.completedTopicsCount} / {stats.totalTopicsCount} chủ đề đã xong</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-44 flex items-center gap-3">
                      <div className="flex-1 bg-muted/90 rounded-full h-3 overflow-hidden border border-border/60 shadow-inner p-0.5">
                        <div
                          className="bg-gradient-to-r from-[#46A302] to-[#58CC02] h-full rounded-full transition-all duration-500 shadow-xs"
                          style={{ width: `${vocabPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-[#46A302] dark:text-[#58CC02] w-10 text-right">
                        {vocabPercentage}%
                      </span>
                    </div>

                    <Link
                      href="/vocabulary"
                      className="btn-3d-duo px-5 py-2.5 text-xs font-black rounded-2xl shrink-0 w-full sm:w-auto text-center"
                    >
                      Ôn Tập
                    </Link>
                  </div>
                );
              })()}


              {/* Shadowing Speaking Card */}
              {(() => {
                const shadowingPercentage =
                  stats.totalShadowingCount > 0
                    ? Math.round((stats.completedShadowingCount / stats.totalShadowingCount) * 100)
                    : 0;
                return (
                  <div className="p-5 sm:p-6 rounded-3xl card-3d-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative group transition-all">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase border border-sky-500/30 shadow-[0_2px_0_0_#0284c7]">
                          Phát Âm & Ngữ Điệu
                        </span>
                        <h3 className="text-base font-bold text-foreground truncate group-hover:text-sky-500 transition-colors">
                          Luyện Nói Shadowing
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground font-medium">
                        <span>{stats.completedShadowingCount} / {stats.totalShadowingCount} video hoàn thành</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-44 flex items-center gap-3">
                      <div className="flex-1 bg-muted/90 rounded-full h-3 overflow-hidden border border-border/60 shadow-inner p-0.5">
                        <div
                          className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-xs"
                          style={{ width: `${shadowingPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-sky-600 dark:text-sky-400 w-10 text-right">
                        {shadowingPercentage}%
                      </span>
                    </div>

                    <Link
                      href="/shadowing"
                      className="btn-3d-sky px-5 py-2.5 text-xs font-black rounded-2xl shrink-0 w-full sm:w-auto text-center"
                    >
                      Luyện Ngay
                    </Link>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Activity Heatmap */}
          <LearningHeatmap userCreatedAt={user.createdAt.toISOString()} activityMap={activityMap} />

          {/* Performance Data Visualisation Charts (Recharts) */}
          <DashboardCharts
            activityMap={activityMap}
            vocabMastered={stats.vocabMastered}
            totalVocab={stats.totalVocab}
            lessonsCompleted={stats.lessonsCompleted}
            totalLessons={stats.totalLessons}
          />

          {/* Topic Progress Breakdown */}
          <TopicProgressList topicCompletionRates={stats.topicCompletionRates} />
        </div>


        {/* RIGHT COLUMN: Todo Widget & Recent Timeline (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* ── 3D Todo Command Widget ── */}
          <div className="card-3d-surface rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-black text-foreground">Kế Hoạch Hôm Nay</h3>
              </div>
              <Link href="/todo" className="text-xs font-bold text-brand hover:underline flex items-center gap-0.5">
                Chi tiết <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {todoSummary.totalTasks === 0 ? (
              <div className="text-center py-6 space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground mx-auto shadow-inner">
                  <ListTodo className="h-6 w-6" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Chưa có nhiệm vụ nào được đặt ra cho hôm nay.</p>
                <Link
                  href="/todo"
                  className="btn-3d-primary px-5 py-2.5 rounded-2xl text-xs font-black inline-flex items-center gap-1.5 shadow-md"
                >
                  <ListTodo className="h-3.5 w-3.5" />
                  <span>Tạo Todo List</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Progress Ring & Numbers */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-muted/40 border border-border/60 shadow-xs">
                  <div className="relative h-14 w-14 shrink-0">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-muted/60" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeDasharray={`${todoSummary.totalTasks > 0 ? Math.round((todoSummary.completedToday / todoSummary.totalTasks) * 100) : 0} ${100 - (todoSummary.totalTasks > 0 ? Math.round((todoSummary.completedToday / todoSummary.totalTasks) * 100) : 0)}`}
                        strokeLinecap="round"
                        className="text-brand transition-all duration-500 drop-shadow-xs"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-brand">
                      {todoSummary.totalTasks > 0 ? Math.round((todoSummary.completedToday / todoSummary.totalTasks) * 100) : 0}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">Hoàn thành hôm nay</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                      <CheckSquare className="h-3.5 w-3.5" />
                      {todoSummary.completedToday} việc đã xong
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {todoSummary.pendingToday} việc đang đợi hoàn thành
                    </p>
                  </div>
                </div>

                <Link
                  href="/todo"
                  className="btn-3d-primary w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <ListTodo className="h-3.5 w-3.5" />
                  <span>Mở Todo & Pomodoro</span>
                </Link>
              </div>
            )}
          </div>

          {/* ── 3D Recent Activity Stream ── */}
          <div className="card-3d-surface rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-black text-foreground">Dòng Hoạt Động Gần Đây</h3>
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground italic font-medium">
                Chưa có hoạt động nào được ghi nhận gần đây.
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3 items-start pb-3 border-b border-border/40 last:border-0 last:pb-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 shadow-xs border ${activity.type === 'lesson'
                          ? 'text-brand bg-brand/10 border-brand/20 shadow-[0_2px_0_0_rgba(241,116,99,0.25)]'
                          : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_2px_0_0_#059669]'
                        }`}
                    >
                      {activity.type === 'lesson' ? <BookOpen className="h-3.5 w-3.5 stroke-[2.5]" /> : <CheckCircle className="h-3.5 w-3.5 stroke-[2.5]" />}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-foreground line-clamp-1 leading-snug">
                        {activity.type === 'lesson' ? 'Đã học bài: ' : 'Đã thuộc từ: '}
                        <span className="text-brand font-black">{activity.title}</span>
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 font-medium">{activity.subtitle}</p>
                      <span className="text-[10px] text-muted-foreground/70 block font-semibold">
                        {new Date(activity.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(activity.timestamp).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
