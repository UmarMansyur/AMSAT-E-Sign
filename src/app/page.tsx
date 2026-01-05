'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDataStore } from '@/store/data-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Search,
  QrCode,
  CheckCircle2,
  ArrowRight,
  LogIn,
  Zap,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { LetterStatus } from '@/types';

export default function LandingPage() {
  const router = useRouter();
  const { getLetters } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      toast.error('Masukkan nomor surat atau ID dokumen');
      return;
    }

    // Search by letter number or ID
    const letters = getLetters();
    const letter = letters.find(
      (l) =>
        l.letterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.id === searchQuery
    );

    if (letter) {
      router.push(`/verify/${letter.id}`);
    } else {
      toast.error('Dokumen tidak ditemukan');
    }
  };

  const handleQRScan = () => {
    toast.info('Fitur scan QR Code akan segera hadir');
  };

  // Stats
  const letters = getLetters();
  const stats = {
    total: letters.length,
    signed: letters.filter((l) => l.status === LetterStatus.SIGNED).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Background decoration - subtle patterns */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b bg-white/80 backdrop-blur-md sticky top-0">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 shadow-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">AMSAT E-Sign</span>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-red-600 hover:bg-red-50 font-medium">
                <LogIn className="mr-2 h-4 w-4" />
                Login Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-6 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-4 py-1.5 text-sm font-medium rounded-full">
              Sistem Verifikasi Dokumen Resmi
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
              Portal Validasi & <br />
              <span className="text-red-600">Tanda Tangan Elektronik</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Platform resmi milik Organisasi AMSAT untuk penerbitan dan verifikasi keaslian dokumen digital secara terpusat dan aman.
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-12 mb-12 border-y py-6 bg-white/50 backdrop-blur-sm max-w-lg mx-auto rounded-xl">
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-slate-900">
                  {mounted ? stats.total : '-'}
                </div>
                <div className="text-slate-500 text-sm font-medium mt-1">Dokumen Terbit</div>
              </div>
              <div className="w-px bg-slate-200" />
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-slate-900">
                  {mounted ? stats.signed : '-'}
                </div>
                <div className="text-slate-500 text-sm font-medium mt-1">Dokumen Tervalidasi</div>
              </div>
            </div>
          </div>

          {/* Verification Card */}
          <Card className="max-w-2xl mx-auto border shadow-xl bg-white relative overflow-hidden ring-1 ring-slate-900/5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-700" />
            <CardHeader className="text-center pb-2 pt-8">
              <CardTitle className="text-2xl font-bold text-slate-800">
                Cek Keaslian Dokumen
              </CardTitle>
              <CardDescription>
                Verifikasi integritas dokumen AMSAT secara real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <Tabs defaultValue="search" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-slate-100 rounded-lg">
                  <TabsTrigger
                    value="search"
                    className="gap-2 data-[state=active]:bg-white data-[state=active]:text-red-700 data-[state=active]:shadow-sm rounded-md transition-all font-medium text-slate-600"
                  >
                    <Search className="h-4 w-4" />
                    Nomor Surat
                  </TabsTrigger>
                  <TabsTrigger
                    value="qr"
                    className="gap-2 data-[state=active]:bg-white data-[state=active]:text-red-700 data-[state=active]:shadow-sm rounded-md transition-all font-medium text-slate-600"
                  >
                    <QrCode className="h-4 w-4" />
                    Scan QR Code
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="mt-0">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="search" className="sr-only">Nomor Surat</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Masukkan Nomor Surat / ID Dokumen..."
                          className="h-12 pl-10 text-lg border-slate-200 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium shadow-md shadow-red-600/20 transition-all hover:shadow-lg hover:shadow-red-600/30 text-base"
                    >
                      Verifikasi Dokumen
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>

                  {/* Quick Links Demo - Keep but style less prominently */}
                  <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <span className="text-xs text-slate-400 mb-3 block font-medium uppercase tracking-wider">Contoh Dokumen Demo</span>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/verify/letter-001')}
                        className="bg-slate-50 text-slate-600 border-slate-200 hover:bg-white hover:text-red-600 hover:border-red-200 text-xs h-9 transition-colors"
                      >
                        001/SK/I/2024
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/verify/letter-002')}
                        className="bg-slate-50 text-slate-600 border-slate-200 hover:bg-white hover:text-red-600 hover:border-red-200 text-xs h-9 transition-colors"
                      >
                        002/SPT/I/2024
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="qr" className="mt-0">
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <QrCode className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 mb-6 font-medium px-4">
                      Gunakan kamera untuk memindai QR Code yang tertera pada dokumen fisik.
                    </p>
                    <Button onClick={handleQRScan} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                      <QrCode className="mr-2 h-4 w-4" />
                      Aktifkan Kamera
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* System Features Section - More technical/official */}
        <section className="bg-white border-t border-slate-200 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-slate-900">Standar Keamanan Dokumen</h2>
              <p className="text-slate-500 mt-2">Sistem ini mematuhi standar keamanan digital terkini</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Enkripsi SHA-256",
                  desc: "Setiap dokumen dilindungi dengan algoritma hashing standar industri untuk menjamin integritas data.",
                  icon: ShieldCheck
                },
                {
                  title: "Verifikasi Real-time",
                  desc: "Status validitas dokumen dapat diperiksa kapan saja melalui database pusat yang aman.",
                  icon: Clock
                },
                {
                  title: "Audit Trail Digital",
                  desc: "Pencatatan riwayat dokumen yang transparan dan tidak dapat dimanipulasi.",
                  icon: Zap
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center mb-5 shadow-sm">
                    <item.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 border border-slate-700">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white leading-none">AMSAT E-Sign</span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-1">Sistem Resmi</span>
              </div>
            </div>
            <div className="text-center md:text-right text-sm">
              <p className="mb-1">&copy; {new Date().getFullYear()} AMSAT E-Sign. All rights reserved.</p>
              <p className="text-xs text-slate-600">Sistem ini dikelola secara eksklusif oleh AMSAT dan tidak diperjualbelikan.</p>
            </div>
          </div>
        </div>
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}
