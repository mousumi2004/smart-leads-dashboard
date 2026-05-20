import { Activity, UserPlus } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Select } from "../components/common/Select";
import { MeshBackground } from "../components/landing/MeshBackground";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/auth";

export function RegisterPage() {
  const { isAuthenticated, registerUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("sales");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || password.length < 6) {
      setError("Name, valid email, and a password of at least 6 characters are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({ email: email.trim().toLowerCase(), name: name.trim(), password, role });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-stone-950 px-4 py-10">
      <MeshBackground />
      <section className="relative z-10 w-full max-w-lg rounded-lg border border-white/15 bg-white/92 p-6 shadow-2xl shadow-black/25 backdrop-blur-md">
        <Link className="inline-flex items-center gap-3 text-stone-950" to="/">
          <span className="flex items-center gap-1 font-mono text-base font-semibold text-teal-700">
            <span>&lt;</span>
            <Activity className="h-6 w-6" strokeWidth={3} />
            <span>&gt;</span>
          </span>
          <span className="text-sm font-semibold">Smart Leads Dashboard</span>
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-normal text-stone-950">Create account</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Choose the role that matches dashboard access.</p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}
          <Input label="Name" name="name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="Email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Select
            label="Role"
            name="role"
            value={role}
            options={[
              { label: "Sales User", value: "sales" },
              { label: "Admin", value: "admin" }
            ]}
            onChange={(event) => setRole(event.target.value as UserRole)}
          />
          <Button icon={<UserPlus className="h-4 w-4" />} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create account"}
          </Button>
        </form>
        <p className="mt-5 text-sm text-stone-600">
          Already registered?{" "}
          <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
