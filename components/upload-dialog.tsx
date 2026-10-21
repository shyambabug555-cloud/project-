"use client";

import { useState, useRef, useSyncExternalStore } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

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
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // File picker state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form metadata
  const [filename, setFilename] = useState("");
  const [urlSrc, setUrlSrc] = useState("");
  const [category, setCategory] = useState("travel");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");

  const router = useRouter();

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, WebP, GIF).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("File size exceeds 15MB limit.");
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Auto-fill filename from chosen file
    if (!filename) {
      setFilename(file.name);
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFilename("");
    setUrlSrc("");
    setCategory("travel");
    setLocation("");
    setTags("");
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "file" && !selectedFile) {
      setError("Please select a photo from your gallery/device.");
      return;
    }

    if (mode === "url" && !urlSrc.trim()) {
      setError("Please enter a valid image URL.");
      return;
    }

    setLoading(true);

    try {
      let res: Response;

      if (mode === "file" && selectedFile) {
        // Send multipart form data to /api/upload
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("filename", filename.trim() || selectedFile.name);
        formData.append("category", category);
        formData.append("location", location.trim());
        formData.append("tags", tags);

        res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      } else {
        // Send JSON with URL to /api/upload
        res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            src: urlSrc.trim(),
            filename: filename.trim() || "untitled-photo.jpg",
            category,
            location: location.trim() || null,
            tags,
          }),
        });
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to upload photo");
      }

      setSuccess(true);
      setTimeout(() => {
        resetForm();
        setOpen(false);
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during upload");
    } finally {
      setLoading(false);
    }
  };

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
        Upload Photo
      </Button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-border/80 bg-background text-foreground p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground/10 text-foreground">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Upload to Photo Album</h3>
                  <p className="text-xs text-muted-foreground">Store in your cloud Supabase database</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mode Tabs: Gallery / Device File vs URL */}
            <div className="mt-4 flex rounded-2xl border border-border/80 bg-muted/30 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("file");
                  setError(null);
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium transition ${
                  mode === "file"
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FolderOpen className="h-4 w-4" />
                Choose from Gallery / Device
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("url");
                  setError(null);
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium transition ${
                  mode === "url"
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LinkIcon className="h-4 w-4" />
                Paste Image Link / URL
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Photo uploaded successfully to Supabase!
                </div>
              )}

              {/* MODE 1: FILE PICKER */}
              {mode === "file" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />

                  {previewUrl ? (
                    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-muted/20 p-2">
                      <div className="relative h-48 w-full overflow-hidden rounded-xl bg-black/10">
                        <Image
                          src={previewUrl}
                          alt="Upload preview"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between px-2 text-xs text-muted-foreground">
                        <span className="truncate max-w-[300px] font-medium text-foreground">
                          {selectedFile?.name}
                        </span>
                        <span>
                          {selectedFile?.size
                            ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                            : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
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
                          : "border-border/80 bg-muted/20 hover:border-foreground/40 hover:bg-muted/40"
                      }`}
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                        <FolderOpen className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        Click to select photo from your Gallery or Device
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Or drag & drop photo here (PNG, JPG, WebP up to 15MB)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: URL INPUT */}
              {mode === "url" && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Direct Image URL *
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={urlSrc}
                    onChange={(e) => setUrlSrc(e.target.value)}
                    className="w-full rounded-2xl border border-border/80 bg-muted/20 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-foreground/50 transition"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Accepts direct image URLs or Unsplash photo links.
                  </p>
                </div>
              )}

              {/* Metadata Fields */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Photo Title / Filename
                </label>
                <input
                  type="text"
                  placeholder="e.g. sunset-by-the-lake.jpg"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full rounded-2xl border border-border/80 bg-muted/20 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-foreground/50 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-border/80 bg-card text-foreground px-3.5 py-2.5 text-sm outline-none focus:border-foreground/50 transition cursor-pointer"
                  >
                    <option value="travel" className="bg-card text-foreground py-1.5">Travel</option>
                    <option value="people" className="bg-card text-foreground py-1.5">People</option>
                    <option value="nature" className="bg-card text-foreground py-1.5">Nature</option>
                    <option value="events" className="bg-card text-foreground py-1.5">Events</option>
                    <option value="groups" className="bg-card text-foreground py-1.5">Groups</option>
                    <option value="documents" className="bg-card text-foreground py-1.5">Documents</option>
                    <option value="work" className="bg-card text-foreground py-1.5">Work</option>
                    <option value="screenshots" className="bg-card text-foreground py-1.5">Screenshots</option>
                    <option value="uncategorized" className="bg-card text-foreground py-1.5">Uncategorized</option>
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
                  placeholder="landscape, travel, golden hour"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-2xl border border-border/80 bg-muted/20 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-foreground/50 transition"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-border/80">
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
                  type="submit"
                  disabled={loading}
                  className="gap-2 rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Uploading to Cloud..." : "Upload Photo"}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
