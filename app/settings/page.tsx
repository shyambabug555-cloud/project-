"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Database,
  HardDrive,
  Moon,
  Sun,
  Laptop,
  Download,
  RefreshCw,
  CheckCircle2,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking");
  const [latency, setLatency] = useState<number | null>(null);
  const [stats, setStats] = useState<{ photos: number; albums: number; categories: number } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Check live DB connection
  const checkConnection = async () => {
    setDbStatus("checking");
    const start = performance.now();
    try {
      const [photosRes, albumsRes, categoriesRes] = await Promise.all([
        fetch("/api/photos"),
        fetch("/api/albums"),
        fetch("/api/categories"),
      ]);

      const [photos, albums, categories] = await Promise.all([
        photosRes.json(),
        albumsRes.json(),
        categoriesRes.json(),
      ]);

      const end = performance.now();
      setLatency(Math.round(end - start));

      if (photos.success && albums.success && categories.success) {
        setDbStatus("connected");
        setStats({
          photos: photos.count,
          albums: albums.count,
          categories: categories.count,
        });
      } else {
        setDbStatus("error");
      }
    } catch {
      setDbStatus("error");
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      checkConnection();
    });
  }, []);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const [photosRes, albumsRes] = await Promise.all([
        fetch("/api/photos"),
        fetch("/api/albums"),
      ]);
      const [photosData, albumsData] = await Promise.all([
        photosRes.json(),
        albumsRes.json(),
      ]);

      const backup = {
        exportedAt: new Date().toISOString(),
        photos: photosData.data || [],
        albums: albumsData.data || [],
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `photo-album-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage("Archive metadata exported successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const setTheme = (mode: "light" | "dark" | "system") => {
    if (mode === "system") {
      window.localStorage.removeItem("photo-album-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      window.localStorage.setItem("photo-album-theme", mode);
      document.documentElement.classList.toggle("dark", mode === "dark");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="rounded-[28px] border border-border/80 bg-card/80 p-6 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/10 text-foreground">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Preferences</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-foreground">Settings</h1>
          </div>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      )}

      {/* Cloud Database & Storage Status */}
      <section className="rounded-[28px] border border-border/80 bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Supabase Cloud Database</h2>
              <p className="text-xs text-muted-foreground">PostgreSQL database and cloud media storage</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={dbStatus === "checking"}
            className="rounded-full gap-2 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${dbStatus === "checking" ? "animate-spin" : ""}`} />
            Test Connection
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Status</div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  dbStatus === "connected"
                    ? "bg-emerald-500 animate-pulse"
                    : dbStatus === "checking"
                    ? "bg-amber-500 animate-bounce"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm font-semibold capitalize text-foreground">
                {dbStatus === "checking" ? "Connecting..." : dbStatus}
              </span>
            </div>
            {latency !== null && (
              <div className="mt-1 text-[11px] text-muted-foreground">{latency} ms response time</div>
            )}
          </div>

          <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Storage Bucket</div>
            <div className="mt-2 flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">photos</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">Public Media Uploads</div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Records Stored</div>
            <div className="mt-2 text-sm font-semibold text-foreground">
              {stats ? `${stats.photos} Photos • ${stats.albums} Albums` : "Loading..."}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">Across {stats?.categories ?? 9} categories</div>
          </div>
        </div>
      </section>

      {/* Appearance Settings */}
      <section className="rounded-[28px] border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Theme & Display</h2>
            <p className="text-xs text-muted-foreground">Choose your interface theme</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/80 bg-muted/20 p-4 hover:border-foreground/40 hover:bg-muted/40 transition text-foreground"
          >
            <Sun className="h-5 w-5" />
            <span className="text-xs font-medium">Light</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/80 bg-muted/20 p-4 hover:border-foreground/40 hover:bg-muted/40 transition text-foreground"
          >
            <Moon className="h-5 w-5" />
            <span className="text-xs font-medium">Dark</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("system")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/80 bg-muted/20 p-4 hover:border-foreground/40 hover:bg-muted/40 transition text-foreground"
          >
            <Laptop className="h-5 w-5" />
            <span className="text-xs font-medium">System</span>
          </button>
        </div>
      </section>

      {/* Data Management & Backup */}
      <section className="rounded-[28px] border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Data Backup & Export</h2>
            <p className="text-xs text-muted-foreground">Export your photo collection metadata</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-muted/20 p-4">
          <div>
            <div className="text-sm font-semibold text-foreground">Download Archive Metadata</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Export all photos, albums, and tags as a structured JSON file
            </div>
          </div>
          <Button
            onClick={handleExportData}
            disabled={isExporting}
            className="rounded-full gap-2 bg-foreground text-background font-medium"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export JSON"}
          </Button>
        </div>
      </section>

      {/* System Information */}
      <section className="rounded-[28px] border border-border/80 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          System Information
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl bg-muted/30 p-3">
            <span className="text-muted-foreground">Framework</span>
            <div className="font-semibold text-foreground mt-0.5">Next.js 16.4</div>
          </div>
          <div className="rounded-xl bg-muted/30 p-3">
            <span className="text-muted-foreground">Database</span>
            <div className="font-semibold text-foreground mt-0.5">Supabase Postgres</div>
          </div>
          <div className="rounded-xl bg-muted/30 p-3">
            <span className="text-muted-foreground">Media Storage</span>
            <div className="font-semibold text-foreground mt-0.5">Supabase Storage</div>
          </div>
          <div className="rounded-xl bg-muted/30 p-3">
            <span className="text-muted-foreground">App Version</span>
            <div className="font-semibold text-foreground mt-0.5">v1.0.0 Production</div>
          </div>
        </div>
      </section>
    </div>
  );
}
