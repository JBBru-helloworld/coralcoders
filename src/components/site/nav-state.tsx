"use client";

import { createContext, useContext, useState } from "react";

type NavState = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
};

const NavStateContext = createContext<NavState | null>(null);

/** Shares the mobile menu's open state with the mobile CTA bar. */
export function NavStateProvider({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <NavStateContext value={{ menuOpen, setMenuOpen }}>{children}</NavStateContext>
  );
}

export function useNavState(): NavState {
  const state = useContext(NavStateContext);
  if (!state) throw new Error("useNavState must be used inside NavStateProvider");
  return state;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
