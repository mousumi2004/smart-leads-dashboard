import { Activity, ArrowRight } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { MeshBackground } from "../components/landing/MeshBackground";
import { useAuth } from "../context/AuthContext";

interface LocationState {
  from?: { pathname?: string };
}

export function LoginPage() {
  const { isAuthenticated, loginUser } = useAuth();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await loginUser({ email: email.trim().toLowerCase(), password });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function fillDemo(role: "admin" | "sales") {
    setEmail(role === "admin" ? "admin@smartleads.test" : "sales@smartleads.test");
    setPassword("Password123!");
    setError(null);
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-stone-950 px-4 py-10">
      <MeshBackground />
      <section className="relative z-10 grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="hidden max-w-xl lg:block">
          <Link className="inline-flex items-center gap-3 text-white" to="/">
            <span className="flex items-center gap-1 font-mono text-lg font-semibold">
              <span>&lt;</span>
              <Activity className="h-7 w-7 text-teal-200" strokeWidth={3} />
              <span>&gt;</span>
            </span>
            <span className="text-sm font-semibold">Smart Leads Dashboard</span>
          </Link>
          <h1 className="mt-12 text-5xl font-semibold leading-tight text-white">Open the sales workspace.</h1>
          <p className="mt-5 text-lg leading-8 text-white/72">
            Review Admin analytics, Sales User queues, timelines, and follow-ups with seeded demo data.
          </p>
        </div>

        <div className="rounded-lg border border-white/15 bg-white/92 p-6 shadow-2xl shadow-black/25 backdrop-blur-md">
          <div>
            <p className="text-sm font-semibold text-teal-700">Smart Leads Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-stone-950">Login</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">Use a demo account or enter your own credentials.</p>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-left text-sm font-semibold text-teal-900 transition hover:bg-teal-100"
              type="button"
              onClick={() => fillDemo("admin")}
            >
              Admin demo
            </button>
            <button
              className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-left text-sm font-semibold text-violet-900 transition hover:bg-violet-100"
              type="button"
              onClick={() => fillDemo("sales")}
            >
              Sales demo
            </button>
          </div>
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}
            <Input label="Email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Input
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button icon={<ArrowRight className="h-4 w-4" />} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
          <p className="mt-5 text-sm text-stone-600">
            New user?{" "}
            <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
