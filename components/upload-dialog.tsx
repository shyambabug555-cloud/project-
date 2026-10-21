"use client";

import { useState, useRef, useSyncExternalStore, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  FolderOpen,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/queries";

const emptySubscribe = () => () => {};

type QueuedFile = {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  status: "ready" | "uploading" | "done" | "duplicate" | "error";
  errorMessage?: string;
};

export function UploadDialog() {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [mode, setMode] = useState<"file" | "url">("file");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // File picker state: Queue of files
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL mode state: Multi-line URLs
  const [urlInput, setUrlInput] = useState("");

  // Common metadata
  const [category, setCategory] = useState("travel");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Upload progress
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    statusText: string;
  } | null>(null);

  // Dynamic categories
  const [categories, setCategories] = useState<Category[]>([]);

  const router = useRouter();

  // Load categories on open
  useEffect(() => {
    if (open) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setCategories(data.data);
          }
        })
        .catch(() => {});
    }
  }, [open]);

  // Handle newly selected or dropped files
  const handleFilesAdded = (files: FileList | File[] | null) => {
    if (!files || !files.length) return;

    setError(null);
    const newItems: QueuedFile[] = [];
    const existingNames = new Set(queue.map((q) => q.name.toLowerCase()));
    let duplicateCount = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        return;
      }

      const lowerName = file.name.toLowerCase();
      const isQueueDuplicate = existingNames.has(lowerName);

      if (isQueueDuplicate) {
        duplicateCount++;
      } else {
        existingNames.add(lowerName);
      }

      newItems.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        status: isQueueDuplicate ? "duplicate" : "ready",
        errorMessage: isQueueDuplicate ? "Duplicate file in selection" : undefined,
      });
    });

    if (!newItems.length) {
      setError("Please select valid image files (JPG, PNG, WebP up to 15MB).");
      return;
    }

    if (duplicateCount > 0) {
      setError(
        `${duplicateCount} duplicate file(s) in selection detected and marked.`,
      );
    }

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueue((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const resetForm = () => {
    queue.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setQueue([]);
    setUrlInput("");
    setCategory("travel");
    setLocation("");
    setTags("");
    setError(null);
    setSuccess(null);
    setUploadProgress(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // MODE 1: FILE UPLOAD
    if (mode === "file") {
      const filesToUpload = queue.filter(
        (item) => item.status !== "duplicate" || !skipDuplicates,
      );

      if (!filesToUpload.length) {
        setError("Please select at least one photo to upload.");
        return;
      }

      setLoading(true);
      let successCount = 0;
      let duplicateCount = 0;
      const total = filesToUpload.length;

      for (let i = 0; i < filesToUpload.length; i++) {
        const item = filesToUpload[i];
        setUploadProgress({
          current: i + 1,
          total,
          statusText: `Uploading "${item.name}" (${i + 1} of ${total})...`,
        });

        // Update item status in UI
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: "uploading" } : q)),
        );

        try {
          const formData = new FormData();
          formData.append("file", item.file);
          formData.append("filename", item.name);
          formData.append("category", category);
          formData.append("location", location.trim());
          formData.append("tags", tags);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (res.status === 409 || data.isDuplicate) {
            duplicateCount++;
            setQueue((prev) =>
              prev.map((q) =>
                q.id === item.id
                  ? {
                      ...q,
                      status: "duplicate",
                      errorMessage: data.error || "Duplicate photo in library",
                    }
                  : q,
              ),
            );
          } else if (!data.success) {
            setQueue((prev) =>
              prev.map((q) =>
                q.id === item.id
                  ? { ...q, status: "error", errorMessage: data.error || "Upload failed" }
                  : q,
              ),
            );
          } else {
            successCount++;
            setQueue((prev) =>
              prev.map((q) => (q.id === item.id ? { ...q, status: "done" } : q)),
            );
          }
        } catch {
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id ? { ...q, status: "error", errorMessage: "Network error" } : q,
            ),
          );
        }
      }

      setLoading(false);
      setUploadProgress(null);

      if (successCount > 0) {
        const msg = `Successfully uploaded ${successCount} photo(s)!${
          duplicateCount > 0 ? ` (${duplicateCount} duplicate photo(s) prevented).` : ""
        }`;
        setSuccess(msg);
        setTimeout(() => {
          resetForm();
          setOpen(false);
          router.refresh();
        }, 1500);
      } else if (duplicateCount > 0) {
        setError(
          `All ${duplicateCount} photo(s) were prevented as duplicates already existing in your archive.`,
        );
      } else {
        setError("Failed to upload photos. Please try again.");
      }
      return;
    }

    // MODE 2: URL UPLOAD (Multiple URLs supported)
    const urls = urlInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 5);

    if (!urls.length) {
      setError("Please enter at least one valid image URL.");
      return;
    }

    setLoading(true);
    setUploadProgress({
      current: 1,
      total: urls.length,
      statusText: `Uploading ${urls.length} photo link(s)...`,
    });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls,
          category,
          location: location.trim() || null,
          tags,
        }),
      });

      const data = await res.json();
      if (!data.success && !data.duplicates?.length) {
        throw new Error(data.error || "Failed to upload from URLs");
      }

      const uploaded = data.data?.length || (data.data ? 1 : 0);
      const dupes = data.duplicates?.length || 0;

      if (uploaded > 0) {
        setSuccess(
          `Uploaded ${uploaded} photo(s)!${dupes > 0 ? ` (${dupes} duplicate link(s) prevented).` : ""}`,
        );
        setTimeout(() => {
          resetForm();
          setOpen(false);
          router.refresh();
        }, 1500);
      } else {
        setError(
          `All ${dupes || urls.length} photo link(s) already exist in your album. Duplicate uploads were prevented.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const totalBytes = queue.reduce((acc, item) => acc + item.size, 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

  return (
    <>
      <Button
        onClick={() => {
          resetForm();
          setOpen(true);
        }}
        className="gap-2 rounded-full bg-foreground text-background hover:bg-foreground/90 transition shadow-sm font-medium"
      >
        <Upload className="h-4 w-4" />
        Upload Photos
      </Button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-[26px] sm:rounded-[32px] border border-border/80 bg-background text-foreground shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/80">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Upload Photos to Archive
                  </h3>
                  <p className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Multiple photo batch upload with duplicate prevention
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Mode Tabs */}
              <div className="flex flex-col sm:flex-row gap-1 rounded-2xl border border-border/80 bg-muted/30 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("file");
                    setError(null);
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-medium transition ${
                    mode === "file"
                      ? "bg-foreground text-background shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FolderOpen className="h-4 w-4 shrink-0" />
                  <span>Choose Multiple Files / Gallery</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("url");
                    setError(null);
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-medium transition ${
                    mode === "url"
                      ? "bg-foreground text-background shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LinkIcon className="h-4 w-4 shrink-0" />
                  <span>Paste Links / Multiple URLs</span>
                </button>
              </div>

              {/* Alert notifications */}
              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Progress Indicator */}
              {uploadProgress && (
                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-foreground">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      {uploadProgress.statusText}
                    </span>
                    <span className="font-mono">
                      {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background/50 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{
                        width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* MODE 1: FILE PICKER (Multiple images) */}
              {mode === "file" && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFilesAdded(e.target.files)}
                  />

                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                      dragActive
                        ? "border-primary bg-primary/10"
                        : "border-border/80 bg-muted/20 hover:border-foreground/40 hover:bg-muted/30"
                    }`}
                  >
                    <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground/10 text-foreground">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      Click to choose photos or drag & drop here
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Select one or multiple photos at once (JPG, PNG, WebP up to 15MB each)
                    </p>
                  </div>

                  {/* Selected Queue List */}
                  {queue.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                        <span className="font-semibold text-foreground">
                          {queue.length} photo(s) in queue ({totalMb} MB)
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add more photos</span>
                        </button>
                      </div>

                      <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                        {queue.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between gap-3 rounded-xl border p-2.5 transition ${
                              item.status === "duplicate"
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                                : item.status === "done"
                                  ? "border-emerald-500/40 bg-emerald-500/10"
                                  : item.status === "error"
                                    ? "border-red-500/40 bg-red-500/10"
                                    : "border-border/80 bg-card/60"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/10">
                                <Image
                                  src={item.previewUrl}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-foreground truncate max-w-[240px] sm:max-w-sm">
                                  {item.name}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                  <span>{(item.size / (1024 * 1024)).toFixed(1)} MB</span>
                                  {item.status === "duplicate" && (
                                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                                      • Duplicate (Skipped)
                                    </span>
                                  )}
                                  {item.status === "done" && (
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                      • Uploaded
                                    </span>
                                  )}
                                  {item.status === "uploading" && (
                                    <span className="font-semibold text-primary">
                                      • Uploading...
                                    </span>
                                  )}
                                  {item.status === "error" && (
                                    <span className="font-semibold text-red-500">
                                      • {item.errorMessage || "Failed"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveFromQueue(item.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0"
                              title="Remove from queue"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Duplicate Prevention Toggle */}
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer pt-1 px-1">
                        <input
                          type="checkbox"
                          checked={skipDuplicates}
                          onChange={(e) => setSkipDuplicates(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                          Automatically prevent duplicate image uploads
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: URL INPUT (Multiple links support) */}
              {mode === "url" && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Paste Image URLs (One per line) *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="https://images.unsplash.com/photo-1506744038136-46273834b3fb&#10;https://images.unsplash.com/photo-1511497584788-87676104235f"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full rounded-2xl border border-border/80 bg-muted/20 p-3.5 text-xs sm:text-sm font-mono text-foreground outline-none focus:border-foreground/50 transition resize-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                    <span>Supports Unsplash links and direct image URLs.</span>
                    <span>
                      {
                        urlInput
                          .split(/[\n,]+/)
                          .filter((u) => u.trim().length > 5).length
                      }{" "}
                      link(s) detected
                    </span>
                  </div>
                </div>
              )}

              {/* Common Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-border/80 bg-card text-foreground px-3.5 py-2.5 text-sm outline-none focus:border-foreground/50 transition cursor-pointer"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.slug} className="bg-card text-foreground">
                          {c.icon || "📁"} {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="travel">✈️ Travel</option>
                        <option value="people">👥 People</option>
                        <option value="nature">🌿 Nature</option>
                        <option value="events">🎉 Events</option>
                        <option value="work">💼 Work</option>
                        <option value="documents">📁 Documents</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kyoto, Japan"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-2xl border border-border/80 bg-muted/20 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-foreground/50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="landscape, golden hour, vacation"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-2xl border border-border/80 bg-muted/20 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-foreground/50 transition"
                />
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-t border-border/80 bg-muted/20">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                Duplicates will be detected and skipped safely
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="rounded-full"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || (mode === "file" && queue.length === 0)}
                  className="gap-2 rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading
                    ? "Uploading..."
                    : mode === "file"
                      ? `Upload ${queue.length > 1 ? `${queue.length} Photos` : "Photo"}`
                      : "Upload Link(s)"}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
