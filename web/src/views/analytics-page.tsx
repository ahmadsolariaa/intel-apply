"use client";

import {Button} from "@heroui/react";
import {KPI} from "@heroui-pro/react";
import {useCallback, useEffect, useState} from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {PageHeader} from "@/components/ui-helpers";
import {api, formatDate} from "@/lib/api";

type Analytics = {
  totals: {
    applications: number;
    contracts: number;
    commissions: number;
    commissionAmount: number;
    avgProgress: number;
  };
  byStatus: {name: string; value: number}[];
  byInstitution: {name: string; value: number}[];
  commissionByInstitution: {name: string; value: number}[];
  institutions: string[];
  asOf: string;
};

const COLORS = ["#1d4ed8", "#059669", "#d97706", "#dc2626", "#0891b2", "#7c3aed"];

export function AnalyticsPage() {
  const [days, setDays] = useState("30");
  const [institution, setInstitution] = useState("all");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({days, institution});
      if (createdFrom) params.set("createdFrom", createdFrom);
      if (createdTo) params.set("createdTo", createdTo);
      setData(await api<Analytics>(`/api/analytics?${params}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [days, institution, createdFrom, createdTo]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 pb-10 pt-4">
      <PageHeader
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onPress={() => {
                setDays("30");
                setInstitution("all");
                setCreatedFrom("");
                setCreatedTo("");
              }}
            >
              Reset filters
            </Button>
            <Button isDisabled={loading} onPress={() => void load()}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        }
        description={
          data
            ? `Agency performance · As of ${formatDate(data.asOf)}`
            : "Agency performance across applications and commissions."
        }
        title="Business Insights"
      />

      <section className="border-border grid gap-3 rounded-xl border p-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Roll-up period</span>
          <select
            className="border-border bg-background rounded-lg border px-3 py-2"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 12 months</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Institution</span>
          <select
            className="border-border bg-background rounded-lg border px-3 py-2"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          >
            <option value="all">All institutions</option>
            {(data?.institutions ?? []).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Applications created from</span>
          <input
            className="border-border bg-background rounded-lg border px-3 py-2"
            type="date"
            value={createdFrom}
            onChange={(e) => setCreatedFrom(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Applications created to</span>
          <input
            className="border-border bg-background rounded-lg border px-3 py-2"
            type="date"
            value={createdTo}
            onChange={(e) => setCreatedTo(e.target.value)}
          />
        </label>
      </section>

      {error ? <p className="text-danger text-sm">{error}</p> : null}

      <section className="border-border rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">Total</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Applications", data?.totals.applications ?? 0],
            ["Contracts", data?.totals.contracts ?? 0],
            ["Commission cases", data?.totals.commissions ?? 0],
            ["Avg progress %", data?.totals.avgProgress ?? 0],
            ["Commission €", data?.totals.commissionAmount ?? 0],
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
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="border-border rounded-xl border p-4">
          <h3 className="mb-3 font-semibold">By status</h3>
          <div className="h-64 w-full min-w-0">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.byStatus ?? []}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {(data?.byStatus ?? []).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>
          <ul className="mt-2 max-h-32 space-y-1 overflow-auto text-sm">
            {(data?.byStatus ?? []).map((row) => (
              <li key={row.name} className="flex justify-between gap-2">
                <span className="text-muted truncate">{row.name}</span>
                <span className="tabular-nums font-medium">{row.value}</span>
              </li>
            ))}
            {!data?.byStatus.length ? <li className="text-muted">No data in range</li> : null}
          </ul>
        </section>

        <section className="border-border rounded-xl border p-4">
          <h3 className="mb-3 font-semibold">By institution</h3>
          <div className="h-64 w-full min-w-0">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.byInstitution ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
          <ul className="mt-2 max-h-32 space-y-1 overflow-auto text-sm">
            {(data?.byInstitution ?? []).map((row) => (
              <li key={row.name} className="flex justify-between gap-2">
                <span className="text-muted truncate">{row.name}</span>
                <span className="tabular-nums font-medium">{row.value}</span>
              </li>
            ))}
            {!data?.byInstitution.length ? <li className="text-muted">No data in range</li> : null}
          </ul>
        </section>
      </div>

      <section className="border-border rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">Commission amount by institution</h3>
        <div className="h-56 w-full min-w-0">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.commissionByInstitution ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </section>
    </div>
  );
}
