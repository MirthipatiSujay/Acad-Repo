"use client";

import Link from "next/link";
import { useAuthStore } from "../store/authStore";
import { LogOut, User, Menu, X, BookOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navLinkClass = (path: string) => 
    cn(
      "text-sm font-medium transition-colors",
      isActive(path) 
        ? "text-teal-400 font-bold" 
        : "text-slate-300 hover:text-white"
    );

  const mobileNavLinkClass = (path: string) =>
    cn(
      "block px-3 py-2 rounded-md text-base font-medium transition-colors",
      isActive(path)
        ? "bg-teal-500/10 text-teal-400"
        : "text-slate-300 hover:bg-white/5 hover:text-white"
    );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 glass-panel">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-teal-400" />
            <Link href="/" className="text-xl font-bold tracking-tight text-white flex gap-1">
              <span>Acad</span>
              <span className="text-gradient">Repo</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href={isAuthenticated ? "/explore" : "/register"} 
              className={navLinkClass("/explore")}
            >
              Explore
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/plagiarism" className={navLinkClass("/plagiarism")}>
                  Plagiarism Check
                </Link>
                <Link href="/dashboard" className={navLinkClass("/dashboard")}>
                  Dashboard
                </Link>
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                  <Link href="/profile" className={cn("flex items-center gap-2", navLinkClass("/profile"))}>
                    <User className="h-4 w-4" />
                    <span>{user?.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                <Link href="/login" className={navLinkClass("/login")}>
                  Log in
                </Link>
                <Link href="/register" className="text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="text-slate-300 hover:text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={cn("md:hidden px-4 pt-2 pb-4 space-y-1 bg-navy-800 border-b border-white/10", !mobileMenuOpen && "hidden")}>
         <Link href={isAuthenticated ? "/explore" : "/register"} className={mobileNavLinkClass("/explore")}>
            Explore
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/plagiarism" className={mobileNavLinkClass("/plagiarism")}>
                Plagiarism Check
              </Link>
              <Link href="/dashboard" className={mobileNavLinkClass("/dashboard")}>
                Dashboard
              </Link>
              <Link href="/profile" className={mobileNavLinkClass("/profile")}>
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-white/5"
              >
                Log out
              </button>
            </>
          ) : (
            <>
               <Link href="/login" className={mobileNavLinkClass("/login")}>
                  Log in
                </Link>
                <Link href="/register" className={mobileNavLinkClass("/register")}>
                  Sign up
                </Link>
            </>
          )}
      </div>
    </nav>
  );
}
