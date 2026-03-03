'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '⌂' },
  { href: '/admin/menu', label: 'Menu', icon: '☰' },
  { href: '/admin/tables', label: 'Tables', icon: '▦' },
  { href: '/admin/orders', label: 'Orders', icon: '☷' },
  { href: '/admin/kitchen-staff', label: 'Staff', icon: '☺' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/admin/login') return;
    const token = localStorage.getItem('auth-token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    document.cookie = 'auth-token=; path=/; max-age=0';
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-orange-600">QR-Dine</h1>
          <p className="text-xs text-gray-500">Restaurant Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                pathname === item.href
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-2.5 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Logout"
          >
            ← Logout
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="flex justify-around py-1">
          {NAV_ITEMS.slice(0, 5).map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 text-xs py-2 px-3 min-h-[44px] justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg ${
                pathname === item.href ? 'text-orange-600' : 'text-gray-500'
              }`}
            >
              <span aria-hidden="true" className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
