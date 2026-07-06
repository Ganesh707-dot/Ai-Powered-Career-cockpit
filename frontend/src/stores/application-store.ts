"use client";

import { create } from "zustand";
import type { Application } from "@/types";

interface ApplicationStore {
  applications: Application[];
  total: number;
  loading: boolean;
  error: string | null;
  search: string;
  statusFilter: string;
  viewMode: "table" | "kanban";
  setApplications: (apps: Application[], total: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setViewMode: (mode: "table" | "kanban") => void;
  addApplication: (app: Application) => void;
  updateApplication: (app: Application) => void;
  removeApplication: (id: number) => void;
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  applications: [],
  total: 0,
  loading: false,
  error: null,
  search: "",
  statusFilter: "",
  viewMode: "table",
  setApplications: (applications, total) => set({ applications, total }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setViewMode: (viewMode) => set({ viewMode }),
  addApplication: (app) =>
    set((state) => ({
      applications: [app, ...state.applications],
      total: state.total + 1,
    })),
  updateApplication: (app) =>
    set((state) => ({
      applications: state.applications.map((a) => (a.id === app.id ? app : a)),
    })),
  removeApplication: (id) =>
    set((state) => ({
      applications: state.applications.filter((a) => a.id !== id),
      total: state.total - 1,
    })),
}));
