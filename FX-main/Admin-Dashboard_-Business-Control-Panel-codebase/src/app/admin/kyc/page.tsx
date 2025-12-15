"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, CheckCircle, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const kycRequests = [
  {
    id: 1,
    user: "John Doe",
    email: "john@example.com",
    status: "pending",
    submitted: "2024-01-20",
    docType: "Passport",
    country: "USA",
  },
  {
    id: 2,
    user: "Sarah Smith",
    email: "sarah@example.com",
    status: "pending",
    submitted: "2024-01-22",
    docType: "Driver License",
    country: "UK",
  },
  {
    id: 3,
    user: "Mike Johnson",
    email: "mike@example.com",
    status: "under_review",
    submitted: "2024-01-18",
    docType: "National ID",
    country: "Canada",
  },
];

const verifiedUsers = [
  {
    id: 1,
    user: "Emma Davis",
    email: "emma@example.com",
    status: "verified",
    verifiedDate: "2024-01-15",
    docType: "Passport",
    country: "Australia",
  },
  {
    id: 2,
    user: "Tom Wilson",
    email: "tom@example.com",
    status: "verified",
    verifiedDate: "2024-01-10",
    docType: "Driver License",
    country: "USA",
  },
];

const rejectedUsers = [
  {
    id: 1,
    user: "Alex Brown",
    email: "alex@example.com",
    status: "rejected",
    rejectedDate: "2024-01-12",
    reason: "Document expired",
    docType: "Passport",
  },
];

export default function KYCPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">KYC Verification</h1>
        <p className="text-muted-foreground">
          Review and verify user identity documents
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9,823</div>
            <p className="text-xs text-muted-foreground">80% of users</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Need resubmission</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="glass-effect">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Pending KYC Requests</CardTitle>
              <CardDescription>Review and approve identity verification requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycRequests.map((request) => (
                      <TableRow key={request.id} className="ios-transition hover:bg-accent/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={`https://i.pravatar.cc/150?u=${request.email}`}
                                alt={request.user}
                              />
                              <AvatarFallback>
                                {request.user.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.user}</p>
                              <p className="text-xs text-muted-foreground">{request.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{request.docType}</TableCell>
                        <TableCell>{request.country}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              request.status === "pending"
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{request.submitted}</TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUser(request)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>KYC Verification - {request.user}</DialogTitle>
                                <DialogDescription>
                                  Review identity documents and approve or reject
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input defaultValue={request.user} disabled />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input defaultValue={request.email} disabled />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Document Type</Label>
                                    <Input defaultValue={request.docType} disabled />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Country</Label>
                                    <Input defaultValue={request.country} disabled />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Document Images</Label>
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                      <img
                                        src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop"
                                        alt="Document front"
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    </div>
                                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                      <img
                                        src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop"
                                        alt="Document back"
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Selfie</Label>
                                  <div className="aspect-video bg-muted rounded-lg max-w-sm flex items-center justify-center">
                                    <img
                                      src={`https://i.pravatar.cc/400?u=${request.email}`}
                                      alt="Selfie"
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Notes (optional)</Label>
                                  <Textarea placeholder="Add verification notes..." />
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button variant="destructive" className="gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                  </Button>
                                  <Button className="gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verified">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Verified Users</CardTitle>
              <CardDescription>All approved KYC verifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {verifiedUsers.map((user) => (
                      <TableRow key={user.id} className="ios-transition hover:bg-accent/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={`https://i.pravatar.cc/150?u=${user.email}`}
                                alt={user.user}
                              />
                              <AvatarFallback>
                                {user.user.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.user}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.docType}</TableCell>
                        <TableCell>{user.country}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.verifiedDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Rejected Requests</CardTitle>
              <CardDescription>KYC verifications that were rejected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rejected Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedUsers.map((user) => (
                      <TableRow key={user.id} className="ios-transition hover:bg-accent/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={`https://i.pravatar.cc/150?u=${user.email}`}
                                alt={user.user}
                              />
                              <AvatarFallback>
                                {user.user.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.user}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.docType}</TableCell>
                        <TableCell className="text-muted-foreground">{user.reason}</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.rejectedDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
