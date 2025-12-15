import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomTabs from "@/components/trading/BottomTabs";
import { useTradingStore } from "@/state/trading-store";
import { useWalletSync } from "@/hooks/useWalletSync";

export default function MobilePositions() {
  const navigate = useNavigate();
  const { loadPositions } = useTradingStore();

  // Sync wallet balance from API
  useWalletSync();

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  return (
    <div className="h-screen flex flex-col bg-background pb-16 safe-area-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background safe-area-top">
        <Button variant="ghost" size="icon" onClick={() => navigate('/mobile/trade')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Positions</h1>
      </div>

      {/* Positions Table */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full">
          <BottomTabs defaultTab="positions" />
        </div>
      </div>
    </div>
  );
}



