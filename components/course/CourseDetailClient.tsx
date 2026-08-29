'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  PlayCircle,
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
  Star,
  Layers,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { redeemAccessCodeAction } from '@/actions/courseAccess.action';
import { AccessCodeModal } from '@/components/course/AccessCodeModal';

interface CourseDetailClientProps {
  course: any;
  userId: string;
  initialCompletedLessonIds: string[];
  basePath?: string; // e.g. '/my-courses/[courseId]' or '/courses/[courseId]'
  isUnlocked?: boolean;
}

const LEVEL_LABEL: Record<string, { label: string; cls: string }> = {
  Beginner: { label: 'Cơ bản', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  Intermediate: { label: 'Trung cấp', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  Advanced: { label: 'Nâng cao', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
};

export default function CourseDetailClient({
  course,
  userId,
  initialCompletedLessonIds,
  basePath,
  isUnlocked = true,
}: CourseDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'curriculum' | 'objectives' | 'info' | 'reviews'>('curriculum');
  const [showAccessModal, setShowAccessModal] = React.useState(false);
  const courseBasePath = basePath ?? `/courses/${course.id}`;
  const backPath = basePath ? '/my-courses' : '/courses';
  const completedIds = new Set(initialCompletedLessonIds);

  const objectivesList = React.useMemo(() => {
    try {
      return course.objectives ? JSON.parse(course.objectives) : [];
    } catch {
      return [];
    }
  }, [course.objectives]);

  const infoDetails = React.useMemo(() => {
    try {
      return course.info ? JSON.parse(course.info) : {};
    } catch {
      return {};
    }
  }, [course.info]);

  // Tất cả lessons trong toàn course
  const allLessons: any[] = course.lessons || [];

  // Topics của course
  const topics: any[] = course.topics || [];

  // Lessons không thuộc topic nào
  const generalLessons = allLessons.filter(
    (l) => !l.topicId || !topics.some((t) => t.id === l.topicId)
  );

  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const level = LEVEL_LABEL[course.level] ?? { label: course.level, cls: 'bg-muted text-muted-foreground' };

  const getTopicProgress = (topic: any) => {
    const tLessons: any[] = topic.lessons || [];
    if (tLessons.length === 0) return { completed: 0, total: 0, pct: 0 };
    const done = tLessons.filter((l) => completedIds.has(l.id)).length;
    return { completed: done, total: tLessons.length, pct: Math.round((done / tLessons.length) * 100) };
  };

  const hasTopics = topics.length > 0;

  const toeic1Curriculum = [
    { title: "Part 1: Photographs - Nghe tranh", lectures: 4 },
    { title: "Part 2: Question - Response - Hỏi - đáp", lectures: 12 },
    { title: "Part 3: Conversations - Nghe hiểu đối thoại", lectures: 9 },
    { title: "Part 4: Talks - Nghe hiểu bài nói", lectures: 8 },
    { title: "Ngữ Pháp Toeic", lectures: 18 },
    { title: "Part 5: Incomplete Sentences - Điền từ vào câu", lectures: 4 },
    { title: "Part 6: Text Completion - Điền từ vào đoạn văn", lectures: 5 },
    { title: "Part 7: Reading Comprehension - Đọc hiểu văn bản", lectures: 8 },
  ];

  const toeic2Curriculum = [
    { title: "Part 1-2 (Speaking): Read a text aloud & Describe a picture", lectures: 6 },
    { title: "Part 3-4 (Speaking): Respond to questions & Respond to questions using information provided", lectures: 8 },
    { title: "Part 5 (Speaking): Express an opinion", lectures: 6 },
    { title: "Part 6 (Writing): Write a sentence based on a picture", lectures: 5 },
    { title: "Part 7 (Writing): Respond to a written request", lectures: 5 },
    { title: "Part 8 (Writing): Write an opinion essay", lectures: 8 },
  ];

  const staticCurriculum = course.title.toLowerCase().includes("speaking") || course.title.toLowerCase().includes("sw")
    ? toeic2Curriculum
    : toeic1Curriculum;

  return (
    <div className="w-full">
      {/* ── Back navigation ── */}
      <Link
        href={backPath}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand transition-colors group mb-6"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs sm:text-sm font-semibold">{backPath === '/my-courses' ? 'My Courses' : 'Tất cả khóa học'}</span>
      </Link>

      {/* ── Hero section ── */}
      <div className="grid lg:grid-cols-12 gap-8 mb-10">
        {/* Left — info */}
        <div className="lg:col-span-7 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider uppercase', level.cls)}>
              {level.label}
            </span>
            {course.subject && (
              <span className="px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase bg-muted text-muted-foreground border border-border/40">
                {course.subject}
              </span>
            )}
            {course.isBestSeller && (
              <span className="px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider uppercase bg-brand text-brand-foreground shadow-xs">
                Nổi Bật
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
            {course.title}
          </h1>

          <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
            {course.description.replace(/[#*`]/g, '').slice(0, 220)}
            {course.description.length > 220 ? '…' : ''}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
            {course.rating && (
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-foreground font-bold">{course.rating.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <PlayCircle className="h-3.5 w-3.5 text-brand" />
              <span>{totalLessons} bài giảng</span>
            </div>
            {hasTopics && (
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-brand" />
                <span>{topics.length} chủ đề</span>
              </div>
            )}
            {course.weeks && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-brand" />
                <span>{course.weeks} tuần</span>
              </div>
            )}
          </div>

          {/* Overall progress */}
          {basePath && totalLessons > 0 && (
            <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-brand">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Tiến độ của bạn
                </div>
                <span className="text-xs font-black text-brand">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-brand/15 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-brand rounded-full"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {completedCount} / {totalLessons} bài học đã hoàn thành
              </p>
            </div>
          )}

          {/* Activation/Vào học Box */}
          {!basePath && (
            isUnlocked ? (
              <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 space-y-4 shadow-sm mt-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-foreground">Khóa học đã kích hoạt</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Khóa học này đã sẵn sàng. Hãy bắt đầu học ngay nhé!</p>
                  </div>
                </div>
                
                <Link
                  href={`/my-courses/${course.id}`}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Vào học
                </Link>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-4 shadow-sm mt-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-foreground">Khóa học chưa kích hoạt</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Nhập mã kích hoạt để bắt đầu mở khóa học tập.</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowAccessModal(true)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Kích hoạt khóa học
                </button>
              </div>
            )
          )}
        </div>

        {/* Right — thumbnail */}
        <div className="lg:col-span-5">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-muted">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-xl">
                <PlayCircle className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Area ── */}
      {!basePath ? (
        /* Render new tabs layout for /courses/[id] */
        <div className="space-y-8">
          <div className="flex flex-wrap gap-2 border-b border-border/60 pb-px">
            {[
              { id: 'curriculum', label: 'Chương trình học' },
              { id: 'objectives', label: 'Mục tiêu khóa học' },
              { id: 'info', label: 'Thông tin khóa học' },
              { id: 'reviews', label: 'Đánh giá học viên' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer -mb-px',
                  activeTab === tab.id
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="min-h-[200px]">
            {/* TAB 1: CURRICULUM */}
            {activeTab === 'curriculum' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground">
                      {course.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-semibold">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-foreground font-bold">
                          {course.title.toLowerCase().includes("speaking") || course.title.toLowerCase().includes("sw") ? "4.9" : "5.0"}
                        </span>
                        <span>
                          {course.title.toLowerCase().includes("speaking") || course.title.toLowerCase().includes("sw") ? "(68 Đánh giá)" : "(260 Đánh giá)"}
                        </span>
                      </div>
                      <span>•</span>
                      <span>
                        {course.title.toLowerCase().includes("speaking") || course.title.toLowerCase().includes("sw") ? "223 Học viên" : "36,603 Học viên"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border/60 pt-4 space-y-3">
                    {(course.title.toLowerCase().includes("speaking") || course.title.toLowerCase().includes("sw") 
                      ? [
                          "Dành cho các bạn với mục tiêu đạt điểm TOEIC Speaking - Writing tại các mức đầu ra 240-300+",
                          "Bài giảng hướng dẫn chi tiết cách làm từng dạng câu hỏi TOEIC Speaking - Writing",
                          "Làm quen với các dạng câu hỏi, chủ đề thường gặp trong TOEIC Speaking - Writing với hàng trăm bài samples mẫu từ giáo viên chuyên môn cao",
                          "Cải thiện phát âm - ngữ điệu - ngắt nghỉ - trọng âm, đồng thời nằm lòng từ vựng - cấu trúc diễn đạt cho từng part trong TOEIC Speaking",
                          "Bổ sung cấp tốc từ vựng, làm chủ kỹ năng viết câu, email, bài luận hiệu quả"
                        ]
                      : [
                          "Dành cho các bạn với mục tiêu đạt điểm TOEIC tại các mức đầu ra 450 - 650 - 800+",
                          "Bộ 1200 từ vựng TOEIC 99% sẽ xuất hiện trong bài thi TOEIC và 17 chủ đề ngữ pháp quan trọng nhất",
                          "Bài giảng ngữ pháp và phương pháp làm tất cả các dạng câu hỏi TOEIC Reading và Listening",
                          "Hơn 20.000 câu hỏi trắc nghiệm chuẩn format thi thật TOEIC form 2024, có giải thích chi tiết",
                          "Giải quyết triệt để các vấn đề thường gặp khi nghe bằng phương pháp nghe chép chính tả",
                          "Tặng kèm khoá Luyện nghe nói tiếng Anh cùng Ted Talks trị giá 599k"
                        ]
                    ).map((item, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <span className="text-emerald-500 shrink-0 text-base">✅</span>
                        <p className="text-sm font-semibold text-foreground leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: OBJECTIVES */}
            {activeTab === 'objectives' && (
              <div className="space-y-6">
                <h3 className="text-lg font-extrabold text-foreground">Bạn sẽ đạt được những gì?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {objectivesList.map((obj: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start p-4 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold text-foreground leading-relaxed">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: COURSE INFO */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <h3 className="text-lg font-extrabold text-foreground">Chi tiết thông tin khóa học</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Thời lượng tổng cộng', value: infoDetails.duration || '36 giờ học', icon: Clock, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                    { label: 'Tổng số bài giảng', value: infoDetails.lectures || `${totalLessons} bài học video`, icon: BookOpen, color: 'text-primary bg-primary/10 border-primary/20' },
                    { label: 'Dịch vụ hỗ trợ', value: infoDetails.support || 'Giảng viên hỗ trợ 24/7', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                    { label: 'Chứng chỉ kết thúc', value: infoDetails.certificate || 'Cấp chứng nhận hoàn thành', icon: Star, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4 hover:shadow-xs transition-all">
                      <div className={cn("p-3 rounded-xl border shrink-0", item.color)}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold mb-0.5">{item.label}</div>
                        <div className="text-sm font-black text-foreground">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {course.description && (
                  <div className="p-8 rounded-[2.5rem] bg-muted/40 border border-border mt-8">
                    <h4 className="text-base font-extrabold text-foreground mb-4">Mô tả chi tiết</h4>
                    <div className="prose dark:prose-invert prose-sm max-w-none prose-headings:text-primary prose-strong:text-foreground/90 prose-p:text-muted-foreground">
                      <ReactMarkdown>{course.description}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 rounded-3xl bg-card border border-border">
                  <div className="text-center shrink-0 border-r border-border pr-6">
                    <div className="text-4xl font-black text-foreground">{course.rating ? course.rating.toFixed(1) : '5.0'}</div>
                    <div className="flex items-center gap-0.5 justify-center my-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Đánh giá chung</div>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">Phản hồi từ học viên</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Đánh giá thực tế từ những học viên đã tham gia và học tập hoàn thành khóa học này.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {(course.reviews && course.reviews.length > 0) ? (
                    course.reviews.map((rev: any) => (
                      <div key={rev.id} className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 hover:border-primary/20 transition-all">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-extrabold text-foreground">{rev.user?.name || 'Học viên ẩn danh'}</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={cn(
                                    "h-3.5 w-3.5", 
                                    i < rev.rating ? "fill-amber-400 text-amber-400" : "text-border"
                                  )} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                        </div>
                        <span className="text-[9px] text-muted-foreground/60 block self-end">
                          {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-10 bg-card border border-border rounded-3xl text-sm text-muted-foreground italic">
                      Chưa có đánh giá nào cho khóa học này.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Render upgraded syllabus layout for /my-courses/[id] */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand" />
              <span>Chương Trình & Nội Dung Khóa Học</span>
            </h2>
            <span className="text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded-full">
              {totalLessons} bài giảng · {topics.length} chủ đề
            </span>
          </div>

          {hasTopics && (
            <div className="space-y-3.5">
              {topics.map((topic, idx) => {
                const prog = getTopicProgress(topic);
                const isComplete = prog.total > 0 && prog.completed === prog.total;
                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Link
                      href={`${courseBasePath}/${topic.id}`}
                      className="group flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-3xl bg-card border border-border/80 hover:border-brand/40 shadow-xs hover:shadow-xl transition-all duration-300"
                    >
                      <div
                        className={cn(
                          'h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-sm sm:text-base transition-all',
                          isComplete
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-brand/10 text-brand border border-brand/20 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary shadow-xs'
                        )}
                      >
                        {isComplete ? <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" /> : String(idx + 1).padStart(2, '0')}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground group-hover:text-brand transition-colors text-sm sm:text-base truncate">
                          {topic.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 font-medium">
                          <span>{topic.lessons?.length || 0} bài giảng</span>
                          <span>•</span>
                          <span className={cn(isComplete ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-muted-foreground')}>
                            Đã học {prog.completed}/{prog.total} bài
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {isComplete ? (
                          <span className="hidden sm:inline-block text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                            Hoàn thành
                          </span>
                        ) : (
                          <span className="hidden sm:inline-block text-[10px] font-bold text-muted-foreground group-hover:text-brand transition-colors">
                            Vào học
                          </span>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-brand group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {generalLessons.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">Bài giảng chung</h3>
              {generalLessons.map((lesson) => {
                const done = completedIds.has(lesson.id);
                return (
                  <motion.div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 bg-card border border-border/80 rounded-2xl shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl border", done ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-brand/10 text-brand border-brand/20")}>
                        <PlayCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-foreground">{lesson.title}</p>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">{lesson.duration}</span>
                      </div>
                    </div>
                    {done && (
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        Hoàn thành
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {!hasTopics && generalLessons.length === 0 && (
            <div className="text-center py-16 rounded-3xl border border-border/80 bg-card text-muted-foreground text-xs sm:text-sm">
              <BookOpen className="h-10 w-10 mx-auto mb-2 text-brand opacity-40" />
              <p className="font-bold">Chưa có nội dung trong khóa học này.</p>
            </div>
          )}
        </div>
      )}

      {showAccessModal && (
        <AccessCodeModal
          show={showAccessModal}
          course={course}
          onClose={() => setShowAccessModal(false)}
          onSuccess={(courseId) => {
            setShowAccessModal(false);
            router.push(`/my-courses/${courseId}`);
          }}
        />
      )}
    </div>
  );
}
