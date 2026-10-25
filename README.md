# Plateforme de crowdfunding sur blockchain

Plateforme d'investissement fractionné dans des actifs réels (immobilier, PME, startups) : chaque actif est représenté par un jeton, et l'argent levé est rendu aux investisseurs si l'objectif n'est pas atteint.

## Fonctionnement

1. L'investisseur crée son compte, passe une vérification d'identité (KYC) et choisit un actif dans le catalogue.
2. Il paie en euros (Stripe). Le backend confirme le paiement puis enregistre sa participation dans le smart contract de la campagne.
3. À la date limite :
   - **objectif atteint** (au moins 80 %) : les investisseurs récupèrent leurs jetons, une part de l'actif chacun ;
   - **objectif manqué** : ils récupèrent leur mise.
4. Les parts peuvent ensuite être revendues sur un marché secondaire.

## Architecture

| Dossier | Contenu |
|---|---|
| `contracts/` | Smart contracts Solidity : `AsthiaToken` (ERC-20 par actif, mint, pause, rôles) et `CrowdfundingCampaign` (participations, finalisation, réclamation des jetons ou remboursement). Tests Hardhat, déploiement sur le testnet Polygon Amoy. |
| `backend/` | API Express en TypeScript : authentification, KYC, campagnes, investissement, portefeuille, marché secondaire, webhook Stripe. Le paiement passe par une interface `IPaymentProvider` (Stripe en production, implémentation factice en test) ; `Web3Service` dialogue avec les contrats via ethers.js. |
| `frontend/` | Next.js : catalogue, fiche actif, investissement, tableau de bord, marché secondaire, KYC. Portefeuille crypto créé automatiquement pour l'utilisateur avec Privy. |

## Stack

Solidity, Hardhat, OpenZeppelin, ethers.js · Node.js, Express, Prisma, Better Auth · Next.js, React · Stripe.

## Lancer en local

```bash
# Contrats
cd contracts && npm install && npx hardhat test

# Backend
cd backend && cp ../.env.example .env && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```
