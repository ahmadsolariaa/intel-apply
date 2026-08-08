"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";

import {NAV_ITEMS} from "../nav-items";

export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="bg-[var(--portal-navy)]">
      <div className="mx-auto flex max-w-[1400px] items-stretch overflow-x-auto px-2 sm:px-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              className={[
                "relative shrink-0 px-4 py-[13px] text-[13px] font-medium whitespace-nowrap",
                active ? "text-white" : "text-white/80 hover:text-white",
              ].join(" ")}
              href={item.href}
            >
              {item.label}
              {active ? (
                <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-white" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
