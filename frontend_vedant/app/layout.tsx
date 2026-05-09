import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Playfair_Display } from "next/font/google"
import "./globals.css"

import { CartProvider } from "@/context/CartContext"
import { ThemeProvider } from "@/components/ThemeProvider"
import { WishlistProvider } from "@/context/WishlistContext"
import { ReduxProvider } from "@/lib/Provider";
import { AuthHandler } from "@/components/AuthHandler"
import { Toaster as SonnerToaster } from "sonner"
import { Toaster as AppToaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Vedant Aroma",
  description:
    "",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} antialiased`}
    >
      <body>
        <ThemeProvider>
        <ReduxProvider>
          <CartProvider>
            <WishlistProvider >
            <AuthHandler /> 
            {children}
            </WishlistProvider>
            <AppToaster />
            <SonnerToaster position="top-right" duration={2500} richColors />
          </CartProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
