"use client";

import {Button} from "@heroui/react";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

import {PageHeader, SubTabs} from "@/components/ui-helpers";
import {api} from "@/lib/api";

type FormState = {
  caseNumber: string;
  subject: string;
  institution: string;
  status: string;
  intake: string;
  amount: number;
  currency: string;
  notes: string;
};

const STEPS = [
  {id: "case", label: "Case"},
  {id: "details", label: "Details"},
  {id: "review", label: "Review"},
];

export function CommissionCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState("case");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>({
    caseNumber: `00${Math.floor(700000 + Math.random() * 99999)}`,
    subject: "",
    institution: "",
    status: "New",
    intake: "",
    amount: 0,
    currency: "EUR",
    notes: "",
  });

  useEffect(() => {
    void api<{institutions: {name: string; selected: boolean}[]}>("/api/partners")
      .then((res) => {
        const selected = res.institutions.filter((i) => i.selected).map((i) => i.name);
        const all = res.institutions.map((i) => i.name);
        const list = selected.length ? selected : all;
        setInstitutions(list);
        if (!form.institution && list[0]) {
          setForm((prev) => ({...prev, institution: list[0]}));
        }
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({...prev, [key]: value}));
  }

  function validateStep() {
    if (step === "case" && (!form.caseNumber.trim() || !form.subject.trim())) {
      setError("Case number and subject are required");
      return false;
    }
    if (step === "details" && !form.institution) {
      setError("Institution is required");
      return false;
    }
    setError("");
    return true;
  }

  function next() {
    if (!validateStep()) return;
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  }

  function back() {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  }

  async function submit() {
    if (!validateStep()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api<{item: {id: string}}>("/api/commissions", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push(`/commissions/${res.item.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 pb-10 pt-4">
      <PageHeader description="Open a commission payment case." title="New commission" />
      <SubTabs tabs={STEPS} value={step} onChange={setStep} />

      <div className="border-border flex flex-col gap-3 rounded-xl border p-5">
        {step === "case" ? (
          <>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Case number</span>
              <input
                className="border-border rounded-lg border px-3 py-2"
                value={form.caseNumber}
                onChange={(e) => set("caseNumber", e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Subject</span>
              <input
                className="border-border rounded-lg border px-3 py-2"
                placeholder="Commission - Institution"
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Pipeline status</span>
              <select
                className="border-border rounded-lg border px-3 py-2"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {["New", "Statement", "Invoice", "Payment", "Closed", "Rejected"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        {step === "details" ? (
          <>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Institution</span>
              <select
                className="border-border rounded-lg border px-3 py-2"
                value={form.institution}
                onChange={(e) => set("institution", e.target.value)}
              >
                {institutions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Intake</span>
              <input
                className="border-border rounded-lg border px-3 py-2"
                value={form.intake}
                onChange={(e) => set("intake", e.target.value)}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted">Amount</span>
                <input
                  className="border-border rounded-lg border px-3 py-2"
                  type="number"
                  value={form.amount}
                  onChange={(e) => set("amount", Number(e.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted">Currency</span>
                <select
                  className="border-border rounded-lg border px-3 py-2"
                  value={form.currency}
                  onChange={(e) => set("currency", e.target.value)}
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
              <span className="text-muted">Notes</span>
              <textarea
                className="border-border min-h-24 rounded-lg border px-3 py-2"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </label>
          </>
        ) : null}

        {step === "review" ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            {(
              [
                ["Case", form.caseNumber],
                ["Subject", form.subject],
                ["Institution", form.institution],
                ["Status", form.status],
                ["Intake", form.intake || "—"],
                ["Amount", `${form.currency} ${form.amount}`],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {error ? <p className="text-danger text-sm">{error}</p> : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="secondary" onPress={() => router.push("/commissions")}>
            Cancel
          </Button>
          {step !== "case" ? (
            <Button variant="secondary" onPress={back}>
              Back
            </Button>
          ) : null}
          {step !== "review" ? (
            <Button onPress={next}>Next</Button>
          ) : (
            <Button isDisabled={loading} onPress={() => void submit()}>
              {loading ? "Creating..." : "Create case"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
