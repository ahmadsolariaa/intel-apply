"use client";

import {Plus} from "@gravity-ui/icons";
import {Button, Chip, SearchField} from "@heroui/react";
import {KPI} from "@heroui-pro/react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useCallback, useEffect, useState} from "react";

import {EmptyState, PageHeader, Pagination, SubTabs} from "@/components/ui-helpers";
import {api, formatDate} from "@/lib/api";

type Contract = {
  id: string;
  institution: string;
  contractNumber: string;
  market: string;
  stage: string;
  signingStatus: string;
  status: string;
  businessLicense: boolean;
  createdAt: string;
};

type ListResponse = {
  items: Contract[];
  total: number;
  page: number;
  pageSize: number;
  kpis: {
    total: number;
    active: number;
    inactive: number;
    withLicense: number;
    signing: number;
    signed: number;
  };
};

const TABS = [
  {id: "all", label: "All Contracts"},
  {id: "new", label: "New Enquiry"},
  {id: "review", label: "Under Review"},
  {id: "signing", label: "Signing"},
  {id: "signed", label: "Signed"},
  {id: "closed", label: "Closed"},
];

export function ContractsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const params = new URLSearchParams({tab, page: String(page), pageSize: "10"});
      if (q) params.set("q", q);
      setData(await api<ListResponse>(`/api/contracts?${params}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [tab, page, q]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 pb-10 pt-4">
      <PageHeader
        actions={
          <Button onPress={() => router.push("/contracts/new")}>
            <Plus className="size-4" />
            New contract
          </Button>
        }
        description="Partner contracts and signing workflow."
        title="Contract Hub"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Total", data?.kpis.total ?? 0],
          ["Active", data?.kpis.active ?? 0],
          ["Inactive", data?.kpis.inactive ?? 0],
          ["Business license", data?.kpis.withLicense ?? 0],
          ["Signing", data?.kpis.signing ?? 0],
          ["Signed", data?.kpis.signed ?? 0],
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

      <SubTabs
        tabs={TABS}
        value={tab}
        onChange={(id) => {
          setPage(1);
          setTab(id);
        }}
      />

      <SearchField
        className="w-full sm:w-[280px]"
        name="contract-search"
        variant="secondary"
        onChange={(value) => {
          setPage(1);
          setQ(value);
        }}
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Search contract number..." />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      {error ? <p className="text-danger text-sm">{error}</p> : null}

      {!data?.items.length ? (
        <EmptyState body="Create a contract to start partnering." title="No contracts" />
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-default/40 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Institution & number</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Signing</th>
                <th className="px-4 py-3 font-medium">License</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-default/30 border-border cursor-pointer border-t"
                  onClick={() => router.push(`/contracts/${item.id}`)}
                >
                  <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.institution}</span>
                      <Link
                        className="text-accent text-xs"
                        href={`/contracts/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.contractNumber}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.stage}</td>
                  <td className="px-4 py-3">{item.signingStatus}</td>
                  <td className="px-4 py-3">
                    <Chip color={item.businessLicense ? "success" : "warning"} size="sm" variant="soft">
                      {item.businessLicense ? "Yes" : "No"}
                    </Chip>
                  </td>
                  <td className="px-4 py-3">
                    <Chip
                      color={item.status === "Active" ? "success" : "danger"}
                      size="sm"
                      variant="soft"
                    >
                      {item.status}
                    </Chip>
                  </td>
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
