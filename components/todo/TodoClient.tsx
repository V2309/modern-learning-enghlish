'use client';

import React, { useState, useOptimistic, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PomodoroTimer from '@/components/todo/PomodoroTimer';
import {
  CheckSquare,
  Square,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ListTodo,
  Calendar,
  CalendarDays,
  Settings2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  createTodoListAction,
  updateTodoListAction,
  deleteTodoListAction,
  createTodoTaskAction,
  createTodoTasksBulkAction,
  updateTodoTaskAction,
  deleteTodoTaskAction,
  toggleTodoCompletionAction,
} from '@/actions/todo.action';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TodoTask {
  id: string;
  todoListId: string;
  content: string;
  order: number;
}

interface TodoList {
  id: string;
  userId: string;
  courseId?: string | null;
  title: string;
  frequency: 'daily' | 'weekly';
  order: number;
  tasks: TodoTask[];
}

type TabId = 'today' | 'weekly' | 'edit';

interface PomodoroStats {
  todaySessions: number;
  todayMinutes: number;
  allTimeSessions: number;
  allTimeMinutes: number;
}

interface Props {
  userId: string;
  initialLists: TodoList[];
  initialCompletedIds: string[];
  today: string; // "YYYY-MM-DD"
  initialPomodoroStats: PomodoroStats;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TodoClient({ userId, initialLists, initialCompletedIds, today, initialPomodoroStats }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [lists, setLists] = useState<TodoList[]>(initialLists);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set(initialCompletedIds));
  const [isPending, startTransition] = useTransition();

  // ── Add List state ──
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListFreq, setNewListFreq] = useState<'daily' | 'weekly'>('daily');

  // ── Edit List state ──
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListTitle, setEditListTitle] = useState('');
  const [editListFreq, setEditListFreq] = useState<'daily' | 'weekly'>('daily');

  // ── Add Task state (per list) ──
  const [addingTaskListId, setAddingTaskListId] = useState<string | null>(null);
  const [newTaskContent, setNewTaskContent] = useState('');

  // ── Edit Task state ──
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskContent, setEditTaskContent] = useState('');

  // ─── Derived ─────────────────────────────────────────────────────────────

  const dailyLists = lists.filter((l) => l.frequency === 'daily');
  const weeklyLists = lists.filter((l) => l.frequency === 'weekly');

  const todayTotal = dailyLists.reduce((acc, l) => acc + l.tasks.length, 0);
  const todayDone = dailyLists.reduce(
    (acc, l) => acc + l.tasks.filter((t) => completedIds.has(t.id)).length,
    0
  );
  const todayPct = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleToggle = (taskId: string) => {
    const nowCompleted = !completedIds.has(taskId);
    // Optimistic update
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (nowCompleted) next.add(taskId); else next.delete(taskId);
      return next;
    });

    startTransition(async () => {
      const res = await toggleTodoCompletionAction(userId, taskId, today, nowCompleted);
      if (!res.success) {
        // Rollback
        setCompletedIds((prev) => {
          const next = new Set(prev);
          if (nowCompleted) next.delete(taskId); else next.add(taskId);
          return next;
        });
        toast.error('Có lỗi xảy ra!');
      }
    });
  };

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    const res = await createTodoListAction(userId, newListTitle.trim(), newListFreq);
    if (res.success && res.list) {
      setLists((prev) => [...prev, { ...(res.list as any), tasks: [] }]);
      setNewListTitle('');
      setShowAddList(false);
      toast.success('Đã thêm todo list!');
    } else {
      toast.error(res.error || 'Có lỗi xảy ra!');
    }
  };

  const handleUpdateList = async (listId: string) => {
    if (!editListTitle.trim()) return;
    const res = await updateTodoListAction(listId, userId, editListTitle.trim(), editListFreq);
    if (res.success) {
      setLists((prev) =>
        prev.map((l) => (l.id === listId ? { ...l, title: editListTitle.trim(), frequency: editListFreq } : l))
      );
      setEditingListId(null);
      toast.success('Đã cập nhật!');
    } else {
      toast.error(res.error || 'Có lỗi xảy ra!');
    }
  };

  const handleDeleteList = async (listId: string) => {
    const res = await deleteTodoListAction(listId, userId);
    if (res.success) {
      setLists((prev) => prev.filter((l) => l.id !== listId));
      toast.success('Đã xóa todo list!');
    } else {
      toast.error(res.error || 'Có lỗi xảy ra!');
    }
  };

  const handleAddTask = async (listId: string) => {
    if (!newTaskContent.trim()) return;

    const lineCount = newTaskContent.split('\n').filter((l) => l.trim()).length;

    if (lineCount > 1) {
      // Bulk create
      const res = await createTodoTasksBulkAction(listId, userId, newTaskContent);
      if (res.success && res.tasks) {
        setLists((prev) =>
          prev.map((l) =>
            l.id === listId ? { ...l, tasks: [...l.tasks, ...(res.tasks as any)] } : l
          )
        );
        setNewTaskContent('');
        setAddingTaskListId(null);
        toast.success(`Đã thêm ${res.tasks.length} task!`);
      } else {
        toast.error((res as any).error || 'Có lỗi xảy ra!');
      }
    } else {
      // Single create
      const res = await createTodoTaskAction(listId, userId, newTaskContent.trim());
      if (res.success && res.task) {
        setLists((prev) =>
          prev.map((l) =>
            l.id === listId ? { ...l, tasks: [...l.tasks, res.task as any] } : l
          )
        );
        setNewTaskContent('');
        setAddingTaskListId(null);
        toast.success('Đã thêm task!');
      } else {
        toast.error((res as any).error || 'Có lỗi xảy ra!');
      }
    }
  };

  const handleUpdateTask = async (taskId: string, listId: string) => {
    if (!editTaskContent.trim()) return;
    const res = await updateTodoTaskAction(taskId, userId, editTaskContent.trim());
    if (res.success) {
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? { ...l, tasks: l.tasks.map((t) => (t.id === taskId ? { ...t, content: editTaskContent.trim() } : t)) }
            : l
        )
      );
      setEditingTaskId(null);
      toast.success('Đã cập nhật task!');
    } else {
      toast.error(res.error || 'Có lỗi xảy ra!');
    }
  };

  const handleDeleteTask = async (taskId: string, listId: string) => {
    const res = await deleteTodoTaskAction(taskId, userId);
    if (res.success) {
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) } : l
        )
      );
      setCompletedIds((prev) => { const n = new Set(prev); n.delete(taskId); return n; });
      toast.success('Đã xóa task!');
    } else {
      toast.error(res.error || 'Có lỗi xảy ra!');
    }
  };

  // ─── Tab definitions ──────────────────────────────────────────────────────

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'today', label: 'Hôm nay cần làm', icon: Calendar },
    { id: 'weekly', label: 'Theo tuần', icon: CalendarDays },
    { id: 'edit', label: 'Chỉnh sửa/Thêm mới', icon: Settings2 },
  ];

  // ─── Render helpers ───────────────────────────────────────────────────────

  const renderReadonlyLists = (listsToShow: TodoList[]) => {
    if (listsToShow.length === 0) {
      return (
        <div className="col-span-3 text-center py-16 text-muted-foreground text-sm italic">
          Chưa có todo list nào. Chuyển sang tab &quot;Chỉnh sửa/Thêm mới&quot; để tạo.
        </div>
      );
    }

    return listsToShow.map((list) => {
      const listDone = list.tasks.filter((t) => completedIds.has(t.id)).length;
      const listPct = list.tasks.length > 0 ? Math.round((listDone / list.tasks.length) * 100) : 0;

      return (
        <motion.div
          key={list.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/80 rounded-3xl p-5 flex flex-col gap-3 shadow-xs hover:border-brand/40 transition-all"
        >
          {/* List header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-2.5 w-2.5 rounded-full bg-brand shrink-0" />
              <h3 className="font-bold text-foreground text-sm truncate">{list.title}</h3>
            </div>
            <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-md border border-brand/20 whitespace-nowrap">
              {listDone}/{list.tasks.length}
            </span>
          </div>

          {/* Progress bar */}
          {list.tasks.length > 0 && (
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${listPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          )}

          {/* Tasks */}
          <ul className="space-y-2">
            {list.tasks.length === 0 ? (
              <li className="text-xs text-muted-foreground italic">Chưa có task nào.</li>
            ) : (
              list.tasks.map((task) => {
                const done = completedIds.has(task.id);
                return (
                  <li key={task.id}>
                    <button
                      onClick={() => handleToggle(task.id)}
                      className={cn(
                        'flex items-start gap-2.5 w-full text-left group transition-all cursor-pointer',
                        done ? 'opacity-60' : ''
                      )}
                    >
                      <span className={cn('mt-0.5 shrink-0 transition-colors', done ? 'text-brand' : 'text-muted-foreground group-hover:text-brand')}>
                        {done ? <CheckSquare className="h-4 w-4 text-brand" /> : <Square className="h-4 w-4" />}
                      </span>
                      <span className={cn('text-xs sm:text-sm leading-relaxed', done ? 'line-through text-muted-foreground' : 'text-foreground')}>
                        {task.content}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </motion.div>
      );
    });
  };

  const renderEditLists = (listsToEdit: TodoList[]) => {
    return listsToEdit.map((list) => (
      <motion.div
        key={list.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-sm"
      >
        {/* List header with edit/delete */}
        {editingListId === list.id ? (
          <div className="space-y-2">
            <input
              className="w-full px-3 py-1.5 rounded-lg border border-primary bg-background text-sm font-bold focus:outline-none"
              value={editListTitle}
              onChange={(e) => setEditListTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateList(list.id)}
              autoFocus
            />
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-bold focus:outline-none cursor-pointer"
                value={editListFreq}
                onChange={(e) => setEditListFreq(e.target.value as any)}
              >
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Theo tuần</option>
              </select>
              <button
                onClick={() => handleUpdateList(list.id)}
                className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1"
              >
                <Check className="h-3.5 w-3.5" /> Lưu
              </button>
              <button
                onClick={() => setEditingListId(null)}
                className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-bold hover:bg-muted/80 transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide shrink-0',
              list.frequency === 'daily'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-violet-500/10 text-violet-600 border border-violet-500/20 dark:text-violet-400'
            )}>
              {list.frequency === 'daily' ? 'Hàng ngày' : 'Theo tuần'}
            </span>
            <h3 className="font-extrabold text-foreground text-sm flex-1 truncate">{list.title}</h3>
            <button
              onClick={() => { setEditingListId(list.id); setEditListTitle(list.title); setEditListFreq(list.frequency); }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleDeleteList(list.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Tasks */}
        <ul className="space-y-1.5">
          {list.tasks.map((task) => (
            <li key={task.id} className="group flex items-start gap-2">
              {editingTaskId === task.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    className="flex-1 px-3 py-1 rounded-lg border border-primary bg-background text-xs focus:outline-none"
                    value={editTaskContent}
                    onChange={(e) => setEditTaskContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateTask(task.id, list.id)}
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdateTask(task.id, list.id)}
                    className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setEditingTaskId(null)}
                    className="p-1.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-muted-foreground mt-1 shrink-0">•</span>
                  <button
                    onClick={() => { setEditingTaskId(task.id); setEditTaskContent(task.content); }}
                    className="flex-1 text-left text-xs text-foreground hover:text-primary transition-colors leading-relaxed"
                  >
                    {task.content}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id, list.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-rose-500 hover:bg-rose-500/10 transition-all shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        {/* Add Task input */}
        {addingTaskListId === list.id ? (
          <div className="space-y-2 mt-1">
            <div className="relative">
              <textarea
                className="w-full px-3 py-2 rounded-xl border border-primary bg-background text-xs focus:outline-none resize-none leading-relaxed"
                placeholder={`Nhập task (mỗi dòng = 1 task):\nTask 1\nTask 2\nTask 3`}
                rows={4}
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
                onKeyDown={(e) => {
                  // Ctrl+Enter to submit
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleAddTask(list.id);
                  }
                }}
                autoFocus
              />
              {/* Line count badge */}
              {newTaskContent.trim() && (() => {
                const count = newTaskContent.split('\n').filter(l => l.trim()).length;
                return count > 0 ? (
                  <span className="absolute bottom-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-primary/15 text-primary">
                    {count} task
                  </span>
                ) : null;
              })()}
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              Mỗi dòng = 1 task • <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">Ctrl+Enter</kbd> để lưu
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleAddTask(list.id)}
                className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                {(() => {
                  const count = newTaskContent.split('\n').filter(l => l.trim()).length;
                  return count > 1 ? `Thêm ${count} task` : 'Thêm';
                })()}
              </button>
              <button
                onClick={() => { setAddingTaskListId(null); setNewTaskContent(''); }}
                className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-bold hover:bg-muted/80 transition-all flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" /> Hủy
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setAddingTaskListId(list.id); setNewTaskContent(''); }}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mt-1 group"
          >
            <Plus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Thêm task</span>
          </button>
        )}
      </motion.div>
    ));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand bg-brand/10 px-3 py-1 rounded-full border border-brand/20">
              <ListTodo className="h-3.5 w-3.5" />
              Năng Suất & Kỷ Luật Học Tập
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Kế Hoạch <span className="text-brand">Todo & Pomodoro</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Quản lý nhiệm vụ học tập hàng ngày kết hợp chu kỳ tập trung sâu Pomodoro.
          </p>
        </div>

        {/* Today summary pill */}
        {activeTab !== 'edit' && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-xs">
            <div className="relative h-9 w-9 shrink-0">
              <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/40" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="currentColor" strokeWidth="3"
                  strokeDasharray={`${todayPct} ${100 - todayPct}`}
                  strokeLinecap="round"
                  className="text-brand transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-brand">
                {todayPct}%
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Hôm nay</p>
              <p className="text-[11px] text-muted-foreground">{todayDone}/{todayTotal} việc xong</p>
            </div>
          </div>
        )}
      </div>

      {/* Main grid: Tabs (left) + Pomodoro (right) */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left: Tabs + Content */}
        <div className="lg:col-span-2 space-y-6">

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/60 rounded-2xl border border-border/80 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer',
              activeTab === tab.id
                ? 'bg-background text-brand shadow-xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {/* TODAY TAB */}
          {activeTab === 'today' && (
            <div>
              {dailyLists.length > 0 && (
                <p className="text-xs text-muted-foreground italic mb-4">
                  Click vào mỗi task để đánh dấu hoàn thành. Trạng thái sẽ reset vào ngày mai.
                </p>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {renderReadonlyLists(dailyLists)}
              </div>
            </div>
          )}

          {/* WEEKLY TAB */}
          {activeTab === 'weekly' && (
            <div>
              {weeklyLists.length > 0 && (
                <p className="text-xs text-muted-foreground italic mb-4">
                  Click vào mỗi task để đánh dấu hoàn thành. Trạng thái sẽ reset vào ngày mai.
                </p>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {renderReadonlyLists(weeklyLists)}
              </div>
            </div>
          )}

          {/* EDIT TAB */}
          {activeTab === 'edit' && (
            <div className="space-y-6">
              {/* Add new list button */}
              {!showAddList ? (
                <button
                  onClick={() => setShowAddList(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-primary/40 text-primary text-sm font-bold hover:bg-primary/5 transition-all group"
                >
                  <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Thêm To-do list
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-5 bg-card border border-primary/30 rounded-2xl space-y-3 shadow-sm"
                >
                  <h3 className="text-sm font-extrabold text-foreground">Tạo Todo List mới</h3>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                    placeholder="Tên todo list (VD: Reading: Hàng ngày)"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <select
                      className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none cursor-pointer"
                      value={newListFreq}
                      onChange={(e) => setNewListFreq(e.target.value as any)}
                    >
                      <option value="daily">🗓 Hàng ngày</option>
                      <option value="weekly">📅 Theo tuần</option>
                    </select>
                    <button
                      onClick={handleAddList}
                      className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" /> Thêm
                    </button>
                    <button
                      onClick={() => { setShowAddList(false); setNewListTitle(''); }}
                      className="px-4 py-2 bg-muted text-muted-foreground rounded-xl text-sm font-bold hover:bg-muted/80 transition-all"
                    >
                      Hủy
                    </button>
                  </div>
                </motion.div>
              )}

              <p className="text-xs text-rose-500 italic">
                Click vào mỗi task để chỉnh sửa hoặc vào nút X màu đỏ để xóa.
              </p>

              {/* Daily Lists */}
              {dailyLists.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Hàng ngày</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {renderEditLists(dailyLists)}
                  </div>
                </div>
              )}

              {/* Weekly Lists */}
              {weeklyLists.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Theo tuần</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {renderEditLists(weeklyLists)}
                  </div>
                </div>
              )}

              {lists.length === 0 && !showAddList && (
                <div className="text-center py-16 text-muted-foreground text-sm italic">
                  Chưa có todo list nào. Nhấn &quot;Thêm To-do list&quot; để bắt đầu.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
        </div>

        {/* Right: Pomodoro Timer */}
        <div className="lg:col-span-1">
          <PomodoroTimer userId={userId} initialStats={initialPomodoroStats} />
        </div>
      </div>
    </div>
  );
}
