"use client";

import type {ReactNode} from "react";

import {AppLayout} from "@heroui-pro/react";
import {usePathname, useRouter} from "next/navigation";
import {useCallback, useMemo} from "react";

import {FOOTER_ITEMS, NAV_ITEMS} from "../nav-items";

import {DashboardNavbar} from "./dashboard-navbar";
import {DashboardSidebar} from "./dashboard-sidebar";

const ROUTE_LABELS = new Map<string, string>([
  ...[...NAV_ITEMS, ...FOOTER_ITEMS].map((item) => [item.href, item.label] as const),
  ["/profile", "Profile"],
  ["/account", "My Account"],
]);

export function AppShell({children}: {children: ReactNode}) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = useCallback((href: string) => router.push(href), [router]);

  const title = useMemo(() => {
    const match = [...ROUTE_LABELS.entries()].find(
      ([href]) => pathname === href || pathname.startsWith(`${href}/`),
    );

    return match?.[1] ?? "Intel Apply";
  }, [pathname]);

  return (
    <AppLayout
      navbar={<DashboardNavbar title={title} />}
      navigate={navigate}
      sidebar={<DashboardSidebar basePath="" pathname={pathname} />}
      sidebarCollapsible="icon"
    >
      {children}
    </AppLayout>
  );
}
