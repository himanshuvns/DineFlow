"use client";

import * as React from "react";
import Link from "next/link";
import { UtensilsCrossed, Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Interactive Demo", href: "#interactive-demo" },
  { label: "Hotel & Staff", href: "#hospitality-modules" },
  { label: "Pricing", href: "#pricing" },
];

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ease-in-out ${
        isScrolled
          ? "bg-white/95 dark:bg-[#090D16]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs shadow-slate-900/5 dark:shadow-black/20"
          : "bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-200 ease-in-out ${
          isScrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"
        }`}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl shrink-0"
          aria-label="DineFlow Home"
        >
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-colors">
              <UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 group-hover:text-slate-950 transition-colors" />
            </div>
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Dine<span className="text-emerald-600 dark:text-emerald-400">Flow</span>
          </span>
        </Link>

        {/* Desktop Navigation Links — ml-8 lg:ml-10 mr-auto guarantees generous separation from logo */}
        <nav
          className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 ml-8 xl:ml-12 mr-auto"
          aria-label="Main Navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md px-1 py-0.5 whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors font-semibold whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Live Demo</span>
          </Link>
        </nav>

        {/* Right Actions: Theme Toggle, Sign In, Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden sm:inline-flex min-h-[44px] px-3 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <Link href="/login">Sign In</Link>
          </Button>

          <Button
            variant="glow"
            size="sm"
            asChild
            className="text-xs sm:text-sm font-semibold px-3 sm:px-4 min-h-[44px] cursor-pointer shadow-sm shadow-emerald-500/25"
          >
            <Link href="/register" className="flex items-center gap-1.5">
              <span>Start Free Trial</span>
              <ArrowRight className="h-3.5 w-3.5 hidden sm:inline-block" />
            </Link>
          </Button>

          {/* Mobile Hamburger Button - Minimum 44x44px touch target */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-14 sm:top-16 z-40 bg-slate-950/60 backdrop-blur-md md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0B0F19] border-b border-slate-200 dark:border-slate-800 px-6 py-6 space-y-4 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col space-y-3" aria-label="Mobile Navigation">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 min-h-[44px] flex items-center text-base font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 min-h-[44px] text-base font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                <span>Explore Live Demo Dashboard</span>
              </Link>
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full justify-center h-11 text-sm font-medium"
                asChild
              >
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Sign In to Workspace
                </Link>
              </Button>
              <Button
                variant="glow"
                className="w-full justify-center h-11 text-sm font-semibold shadow-md shadow-emerald-500/20"
                asChild
              >
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  Create Restaurant Workspace
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
