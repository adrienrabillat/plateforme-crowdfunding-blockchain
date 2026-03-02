"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Asset {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  totalPrice: number;
  tokenPrice: number;
  softCap: number;
  hardCap: number;
  currentRaised: number;
  endDate: string;
  status: string;
  progressPercent: number;
  remainingDays: number;
}

const CATEGORIES = [
  { key: "all", label: "Tous" },
  { key: "immobilier", label: "Immobilier" },
  { key: "pme", label: "PME" },
  { key: "luxe", label: "Luxe" },
  { key: "art", label: "Art" },
  { key: "vignobles", label: "Vignobles" },
  { key: "startups", label: "Startups" },
];

function getCategoryIcon(title: string) {
  if (title.toLowerCase().includes("résidence") || title.toLowerCase().includes("immobil"))
    return (
      <svg className="w-8 h-8 text-lavender-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  if (title.toLowerCase().includes("biotech") || title.toLowerCase().includes("pme") || title.toLowerCase().includes("startup"))
    return (
      <svg className="w-8 h-8 text-peach-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  return (
    <svg className="w-8 h-8 text-mint-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function getCategoryGradient(title: string) {
  if (title.toLowerCase().includes("résidence") || title.toLowerCase().includes("immobil"))
    return "bg-pastel-lavender";
  if (title.toLowerCase().includes("biotech") || title.toLowerCase().includes("pme") || title.toLowerCase().includes("startup"))
    return "bg-pastel-peach";
  return "bg-pastel-mint";
}

export default function CataloguePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    api
      .getAssets()
      .then(setAssets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full bg-lavender/20 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-mint/20 blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl fade-in">
            <div className="badge badge-info mb-4">Catalogue</div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
              Opportunités d&apos;investissement
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed">
              Chaque actif est soigneusement sélectionné et vérifié par notre équipe d&apos;analyse. 
              Investissez dès 5€ dans des projets concrets.
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? "bg-primary text-white"
                    : "bg-surface border border-border text-text-secondary hover:border-primary hover:text-text"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Assets Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card h-96 shimmer" />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-pastel-lavender flex items-center justify-center">
                <svg className="w-10 h-10 text-lavender-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Aucune opportunité disponible</h3>
              <p className="text-text-secondary">Revenez bientôt pour découvrir de nouveaux actifs.</p>
            </div>
          ) : (() => {
            const filteredAssets = activeCategory === "all"
              ? assets
              : assets.filter((a) => a.category === activeCategory);

            return filteredAssets.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-pastel-lavender flex items-center justify-center">
                  <svg className="w-10 h-10 text-lavender-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Aucun actif dans cette catégorie</h3>
                <p className="text-text-secondary">Explorez d&apos;autres catégories pour découvrir nos opportunités.</p>
              </div>
            ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset, index) => (
                <Link
                  key={asset.id}
                  href={`/assets/${asset.id}`}
                  className="card group block fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image area */}
                  <div className={`h-48 ${getCategoryGradient(asset.title)} flex items-center justify-center relative overflow-hidden`}>
                    <div className="opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all">
                      {getCategoryIcon(asset.title)}
                    </div>
                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`badge ${asset.status === "ACTIVE" ? "badge-success" : "badge-warning"}`}>
                        {asset.status === "ACTIVE" ? "En cours" : asset.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-lavender-dark transition-colors">
                      {asset.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                      {asset.description}
                    </p>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-text font-semibold">
                          {asset.currentRaised.toLocaleString("fr-FR")} €
                        </span>
                        <span className="text-text-secondary">
                          {asset.hardCap.toLocaleString("fr-FR")} €
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${Math.min(asset.progressPercent, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1.5 text-text-muted">
                        <span>{asset.progressPercent}% collectés</span>
                        <span>{asset.remainingDays} jours restants</span>
                      </div>
                    </div>

                    {/* Bottom info */}
                    <div className="flex justify-between items-center pt-3 border-t border-border-light">
                      <div>
                        <div className="text-xs text-text-muted">Dès</div>
                        <div className="font-bold text-text">{asset.tokenPrice} €</div>
                      </div>
                      <div className="text-xs text-text-secondary text-right">
                        Rendement estimé
                        <div className="text-sm font-bold text-text">4-6%</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
