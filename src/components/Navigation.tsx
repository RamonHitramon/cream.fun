'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/deposit', label: 'Deposit' },
    { href: '/trade', label: 'Trade' },
    { href: '/withdraw', label: 'Withdraw' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="flex items-center gap-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isActive(item.href)
              ? 'bg-hl-primary text-white'
              : 'text-hl-text hover:bg-hl-surface border border-transparent hover:border-hl-border'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
