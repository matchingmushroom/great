'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { 
  Home, 
  Package, 
  ShoppingBag, 
  Briefcase, 
  LineChart, 
  Users, 
  DollarSign, 
  TrendingDown,
  UserCheck, 
  Warehouse, 
  FileSpreadsheet, 
  LogOut, 
  Menu, 
  X,
  Lock
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout, isAdmin, isManager } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-stone-500 font-medium select-none">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        Authenticating session security...
      </div>
    );
  }

  // Sidebar navigation options with roles
  const menuItems = [
    { name: 'Dashboard Home', path: '/dashboard', icon: Home, roles: ['Admin', 'Manager', 'Staff'] },
    { name: 'Products Menu', path: '/dashboard/products', icon: Package, roles: ['Admin', 'Manager'] },
    { name: 'Sales & POS', path: '/dashboard/sales', icon: FileSpreadsheet, roles: ['Admin', 'Manager', 'Staff'] },
    { name: 'Vendor Purchases', path: '/dashboard/purchases', icon: ShoppingBag, roles: ['Admin', 'Manager'] },
    { name: 'Inventory Stock', path: '/dashboard/inventory', icon: Warehouse, roles: ['Admin', 'Manager', 'Staff'] },
    { name: 'Business Expenses', path: '/dashboard/expenses', icon: TrendingDown, roles: ['Admin', 'Manager', 'Staff'] },
    { name: 'Debtors Ledger', path: '/dashboard/debtors', icon: DollarSign, roles: ['Admin', 'Manager'] },
    { name: 'Creditors Ledger', path: '/dashboard/creditors', icon: Briefcase, roles: ['Admin', 'Manager'] },
    { name: 'Web Catalog Orders', path: '/dashboard/orders', icon: UserCheck, roles: ['Admin', 'Manager', 'Staff'] },
    { name: 'Human Resources', path: '/dashboard/hr', icon: Users, roles: ['Admin', 'Manager'] },
    { name: 'Financial Reports', path: '/dashboard/reports', icon: LineChart, roles: ['Admin', 'Manager'] },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Check if current route is allowed. If not, redirect or render Lock screen
  const currentRouteItem = menuItems.find(item => item.path === pathname);
  const isAuthorized = currentRouteItem ? currentRouteItem.roles.includes(user.role) : true;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row select-none">
      
      {/* MOBILE HEADER */}
      <header className="bg-primary text-white p-4 flex md:hidden justify-between items-center sticky top-0 z-30 shadow-md">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary text-primary font-black flex items-center justify-center text-sm">
            G
          </div>
          <span className="font-extrabold text-sm tracking-tight">GPT Panel</span>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 hover:bg-primary-dark rounded-lg"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* SIDEBAR NAVIGATION (Desktop & Mobile drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-primary text-stone-100 flex flex-col z-40 transform transition-transform duration-350 ease-in-out md:relative md:transform-none shadow-xl border-r border-primary-dark/40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Logo and Brand */}
        <div className="p-6 border-b border-primary-dark/80 bg-primary-dark/30 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-secondary text-primary font-black flex items-center justify-center text-lg">
              G
            </div>
            <div>
              <h2 className="font-black text-sm tracking-tight text-white leading-none">GPT Console</h2>
              <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">Nepal Office</span>
            </div>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 hover:bg-primary-dark rounded-lg md:hidden text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-5 py-4 border-b border-primary-dark/60 bg-primary-dark/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/25 border border-secondary/30 flex items-center justify-center font-bold text-secondary text-sm">
            {user.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-xs truncate text-white">{user.name}</p>
            <span className="inline-block bg-secondary text-white font-extrabold text-[8px] px-2 py-0.5 rounded-full mt-0.5 uppercase tracking-wider">
              {user.role}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1.5">
          {menuItems.map((item) => {
            const hasRoleAccess = item.roles.includes(user.role);
            if (!hasRoleAccess) return null; // Hide restricted pages in sidebar

            const Icon = item.icon;
            const active = pathname === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all
                  ${active 
                    ? 'bg-secondary text-white shadow-md shadow-secondary/15 font-bold' 
                    : 'text-stone-300 hover:text-white hover:bg-primary-dark/40'
                  }
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-stone-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-primary-dark/80 bg-primary-dark/15">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-stone-300 hover:text-white hover:bg-red-900/40 hover:border-red-900/20 border border-transparent transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0 text-stone-400" />
            Sign Out Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Bar Header */}
        <header className="bg-white border-b border-stone-200/50 h-16 hidden md:flex items-center justify-between px-8 shadow-2xs">
          <div>
            <h2 className="text-base font-extrabold text-stone-800 tracking-tight">
              {pathname === '/dashboard' ? 'Business Intelligence Overview' : currentRouteItem?.name || 'Dashboard'}
            </h2>
            <span className="text-[10px] text-stone-400 font-medium block">
              Great Pickle Taste internal operations panel
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-stone-500">
            <span>Server Time: {new Date().toLocaleDateString()}</span>
            <div className="h-4 w-px bg-stone-200" />
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              {db.isMock ? 'Demo Mode (Local DB)' : 'Connected to Firestore'}
            </span>
          </div>
        </header>

        {/* Main Content Render */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto max-w-7xl mx-auto w-full">
          {isAuthorized ? (
            children
          ) : (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-sm shadow-red-50">
                <Lock className="w-6 h-6" />
              </div>
              <div className="max-w-xs">
                <h3 className="font-bold text-stone-800 text-base">Restricted Module</h3>
                <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
                  Your current role <strong>{user.role}</strong> does not have permission to view this administrative module. Contact the administrator to elevate privileges.
                </p>
              </div>
              <Link href="/dashboard">
                <button className="bg-primary text-white px-5 py-2 text-xs font-bold rounded-lg hover:bg-primary-dark transition-all">
                  Return to Home
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
