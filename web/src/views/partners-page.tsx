"use client";

import {Button} from "@heroui/react";
import {useRouter} from "next/navigation";
import {useCallback, useEffect, useMemo, useState} from "react";

import {PageHeader} from "@/components/ui-helpers";
import {api} from "@/lib/api";

type Institution = {
  id: string;
  name: string;
  region: string;
  country: string;
  logoUrl: string;
  selected: boolean;
};

type PartnersResponse = {
  max: number;
  selectedCount: number;
  institutions: Institution[];
  regions: string[];
  countries: string[];
};

export function PartnersPage() {
  const router = useRouter();
  const [region, setRegion] = useState("all");
  const [country, setCountry] = useState("all");
  const [q, setQ] = useState("");
  const [data, setData] = useState<PartnersResponse | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const load = useCallback(async () => {
    setError("");
    try {
      const params = new URLSearchParams();
      if (region !== "all") params.set("region", region);
      if (country !== "all") params.set("country", country);
      if (q.trim()) params.set("q", q.trim());
      const res = await api<PartnersResponse>(`/api/partners?${params}`);
      setData(res);
      setSelected(new Set(res.institutions.filter((i) => i.selected).map((i) => i.id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [region, country, q]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedCount = selected.size;
  const max = data?.max ?? 15;

  const countries = useMemo(() => data?.countries ?? [], [data]);

  async function toggle(id: string) {
    const next = new Set(selected);
    const willSelect = !next.has(id);
    if (willSelect && next.size >= max) {
      setError(`You can select up to ${max} institutes`);
      return;
    }
    if (willSelect) next.add(id);
    else next.delete(id);
    setSelected(next);
    setError("");
    try {
      await api("/api/partners", {
        method: "PATCH",
        body: JSON.stringify({institutionId: id, selected: willSelect}),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
      await load();
    }
  }

  async function saveAndContinue() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await api("/api/partners", {
        method: "PUT",
        body: JSON.stringify({institutionIds: [...selected]}),
      });
      setMessage("Partner institutes saved");
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (step === 2) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 pb-10 pt-4">
        <PageHeader
          description="Your partner institute selection is saved."
          title="Selection complete"
        />
        <div className="border-border rounded-xl border p-5">
          <p className="text-sm">
            Selected <strong>{selectedCount}</strong> of <strong>{max}</strong> institutes.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {(data?.institutions ?? [])
              .filter((i) => selected.has(i.id))
              .map((i) => (
                <li key={i.id}>{i.name}</li>
              ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onPress={() => setStep(1)}>Back to selection</Button>
            <Button variant="secondary" onPress={() => router.push("/contracts/new")}>
              Create contract
            </Button>
            <Button variant="secondary" onPress={() => router.push("/applications")}>
              Go to applications
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 pb-10 pt-4">
      <PageHeader
        description="Please select the institutions that you would like to partner with!"
        title="Partner Institutes"
      />

      <div className="border-border rounded-xl border bg-white p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold">Available Institutes</p>
            <p className="text-muted text-xs">Filter by region and country, then select up to {max}.</p>
          </div>
          <p className="text-sm font-semibold tabular-nums">
            {selectedCount}/{max} Institute Selected
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Region</span>
            <select
              className="border-border rounded-lg border px-3 py-2"
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setCountry("all");
              }}
            >
              <option value="all">All regions</option>
              {(data?.regions ?? []).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Country</span>
            <select
              className="border-border rounded-lg border px-3 py-2 disabled:opacity-50"
              disabled={region === "all"}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="all">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm">
            <span className="text-muted">Search</span>
            <input
              className="border-border rounded-lg border px-3 py-2"
              placeholder="Search for an Institute"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
        </div>

        {error ? <p className="text-danger mb-3 text-sm">{error}</p> : null}
        {message ? <p className="text-success mb-3 text-sm">{message}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(data?.institutions ?? []).map((item) => {
            const isOn = selected.has(item.id);
            return (
              <button
                key={item.id}
                className={[
                  "flex flex-col rounded-xl border p-3 text-left transition",
                  isOn ? "border-accent bg-accent/5" : "border-border hover:border-accent/40",
                ].join(" ")}
                type="button"
                onClick={() => void toggle(item.id)}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <img
                    alt=""
                    className="size-12 rounded-lg object-cover"
                    src={item.logoUrl || undefined}
                  />
                  <span
                    className={[
                      "inline-flex size-5 items-center justify-center rounded-full border text-xs",
                      isOn ? "border-accent bg-accent text-white" : "border-border",
                    ].join(" ")}
                  >
                    {isOn ? "✓" : ""}
                  </span>
                </div>
                <p className="text-accent text-sm font-semibold">{item.name}</p>
                <p className="text-muted mt-1 text-xs">
                  {item.country} · {item.region}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onPress={() => router.push("/contracts")}>
            Cancel
          </Button>
          <Button isDisabled={saving || selectedCount === 0} onPress={() => void saveAndContinue()}>
            {saving ? "Saving..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
