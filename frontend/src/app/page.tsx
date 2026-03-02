"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-lavender/30 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-peach/30 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-mint/20 blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface text-text-secondary text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Plateforme ouverte — Investissez dès maintenant
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              Simplifiez,{" "}
              <br className="hidden sm:block" />
              <span className="gradient-text-accent">sécurisez</span>,{" "}
              <br className="hidden sm:block" />
              investissez.
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary leading-relaxed mb-10 max-w-2xl mx-auto">
              Accédez à des investissements autrefois réservés aux institutionnels.
              Immobilier, PME, Luxe — fractionnés et sécurisés par la blockchain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/catalogue" className="btn-primary text-base !py-3.5 !px-8">
                Commencer à investir
              </Link>
              <Link href="#comment-ca-marche" className="btn-secondary text-base !py-3.5 !px-8">
                Comment ça marche
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: "5 €", label: "Ticket minimum" },
              { value: "0 %", label: "Frais de gestion" },
              { value: "24/7", label: "Accès au marché" },
              { value: "1 %", label: "Frais de trading" },
            ].map((stat) => (
              <div key={stat.label} className="card p-5 text-center hover-lift">
                <div className="text-2xl sm:text-3xl font-bold text-text">{stat.value}</div>
                <div className="text-xs sm:text-sm text-text-secondary mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="slide-up">
              <div className="badge badge-info mb-4">Notre mission</div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                Démocratiser l&apos;accès aux{" "}
                <span className="gradient-text-accent">actifs réels</span>
              </h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                L&apos;immobilier ou le Private Equity sont traditionnellement réservés aux institutionnels 
                ou bloqués pendant 10 ans. Asthia utilise la blockchain pour fractionner ces actifs 
                et créer un marché secondaire, offrant liquidité et accessibilité à tous.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Fractionnement", desc: "Investissez dès 5€ dans des actifs qui valent des millions" },
                  { title: "Sécurité", desc: "Chaque actif est garanti par un nantissement juridique" },
                  { title: "Liquidité", desc: "Revendez vos parts sur notre marché secondaire 24/7" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-pastel-mint flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-mint-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-text">{item.title}</div>
                      <div className="text-sm text-text-secondary">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="card p-6 bg-pastel-lavender border-none">
                  <div className="text-3xl font-bold text-primary mb-2">150+</div>
                  <div className="text-sm text-text-secondary">Projets analysés</div>
                </div>
                <div className="card p-6 bg-pastel-peach border-none">
                  <div className="text-3xl font-bold text-primary mb-2">5%</div>
                  <div className="text-sm text-text-secondary">Commission au succès</div>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="card p-6 bg-pastel-mint border-none">
                  <div className="text-3xl font-bold text-primary mb-2">0€</div>
                  <div className="text-sm text-text-secondary">Frais de conservation</div>
                </div>
                <div className="card p-6 bg-surface-alt border-none">
                  <div className="text-3xl font-bold text-primary mb-2">80%</div>
                  <div className="text-sm text-text-secondary">Soft cap sécurisé</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="comment-ca-marche" className="py-20 section-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="badge badge-info mb-4">Simple & transparent</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Comment ça fonctionne
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Trois étapes simples pour commencer à investir dans des actifs réels.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Créez votre compte",
                desc: "Inscrivez-vous avec votre email et validez votre identité en quelques minutes. Processus simple et sécurisé.",
                gradient: "bg-pastel-lavender",
                icon: (
                  <svg className="w-7 h-7 text-lavender-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Choisissez un actif",
                desc: "Parcourez notre catalogue d'opportunités vérifiées : immobilier, PME, luxe, art, vignobles et plus encore.",
                gradient: "bg-pastel-peach",
                icon: (
                  <svg className="w-7 h-7 text-peach-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Investissez en euros",
                desc: "Payez par carte bancaire. Vos parts sont enregistrées sur la blockchain de manière sécurisée et transparente.",
                gradient: "bg-pastel-mint",
                icon: (
                  <svg className="w-7 h-7 text-mint-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="card p-8 text-center hover-lift group">
                <div className={`w-16 h-16 ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div className="text-xs text-text-muted font-bold mb-2 tracking-widest">ÉTAPE {item.step}</div>
                <h3 className="text-lg font-bold mb-3 text-text">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories preview */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="badge badge-info mb-4">Diversifiez</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Des catégories d&apos;actifs variées
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Construisez un portefeuille diversifié en investissant dans différentes classes d&apos;actifs.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "Immobilier", desc: "Résidentiel & commercial", gradient: "bg-pastel-lavender", iconColor: "text-lavender-dark", icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              ) },
              { name: "PME", desc: "Entreprises en croissance", gradient: "bg-pastel-peach", iconColor: "text-peach-dark", icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              ) },
              { name: "Luxe", desc: "Montres, sacs, raretés", gradient: "bg-pastel-mint", iconColor: "text-mint-dark", icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l2.09 6.26L21 9.27l-5 3.64L17.18 21 12 17.27 6.82 21 8 12.91l-5-3.64 6.91.01L12 3z" /></svg>
              ) },
              { name: "Art", desc: "Œuvres et collectibles", gradient: "bg-surface-alt", iconColor: "text-text-secondary", icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              ) },
              { name: "Vignobles", desc: "Domaines viticoles", gradient: "bg-pastel-lavender", iconColor: "text-lavender-dark", icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19V6m0 0c-3 0-6 2-6 5s3 3 6 3 6 0 6-3-3-5-6-5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 22h8" /></svg>
              ) },
              { name: "Startups", desc: "Innovation & technologie", gradient: "bg-pastel-peach", iconColor: "text-peach-dark", icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              ) },
            ].map((cat) => (
              <Link
                key={cat.name}
                href="/catalogue"
                className={`${cat.gradient} rounded-2xl p-6 hover-lift group border border-transparent hover:border-border cursor-pointer block`}
              >
                <div className={`mb-3 group-hover:scale-110 transition-transform ${cat.iconColor}`}>{cat.icon}</div>
                <h3 className="font-bold text-text mb-1">{cat.name}</h3>
                <p className="text-sm text-text-secondary">{cat.desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/catalogue" className="btn-primary text-base !py-3.5 !px-8">
              Voir toutes les opportunités
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-primary p-12 sm:p-16 text-center">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-lavender/10 blur-[60px]" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-peach/10 blur-[60px]" />
            </div>

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Prêt à investir dans l&apos;avenir ?
              </h2>
              <p className="text-white/70 max-w-xl mx-auto mb-8 text-lg">
                Rejoignez la plateforme et accédez à des opportunités d&apos;investissement 
                uniques dès 5€.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register" className="btn-accent text-base !py-3.5 !px-8">
                  Créer mon compte gratuit
                </Link>
                <Link href="/catalogue" className="text-white/80 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5">
                  Explorer le catalogue
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
