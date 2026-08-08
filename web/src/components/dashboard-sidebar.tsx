"use client";

import type {NavItem} from "../nav-items";

import {Avatar, Button, Chip, Dropdown, Label} from "@heroui/react";
import {Sidebar} from "@heroui-pro/react";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

import {api} from "../lib/api";
import {FOOTER_ITEMS, NAV_ITEMS} from "../nav-items";

interface DashboardSidebarProps {
  pathname: string;
  basePath: string;
  disableNavigation?: boolean;
}

export function DashboardSidebar({
  basePath,
  disableNavigation = false,
  pathname,
}: DashboardSidebarProps) {
  return (
    <>
      <Sidebar>
        <SidebarContents
          basePath={basePath}
          disableNavigation={disableNavigation}
          pathname={pathname}
        />
      </Sidebar>
      <Sidebar.Mobile>
        <SidebarContents
          basePath={basePath}
          disableNavigation={disableNavigation}
          idPrefix="mobile-"
          pathname={pathname}
        />
      </Sidebar.Mobile>
    </>
  );
}

interface SidebarContentsProps {
  basePath: string;
  disableNavigation: boolean;
  pathname: string;
  idPrefix?: string;
}

function SidebarContents({
  basePath,
  disableNavigation,
  idPrefix = "",
  pathname,
}: SidebarContentsProps) {
  const router = useRouter();
  const [user, setUser] = useState<{name: string; email: string} | null>(null);

  useEffect(() => {
    void api<{user: {name: string; email: string}}>("/api/auth/me")
      .then((res) => setUser(res.user))
      .catch(() => undefined);
  }, []);

  async function logout() {
    await api("/api/auth/logout", {method: "POST"});
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <Sidebar.Header>
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="bg-accent text-accent-foreground flex size-9 items-center justify-center rounded-xl text-sm font-bold">
            IA
          </div>
          <div className="flex min-w-0 flex-col" data-sidebar="label">
            <span className="text-foreground text-sm font-semibold leading-tight">Intel Apply</span>
            <span className="text-muted text-xs font-medium leading-tight">Agent portal</span>
          </div>
        </div>
      </Sidebar.Header>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
          <Sidebar.Menu aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <SidebarNavItem
                key={item.href}
                basePath={basePath}
                disableNavigation={disableNavigation}
                idPrefix={idPrefix}
                item={item}
                pathname={pathname}
              />
            ))}
          </Sidebar.Menu>
        </Sidebar.Group>
      </Sidebar.Content>
      <Sidebar.Footer>
        <Sidebar.Menu aria-label="Account">
          {FOOTER_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.href}
              basePath={basePath}
              disableNavigation={disableNavigation}
              idPrefix={idPrefix}
              item={item}
              pathname={pathname}
            />
          ))}
        </Sidebar.Menu>

        <Dropdown>
          <Button
            aria-label="Account menu"
            className="mt-2 h-auto w-full justify-start gap-3 px-1 py-1.5"
            data-sidebar="label"
            isDisabled={disableNavigation}
            variant="tertiary"
          >
            <Avatar className="size-8 shrink-0">
              <Avatar.Image
                alt={user?.name ?? "Agent"}
                src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
              />
              <Avatar.Fallback>{(user?.name ?? "AG").slice(0, 2).toUpperCase()}</Avatar.Fallback>
            </Avatar>
            <div className="flex min-w-0 flex-col text-left">
              <span className="text-foreground truncate text-sm font-medium">
                {user?.name ?? "Agent account"}
              </span>
              <span className="text-muted truncate text-xs font-normal">{user?.email ?? "…"}</span>
            </div>
          </Button>
          <Dropdown.Popover className="min-w-[160px]" placement="top start">
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
      </Sidebar.Footer>
    </>
  );
}

interface SidebarNavItemProps {
  basePath: string;
  disableNavigation: boolean;
  idPrefix: string;
  item: NavItem;
  pathname: string;
}

function SidebarNavItem({
  basePath,
  disableNavigation,
  idPrefix,
  item,
  pathname,
}: SidebarNavItemProps) {
  const Icon = item.icon;
  const fullHref = basePath + item.href;
  const isCurrent =
    pathname === fullHref || pathname.startsWith(`${fullHref}/`);

  return (
    <Sidebar.MenuItem
      href={disableNavigation ? undefined : fullHref}
      id={`${idPrefix}${item.href}`}
      isCurrent={isCurrent}
      textValue={item.label}
    >
      <Sidebar.MenuIcon>
        <Icon className="size-4" />
      </Sidebar.MenuIcon>
      <Sidebar.MenuLabel>{item.label}</Sidebar.MenuLabel>
      {item.badge ? (
        <Sidebar.MenuChip>
          <Chip color="success" size="sm" variant="soft">
            {item.badge}
          </Chip>
        </Sidebar.MenuChip>
      ) : null}
    </Sidebar.MenuItem>
  );
}
