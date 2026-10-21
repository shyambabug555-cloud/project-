"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  FileText,
  FolderHeart,
  Grid2x2,
  Home,
  Image as ImageIcon,
  LayoutGrid,
  MapPinned,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Users,
  Upload,
  X,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { UploadDialog } from "@/components/upload-dialog";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/gallery", label: "All Photos", icon: Grid2x2 },
  { href: "/albums", label: "Albums", icon: FolderHeart },
  { href: "/favorites", label: "Favorites", icon: Sparkles },
  { href: "/search", label: "Search", icon: Search },
  { href: "/gallery?category=people", label: "People", icon: Users },
  { href: "/gallery?category=documents", label: "Documents", icon: FileText },
  { href: "/gallery?category=travel", label: "Travel", icon: MapPinned },
  { href: "/gallery?category=events", label: "Events", icon: ImageIcon },
  { href: "/gallery?category=work", label: "Work", icon: LayoutGrid },
  { href: "/gallery?category=nature", label: "Nature", icon: MapPinned },
  { href: "/gallery?sort=newest", label: "Recently Added", icon: Upload },
  { href: "/gallery?favorite=true", label: "Saved Favorites", icon: Trash2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),transparent_30%),var(--background)] text-foreground">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-card p-4 shadow-2xl backdrop-blur-2xl transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-sm font-semibold text-background">
              PA
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Photo Album</div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Archive</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                pathname === href
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 border-t border-border/80 pt-4 space-y-2">
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
              pathname === "/settings"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-muted/20 px-3 py-2">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="mx-auto flex max-w-[1600px] gap-6 p-4 md:p-6">
        {/* Desktop Sidebar */}
        <aside className="hidden w-72 shrink-0 rounded-[30px] border border-border/80 bg-card/80 p-4 shadow-[0_20px_50px_rgba(17,17,17,0.04)] backdrop-blur lg:flex lg:flex-col">
          <Link href="/" className="mb-6 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-sm font-semibold text-background">
              PA
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Photo Album</div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Archive</div>
            </div>
          </Link>

          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                  pathname === href
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-3 border-t border-border/80 pt-4">
            <Link
              href="/settings"
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                pathname === "/settings"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-muted/20 px-3 py-2.5">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-3">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span>Storage</span>
                <span>Active</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-background overflow-hidden">
                <div className="h-full w-[45%] rounded-full bg-foreground" />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          <header className="mb-6 flex flex-col gap-4 rounded-[30px] border border-border/80 bg-card/80 p-4 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur md:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open Navigation Menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-muted/30 lg:hidden hover:bg-accent transition"
                >
                  <Grid2x2 className="h-4 w-4" />
                </button>

                {/* Working Search Form */}
                <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search photos, albums, locations (Press Enter)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 w-full rounded-full border border-border/80 bg-muted/20 pl-10 pr-4 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:border-foreground/40 transition"
                  />
                </form>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-3 self-end xl:self-auto">
                <UploadDialog />
                <button
                  type="button"
                  onClick={() => alert("All notifications cleared.")}
                  aria-label="Notifications"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 rounded-full border border-border/80 bg-muted/20 px-2 py-1.5 pr-3 text-sm font-medium text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                    PA
                  </div>
                  Personal Archive
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </header>

          <main className="pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
