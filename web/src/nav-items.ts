import type {ComponentType} from "react";

import {
  Briefcase,
  ChartColumn,
  CircleQuestion,
  FileText,
  Globe,
  Receipt,
} from "@gravity-ui/icons";

export type NavItem = {
  readonly href: string;
  readonly label: string;
  readonly icon: ComponentType<{className?: string}>;
  readonly badge?: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  {href: "/applications", icon: FileText, label: "My Applications"},
  {href: "/partners", icon: Globe, label: "Partner Institutes"},
  {href: "/contracts", icon: Briefcase, label: "Contract Hub"},
  {href: "/commissions", icon: Receipt, label: "Commission Hub"},
  {href: "/analytics", icon: ChartColumn, label: "Analytics"},
] as const;

export const FOOTER_ITEMS: readonly NavItem[] = [
  {href: "/help", icon: CircleQuestion, label: "Help"},
] as const;
