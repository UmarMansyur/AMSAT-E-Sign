'use client';

import { use, useState, useEffect } from 'react';
import { useDataStore } from '@/store/data-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  User,
  Clock,
  Hash,
  Paperclip,
  ArrowLeft,
  Download,
  AlertCircle,
  Loader2,
  Share2,
  Printer,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { LetterStatus } from '@/types';
import { verifyLetterIntegrity } from '@/lib/crypto';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface VerifyPageProps {
  params: Promise<{ letterId: string }>;
}

export default function VerifyPage({ params }: VerifyPageProps) {
  const { letterId } = use(params);
  const { getLetterById, getSignatureByLetterId, generateQRCode, getUserById } = useDataStore();

  // Hydration fix: Handle client-side only rendering for store data
  const [mounted, setMounted] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoadingQR, setIsLoadingQR] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const letter = mounted ? getLetterById(letterId) : undefined;
  const signature = letter ? getSignatureByLetterId(letter.id) : null;
  const signer = signature && mounted ? getUserById(signature.signerId) : null;

  // Verify document integrity
  const isIntegrityValid = letter && letter.contentHash
    ? verifyLetterIntegrity(
      letter.letterNumber,
      new Date(letter.letterDate),
      letter.subject,
      letter.attachment,
      letter.content,
      letter.contentHash
    )
    : false;

  const isValid = letter?.status === LetterStatus.SIGNED && signature && isIntegrityValid;

  // Generate QR code on mount if letter is signed
  useEffect(() => {
    if (mounted && letter && letter.status === LetterStatus.SIGNED) {
      const loadQR = async () => {
        setIsLoadingQR(true);
        try {
          const url = await generateQRCode(letter.id);
          setQrCodeUrl(url);
        } catch (error) {
          console.error('Failed to generate QR code:', error);
        } finally {
          setIsLoadingQR(false);
        }
      };
      loadQR();
    }
  }, [mounted, letter, generateQRCode]);

  // Download QR
  const downloadQRCode = async () => {
    if (!qrCodeUrl || !letter) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${letter.letterNumber.replace(/\//g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Not Found State
  if (!letter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Dokumen Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-8">
              Maaf, dokumen dengan ID tersebut tidak ditemukan dalam sistem verifikasi kami.
            </p>
            <Link href="/">
              <Button size="lg" className="w-full bg-slate-900 hover:bg-slate-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Verification Status & Actions */}
      <aside className="w-full md:w-[400px] bg-slate-900 border-r border-slate-800 text-slate-300 p-6 md:p-8 flex flex-col md:h-screen md:fixed md:left-0 z-10 overflow-y-auto shadow-2xl">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 mb-10 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 shadow-md group-hover:bg-red-700 transition-colors">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-white tracking-tight block leading-none">AMSAT E-Sign</span>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1 block">Official Verification</span>
          </div>
        </Link>

        {/* Verification Status Badge */}
        <div className="mb-8 relative">
          {/* Glow effect behind status */}
          <div className={cn(
            "absolute inset-0 blur-2xl opacity-20 rounded-full",
            isValid ? "bg-emerald-500" : "bg-red-500"
          )} />

          <div className={cn(
            "rounded-xl p-6 text-center border relative bg-slate-800/50 backdrop-blur-sm",
            isValid
              ? "border-emerald-500/30"
              : "border-red-500/30"
          )}>
            <div className={cn(
              "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg border-2",
              isValid ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-red-500/10 border-red-500 text-red-500"
            )}>
              {isValid ? (
                <CheckCircle2 className="h-10 w-10" />
              ) : (
                <XCircle className="h-10 w-10" />
              )}
            </div>
            <h2 className={cn(
              "text-xl font-bold mb-2",
              isValid ? "text-emerald-400" : "text-red-400"
            )}>
              {isValid ? 'Dokumen Valid' : 'Dokumen Tidak Valid'}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {isValid
                ? 'Dokumen ini terverifikasi asli dan tercatat dalam database resmi AMSAT.'
                : 'Peringatan: Dokumen ini tidak ditemukan dalam database atau telah dimodifikasi.'}
            </p>
          </div>
        </div>

        {/* QR Code Section */}
        {isValid && (qrCodeUrl || isLoadingQR) && (
          <div className="bg-white rounded-xl p-4 border border-slate-700 mb-8 shadow-inner">
            <div className="flex items-center gap-4">
              {isLoadingQR ? (
                <div className="h-20 w-20 rounded-lg bg-slate-100 flex items-center justify-center animate-pulse border">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="bg-white p-1 rounded-lg border">
                  <img
                    src={qrCodeUrl!}
                    alt="QR Code"
                    className="h-20 w-20"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 mb-1">QR Code Digital</p>
                <p className="text-xs text-slate-500 mb-3">Pindai untuk akses cepat</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs w-full text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-red-600"
                    onClick={downloadQRCode}
                  >
                    <Download className="mr-2 h-3 w-3" />
                    Unduh
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mt-auto">
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
            <Share2 className="mr-2 h-4 w-4" />
            Bagikan Hasil Verifikasi
          </Button>
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak Halaman Ini
          </Button>
          <div className="h-px bg-slate-800 my-4" />
          <Link href="/" className="block">
            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/50 shadow-lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Verifikasi Dokumen Lain
            </Button>
          </Link>
        </div>

        {/* Footer Text */}
        <div className="mt-8 pt-6 border-t border-slate-800/50 text-xs text-slate-600 text-center">
          &copy; {new Date().getFullYear()} AMSAT E-Sign System
        </div>
      </aside>

      {/* Main Content - Document Details */}
      <main className="flex-1 md:ml-[400px] p-6 md:p-12 min-h-screen bg-slate-50/50">
        <div className="max-w-4xl mx-auto space-y-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Detail Dokumen</h1>
              <p className="text-slate-500 mt-1">Informasi lengkap mengenai metadata dokumen.</p>
            </div>
            <Badge variant="outline" className="w-fit px-4 py-1.5 border-slate-300 bg-white shadow-sm text-slate-600 rounded-full font-mono">
              ID: {letterId}
            </Badge>
          </div>

          {/* Document Card */}
          <Card className="border shadow-xl bg-white overflow-hidden rounded-xl">
            <div className="h-1 bg-gradient-to-r from-red-500 to-red-600" />

            <CardContent className="p-8 md:p-10">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 pb-10 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600 mb-1">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Nomor Surat</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 font-mono tracking-tight">{letter.letterNumber}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Tanggal Terbit</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">
                    {format(new Date(letter.letterDate), 'dd MMMM yyyy', { locale: id })}
                  </p>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-10 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded inline-block">Perihal Dokumen</span>
                  <p className="text-2xl font-serif text-slate-800 leading-relaxed italic">
                    "{letter.subject}"
                  </p>
                </div>
              </div>

              {/* Signature Info */}
              {signature && (
                <div className="bg-slate-50 rounded-xl p-8 border border-slate-100 relative overflow-hidden">
                  {/* Watermark/Decoration */}
                  <Shield className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-200/50" />

                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <User className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">Digital Signature Info</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Ditandatangani Oleh</p>
                      <p className="font-bold text-lg text-slate-800">{signature.signerName}</p>
                      {/* Display Signer Job Title */}
                      <p className="text-sm text-slate-500 mt-1">{signer?.jobTitle || 'Anggota Resmi AMSAT'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Waktu Penandatanganan</p>
                      <div className="flex items-center gap-2 text-slate-800">
                        <Clock className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-lg">
                          {format(new Date(signature.signedAt), "HH:mm", { locale: id })} WIB
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {format(new Date(signature.signedAt), "dd MMMM yyyy", { locale: id })}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Instansi / Unit Kerja</p>
                      <p className="font-medium text-slate-800">Organisasi AMSAT</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div className="mt-10 pt-8 border-t border-dashed border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="h-4 w-4 text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Digital Fingerprint (SHA-256)</h4>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-400 break-all leading-relaxed hover:text-slate-200 transition-colors cursor-text selection:bg-red-500 selection:text-white">
                  {letter.contentHash}
                </div>
              </div>

            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="border shadow-sm bg-white hover:shadow-md transition-all group cursor-default">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                  <Paperclip className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Lampiran Dokumen</h3>
                  <p className="text-sm text-slate-500 mb-3">{letter.attachment}</p>
                  <Button variant="link" className="p-0 h-auto text-red-600 hover:text-red-800 pt-1 font-medium">
                    Lihat Lampiran &rarr;
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm bg-white hover:shadow-md transition-all group cursor-default">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Keaslian Terjamin</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Dokumen ini dilindungi secara kriptografi dan tidak dapat disangkal (non-repudiation).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
