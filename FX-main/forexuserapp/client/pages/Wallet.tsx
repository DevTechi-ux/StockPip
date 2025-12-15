import Header from "@/components/trading/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, CreditCard, Building2, Smartphone, Clock, CheckCircle, XCircle, CreditCard as CC } from "lucide-react";
import { toast } from "sonner";
import React from "react";
import { cn } from "@/lib/utils";

interface BankAccount {
  id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  branch_name: string;
  account_type: string;
  upi_id?: string;
}

interface FundRequest {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  screenshot_url?: string;
  bank_details?: string;
  created_at: string;
  admin_notes?: string;
}

export default function Wallet() {
  const [userBalance, setUserBalance] = React.useState<number>(0);
  const [bankAccounts, setBankAccounts] = React.useState<BankAccount[]>([]);
  const [fundRequests, setFundRequests] = React.useState<FundRequest[]>([]);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = React.useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"oxapay" | "bank">("oxapay");
  const [loading, setLoading] = React.useState(false);
  
  // Deposit form
  const [depositForm, setDepositForm] = React.useState({
    amount: "",
    selectedBank: "",
    screenshot: null as File | null,
    transactionId: "",
    notes: ""
  });

  // Withdrawal form
  const [withdrawForm, setWithdrawForm] = React.useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    notes: ""
  });

  React.useEffect(() => {
    fetchUserBalance();
    fetchBankAccounts();
    fetchFundRequests();
  }, []);

  const fetchUserBalance = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      const response = await fetch(`/api/user/balance/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserBalance(parseFloat(data.balance) || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const response = await fetch('/api/user/bank-accounts');
      if (response.ok) {
        const data = await response.json();
        setBankAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const fetchFundRequests = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      const response = await fetch(`/api/user/fund-requests/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setFundRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching fund requests:', error);
    }
  };

  const handleOxaPayDeposit = async () => {
    if (!depositForm.amount || parseFloat(depositForm.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch('/api/oxapay/create-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(depositForm.amount)
        })
      });

      const data = await response.json();

      if (response.ok && data.paymentUrl) {
        // Redirect to OxaPay payment page
        window.location.href = data.paymentUrl;
      } else {
        toast.error(data.error || "Failed to create payment");
      }
    } catch (error) {
      console.error('Error creating OxaPay payment:', error);
      toast.error("Error creating payment");
    } finally {
      setLoading(false);
    }
  };

  const handleDepositRequest = async () => {
    if (!depositForm.amount || !depositForm.selectedBank || !depositForm.transactionId) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      
      const response = await fetch('/api/user/fund-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: 'DEPOSIT',
          amount: parseFloat(depositForm.amount),
          bankId: depositForm.selectedBank,
          transactionId: depositForm.transactionId,
          notes: depositForm.notes
        })
      });

      if (response.ok) {
        toast.success("Deposit request submitted successfully");
        setIsDepositDialogOpen(false);
        setDepositForm({
          amount: "",
          selectedBank: "",
          screenshot: null,
          transactionId: "",
          notes: ""
        });
        fetchFundRequests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit deposit request");
      }
    } catch (error) {
      toast.error("Error submitting deposit request");
    }
  };

  const handleWithdrawRequest = async () => {
    if (!withdrawForm.amount || !withdrawForm.bankName || !withdrawForm.accountNumber) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate amount is positive
    const amount = parseFloat(withdrawForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check if withdrawal amount exceeds available balance
    if (amount > userBalance) {
      toast.error(`Insufficient balance. Available: $${userBalance.toFixed(2)}`);
      return;
    }

    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.error("Please login again");
        return;
      }
      
      const user = JSON.parse(userData);
      
      console.log('[handleWithdrawRequest] Submitting withdrawal:', {
        userId: user.id,
        amount,
        bankDetails: {
          bankName: withdrawForm.bankName,
          accountNumber: withdrawForm.accountNumber,
          ifscCode: withdrawForm.ifscCode,
          accountHolderName: withdrawForm.accountHolderName
        }
      });
      
      const response = await fetch('/api/user/fund-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: 'WITHDRAWAL',
          amount: amount,
          bankDetails: JSON.stringify({
            bankName: withdrawForm.bankName,
            accountNumber: withdrawForm.accountNumber,
            ifscCode: withdrawForm.ifscCode,
            accountHolderName: withdrawForm.accountHolderName
          }),
          notes: withdrawForm.notes || `Withdrawal to ${withdrawForm.bankName} - ${withdrawForm.accountNumber}`
        })
      });

      const data = await response.json();
      console.log('[handleWithdrawRequest] Response:', data);

      if (response.ok && data.success) {
        toast.success("Withdrawal request submitted successfully");
        setIsWithdrawDialogOpen(false);
        setWithdrawForm({
          amount: "",
          bankName: "",
          accountNumber: "",
          ifscCode: "",
          accountHolderName: "",
          notes: ""
        });
        fetchFundRequests();
        fetchUserBalance(); // Refresh balance
      } else {
        toast.error(data.message || "Failed to submit withdrawal request");
      }
    } catch (error) {
      console.error('[handleWithdrawRequest] Error:', error);
      toast.error(`Error submitting withdrawal request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background text-foreground">
      <Header />
        <div className="p-3 md:p-6">
          <h1 className="mb-4 md:mb-6 text-xl md:text-2xl font-semibold">Wallet</h1>
          
          {/* Balance Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Account Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">${userBalance.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mt-1">Available for trading</p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid gap-3 md:gap-4 sm:grid-cols-2 mb-4 md:mb-6">
            <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-semibold">Deposit Funds</h3>
                      <p className="text-sm text-muted-foreground">Add money to your account</p>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Deposit Funds</DialogTitle>
                      <DialogDescription>
                        Choose payment method to add funds to your account
                      </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="oxapay" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="oxapay">
                      <CC className="h-4 w-4 mr-2" />
                      OxaPay (Quick)
                    </TabsTrigger>
                    <TabsTrigger value="bank">
                      <Building2 className="h-4 w-4 mr-2" />
                      Bank Transfer
                    </TabsTrigger>
                  </TabsList>

                  {/* OxaPay Tab */}
                  <TabsContent value="oxapay" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oxapay_amount">Amount (USD)</Label>
                      <Input
                        id="oxapay_amount"
                        type="number"
                        placeholder="Enter amount"
                        value={depositForm.amount}
                        onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                      />
                    </div>
                    
                    <Button
                      onClick={handleOxaPayDeposit}
                      disabled={loading || !depositForm.amount}
                      className="w-full"
                    >
                      {loading ? "Processing..." : "Pay with OxaPay"}
                    </Button>

                    <div className="rounded-md border border-border bg-muted/50 p-4 space-y-2 text-xs">
                      <p className="font-semibold">Security:</p>
                      <p className="text-muted-foreground">• Secure payment gateway</p>
                      <p className="text-muted-foreground">• Instant balance update</p>
                      <p className="text-muted-foreground">• Encrypted transactions</p>
                    </div>
                  </TabsContent>

                  {/* Bank Transfer Tab */}
                  <TabsContent value="bank" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deposit_amount">Amount (USD)</Label>
                      <Input
                        id="deposit_amount"
                        type="number"
                        placeholder="Enter amount"
                        value={depositForm.amount}
                        onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bank_select">Select Bank Account</Label>
                      <Select value={depositForm.selectedBank} onValueChange={(value) => setDepositForm({ ...depositForm, selectedBank: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose bank account" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((bank) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              {bank.bank_name} - {bank.account_holder_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  {depositForm.selectedBank && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        {(() => {
                          const selectedBank = bankAccounts.find(b => b.id === depositForm.selectedBank);
                          return selectedBank ? (
                            <div className="space-y-2 text-sm">
                              <h4 className="font-semibold">Transfer Details:</h4>
                              <div><strong>Bank:</strong> {selectedBank.bank_name}</div>
                              <div><strong>Account Holder:</strong> {selectedBank.account_holder_name}</div>
                              <div><strong>Account Number:</strong> {selectedBank.account_number}</div>
                              <div><strong>IFSC Code:</strong> {selectedBank.ifsc_code}</div>
                              <div><strong>Branch:</strong> {selectedBank.branch_name}</div>
                              {selectedBank.upi_id && (
                                <div><strong>UPI ID:</strong> {selectedBank.upi_id}</div>
                              )}
                            </div>
                          ) : null;
                        })()}
                      </CardContent>
                    </Card>
                  )}

                    <div className="space-y-2">
                      <Label htmlFor="transaction_id">Transaction ID / UTR Number *</Label>
                      <Input
                        id="transaction_id"
                        placeholder="Enter bank transaction reference or UTR number"
                        value={depositForm.transactionId}
                        onChange={(e) => setDepositForm({ ...depositForm, transactionId: e.target.value })}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Enter the transaction ID or UTR number from your bank transfer</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deposit_notes">Notes (Optional)</Label>
                      <Textarea
                        id="deposit_notes"
                        placeholder="Any additional information"
                        value={depositForm.notes}
                        onChange={(e) => setDepositForm({ ...depositForm, notes: e.target.value })}
                      />
                    </div>

                    <Button onClick={handleDepositRequest} className="w-full">
                      Submit Request
                    </Button>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsDepositDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center">
                      <Download className="h-8 w-8 mx-auto mb-2 text-red-600" />
                      <h3 className="font-semibold">Withdraw Funds</h3>
                      <p className="text-sm text-muted-foreground">Transfer money to your bank</p>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>
                    Request withdrawal to your bank account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw_amount">Amount (USD)</Label>
                    <Input
                      id="withdraw_amount"
                      type="number"
                      placeholder="Enter amount"
                      max={userBalance}
                      value={withdrawForm.amount}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Available: ${userBalance.toFixed(2)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      placeholder="e.g., State Bank of India"
                      value={withdrawForm.bankName}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_holder">Account Holder Name</Label>
                    <Input
                      id="account_holder"
                      placeholder="Full name as per bank"
                      value={withdrawForm.accountHolderName}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolderName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="account_number">Account Number</Label>
                      <Input
                        id="account_number"
                        placeholder="Bank account number"
                        value={withdrawForm.accountNumber}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifsc_code">IFSC Code</Label>
                      <Input
                        id="ifsc_code"
                        placeholder="e.g., SBIN0001234"
                        value={withdrawForm.ifscCode}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, ifscCode: e.target.value })}
                      />
                    </div>
            </div>

                  <div className="space-y-2">
                    <Label htmlFor="withdraw_notes">Notes (Optional)</Label>
                    <Textarea
                      id="withdraw_notes"
                      placeholder="Any additional information"
                      value={withdrawForm.notes}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, notes: e.target.value })}
                    />
              </div>
            </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleWithdrawRequest}>
                    Submit Request
                  </Button>
            </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Fund Requests History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>Your deposit and withdrawal request history</CardDescription>
            </CardHeader>
            <CardContent>
              {fundRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Requests Yet</h3>
                  <p className="text-muted-foreground">Your deposit and withdrawal requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fundRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {request.type === 'deposit' ? (
                          <Upload className="h-5 w-5 text-green-600" />
                        ) : (
                          <Download className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-semibold capitalize">{request.type}</div>
                          <div className="text-sm text-muted-foreground">
                            ${parseFloat(request.amount).toFixed(2)} • {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          request.status === 'approved' ? 'default' :
                          request.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {request.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                          {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
        </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

