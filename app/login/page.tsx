"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { login } from "@/lib/api/auth";
import { setSession } from "@/lib/auth/session";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { IconSparkles } from "@/components/ui/icons";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login({ email, password });
      setSession(data.access_token, data.refresh_token, data.user);
      const from = searchParams.get("from") || "/dashboard";
      router.replace(from);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-mesh flex min-h-screen">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(99_102_241_/_0.22),transparent_50%)]" />
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold backdrop-blur">
            P
          </div>
          <h1 className="mt-8 max-w-md text-4xl font-semibold leading-tight tracking-tight">
            Kelola sirkulasi tabung gas dengan presisi
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
            Double tracking isi gas & aset tabung — dari produksi, distribusi,
            hingga outstanding pelanggan.
          </p>
        </div>
        <ul className="relative space-y-3 text-sm text-slate-300">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Filling batch & quality control
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Pelacakan barcode per unit tabung
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Kuota outstanding pelanggan real-time
          </li>
        </ul>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="animate-in w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-rose-700 font-bold text-white">
              P
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              Progas WMS
            </h1>
          </div>

          <Card className="shadow-[var(--shadow-card)]">
            <CardBody className="space-y-6">
              <div>
                <div className="mb-3 inline-flex rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                  <IconSparkles />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Selamat datang
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Masuk ke akun admin untuk melanjutkan
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@perusahaan.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>

                {error ? <Alert variant="error">{error}</Alert> : null}

                <Button className="w-full" size="lg" disabled={loading} type="submit">
                  {loading ? "Memproses..." : "Masuk ke Dashboard"}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
