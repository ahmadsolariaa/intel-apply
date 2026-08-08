"use client";

import {Button} from "@heroui/react";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

import {PageHeader, SubTabs} from "@/components/ui-helpers";
import {api} from "@/lib/api";

type FormState = {
  studentName: string;
  email: string;
  institution: string;
  programme: string;
  intake: string;
  status: string;
  progress: number;
  notes: string;
  visaStatus: string;
  visaNotes: string;
};

const STEPS = [
  {id: "student", label: "Student"},
  {id: "programme", label: "Programme"},
  {id: "visa", label: "Visa"},
  {id: "review", label: "Review"},
];

export function ApplicationCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>({
    studentName: "",
    email: "",
    institution: "",
    programme: "",
    intake: "",
    status: "Draft Application",
    progress: 15,
    notes: "",
    visaStatus: "Not started",
    visaNotes: "",
  });

  useEffect(() => {
    void api<{institutions: {name: string; selected: boolean}[]}>("/api/partners")
      .then((res) => {
        const names = res.institutions
          .filter((i) => i.selected)
          .map((i) => i.name);
        const all = res.institutions.map((i) => i.name);
        setInstitutions(names.length ? names : all);
        if (!form.institution && (names[0] || all[0])) {
          setForm((prev) => ({...prev, institution: names[0] || all[0]}));
        }
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({...prev, [key]: value}));
  }

  function validateStep() {
    if (step === "student" && (!form.studentName.trim() || !form.email.trim())) {
      setError("Student name and email are required");
      return false;
    }
    if (step === "programme" && (!form.institution || !form.programme.trim())) {
      setError("Institution and programme are required");
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
      const res = await api<{item: {id: string}}>("/api/applications", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push(`/applications/${res.item.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 pb-10 pt-4">
      <PageHeader
        description="Multi-step wizard to create a new student application."
        title="Create new Application"
      />

      <SubTabs tabs={STEPS} value={step} onChange={setStep} />

      <div className="border-border flex flex-col gap-4 rounded-xl border p-5">
        {step === "student" ? (
          <>
            <Field label="Student name" required value={form.studentName} onChange={(v) => set("studentName", v)} />
            <Field label="Email" required type="email" value={form.email} onChange={(v) => set("email", v)} />
            <Field label="Notes" value={form.notes} onChange={(v) => set("notes", v)} />
          </>
        ) : null}

        {step === "programme" ? (
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
            <Field label="Programme of study" required value={form.programme} onChange={(v) => set("programme", v)} />
            <Field label="Intake" value={form.intake} onChange={(v) => set("intake", v)} />
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Admission status</span>
              <select
                className="border-border rounded-lg border px-3 py-2"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {[
                  "Draft Application",
                  "Application not complete",
                  "Application submitted",
                  "Document Review",
                  "Pending Tasks",
                  "Conditionally accepted",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Progress ({form.progress}%)</span>
              <input
                max={100}
                min={0}
                type="range"
                value={form.progress}
                onChange={(e) => set("progress", Number(e.target.value))}
              />
            </label>
          </>
        ) : null}

        {step === "visa" ? (
          <>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Visa status</span>
              <select
                className="border-border rounded-lg border px-3 py-2"
                value={form.visaStatus}
                onChange={(e) => set("visaStatus", e.target.value)}
              >
                {["Not started", "Pending docs", "In review", "Approved", "Rejected"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Visa notes</span>
              <textarea
                className="border-border min-h-24 rounded-lg border px-3 py-2"
                value={form.visaNotes}
                onChange={(e) => set("visaNotes", e.target.value)}
              />
            </label>
          </>
        ) : null}

        {step === "review" ? (
          <dl className="grid gap-2 text-sm">
            {(
              [
                ["Student", form.studentName],
                ["Email", form.email],
                ["Institution", form.institution],
                ["Programme", form.programme],
                ["Intake", form.intake || "—"],
                ["Status", form.status],
                ["Progress", `${form.progress}%`],
                ["Visa", form.visaStatus],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-dashed py-2">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {error ? <p className="text-danger text-sm">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onPress={() => router.push("/applications")}>
            Cancel
          </Button>
          {step !== "student" ? (
            <Button variant="secondary" onPress={back}>
              Back
            </Button>
          ) : null}
          {step !== "review" ? (
            <Button onPress={next}>Next</Button>
          ) : (
            <Button isDisabled={loading} onPress={() => void submit()}>
              {loading ? "Creating..." : "Create application"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted">{label}</span>
      <input
        required={required}
        className="border-border rounded-lg border px-3 py-2"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
