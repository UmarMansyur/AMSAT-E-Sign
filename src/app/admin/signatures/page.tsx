'use client';

import { useState } from 'react';
import { useDataStore } from '@/store/data-store';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Search,
  PenTool,
  Eye,
  FileText,
  CheckCircle2,
  User,
  Clock,
  Hash,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Signature } from '@/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SignaturesPage() {
  const { getSignatures, getLetterById, getLetters } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<Signature | null>(null);

  const signatures = getSignatures();
  const letters = getLetters();

  // Get pending letters (draft status)
  const pendingLetters = letters.filter((l) => l.status === 'draft');

  const filteredSignatures = signatures.filter((sig) => {
    const letter = getLetterById(sig.letterId);
    return (
      sig.signerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (letter?.letterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );
  });

  const openViewDialog = (signature: Signature) => {
    setSelectedSignature(signature);
    setIsViewDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Tanda Tangan Elektronik
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola dan lihat riwayat tanda tangan dokumen
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border shadow-sm hover:shadow-md transition-all relative overflow-hidden bg-white">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tanda Tangan
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <PenTool className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{signatures.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Dokumen yang telah ditandatangani
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-all relative overflow-hidden bg-white">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Menunggu Tanda Tangan
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{pendingLetters.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Surat dalam status draft
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-all relative overflow-hidden bg-white">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Dokumen
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
                <FileText className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{letters.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Semua dokumen dalam sistem
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Letters */}
        {pendingLetters.length > 0 && (
          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-l-amber-500 rounded-r-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                <Clock className="h-5 w-5 text-amber-600" />
                Surat Menunggu Tanda Tangan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pendingLetters.slice(0, 6).map((letter) => (
                  <div
                    key={letter.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white border border-amber-100 hover:border-amber-300 hover:shadow-sm transition-all group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-amber-950 truncate">{letter.letterNumber}</p>
                      <p className="text-xs text-amber-700/80 truncate">{letter.subject}</p>
                    </div>
                    <Link href={`/admin/signatures/sign/${letter.id}`}>
                      <Button size="icon" variant="ghost" className="shrink-0 h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100">
                        <PenTool className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              {pendingLetters.length > 6 && (
                <Link href="/admin/letters?status=draft" className="block mt-4">
                  <Button variant="ghost" className="w-full text-amber-700 hover:bg-amber-100/50 hover:text-amber-800">
                    Lihat Semua ({pendingLetters.length} surat)
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <Card className="border shadow-md rounded-xl overflow-hidden bg-white">
          <CardContent className="p-4 border-b bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama penandatangan atau nomor surat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white focus-visible:ring-red-600"
              />
            </div>
          </CardContent>

          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Nomor Surat</TableHead>
                  <TableHead className="font-semibold text-slate-700">Perihal</TableHead>
                  <TableHead className="font-semibold text-slate-700">Penandatangan</TableHead>
                  <TableHead className="font-semibold text-slate-700">Waktu Tanda Tangan</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSignatures.map((sig) => {
                  const letter = getLetterById(sig.letterId);
                  return (
                    <TableRow key={sig.id} className="hover:bg-red-50/20 transition-colors">
                      <TableCell className="font-medium text-slate-900">
                        {letter?.letterNumber || '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-slate-600">
                        {letter?.subject || '-'}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{sig.signerName}</TableCell>
                      <TableCell className="text-slate-500">
                        {format(new Date(sig.signedAt), "dd MMM yyyy, HH:mm", { locale: id })}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-none hover:bg-emerald-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Valid
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewDialog(sig)}
                          className="h-8 w-8 hover:bg-slate-100"
                        >
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredSignatures.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <PenTool className="h-8 w-8 text-slate-300" />
                        <p>Tidak ada tanda tangan ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-800">
                <PenTool className="h-5 w-5 text-red-600" />
                Detail Tanda Tangan
              </DialogTitle>
            </DialogHeader>
            {selectedSignature && (
              <div className="space-y-4 py-4">
                {(() => {
                  const letter = getLetterById(selectedSignature.letterId);
                  return (
                    <>
                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          <span className="font-semibold text-emerald-700">
                            Tanda Tangan Valid
                          </span>
                        </div>
                        <p className="text-sm text-emerald-600">
                          Dokumen ini telah ditandatangani secara elektronik dan terverifikasi.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <FileText className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs uppercase tracking-wide">Nomor Surat</Label>
                            <p className="font-medium text-slate-900">{letter?.letterNumber || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <User className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs uppercase tracking-wide">Penandatangan</Label>
                            <p className="font-medium text-slate-900">{selectedSignature.signerName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <Clock className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs uppercase tracking-wide">Waktu Tanda Tangan</Label>
                            <p className="font-medium text-slate-900">
                              {format(new Date(selectedSignature.signedAt), "dd MMMM yyyy, HH:mm:ss", { locale: id })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <PenTool className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs uppercase tracking-wide">Perihal Surat</Label>
                            <p className="font-medium text-slate-900">{letter?.subject || '-'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="h-4 w-4 text-slate-500" />
                          <Label className="text-muted-foreground text-xs uppercase tracking-wide">Hash Tanda Tangan (SHA-256)</Label>
                        </div>
                        <p className="font-mono text-xs bg-slate-100 border p-3 rounded-md break-all text-slate-600">
                          {selectedSignature.contentHash}
                        </p>
                      </div>

                      {selectedSignature.metadata && (
                        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-slate-50 border rounded-md">
                          {selectedSignature.metadata.ipAddress && (
                            <p>IP Address: {selectedSignature.metadata.ipAddress}</p>
                          )}
                          {selectedSignature.metadata.userAgent && (
                            <p className="truncate">User Agent: {selectedSignature.metadata.userAgent}</p>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)} className="bg-slate-900 hover:bg-slate-800">
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
