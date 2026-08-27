import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "./providers";
import { NavbarWrapper } from "@/components/NavbarWrapper";

import Footer from "@/components/home/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linguify – AI-Powered English Learning",
  description:
    "Expand your vocabulary with AI word families, pronunciation guides, and interactive lessons tailored for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      signInForceRedirectUrl="/"
      signUpForceRedirectUrl="/"
      afterSignOutUrl="/auth/sign-in"
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <body className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
          <Providers>
            <NavbarWrapper />
            <main className="flex-1 w-full">{children}</main>
         
            <Footer />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}

