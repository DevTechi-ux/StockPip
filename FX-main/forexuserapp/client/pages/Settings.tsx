import Header from "@/components/trading/Header";
import { useAppStore } from "@/state/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import React from "react";
import { api } from "@/lib/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, User, Shield, AlertTriangle } from "lucide-react";

export default function Settings() {
  const { mode, setMode } = useAppStore();
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [ticketId, setTicketId] = React.useState<string>("");
  const [user, setUser] = React.useState<any>(null);
  const navigate = useNavigate();

  // Get user info from localStorage
  React.useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  async function submitTicket() {
    const r = await api<{ id: string }>("/support", { method: "POST", body: JSON.stringify({ subject, message }) });
    setTicketId(r.id);
    setSubject("");
    setMessage("");
  }

  function handleLogout() {
    // Clear all user data
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    
    // Show success message
    toast.success("Logged out successfully");
    
    // Redirect to login page
    navigate("/login");
  }

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background text-foreground">
      <Header />
      <div className="p-6">
          <h1 className="mb-6 text-2xl font-semibold">Settings</h1>
          
          <div className="grid max-w-2xl gap-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user && (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Email:</span> {user.email}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Account Type:</span> {user.userType || 'user'}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="destructive" 
                    onClick={handleLogout}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trading Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Trading Mode
                </CardTitle>
                <CardDescription>Switch between demo and real trading</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium mb-2">Current Mode: {mode.toUpperCase()}</div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={mode === "demo" ? "default" : "secondary"} 
                    onClick={() => setMode("demo")}
                  >
                    Demo
                  </Button>
                  <Button 
                    size="sm" 
                    variant={mode === "real" ? "default" : "secondary"} 
                    onClick={() => setMode("real")}
                  >
                    Real
                  </Button>
                </div>
                {mode === "real" && (
                  <Alert className="mt-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Real trading mode uses actual funds. Please trade responsibly.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Support Ticket */}
            <Card>
              <CardHeader>
                <CardTitle>Support Ticket</CardTitle>
                <CardDescription>Submit a support request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input 
                  placeholder="Subject" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                />
                <textarea 
                  className="min-h-[100px] w-full rounded-md border bg-background p-3 text-sm resize-none" 
                  placeholder="Describe your issue" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                />
                <Button 
                  onClick={submitTicket} 
                  disabled={!subject || !message}
                  className="w-full"
                >
                  Submit Ticket
                </Button>
                {ticketId && (
                  <div className="text-xs text-muted-foreground">
                    Ticket #{ticketId} submitted successfully
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
}
