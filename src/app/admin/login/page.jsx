"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(params.get("next") || "/admin");
      router.refresh();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-3 h-14 w-14">
            <Image src="/images/logo.png" fill alt="Accord Logo" className="object-contain" />
          </div>
          <h1 className="font-heading text-xl font-bold text-slate-800">Accord Admin</h1>
          <p className="text-[0.8rem] text-slate-500">Sign in to manage bookings &amp; fleet</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-7 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
        >
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@accordtoursandtravels.com"
            className="mb-4"
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mb-6"
          />
          <Button type="submit" loading={loading} className="w-full justify-center">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
