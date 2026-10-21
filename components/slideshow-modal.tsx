"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Heart,
  Download,
  Sliders,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { Photo } from "@/lib/queries";

const emptySubscribe = () => () => {};

export type AnimationType =
  | "fade"
  | "kenburns"
  | "slide"
  | "scale-blur"
  | "flip"
  | "shuffle";

const ANIMATION_OPTIONS: { id: AnimationType; label: string; description: string }[] = [
  { id: "fade", label: "Smooth Fade", description: "Soft elegant cross-fade" },
  { id: "kenburns", label: "Ken Burns", description: "Cinematic slow zoom & pan" },
  { id: "slide", label: "Slide", description: "Horizontal glide transition" },
  { id: "scale-blur", label: "Editorial Blur", description: "Scale with depth blur" },
  { id: "flip", label: "3D Flip", description: "Card rotation in 3D perspective" },
  { id: "shuffle", label: "Auto Cycle", description: "Cycles all animations randomly" },
];

const SPEED_OPTIONS = [
  { label: "2s", value: 2000 },
  { label: "4s (Default)", value: 4000 },
  { label: "6s", value: 6000 },
  { label: "8s", value: 8000 },
];

type SlideshowModalProps = {
  photos: Photo[];
  startIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onDeletePhoto?: (photoId: string) => void;
  onToggleFavorite?: (photoId: string, currentFav: boolean) => void;
};

