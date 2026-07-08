import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  keywords: ["Base", "Base builder", "onchain", "dApp", "wallet"],
  title: "Trade A Skill",
  // Base builder identity: project-level proof uses Build ID, Builder Wallet, Builder Code, Vercel Live Demo, and GitHub repository.
  description: "Post a compact skill exchange card with offer, wanted skill, format, time window, note, wallet, and timestamp on Base.",
};

const configuredBaseAppId = process.env.NEXT_PUBLIC_BASE_APP_ID?.trim();
const baseAppId =
  configuredBaseAppId && !configuredBaseAppId.includes("replace_with")
    ? configuredBaseAppId
    : "6a09dd6405f3a086c7651e41";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>{baseAppId ? <meta name="base:app_id" content={baseAppId} /> : null}</head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
