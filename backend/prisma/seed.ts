import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create sample assets
  const asset1 = await prisma.asset.upsert({
    where: { id: "asset-immo-lyon-1" },
    update: {},
    create: {
      id: "asset-immo-lyon-1",
      title: "Résidence Le Parc — Lyon 6e",
      description:
        "Immeuble résidentiel de standing situé en plein cœur du 6e arrondissement de Lyon. " +
        "12 appartements rénovés avec une rentabilité locative nette de 4.2%. Proximité immédiate " +
        "du Parc de la Tête d'Or et des transports en commun. Gestion locative intégrée.",
      imageUrl: "/images/asset-lyon.jpg",
      totalPrice: 500000,
      tokenPrice: 5,
      softCap: 400000,
      hardCap: 500000,
      currentRaised: 127500,
      endDate: new Date("2026-04-30"),
      tokenAddress: "0x57d99C59570BbAe11445e67D2702FB47568A4F68",
      campaignAddress: "0xebe873d31Bf82E3e1A1226BD441C45E8613e9ee6",
      status: "ACTIVE",
    },
  });

  const asset2 = await prisma.asset.upsert({
    where: { id: "asset-pme-paris-1" },
    update: {},
    create: {
      id: "asset-pme-paris-1",
      title: "BioTech Santé — Paris 13e",
      description:
        "Startup deeptech spécialisée dans les dispositifs médicaux connectés. " +
        "Série A en cours, pipeline de 3 produits dont un certifié CE. " +
        "Marché cible de 2 milliards d'euros en Europe. Équipe de 18 personnes.",
      imageUrl: "/images/asset-biotech.jpg",
      totalPrice: 250000,
      tokenPrice: 5,
      softCap: 200000,
      hardCap: 250000,
      currentRaised: 45000,
      endDate: new Date("2026-05-15"),
      tokenAddress: null,
      campaignAddress: null,
      status: "ACTIVE",
    },
  });

  const asset3 = await prisma.asset.upsert({
    where: { id: "asset-luxe-bordeaux-1" },
    update: {},
    create: {
      id: "asset-luxe-bordeaux-1",
      title: "Château Vinoble — Saint-Émilion",
      description:
        "Domaine viticole de 15 hectares avec château classé. " +
        "Production de 80 000 bouteilles/an, distribution dans 12 pays. " +
        "Label biologique en cours. Valorisation basée sur l'expertise foncière.",
      imageUrl: "/images/asset-wine.jpg",
      totalPrice: 1000000,
      tokenPrice: 5,
      softCap: 800000,
      hardCap: 1000000,
      currentRaised: 0,
      endDate: new Date("2026-06-30"),
      tokenAddress: null,
      campaignAddress: null,
      status: "ACTIVE",
    },
  });

  console.log("✅ Seeded assets:", {
    asset1: asset1.title,
    asset2: asset2.title,
    asset3: asset3.title,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
