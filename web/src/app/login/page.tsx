"use client";

import {Button} from "@heroui/react";
import {useRouter, useSearchParams} from "next/navigation";
import type {FormEvent} from "react";
import {Suspense, useState} from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("goabroad.uz@gmail.com");
  const [password, setPassword] = useState("Poiuytrewq8!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      router.replace(params.get("next") || "/applications");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="border-border flex w-full max-w-md flex-col gap-4 rounded-2xl border p-6 shadow-sm" onSubmit={onSubmit}>
      <div>
        <div className="bg-accent text-accent-foreground mb-4 flex size-10 items-center justify-center rounded-xl text-sm font-bold">
          IA
        </div>
        <h1 className="text-foreground text-2xl font-semibold">Sign in</h1>
        <p className="text-muted mt-1 text-sm">Intel Apply agent portal</p>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Email</span>
        <input
          required
          className="border-border bg-background rounded-lg border px-3 py-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Password</span>
        <input
          required
          className="border-border bg-background rounded-lg border px-3 py-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      {error ? <p className="text-danger text-sm">{error}</p> : null}

      <Button isDisabled={loading} type="submit">
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-dvh items-center justify-center px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
