'use client';

import { useEffect } from 'react';
import { useDataStore } from '@/store/data-store';
import { useAuthStore } from '@/store/auth-store';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Users,
  PenTool,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { LetterStatus, ActivityAction } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { getStats, getLetters, getActivityLogs, fetchUsers, fetchLetters, fetchEvents, fetchLogs } = useDataStore();

  // Fetch data on mount
  useEffect(() => {
    fetchUsers();
    fetchLetters();
    fetchEvents();
    fetchLogs();
  }, [fetchUsers, fetchLetters, fetchEvents, fetchLogs]);

  const stats = getStats();
  const recentLetters = getLetters().slice(0, 5);
  const recentLogs = getActivityLogs().slice(0, 5);

  const getStatusBadge = (status: LetterStatus) => {
    switch (status) {
      case LetterStatus.SIGNED:
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Ditandatangani
          </Badge>
        );
      case LetterStatus.DRAFT:
        return (
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 border">
            <Clock className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        );
      case LetterStatus.INVALID:
        return (
          <Badge variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 border shadow-none">
            <AlertCircle className="mr-1 h-3 w-3" />
            Tidak Valid
          </Badge>
        );
    }
  };

  const getActivityIcon = (action: ActivityAction) => {
    switch (action) {
      case ActivityAction.LOGIN:
      case ActivityAction.LOGOUT:
        return <Activity className="h-4 w-4 text-blue-600" />;
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
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case ActivityAction.FAILED_SECRET_KEY_ATTEMPT:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Selamat datang kembali, <span className="font-semibold text-slate-800">{user?.name}</span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 group-hover:bg-red-700 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Surat
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
                <FileText className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalLetters}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="inline h-3 w-3 mr-1 text-emerald-600" />
                <span className="font-medium text-emerald-600">{stats.draftLetters}</span>
                <span className="ml-1">dalam draft</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 group-hover:bg-emerald-600 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Surat Ditandatangani
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.signedLetters}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.signedLetters / (stats.totalLetters || 1)) * 100)}% penyelesaian
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-600 group-hover:bg-slate-700 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pengguna
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activeUsers} pengguna aktif
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 group-hover:bg-amber-600 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Butuh Perhatian
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.invalidLetters}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Surat tidak valid
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Letters */}
          <Card className="border shadow-md rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Surat Terbaru</CardTitle>
                <CardDescription>Daftar surat yang baru dibuat atau diperbarui</CardDescription>
              </div>
              <Link href="/admin/letters">
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Lihat Semua
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-red-100 hover:bg-red-50/20 transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-white border flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                        <FileText className="h-5 w-5 text-slate-500 group-hover:text-red-600 transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{letter.letterNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">{letter.subject}</p>
                      </div>
                    </div>
                    <div className="pl-4">
                      {getStatusBadge(letter.status)}
                    </div>
                  </div>
                ))}
                {recentLetters.length === 0 && (
                  <div className="text-center py-12 flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-muted-foreground">Belum ada surat yang dibuat</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border shadow-md rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
                <CardDescription>Log aktivitas pengguna dalam sistem</CardDescription>
              </div>
              <Link href="/admin/logs">
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Lihat Semua
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 pl-2">
                {recentLogs.map((log, index) => (
                  <div key={log.id} className="relative flex gap-4">
                    {/* Connector Line */}
                    {index !== recentLogs.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-slate-200" />
                    )}

                    <div className={cn(
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border shadow-sm ring-4 ring-white"
                    )}>
                      {getActivityIcon(log.action)}
                    </div>
                    <div className="flex-1 pt-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-900">{log.userName}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(log.createdAt), "HH:mm", { locale: id })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{log.description}</p>

                    </div>
                  </div>
                ))}
                {recentLogs.length === 0 && (
                  <div className="text-center py-12 flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-muted-foreground">Belum ada aktivitas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
