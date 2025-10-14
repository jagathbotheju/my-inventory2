import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "rc-pagination/assets/index.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Inventory",
  description: "inventory control system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen dark:bg-slate-900 bg-slate-50`}
      >
        <Providers>
          <Navbar />
          <main className="flex grow max-w-[80%] p-10 mx-auto w-full">
            {children}
          </main>

          <footer className="max-w-7xl mx-auto p-5 flex">
            <p>MyInventory ©️ 2025</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
