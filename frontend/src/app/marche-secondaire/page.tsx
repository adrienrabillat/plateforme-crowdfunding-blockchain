"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

interface MarketListing {
  id: string;
  assetTitle: string;
  tokenCount: number;
  pricePerToken: number;
  totalPrice: number;
  sellerEmail: string;
  createdAt: string;
}

interface PortfolioAsset {
  assetId: string;
  assetTitle: string;
  tokenCount: number;
}

export default function MarcheSecondairePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSellModal, setShowSellModal] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [sellForm, setSellForm] = useState({
    assetId: "",
    tokenCount: 1,
    pricePerToken: 0,
  });
  const [sellLoading, setSellLoading] = useState(false);
  const [sellError, setSellError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      loadListings();
    }
  }, [user, authLoading, router]);

  async function loadListings() {
    try {
      setLoading(true);
      const data = await api.getMarketplaceListings();
      setListings(data);
    } catch (err) {
      console.error("Failed to load marketplace listings:", err);
    } finally {
      setLoading(false);
    }
  }

  async function openSellModal() {
    try {
      const portfolioData = await api.getPortfolio();
      // Portfolio API returns { investments: [{ asset: { id, title }, tokenCount }] }
      const investments = portfolioData.investments || [];
      setPortfolio(
        investments
          .filter((inv: any) => inv.tokenCount > 0)
          .map((inv: any) => ({
            assetId: inv.asset.id,
            assetTitle: inv.asset.title,
            tokenCount: inv.tokenCount,
          }))
      );
      setShowSellModal(true);
    } catch {
      setPortfolio([]);
      setShowSellModal(true);
    }
  }

  async function handleSell(e: React.FormEvent) {
    e.preventDefault();
    setSellLoading(true);
    setSellError("");
    try {
      await api.createMarketplaceListing({
        assetId: sellForm.assetId,
        tokenCount: sellForm.tokenCount,
        pricePerToken: sellForm.pricePerToken,
      });
      setShowSellModal(false);
      setSellForm({ assetId: "", tokenCount: 1, pricePerToken: 0 });
      await loadListings();
    } catch (err: any) {
      setSellError(err.message || "Erreur lors de la mise en vente.");
    } finally {
      setSellLoading(false);
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-0 w-[400px] h-[400px] rounded-full bg-peach/20 blur-[80px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-lavender/20 blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 fade-in">
            <div className="max-w-2xl">
              <div className="badge badge-info mb-4">Marché secondaire</div>
              <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
                Échangez vos tokens
              </h1>
              <p className="text-text-secondary text-lg leading-relaxed">
                Achetez et vendez des parts d&apos;actifs réels avec d&apos;autres investisseurs.
                Commission de seulement 1% par transaction.
              </p>
            </div>
            <button onClick={openSellModal} className="btn-primary text-sm !py-3 !px-6 flex-shrink-0">
              <svg className="w-4 h-4 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Mettre en vente
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Info banner */}
          <div className="card p-5 mb-8 bg-pastel-lavender border-none fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-lavender-dark/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-lavender-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-sm text-primary mb-1">Comment ça fonctionne</div>
                <p className="text-sm text-text-secondary">
                  Le marché secondaire vous permet de revendre vos tokens à d&apos;autres investisseurs
                  ou d&apos;acquérir des parts d&apos;actifs déjà financés. Les transactions sont sécurisées
                  par la blockchain et une commission de 1% s&apos;applique.
                </p>
              </div>
            </div>
          </div>

          {/* Listings */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card h-64 shimmer" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-pastel-peach flex items-center justify-center">
                <svg className="w-10 h-10 text-peach-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Aucune offre disponible</h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                Le marché secondaire est en cours de lancement. Les premières offres seront
                disponibles dès que des investisseurs mettront leurs tokens en vente.
              </p>
              <Link href="/catalogue" className="btn-primary">
                Investir dans de nouveaux actifs
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing.id} className="card p-6 fade-in hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text">{listing.assetTitle}</h3>
                    <span className="badge badge-success">Disponible</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Nombre de parts</span>
                      <span className="font-semibold">{listing.tokenCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Prix par part</span>
                      <span className="font-semibold">{listing.pricePerToken} €</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border-light">
                      <span className="text-text-secondary">Prix total</span>
                      <span className="font-bold text-text">{listing.totalPrice.toLocaleString("fr-FR")} €</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-text-muted">
                      Vendeur : {listing.sellerEmail}
                    </span>
                  </div>
                  <button className="btn-primary w-full text-sm !py-2.5">
                    Acheter
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 sm:p-8 max-w-md w-full fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Mettre en vente</h2>
              <button
                onClick={() => setShowSellModal(false)}
                className="w-8 h-8 rounded-full bg-surface hover:bg-surface-alt flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {portfolio.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pastel-peach flex items-center justify-center">
                  <svg className="w-8 h-8 text-peach-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-text-secondary text-sm mb-4">
                  Vous n&apos;avez pas encore de tokens à vendre. Investissez d&apos;abord dans un actif.
                </p>
                <Link href="/catalogue" className="btn-primary text-sm">
                  Voir le catalogue
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSell} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Actif</label>
                  <select
                    value={sellForm.assetId}
                    onChange={(e) => setSellForm({ ...sellForm, assetId: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    <option value="">Sélectionnez un actif</option>
                    {portfolio.map((asset) => (
                      <option key={asset.assetId} value={asset.assetId}>
                        {asset.assetTitle} ({asset.tokenCount} parts)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Nombre de parts</label>
                  <input
                    type="number"
                    min="1"
                    value={sellForm.tokenCount}
                    onChange={(e) => setSellForm({ ...sellForm, tokenCount: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Prix par part (€)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={sellForm.pricePerToken || ""}
                    onChange={(e) => setSellForm({ ...sellForm, pricePerToken: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>

                {sellForm.pricePerToken > 0 && sellForm.tokenCount > 0 && (
                  <div className="p-3 rounded-xl bg-pastel-mint text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Total</span>
                      <span className="font-bold text-text">
                        {(sellForm.tokenCount * sellForm.pricePerToken).toLocaleString("fr-FR")} €
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-text-muted text-xs">Commission (1%)</span>
                      <span className="text-text-muted text-xs">
                        {(sellForm.tokenCount * sellForm.pricePerToken * 0.01).toLocaleString("fr-FR")} €
                      </span>
                    </div>
                  </div>
                )}

                {sellError && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                    {sellError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sellLoading}
                  className="btn-primary w-full text-sm !py-3"
                >
                  {sellLoading ? "Mise en vente..." : "Confirmer la vente"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
