"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export function Header() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm tracking-tight">
              A
            </div>
            <span className="text-xl font-bold tracking-tight text-text">
              Asthia
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-text-secondary hover:text-text hover:bg-bg-alt transition-all text-sm font-medium"
            >
              Accueil
            </Link>
            <Link
              href="/catalogue"
              className="px-4 py-2 rounded-lg text-text-secondary hover:text-text hover:bg-bg-alt transition-all text-sm font-medium"
            >
              Catalogue
            </Link>
            {!loading && user && (
              <>
                <Link
                  href="/marche-secondaire"
                  className="px-4 py-2 rounded-lg text-text-secondary hover:text-text hover:bg-bg-alt transition-all text-sm font-medium"
                >
                  Marché secondaire
                </Link>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg text-text-secondary hover:text-text hover:bg-bg-alt transition-all text-sm font-medium"
                >
                  Mon Portfolio
                </Link>
              </>
            )}
          </nav>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-bg-alt transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-pastel-lavender flex items-center justify-center text-sm font-bold text-primary">
                  {user.email[0].toUpperCase()}
                </div>
                <span className="text-sm text-text-secondary group-hover:text-text transition-colors">
                  Mon Profil
                </span>
              </Link>
            ) : !loading ? (
              <div className="flex items-center gap-3">
                <Link href="/login" className="btn-secondary text-sm !py-2 !px-4">
                  Connexion
                </Link>
                <Link href="/register" className="btn-primary text-sm !py-2 !px-4">
                  Commencer
                </Link>
              </div>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-text p-2 rounded-lg hover:bg-bg-alt transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-border-light px-4 pb-4 pt-2 fade-in">
          <div className="flex flex-col gap-1">
            <Link href="/" className="px-4 py-2.5 rounded-lg text-text-secondary hover:text-text hover:bg-bg-alt text-sm font-medium" onClick={() => setMenuOpen(false)}>
              Accueil
            </Link>
            <Link href="/catalogue" className="px-4 py-2.5 rounded-lg text-text-secondary hover:text-text hover:bg-bg-alt text-sm font-medium" onClick={() => setMenuOpen(false)}>
              Catalogue
            </Link>
            {user ? (
              <>
                <Link href="/marche-secondaire" className="px-4 py-2.5 rounded-lg text-text-secondary hover:text-text hover:bg-bg-alt text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  Marché secondaire
                </Link>
                <Link href="/dashboard" className="px-4 py-2.5 rounded-lg text-text-secondary hover:text-text hover:bg-bg-alt text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  Mon Portfolio
                </Link>
                <Link href="/profile" className="px-4 py-2.5 rounded-lg text-text-secondary hover:text-text hover:bg-bg-alt text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  Mon Profil
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border-light">
                <Link href="/login" className="btn-secondary text-sm !py-2.5 text-center" onClick={() => setMenuOpen(false)}>
                  Connexion
                </Link>
                <Link href="/register" className="btn-primary text-sm !py-2.5 text-center" onClick={() => setMenuOpen(false)}>
                  Commencer
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
