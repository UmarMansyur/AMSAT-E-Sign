'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useDataStore } from '@/store/data-store';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Mail,
  Shield,
  Key,
  Calendar,
  Copy,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { UserRole, ActivityAction } from '@/types';

export default function ProfilePage() {
  const { user, login } = useAuthStore();
  const { updateUser, resetSecretKey, addActivityLog } = useDataStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isResetKeyDialogOpen, setIsResetKeyDialogOpen] = useState(false);
  const [isSecretKeyDialogOpen, setIsSecretKeyDialogOpen] = useState(false);
  const [newSecretKey, setNewSecretKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return (
          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <Shield className="mr-1 h-3 w-3" />
            Super Admin
          </Badge>
        );
      case UserRole.ADMIN:
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        );
      case UserRole.USER:
        return (
          <Badge variant="secondary">
            <User className="mr-1 h-3 w-3" />
            Penandatangan
          </Badge>
        );
    }
  };

  const handleSaveProfile = () => {
    if (!user) return;

    updateUser(user.id, {
      name: formData.name,
      email: formData.email,
    });

    // Update auth store
    login({
      ...user,
      name: formData.name,
      email: formData.email,
    });

    setIsEditing(false);
    toast.success('Profil berhasil diperbarui');
  };

  const handleResetSecretKey = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const secretKey = await resetSecretKey(user.id);

      addActivityLog({
        userId: user.id,
        userName: user.name,
        action: ActivityAction.RESET_SECRET_KEY,
        description: 'Reset secret key untuk akun sendiri',
      });

      setNewSecretKey(secretKey);
      setIsResetKeyDialogOpen(false);
      setIsSecretKeyDialogOpen(true);
      toast.success('Secret key berhasil direset');
    } catch {
      toast.error('Gagal reset secret key');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Disalin ke clipboard');
  };

  if (!user) return null;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Profil Saya
          </h1>
          <p className="text-muted-foreground">
            Kelola informasi profil dan keamanan akun Anda
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Informasi Profil</CardTitle>
                  <CardDescription>
                    Data pribadi yang digunakan dalam sistem
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Profil
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      Simpan Perubahan
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Batal
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <div className="mt-1">{getRoleBadge(user.role)}</div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <User className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Nama Lengkap</p>
                        <p className="font-medium">{user.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Mail className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Shield className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Role</p>
                        <p className="font-medium">
                          {user.role === UserRole.SUPER_ADMIN && 'Super Admin'}
                          {user.role === UserRole.ADMIN && 'Admin'}
                          {user.role === UserRole.USER && 'Penandatangan'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Bergabung</p>
                        <p className="font-medium">
                          {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: id })}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Keamanan
              </CardTitle>
              <CardDescription>
                Kelola secret key untuk tanda tangan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Status Secret Key</p>
                <Badge className="bg-emerald-100 text-emerald-700">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Aktif
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Secret key digunakan untuk memverifikasi identitas Anda saat menandatangani dokumen.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsResetKeyDialogOpen(true)}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Reset Secret Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reset Key Confirmation Dialog */}
        <Dialog open={isResetKeyDialogOpen} onOpenChange={setIsResetKeyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Reset Secret Key
              </DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin mereset secret key? Secret key lama tidak akan bisa digunakan lagi.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResetKeyDialogOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={handleResetSecretKey}
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mereset...
                  </>
                ) : (
                  'Reset Secret Key'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Secret Key Dialog */}
        <Dialog open={isSecretKeyDialogOpen} onOpenChange={setIsSecretKeyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-indigo-600" />
                Secret Key Baru
              </DialogTitle>
              <DialogDescription>
                Simpan secret key ini dengan aman. Key ini hanya ditampilkan sekali dan tidak dapat dipulihkan.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <code className="flex-1 font-mono text-sm break-all">{newSecretKey}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(newSecretKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-amber-600 mt-4 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Simpan secret key ini di tempat yang aman. Anda akan membutuhkannya setiap kali
                  menandatangani dokumen.
                </span>
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsSecretKeyDialogOpen(false)}>
                Saya Sudah Menyimpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
