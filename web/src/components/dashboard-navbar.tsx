"use client";

import {Bell, Magnifier} from "@gravity-ui/icons";
import {Avatar, Button, Dropdown, Label, SearchField} from "@heroui/react";
import {AppLayout, Navbar, Sidebar} from "@heroui-pro/react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useRef, useState} from "react";

import {api, formatDate} from "../lib/api";

import {IconButton} from "./icon-button";

type SearchResult = {
  applications: {id: string; studentName: string; institution: string}[];
  contracts: {id: string; institution: string; contractNumber: string}[];
  commissions: {id: string; caseNumber: string; subject: string}[];
};

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export function DashboardNavbar({title = "Intel Apply"}: {title?: string}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [openNotes, setOpenNotes] = useState(false);
  const [notes, setNotes] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [userName, setUserName] = useState("Agent");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) {
        setOpenSearch(false);
        setOpenNotes(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    void loadNotes().catch(() => undefined);
    void api<{user: {name: string}}>("/api/auth/me")
      .then((res) => setUserName(res.user.name))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(() => {
      void api<SearchResult>(`/api/search?q=${encodeURIComponent(query)}`)
        .then((data) => {
          setResults(data);
          setOpenSearch(true);
        })
        .catch(() => setResults(null));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  async function loadNotes() {
    const data = await api<{items: NotificationItem[]; unread: number}>("/api/notifications");
    setNotes(data.items);
    setUnread(data.unread);
  }

  async function toggleNotes() {
    const next = !openNotes;
    setOpenNotes(next);
    setOpenSearch(false);
    if (next) {
      await loadNotes();
      await api("/api/notifications", {method: "PATCH"});
      setUnread(0);
    }
  }

  async function logout() {
    await api("/api/auth/logout", {method: "POST"});
    router.replace("/login");
    router.refresh();
  }

  return (
    <Navbar maxWidth="full">
      <Navbar.Header>
        <AppLayout.MenuToggle />
        <Sidebar.Trigger />
        <h1 className="text-foreground truncate text-xl font-semibold">{title}</h1>
        <Navbar.Spacer />
        <div ref={boxRef} className="relative flex items-center gap-2">
          <div className="relative hidden lg:block">
            <SearchField
              className="w-[240px]"
              name="q"
              variant="secondary"
              onChange={setQuery}
            >
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            {openSearch && results ? (
              <div className="border-border bg-background absolute top-full right-0 z-50 mt-2 w-[360px] rounded-xl border p-3 shadow-lg">
                <ResultGroup
                  items={results.applications.map((a) => ({
                    href: `/applications/${a.id}`,
                    title: a.studentName,
                    subtitle: a.institution,
                  }))}
                  title="Applications"
                  onNavigate={() => setOpenSearch(false)}
                />
                <ResultGroup
                  items={results.contracts.map((c) => ({
                    href: `/contracts/${c.id}`,
                    title: c.contractNumber,
                    subtitle: c.institution,
                  }))}
                  title="Contracts"
                  onNavigate={() => setOpenSearch(false)}
                />
                <ResultGroup
                  items={results.commissions.map((c) => ({
                    href: `/commissions/${c.id}`,
                    title: c.caseNumber,
                    subtitle: c.subject,
                  }))}
                  title="Commissions"
                  onNavigate={() => setOpenSearch(false)}
                />
              </div>
            ) : null}
          </div>

          <IconButton className="lg:hidden" label="Search" size="sm" variant="tertiary">
            <Magnifier className="size-4" />
          </IconButton>

          <div className="relative">
            <IconButton label="Notifications" size="sm" variant="tertiary" onPress={() => void toggleNotes()}>
              <Bell className="size-4" />
            </IconButton>
            {unread > 0 ? (
              <span className="bg-danger text-danger-foreground absolute -top-1 -right-1 rounded-full px-1.5 text-[10px]">
                {unread}
              </span>
            ) : null}
            {openNotes ? (
              <div className="border-border bg-background absolute top-full right-0 z-50 mt-2 w-[320px] rounded-xl border p-3 shadow-lg">
                <p className="mb-2 text-sm font-semibold">Notifications</p>
                <ul className="max-h-80 space-y-2 overflow-auto">
                  {notes.map((n) => (
                    <li key={n.id}>
                      <Link
                        className="hover:bg-default/40 block rounded-lg px-2 py-2"
                        href={n.href || "/applications"}
                        onClick={() => setOpenNotes(false)}
                      >
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-muted text-xs">{n.body}</p>
                        <p className="text-muted mt-1 text-[11px]">{formatDate(n.createdAt)}</p>
                      </Link>
                    </li>
                  ))}
                  {!notes.length ? (
                    <li className="text-muted px-2 py-4 text-sm">No notifications</li>
                  ) : null}
                </ul>
              </div>
            ) : null}
          </div>

          <Button size="sm" onPress={() => router.push("/applications/new")}>
            New application
          </Button>

          <Dropdown>
            <Button
              isIconOnly
              aria-label="Profile menu"
              className="rounded-full p-0"
              size="sm"
              variant="tertiary"
            >
              <Avatar className="size-8 ring-2 ring-[#c8d6ef]">
                <Avatar.Image
                  alt={userName}
                  src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
                />
                <Avatar.Fallback>{userName.slice(0, 2).toUpperCase()}</Avatar.Fallback>
              </Avatar>
            </Button>
            <Dropdown.Popover className="min-w-[160px]" placement="bottom end">
              <Dropdown.Menu
                onAction={(key) => {
                  if (key === "profile") router.push("/profile");
                  if (key === "account") router.push("/account");
                  if (key === "logout") void logout();
                }}
              >
                <Dropdown.Item id="profile" textValue="Profile">
                  <Label>Profile</Label>
                </Dropdown.Item>
                <Dropdown.Item id="account" textValue="My Account">
                  <Label>My Account</Label>
                </Dropdown.Item>
                <Dropdown.Item id="logout" textValue="Log Out">
                  <Label>Log Out</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </Navbar.Header>
    </Navbar>
  );
}

function ResultGroup({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: {href: string; title: string; subtitle: string}[];
  onNavigate: () => void;
}) {
  if (!items.length) return null;
  return (
    <div className="mb-3">
      <p className="text-muted mb-1 text-xs font-semibold tracking-wide uppercase">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              className="hover:bg-default/40 block rounded-lg px-2 py-1.5"
              href={item.href}
              onClick={onNavigate}
            >
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-muted text-xs">{item.subtitle}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
