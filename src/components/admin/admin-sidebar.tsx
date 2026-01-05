'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import {
  LayoutDashboard,
  FileText,
  Users,
  PenTool,
  Activity,
  LogOut,
  Shield,
  Menu,
  X,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { UserRole } from '@/types';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Surat',
    href: '/admin/letters',
    icon: FileText,
  },
  {
    name: 'Pengguna',
    href: '/admin/users',
    icon: Users,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    name: 'Tanda Tangan',
    href: '/admin/signatures',
    icon: PenTool,
  },
  {
    name: 'Manajemen Kegiatan',
    href: '/admin/events',
    icon: Activity, // Using Activity icon temporarily or maybe Calendar?
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    name: 'Log Aktivitas',
    href: '/admin/logs',
    icon: Activity,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredNavItems = navigationItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Admin';
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.USER:
        return 'Penandatangan';
      default:
        return role;
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white border-r">
      {/* Logo Area */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-rose-700 shadow-md">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent">
            AMSAT e-Sign
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="flex flex-col gap-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 h-12 text-base font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md hover:from-red-700 hover:to-rose-800'
                      : 'hover:bg-red-50 text-slate-600 hover:text-red-700'
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-500 group-hover:text-red-700")} />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout */}
      <div className="border-t p-4 bg-slate-50/50">
        <div className="flex items-center gap-3 w-full mb-4 px-2">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-red-600 to-rose-700 text-white">
              {user ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</span>
            <span className="text-xs text-slate-500 truncate">{user ? getRoleBadge(user.role) : ''}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link href="/admin/profile" className="w-full">
            <Button variant="outline" size="sm" className="w-full justify-center gap-2 border-slate-200 hover:bg-slate-100 hover:text-slate-900">
              <User className="h-4 w-4" />
              Profil
            </Button>
          </Link>
          <Button
            variant="default"
            size="sm"
            className="w-full justify-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 shadow-none"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Navbar */}
      <div className="md:hidden sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900">AMSAT e-Sign</span>
        </Link>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-slate-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r w-72">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
