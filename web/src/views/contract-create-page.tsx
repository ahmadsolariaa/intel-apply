"use client";

import {Button} from "@heroui/react";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

import {PageHeader, SubTabs} from "@/components/ui-helpers";
import {api} from "@/lib/api";

type FormState = {
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
};

const STEPS = [
  {id: "partner", label: "Partner"},
  {id: "terms", label: "Terms"},
  {id: "signing", label: "Signing"},
  {id: "review", label: "Review"},
];

const STAGES = [
  "New Enquiry",
  "Under Review",
  "Contract Signing",
  "Signed Contracts",
  "Closed Enquiry",
];
const SIGNING = ["Contract Not Issued", "Pending With Agent", "Signed"];

export function ContractCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState("partner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>({
    institution: "",
    contractNumber: `CTR-${Date.now().toString().slice(-6)}`,
    market: "Uzbekistan",
    stage: "New Enquiry",
    signingStatus: "Contract Not Issued",
    status: "Inactive",
    businessLicense: false,
    startDate: "",
    endDate: "",
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
    if (step === "partner" && (!form.institution || !form.contractNumber.trim())) {
      setError("Institution and contract number are required");
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
      const res = await api<{item: {id: string}}>("/api/contracts", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push(`/contracts/${res.item.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 pb-10 pt-4">
      <PageHeader description="Multi-step partner contract enquiry." title="New contract" />
      <SubTabs tabs={STEPS} value={step} onChange={setStep} />

      <div className="border-border flex flex-col gap-3 rounded-xl border p-5">
        {step === "partner" ? (
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
              <span className="text-muted">Contract number</span>
              <input
                className="border-border rounded-lg border px-3 py-2"
                value={form.contractNumber}
                onChange={(e) => set("contractNumber", e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Market</span>
              <input
                className="border-border rounded-lg border px-3 py-2"
                value={form.market}
                onChange={(e) => set("market", e.target.value)}
              />
            </label>
          </>
        ) : null}

        {step === "terms" ? (
          <>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Stage</span>
              <select
                className="border-border rounded-lg border px-3 py-2"
                value={form.stage}
                onChange={(e) => set("stage", e.target.value)}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Start date</span>
              <input
                className="border-border rounded-lg border px-3 py-2"
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">End date</span>
              <input
                className="border-border rounded-lg border px-3 py-2"
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                checked={form.businessLicense}
                type="checkbox"
                onChange={(e) => set("businessLicense", e.target.checked)}
              />
              <span>Business license on file</span>
            </label>
          </>
        ) : null}

        {step === "signing" ? (
          <>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Signing status</span>
              <select
                className="border-border rounded-lg border px-3 py-2"
                value={form.signingStatus}
                onChange={(e) => set("signingStatus", e.target.value)}
              >
                {SIGNING.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Contract status</span>
              <select
                className="border-border rounded-lg border px-3 py-2"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="Inactive">Inactive</option>
                <option value="Active">Active</option>
              </select>
            </label>
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
                ["Institution", form.institution],
                ["Contract #", form.contractNumber],
                ["Market", form.market],
                ["Stage", form.stage],
                ["Signing", form.signingStatus],
                ["Status", form.status],
                ["License", form.businessLicense ? "Yes" : "No"],
                ["Dates", `${form.startDate || "—"} → ${form.endDate || "—"}`],
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
          <Button variant="secondary" onPress={() => router.push("/contracts")}>
            Cancel
          </Button>
          {step !== "partner" ? (
            <Button variant="secondary" onPress={back}>
              Back
            </Button>
          ) : null}
          {step !== "review" ? (
            <Button onPress={next}>Next</Button>
          ) : (
            <Button isDisabled={loading} onPress={() => void submit()}>
              {loading ? "Creating..." : "Create contract"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
