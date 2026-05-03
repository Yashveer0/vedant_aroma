"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"

type Theme = "women" | "men" | "cart"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("women")
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.startsWith("/pages/men") || pathname.startsWith("/collections/men")) {
      setTheme("men")
    } else if (pathname.startsWith("/cart") || pathname.startsWith("/checkout")) {
      setTheme("cart")
    } else {
      setTheme("women")
    }
  }, [pathname])

  useEffect(() => {
    document.body.setAttribute("data-theme", theme)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
