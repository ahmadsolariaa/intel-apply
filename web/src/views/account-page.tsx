"use client";

import {Button} from "@heroui/react";
import {useCallback, useEffect, useState} from "react";

import {PageHeader} from "@/components/ui-helpers";
import {api} from "@/lib/api";

export function AccountPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api<{user: {email: string; name: string}}>("/api/auth/me");
      setEmail(res.user.email);
      setName(res.user.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveAccount() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await api("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({name}),
      });
      setMessage("Account details saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setSaving(true);
    setMessage("");
    setError("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setSaving(false);
      return;
    }
    try {
      await api("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({currentPassword, newPassword}),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Password update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 pb-10 pt-4">
      <PageHeader description="Login and account security settings." title="My Account" />
      {message ? <p className="text-success text-sm">{message}</p> : null}
      {error ? <p className="text-danger text-sm">{error}</p> : null}

      <section className="border-border flex flex-col gap-3 rounded-xl border p-5">
        <h2 className="font-semibold">Account details</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Full name</span>
          <input
            className="border-border rounded-lg border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Login email</span>
          <input
            disabled
            className="border-border bg-default/30 rounded-lg border px-3 py-2"
            value={email}
          />
        </label>
        <div>
          <Button isDisabled={saving} onPress={() => void saveAccount()}>
            Save account
          </Button>
        </div>
      </section>

      <section className="border-border flex flex-col gap-3 rounded-xl border p-5">
        <h2 className="font-semibold">Change password</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Current password</span>
          <input
            className="border-border rounded-lg border px-3 py-2"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">New password</span>
          <input
            className="border-border rounded-lg border px-3 py-2"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Confirm new password</span>
          <input
            className="border-border rounded-lg border px-3 py-2"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        <div>
          <Button isDisabled={saving || !currentPassword || !newPassword} onPress={() => void changePassword()}>
            Update password
          </Button>
        </div>
      </section>
    </div>
  );
}
