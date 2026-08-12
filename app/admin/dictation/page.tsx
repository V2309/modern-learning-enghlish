"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getDictationTopics, createDictationTopic, updateDictationTopic, deleteDictationTopic } from "@/actions/dictation/topic.actions";
import { Plus, Edit, Trash2, ArrowRight, ArrowLeft, Loader2, Sparkles, BookOpen, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Topic {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  level: string;
  totalSentences: number;
}

export default function AdminDictationTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "Beginner",
    order: 0,
  });

  const loadTopics = async () => {
    setLoading(true);
    const res = await getDictationTopics();
    if (res.success && res.topics) {
      setTopics(res.topics as Topic[]);
    } else {
      toast.error(res.error || "Failed to load topics");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingTopic(null);
    setFormData({
      title: "",
      description: "",
      level: "Beginner",
      order: topics.length,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      title: topic.title,
      description: topic.description || "",
      level: topic.level,
      order: (topic as any).order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    startTransition(async () => {
      if (editingTopic) {
        // Edit topic
        const res = await updateDictationTopic(editingTopic.id, {
          title: formData.title,
          description: formData.description,
          level: formData.level,
          order: Number(formData.order),
        });

        if (res.success) {
          toast.success("Topic updated successfully!");
          setIsModalOpen(false);
          loadTopics();
        } else {
          toast.error(res.error || "Failed to update topic");
        }
      } else {
        // Create topic
        const res = await createDictationTopic({
          title: formData.title,
          description: formData.description,
          level: formData.level,
          order: Number(formData.order),
        });

        if (res.success) {
          toast.success("Topic created successfully!");
          setIsModalOpen(false);
          loadTopics();
        } else {
          toast.error(res.error || "Failed to create topic");
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topic? All sentences and student attempts will be deleted permanently.")) {
      return;
    }

    const res = await deleteDictationTopic(id);
    if (res.success) {
      toast.success("Topic deleted successfully!");
      loadTopics();
    } else {
      toast.error(res.error || "Failed to delete topic");
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      {/* Admin header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
            <Link href="/dictation" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft size={14} />
              <span>Dictation Page</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <BookOpen className="text-primary" />
            <span>Admin: Dictation Topics</span>
          </h1>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all self-start sm:self-auto active:scale-98 shadow-sm shadow-primary/10"
        >
          <Plus size={16} />
          <span>New Topic</span>
        </button>
      </div>

      {/* List of Topics */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground font-medium">Loading topics...</span>
        </div>
      ) : topics.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-3xl bg-muted/10">
          <AlertCircle className="h-10 w-10 text-muted-foreground/60 mb-2" />
          <h3 className="text-base font-bold text-foreground">No topics yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Create your first dictation topic to start adding sentences.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="flex items-start justify-between p-5 border border-border bg-card rounded-2xl shadow-sm hover:shadow transition-all group"
            >
              <div className="space-y-1.5 pr-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                    {topic.level}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    Order: {(topic as any).order ?? 0}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                  {topic.title}
                </h3>
                {topic.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {topic.description}
                  </p>
                )}
                <div className="text-[11px] font-bold text-muted-foreground pt-1 flex items-center gap-1">
                  <span>{topic.totalSentences || 0} sentences</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Link
                  href={`/admin/dictation/${topic.id}`}
                  className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold hover:bg-foreground/90 transition-all text-center"
                >
                  <span>Manage</span>
                  <ArrowRight size={12} />
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(topic)}
                    className="p-2 cursor-pointer rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    title="Edit Topic"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(topic.id)}
                    className="p-2 cursor-pointer rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                    title="Delete Topic"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border bg-muted/40">
              <h2 className="text-lg font-black text-foreground">
                {editingTopic ? "Edit Topic" : "Create Topic"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Daily Routine"
                  className="w-full p-3 border border-border rounded-xl bg-muted/10 outline-none text-foreground text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the sentences theme..."
                  className="w-full h-24 p-3 border border-border rounded-xl bg-muted/10 outline-none text-foreground text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/10 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full p-3 border border-border rounded-xl bg-card outline-none text-foreground text-sm focus:border-primary/50"
                  >
                    <option value="Beginner">Beginner (A1-A2)</option>
                    <option value="Intermediate">Intermediate (B1-B2)</option>
                    <option value="Advanced">Advanced (C1-C2)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 border border-border rounded-xl bg-muted/10 outline-none text-foreground text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-card font-semibold text-xs text-foreground hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-foreground text-background font-bold text-xs hover:bg-foreground/90 transition-all flex items-center gap-1.5"
                >
                  {isPending && <Loader2 size={12} className="animate-spin" />}
                  <span>{editingTopic ? "Save Changes" : "Create"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
