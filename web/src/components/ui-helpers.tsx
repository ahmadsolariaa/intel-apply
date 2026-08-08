"use client";

import type {ReactNode} from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-foreground text-xl font-semibold">{title}</h2>
        {description ? <p className="text-muted mt-1 text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({title, body}: {title: string; body: string}) {
  return (
    <div className="border-border rounded-xl border border-dashed px-6 py-12 text-center">
      <p className="text-foreground font-medium">{title}</p>
      <p className="text-muted mt-1 text-sm">{body}</p>
    </div>
  );
}

export function SubTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: {id: string; label: string}[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mb-3 flex gap-4 overflow-x-auto border-b border-[var(--border)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={[
            "relative shrink-0 pb-2 text-sm whitespace-nowrap",
            value === tab.id
              ? "text-foreground font-semibold"
              : "text-muted hover:text-foreground",
          ].join(" ")}
          type="button"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {value === tab.id ? (
            <span className="bg-accent absolute inset-x-0 bottom-0 h-0.5" />
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mt-3 flex items-center justify-between gap-2">
      <p className="text-muted text-sm">
        Page {page} of {pages} · {total} total
      </p>
      <div className="flex gap-2">
        <button
          className="border-border rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
          disabled={page <= 1}
          type="button"
          onClick={() => onPage(page - 1)}
        >
          Prev
        </button>
        <button
          className="border-border rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
          disabled={page >= pages}
          type="button"
          onClick={() => onPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
