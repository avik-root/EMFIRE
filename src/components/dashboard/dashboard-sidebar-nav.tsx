'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { MultiSigWallet } from '@/types/secure-share'; 

interface DashboardSidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  currentWallet?: MultiSigWallet | null; 
}

export function DashboardSidebarNav({ className, currentWallet, ...props }: DashboardSidebarNavProps) {
  const pathname = usePathname();
  const params = useParams();
  const walletId = params.walletId as string | undefined;

  const navItems = [
    {
      href: '/dashboard/manage-wallets',
      label: 'Manage Wallets',
      icon: Icons.Briefcase,
      activeCondition: () => pathname === '/dashboard/manage-wallets',
    },
    ...(walletId ? [ 
      {
        href: `/dashboard/wallet/${walletId}`,
        label: 'Wallet Overview',
        icon: Icons.Home,
        // Ensure this is active only for the base wallet page, not its children like /propose or /owners
        activeCondition: () => pathname === `/dashboard/wallet/${walletId}`,
      },
      {
        href: `/dashboard/wallet/${walletId}/propose`,
        label: 'Propose Transaction',
        icon: Icons.Send,
        activeCondition: () => pathname === `/dashboard/wallet/${walletId}/propose`,
      },
      {
        href: `/dashboard/wallet/${walletId}/owners`,
        label: 'Owners & Settings',
        icon: Icons.Users, // Or Icons.Settings
        activeCondition: () => pathname === `/dashboard/wallet/${walletId}/owners`,
      }
    ] : []),
    // Example for a future general settings page:
    // {
    //   href: '/dashboard/settings', // A global settings page, not wallet-specific
    //   label: 'Global Settings',
    //   icon: Icons.Settings,
    //   activeCondition: () => pathname === '/dashboard/settings',
    // }
  ];

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 p-2",
        className
      )}
      {...props}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.activeCondition();
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
              isActive ? 'bg-accent text-accent-foreground' : 'transparent',
              'transition-colors'
            )}
          >
            <Icon className={cn('mr-2 h-5 w-5', isActive ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-accent-foreground')} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
