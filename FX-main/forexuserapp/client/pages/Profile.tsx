import Header from "@/components/trading/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { User, Mail, Shield, Upload, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType?: string;
  leverage?: number;
  is_verified?: boolean;
}

export default function Profile() {
  const [user, setUser] = React.useState<UserData | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getKYCStatusBadge = () => {
    if (!user) return null;
    
    if (user.is_verified) {
      return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
    }
    return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  };

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background text-foreground">
      <Header />
      <div className="p-3 md:p-6">
          <h1 className="mb-6 text-2xl font-semibold">Profile</h1>
          
          <div className="grid max-w-2xl gap-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user && (
                  <>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Email:</span> {user.email}
                      </div>
                      <div className="text-sm flex items-center gap-2">
                        <span className="font-medium">KYC Status:</span>
                        {getKYCStatusBadge()}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Account Type:</span> {user.accountType || 'Standard'}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Leverage:</span> 1:{user.leverage || 500}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* KYC Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  KYC Verification
                </CardTitle>
                <CardDescription>Verify your identity to activate your trading account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user?.is_verified ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Complete your KYC verification to start trading. Upload your documents below.
                    </p>
                    <Button className="w-full" onClick={() => toast.info("KYC upload coming soon")}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Your account has been verified and is ready for trading</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
}
