'use client';

import { useState } from 'react';
import { useDataStore } from '@/store/data-store';
import { useAuthStore } from '@/store/auth-store';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Key,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  UserCheck,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { UserRole, User, ActivityAction } from '@/types';

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const { getUsers, addUser, updateUser, deleteUser, resetSecretKey, addActivityLog } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSecretKeyDialogOpen, setIsSecretKeyDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newSecretKey, setNewSecretKey] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.USER,
    isActive: true,
  });

  const users = getUsers();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return (
          <Badge className="bg-red-600 text-white hover:bg-red-700">
            <Shield className="mr-1 h-3 w-3" />
            Super Admin
          </Badge>
        );
      case UserRole.ADMIN:
        return (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            <UserCheck className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        );
      case UserRole.USER:
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
            <UserIcon className="mr-1 h-3 w-3" />
            Penandatangan
          </Badge>
        );
    }
  };

  const handleAddUser = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Nama dan email harus diisi');
      return;
    }

    try {
      const { user, secretKey } = await addUser(formData);

      addActivityLog({
        userId: currentUser!.id,
        userName: currentUser!.name,
        action: ActivityAction.CREATE_USER,
        description: `Membuat pengguna baru: ${user.name}`,
        metadata: { createdUserId: user.id, email: user.email },
      });

      setNewSecretKey(secretKey);
      setIsAddDialogOpen(false);
      setIsSecretKeyDialogOpen(true);
      setFormData({ name: '', email: '', role: UserRole.USER, isActive: true });
      toast.success('Pengguna berhasil ditambahkan');
    } catch {
      toast.error('Gagal menambahkan pengguna');
    }
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    updateUser(selectedUser.id, {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      isActive: formData.isActive,
    });

    addActivityLog({
      userId: currentUser!.id,
      userName: currentUser!.name,
      action: ActivityAction.UPDATE_USER,
      description: `Memperbarui pengguna: ${formData.name}`,
      metadata: { updatedUserId: selectedUser.id },
    });

    setIsEditDialogOpen(false);
    setSelectedUser(null);
    toast.success('Pengguna berhasil diperbarui');
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    deleteUser(selectedUser.id);

    addActivityLog({
      userId: currentUser!.id,
      userName: currentUser!.name,
      action: ActivityAction.DELETE_USER,
      description: `Menghapus pengguna: ${selectedUser.name}`,
      metadata: { deletedUserId: selectedUser.id },
    });

    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
    toast.success('Pengguna berhasil dihapus');
  };

  const handleResetSecretKey = async (user: User) => {
    try {
      const secretKey = await resetSecretKey(user.id);

      addActivityLog({
        userId: currentUser!.id,
        userName: currentUser!.name,
        action: ActivityAction.RESET_SECRET_KEY,
        description: `Reset secret key untuk pengguna: ${user.name}`,
        metadata: { targetUserId: user.id },
      });

      setSelectedUser(user);
      setNewSecretKey(secretKey);
      setIsSecretKeyDialogOpen(true);
      toast.success('Secret key berhasil direset');
    } catch {
      toast.error('Gagal reset secret key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Disalin ke clipboard');
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Manajemen Pengguna
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola daftar pengguna, peran, dan hak akses sistem.
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 shadow-md transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pengguna
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                <DialogDescription>
                  Isi data pengguna baru di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: John Doe"
                    className="focus-visible:ring-red-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Contoh: john@amsat.com"
                    className="focus-visible:ring-red-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                  >
                    <SelectTrigger className="focus:ring-red-600">
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUser?.role === UserRole.SUPER_ADMIN && (
                        <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                      )}
                      <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                      <SelectItem value={UserRole.USER}>Penandatangan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAddUser} className="bg-red-600 hover:bg-red-700">
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Data Table Area */}
        <Card className="border shadow-md rounded-xl overflow-hidden bg-white">
          <div className="p-4 border-b bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari pengguna..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white focus-visible:ring-red-600"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white focus:ring-red-600">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <SelectValue placeholder="Filter Role" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.USER}>Penandatangan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[200px] font-semibold text-slate-700">Nama</TableHead>
                  <TableHead className="font-semibold text-slate-700">Email</TableHead>
                  <TableHead className="font-semibold text-slate-700">Role</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Tanggal Dibuat</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-red-50/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-slate-900">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full text-xs font-medium border border-emerald-100">
                          <CheckCircle className="h-3 w-3" />
                          Aktif
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 w-fit px-2 py-1 rounded-full text-xs font-medium border border-slate-200">
                          <XCircle className="h-3 w-3" />
                          Nonaktif
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Edit className="mr-2 h-4 w-4 text-slate-500" />
                            Edit Data
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetSecretKey(user)}>
                            <Key className="mr-2 h-4 w-4 text-slate-500" />
                            Reset Key
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => openDeleteDialog(user)}
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-slate-300" />
                        <p>Tidak ada pengguna yang ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          {/* Mock Pagination */}
          <div className="p-4 border-t bg-slate-50/50 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Menampilkan {filteredUsers.length} dari {users.length} data
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" disabled className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pengguna</DialogTitle>
              <DialogDescription>
                Perbarui informasi pengguna di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Lengkap</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="focus-visible:ring-red-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="focus-visible:ring-red-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger className="focus:ring-red-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUser?.role === UserRole.SUPER_ADMIN && (
                      <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                    )}
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                    <SelectItem value={UserRole.USER}>Penandatangan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 py-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 accent-red-600"
                  />
                  <Label htmlFor="edit-active">Pengguna Aktif</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleEditUser} className="bg-red-600 hover:bg-red-700">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Hapus Pengguna
              </DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus pengguna <span className="font-semibold text-slate-900">{selectedUser?.name}</span>?
                Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
                Hapus Pengguna
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Secret Key Dialog */}
        <Dialog open={isSecretKeyDialogOpen} onOpenChange={setIsSecretKeyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-red-600" />
                Secret Key
              </DialogTitle>
              <DialogDescription>
                Simpan secret key ini dengan aman. Key ini hanya ditampilkan sekali.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2 p-4 bg-slate-100 rounded-lg border border-slate-200">
                <code className="flex-1 font-mono text-sm break-all text-slate-800">{newSecretKey}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(newSecretKey)}
                  className="hover:bg-slate-200"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>
                  PERINGATAN: Secret key ini digunakan untuk tanda tangan digital.
                  Jangan bagikan kepada siapapun.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsSecretKeyDialogOpen(false)} className="bg-red-600 hover:bg-red-700">
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
