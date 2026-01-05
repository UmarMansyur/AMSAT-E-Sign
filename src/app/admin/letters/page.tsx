'use client';

import { useState } from 'react';
import { useDataStore } from '@/store/data-store';
import { useAuthStore } from '@/store/auth-store';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  PenTool,
  Eye,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { LetterStatus, Letter, ActivityAction } from '@/types';
import Link from 'next/link';

export default function LettersPage() {
  const { user: currentUser } = useAuthStore();
  const { getLetters, addLetter, updateLetter, deleteLetter, addActivityLog, generateQRCode } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  const [formData, setFormData] = useState({
    letterNumber: '',
    letterDate: '',
    subject: '',
    attachment: '',
    content: '',
  });

  const letters = getLetters();

  const filteredLetters = letters.filter((letter) => {
    const matchesSearch =
      letter.letterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || letter.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: LetterStatus) => {
    switch (status) {
      case LetterStatus.SIGNED:
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Ditandatangani
          </Badge>
        );
      case LetterStatus.DRAFT:
        return (
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200">
            <Clock className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        );
      case LetterStatus.INVALID:
        return (
          <Badge variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-none">
            <AlertCircle className="mr-1 h-3 w-3" />
            Tidak Valid
          </Badge>
        );
    }
  };

  const handleAddLetter = () => {
    if (!formData.letterNumber || !formData.letterDate || !formData.subject) {
      toast.error('Nomor surat, tanggal, dan hal harus diisi');
      return;
    }

    try {
      const newLetter = addLetter({
        letterNumber: formData.letterNumber,
        letterDate: new Date(formData.letterDate),
        subject: formData.subject,
        attachment: formData.attachment || '-',
        content: formData.content,
        createdById: currentUser!.id,
      });

      addActivityLog({
        userId: currentUser!.id,
        userName: currentUser!.name,
        action: ActivityAction.CREATE_LETTER,
        description: `Membuat surat baru: ${formData.letterNumber}`,
        metadata: { letterId: newLetter.id, letterNumber: formData.letterNumber },
      });

      setIsAddDialogOpen(false);
      setFormData({
        letterNumber: '',
        letterDate: '',
        subject: '',
        attachment: '',
        content: '',
      });
      toast.success('Surat berhasil ditambahkan');
    } catch {
      toast.error('Gagal menambahkan surat');
    }
  };

  const handleEditLetter = () => {
    if (!selectedLetter) return;

    try {
      updateLetter(selectedLetter.id, {
        letterNumber: formData.letterNumber,
        letterDate: new Date(formData.letterDate),
        subject: formData.subject,
        attachment: formData.attachment || '-',
        content: formData.content,
      });

      addActivityLog({
        userId: currentUser!.id,
        userName: currentUser!.name,
        action: ActivityAction.UPDATE_LETTER,
        description: `Memperbarui surat: ${formData.letterNumber}`,
        metadata: { letterId: selectedLetter.id },
      });

      setIsEditDialogOpen(false);
      setSelectedLetter(null);
      toast.success('Surat berhasil diperbarui');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui surat');
    }
  };

  const handleDeleteLetter = () => {
    if (!selectedLetter) return;

    try {
      deleteLetter(selectedLetter.id);

      addActivityLog({
        userId: currentUser!.id,
        userName: currentUser!.name,
        action: ActivityAction.DELETE_LETTER,
        description: `Menghapus surat: ${selectedLetter.letterNumber}`,
        metadata: { deletedLetterId: selectedLetter.id },
      });

      setIsDeleteDialogOpen(false);
      setSelectedLetter(null);
      toast.success('Surat berhasil dihapus');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus surat');
    }
  };

  const openEditDialog = (letter: Letter) => {
    setSelectedLetter(letter);
    setFormData({
      letterNumber: letter.letterNumber,
      letterDate: format(new Date(letter.letterDate), 'yyyy-MM-dd'),
      subject: letter.subject,
      attachment: letter.attachment,
      content: letter.content || '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (letter: Letter) => {
    setSelectedLetter(letter);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (letter: Letter) => {
    setSelectedLetter(letter);
    setIsDeleteDialogOpen(true);
  };

  const downloadQRCode = async (letter: Letter) => {
    try {
      // Generate QR code on-demand if not exists
      const qrCodeUrl = await generateQRCode(letter.id);

      // Convert data URL to Blob for proper download
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${letter.letterNumber.replace(/\//g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('QR Code berhasil diunduh');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengunduh QR Code');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Manajemen Surat
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola surat dan dokumen elektronik
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 shadow-md transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Buat Surat Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Buat Surat Baru</DialogTitle>
                <DialogDescription>
                  Isi data surat baru. Surat akan disimpan sebagai draft.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="letterNumber">Nomor Surat *</Label>
                    <Input
                      id="letterNumber"
                      value={formData.letterNumber}
                      onChange={(e) => setFormData({ ...formData, letterNumber: e.target.value })}
                      placeholder="001/SK/I/2024"
                      className="focus-visible:ring-red-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="letterDate">Tanggal Surat *</Label>
                    <Input
                      id="letterDate"
                      type="date"
                      value={formData.letterDate}
                      onChange={(e) => setFormData({ ...formData, letterDate: e.target.value })}
                      className="focus-visible:ring-red-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Hal / Perihal *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Surat Keterangan Kerja"
                    className="focus-visible:ring-red-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attachment">Lampiran</Label>
                  <Input
                    id="attachment"
                    value={formData.attachment}
                    onChange={(e) => setFormData({ ...formData, attachment: e.target.value })}
                    placeholder="1 (satu) berkas"
                    className="focus-visible:ring-red-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Isi Surat (Opsional)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Konten isi surat..."
                    rows={4}
                    className="focus-visible:ring-red-600"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAddLetter} className="bg-red-600 hover:bg-red-700">
                  Simpan Draft
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="border shadow-md rounded-xl overflow-hidden bg-white">
          <CardContent className="p-4 border-b bg-slate-50/50">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor surat atau perihal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white focus-visible:ring-red-600"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white focus:ring-red-600">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value={LetterStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={LetterStatus.SIGNED}>Ditandatangani</SelectItem>
                  <SelectItem value={LetterStatus.INVALID}>Tidak Valid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Nomor Surat</TableHead>
                  <TableHead className="font-semibold text-slate-700">Tanggal</TableHead>
                  <TableHead className="font-semibold text-slate-700">Perihal</TableHead>
                  <TableHead className="font-semibold text-slate-700">Lampiran</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLetters.map((letter) => (
                  <TableRow key={letter.id} className="hover:bg-red-50/30 transition-colors">
                    <TableCell className="font-medium text-slate-900">{letter.letterNumber}</TableCell>
                    <TableCell className="text-slate-500">
                      {format(new Date(letter.letterDate), 'dd MMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-slate-700">{letter.subject}</TableCell>
                    <TableCell className="text-slate-500">{letter.attachment}</TableCell>
                    <TableCell>{getStatusBadge(letter.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          <DropdownMenuItem onClick={() => openViewDialog(letter)}>
                            <Eye className="mr-2 h-4 w-4 text-slate-500" />
                            Lihat Detail
                          </DropdownMenuItem>
                          {letter.status === LetterStatus.DRAFT && (
                            <>
                              <DropdownMenuItem onClick={() => openEditDialog(letter)}>
                                <Edit className="mr-2 h-4 w-4 text-slate-500" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/signatures/sign/${letter.id}`} className="flex items-center">
                                  <PenTool className="mr-2 h-4 w-4 text-slate-500" />
                                  Tanda Tangani
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                          {letter.status === LetterStatus.SIGNED && (
                            <>
                              <DropdownMenuItem onClick={() => downloadQRCode(letter)}>
                                <QrCode className="mr-2 h-4 w-4 text-slate-500" />
                                Unduh QR Code
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/verify/${letter.id}`} target="_blank" className="flex items-center">
                                  <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                  Halaman Verifikasi
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          {letter.status !== LetterStatus.SIGNED && (
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => openDeleteDialog(letter)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLetters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-slate-300" />
                        <p>Tidak ada surat ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Surat</DialogTitle>
              <DialogDescription>
                Perbarui data surat di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-letterNumber">Nomor Surat *</Label>
                  <Input
                    id="edit-letterNumber"
                    value={formData.letterNumber}
                    onChange={(e) => setFormData({ ...formData, letterNumber: e.target.value })}
                    className="focus-visible:ring-red-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-letterDate">Tanggal Surat *</Label>
                  <Input
                    id="edit-letterDate"
                    type="date"
                    value={formData.letterDate}
                    onChange={(e) => setFormData({ ...formData, letterDate: e.target.value })}
                    className="focus-visible:ring-red-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Hal / Perihal *</Label>
                <Input
                  id="edit-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="focus-visible:ring-red-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-attachment">Lampiran</Label>
                <Input
                  id="edit-attachment"
                  value={formData.attachment}
                  onChange={(e) => setFormData({ ...formData, attachment: e.target.value })}
                  className="focus-visible:ring-red-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Isi Surat (Opsional)</Label>
                <Textarea
                  id="edit-content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="focus-visible:ring-red-600"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleEditLetter} className="bg-red-600 hover:bg-red-700">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-800">
                <FileText className="h-5 w-5 text-red-600" />
                Detail Surat
              </DialogTitle>
            </DialogHeader>
            {selectedLetter && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Nomor Surat</Label>
                    <p className="font-medium text-slate-900 mt-1">{selectedLetter.letterNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Tanggal</Label>
                    <p className="font-medium text-slate-900 mt-1">
                      {format(new Date(selectedLetter.letterDate), 'dd MMMM yyyy', { locale: id })}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Perihal</Label>
                  <p className="font-medium text-slate-900 mt-1">{selectedLetter.subject}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Lampiran</Label>
                  <p className="font-medium text-slate-900 mt-1">{selectedLetter.attachment}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedLetter.status)}</div>
                </div>
                {selectedLetter.content && (
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Isi Surat</Label>
                    <div className="font-medium whitespace-pre-wrap bg-slate-50 border border-slate-100 p-4 rounded-lg mt-2 text-sm leading-relaxed text-slate-700">
                      {selectedLetter.content}
                    </div>
                  </div>
                )}
                {selectedLetter.contentHash && (
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Hash Dokumen</Label>
                    <p className="font-mono text-xs bg-slate-100 border p-2 rounded-md mt-1 break-all text-slate-600">
                      {selectedLetter.contentHash}
                    </p>
                  </div>
                )}
                {selectedLetter.qrCodeUrl && (
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">QR Code Verifikasi</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="p-2 border rounded-lg bg-white shadow-sm">
                        <img
                          src={selectedLetter.qrCodeUrl}
                          alt="QR Code"
                          className="h-32 w-32"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadQRCode(selectedLetter)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Unduh QR
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)} className="bg-slate-900 hover:bg-slate-800">
                Tutup
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
                Hapus Surat
              </DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus surat <span className="font-semibold text-slate-900">{selectedLetter?.letterNumber}</span>?
                Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDeleteLetter} className="bg-red-600 hover:bg-red-700">
                Hapus Surat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
