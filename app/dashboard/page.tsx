import React from 'react';
import { getCurrentUser } from '@/services/user.service';
import { getDashboardStats, getRecentLearning, getLearningStreak } from '@/services/dashboard.service';
import { BookOpen, CheckCircle, Award, Flame, Calendar, BookOpenCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Vui lòng đăng nhập để xem bảng thống kê học tập.
      </div>
    );
  }

  const [stats, recentActivity, streakData] = await Promise.all([
    getDashboardStats(user.uid),
    getRecentLearning(user.uid),
    getLearningStreak(user.uid)
  ]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
      {/* Welcome Header */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Chào mừng trở lại, <span className="text-primary">{user.name}</span>!
          </h1>
          <p className="text-muted-foreground text-lg">
            Hôm nay là một ngày tuyệt vời để học tiếng Anh cùng Linguify.
          </p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          {
            title: 'Chuỗi học tập',
            value: `${streakData.streak} ngày`,
            desc: `Tổng cộng ${streakData.totalActiveDays} ngày hoạt động`,
            icon: Flame,
            color: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
          },
          {
            title: 'Từ vựng đã thuộc',
            value: `${stats.vocabMastered} / ${stats.totalVocab}`,
            desc: `Đạt ${stats.totalVocab > 0 ? Math.round((stats.vocabMastered / stats.totalVocab) * 100) : 0}% thư viện`,
            icon: Award,
            color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
          },
          {
            title: 'Bài học hoàn thành',
            value: `${stats.lessonsCompleted} / ${stats.totalLessons}`,
            desc: `Đạt ${stats.totalLessons > 0 ? Math.round((stats.lessonsCompleted / stats.totalLessons) * 100) : 0}% lộ trình`,
            icon: BookOpenCheck,
            color: 'text-primary bg-primary/10 border-primary/20'
          },
          {
            title: 'Thời gian tham gia',
            value: new Date(user.createdAt).toLocaleDateString('vi-VN'),
            desc: 'Ngày đăng ký thành viên',
            icon: Calendar,
            color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
          }
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</span>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Courses Progress */}
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-2xl font-black text-foreground">Lộ trình học tập của bạn</h2>
            <Link href="/courses" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.courseCompletionRates.map((course) => (
              <div key={course.id} className="p-6 rounded-3xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-primary/45 transition-colors">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase border border-primary/20">
                      {course.level}
                    </span>
                    <h3 className="text-lg font-bold text-foreground line-clamp-1">{course.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{course.completedCount} / {course.totalCount} bài học hoàn thành</span>
                  </div>
                </div>

                <div className="w-full sm:w-48 flex items-center gap-4">
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden border border-border">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${course.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-foreground w-12 text-right">{course.percentage}%</span>
                </div>

                <Link 
                  href={`/courses/${course.id}`} 
                  className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-all shrink-0 w-full sm:w-auto text-center"
                >
                  Học Tiếp
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-2xl font-black text-foreground">Hoạt động gần đây</h2>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground italic">
                Chưa có hoạt động nào được ghi nhận gần đây.
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4 items-start">
                  <div className={`p-2.5 rounded-xl shrink-0 border ${
                    activity.type === 'lesson' 
                      ? 'text-primary bg-primary/10 border-primary/20' 
                      : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    {activity.type === 'lesson' ? <BookOpen className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-foreground leading-tight">
                      {activity.type === 'lesson' ? 'Đã học bài: ' : 'Đã thuộc từ: '}
                      <span className="text-primary">{activity.title}</span>
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{activity.subtitle}</p>
                    <span className="text-[10px] text-muted-foreground/60 block">
                      {new Date(activity.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(activity.timestamp).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
