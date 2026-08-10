"use client";

import { create } from "zustand";

interface UIState {
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  openProfile: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  profileOpen: false,
  setProfileOpen: (open) => set({ profileOpen: open }),
  openProfile: () => set({ profileOpen: true }),
}));
