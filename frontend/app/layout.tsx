import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CartProvider } from "@/context/CartContext"; // तपाईंले थप्नुभएको इम्पोर्ट

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anup Mega Mall",
  description: "तपाईंको आफ्नै अनलाइन पसल",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {/* 🛒 हामीले यहाँ CartProvider थपेर children लाई वेरेका छौँ */}
          <CartProvider>
            {children}
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}