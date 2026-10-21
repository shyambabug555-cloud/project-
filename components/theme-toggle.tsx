"use client";

import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const savedTheme = window.localStorage.getItem("photo-album-theme");
    const applyTheme = (nextTheme: "light" | "dark") => {
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      setTheme(nextTheme);
    };

    queueMicrotask(() => {
      applyTheme(
        savedTheme === "light" || savedTheme === "dark"
          ? savedTheme
          : mediaQuery.matches
            ? "dark"
            : "light",
      );
      setMounted(true);
    });

    if (!savedTheme) {
      const handleSystemThemeChange = (event: MediaQueryListEvent) => {
        applyTheme(event.matches ? "dark" : "light");
      };
      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }
  }, []);

  const toggleTheme = () => {
    if (!mounted || !theme) return;

    const nextTheme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem("photo-album-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    setTheme(nextTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      aria-pressed={mounted && theme === "dark"}
      disabled={!mounted}
      onClick={toggleTheme}
    >
      {!mounted ? (
        <span aria-hidden="true" className="h-4 w-4" />
      ) : theme === "dark" ? (
        <SunMedium className="h-4 w-4" />
      ) : (
        <MoonStar className="h-4 w-4" />
      )}
    </Button>
  );
}
