'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Link as LinkIcon, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImageUploadFieldProps {
  imageUrl?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  imageUrl,
  onChange,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WebP, GIF, SVG)');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 10MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', '/vocabulary-images');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Upload ảnh thất bại');
      }

      onChange(data.url);
      toast.success('Tải ảnh lên thành công!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi upload ảnh');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    onChange(customUrl.trim());
    setCustomUrl('');
    setShowUrlInput(false);
    toast.success('Đã gắn link ảnh!');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-duo" />
          <span>Hình ảnh minh hoạ (ImageKit)</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          disabled={disabled || isUploading}
          className="text-[11px] font-bold text-muted-foreground hover:text-duo transition-colors flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="h-3 w-3" />
          <span>{showUrlInput ? 'Ẩn nhập URL' : 'Dán URL ảnh'}</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2 items-center">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={disabled || isUploading}
            className="flex-1 bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyCustomUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={handleApplyCustomUrl}
            disabled={!customUrl.trim() || disabled || isUploading}
            className="px-3 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            <span>Áp dụng</span>
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {imageUrl ? (
        /* Image Preview Box */
        <div className="relative group rounded-2xl overflow-hidden border-2 border-border/80 bg-muted/20 p-2.5 flex items-center gap-3.5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted/40 shrink-0 border border-border relative">
            <img
              src={imageUrl}
              alt="Vocabulary illustration"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground truncate">Ảnh minh hoạ</p>
            <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">{imageUrl}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="text-xs font-bold text-duo hover:underline cursor-pointer flex items-center gap-1"
              >
                <Upload className="h-3 w-3" />
                <span>Thay đổi ảnh</span>
              </button>
              <span className="text-border">|</span>
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={disabled || isUploading}
                className="text-xs font-bold text-destructive hover:underline cursor-pointer flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                <span>Xoá ảnh</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Drag & Drop Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border/80 hover:border-primary/50 hover:bg-muted/30 bg-muted/15'
          } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center py-2 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs font-bold text-foreground">Đang tải ảnh lên ImageKit...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center py-1.5 space-y-1.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Upload className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Kéo thả ảnh vào đây, hoặc <span className="text-primary underline">chọn từ thiết bị</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  PNG, JPG, WebP, GIF, SVG (Tối đa 10MB, lưu trên ImageKit)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
