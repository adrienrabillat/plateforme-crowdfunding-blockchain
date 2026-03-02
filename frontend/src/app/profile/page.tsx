"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const { user, loading, logout, walletAddress } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10 fade-in">
          <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
          <p className="text-text-secondary">Gérez votre compte et vos paramètres</p>
        </div>

        <div className="space-y-6 fade-in" style={{ animationDelay: "0.1s" }}>
          {/* Avatar & email */}
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-pastel-lavender flex items-center justify-center text-2xl font-bold text-primary">
                {user.email[0].toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-lg">{user.name || user.email.split("@")[0]}</div>
                <div className="text-sm text-text-secondary">{user.email}</div>
              </div>
            </div>
          </div>

          {/* KYC Status */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold mb-1">Vérification d&apos;identité</h3>
                <p className="text-sm text-text-secondary">
                  {user.kycStatus === "APPROVED"
                    ? "Votre identité a été vérifiée avec succès."
                    : "Vérifiez votre identité pour pouvoir investir."}
                </p>
              </div>
              <span className={`badge ${user.kycStatus === "APPROVED" ? "badge-success" : "badge-warning"}`}>
                {user.kycStatus === "APPROVED" ? "Vérifié" : "En attente"}
              </span>
            </div>
            {user.kycStatus !== "APPROVED" && (
              <Link href="/kyc" className="btn-primary text-sm !py-2 !px-4 mt-4 inline-flex">
                Vérifier mon identité
              </Link>
            )}
          </div>

          {/* Wallet */}
          <div className="card p-6">
            <h3 className="font-bold mb-1">Portefeuille blockchain</h3>
            <p className="text-sm text-text-secondary mb-3">
              Votre adresse de portefeuille sur le réseau Polygon.
            </p>
            {walletAddress ? (
              <div className="flex items-center gap-2 bg-bg-alt rounded-xl px-4 py-3">
                <span className="font-mono text-sm text-text truncate flex-1">{walletAddress}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                  className="text-text-secondary hover:text-text transition-colors flex-shrink-0"
                  title="Copier l'adresse"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="bg-bg-alt rounded-xl px-4 py-3 text-sm text-text-muted">
                Aucun portefeuille connecté
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="card p-6">
            <h3 className="font-bold mb-4">Actions rapides</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-alt transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-pastel-mint flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-mint-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold group-hover:text-text text-text-secondary transition-colors">Mon Portfolio</div>
                  <div className="text-xs text-text-muted">Voir mes investissements</div>
                </div>
              </Link>
              <Link href="/catalogue" className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-alt transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-pastel-peach flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-peach-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold group-hover:text-text text-text-secondary transition-colors">Catalogue</div>
                  <div className="text-xs text-text-muted">Explorer les opportunités</div>
                </div>
              </Link>
              <Link href="/marche-secondaire" className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-alt transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-pastel-lavender flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-lavender-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold group-hover:text-text text-text-secondary transition-colors">Marché secondaire</div>
                  <div className="text-xs text-text-muted">Acheter et vendre des tokens</div>
                </div>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-xl hover:bg-danger/5 transition-colors group text-left w-full">
                <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-danger">Déconnexion</div>
                  <div className="text-xs text-text-muted">Se déconnecter du compte</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
