"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Asset {
  id: string;
  title: string;
  description: string;
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

function getCategoryGradient(title: string) {
  if (title.toLowerCase().includes("résidence") || title.toLowerCase().includes("immobil"))
    return "bg-pastel-lavender";
  if (title.toLowerCase().includes("biotech") || title.toLowerCase().includes("pme") || title.toLowerCase().includes("startup"))
    return "bg-pastel-peach";
  return "bg-pastel-mint";
}

function getCategoryIcon(title: string) {
  if (title.toLowerCase().includes("résidence") || title.toLowerCase().includes("immobil"))
    return (
      <svg className="w-12 h-12 text-lavender-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  if (title.toLowerCase().includes("biotech") || title.toLowerCase().includes("pme") || title.toLowerCase().includes("startup"))
    return (
      <svg className="w-12 h-12 text-peach-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  return (
    <svg className="w-12 h-12 text-mint-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

export default function AssetDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api
        .getAsset(id as string)
        .then(setAsset)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="card p-8 text-center">
          <p className="text-text-secondary mb-4">Actif non trouvé.</p>
          <Link href="/catalogue" className="btn-primary">Retour au catalogue</Link>
        </div>
      </div>
    );
  }

  const handleInvest = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.kycStatus !== "APPROVED") {
      router.push("/kyc");
      return;
    }
    router.push(`/invest/${asset.id}`);
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-8 fade-in">
          <Link href="/catalogue" className="hover:text-text transition-colors">Catalogue</Link>
          <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-text font-medium">{asset.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6 fade-in">
            {/* Image */}
            <div className="card overflow-hidden">
              <div className={`h-64 sm:h-80 ${getCategoryGradient(asset.title)} flex items-center justify-center relative`}>
                <div className="opacity-40">
                  {getCategoryIcon(asset.title)}
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`badge ${asset.status === "ACTIVE" ? "badge-success" : "badge-warning"}`}>
                    {asset.status === "ACTIVE" ? "Collecte en cours" : asset.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-4">{asset.title}</h1>
              <p className="text-text-secondary leading-relaxed">{asset.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                {[
                  { label: "Prix total", value: `${asset.totalPrice.toLocaleString("fr-FR")} €` },
                  { label: "Part minimum", value: `${asset.tokenPrice} €` },
                  { label: "Soft cap (80%)", value: `${asset.softCap.toLocaleString("fr-FR")} €` },
                  { label: "Jours restants", value: `${asset.remainingDays}` },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl bg-bg-alt border border-border-light">
                    <div className="text-xs text-text-muted mb-1">{item.label}</div>
                    <div className="font-bold text-text">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 fade-in" style={{ animationDelay: "0.1s" }}>
            {/* Investment box */}
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Progression de la collecte</h2>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-text">
                    {asset.currentRaised.toLocaleString("fr-FR")} €
                  </span>
                  <span className="text-text-secondary">
                    sur {asset.hardCap.toLocaleString("fr-FR")} €
                  </span>
                </div>
                <div className="progress-bar !h-3">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.min(asset.progressPercent, 100)}%` }}
                  />
                </div>
                <div className="text-center text-sm mt-2 text-lavender-dark font-semibold">
                  {asset.progressPercent}%
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Soft cap (80%)</span>
                  <span className={asset.currentRaised >= asset.softCap ? "text-success font-semibold" : "text-text"}>
                    {asset.currentRaised >= asset.softCap ? "✓ Atteint" : `${asset.softCap.toLocaleString("fr-FR")} €`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Date de fin</span>
                  <span className="text-text">
                    {new Date(asset.endDate).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Part minimum</span>
                  <span className="text-text font-bold">{asset.tokenPrice} €</span>
                </div>
              </div>

              <button
                onClick={handleInvest}
                className="btn-primary w-full text-base !py-3"
                disabled={asset.status !== "ACTIVE"}
              >
                Investir maintenant
              </button>

              <p className="text-xs text-text-muted text-center mt-3">
                {!user
                  ? "Connectez-vous pour investir"
                  : user.kycStatus !== "APPROVED"
                  ? "Vérification d'identité requise"
                  : "Paiement sécurisé par carte bancaire"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
