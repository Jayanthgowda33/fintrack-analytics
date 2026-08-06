'use client';

import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Upload Data', href: '/upload' },
  { label: 'Transactions', href: '/transactions' },
  { label: 'Reports', href: '/reports' },
  { label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col">
      <div className="px-6 py-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">FinTrack</h1>
        <p className="text-xs text-gray-400 mt-1">Expense Analytics</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(function (item) {
          const isActive = pathname === item.href;
          const linkClass = isActive
            ? 'block px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white'
            : 'block px-3 py-2 rounded-lg text-sm font-medium text-gray-300';
          return (
            <a key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-300">
          Logout
        </button>
      </div>
    </div>
  );
}