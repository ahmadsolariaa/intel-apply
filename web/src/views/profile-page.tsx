"use client";

import {Button} from "@heroui/react";
import {useCallback, useEffect, useState} from "react";

import {PageHeader} from "@/components/ui-helpers";
import {api, formatDate} from "@/lib/api";

type MeResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    _count: {
      applications: number;
      contracts: number;
      commissions: number;
      partnerSelections: number;
    };
  };
};

export function ProfilePage() {
  const [data, setData] = useState<MeResponse["user"] | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await api<MeResponse>("/api/auth/me");
      setData(res.user);
      setName(res.user.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await api<{user: {name: string}}>("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({name}),
      });
      setName(res.user.name);
      setMessage("Profile saved");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!data && !error) return <p className="text-muted px-5 py-10 text-sm">Loading...</p>;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 pb-10 pt-4">
      <PageHeader description="Your agent profile in Intel Apply." title="Profile" />
      {message ? <p className="text-success text-sm">{message}</p> : null}
      {error ? <p className="text-danger text-sm">{error}</p> : null}

      <section className="border-border flex flex-col gap-4 rounded-xl border p-5">
        <div className="flex items-center gap-4">
          <div className="size-16 overflow-hidden rounded-full bg-[#dbe7ff] ring-2 ring-[#c8d6ef]">
            <img
              alt=""
              className="size-full object-cover"
              src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
            />
          </div>
          <div>
            <p className="text-lg font-semibold">{data?.name ?? name}</p>
            <p className="text-muted text-sm">{data?.email}</p>
            {data ? (
              <p className="text-muted mt-1 text-xs">Member since {formatDate(data.createdAt)}</p>
            ) : null}
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Display name</span>
          <input
            className="border-border rounded-lg border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Email</span>
          <input
            disabled
            className="border-border bg-default/30 rounded-lg border px-3 py-2"
            value={data?.email ?? ""}
          />
        </label>

        {data ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Stat label="Applications" value={data._count.applications} />
            <Stat label="Contracts" value={data._count.contracts} />
            <Stat label="Commissions" value={data._count.commissions} />
            <Stat label="Partner institutes" value={data._count.partnerSelections} />
          </dl>
        ) : null}

        <div>
          <Button isDisabled={saving} onPress={() => void save()}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </section>
    </div>
  );
}

function Stat({label, value}: {label: string; value: number}) {
  return (
    <div className="border-border rounded-lg border px-3 py-2">
      <dt className="text-muted text-xs">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
