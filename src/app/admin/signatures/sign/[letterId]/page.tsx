'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useDataStore } from '@/store/data-store';
import { useAuthStore } from '@/store/auth-store';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  PenTool,
  FileText,
  Calendar,
  Paperclip,
  AlertCircle,
  CheckCircle2,
  Lock,
  Shield,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ActivityAction, LetterStatus } from '@/types';
import { verifySecretKey } from '@/lib/crypto';
import { isBlocked, recordAttempt, getRemainingAttempts } from '@/lib/rate-limiter';
import Link from 'next/link';

interface SignPageProps {
  params: Promise<{ letterId: string }>;
}

export default function SignPage({ params }: SignPageProps) {
  const { letterId } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const { getLetterById, signLetter, addActivityLog, getUserById } = useDataStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const letter = getLetterById(letterId);

  const handleSign = async () => {
    if (!user || !letter) return;

    setError('');

    // Check rate limit
    const blockStatus = isBlocked(user.id);
    if (blockStatus.blocked) {
      setError(`Terlalu banyak percobaan. Coba lagi dalam ${blockStatus.remainingTime} detik.`);
      return;
    }

    setIsLoading(true);

    try {
      // Record successful attempt (resets rate limit)
      recordAttempt(user.id, true);

      // Sign the letter
      await signLetter(letter.id, user.id, user.name);

      addActivityLog({
        userId: user.id,
        userName: user.name,
        action: ActivityAction.SIGN_LETTER,
        description: `Menandatangani surat: ${letter.letterNumber}`,
        metadata: { letterId: letter.id, letterNumber: letter.letterNumber },
      });

      toast.success('Surat berhasil ditandatangani!');
      router.push('/admin/letters');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menandatangani');
    } finally {
      setIsLoading(false);
    }
  };

  if (!letter) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Surat Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-4">
            Surat yang Anda cari tidak ditemukan dalam sistem.
          </p>
          <Link href="/admin/letters">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Surat
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  if (letter.status === LetterStatus.SIGNED) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Surat Sudah Ditandatangani</h2>
          <p className="text-muted-foreground mb-4">
            Surat ini sudah ditandatangani sebelumnya.
          </p>
          <Link href="/admin/letters">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Surat
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/letters">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Tanda Tangan Surat
            </h1>
            <p className="text-muted-foreground">
              Verifikasi dan tanda tangani dokumen secara elektronik
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Letter Details */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detail Surat
              </CardTitle>
              <CardDescription>
                Informasi surat yang akan ditandatangani
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Nomor Surat</p>
                  <p className="font-semibold">{letter.letterNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal Surat</p>
                  <p className="font-semibold">
                    {format(new Date(letter.letterDate), 'dd MMMM yyyy', { locale: id })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <PenTool className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Perihal</p>
                  <p className="font-semibold">{letter.subject}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Paperclip className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Lampiran</p>
                  <p className="font-semibold">{letter.attachment}</p>
                </div>
              </div>

              {letter.content && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Isi Surat</p>
                  <p className="text-sm whitespace-pre-wrap">{letter.content}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signing Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verifikasi & Tanda Tangan
              </CardTitle>
              <CardDescription>
                Konfirmasi untuk menandatangani dokumen ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Perhatian</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Setelah ditandatangani, surat tidak dapat diubah atau dihapus.
                  Pastikan semua informasi sudah benar sebelum menandatangani.
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Penandatangan:
                </p>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <Button
                onClick={handleSign}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Menandatangani...
                  </>
                ) : (
                  <>
                    <PenTool className="mr-2 h-5 w-5" />
                    Tanda Tangani Surat
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
