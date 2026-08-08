"use client";

import {Button, Chip} from "@heroui/react";
import {useParams, useRouter} from "next/navigation";
import type {FormEvent} from "react";
import {useCallback, useEffect, useState} from "react";

import {PageHeader, SubTabs} from "@/components/ui-helpers";
import {api, formatDate} from "@/lib/api";

type Task = {id: string; title: string; done: boolean};
type Doc = {id: string; name: string; fileName: string; storagePath: string; size: number};
type Application = {
  id: string;
  studentName: string;
  email: string;
  institution: string;
  programme: string;
  intake: string;
  status: string;
  progress: number;
  notes: string;
  visaNotes: string;
  visaStatus: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  documents: Doc[];
};

const STATUSES = [
  "Draft Application",
  "Application not complete",
  "Application submitted",
  "Document Review",
  "Pending Tasks",
  "Conditionally accepted",
  "Withdrawn",
];

const TABS = [
  {id: "overview", label: "Overview"},
  {id: "tasks", label: "Tasks"},
  {id: "documents", label: "Documents"},
  {id: "visa", label: "Visa"},
];

export function ApplicationDetailPage() {
  const {id} = useParams<{id: string}>();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [item, setItem] = useState<Application | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await api<{item: Application}>(`/api/applications/${id}`);
      setItem(res.item);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(patch?: Partial<Application>) {
    if (!item) return;
    setSaving(true);
    setMessage("");
    try {
      const body = patch ?? {
        studentName: item.studentName,
        email: item.email,
        institution: item.institution,
        programme: item.programme,
        intake: item.intake,
        status: item.status,
        progress: item.progress,
        notes: item.notes,
        visaNotes: item.visaNotes,
        visaStatus: item.visaStatus,
      };
      const res = await api<{item: Application}>(`/api/applications/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setItem(res.item);
      setMessage("Saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function addTask(event: FormEvent) {
    event.preventDefault();
    if (!item || !taskTitle.trim()) return;
    await api(`/api/applications/${item.id}/tasks`, {
      method: "POST",
      body: JSON.stringify({title: taskTitle.trim()}),
    });
    setTaskTitle("");
    await load();
  }

  async function toggleTask(task: Task) {
    if (!item) return;
    await api(`/api/applications/${item.id}/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({done: !task.done}),
    });
    await load();
  }

  async function uploadDoc(file: File | null) {
    if (!item || !file) return;
    const body = new FormData();
    body.append("file", file);
    body.append("name", file.name);
    await api(`/api/applications/${item.id}/documents`, {method: "POST", body});
    await load();
    setMessage("Document uploaded");
  }

  async function remove() {
    if (!item || !confirm("Delete this application?")) return;
    await api(`/api/applications/${item.id}`, {method: "DELETE"});
    router.push("/applications");
  }

  if (error && !item) return <p className="text-danger px-5 py-10 text-sm">{error}</p>;
  if (!item) return <p className="text-muted px-5 py-10 text-sm">Loading...</p>;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 pb-10 pt-4">
      <PageHeader
        actions={
          <>
            <Button isDisabled={saving} onPress={() => void save()}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button variant="danger" onPress={() => void remove()}>
              Delete
            </Button>
          </>
        }
        description={`Created ${formatDate(item.createdAt)} · Updated ${formatDate(item.updatedAt)}`}
        title={item.studentName}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Chip size="sm" variant="soft">
          {item.status}
        </Chip>
        <span className="text-muted text-sm">{item.progress}% complete</span>
      </div>

      <SubTabs tabs={TABS} value={tab} onChange={setTab} />
      {message ? <p className="text-success text-sm">{message}</p> : null}
      {error ? <p className="text-danger text-sm">{error}</p> : null}

      {tab === "overview" ? (
        <section className="border-border grid gap-3 rounded-xl border p-4 md:grid-cols-2">
          <Field label="Student" value={item.studentName} onChange={(v) => setItem({...item, studentName: v})} />
          <Field label="Email" value={item.email} onChange={(v) => setItem({...item, email: v})} />
          <Field label="Institution" value={item.institution} onChange={(v) => setItem({...item, institution: v})} />
          <Field label="Programme" value={item.programme} onChange={(v) => setItem({...item, programme: v})} />
          <Field label="Intake" value={item.intake} onChange={(v) => setItem({...item, intake: v})} />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Admission status</span>
            <select
              className="border-border rounded-lg border px-3 py-2"
              value={item.status}
              onChange={(e) => setItem({...item, status: e.target.value})}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-full flex flex-col gap-1 text-sm">
            <span className="text-muted">Progress ({item.progress}%)</span>
            <input
              max={100}
              min={0}
              type="range"
              value={item.progress}
              onChange={(e) => setItem({...item, progress: Number(e.target.value)})}
            />
          </label>
          <label className="col-span-full flex flex-col gap-1 text-sm">
            <span className="text-muted">Notes</span>
            <textarea
              className="border-border min-h-24 rounded-lg border px-3 py-2"
              value={item.notes}
              onChange={(e) => setItem({...item, notes: e.target.value})}
            />
          </label>
        </section>
      ) : null}

      {tab === "tasks" ? (
        <section className="border-border rounded-xl border p-4">
          <ul className="mb-3 space-y-2">
            {item.tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2 text-sm">
                <input checked={task.done} type="checkbox" onChange={() => void toggleTask(task)} />
                <span className={task.done ? "text-muted line-through" : ""}>{task.title}</span>
              </li>
            ))}
            {!item.tasks.length ? <li className="text-muted text-sm">No tasks yet.</li> : null}
          </ul>
          <form className="flex gap-2" onSubmit={addTask}>
            <input
              className="border-border flex-1 rounded-lg border px-3 py-2 text-sm"
              placeholder="New task"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <Button size="sm" type="submit">
              Add
            </Button>
          </form>
        </section>
      ) : null}

      {tab === "documents" ? (
        <section className="border-border rounded-xl border p-4">
          <ul className="mb-3 space-y-2">
            {item.documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between gap-2 text-sm">
                <a className="text-accent" href={doc.storagePath} rel="noreferrer" target="_blank">
                  {doc.name}
                </a>
                <Chip size="sm" variant="soft">
                  {Math.round(doc.size / 1024)} KB
                </Chip>
              </li>
            ))}
            {!item.documents.length ? (
              <li className="text-muted text-sm">No documents uploaded.</li>
            ) : null}
          </ul>
          <input type="file" onChange={(e) => void uploadDoc(e.target.files?.[0] ?? null)} />
        </section>
      ) : null}

      {tab === "visa" ? (
        <section className="border-border flex flex-col gap-3 rounded-xl border p-4">
          <div className="rounded-lg border border-[#bfd6f5] bg-[#eaf3ff] px-3 py-2 text-sm text-[#355075]">
            Manage visa details for this application. Changes are saved with Save changes.
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Visa status</span>
            <select
              className="border-border rounded-lg border px-3 py-2"
              value={item.visaStatus}
              onChange={(e) => setItem({...item, visaStatus: e.target.value})}
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
              className="border-border min-h-28 rounded-lg border px-3 py-2"
              value={item.visaNotes}
              onChange={(e) => setItem({...item, visaNotes: e.target.value})}
            />
          </label>
        </section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted">{label}</span>
      <input
        className="border-border rounded-lg border px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
