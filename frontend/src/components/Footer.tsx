import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-light bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <span className="text-xl font-bold tracking-tight text-text">
                Asthia
              </span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed">
              La plateforme d&apos;investissement fractionné dans des actifs réels.
            </p>
          </div>

          {/* Investir */}
          <div>
            <h4 className="text-sm font-bold text-text mb-4">Investir</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/catalogue" className="text-sm text-text-secondary hover:text-text transition-colors">
                  Catalogue
                </Link>
              </li>
              <li>
                <Link href="/catalogue" className="text-sm text-text-secondary hover:text-text transition-colors">
                  Immobilier
                </Link>
              </li>
              <li>
                <Link href="/catalogue" className="text-sm text-text-secondary hover:text-text transition-colors">
                  PME & Startups
                </Link>
              </li>
              <li>
                <Link href="/catalogue" className="text-sm text-text-secondary hover:text-text transition-colors">
                  Luxe & Art
                </Link>
              </li>
            </ul>
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="text-sm font-bold text-text mb-4">Plateforme</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/marche-secondaire" className="text-sm text-text-secondary hover:text-text transition-colors">
                  Marché secondaire
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-text-secondary hover:text-text transition-colors">
                  Mon Portfolio
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-text-secondary hover:text-text transition-colors">
                  Mon Profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-sm font-bold text-text mb-4">Légal</h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-text-secondary">
                  Mentions légales
                </span>
              </li>
              <li>
                <span className="text-sm text-text-secondary">
                  Conditions générales
                </span>
              </li>
              <li>
                <span className="text-sm text-text-secondary">
                  Politique de confidentialité
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-border-light">
          <p className="text-xs text-text-muted">
            © 2026 Asthia. Plateforme en version démo. Aucun investissement réel.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-text-muted">Tous les systèmes opérationnels</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
