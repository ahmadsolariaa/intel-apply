"use client";

import {Button, Chip} from "@heroui/react";
import {useParams, useRouter} from "next/navigation";
import {useCallback, useEffect, useState} from "react";

import {PageHeader} from "@/components/ui-helpers";
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
  notes: string;
  createdAt: string;
};

const PIPELINE = ["New", "Statement", "Invoice", "Payment", "Closed"] as const;
const ALL_STATUSES = [...PIPELINE, "Rejected"];

export function CommissionDetailPage() {
  const {id} = useParams<{id: string}>();
  const router = useRouter();
  const [item, setItem] = useState<Commission | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api<{item: Commission}>(`/api/commissions/${id}`);
      setItem(res.item);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(nextStatus?: string) {
    if (!item) return;
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        caseNumber: item.caseNumber,
        subject: item.subject,
        institution: item.institution,
        status: nextStatus ?? item.status,
        intake: item.intake,
        amount: item.amount,
        currency: item.currency,
        notes: item.notes,
      };
      const res = await api<{item: Commission}>(`/api/commissions/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setItem(res.item);
      setMessage("Saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function advance() {
    if (!item) return;
    const idx = PIPELINE.indexOf(item.status as (typeof PIPELINE)[number]);
    if (idx < 0 || idx >= PIPELINE.length - 1) return;
    await save(PIPELINE[idx + 1]);
  }

  async function remove() {
    if (!item || !confirm("Delete this commission case?")) return;
    await api(`/api/commissions/${item.id}`, {method: "DELETE"});
    router.push("/commissions");
  }

  if (!item) return <p className="text-muted px-5 py-10 text-sm">{error || "Loading..."}</p>;

  const activeIdx = PIPELINE.indexOf(item.status as (typeof PIPELINE)[number]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 pb-10 pt-4">
      <PageHeader
        actions={
          <>
            <Button
              isDisabled={saving || activeIdx < 0 || activeIdx >= PIPELINE.length - 1}
              variant="secondary"
              onPress={() => void advance()}
            >
              Advance status
            </Button>
            <Button isDisabled={saving} onPress={() => void save()}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="danger" onPress={() => void remove()}>
              Delete
            </Button>
          </>
        }
        description={`Created ${formatDate(item.createdAt)}`}
        title={item.caseNumber}
      />

      {message ? <p className="text-success text-sm">{message}</p> : null}
      {error ? <p className="text-danger text-sm">{error}</p> : null}

      <section className="border-border rounded-xl border p-4">
        <p className="text-muted mb-3 text-xs font-medium tracking-wide uppercase">Pipeline</p>
        <ol className="flex flex-wrap gap-2">
          {PIPELINE.map((step, index) => {
            const done = activeIdx >= 0 && index <= activeIdx;
            const current = item.status === step;
            return (
              <li key={step}>
                <button
                  className={`rounded-full border px-3 py-1 text-xs ${
                    current
                      ? "border-accent bg-accent/10 text-accent font-semibold"
                      : done
                        ? "border-success/40 bg-success/10 text-success"
                        : "border-border text-muted"
                  }`}
                  type="button"
                  onClick={() => setItem({...item, status: step})}
                >
                  {index + 1}. {step}
                </button>
              </li>
            );
          })}
          <li>
            <button
              className={`rounded-full border px-3 py-1 text-xs ${
                item.status === "Rejected"
                  ? "border-danger bg-danger/10 text-danger font-semibold"
                  : "border-border text-muted"
              }`}
              type="button"
              onClick={() => setItem({...item, status: "Rejected"})}
            >
              Rejected
            </button>
          </li>
        </ol>
      </section>

      <div className="border-border flex flex-col gap-3 rounded-xl border p-5">
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
        {(
          [
            ["caseNumber", "Case number"],
            ["subject", "Subject"],
            ["institution", "Institution"],
            ["intake", "Intake"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex flex-col gap-1 text-sm">
            <span className="text-muted">{label}</span>
            <input
              className="border-border bg-background rounded-lg border px-3 py-2"
              value={item[key]}
              onChange={(e) => setItem({...item, [key]: e.target.value})}
            />
          </label>
        ))}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Amount</span>
            <input
              className="border-border bg-background rounded-lg border px-3 py-2"
              type="number"
              value={item.amount}
              onChange={(e) => setItem({...item, amount: Number(e.target.value)})}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Currency</span>
            <select
              className="border-border bg-background rounded-lg border px-3 py-2"
              value={item.currency}
              onChange={(e) => setItem({...item, currency: e.target.value})}
            >
              {["EUR", "GBP", "USD", "CAD"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Status</span>
          <select
            className="border-border bg-background rounded-lg border px-3 py-2"
            value={item.status}
            onChange={(e) => setItem({...item, status: e.target.value})}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
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
    </div>
  );
}
