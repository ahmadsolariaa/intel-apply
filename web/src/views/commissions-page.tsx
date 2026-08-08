"use client";

import {Plus} from "@gravity-ui/icons";
import {Button, Chip, SearchField} from "@heroui/react";
import {KPI} from "@heroui-pro/react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useCallback, useEffect, useState} from "react";

import {EmptyState, PageHeader, Pagination, SubTabs} from "@/components/ui-helpers";
import {api, formatDate} from "@/lib/api";

type Commission = {
  id: string;
  caseNumber: string;
  subject: string;
  institution: string;
  status: string;
  intake: string;
  amount: number;
  currency: string;
  createdAt: string;
};

type ListResponse = {
  items: Commission[];
  total: number;
  page: number;
  pageSize: number;
  kpis: {
    pendingStatement: number;
    invoiceValidation: number;
    invoiceRejected: number;
    sentForPayment: number;
    paymentCompleted: number;
    caseClosed: number;
  };
};

const TABS = [
  {id: "all", label: "All"},
  {id: "new", label: "New"},
  {id: "statement", label: "Statement"},
  {id: "invoice", label: "Invoice"},
  {id: "payment", label: "Payment"},
  {id: "closed", label: "Closed"},
  {id: "rejected", label: "Rejected"},
];

const KPI_CARDS: {label: string; key: keyof ListResponse["kpis"]; tab: string}[] = [
  {label: "Pending statement", key: "pendingStatement", tab: "statement"},
  {label: "Invoice validation", key: "invoiceValidation", tab: "invoice"},
  {label: "Invoice rejected", key: "invoiceRejected", tab: "rejected"},
  {label: "Sent for payment", key: "sentForPayment", tab: "payment"},
  {label: "Payment completed", key: "paymentCompleted", tab: "closed"},
  {label: "Case closed", key: "caseClosed", tab: "closed"},
];

export function CommissionsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({tab, page: String(page), pageSize: "10"});
      if (q) params.set("q", q);
      setData(await api<ListResponse>(`/api/commissions?${params}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }, [tab, page, q]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 pb-10 pt-4">
      <PageHeader
        actions={
          <Button onPress={() => router.push("/commissions/new")}>
            <Plus className="size-4" />
            New commission
          </Button>
        }
        description="Statements, invoices and payment cases."
        title="Commission Hub"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {KPI_CARDS.map((card) => (
          <button
            key={card.key}
            className="text-left"
            type="button"
            onClick={() => {
              setPage(1);
              setTab(card.tab);
            }}
          >
            <KPI className={tab === card.tab ? "ring-accent ring-2" : undefined}>
              <KPI.Header>
                <KPI.Title>{card.label}</KPI.Title>
              </KPI.Header>
              <KPI.Content>
                <KPI.Value value={data?.kpis[card.key] ?? 0} />
              </KPI.Content>
            </KPI>
          </button>
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
        name="commission-search"
        variant="secondary"
        onChange={(value) => {
          setPage(1);
          setQ(value);
        }}
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Search case number..." />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      {error ? <p className="text-danger text-sm">{error}</p> : null}

      {!data?.items.length ? (
        <EmptyState body="Create a commission case to track payments." title="No commissions" />
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-default/40 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Case</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Institution</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Intake</th>
                <th className="px-4 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-default/30 border-border cursor-pointer border-t"
                  onClick={() => router.push(`/commissions/${item.id}`)}
                >
                  <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link className="text-accent font-medium" href={`/commissions/${item.id}`}>
                      {item.caseNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{item.subject}</td>
                  <td className="px-4 py-3">{item.institution}</td>
                  <td className="px-4 py-3">
                    <Chip
                      color={
                        item.status === "Closed" || item.status === "Payment"
                          ? "success"
                          : item.status === "Rejected"
                            ? "danger"
                            : "warning"
                      }
                      size="sm"
                      variant="soft"
                    >
                      {item.status}
                    </Chip>
                  </td>
                  <td className="px-4 py-3">{item.intake}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {item.currency} {item.amount}
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
