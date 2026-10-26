export function validateEnv() {
  const required = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Variables d'environnement manquantes: ${missing.join(", ")}`);
    process.exit(1);
  }

  const warned = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "ADMIN_PRIVATE_KEY",
    "POLYGON_RPC_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ];

  const missingWarned = warned.filter((key) => !process.env[key]);
  if (missingWarned.length > 0) {
    console.warn(`⚠️  Variables optionnelles manquantes (certaines fonctionnalités désactivées): ${missingWarned.join(", ")}`);
  }
}
