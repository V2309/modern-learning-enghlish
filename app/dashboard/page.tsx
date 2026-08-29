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

  const totalOverallActivities = Object.values(activityMap).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full space-y-8">
      {/* ── 1. COMMAND CENTER HERO BAR (Asymmetric layout) ── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: User Identity & Greeting */}
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg flex items-center justify-center shadow-md shadow-black/10 shrink-0">
            {userInitials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-0.5 rounded-md border border-brand/20">
                Member Hub
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-semibold text-muted-foreground">
                Đã học {totalOverallActivities} phiên
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Chào mừng trở lại, <span className="text-brand">{user.name}</span>!
            </h1>
          </div>
        </div>

        {/* Right: Quick Action Launch Strip */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-border/40 w-full lg:w-auto">
          <Link
            href="/courses"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-black/10"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Vào Khóa Học</span>
          </Link>
          <Link
            href="/vocabulary"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted/70 hover:bg-muted text-foreground border border-border/70 text-xs font-bold transition-all"
          >
            <Award className="h-3.5 w-3.5 text-emerald-500" />
            <span>Ôn Từ Vựng</span>
          </Link>
          <Link
            href="/dictation"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted/70 hover:bg-muted text-foreground border border-border/70 text-xs font-bold transition-all"
          >
            <Headphones className="h-3.5 w-3.5 text-brand" />
            <span>Luyện Dictation</span>
          </Link>
          <Link
            href="/shadowing"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted/70 hover:bg-muted text-foreground border border-border/70 text-xs font-bold transition-all"
          >
            <Video className="h-3.5 w-3.5 text-sky-400" />
            <span>Shadowing</span>
          </Link>
        </div>
      </div>

      {/* ── 2. CALIBRATED BENTO METRIC GRID (4 Primary KPI Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Streak & Consistency */}
        <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-brand/40 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Chuỗi Học Tập</span>
            <div className="h-8 w-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Flame className="h-4 w-4 fill-orange-500" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {streakData.streak} <span className="text-sm font-bold text-muted-foreground">ngày liên tục</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Tổng cộng {streakData.totalActiveDays} ngày hoạt động chăm chỉ
            </p>
          </div>
        </div>

        {/* Card 2: Vocabulary Retention */}
        <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Từ Vựng Đã Thuộc</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {stats.vocabMastered} <span className="text-sm font-bold text-muted-foreground">/ {stats.totalVocab} từ</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              Đạt {stats.totalVocab > 0 ? Math.round((stats.vocabMastered / stats.totalVocab) * 100) : 0}% kho từ vựng cốt lõi
            </p>
          </div>
        </div>

        {/* Card 3: Curriculum Progress */}
        <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-brand/40 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Bài Học Đã Xong</span>
            <div className="h-8 w-8 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
              <BookOpenCheck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {stats.lessonsCompleted} <span className="text-sm font-bold text-muted-foreground">/ {stats.totalLessons} bài</span>
            </div>
            <p className="text-[11px] text-brand font-medium mt-1">
              Đạt {stats.totalLessons > 0 ? Math.round((stats.lessonsCompleted / stats.totalLessons) * 100) : 0}% chương trình học
            </p>
          </div>
        </div>

        {/* Card 4: Today's Tasks / Focus */}
        <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-sky-500/40 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Todo Hôm Nay</span>
            <div className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {todoSummary.completedToday} <span className="text-sm font-bold text-muted-foreground">/ {todoSummary.totalTasks} việc</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {todoSummary.pendingToday > 0 ? `Còn ${todoSummary.pendingToday} việc cần giải quyết` : 'Đã hoàn thành toàn bộ mục tiêu!'}
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
                <h2 className="text-base font-bold text-foreground">Lộ Trình Đang Theo Dõi</h2>
              </div>
              <Link href="/courses" className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {/* Courses Progress Cards */}
              {stats.courseCompletionRates.map((course) => (
                <div
                  key={course.id}
                  className="p-5 sm:p-6 rounded-3xl bg-card border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-brand/40 shadow-xs transition-all"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[9px] font-black uppercase border border-brand/20">
                        {course.level}
                      </span>
                      <h3 className="text-base font-bold text-foreground truncate">{course.title}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span>{course.completedCount} / {course.totalCount} bài học</span>
                      <span>•</span>
                      <span>{course.completedTopicsCount} / {course.totalTopicsCount} chủ đề</span>
                    </div>
                  </div>

                  <div className="w-full sm:w-44 flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden border border-border/40">
                      <div
                        className="bg-brand h-full rounded-full transition-all duration-500"
                        style={{ width: `${course.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-brand w-10 text-right">{course.percentage}%</span>
                  </div>

                  <Link
                    href={`/courses/${course.id}`}
                    className="px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-black/10 shrink-0 w-full sm:w-auto text-center cursor-pointer"
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
                  <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-emerald-500/40 shadow-xs transition-all">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase border border-emerald-500/20">
                          Thư Viện Từ Vựng
                        </span>
                        <h3 className="text-base font-bold text-foreground truncate">Từ Vựng Theo Chủ Đề</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>{stats.vocabMastered} / {stats.totalVocab} từ đã thuộc</span>
                        <span>•</span>
                        <span>{stats.completedTopicsCount} / {stats.totalTopicsCount} chủ đề đã xong</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-44 flex items-center gap-3">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden border border-border/40">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${vocabPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 w-10 text-right">
                        {vocabPercentage}%
                      </span>
                    </div>

                    <Link
                      href="/vocabulary"
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/10 shrink-0 w-full sm:w-auto text-center cursor-pointer"
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
                  <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-brand/40 shadow-xs transition-all">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[9px] font-black uppercase border border-brand/20">
                          Phát Âm & Ngữ Điệu
                        </span>
                        <h3 className="text-base font-bold text-foreground truncate">Luyện Nói Shadowing</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>{stats.completedShadowingCount} / {stats.totalShadowingCount} video đã hoàn thành</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-44 flex items-center gap-3">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden border border-border/40">
                        <div
                          className="bg-brand h-full rounded-full transition-all duration-500"
                          style={{ width: `${shadowingPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-brand w-10 text-right">{shadowingPercentage}%</span>
                    </div>

                    <Link
                      href="/shadowing"
                      className="px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-black/10 shrink-0 w-full sm:w-auto text-center cursor-pointer"
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

          {/* Performance Data Visualisation Charts */}
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
          {/* ── Todo Command Widget ── */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-bold text-foreground">Kế Hoạch Hôm Nay</h3>
              </div>
              <Link href="/todo" className="text-xs font-bold text-brand hover:underline flex items-center gap-0.5">
                Chi tiết <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {todoSummary.totalTasks === 0 ? (
              <div className="text-center py-6 space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground mx-auto">
                  <ListTodo className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground">Chưa có nhiệm vụ nào được đặt ra cho hôm nay.</p>
                <Link
                  href="/todo"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-black/10"
                >
                  <ListTodo className="h-3.5 w-3.5" />
                  <span>Tạo Todo List</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Progress Ring & Numbers */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="relative h-14 w-14 shrink-0">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/60" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${todoSummary.totalTasks > 0 ? Math.round((todoSummary.completedToday / todoSummary.totalTasks) * 100) : 0} ${100 - (todoSummary.totalTasks > 0 ? Math.round((todoSummary.completedToday / todoSummary.totalTasks) * 100) : 0)}`}
                        strokeLinecap="round"
                        className="text-brand transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-brand">
                      {todoSummary.totalTasks > 0 ? Math.round((todoSummary.completedToday / todoSummary.totalTasks) * 100) : 0}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">Hoàn thành hôm nay</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckSquare className="h-3 w-3" />
                      {todoSummary.completedToday} việc đã xong
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {todoSummary.pendingToday} việc đang đợi hoàn thành
                    </p>
                  </div>
                </div>

                <Link
                  href="/todo"
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-black/10 cursor-pointer"
                >
                  <ListTodo className="h-3.5 w-3.5" />
                  <span>Mở Todo & Pomodoro</span>
                </Link>
              </div>
            )}
          </div>

          {/* ── Recent Activity Stream ── */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-bold text-foreground">Dòng Hoạt Động Gần Đây</h3>
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground italic">
                Chưa có hoạt động nào được ghi nhận gần đây.
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3 items-start pb-3 border-b border-border/40 last:border-0 last:pb-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 border ${
                        activity.type === 'lesson'
                          ? 'text-brand bg-brand/10 border-brand/20'
                          : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                      }`}
                    >
                      {activity.type === 'lesson' ? <BookOpen className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-foreground line-clamp-1 leading-snug">
                        {activity.type === 'lesson' ? 'Đã học bài: ' : 'Đã thuộc từ: '}
                        <span className="text-brand">{activity.title}</span>
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{activity.subtitle}</p>
                      <span className="text-[10px] text-muted-foreground/70 block">
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
