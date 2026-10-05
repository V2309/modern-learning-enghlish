import React, { useRef } from 'react';
import { X, Moon, Sun, Download, Upload, RotateCcw, ShieldCheck, Database } from 'lucide-react';
import { Workspace } from '@/types/notion';

interface SettingsModalProps {
  isOpen: boolean;
  theme: 'light' | 'dark';
  workspace: Workspace;
  onClose: () => void;
  onToggleTheme: () => void;
  onExportJson: () => void;
  onImportJson: (importedWorkspace: Workspace) => void;
  onResetWorkspace: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  theme,
  workspace,
  onClose,
  onToggleTheme,
  onExportJson,
  onImportJson,
  onResetWorkspace,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.pages)) {
          onImportJson(parsed);
          onClose();
        } else {
          alert('Invalid Notion backup JSON file format.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Workspace Settings
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-6 text-xs">
          {/* Workspace Details */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Workspace Profile
            </label>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 text-white font-bold text-base dark:bg-neutral-100 dark:text-neutral-900">
                N
              </div>
              <div className="flex-1">
                <div className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">
                  {workspace.name}
                </div>
                <div className="text-neutral-400 text-[11px] mt-0.5">
                  {workspace.pages.filter((p) => !p.isArchived).length} active pages · Local Storage Synced
                </div>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Appearance & Theme
            </label>
            <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-neutral-500" />}
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>

          {/* Backup & Restore */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Data Management & Backup
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={onExportJson}
                className="flex w-full items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-neutral-500" />
                  <div className="text-left">
                    <div className="font-medium text-neutral-800 dark:text-neutral-200">
                      Export Full Backup (JSON)
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Download all pages, nested blocks, and databases.
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-blue-600 font-medium">Download</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 text-neutral-500" />
                  <div className="text-left">
                    <div className="font-medium text-neutral-800 dark:text-neutral-200">
                      Import Backup (JSON)
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Restore workspace from an exported JSON file.
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-blue-600 font-medium">Select file</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to reset workspace to the default starter data?')) {
                    onResetWorkspace();
                    onClose();
                  }
                }}
                className="flex w-full items-center justify-between p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-rose-600"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Reset to Sample Data</div>
                    <div className="text-[11px] text-rose-400">
                      Restores all demo pages, roadmap database, and tutorials.
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
