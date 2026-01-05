'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useDataStore } from '@/store/data-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ActivityAction } from '@/types';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { getUsers, addActivityLog } = useDataStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Demo login - check if user exists
      const users = getUsers();
      const user = users.find((u) => u.email === email);

      if (!user) {
        setError('Email tidak ditemukan');
        setIsLoading(false);
        return;
      }

      if (!user.isActive) {
        setError('Akun Anda tidak aktif. Hubungi administrator.');
        setIsLoading(false);
        return;
      }

      // For demo, accept any password
      // In production, use proper password verification
      if (password !== 'password123' && password !== 'demo') {
        setError('Password tidak valid. Gunakan "password123" atau "demo".');
        setIsLoading(false);
        return;
      }

      // Login success
      login(user);

      addActivityLog({
        userId: user.id,
        userName: user.name,
        action: ActivityAction.LOGIN,
        description: 'Berhasil login ke sistem',
      });

      toast.success(`Selamat datang, ${user.name}!`);
      router.push('/admin/dashboard');
    } catch {
      setError('Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600 shadow-md">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">AMSAT E-Sign</span>
          </Link>
          <p className="text-slate-500 mt-2 font-medium">Portal Login Administrator</p>
        </div>

        <Card className="border shadow-xl bg-white">
          <CardHeader className="text-center pb-2 border-b bg-slate-50/50 rounded-t-xl">
            <CardTitle className="text-xl font-bold text-slate-800">Masuk ke Akun</CardTitle>
            <CardDescription className="text-slate-500">
              Masukkan kredensial Anda untuk mengakses dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="h-11 border-slate-200 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-slate-700">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    className="h-11 pr-10 border-slate-200 focus:border-red-500 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium shadow-md shadow-red-600/10 transition-all hover:shadow-lg hover:shadow-red-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 mb-3 justify-center text-slate-500">
                <Shield className="h-3 w-3" />
                <span className="text-xs font-semibold uppercase tracking-wider">Kredensial Demo</span>
              </div>
              <div className="grid gap-2 text-xs text-slate-600">
                <div className="flex justify-between items-center py-1 border-b border-slate-200 last:border-0">
                  <span>Super Admin</span>
                  <code className="bg-white px-2 py-0.5 rounded border text-slate-800">superadmin@esign.id</code>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200 last:border-0">
                  <span>Admin</span>
                  <code className="bg-white px-2 py-0.5 rounded border text-slate-800">admin@esign.id</code>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200 last:border-0">
                  <span>User</span>
                  <code className="bg-white px-2 py-0.5 rounded border text-slate-800">budi@esign.id</code>
                </div>
                <div className="flex justify-between items-center pt-2 mt-1">
                  <span className="font-semibold text-slate-700">Password (Sama)</span>
                  <code className="bg-white px-2 py-0.5 rounded border font-bold text-slate-800">password123</code>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="bg-slate-50 p-4 rounded-b-xl border-t text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-red-600 transition-colors inline-flex items-center gap-1 font-medium">
              ← Kembali ke halaman utama
            </Link>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} AMSAT E-Sign. All rights reserved.</p>
        </div>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}
