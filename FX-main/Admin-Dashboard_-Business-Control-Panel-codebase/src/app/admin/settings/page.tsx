"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Settings, Shield, Bell, Database, Mail, Globe, Plus, Trash2, Edit, CheckCircle, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export default function SettingsPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [isLoadingAdminUsers, setIsLoadingAdminUsers] = useState(true);
  
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isAdminUserDialogOpen, setIsAdminUserDialogOpen] = useState(false);
  const [isAssignPermissionsDialogOpen, setIsAssignPermissionsDialogOpen] = useState(false);
  
  const [editingRole, setEditingRole] = useState<any>(null);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [editingAdminUser, setEditingAdminUser] = useState<any>(null);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<any>(null);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);

  // Fetch data
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    fetchAdminUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoadingRoles(true);
      const res = await fetch("/api/admin/roles");
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
      toast.error("Failed to load roles");
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      setIsLoadingPermissions(true);
      const res = await fetch("/api/admin/permissions");
      const data = await res.json();
      setPermissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
      toast.error("Failed to load permissions");
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      setIsLoadingAdminUsers(true);
      const res = await fetch("/api/admin/admin-users");
      const data = await res.json();
      setAdminUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      setAdminUsers([]);
      toast.error("Failed to load admin users");
    } finally {
      setIsLoadingAdminUsers(false);
    }
  };

  const fetchRolePermissions = async (roleId: number) => {
    try {
      const res = await fetch(`/api/admin/roles/${roleId}/permissions`);
      const data = await res.json();
      setRolePermissions(data.map((p: any) => p.id));
    } catch (error) {
      toast.error("Failed to load role permissions");
    }
  };

  // Role handlers
  const handleSaveRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      level: parseInt(formData.get("level") as string),
    };

    try {
      if (editingRole) {
        const res = await fetch(`/api/admin/roles?id=${editingRole.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error();
        toast.success("Role updated successfully");
      } else {
        const res = await fetch("/api/admin/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error();
        toast.success("Role created successfully");
      }
      setIsRoleDialogOpen(false);
      setEditingRole(null);
      fetchRoles();
    } catch (error) {
      toast.error(editingRole ? "Failed to update role" : "Failed to create role");
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      const res = await fetch(`/api/admin/roles?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };

  // Permission handlers
  const handleSavePermission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      resource: formData.get("resource") as string,
      action: formData.get("action") as string,
    };

    try {
      if (editingPermission) {
        const res = await fetch(`/api/admin/permissions?id=${editingPermission.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error();
        toast.success("Permission updated successfully");
      } else {
        const res = await fetch("/api/admin/permissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error();
        toast.success("Permission created successfully");
      }
      setIsPermissionDialogOpen(false);
      setEditingPermission(null);
      fetchPermissions();
    } catch (error) {
      toast.error(editingPermission ? "Failed to update permission" : "Failed to create permission");
    }
  };

  const handleDeletePermission = async (id: number) => {
    if (!confirm("Are you sure you want to delete this permission?")) return;
    try {
      const res = await fetch(`/api/admin/permissions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Permission deleted successfully");
      fetchPermissions();
    } catch (error) {
      toast.error("Failed to delete permission");
    }
  };

  // Admin user handlers
  const handleSaveAdminUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      roleId: parseInt(formData.get("roleId") as string),
      status: formData.get("status") as string || "active",
    };

    try {
      if (editingAdminUser) {
        const res = await fetch(`/api/admin/admin-users?id=${editingAdminUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error();
        toast.success("Admin user updated successfully");
      } else {
        const res = await fetch("/api/admin/admin-users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error();
        toast.success("Admin user created successfully");
      }
      setIsAdminUserDialogOpen(false);
      setEditingAdminUser(null);
      fetchAdminUsers();
    } catch (error) {
      toast.error(editingAdminUser ? "Failed to update admin user" : "Failed to create admin user");
    }
  };

  const handleDeleteAdminUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this admin user?")) return;
    try {
      const res = await fetch(`/api/admin/admin-users?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Admin user deleted successfully");
      fetchAdminUsers();
    } catch (error) {
      toast.error("Failed to delete admin user");
    }
  };

  const handleToggleAdminUserStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/admin/admin-users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Admin user ${newStatus === "active" ? "activated" : "deactivated"}`);
      fetchAdminUsers();
    } catch (error) {
      toast.error("Failed to update admin user status");
    }
  };

  const handleAssignPermissions = async () => {
    if (!selectedRoleForPermissions) return;
    try {
      const res = await fetch(`/api/admin/roles/${selectedRoleForPermissions.id}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionIds: rolePermissions }),
      });
      if (!res.ok) throw new Error();
      toast.success("Permissions assigned successfully");
      setIsAssignPermissionsDialogOpen(false);
      fetchRoles();
    } catch (error) {
      toast.error("Failed to assign permissions");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure platform settings and administrative preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="glass-effect">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="admins">Admin Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>General Settings</CardTitle>
              </div>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="VentaBlack Trading" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" type="email" defaultValue="support@ventablack.com" />
                </div>
              </div>
              <Button className="w-full">Save General Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Security Settings</CardTitle>
              </div>
              <CardDescription>Platform security configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button className="w-full">Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
              <CardDescription>Configure platform notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Email Notifications</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Large Withdrawal Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify when withdrawal exceeds threshold</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button className="w-full">Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Roles & Permissions</CardTitle>
                  <CardDescription>Manage admin roles and their permissions</CardDescription>
                </div>
                <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingRole(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleSaveRole}>
                      <DialogHeader>
                        <DialogTitle>{editingRole ? "Edit Role" : "Create Role"}</DialogTitle>
                        <DialogDescription>
                          {editingRole ? "Update role details" : "Create a new admin role"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="role-name">Role Name</Label>
                          <Input
                            id="role-name"
                            name="name"
                            defaultValue={editingRole?.name}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role-level">Level (1=highest)</Label>
                          <Input
                            id="role-level"
                            name="level"
                            type="number"
                            defaultValue={editingRole?.level || 5}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role-description">Description</Label>
                          <Textarea
                            id="role-description"
                            name="description"
                            defaultValue={editingRole?.description}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">
                          {editingRole ? "Update Role" : "Create Role"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRoles ? (
                <div className="text-center py-8 text-muted-foreground">Loading roles...</div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id} className="ios-transition hover:bg-accent/50">
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Level {role.level}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{role.description}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRoleForPermissions(role);
                                fetchRolePermissions(role.id);
                                setIsAssignPermissionsDialogOpen(true);
                              }}
                            >
                              {role.permissionsCount} assigned
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingRole(role);
                                  setIsRoleDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteRole(role.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Permissions</CardTitle>
                  <CardDescription>Manage system permissions</CardDescription>
                </div>
                <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingPermission(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Permission
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleSavePermission}>
                      <DialogHeader>
                        <DialogTitle>{editingPermission ? "Edit Permission" : "Create Permission"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="permission-name">Name</Label>
                          <Input
                            id="permission-name"
                            name="name"
                            defaultValue={editingPermission?.name}
                            placeholder="e.g., users.read"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="permission-resource">Resource</Label>
                          <Input
                            id="permission-resource"
                            name="resource"
                            defaultValue={editingPermission?.resource}
                            placeholder="e.g., users"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="permission-action">Action</Label>
                          <Input
                            id="permission-action"
                            name="action"
                            defaultValue={editingPermission?.action}
                            placeholder="e.g., read"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="permission-description">Description</Label>
                          <Textarea
                            id="permission-description"
                            name="description"
                            defaultValue={editingPermission?.description}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">
                          {editingPermission ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPermissions ? (
                <div className="text-center py-8 text-muted-foreground">Loading permissions...</div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => (
                        <TableRow key={permission.id} className="ios-transition hover:bg-accent/50">
                          <TableCell className="font-medium font-mono text-sm">{permission.name}</TableCell>
                          <TableCell>
                            <Badge>{permission.resource}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{permission.action}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{permission.description}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingPermission(permission);
                                  setIsPermissionDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeletePermission(permission.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isAssignPermissionsDialogOpen} onOpenChange={setIsAssignPermissionsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Assign Permissions to {selectedRoleForPermissions?.name}</DialogTitle>
                <DialogDescription>
                  Select permissions to assign to this role
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`perm-${permission.id}`}
                      checked={rolePermissions.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRolePermissions([...rolePermissions, permission.id]);
                        } else {
                          setRolePermissions(rolePermissions.filter((id) => id !== permission.id));
                        }
                      }}
                    />
                    <label
                      htmlFor={`perm-${permission.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <span className="font-mono text-sm">{permission.name}</span>
                      <span className="text-muted-foreground ml-2">- {permission.description}</span>
                    </label>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={handleAssignPermissions}>Save Permissions</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Administrator Accounts</CardTitle>
                  <CardDescription>Manage admin users and their roles</CardDescription>
                </div>
                <Dialog open={isAdminUserDialogOpen} onOpenChange={setIsAdminUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingAdminUser(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Admin User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleSaveAdminUser}>
                      <DialogHeader>
                        <DialogTitle>{editingAdminUser ? "Edit Admin User" : "Create Admin User"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="admin-name">Name</Label>
                          <Input
                            id="admin-name"
                            name="name"
                            defaultValue={editingAdminUser?.name}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="admin-email">Email</Label>
                          <Input
                            id="admin-email"
                            name="email"
                            type="email"
                            defaultValue={editingAdminUser?.email}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="admin-role">Role</Label>
                          <Select name="roleId" defaultValue={editingAdminUser?.roleId?.toString()}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="admin-status">Status</Label>
                          <Select name="status" defaultValue={editingAdminUser?.status || "active"}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">
                          {editingAdminUser ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAdminUsers ? (
                <div className="text-center py-8 text-muted-foreground">Loading admin users...</div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.map((admin) => (
                        <TableRow key={admin.id} className="ios-transition hover:bg-accent/50">
                          <TableCell className="font-medium">{admin.name}</TableCell>
                          <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{admin.role?.name || "No Role"}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={admin.status === "active" ? "default" : "secondary"}>
                              {admin.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : "Never"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleAdminUserStatus(admin.id, admin.status)}
                              >
                                {admin.status === "active" ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingAdminUser(admin);
                                  setIsAdminUserDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteAdminUser(admin.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <CardTitle>System Configuration</CardTitle>
              </div>
              <CardDescription>Advanced system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Database Backup</Label>
                    <p className="text-sm text-muted-foreground">Automatic daily backups</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button className="w-full">Save System Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}