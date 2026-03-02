"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type InvestStep = "amount" | "payment" | "processing" | "success" | "error";

export default function InvestPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<InvestStep>("amount");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  // Card details (mock)
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [holderName, setHolderName] = useState("");

  useEffect(() => {
    if (id) {
      api.getAsset(id as string).then(setAsset).catch(console.error).finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !asset) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const numAmount = parseFloat(amount);
  const tokenCount = numAmount > 0 && asset.tokenPrice > 0 ? Math.floor(numAmount / asset.tokenPrice) : 0;

  const handleProceedToPayment = () => {
    if (!numAmount || numAmount < asset.tokenPrice) {
      setError(`Le montant minimum est de ${asset.tokenPrice} €`);
      return;
    }
    setError("");
    setStep("payment");
  };

  const handleInvest = async () => {
    setError("");
    setStep("processing");

    try {
      const res = await api.invest({
        assetId: asset.id,
        amountEur: numAmount,
        cardDetails: {
          cardNumber: cardNumber.replace(/\s/g, ""),
          expiry,
          cvv,
          holderName,
        },
      });
      setResult(res);
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Erreur lors du paiement.");
      setStep("error");
    }
  };

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-1/4 w-[300px] h-[300px] rounded-full bg-mint/20 blur-[80px]" />
        <div className="absolute -bottom-40 left-1/4 w-[300px] h-[300px] rounded-full bg-lavender/20 blur-[80px]" />
      </div>

      <div className="card p-8 sm:p-10 w-full max-w-lg fade-in relative">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {["Montant", "Paiement", "Confirmation"].map((label, i) => {
            const stepIndex = step === "amount" ? 0 : step === "payment" ? 1 : 2;
            const isActive = i <= stepIndex;
            return (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isActive ? "bg-primary text-white" : "bg-bg-alt text-text-muted border border-border"
                }`}>
                  {i + 1}
                </div>
                {i < 2 && (
                  <div className={`w-8 h-0.5 ${isActive ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step: Amount */}
        {step === "amount" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold mb-1">Investir dans</h1>
              <p className="text-lavender-dark font-medium">{asset.title}</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-danger/5 border border-danger/10 text-danger text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Montant de l&apos;investissement</label>
              <div className="relative">
                <input
                  type="number"
                  className="input !pr-12 text-lg"
                  placeholder={`Min. ${asset.tokenPrice}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={asset.tokenPrice}
                  step={asset.tokenPrice}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">€</span>
              </div>
            </div>

            {/* Quick amounts */}
            <div className="flex flex-wrap gap-2">
              {[100, 500, 1000, 2500].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(String(val))}
                  className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                    amount === String(val)
                      ? "bg-primary/5 border-primary text-primary"
                      : "border-border text-text-secondary hover:border-primary/30"
                  }`}
                >
                  {val.toLocaleString("fr-FR")} €
                </button>
              ))}
            </div>

            {tokenCount > 0 && (
              <div className="p-4 rounded-xl bg-bg-alt border border-border-light">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Parts acquises</span>
                  <span className="font-bold text-text">{tokenCount}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-text-secondary">Prix par part</span>
                  <span className="text-text">{asset.tokenPrice} €</span>
                </div>
              </div>
            )}

            <button onClick={handleProceedToPayment} className="btn-primary w-full" disabled={!numAmount}>
              Continuer vers le paiement
            </button>
          </div>
        )}

        {/* Step: Payment */}
        {step === "payment" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold mb-1">Paiement par carte</h1>
              <p className="text-sm text-text-secondary">Montant : <span className="text-primary font-bold">{numAmount.toLocaleString("fr-FR")} €</span></p>
            </div>

            <div className="p-3 rounded-xl bg-pastel-mint border-none text-xs text-text-secondary flex items-center gap-2">
              <svg className="w-4 h-4 text-mint-dark flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Version démo — utilisez les informations pré-remplies ou modifiez-les.
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Titulaire de la carte</label>
              <input type="text" className="input" placeholder="Jean Dupont" value={holderName} onChange={(e) => setHolderName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Numéro de carte</label>
              <input type="text" className="input font-mono" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Expiration</label>
                <input type="text" className="input font-mono" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">CVV</label>
                <input type="text" className="input font-mono" value={cvv} onChange={(e) => setCvv(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep("amount")} className="btn-secondary flex-1">Retour</button>
              <button onClick={handleInvest} className="btn-primary flex-1">
                Payer {numAmount.toLocaleString("fr-FR")} €
              </button>
            </div>
          </div>
        )}

        {/* Step: Processing */}
        {step === "processing" && (
          <div className="text-center py-12 space-y-6">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-border-light" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Traitement en cours</h2>
              <p className="text-sm text-text-secondary">
                Validation du paiement et enregistrement de votre investissement…
              </p>
            </div>
            <div className="flex flex-col gap-2 text-xs text-text-secondary">
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Vérification de la carte
              </span>
              <span className="animate-pulse flex items-center justify-center gap-1.5">
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Validation du paiement…
              </span>
              <span className="opacity-50 flex items-center justify-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-border" />
                Enregistrement sécurisé
              </span>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && result && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Investissement confirmé !</h2>
              <p className="text-sm text-text-secondary">
                Votre investissement de <span className="text-primary font-bold">{result.amountEur} €</span> dans{" "}
                <span className="text-text font-medium">{asset.title}</span> a été enregistré avec succès.
              </p>
            </div>
            {result.txHash && (
              <div className="p-3 rounded-xl bg-bg-alt border border-border-light text-xs">
                <span className="text-text-secondary">Référence :</span>{" "}
                <a
                  href={`https://amoy.polygonscan.com/tx/${result.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-lavender-dark hover:underline break-all"
                >
                  {result.txHash}
                </a>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => router.push("/dashboard")} className="btn-primary flex-1">
                Mon Portfolio
              </button>
              <button onClick={() => router.push("/catalogue")} className="btn-secondary flex-1">
                Catalogue
              </button>
            </div>
          </div>
        )}

        {/* Step: Error */}
        {step === "error" && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-danger/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Paiement échoué</h2>
              <p className="text-sm text-danger">{error}</p>
            </div>
            <button onClick={() => setStep("payment")} className="btn-primary">
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
