'use client';

import { useState } from 'react';
import { useDataStore } from '@/store/data-store';
import { useAuthStore } from '@/store/auth-store';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Search,
  Plus,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import { Event, ActivityAction } from '@/types';
import Link from 'next/link';

export default function EventsPage() {
  const { user: currentUser } = useAuthStore();
  const { getEvents, addEvent, updateEvent, deleteEvent, addActivityLog } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    claimDeadline: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    templateUrl: 'https://placehold.co/800x600/png?text=Sertifikat+Template',
    nameX: 400,
    nameY: 300,
    nameFontSize: 24,
    qrX: 650,
    qrY: 450,
    qrSize: 100,
  });

  const events = getEvents();

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEvent = () => {
    if (!formData.name) {
      toast.error('Nama kegiatan harus diisi');
      return;
    }

    try {
      const newEvent = addEvent(formData, currentUser!.id);

      addActivityLog({
        userId: currentUser!.id,
        userName: currentUser!.name,
        action: ActivityAction.CREATE_EVENT,
        description: `Membuat kegiatan baru: ${newEvent.name}`,
        metadata: { eventId: newEvent.id },
      });

      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        claimDeadline: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        templateUrl: 'https://placehold.co/800x600/png?text=Sertifikat+Template',
        nameX: 400,
        nameY: 300,
        nameFontSize: 24,
        qrX: 650,
        qrY: 450,
        qrSize: 100,
      });
      toast.success('Kegiatan berhasil ditambahkan');
    } catch {
      toast.error('Gagal menambahkan kegiatan');
    }
  };

  const handleEditEvent = () => {
    if (!selectedEvent) return;

    try {
      updateEvent(selectedEvent.id, {
        name: formData.name,
        date: new Date(formData.date),
        claimDeadline: new Date(formData.claimDeadline),
        templateUrl: formData.templateUrl,
        templateConfig: {
          nameX: Number(formData.nameX),
          nameY: Number(formData.nameY),
          nameFontSize: Number(formData.nameFontSize),
          qrX: Number(formData.qrX),
          qrY: Number(formData.qrY),
          qrSize: Number(formData.qrSize),
        },
      });

      addActivityLog({
        userId: currentUser!.id,
        userName: currentUser!.name,
        action: ActivityAction.UPDATE_EVENT,
        description: `Memperbarui kegiatan: ${formData.name}`,
        metadata: { eventId: selectedEvent.id },
      });

      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      toast.success('Kegiatan berhasil diperbarui');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui kegiatan');
    }
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;

    try {
      deleteEvent(selectedEvent.id);

      addActivityLog({
        userId: currentUser!.id,
        userName: currentUser!.name,
        action: ActivityAction.DELETE_EVENT,
        description: `Menghapus kegiatan: ${selectedEvent.name}`,
        metadata: { deletedEventId: selectedEvent.id },
      });

      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
      toast.success('Kegiatan berhasil dihapus');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus kegiatan');
    }
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      name: event.name,
      date: format(new Date(event.date), 'yyyy-MM-dd'),
      claimDeadline: format(new Date(event.claimDeadline), 'yyyy-MM-dd'),
      templateUrl: event.templateUrl || '',
      nameX: event.templateConfig.nameX,
      nameY: event.templateConfig.nameY,
      nameFontSize: event.templateConfig.nameFontSize,
      qrX: event.templateConfig.qrX,
      qrY: event.templateConfig.qrY,
      qrSize: event.templateConfig.qrSize,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Manajemen Kegiatan
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola kegiatan dan penerbitan sertifikat elektronik
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 shadow-md transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Buat Kegiatan Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Buat Kegiatan Baru</DialogTitle>
                <DialogDescription>
                  Isi data kegiatan untuk penerbitan sertifikat.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Kegiatan *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Seminar Nasional TTE"
                      className="focus-visible:ring-red-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal Kegiatan *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="focus-visible:ring-red-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claimDeadline">Batas Akhir Klaim Sertifikat *</Label>
                  <Input
                    id="claimDeadline"
                    type="date"
                    value={formData.claimDeadline}
                    onChange={(e) => setFormData({ ...formData, claimDeadline: e.target.value })}
                    className="focus-visible:ring-red-600"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Konfigurasi Template Sertifikat
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="templateUrl">URL Template Gambar (Background)</Label>
                    <Input
                      id="templateUrl"
                      value={formData.templateUrl}
                      onChange={(e) => setFormData({ ...formData, templateUrl: e.target.value })}
                      placeholder="https://example.com/certificate-template.png"
                      className="focus-visible:ring-red-600"
                    />
                    <p className="text-xs text-muted-foreground">URL gambar kosong yang akan dijadikan background sertifikat.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                      <h4 className="font-medium text-sm">Posisi Nama Peserta</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="nameX" className="text-xs">Posisi X</Label>
                          <Input
                            id="nameX"
                            type="number"
                            value={formData.nameX}
                            onChange={(e) => setFormData({ ...formData, nameX: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="nameY" className="text-xs">Posisi Y</Label>
                          <Input
                            id="nameY"
                            type="number"
                            value={formData.nameY}
                            onChange={(e) => setFormData({ ...formData, nameY: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-1 col-span-2">
                          <Label htmlFor="nameFontSize" className="text-xs">Ukuran Font</Label>
                          <Input
                            id="nameFontSize"
                            type="number"
                            value={formData.nameFontSize}
                            onChange={(e) => setFormData({ ...formData, nameFontSize: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                      <h4 className="font-medium text-sm">Posisi QR Code</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="qrX" className="text-xs">Posisi X</Label>
                          <Input
                            id="qrX"
                            type="number"
                            value={formData.qrX}
                            onChange={(e) => setFormData({ ...formData, qrX: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="qrY" className="text-xs">Posisi Y</Label>
                          <Input
                            id="qrY"
                            type="number"
                            value={formData.qrY}
                            onChange={(e) => setFormData({ ...formData, qrY: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-1 col-span-2">
                          <Label htmlFor="qrSize" className="text-xs">Ukuran QR (px)</Label>
                          <Input
                            id="qrSize"
                            type="number"
                            value={formData.qrSize}
                            onChange={(e) => setFormData({ ...formData, qrSize: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAddEvent} className="bg-red-600 hover:bg-red-700">
                  Buat Kegiatan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="border shadow-md rounded-xl overflow-hidden bg-white">
          <CardContent className="p-4 border-b bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama kegiatan..."
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
                  <TableHead className="font-semibold text-slate-700">Nama Kegiatan</TableHead>
                  <TableHead className="font-semibold text-slate-700">Tanggal</TableHead>
                  <TableHead className="font-semibold text-slate-700">Batas Klaim</TableHead>
                  <TableHead className="font-semibold text-slate-700">Link Klaim</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id} className="hover:bg-red-50/30 transition-colors">
                    <TableCell className="font-medium text-slate-900">{event.name}</TableCell>
                    <TableCell className="text-slate-500">
                      {format(new Date(event.date), 'dd MMMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {format(new Date(event.claimDeadline), 'dd MMMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/events/${event.id}/claim`}
                        target="_blank"
                        className="text-red-600 hover:underline flex items-center gap-1 text-sm font-medium"
                      >
                        Link Klaim <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(event)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openDeleteDialog(event)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEvents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="h-8 w-8 text-slate-300" />
                        <p>Tidak ada kegiatan ditemukan</p>
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
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Kegiatan</DialogTitle>
              <DialogDescription>
                Perbarui data kegiatan.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nama Kegiatan *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="focus-visible:ring-red-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Tanggal Kegiatan *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="focus-visible:ring-red-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-claimDeadline">Batas Akhir Klaim Sertifikat *</Label>
                <Input
                  id="edit-claimDeadline"
                  type="date"
                  value={formData.claimDeadline}
                  onChange={(e) => setFormData({ ...formData, claimDeadline: e.target.value })}
                  className="focus-visible:ring-red-600"
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Konfigurasi Template Sertifikat
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="edit-templateUrl">URL Template Gambar (Background)</Label>
                  <Input
                    id="edit-templateUrl"
                    value={formData.templateUrl}
                    onChange={(e) => setFormData({ ...formData, templateUrl: e.target.value })}
                    className="focus-visible:ring-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                    <h4 className="font-medium text-sm">Posisi Nama Peserta</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="edit-nameX" className="text-xs">Posisi X</Label>
                        <Input
                          id="edit-nameX"
                          type="number"
                          value={formData.nameX}
                          onChange={(e) => setFormData({ ...formData, nameX: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="edit-nameY" className="text-xs">Posisi Y</Label>
                        <Input
                          id="edit-nameY"
                          type="number"
                          value={formData.nameY}
                          onChange={(e) => setFormData({ ...formData, nameY: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label htmlFor="edit-nameFontSize" className="text-xs">Ukuran Font</Label>
                        <Input
                          id="edit-nameFontSize"
                          type="number"
                          value={formData.nameFontSize}
                          onChange={(e) => setFormData({ ...formData, nameFontSize: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                    <h4 className="font-medium text-sm">Posisi QR Code</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="edit-qrX" className="text-xs">Posisi X</Label>
                        <Input
                          id="edit-qrX"
                          type="number"
                          value={formData.qrX}
                          onChange={(e) => setFormData({ ...formData, qrX: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="edit-qrY" className="text-xs">Posisi Y</Label>
                        <Input
                          id="edit-qrY"
                          type="number"
                          value={formData.qrY}
                          onChange={(e) => setFormData({ ...formData, qrY: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label htmlFor="edit-qrSize" className="text-xs">Ukuran QR (px)</Label>
                        <Input
                          id="edit-qrSize"
                          type="number"
                          value={formData.qrSize}
                          onChange={(e) => setFormData({ ...formData, qrSize: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleEditEvent} className="bg-red-600 hover:bg-red-700">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Hapus Kegiatan
              </DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus kegiatan <span className="font-semibold text-slate-900">{selectedEvent?.name}</span>?
                Semua data klaim sertifikat terkait juga akan dihapus.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleDeleteEvent} variant="destructive" className="bg-red-600 hover:bg-red-700">
                Ya, Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}
