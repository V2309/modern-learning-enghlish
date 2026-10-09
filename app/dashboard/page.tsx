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
  Calendar,
  ChevronRight,
  Video,
  ListTodo,
  CheckSquare,
  Sparkles,
  Zap,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import LearningHeatmap from '@/components/dashboard/LearningHeatmap';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import TopicProgressList from '@/components/dashboard/TopicProgressList';
import { DashboardStreakCard } from '@/components/streak/DashboardStreakCard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="w-full py-16 text-center text-muted-foreground font-mono text-xs">
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

  const vocabPercentage =
    stats.totalVocab > 0
      ? Math.round((stats.vocabMastered / stats.totalVocab) * 100)
      : 0;

  const curriculumPercentage =
    stats.totalLessons > 0
      ? Math.round((stats.lessonsCompleted / stats.totalLessons) * 100)
      : 0;

  const todoPercentage =
    todoSummary.totalTasks > 0
      ? Math.round((todoSummary.completedToday / todoSummary.totalTasks) * 100)
      : 0;

  return (
    <div className="w-full space-y-8">
      {/* ── 1. HEADER CARD (Synchronized Home Bento Grid Style with 3D Buttons) ── */}
      <div className="p-6 sm:p-7 border border-[#e5e7eb] dark:border-[#1f2937] bg-white dark:bg-[#0f1115] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden group">
        {/* Light Sweep Sheen */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />

        {/* Technical Crosshairs */}
        <span className="absolute top-2.5 left-2.5 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">+</span>
        <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">+</span>

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#f28500] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f28500] animate-pulse" />
              Tổng Quan Cá Nhân
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#f28500]" />
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white tracking-tight">
            Chào mừng trở lại, <span className="text-[#f28500]">{user.name}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans">
            Hôm nay bạn đã sẵn sàng bứt phá mục tiêu tiếng Anh chưa?
          </p>
        </div>

        {/* Quick Action 3D Navigation Buttons (Maintained 3D Style) */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <Link
            href="/courses"
            className="btn-3d-brand px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <BookOpen className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Tiếp Tục Học</span>
          </Link>
          <Link
            href="/vocabulary"
            className="btn-3d-duo px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Ôn Từ Vựng</span>
          </Link>
          <Link
            href="/shadowing"
            className="btn-3d-sky px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Video className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Shadowing</span>
          </Link>
        </div>
      </div>

      {/* ── 2. 4 PRIMARY KPI METRIC CARDS (Seamless Connected Grid with Continuous Hairline Borders) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#e5e7eb] dark:bg-[#1f2937] border border-[#e5e7eb] dark:border-[#1f2937]">
        {/* Card 1: Streak Card (Interactive with Modal) */}
        <DashboardStreakCard initialStreakData={streakData} />

        {/* Card 2: Vocabulary Retention */}
        <div className="p-6 sm:p-7 bg-white dark:bg-[#0f1115] hover:bg-[#fafafa] dark:hover:bg-[#14171b] flex flex-col justify-between space-y-4 relative overflow-hidden group transition-colors select-none">
          {/* Light Sweep Sheen */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />

          {/* Technical Crosshairs */}
          <span className="absolute top-2.5 left-2.5 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">+</span>
          <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">+</span>

          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9ca3af] dark:text-[#6b7280] font-semibold">
                02 · Từ Vựng Đã Thuộc
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#f28500]">
                {vocabPercentage}%
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl sm:text-4xl font-bold font-mono text-[#111827] dark:text-white tracking-tight group-hover:text-[#f28500] transition-colors">
                {stats.vocabMastered}
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                / {stats.totalVocab} từ
              </span>
            </div>

            {/* Slim Hairline Progress Bar */}
            <div className="w-full h-1.5 bg-[#f3f4f6] dark:bg-[#1f2937] my-3 overflow-hidden">
              <div
                className="h-full bg-[#f28500] transition-all duration-500"
                style={{ width: `${vocabPercentage}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Đạt <strong className="text-[#111827] dark:text-white font-mono">{vocabPercentage}%</strong> kho từ vựng cốt lõi Oxford.
            </p>
          </div>

          <div className="pt-3 border-t border-[#e5e7eb] dark:border-[#1f2937] flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">Ghi nhớ dài hạn</span>
            <Link
              href="/vocabulary"
              className="btn-3d-duo px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-xs cursor-pointer"
            >
              Ôn Tập
            </Link>
          </div>
        </div>

        {/* Card 3: Curriculum Progress */}
        <div className="p-6 sm:p-7 bg-white dark:bg-[#0f1115] hover:bg-[#fafafa] dark:hover:bg-[#14171b] flex flex-col justify-between space-y-4 relative overflow-hidden group transition-colors select-none">
          {/* Light Sweep Sheen */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />

          {/* Technical Crosshairs */}
          <span className="absolute top-2.5 left-2.5 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">+</span>
          <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">+</span>

          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9ca3af] dark:text-[#6b7280] font-semibold">
                03 · Bài Học Đã Xong
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#10b981]">
                {curriculumPercentage}%
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl sm:text-4xl font-bold font-mono text-[#111827] dark:text-white tracking-tight group-hover:text-[#10b981] transition-colors">
                {stats.lessonsCompleted}
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                / {stats.totalLessons} bài
              </span>
            </div>

            {/* Slim Hairline Progress Bar */}
            <div className="w-full h-1.5 bg-[#f3f4f6] dark:bg-[#1f2937] my-3 overflow-hidden">
              <div
                className="h-full bg-[#10b981] transition-all duration-500"
                style={{ width: `${curriculumPercentage}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Đạt <strong className="text-[#111827] dark:text-white font-mono">{curriculumPercentage}%</strong> chương trình học chuẩn CEFR.
            </p>
          </div>

          <div className="pt-3 border-t border-[#e5e7eb] dark:border-[#1f2937] flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">Khóa học</span>
            <Link
              href="/courses"
              className="btn-3d-emerald px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-xs cursor-pointer"
            >
              Học Tiếp
            </Link>
          </div>
        </div>

        {/* Card 4: Daily Tasks (Todo Hôm Nay) */}
        <div className="p-6 sm:p-7 bg-white dark:bg-[#0f1115] hover:bg-[#fafafa] dark:hover:bg-[#14171b] flex flex-col justify-between space-y-4 relative overflow-hidden group transition-colors select-none">
          {/* Light Sweep Sheen */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />

          {/* Technical Crosshairs */}
          <span className="absolute top-2.5 left-2.5 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">+</span>
          <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">+</span>

          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9ca3af] dark:text-[#6b7280] font-semibold">
                04 · Todo Hôm Nay
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#3b82f6]">
                {todoPercentage}%
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl sm:text-4xl font-bold font-mono text-[#111827] dark:text-white tracking-tight group-hover:text-[#3b82f6] transition-colors">
                {todoSummary.completedToday}
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                / {todoSummary.totalTasks} việc
              </span>
            </div>

            {/* Slim Hairline Progress Bar */}
            <div className="w-full h-1.5 bg-[#f3f4f6] dark:bg-[#1f2937] my-3 overflow-hidden">
              <div
                className="h-full bg-[#3b82f6] transition-all duration-500"
                style={{ width: `${todoPercentage}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {todoSummary.pendingToday > 0
                ? `Còn ${todoSummary.pendingToday} mục tiêu cần hoàn thành.`
                : 'Đã hoàn thành toàn bộ mục tiêu!'}
            </p>
          </div>

          <div className="pt-3 border-t border-[#e5e7eb] dark:border-[#1f2937] flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">Kế hoạch</span>
            <Link
              href="/todo"
              className="btn-3d-sky px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-xs cursor-pointer"
            >
              Quản Lý
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN DASHBOARD CONTENT (8 Cols vs 4 Cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Trackers, Analytics & Heatmap (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Learning Tracks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] dark:border-[#1f2937] pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#f28500]" />
                <h2 className="text-base font-bold text-[#111827] dark:text-white tracking-tight">
                  Lộ Trình Đang Theo Dõi
                </h2>
              </div>
              <Link href="/courses" className="text-xs font-mono uppercase tracking-wider text-[#f28500] hover:underline flex items-center gap-1 font-bold">
                Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Tracks List — Connected Seamlessly with divide-y */}
            <div className="divide-y divide-[#e5e7eb] dark:divide-[#1f2937] border border-[#e5e7eb] dark:border-[#1f2937] bg-white dark:bg-[#0f1115]">
              {/* Courses Progress Cards */}
              {stats.courseCompletionRates.map((course) => (
                <div
                  key={course.id}
                  className="p-5 sm:p-6 bg-white dark:bg-[#0f1115] hover:bg-[#fafafa] dark:hover:bg-[#14171b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative group transition-colors overflow-hidden"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold bg-[#fff5eb] dark:bg-[#2a170b] text-[#f28500] border border-[#fbd38d]/40 dark:border-[#f28500]/30">
                        {course.level}
                      </span>
                      <h3 className="text-sm font-bold text-[#111827] dark:text-white truncate group-hover:text-[#f28500] transition-colors">
                        {course.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground font-mono">
                      <span>{course.completedCount} / {course.totalCount} bài học</span>
                      <span>•</span>
                      <span>{course.completedTopicsCount} / {course.totalTopicsCount} chủ đề</span>
                    </div>
                  </div>

                  <div className="w-full sm:w-44 flex items-center gap-3">
                    <div className="flex-1 bg-[#f3f4f6] dark:bg-[#1f2937] h-1.5 overflow-hidden">
                      <div
                        className="bg-[#f28500] h-full transition-all duration-500"
                        style={{ width: `${course.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold font-mono text-[#f28500] w-10 text-right">{course.percentage}%</span>
                  </div>

                  <Link
                    href={`/courses/${course.id}`}
                    className="btn-3d-brand px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl shrink-0 w-full sm:w-auto text-center cursor-pointer shadow-sm"
                  >
                    Học Tiếp
                  </Link>
                </div>
              ))}

              {/* Vocabulary Progress Card */}
              {(() => {
                const topicPercentage =
                  stats.totalTopicsCount > 0
                    ? Math.round((stats.completedTopicsCount / stats.totalTopicsCount) * 100)
                    : 0;
                return (
                  <div className="p-5 sm:p-6 bg-white dark:bg-[#0f1115] hover:bg-[#fafafa] dark:hover:bg-[#14171b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative group transition-colors overflow-hidden">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold bg-[#ecfdf5] dark:bg-[#064e3b] text-[#059669] dark:text-[#34d399] border border-[#a7f3d0]/60 dark:border-[#059669]/40">
                          Thư Viện Từ Vựng
                        </span>
                        <h3 className="text-sm font-bold text-[#111827] dark:text-white truncate group-hover:text-[#059669] transition-colors">
                          Từ Vựng Theo Chủ Đề
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground font-mono">
                        <span>{stats.vocabMastered} / {stats.totalVocab} từ đã thuộc</span>
                        <span>•</span>
                        <span>{stats.completedTopicsCount} / {stats.totalTopicsCount} chủ đề đã xong</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-44 flex items-center gap-3">
                      <div className="flex-1 bg-[#f3f4f6] dark:bg-[#1f2937] h-1.5 overflow-hidden">
                        <div
                          className="bg-[#10b981] h-full transition-all duration-500"
                          style={{ width: `${topicPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold font-mono text-[#10b981] w-10 text-right">
                        {topicPercentage}%
                      </span>
                    </div>

                    <Link
                      href="/vocabulary"
                      className="btn-3d-duo px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl shrink-0 w-full sm:w-auto text-center cursor-pointer shadow-sm"
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
                  <div className="p-5 sm:p-6 bg-white dark:bg-[#0f1115] hover:bg-[#fafafa] dark:hover:bg-[#14171b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative group transition-colors overflow-hidden">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold bg-[#eff6ff] dark:bg-[#1e3a8a] text-[#2563eb] dark:text-[#60a5fa] border border-[#bfdbfe]/60 dark:border-[#2563eb]/40">
                          Phát Âm & Ngữ Điệu
                        </span>
                        <h3 className="text-sm font-bold text-[#111827] dark:text-white truncate group-hover:text-[#2563eb] transition-colors">
                          Luyện Nói Shadowing
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground font-mono">
                        <span>{stats.completedShadowingCount} / {stats.totalShadowingCount} video hoàn thành</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-44 flex items-center gap-3">
                      <div className="flex-1 bg-[#f3f4f6] dark:bg-[#1f2937] h-1.5 overflow-hidden">
                        <div
                          className="bg-[#3b82f6] h-full transition-all duration-500"
                          style={{ width: `${shadowingPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold font-mono text-[#3b82f6] w-10 text-right">
                        {shadowingPercentage}%
                      </span>
                    </div>

                    <Link
                      href="/shadowing"
                      className="btn-3d-sky px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl shrink-0 w-full sm:w-auto text-center cursor-pointer shadow-sm"
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
          {/* ── Todo Command Widget (Styled like Bento Home card with 3D button) ── */}
          <div className="border border-[#e5e7eb] dark:border-[#1f2937] bg-white dark:bg-[#0f1115] p-6 space-y-5 relative overflow-hidden">
            {/* Technical Crosshairs */}
            <span className="absolute top-2.5 left-2.5 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">+</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">+</span>

            <div className="flex items-center justify-between border-b border-[#e5e7eb] dark:border-[#1f2937] pb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-[#f28500]" />
                <h3 className="text-sm font-bold text-[#111827] dark:text-white tracking-tight">Kế Hoạch Hôm Nay</h3>
              </div>
              <Link href="/todo" className="text-xs font-mono uppercase tracking-wider text-[#f28500] hover:underline flex items-center gap-0.5 font-bold">
                Chi tiết <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {todoSummary.totalTasks === 0 ? (
              <div className="text-center py-6 space-y-3 border border-dashed border-[#e5e7eb] dark:border-[#1f2937]">
                <p className="text-xs font-mono text-muted-foreground">Chưa có nhiệm vụ nào được đặt ra cho hôm nay.</p>
                <Link
                  href="/todo"
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ListTodo className="h-3.5 w-3.5" />
                  <span>Tạo Todo List</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Progress Ring & Numbers */}
                <div className="flex items-center gap-4 p-3.5 border border-[#e5e7eb] dark:border-[#1f2937] bg-[#f8f9fa] dark:bg-[#14171b]">
                  <div className="relative h-14 w-14 shrink-0">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#e5e7eb] dark:text-[#1f2937]" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${todoPercentage} ${100 - todoPercentage}`}
                        strokeLinecap="square"
                        className="text-[#f28500] transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-[#f28500]">
                      {todoPercentage}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#111827] dark:text-white">Hoàn thành hôm nay</p>
                    <p className="text-xs text-[#10b981] font-mono font-bold flex items-center gap-1">
                      <CheckSquare className="h-3.5 w-3.5" />
                      {todoSummary.completedToday} việc đã xong
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {todoSummary.pendingToday} việc đang đợi hoàn thành
                    </p>
                  </div>
                </div>

                <Link
                  href="/todo"
                  className="btn-3d-brand w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <ListTodo className="h-3.5 w-3.5" />
                  <span>Mở Todo & Pomodoro</span>
                </Link>
              </div>
            )}
          </div>

          {/* ── Recent Activity Stream (Styled like Bento Home card) ── */}
          <div className="border border-[#e5e7eb] dark:border-[#1f2937] bg-white dark:bg-[#0f1115] p-6 space-y-4 relative overflow-hidden">
            {/* Technical Crosshairs */}
            <span className="absolute top-2.5 left-2.5 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">+</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">+</span>

            <div className="flex items-center justify-between border-b border-[#e5e7eb] dark:border-[#1f2937] pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#f28500]" />
                <h3 className="text-sm font-bold text-[#111827] dark:text-white tracking-tight">Dòng Hoạt Động Gần Đây</h3>
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-6 text-xs font-mono text-muted-foreground italic">
                Chưa có hoạt động nào được ghi nhận gần đây.
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3 items-start pb-3 border-b border-[#e5e7eb] dark:border-[#1f2937] last:border-0 last:pb-0">
                    <div
                      className={`p-1.5 shrink-0 border ${
                        activity.type === 'lesson'
                          ? 'text-[#f28500] bg-[#fff5eb] dark:bg-[#2a170b] border-[#fbd38d]/40 dark:border-[#f28500]/30'
                          : 'text-[#10b981] bg-[#ecfdf5] dark:bg-[#064e3b] border-[#a7f3d0]/60 dark:border-[#059669]/40'
                      }`}
                    >
                      {activity.type === 'lesson' ? <BookOpen className="h-3.5 w-3.5 stroke-[2.5]" /> : <CheckCircle className="h-3.5 w-3.5 stroke-[2.5]" />}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#111827] dark:text-white line-clamp-1 leading-snug">
                        {activity.type === 'lesson' ? 'Đã học bài: ' : 'Đã thuộc từ: '}
                        <span className="text-[#f28500] font-bold">{activity.title}</span>
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 font-mono">{activity.subtitle}</p>
                      <span className="text-[10px] font-mono text-muted-foreground/70 block">
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
