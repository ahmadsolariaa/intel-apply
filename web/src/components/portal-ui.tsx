"use client";

export function PageTitle({
  title,
  actionLabel,
}: {
  title: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h1 className="text-[28px] font-bold text-[var(--portal-navy)]">{title}</h1>
      {actionLabel ? <button className="portal-btn">{actionLabel}</button> : null}
    </div>
  );
}

export function SummaryCards({
  items,
}: {
  items: {label: string; value?: string}[];
}) {
  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-lg border border-[#e6ebf2] bg-white px-4 py-3 shadow-sm"
        >
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-[var(--portal-navy)] text-white">
            ▣
          </span>
          <div className="min-w-0">
            {item.value ? (
              <p className="text-lg font-bold text-[#111] tabular-nums">{item.value}</p>
            ) : null}
            <p className="text-sm text-[#333]">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function InfoBanner({title, body}: {title: string; body: string}) {
  return (
    <div className="mb-4 flex gap-3 rounded-lg border border-[#bfd6f5] bg-[var(--portal-info-bg)] px-4 py-3">
      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--portal-navy)] text-sm text-white">
        i
      </span>
      <div>
        <p className="font-semibold text-[var(--portal-navy)]">{title}</p>
        <p className="mt-0.5 text-sm text-[#355075]">{body}</p>
      </div>
    </div>
  );
}

export function SubTabs({tabs, active = 0}: {tabs: string[]; active?: number}) {
  return (
    <div className="mb-3 flex gap-5 overflow-x-auto border-b border-[#dde3ec]">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          className={[
            "relative shrink-0 pb-2 text-sm whitespace-nowrap",
            index === active
              ? "font-semibold text-[var(--portal-navy)]"
              : "text-[#6b7280] hover:text-[#111]",
          ].join(" ")}
          type="button"
        >
          {tab}
          {index === active ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--portal-navy)]" />
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function SearchRow({
  placeholder,
  rightSlot,
}: {
  placeholder: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <input className="portal-input" placeholder={placeholder} type="search" />
      <button className="portal-btn" type="button">
        Search
      </button>
      <div className="ml-auto flex items-center gap-2">{rightSlot}</div>
      <button aria-label="Previous" className="portal-btn px-3" type="button">
        ‹
      </button>
      <button aria-label="Next" className="portal-btn px-3" type="button">
        ›
      </button>
    </div>
  );
}
