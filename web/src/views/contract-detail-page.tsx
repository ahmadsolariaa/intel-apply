"use client";

import {Button, Chip} from "@heroui/react";
import {useParams, useRouter} from "next/navigation";
import {useCallback, useEffect, useState} from "react";

import {PageHeader, SubTabs} from "@/components/ui-helpers";
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
  startDate: string;
  endDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const STAGES = [
  "New Enquiry",
  "Under Review",
  "Contract Signing",
  "Signed Contracts",
  "Closed Enquiry",
];
const SIGNING = ["Contract Not Issued", "Pending With Agent", "Signed"];
const STATUSES = ["Inactive", "Active"];
const TABS = [
  {id: "overview", label: "Overview"},
  {id: "signing", label: "Signing"},
  {id: "license", label: "Business license"},
];

export function ContractDetailPage() {
  const {id} = useParams<{id: string}>();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [item, setItem] = useState<Contract | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api<{item: Contract}>(`/api/contracts/${id}`);
      setItem(res.item);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!item) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await api<{item: Contract}>(`/api/contracts/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          institution: item.institution,
          contractNumber: item.contractNumber,
          market: item.market,
          stage: item.stage,
          signingStatus: item.signingStatus,
          status: item.status,
          businessLicense: item.businessLicense,
          startDate: item.startDate,
          endDate: item.endDate,
          notes: item.notes,
        }),
      });
      setItem(res.item);
      setMessage("Saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!item || !confirm("Delete this contract?")) return;
    await api(`/api/contracts/${item.id}`, {method: "DELETE"});
    router.push("/contracts");
  }

  if (!item) return <p className="text-muted px-5 py-10 text-sm">{error || "Loading..."}</p>;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 pb-10 pt-4">
      <PageHeader
        actions={
          <>
            <Button isDisabled={saving} onPress={() => void save()}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="danger" onPress={() => void remove()}>
              Delete
            </Button>
          </>
        }
        description={`Created ${formatDate(item.createdAt)} · Updated ${formatDate(item.updatedAt)}`}
        title={item.institution}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Chip color={item.status === "Active" ? "success" : "danger"} size="sm" variant="soft">
          {item.status}
        </Chip>
        <Chip size="sm" variant="soft">
          {item.stage}
        </Chip>
        <Chip color={item.businessLicense ? "success" : "warning"} size="sm" variant="soft">
          License: {item.businessLicense ? "Yes" : "No"}
        </Chip>
      </div>

      <SubTabs tabs={TABS} value={tab} onChange={setTab} />
      {message ? <p className="text-success text-sm">{message}</p> : null}
      {error ? <p className="text-danger text-sm">{error}</p> : null}

      {tab === "overview" ? (
        <div className="border-border flex flex-col gap-3 rounded-xl border p-5">
          {(
            [
              ["institution", "Institution"],
              ["contractNumber", "Contract number"],
              ["market", "Market"],
              ["startDate", "Start date"],
              ["endDate", "End date"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex flex-col gap-1 text-sm">
              <span className="text-muted">{label}</span>
              <input
                className="border-border bg-background rounded-lg border px-3 py-2"
                type={key.includes("Date") ? "date" : "text"}
                value={item[key]}
                onChange={(e) => setItem({...item, [key]: e.target.value})}
              />
            </label>
          ))}
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Stage</span>
            <select
              className="border-border bg-background rounded-lg border px-3 py-2"
              value={item.stage}
              onChange={(e) => setItem({...item, stage: e.target.value})}
            >
              {STAGES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Notes</span>
            <textarea
              className="border-border bg-background min-h-24 rounded-lg border px-3 py-2"
              value={item.notes}
              onChange={(e) => setItem({...item, notes: e.target.value})}
            />
          </label>
        </div>
      ) : null}

      {tab === "signing" ? (
        <div className="border-border flex flex-col gap-3 rounded-xl border p-5">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Signing status</span>
            <select
              className="border-border bg-background rounded-lg border px-3 py-2"
              value={item.signingStatus}
              onChange={(e) => setItem({...item, signingStatus: e.target.value})}
            >
              {SIGNING.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Contract status</span>
            <select
              className="border-border bg-background rounded-lg border px-3 py-2"
              value={item.status}
              onChange={(e) => setItem({...item, status: e.target.value})}
            >
              {STATUSES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {tab === "license" ? (
        <div className="border-border flex flex-col gap-3 rounded-xl border p-5">
          <div className="rounded-lg border border-[#bfd6f5] bg-[#eaf3ff] px-3 py-2 text-sm text-[#355075]">
            Business license is required before activating partner contracts in most markets.
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              checked={item.businessLicense}
              type="checkbox"
              onChange={(e) => setItem({...item, businessLicense: e.target.checked})}
            />
            <span>Business license on file</span>
          </label>
        </div>
      ) : null}
    </div>
  );
}
