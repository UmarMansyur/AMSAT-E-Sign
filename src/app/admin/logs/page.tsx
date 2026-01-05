'use client';

import { useState } from 'react';
import { useDataStore } from '@/store/data-store';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Activity,
  LogIn,
  LogOut,
  PenTool,
  FileText,
  Users,
  Key,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ActivityAction } from '@/types';

export default function LogsPage() {
  const { getActivityLogs } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const logs = getActivityLogs();

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: ActivityAction) => {
    switch (action) {
      case ActivityAction.LOGIN:
        return <LogIn className="h-4 w-4 text-blue-600" />;
      case ActivityAction.LOGOUT:
        return <LogOut className="h-4 w-4 text-slate-600" />;
      case ActivityAction.SIGN_LETTER:
        return <PenTool className="h-4 w-4 text-emerald-600" />;
      case ActivityAction.CREATE_LETTER:
      case ActivityAction.UPDATE_LETTER:
      case ActivityAction.DELETE_LETTER:
        return <FileText className="h-4 w-4 text-rose-600" />;
      case ActivityAction.CREATE_USER:
      case ActivityAction.UPDATE_USER:
      case ActivityAction.DELETE_USER:
        return <Users className="h-4 w-4 text-purple-600" />;
      case ActivityAction.RESET_SECRET_KEY:
      case ActivityAction.GENERATE_SECRET_KEY:
        return <Key className="h-4 w-4 text-amber-600" />;
      case ActivityAction.FAILED_SECRET_KEY_ATTEMPT:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-slate-600" />;
    }
  };

  const getActionBadge = (action: ActivityAction) => {
    const configs: Record<ActivityAction, { label: string; className: string }> = {
      [ActivityAction.LOGIN]: { label: 'Login', className: 'bg-blue-50 text-blue-700 border-blue-200 border' },
      [ActivityAction.LOGOUT]: { label: 'Logout', className: 'bg-slate-50 text-slate-700 border-slate-200 border' },
      [ActivityAction.SIGN_LETTER]: { label: 'Tanda Tangan', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 border' },
      [ActivityAction.CREATE_LETTER]: { label: 'Buat Surat', className: 'bg-rose-50 text-rose-700 border-rose-200 border' },
      [ActivityAction.UPDATE_LETTER]: { label: 'Edit Surat', className: 'bg-rose-50 text-rose-700 border-rose-200 border' },
      [ActivityAction.DELETE_LETTER]: { label: 'Hapus Surat', className: 'bg-red-50 text-red-700 border-red-200 border' },
      [ActivityAction.CREATE_USER]: { label: 'Buat User', className: 'bg-purple-50 text-purple-700 border-purple-200 border' },
      [ActivityAction.UPDATE_USER]: { label: 'Edit User', className: 'bg-purple-50 text-purple-700 border-purple-200 border' },
      [ActivityAction.DELETE_USER]: { label: 'Hapus User', className: 'bg-red-50 text-red-700 border-red-200 border' },
      [ActivityAction.RESET_SECRET_KEY]: { label: 'Reset Key', className: 'bg-amber-50 text-amber-700 border-amber-200 border' },
      [ActivityAction.GENERATE_SECRET_KEY]: { label: 'Generate Key', className: 'bg-amber-50 text-amber-700 border-amber-200 border' },
      [ActivityAction.FAILED_SECRET_KEY_ATTEMPT]: { label: 'Gagal Verifikasi', className: 'bg-red-50 text-red-700 border-red-200 border' },
      [ActivityAction.CREATE_EVENT]: {
        label: '',
        className: ''
      },
      [ActivityAction.UPDATE_EVENT]: {
        label: '',
        className: ''
      },
      [ActivityAction.DELETE_EVENT]: {
        label: '',
        className: ''
      },
      [ActivityAction.CLAIM_CERTIFICATE]: {
        label: '',
        className: ''
      }
    };

    const config = configs[action] || { label: action, className: 'bg-slate-50 text-slate-700 border-slate-200 border' };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  // Statistics
  const stats = {
    total: logs.length,
    today: logs.filter((l) => {
      const today = new Date();
      const logDate = new Date(l.createdAt);
      return logDate.toDateString() === today.toDateString();
    }).length,
    signatures: logs.filter((l) => l.action === ActivityAction.SIGN_LETTER).length,
    failed: logs.filter((l) => l.action === ActivityAction.FAILED_SECRET_KEY_ATTEMPT).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Log Aktivitas
          </h1>
          <p className="text-muted-foreground mt-1">
            Pantau semua aktivitas pengguna dalam sistem
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Log
              </CardTitle>
              <Activity className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hari Ini
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.today}</div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tanda Tangan
              </CardTitle>
              <PenTool className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.signatures}</div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gagal Verifikasi
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.failed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border shadow-md rounded-xl overflow-hidden bg-white">
          <CardContent className="p-4 border-b bg-slate-50/50">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan nama atau deskripsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white focus-visible:ring-red-600"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-56 bg-white focus:ring-red-600">
                  <SelectValue placeholder="Filter Aksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Aksi</SelectItem>
                  <SelectItem value={ActivityAction.LOGIN}>Login</SelectItem>
                  <SelectItem value={ActivityAction.LOGOUT}>Logout</SelectItem>
                  <SelectItem value={ActivityAction.SIGN_LETTER}>Tanda Tangan</SelectItem>
                  <SelectItem value={ActivityAction.CREATE_LETTER}>Buat Surat</SelectItem>
                  <SelectItem value={ActivityAction.UPDATE_LETTER}>Edit Surat</SelectItem>
                  <SelectItem value={ActivityAction.DELETE_LETTER}>Hapus Surat</SelectItem>
                  <SelectItem value={ActivityAction.CREATE_USER}>Buat User</SelectItem>
                  <SelectItem value={ActivityAction.UPDATE_USER}>Edit User</SelectItem>
                  <SelectItem value={ActivityAction.RESET_SECRET_KEY}>Reset Secret Key</SelectItem>
                  <SelectItem value={ActivityAction.FAILED_SECRET_KEY_ATTEMPT}>Gagal Verifikasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Waktu</TableHead>
                  <TableHead className="font-semibold text-slate-700">Pengguna</TableHead>
                  <TableHead className="font-semibold text-slate-700">Aksi</TableHead>
                  <TableHead className="font-semibold text-slate-700">Deskripsi</TableHead>
                  <TableHead className="font-semibold text-slate-700">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-red-50/20 transition-colors">
                    <TableCell className="whitespace-nowrap text-slate-600">
                      {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{log.userName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        {getActionBadge(log.action)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-slate-600">
                      {log.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {log.ipAddress || '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Shield className="h-8 w-8 text-slate-300" />
                        <p>Tidak ada log aktivitas ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
