"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Investment {
  asset: { id: string; title: string; imageUrl: string; tokenPrice: number; status: string };
  totalInvested: number;
  tokenCount: number;
  transactions: Array<{ id: string; amountEur: number; date: string; txHash: string | null }>;
}

interface Portfolio {
  user: { email: string; walletAddress: string | null; kycStatus: string };
  totalValue: number;
  investments: Investment[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      api.getPortfolio().then(setPortfolio).catch(console.error).finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="card p-8 text-center">
          <p className="text-text-secondary">Impossible de charger votre portfolio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10 fade-in">
          <h1 className="text-3xl font-bold mb-2">Mon Portfolio</h1>
          <p className="text-sm text-text-secondary">{portfolio.user.email}</p>
        </div>

        {/* Summary cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-10 fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="card p-6">
            <div className="text-xs text-text-muted mb-1">Valeur de vos actifs</div>
            <div className="text-3xl font-bold text-text">
              {portfolio.totalValue.toLocaleString("fr-FR")} €
            </div>
          </div>
          <div className="card p-6">
            <div className="text-xs text-text-muted mb-1">Nombre d&apos;investissements</div>
            <div className="text-3xl font-bold text-text">{portfolio.investments.length}</div>
          </div>
          <div className="card p-6">
            <div className="text-xs text-text-muted mb-1">Statut du compte</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${portfolio.user.kycStatus === "APPROVED" ? "badge-success" : "badge-warning"}`}>
                {portfolio.user.kycStatus === "APPROVED" ? "Vérifié" : "En attente"}
              </span>
            </div>
          </div>
        </div>

        {/* Investments */}
        {portfolio.investments.length === 0 ? (
          <div className="card p-12 text-center fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pastel-lavender flex items-center justify-center">
              <svg className="w-8 h-8 text-lavender-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Aucun investissement</h2>
            <p className="text-sm text-text-secondary mb-6">
              Vous n&apos;avez pas encore investi. Découvrez les opportunités disponibles.
            </p>
            <Link href="/catalogue" className="btn-primary">
              Voir le catalogue
            </Link>
          </div>
        ) : (
          <div className="space-y-6 fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl font-bold">Vos investissements</h2>
            {portfolio.investments.map((inv) => (
              <div key={inv.asset.id} className="card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-pastel-lavender flex items-center justify-center">
                      <svg className="w-7 h-7 text-lavender-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <Link href={`/assets/${inv.asset.id}`} className="font-bold hover:text-lavender-dark transition-colors">
                        {inv.asset.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-text-secondary">
                          {inv.tokenCount} parts × {inv.asset.tokenPrice} €
                        </span>
                        <span className={`badge ${
                          inv.asset.status === "ACTIVE"
                            ? "badge-success"
                            : inv.asset.status === "SUCCESS"
                            ? "badge-info"
                            : "badge-danger"
                        }`}>
                          {inv.asset.status === "ACTIVE" ? "En cours" : inv.asset.status === "SUCCESS" ? "Complété" : "Échoué"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-text-muted">Valeur</div>
                    <div className="text-xl font-bold text-text">
                      {inv.totalInvested.toLocaleString("fr-FR")} €
                    </div>
                  </div>
                </div>

                {/* Transaction history */}
                {inv.transactions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border-light">
                    <div className="text-xs text-text-muted mb-3 font-semibold">Historique des transactions</div>
                    <div className="space-y-2">
                      {inv.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">
                            {new Date(tx.date).toLocaleDateString("fr-FR")}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{tx.amountEur} €</span>
                            {tx.txHash && (
                              <a
                                href={`https://amoy.polygonscan.com/tx/${tx.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-lavender-dark hover:underline font-mono flex items-center gap-1"
                              >
                                {tx.txHash.substring(0, 10)}…
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Token verification section */}
        <div className="card p-6 mt-10 fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pastel-mint flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-mint-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold mb-1">Vérifier vos transactions sur la blockchain</h3>
              <p className="text-sm text-text-secondary mb-3">
                Chaque investissement est enregistré sur la blockchain Polygon. Vous pouvez vérifier 
                la transparence de vos transactions en consultant le registre public.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://amoy.polygonscan.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm !py-2 !px-4 inline-flex items-center gap-1.5"
                >
                  Explorer Polygonscan
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                {portfolio.user.walletAddress && (
                  <a
                    href={`https://amoy.polygonscan.com/address/${portfolio.user.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm !py-2 !px-4 inline-flex items-center gap-1.5"
                  >
                    Mon portefeuille
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
