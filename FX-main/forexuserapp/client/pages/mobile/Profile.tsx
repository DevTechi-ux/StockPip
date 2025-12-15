import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, Award, MessageSquare, User, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWalletSync } from "@/hooks/useWalletSync";

export default function MobileProfile() {
  const navigate = useNavigate();

  // Sync wallet balance from API
  useWalletSync();

  const menuItems = [
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: Award, label: 'IB', path: '/ib' },
    { icon: MessageSquare, label: 'Support', path: '/support' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="h-screen flex flex-col bg-background pb-16 safe-area-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background safe-area-top">
        <Button variant="ghost" size="icon" onClick={() => navigate('/mobile/trade')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Profile</h1>
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.path}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => navigate(item.path)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}



