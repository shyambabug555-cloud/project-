"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  FileText,
  FolderHeart,
  Grid2x2,
  Home,
  MapPinned,
  Search,
  Settings,
  Sparkles,
  Users,
  Menu,
  X,
  Calendar,
  Briefcase,
  Trees,
  Clock,
  BookmarkCheck,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { UploadDialog } from "@/components/upload-dialog";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/gallery", label: "All Photos", icon: Grid2x2 },
  { href: "/albums", label: "Albums", icon: FolderHeart },
  { href: "/favorites", label: "Favorites", icon: Sparkles },
  { href: "/search", label: "Search", icon: Search },
  { href: "/people", label: "People", icon: Users },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/travel", label: "Travel", icon: MapPinned },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/work", label: "Work", icon: Briefcase },
  { href: "/nature", label: "Nature", icon: Trees },
  { href: "/recently-added", label: "Recently Added", icon: Clock },
  { href: "/saved-favorites", label: "Saved Favorites", icon: BookmarkCheck },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);



  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const isNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/albums") return pathname === "/albums" || pathname.startsWith("/albums/");
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),transparent_30%),var(--background)] text-foreground">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <aside
        aria-label="Mobile Navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] sm:w-80 max-w-[85vw] flex-col justify-between bg-card p-4 sm:p-5 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Drawer Header */}
          <div className="mb-4 flex items-center justify-between pb-3 border-b border-border/80">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-sm font-semibold text-background">
                PA
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Photo Album</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Archive</div>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Navigation Links */}
          <nav className="space-y-1 overflow-y-auto pr-1 flex-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isNavActive(href);
              return (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 min-h-[44px] text-sm font-medium transition ${
                    active
                      ? "bg-foreground text-background font-semibold shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-background" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="mt-4 border-t border-border/80 pt-4 space-y-2.5 shrink-0">
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 min-h-[44px] text-sm font-medium transition ${
              pathname === "/settings"
                ? "bg-foreground text-background font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </Link>
          <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-muted/20 px-3.5 py-2">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Layout Container */}
      <div className="mx-auto flex max-w-[1600px] gap-6 p-3 sm:p-4 md:p-6">
        {/* Desktop Sidebar (visible on lg: 1024px and above) */}
        <aside
          aria-label="Main Navigation"
          className="hidden w-64 xl:w-72 shrink-0 rounded-[30px] border border-border/80 bg-card/80 p-4 shadow-[0_20px_50px_rgba(17,17,17,0.04)] backdrop-blur lg:flex lg:flex-col sticky top-6 max-h-[calc(100vh-48px)] overflow-y-auto"
        >
          <Link href="/" className="mb-5 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-sm font-semibold text-background">
              PA
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Photo Album</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Archive</div>
            </div>
          </Link>

          <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isNavActive(href);
              return (
                <Link
                  key={label}
                  href={href}
                  className={`group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-foreground text-background font-semibold shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-background" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 space-y-2.5 border-t border-border/80 pt-4 shrink-0">
            <Link
              href="/settings"
              className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition ${
                pathname === "/settings"
                  ? "bg-foreground text-background font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4 shrink-0" />
              Settings
            </Link>
            <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-muted/20 px-3.5 py-2">
              <span className="text-xs text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-3">
              <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                <span>Supabase Storage</span>
                <span className="text-emerald-500">Connected</span>
              </div>
              <div className="h-2 w-full rounded-full bg-background overflow-hidden">
                <div className="h-full w-[45%] rounded-full bg-foreground" />
              </div>
            </div>
          </div>
        </aside>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <header className="mb-6 rounded-[28px] border border-border/80 bg-card/80 p-3.5 sm:p-4 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
            {/* Desktop / Tablet layout (>= 640px) */}
            <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-center gap-3 flex-1 max-w-xl">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open Navigation Menu"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-muted/30 lg:hidden hover:bg-accent transition"
                >
                  <Menu className="h-5 w-5" />
                </button>

                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search photos, albums, locations (Press Enter)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 w-full rounded-full border border-border/80 bg-muted/20 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 transition"
                  />
                </form>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <UploadDialog />
                <button
                  type="button"
                  onClick={() => alert("All notifications cleared.")}
                  aria-label="Notifications"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 rounded-full border border-border/80 bg-muted/20 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-foreground">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                    PA
                  </div>
                  <span className="hidden md:inline">Personal Archive</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:inline" />
                </div>
              </div>
            </div>

            {/* Mobile layout (< 640px) */}
            <div className="flex flex-col gap-3 sm:hidden">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Open Navigation Menu"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-muted/30 hover:bg-accent transition"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-xs font-semibold text-background">
                      PA
                    </div>
                    <span className="text-sm font-semibold text-foreground">Archive</span>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <UploadDialog />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                    PA
                  </div>
                </div>
              </div>

              {/* Full width mobile search */}
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search photos, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-full border border-border/80 bg-muted/20 pl-10 pr-4 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40 transition"
                />
              </form>
            </div>
          </header>

          {/* Main Page Content */}
          <main className="pb-12 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
