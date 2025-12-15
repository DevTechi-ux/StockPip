import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import MainPage from "./pages/MainPage";
import NotFound from "./pages/NotFound";
import Placeholder from "./pages/Placeholder";
import Markets from "./pages/Markets";
import Strategy from "./pages/Strategy";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import Api from "./pages/Api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Portfolio from "./pages/Portfolio";
import Support from "./pages/Support";
import Ib from "./pages/Ib";
import Watchlist from "./pages/Watchlist";
import Positions from "./pages/Positions";
import History from "./pages/History";

const queryClient = new QueryClient();

const baseName = (() => {
  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/userdashboard")) {
      return "/userdashboard";
    }
  }
  return "/";
})();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("auth_token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route
            path="/userdashboard"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/placeholder"
            element={
              <ProtectedRoute>
                <Placeholder title="Overview" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/markets"
            element={
              <ProtectedRoute>
                <Markets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/strategy"
            element={
              <ProtectedRoute>
                <Strategy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/api"
            element={
              <ProtectedRoute>
                <Api />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ib"
            element={
              <ProtectedRoute>
                <Ib />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/positions"
            element={
              <ProtectedRoute>
                <Positions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
