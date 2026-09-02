"use client";

import React, { useState, useEffect, useTransition, use } from "react";
import { getDictationTopicForAdmin } from "@/actions/dictation/topic.actions";
import {
  createDictationSentence,
  updateDictationSentence,
  deleteDictationSentence,
  reorderDictationSentences,
} from "@/actions/dictation/sentence.actions";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  Loader2,
  Upload,
  BookOpen,
  Volume2,
  FileAudio,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Sentence {
  id: string;
  topicId: string;
  audioUrl: string;
  transcript: string;
  duration: number;
  order: number;
}

interface Topic {
  id: string;
  title: string;
  description: string | null;
  level: string;
  sentences: Sentence[];
}

interface AdminSentencesPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default function AdminSentencesPage({ params }: AdminSentencesPageProps) {
  const { topicId } = use(params);

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Audio player preview state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<HTMLAudioElement | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);
  const [formData, setFormData] = useState({
    transcript: "",
    audioUrl: "",
    duration: 0,
    order: 0,
  });

  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const loadTopic = async () => {
    setLoading(true);
    const res = await getDictationTopicForAdmin(topicId);
    if (res.success && res.topic) {
      setTopic(res.topic as any);
    } else {
      toast.error(res.error || "Failed to load topic details");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTopic();
    return () => {
      if (audioPreview) {
        audioPreview.pause();
      }
    };
  }, [topicId]);

  const handlePlayPreview = (id: string, url: string) => {
    if (playingId === id) {
      if (audioPreview) {
        audioPreview.pause();
      }
      setPlayingId(null);
    } else {
      if (audioPreview) {
        audioPreview.pause();
      }
      const newAudio = new Audio(url);
      newAudio.onended = () => setPlayingId(null);
      newAudio.onerror = () => {
        toast.error("Failed to play audio preview");
        setPlayingId(null);
      };
      newAudio.play();
      setAudioPreview(newAudio);
      setPlayingId(id);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSentence(null);
    setFileToUpload(null);
    setFormData({
      transcript: "",
      audioUrl: "",
      duration: 0,
      order: topic?.sentences.length || 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sentence: Sentence) => {
    setEditingSentence(sentence);
    setFileToUpload(null);
    setFormData({
      transcript: sentence.transcript,
      audioUrl: sentence.audioUrl,
      duration: sentence.duration,
      order: sentence.order,
    });
    setIsModalOpen(true);
  };

  const handleUploadAudio = async () => {
    if (!fileToUpload) return null;

    setUploading(true);
    const form = new FormData();
    form.append("file", fileToUpload);
    form.append("folder", "/dictation-audio");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await res.json();
      setUploading(false);
      return result.url; // ImageKit public CDN URL
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Audio upload failed");
      setUploading(false);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.transcript.trim()) {
      toast.error("Transcript is required");
      return;
    }

    startTransition(async () => {
      let finalAudioUrl = formData.audioUrl;

      // If a file is pending upload
      if (fileToUpload) {
        const uploadedUrl = await handleUploadAudio();
        if (!uploadedUrl) return; // toast already handled
        finalAudioUrl = uploadedUrl;
      }

      if (!finalAudioUrl) {
        toast.error("Please upload an audio file or provide an audio URL!");
        return;
      }

      if (editingSentence) {
        // Edit sentence
        const res = await updateDictationSentence(editingSentence.id, {
          transcript: formData.transcript,
          audioUrl: finalAudioUrl,
          duration: Number(formData.duration),
          order: Number(formData.order),
        });

        if (res.success) {
          toast.success("Sentence updated!");
          setIsModalOpen(false);
          loadTopic();
        } else {
          toast.error(res.error || "Failed to update sentence");
        }
      } else {
        // Create sentence
        const res = await createDictationSentence({
          topicId,
          transcript: formData.transcript,
          audioUrl: finalAudioUrl,
          duration: Number(formData.duration),
          order: Number(formData.order),
        });

        if (res.success) {
          toast.success("Sentence created!");
          setIsModalOpen(false);
          loadTopic();
        } else {
          toast.error(res.error || "Failed to create sentence");
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this sentence? All attempts related to it will be lost.")) {
      return;
    }

    const res = await deleteDictationSentence(id);
    if (res.success) {
      toast.success("Sentence deleted!");
      loadTopic();
    } else {
      toast.error(res.error || "Failed to delete sentence");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (!topic) return;
    const items = [...topic.sentences];
    const targetIdx = direction === "up" ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= items.length) return;

    // Swap order values
    const temp = items[index].order;
    items[index].order = items[targetIdx].order;
    items[targetIdx].order = temp;

    const payload = items.map((item) => ({ id: item.id, order: item.order }));

    const res = await reorderDictationSentences(topicId, payload);
    if (res.success) {
      loadTopic();
    } else {
      toast.error("Failed to swap order");
    }
  };

  // Helper to extract duration from file metadata on client
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToUpload(file);
      
      // Auto-extract audio length
      const audioUrl = URL.createObjectURL(file);
      const audio = new Audio(audioUrl);
      audio.onloadedmetadata = () => {
        setFormData((prev) => ({
          ...prev,
          duration: Math.round(audio.duration),
        }));
      };
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      {/* Top navbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
            <Link href="/admin/dictation" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft size={14} />
              <span>Back to Admin Topics</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-foreground">
            {topic?.title || "Manage Sentences"}
          </h1>
          <p className="text-xs text-muted-foreground">
            Topic Level: <span className="font-bold uppercase text-primary">{topic?.level}</span>
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all self-start sm:self-auto active:scale-98"
        >
          <Plus size={16} />
          <span>Add Sentence</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground font-medium">Loading sentences...</span>
        </div>
      ) : !topic || topic.sentences.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-3xl bg-muted/10">
          <Volume2 className="h-10 w-10 text-muted-foreground/60 mb-2" />
          <h3 className="text-base font-bold text-foreground">No sentences yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Add audio recordings and transcripts to make this topic available for students.
          </p>
        </div>
      ) : (
        <div className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
          {/* Sentence Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-muted/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-6">Transcript</div>
            <div className="col-span-1 text-center">Duration</div>
            <div className="col-span-2 text-center">Audio</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Sentence Rows */}
          <div className="divide-y divide-border">
            {topic.sentences.map((sentence, index) => (
              <div
                key={sentence.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4 items-center text-sm hover:bg-muted/10 transition-all"
              >
                {/* Order Index */}
                <div className="col-span-1 font-bold text-muted-foreground text-center sm:block flex items-center gap-2">
                  <span className="sm:hidden text-xs font-bold text-muted-foreground uppercase">Sentence:</span>
                  <span>{index + 1}</span>
                </div>

                {/* Transcript text */}
                <div className="col-span-1 sm:col-span-6 font-semibold text-foreground">
                  <span className="sm:hidden block text-xs font-bold text-muted-foreground uppercase mb-1">Transcript:</span>
                  <span>{sentence.transcript}</span>
                </div>

                {/* Duration */}
                <div className="col-span-1 text-center sm:block flex items-center gap-2">
                  <span className="sm:hidden text-xs font-bold text-muted-foreground uppercase">Length:</span>
                  <span className="font-medium text-muted-foreground">{sentence.duration}s</span>
                </div>

                {/* Audio preview */}
                <div className="col-span-1 sm:col-span-2 text-center sm:block flex items-center gap-2">
                  <span className="sm:hidden text-xs font-bold text-muted-foreground uppercase">Preview:</span>
                  <button
                    onClick={() => handlePlayPreview(sentence.id, sentence.audioUrl)}
                    className="p-2 cursor-pointer rounded-full bg-secondary hover:bg-secondary-hover text-foreground transition-all inline-flex items-center gap-1.5"
                  >
                    {playingId === sentence.id ? (
                      <Pause size={14} fill="currentColor" />
                    ) : (
                      <Play size={14} fill="currentColor" className="ml-0.5" />
                    )}
                    <span className="text-xs font-bold sm:hidden">Listen</span>
                  </button>
                </div>

                {/* Actions */}
                <div className="col-span-1 sm:col-span-2 flex items-center justify-between sm:justify-end gap-1">
                  {/* Sorting actions */}
                  <div className="flex items-center gap-0.5 mr-2">
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === topic.sentences.length - 1}
                      className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleOpenEditModal(sentence)}
                      className="p-2 cursor-pointer rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                      title="Edit Sentence"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(sentence.id)}
                      className="p-2 cursor-pointer rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                      title="Delete Sentence"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border bg-muted/40">
              <h2 className="text-lg font-black text-foreground">
                {editingSentence ? "Edit Sentence" : "Add Sentence"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Transcript
                </label>
                <textarea
                  required
                  value={formData.transcript}
                  onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                  placeholder="e.g. I wake up at seven every morning."
                  className="w-full h-20 p-3 border border-border rounded-xl bg-muted/10 outline-none text-foreground text-sm focus:border-primary/50 resize-none"
                />
              </div>

              {/* Upload file and Audio Url selection */}
              <div className="flex flex-col gap-2 p-4 border border-border/80 bg-muted/10 rounded-2xl">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileAudio size={14} />
                  <span>Audio Source</span>
                </label>
                
                {/* File picker */}
                <input
                  type="file"
                  accept="audio/mp3,audio/wav,audio/m4a,audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="audio-uploader"
                />
                <label
                  htmlFor="audio-uploader"
                  className="w-full cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-border/80 hover:border-primary/40 rounded-xl p-4 bg-card text-center hover:bg-muted/10 transition-all"
                >
                  <Upload size={20} className="text-muted-foreground mb-1.5" />
                  <span className="text-xs font-bold text-foreground">
                    {fileToUpload ? fileToUpload.name : "Select MP3, WAV or M4A"}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    (Auto calculates length)
                  </span>
                </label>

                <div className="text-center text-[10px] font-bold text-muted-foreground uppercase my-1">
                  &mdash; or enter URL &mdash;
                </div>

                <input
                  type="text"
                  value={formData.audioUrl}
                  disabled={!!fileToUpload}
                  onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                  placeholder="https://example.com/audio.mp3"
                  className="w-full p-2.5 border border-border rounded-xl bg-card outline-none text-foreground text-xs focus:border-primary/50 disabled:opacity-50"
                />
              </div>

              {/* Duration and Sorting order */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Duration (sec)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 border border-border rounded-xl bg-muted/10 outline-none text-foreground text-sm focus:border-primary/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Order Index
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 border border-border rounded-xl bg-muted/10 outline-none text-foreground text-sm focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Action Buttons */}
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
                  disabled={isPending || uploading}
                  className="px-4 py-2 rounded-xl bg-foreground text-background font-bold text-xs hover:bg-foreground/90 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {(isPending || uploading) && <Loader2 size={12} className="animate-spin" />}
                  <span>{uploading ? "Uploading Audio..." : editingSentence ? "Save" : "Create"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
