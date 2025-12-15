import { create } from "zustand";

type Mode = "demo" | "real";

type State = {
  mode: Mode;
  setMode: (m: Mode) => void;
};

export const useAppStore = create<State>((set) => ({
  mode: (localStorage.getItem("mode") as Mode) || "demo",
  setMode: (m) => { localStorage.setItem("mode", m); set({ mode: m }); },
}));
