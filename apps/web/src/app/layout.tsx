import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Permia - Agent Tool Preflight API",
  description:
    "The API agents call before using external tools, sending emails, moving money, deploying code, or exporting data.",
};

const nav = [
  ["Product", "/"],
  ["Docs", "/docs"],
  ["Security", "/security"],
  ["Pricing", "/pricing"],
  ["Status", "/status"],
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${mono.variable}`}>
      <body>
        <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-3">
          <div className="mx-auto grid h-12 w-full max-w-7xl min-w-0 grid-cols-[auto_1fr_auto] items-start gap-4">
            <Link href="/" className="flex h-12 min-w-0 items-center gap-3 border border-white/14 bg-white px-3 text-[#040406] shadow-[0_14px_50px_rgba(0,0,0,0.32)]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#040406]/16 bg-[#040406] text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="pr-1 text-base font-bold tracking-tight">
                Permia
              </span>
            </Link>
            <nav className="mx-auto hidden h-10 items-center border border-white/12 bg-[#080a0d]/82 shadow-[0_14px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl md:flex">
              {nav.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="flex h-full items-center border-r border-white/10 px-4 text-sm font-medium text-[#c8d0dc] transition last:border-r-0 hover:bg-white hover:text-[#040406]"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <Link
              href="/playground"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-white px-4 text-sm font-bold text-[#040406] shadow-[0_14px_50px_rgba(0,0,0,0.32)] transition hover:-translate-y-0.5 hover:bg-[#dfe8f7]"
            >
              <span className="hidden sm:inline">Try the API</span>
              <span className="sm:hidden">API</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
