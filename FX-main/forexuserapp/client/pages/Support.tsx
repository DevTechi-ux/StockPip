import Header from "@/components/trading/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import React from "react";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

export default function Support() {
  const [user, setUser] = React.useState<any>(null);
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    subject: "",
    message: "",
    category: "general",
    priority: "medium"
  });

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchTickets(parsedUser.id);
    }
  }, []);

  const fetchTickets = async (userId: string) => {
    try {
      const response = await fetch(`/api/support/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    console.log('handleSubmit called', { formData, user });
    
    if (!formData.subject || !formData.message) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!user) {
      toast.error("Please login to submit a ticket");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Sending request to /api/support');
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          subject: formData.subject,
          message: formData.message,
          category: formData.category,
          priority: formData.priority
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        toast.success("Support ticket submitted successfully");
        setIsDialogOpen(false);
        setFormData({
          subject: "",
          message: "",
          category: "general",
          priority: "medium"
        });
        fetchTickets(user.id);
      } else {
        toast.error(data.error || "Failed to submit ticket");
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error("Error submitting ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background text-foreground">
      <Header />
      <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Support Center
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Get help with your account and trading</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>
                    Submit a support request and our team will get back to you soon
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="account">Account</SelectItem>
                          <SelectItem value="transaction">Transaction</SelectItem>
                          <SelectItem value="verification">Verification</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your issue in detail..."
                      className="min-h-[120px]"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tickets List */}
          <Card>
            <CardHeader>
              <CardTitle>My Support Tickets</CardTitle>
              <CardDescription>Track your support requests</CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Tickets Yet</h3>
                  <p className="text-muted-foreground mb-4">Submit a support ticket to get help</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Create First Ticket
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{ticket.message}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {ticket.admin_response && (
                        <div className="mt-3 p-3 bg-accent rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold">Admin Response:</span>
                          </div>
                          <p className="text-sm">{ticket.admin_response}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
                        {ticket.updated_at !== ticket.created_at && (
                          <span>Updated: {new Date(ticket.updated_at).toLocaleString()}</span>
                        )}
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

