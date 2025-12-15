import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/trading/Header";
import BottomTabs from "@/components/trading/BottomTabs";
import { useWalletSync } from "@/hooks/useWalletSync";

export default function History() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth < 768;
  });
  useWalletSync();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      navigate('/', { replace: true });
    }
  }, [isMobile, navigate]);

  if (!isMobile) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background pb-16 safe-area-bottom">
      <Header />
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background safe-area-top">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">History</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <BottomTabs defaultTab="history" />
      </div>
    </div>
  );
}
