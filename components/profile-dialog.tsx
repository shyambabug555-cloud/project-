"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  User,
  Settings,
  Sparkles,
  FolderHeart,
  ChevronDown,
  X,
  Check,
  ShieldCheck,
  HardDrive,
  Edit3,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const emptySubscribe = () => () => {};

export function ProfileDialog({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [profileName, setProfileName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("photo_archive_profile");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name) return parsed.name;
        }
      } catch {
        // Ignore
      }
    }
    return "Personal Archive";
  });

  const [profileInitials, setProfileInitials] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("photo_archive_profile");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.initials) return parsed.initials;
        }
      } catch {
        // Ignore
      }
    }
    return "PA";
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempInitials, setTempInitials] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);

  const handleOpen = () => {
    setTempName(profileName);
    setTempInitials(profileInitials);
    setIsEditing(false);
    setSavedNotice(false);
    setOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = tempName.trim() || "Personal Archive";
    const finalInitials =
      tempInitials.trim().toUpperCase() ||
      finalName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() ||
      "PA";

    setProfileName(finalName);
    setProfileInitials(finalInitials);
    setIsEditing(false);
    setSavedNotice(true);

    try {
      localStorage.setItem(
        "photo_archive_profile",
        JSON.stringify({ name: finalName, initials: finalInitials }),
      );
    } catch {
      // Ignore
    }

    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <>
      {/* Trigger: Desktop Pill or Mobile Avatar */}
      {variant === "desktop" ? (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Open profile and archive menu"
          className="flex items-center gap-2 rounded-full border border-border/80 bg-muted/20 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-foreground hover:bg-muted/40 hover:border-foreground/30 transition cursor-pointer active:scale-95"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background tracking-wider shadow-sm">
            {profileInitials}
          </div>
          <span className="hidden md:inline font-medium">{profileName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:inline" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Open user profile menu"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer border-2 border-background"
        >
          {profileInitials}
        </button>
      )}

      {/* Profile Dialog Modal */}
      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-[28px] sm:rounded-[32px] border border-border/80 bg-background text-foreground p-5 sm:p-6 shadow-2xl space-y-5"
          >
            {/* Header & Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <User className="h-4 w-4 text-primary" />
                <span>Archive Profile & Account</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close profile dialog"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Card Header */}
            <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-muted/20 p-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground text-xl font-bold text-background shadow-md">
                  {profileInitials}
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-background" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {profileName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition"
                    title="Edit profile name"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Archive Owner (Admin)</span>
                </div>
                <div className="text-[11px] text-muted-foreground/80 mt-1 truncate">
                  Supabase Database Synced
                </div>
              </div>
            </div>

            {/* Saved Notification */}
            {savedNotice && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" />
                Profile updated successfully!
              </div>
            )}

            {/* Edit Profile Form */}
            {isEditing && (
              <form onSubmit={handleSaveProfile} className="space-y-3 rounded-2xl border border-border/80 bg-muted/30 p-4">
                <div className="text-xs font-semibold text-foreground">Edit Profile Information</div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="e.g. Shyam Developer"
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-foreground/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    Avatar Initials (1-3 letters)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={tempInitials}
                    onChange={(e) => setTempInitials(e.target.value.toUpperCase())}
                    placeholder="e.g. SD or PA"
                    className="w-24 rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none uppercase font-bold focus:border-foreground/50 transition"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background hover:bg-foreground/90 transition shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Quick Navigation Links */}
            <div className="space-y-1.5">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-1">
                Quick Shortcuts
              </div>
              <Link
                href="/albums"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl p-2.5 text-xs sm:text-sm font-medium text-foreground hover:bg-muted/40 transition"
              >
                <div className="flex items-center gap-3">
                  <FolderHeart className="h-4 w-4 text-primary" />
                  <span>View All Albums</span>
                </div>
                <span className="text-xs text-muted-foreground">Collections</span>
              </Link>
              <Link
                href="/favorites"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl p-2.5 text-xs sm:text-sm font-medium text-foreground hover:bg-muted/40 transition"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Favorite Moments</span>
                </div>
                <span className="text-xs text-muted-foreground">Starred</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl p-2.5 text-xs sm:text-sm font-medium text-foreground hover:bg-muted/40 transition"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-foreground/80" />
                  <span>Settings & Database Status</span>
                </div>
                <span className="text-xs text-muted-foreground">Config</span>
              </Link>
            </div>

            {/* Appearance & Storage Info */}
            <div className="border-t border-border/80 pt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-muted/20 px-3.5 py-2.5">
                <span className="text-xs font-medium text-muted-foreground">Appearance Theme</span>
                <ThemeToggle />
              </div>

              <div className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-muted/20 px-3.5 py-2.5 text-xs text-muted-foreground">
                <HardDrive className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">Supabase Storage: Active</div>
                  <div className="text-[11px] text-muted-foreground">Unlimited Cloud Backup & Uploads</div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded-2xl bg-muted/40 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition"
            >
              Close
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
