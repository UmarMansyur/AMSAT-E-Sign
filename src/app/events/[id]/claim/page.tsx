'use client';

import { useState, use, useRef } from 'react';
import { useDataStore } from '@/store/data-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle, CheckCircle2, QrCode, Download, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { CertificateClaim } from '@/types';

interface ClaimPageProps {
  params: Promise<{ id: string }>;
}

export default function ClaimCertificatePage({ params }: ClaimPageProps) {
  const { id: eventId } = use(params);
  const { getEventById, claimCertificate } = useDataStore();

  const [recipientName, setRecipientName] = useState('');
  const [claimResult, setClaimResult] = useState<CertificateClaim | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const event = getEventById(eventId);

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Kegiatan Tidak Ditemukan</CardTitle>
            <CardDescription>
              Mohon periksa kembali link yang Anda akses.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/">
              <Button variant="outline">Kembali ke Beranda</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isExpired = new Date() > new Date(event.claimDeadline);

  const handleClaim = async () => {
    if (!recipientName.trim()) {
      setError('Nama lengkap harus diisi');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await claimCertificate(event.id, recipientName);
      setClaimResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengklaim sertifikat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    // Basic implementation: Print the page (or specifically the certificate area)
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header / Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-rose-700 shadow-md">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-slate-800">AMSAT e-Cert</span>
          </Link>
        </div>

        {!claimResult ? (
          <Card className="shadow-xl border-0 overflow-hidden">
            <div className="bg-red-600 h-2 w-full" />
            <CardHeader className="text-center space-y-2 pb-8">
              <Badge variant="outline" className="w-fit mx-auto border-red-200 text-red-700 bg-red-50 mb-2">
                Klaim Sertifikat
              </Badge>
              <CardTitle className="text-3xl font-bold text-slate-900">{event.name}</CardTitle>
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(event.date), 'dd MMMM yyyy', { locale: id })}</span>
              </div>
            </CardHeader>
            <CardContent className="max-w-md mx-auto space-y-6 pb-12">
              {isExpired ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Batas Waktu Berakhir</AlertTitle>
                  <AlertDescription>
                    Maaf, batas waktu klaim sertifikat untuk kegiatan ini telah berakhir pada {format(new Date(event.claimDeadline), 'dd MMMM yyyy', { locale: id })}.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipientName">Nama Lengkap (untuk Sertifikat)</Label>
                      <Input
                        id="recipientName"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Contoh: Budi Santoso, S.Kom"
                        className="text-lg h-12"
                      />
                      <p className="text-xs text-muted-foreground">
                        Pastikan nama sudah benar dan sesuai ejaan yang diinginkan.
                      </p>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      onClick={handleClaim}
                      disabled={isLoading}
                      className="w-full h-12 text-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 shadow-lg"
                    >
                      {isLoading ? 'Memproses...' : 'Klaim Sertifikat Sekarang'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Sertifikat Berhasil Diklaim!</h2>
              <p className="text-slate-500">
                Terima kasih telah berpartisipasi dalam {event.name}
              </p>
            </div>

            {/* Certificate Preview */}
            <div className="relative w-full aspect-[1.414/1] bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-200 print:shadow-none print:border-0" ref={certificateRef}>
              {/* Background */}
              {event.templateUrl ? (
                <img
                  src={event.templateUrl}
                  alt="Certificate Template"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 font-bold text-4xl">
                  NO TEMPLATE
                </div>
              )}

              {/* Overlays - Using style for dynamic positioning */}
              {/* Note: The mock coordinates in store are based on 800x600 canvas. 
                  We need to scale them if the display size differs, but for simplicity we rely on relative % or fixed pixels assuming specific size.
                  For this demo, since we don't assume canvas size, we'll try to map the pixels roughly or assume the user configured for this view.
                  Better update: Use percentages in real app.
              */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-slate-900 font-bold text-center w-full"
                style={{
                  left: `${(event.templateConfig.nameX / 800) * 100}%`,
                  top: `${(event.templateConfig.nameY / 600) * 100}%`,
                  fontSize: `clamp(1rem, ${event.templateConfig.nameFontSize / 16}vw, 3rem)`, // Responsive font size guess
                }}
              >
                {claimResult.recipientName}
              </div>

              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-white p-1"
                style={{
                  left: `${(event.templateConfig.qrX / 800) * 100}%`,
                  top: `${(event.templateConfig.qrY / 600) * 100}%`,
                  width: `${(event.templateConfig.qrSize / 800) * 100}%`,
                }}
              >
                <img src={claimResult.qrCodeUrl} alt="QR Code" className="w-full h-full" />
              </div>

              {/* Certificate Number - usually static or configured, putting it at bottom for now */}
              <div className="absolute bottom-4 left-4 text-xs text-slate-500 font-mono">
                {claimResult.certificateNumber}
              </div>
            </div>

            <div className="flex justify-center gap-4 print:hidden">
              <Button variant="outline" onClick={() => window.print()} className="gap-2">
                <Download className="h-4 w-4" />
                Simpan PDF / Cetak
              </Button>
              <Link href="/">
                <Button variant="ghost">Kembali ke Beranda</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
