"use client";
import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";
import { polygonAmoy } from "@privy-io/chains";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

export function PrivyAppProvider({ children }: { children: React.ReactNode }) {
  return (
    <BasePrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#C9A84C",
          logo: undefined,
          showWalletLoginFirst: false,
        },
        loginMethods: ["email"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: polygonAmoy,
        supportedChains: [polygonAmoy],
      }}
    >
      {children}
    </BasePrivyProvider>
  );
}
