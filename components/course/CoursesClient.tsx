'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PlayCircle, Clock, BookOpen, Search, Plus } from 'lucide-react';
import { AddCourseModal } from '@/components/course/AddCourseModal';
import { createCourseAction } from '@/actions/course.action';

const DEFAULT_LESSON = { title: '', duration: '10:00', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', description: '' };

interface CoursesClientProps {
  initialCourses: any[];
}

export default function CoursesClient({ initialCourses }: CoursesClientProps) {
  const [courses, setCourses] = useState<any[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', thumbnail: 'https://picsum.photos/seed/new/800/450', level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced' });
  const [newLessons, setNewLessons] = useState([{ ...DEFAULT_LESSON }]);

  const handleSaveCourse = async () => {
    if (!newCourse.title.trim()) return;

    const filteredLessons = newLessons
      .filter((l) => l.title.trim() !== '')
      .map((l) => ({
        title: l.title,
        duration: l.duration || '10:00',
        videoUrl: l.videoUrl || DEFAULT_LESSON.videoUrl,
        description: l.description || ''
      }));

    const res = await createCourseAction({
      title: newCourse.title,
      description: newCourse.description,
      thumbnail: newCourse.thumbnail,
      level: newCourse.level,
      lessons: filteredLessons
    });

    if (res.success && res.course) {
      setCourses((prev) => [res.course, ...prev]);
      setShowAddModal(false);
      setNewCourse({ title: '', description: '', thumbnail: 'https://picsum.photos/seed/new/800/450', level: 'Beginner' });
      setNewLessons([{ ...DEFAULT_LESSON }]);
    } else {
      alert('Không thể lưu khóa học: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Learning Paths</h1>
          <p className="text-muted-foreground text-lg">Curated courses to master English in specific contexts.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 w-64 bg-muted border border-border rounded-2xl focus:outline-none focus:border-primary transition-all text-foreground"
            />
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            Add Course
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-[2rem] text-muted-foreground">
          Chưa có khóa học nào được tìm thấy.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="group">
              <Link href={`/courses/${course.id}`}
                className="block bg-card border border-border rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all hover:bg-muted/50 shadow-sm"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-6">
                    <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider">{course.level}</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white">
                      <PlayCircle className="h-7 w-7" />
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-6">{course.description.replace(/[#*`]/g, '')}</p>
                  <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest border-t border-border pt-6">
                    <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />12h</div>
                    <div className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{course.lessons?.length || 0} Lessons</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AddCourseModal
        show={showAddModal}
        newCourse={newCourse}
        newLessons={newLessons}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveCourse}
        onCourseChange={(field, value) => setNewCourse((prev) => ({ ...prev, [field]: value }))}
        onAddLesson={() => setNewLessons((prev) => [...prev, { ...DEFAULT_LESSON }])}
        onRemoveLesson={(idx) => setNewLessons((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : [{ ...DEFAULT_LESSON }])}
        onUpdateLesson={(idx, field, value) => setNewLessons((prev) => { const u = [...prev]; u[idx] = { ...u[idx], [field]: value }; return u; })}
      />
    </div>
  );
}
