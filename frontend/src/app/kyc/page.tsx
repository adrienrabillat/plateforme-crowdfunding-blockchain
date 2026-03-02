"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function KycPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("Française");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="card p-8 text-center">
          <p className="text-text-secondary">Veuillez vous connecter pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (user.kycStatus === "APPROVED") {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 sm:p-10 w-full max-w-md text-center fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Identité vérifiée</h1>
          <p className="text-sm text-text-secondary mb-6">Votre profil est validé. Vous pouvez maintenant investir.</p>
          <button onClick={() => router.push("/catalogue")} className="btn-primary">
            Voir les opportunités
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.submitKyc({ firstName, lastName, dateOfBirth, nationality });
      setSuccess(true);
      await refreshUser();
      setTimeout(() => router.push("/catalogue"), 2000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la vérification.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 sm:p-10 w-full max-w-md text-center fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Vérification réussie !</h1>
          <p className="text-sm text-text-secondary">Redirection vers le catalogue…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-peach/20 blur-[80px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-mint/20 blur-[80px]" />
      </div>

      <div className="card p-8 sm:p-10 w-full max-w-md fade-in relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-pastel-lavender flex items-center justify-center">
            <svg className="w-6 h-6 text-lavender-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Vérification d&apos;identité</h1>
          <p className="text-sm text-text-secondary">
            Étape obligatoire avant de pouvoir investir. Vos données sont protégées.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-danger/5 border border-danger/10 text-danger text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Prénom</label>
              <input
                type="text"
                className="input"
                placeholder="Jean"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Nom</label>
              <input
                type="text"
                className="input"
                placeholder="Dupont"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Date de naissance</label>
            <input
              type="date"
              className="input"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Nationalité</label>
            <input
              type="text"
              className="input"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-pastel-mint border-none text-xs text-text-secondary flex items-center gap-2">
            <svg className="w-4 h-4 text-mint-dark flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Version démo — cette vérification sera automatiquement validée.
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Vérification en cours…
              </span>
            ) : (
              "Valider mon identité"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
