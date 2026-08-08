"use client";

import {Bell} from "@gravity-ui/icons";

export function PortalHeader() {
  return (
    <header className="border-b border-[#e6eaf0] bg-white">
      <div className="mx-auto flex h-[64px] max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <GusMark />
          <div className="hidden h-8 w-px bg-[#d7dde6] sm:block" />
          <div className="hidden min-w-0 flex-col leading-[1.05] sm:flex">
            <span className="text-[11px] font-bold tracking-[0.02em] text-[#111] uppercase">
              Global University
            </span>
            <span className="text-[11px] font-bold tracking-[0.02em] text-[#111] uppercase">
              Systems
            </span>
          </div>
          <span className="text-sm font-semibold text-[#111] sm:hidden">GUS</span>
        </div>

        <div className="flex max-w-xl flex-1 items-center justify-end gap-3">
          <label className="relative hidden w-full max-w-[340px] md:block">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#8a94a6]">
              ⌕
            </span>
            <input className="portal-input max-w-none pl-9" placeholder="Search..." type="search" />
          </label>

          <button
            aria-label="Notifications"
            className="inline-flex size-9 items-center justify-center rounded-full text-[#222] hover:bg-[#f2f4f7]"
            type="button"
          >
            <Bell className="size-5" />
          </button>

          <div
            aria-label="Profile"
            className="size-9 overflow-hidden rounded-full bg-[#dbe7ff] ring-1 ring-[#c8d6ef]"
          >
            <img
              alt=""
              className="size-full object-cover"
              src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function GusMark() {
  return (
    <div aria-hidden className="relative size-9 shrink-0">
      <span className="absolute top-0 left-0 size-5 rounded-full bg-[#4B7BE5]/65" />
      <span className="absolute top-0 right-0 size-5 rounded-full bg-[#6B5CE7]/75" />
      <span className="absolute bottom-0 left-1/2 size-5 -translate-x-1/2 rounded-full bg-[#2F5FD0]/85" />
    </div>
  );
}
