'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Pagination from '@/components/Pagination';

interface TopicProgress {
  id: string;
  name: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
}

interface TopicProgressListProps {
  topicCompletionRates: TopicProgress[];
}

const PAGE_SIZE = 4;

export default function TopicProgressList({ topicCompletionRates }: TopicProgressListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(topicCompletionRates.length / PAGE_SIZE));
  
  // Paginated data
  const paginatedTopics = topicCompletionRates.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-2xl font-black text-foreground">Tiến trình từ vựng theo chủ đề</h2>
        <Link href="/vocabulary" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          Thư viện từ vựng <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {topicCompletionRates.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground italic bg-card border border-border rounded-3xl">
          Chưa có chủ đề từ vựng nào được tìm thấy.
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {paginatedTopics.map((topic) => (
              <div key={topic.id} className="p-5 rounded-3xl bg-card border border-border flex flex-col justify-between gap-3 hover:border-emerald-500/40 transition-colors">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-foreground line-clamp-1">{topic.name}</h3>
                  <p className="text-xs text-muted-foreground">{topic.completedCount} / {topic.totalCount} từ đã thuộc</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden border border-border">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${topic.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground w-8 text-right">{topic.percentage}%</span>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={topicCompletionRates.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