export function SlideshowModal({
  photos,
  startIndex = 0,
  isOpen,
  onClose,
  onDeletePhoto,
  onToggleFavorite,
}: SlideshowModalProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [intervalMs, setIntervalMs] = useState(4000); // 4 seconds by default
  const [animation, setAnimation] = useState<AnimationType>("kenburns");
  const [activeAnimation, setActiveAnimation] = useState<string>("kenburns");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize start index when opening
  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setCurrentIndex(startIndex >= 0 && startIndex < photos.length ? startIndex : 0);
        setIsPlaying(true);
        setProgress(0);
      });
    }
  }, [isOpen, startIndex, photos.length]);

  const currentPhoto = photos[currentIndex];

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Resolve random animation for 'shuffle'
  const resolveAnimation = useCallback(() => {
    if (animation === "shuffle") {
      const pool = ["fade", "kenburns", "slide", "scale-blur", "flip"];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setActiveAnimation(pick);
    } else {
      setActiveAnimation(animation);
    }
  }, [animation]);

  const goToNext = useCallback(() => {
    if (!photos.length) return;
    resolveAnimation();
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setProgress(0);
  }, [photos.length, resolveAnimation]);

  const goToPrev = useCallback(() => {
    if (!photos.length) return;
    resolveAnimation();
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setProgress(0);
  }, [photos.length, resolveAnimation]);

  // Slideshow auto-advance every intervalMs (4 seconds default)
  useEffect(() => {
    if (!isOpen || !isPlaying || photos.length <= 1) {
      if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const stepMs = 50;
    const increment = (stepMs / intervalMs) * 100;

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    autoAdvanceTimerRef.current = setInterval(() => {
      goToNext();
    }, intervalMs);

    return () => {
      if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isOpen, isPlaying, intervalMs, photos.length, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToNext, goToPrev, onClose, toggleFullscreen]);

  const handleDownload = async (photo: Photo) => {
    try {
      const res = await fetch(photo.src, { mode: "cors" });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = photo.filename || "slideshow-photo.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(photo.src, "_blank");
    }
  };

  const handleDeleteCurrent = async () => {
    if (!currentPhoto) return;
    const confirmDelete = window.confirm(
      `Delete "${currentPhoto.filename}" from your archive?`,
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await fetch(`/api/photos/${currentPhoto.id}`, { method: "DELETE" });
      onDeletePhoto?.(currentPhoto.id);
      if (photos.length <= 1) {
        onClose();
      } else {
        goToNext();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !mounted || !photos.length || !currentPhoto) return null;

  // Resolve animation classes
  let animationStyle = "transition-all duration-700 ease-out";
  if (activeAnimation === "kenburns") {
    animationStyle = "animate-[kenburns_4s_ease-out_forwards]";
  } else if (activeAnimation === "slide") {
    animationStyle = "animate-[slideIn_0.6s_cubic-bezier(0.16,1,0.3,1)]";
  } else if (activeAnimation === "scale-blur") {
    animationStyle = "animate-[scaleBlur_0.7s_ease-out]";
  } else if (activeAnimation === "flip") {
    animationStyle = "animate-[flip3d_0.8s_ease-out]";
  } else {
    // default fade
    animationStyle = "animate-[fadeIn_0.5s_ease-in-out]";
  }

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[999999] flex flex-col bg-black text-white select-none overflow-hidden"
    >
      {/* Top 4-second Countdown Progress Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-white/20 z-50">
        <div
          className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary transition-all duration-75"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {/* Top Floating Control Bar */}
      <div className="absolute top-3 inset-x-3 sm:top-5 sm:inset-x-6 z-40 flex items-center justify-between pointer-events-none">
        {/* Left: Counter & Status */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3.5 py-1.5 backdrop-blur-md text-xs font-medium text-white shadow-lg">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="text-white/40">•</span>
          <span className="text-white/80">{intervalMs / 1000}s interval</span>
        </div>

        {/* Right: Quick Actions */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Animation & Speed Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings((prev) => !prev)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition backdrop-blur-md ${
              showSettings
                ? "border-primary bg-primary text-black"
                : "border-white/20 bg-black/60 text-white hover:bg-black/80"
            }`}
            title="Slideshow Settings (Animation, Speed)"
            aria-label="Slideshow Settings"
          >
            <Sliders className="h-4 w-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-black/80 transition backdrop-blur-md"
            title="Toggle Fullscreen (F)"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Close Slideshow */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-rose-600 transition backdrop-blur-md"
            title="Exit Slideshow (Esc)"
            aria-label="Exit Slideshow"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Floating Settings Popover */}
      {showSettings && (
        <div className="absolute top-16 right-4 sm:right-6 z-50 w-80 rounded-2xl border border-white/20 bg-black/90 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Slideshow Options
            </span>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-xs text-white/60 hover:text-white"
            >
              Close
            </button>
          </div>

          {/* Speed Selector */}
          <div className="mb-4">
            <label className="text-[11px] font-medium text-white/60 flex items-center gap-1.5 mb-2">
              <Clock className="h-3 w-3" />
              Interval per slide
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setIntervalMs(opt.value);
                    setProgress(0);
                  }}
                  className={`rounded-xl py-1.5 px-2 text-xs font-medium transition ${
                    intervalMs === opt.value
                      ? "bg-primary text-black font-semibold shadow-sm"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Selector */}
          <div>
            <label className="text-[11px] font-medium text-white/60 flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3 w-3" />
              Transition Animation
            </label>
            <div className="space-y-1">
              {ANIMATION_OPTIONS.map((anim) => (
                <button
                  key={anim.id}
                  type="button"
                  onClick={() => {
                    setAnimation(anim.id);
                    resolveAnimation();
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                    animation === anim.id
                      ? "bg-white/20 text-white font-semibold"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{anim.label}</span>
                  <span className="text-[10px] text-white/40">{anim.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Slide Viewer */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-12 overflow-hidden">
        {/* Navigation arrow buttons */}
        <button
          type="button"
          onClick={goToPrev}
          className="absolute left-3 sm:left-6 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white hover:bg-black/70 hover:scale-110 active:scale-95 transition backdrop-blur-md"
          title="Previous Photo (Left Arrow)"
          aria-label="Previous Photo"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={goToNext}
          className="absolute right-3 sm:right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white hover:bg-black/70 hover:scale-110 active:scale-95 transition backdrop-blur-md"
          title="Next Photo (Right Arrow)"
          aria-label="Next Photo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Current Photo Display with Dynamic Animation */}
        <div
          key={currentPhoto.id + "-" + activeAnimation}
          className={`relative max-w-full max-h-full flex items-center justify-center ${animationStyle}`}
          style={{ perspective: 1200 }}
        >
          <div className="relative w-auto h-auto max-h-[82vh] max-w-[92vw] overflow-hidden rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-white/10">
            <Image
              src={currentPhoto.src}
              alt={currentPhoto.filename}
              width={currentPhoto.width || 1600}
              height={currentPhoto.height || 1000}
              className="max-h-[82vh] max-w-[92vw] w-auto h-auto object-contain pointer-events-none"
              priority
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Bottom Floating Information & Control Bar */}
      <div className="absolute bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-8 z-40 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
        {/* Photo Title & Metadata */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/15 bg-black/70 px-4 py-2.5 backdrop-blur-md max-w-md shadow-xl">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white truncate" title={currentPhoto.filename}>
              {currentPhoto.filename}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-white/60">
              <span>{currentPhoto.createdAt?.slice(0, 10)}</span>
              {currentPhoto.metadata?.location && (
                <>
                  <span>•</span>
                  <span className="truncate">{currentPhoto.metadata.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Playback Controls Bar */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-black/70 p-1.5 backdrop-blur-md shadow-xl">
          {/* Favorite */}
          <button
            type="button"
            onClick={() => onToggleFavorite?.(currentPhoto.id, currentPhoto.isFavorite)}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
              currentPhoto.isFavorite
                ? "bg-rose-500 text-white"
                : "text-white/80 hover:bg-white/15 hover:text-white"
            }`}
            title="Toggle Favorite"
            aria-label="Toggle Favorite"
          >
            <Heart className={`h-4 w-4 ${currentPhoto.isFavorite ? "fill-current" : ""}`} />
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={() => handleDownload(currentPhoto)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/15 hover:text-white transition"
            title="Download Image"
            aria-label="Download Image"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition shadow-lg"
            title={isPlaying ? "Pause Slideshow (Space)" : "Resume Slideshow (Space)"}
            aria-label={isPlaying ? "Pause Slideshow" : "Resume Slideshow"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Single Delete Photo Button */}
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDeleteCurrent}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-rose-500/20 hover:text-rose-400 transition"
            title="Delete this photo"
            aria-label="Delete this photo"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Global CSS Keyframes for Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes kenburns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.08) translate(-1%, -1%);
          }
        }
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateX(60px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scaleBlur {
          0% {
            opacity: 0;
            filter: blur(8px);
            transform: scale(0.92);
          }
          100% {
            opacity: 1;
            filter: blur(0px);
            transform: scale(1);
          }
        }
        @keyframes flip3d {
          0% {
            opacity: 0;
            transform: rotateY(25deg) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: rotateY(0deg) scale(1);
          }
        }
      `}</style>
    </div>,
    document.body,
  );
}
