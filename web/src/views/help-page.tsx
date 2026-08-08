"use client";

import Link from "next/link";

import {PageHeader} from "@/components/ui-helpers";

const LINKS = [
  {href: "/applications", title: "My Applications", body: "Create and track student cases."},
  {href: "/partners", title: "Partner Institutes", body: "Choose up to 15 partner schools."},
  {href: "/contracts", title: "Contract Hub", body: "Manage enquiries and signing."},
  {href: "/commissions", title: "Commission Hub", body: "Statements, invoices and payments."},
  {href: "/analytics", title: "Analytics", body: "Agency performance reports."},
  {href: "/profile", title: "Profile", body: "View and update your agent profile."},
  {href: "/account", title: "My Account", body: "Login email and password settings."},
];

export function HelpPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 pb-10 pt-4">
      <PageHeader
        description="Guides and shortcuts for the Intel Apply agent portal."
        title="Help"
      />
      <div className="border-border rounded-xl border p-5">
        <h2 className="text-foreground text-base font-semibold">Quick tips</h2>
        <ul className="text-muted mt-3 list-disc space-y-2 pl-5 text-sm">
          <li>Use My Applications to track student cases and progress.</li>
          <li>Partner Institutes is the B2B contract partner selection (max 15).</li>
          <li>Contract Hub holds partner agreements and signing status.</li>
          <li>Commission Hub shows invoices and payment cases.</li>
          <li>Analytics summarizes portal activity for your agency.</li>
          <li>Open your avatar menu for Profile, My Account and Log Out.</li>
        </ul>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map((item) => (
          <Link
            key={item.href}
            className="border-border hover:bg-default/30 rounded-xl border p-4 transition-colors"
            href={item.href}
          >
            <p className="font-medium">{item.title}</p>
            <p className="text-muted mt-1 text-sm">{item.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
