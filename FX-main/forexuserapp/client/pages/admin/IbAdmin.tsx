import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface IbAccount {
  id: string;
  ib_name: string;
  referral_code: string;
  user_id: string;
  status: string;
  pending_earnings: number;
  total_clients: number;
}

export default function IbAdmin() {
  const [accounts, setAccounts] = useState<IbAccount[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ib-accounts');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setAccounts(data || []);
    } catch (e: any) {
      console.error(e);
      toast.error('Could not load IB accounts');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/ib-accounts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success('Updated');
      fetchAccounts();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">IB Accounts (Admin)</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Referral</TableHead>
              <TableHead>Clients</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center">No IB accounts</TableCell></TableRow>
            ) : (
              accounts.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{a.ib_name}</TableCell>
                  <TableCell>{a.referral_code}</TableCell>
                  <TableCell>{a.total_clients}</TableCell>
                  <TableCell>${a.pending_earnings}</TableCell>
                  <TableCell>{a.status}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(a.id, 'approved')}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(a.id, 'rejected')}>Reject</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
