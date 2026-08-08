"use client";

import {Plus} from "@gravity-ui/icons";
import {Button, Chip, SearchField} from "@heroui/react";
import {KPI} from "@heroui-pro/react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useCallback, useEffect, useState} from "react";

import {EmptyState, PageHeader, Pagination, SubTabs} from "@/components/ui-helpers";
import {api, formatDate} from "@/lib/api";

type Application = {
  id: string;
  studentName: string;
  email: string;
  institution: string;
  programme: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

type ListResponse = {
  items: Application[];
  total: number;
  page: number;
  pageSize: number;
  kpis: {
    toSubmit: number;
    toComplete: number;
    openTasks: number;
    completedTasks: number;
    completed: number;
  };
};

const TABS = [
  {id: "all", label: "All Applications"},
  {id: "draft", label: "Draft Applications"},
  {id: "document", label: "Document Review"},
  {id: "pending", label: "Pending Tasks"},
  {id: "admission", label: "Admission Review"},
  {id: "incomplete", label: "Incomplete"},
];

function statusColor(status: string): "danger" | "warning" | "success" | "default" {
  const s = status.toLowerCase();
  if (s.includes("not complete") || s.includes("draft")) return "danger";
  if (s.includes("submitted") || s.includes("pending") || s.includes("document")) return "warning";
  if (s.includes("accepted")) return "success";
  return "default";
}

export function ApplicationsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({tab, page: String(page), pageSize: "10"});
      if (q) params.set("q", q);
      setData(await api<ListResponse>(`/api/applications?${params}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [tab, page, q]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 pb-10 pt-4">
      <PageHeader
        actions={
          <Button onPress={() => router.push("/applications/new")}>
            <Plus className="size-4" />
            Create new Application +
          </Button>
        }
        description="Track and manage student applications across partner universities."
        title="Applications"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Application to Submit", data?.kpis.toSubmit ?? 0],
          ["Application to Complete", data?.kpis.toComplete ?? 0],
          ["Open Tasks", data?.kpis.openTasks ?? 0],
          ["Completed Tasks", data?.kpis.completedTasks ?? 0],
        ].map(([label, value]) => (
          <KPI key={String(label)}>
            <KPI.Header>
              <KPI.Title>{label}</KPI.Title>
            </KPI.Header>
            <KPI.Content>
              <KPI.Value value={value as number} />
            </KPI.Content>
          </KPI>
        ))}
      </div>

      <div className="border-border rounded-xl border border-[#bfd6f5] bg-[#eaf3ff] px-4 py-3 text-sm">
        <p className="font-semibold text-[#002d72]">New Feature: Visa Application Information</p>
        <p className="mt-1 text-[#355075]">
          Upload and manage visa details for your application. Find the Visa section in the
          application detail.
        </p>
      </div>

      <SubTabs
        tabs={TABS}
        value={tab}
        onChange={(id) => {
          setPage(1);
          setTab(id);
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchField
          className="w-full sm:w-[280px]"
          name="app-search"
          variant="secondary"
          onChange={(value) => {
            setPage(1);
            setQ(value);
          }}
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search applications..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <span className="text-muted text-sm">All My Applications</span>
      </div>

      {error ? <p className="text-danger text-sm">{error}</p> : null}

      {loading && !data ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : !data?.items.length ? (
        <EmptyState body="Create your first application to get started." title="No applications" />
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[#e8f1fb] text-[#002d72]">
              <tr>
                <th className="px-4 py-3 font-medium">Created Date</th>
                <th className="px-4 py-3 font-medium">Applicant Name & Email</th>
                <th className="px-4 py-3 font-medium">Institution</th>
                <th className="px-4 py-3 font-medium">Programme of Study</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium">Admission Status</th>
                <th className="px-4 py-3 font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-default/30 border-border cursor-pointer border-t"
                  onClick={() => router.push(`/applications/${item.id}`)}
                >
                  <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <Link
                        className="text-accent font-medium"
                        href={`/applications/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.studentName}
                      </Link>
                      <span className="text-muted text-xs">{item.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.institution}</td>
                  <td className="px-4 py-3">{item.programme}</td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-[120px] items-center gap-2">
                      <div className="bg-default h-2 flex-1 overflow-hidden rounded-full">
                        <div
                          className="bg-accent h-full"
                          style={{width: `${item.progress}%`}}
                        />
                      </div>
                      <span className="tabular-nums text-xs">{item.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Chip color={statusColor(item.status)} size="sm" variant="soft">
                      {item.status}
                    </Chip>
                  </td>
                  <td className="text-muted px-4 py-3">{formatDate(item.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data ? (
        <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
      ) : null}
    </div>
  );
}
