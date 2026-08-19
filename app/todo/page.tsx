import React from 'react';
import { getCurrentUser } from '@/services/user.service';
import { getTodoLists, getTodoCompletionsForDate } from '@/services/todo.service';
import { getPomodoroStats } from '@/services/pomodoro.service';
import TodoClient from '@/components/todo/TodoClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Todo List – Linguify',
  description: 'Quản lý danh sách nhiệm vụ học tập hàng ngày của bạn.',
};

export default async function TodoPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Vui lòng đăng nhập để xem Todo list.
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  const [todoLists, completions, pomodoroStats] = await Promise.all([
    getTodoLists(user.uid),
    getTodoCompletionsForDate(user.uid, today),
    getPomodoroStats(user.uid),
  ]);

  const completedTaskIds = completions.map((c) => c.taskId);

  return (
    <TodoClient
      userId={user.uid}
      initialLists={todoLists as any}
      initialCompletedIds={completedTaskIds}
      today={today}
      initialPomodoroStats={pomodoroStats}
    />
  );
}

