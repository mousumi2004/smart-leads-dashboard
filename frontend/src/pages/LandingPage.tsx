import { Activity, ArrowRight, LogIn, Shield, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { MeshBackground } from "../components/landing/MeshBackground";
import { TypingHeading } from "../components/landing/TypingHeading";
import { useAuth } from "../context/AuthContext";

const workflowSteps = [
  { title: "Capture", text: "Add leads with source, status, and priority." },
  { title: "Assign", text: "Route every new lead to the right Sales User." },
  { title: "Follow up", text: "Track next action, notes, and activity history." }
];

const roleHighlights = [
  { icon: Shield, title: "Admin", text: "Assign leads, export CSV, review analytics, and compare Sales User workload." },
  { icon: UserCheck, title: "Sales User", text: "Work only on assigned leads, update statuses, notes, and follow-up actions." }
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden bg-stone-950 text-stone-950">
      <MeshBackground />
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 md:px-6">
        <Link className="flex items-center gap-3" to="/">
          <span className="flex items-center gap-1 font-mono text-lg font-semibold text-white" aria-hidden="true">
            <span>&lt;</span>
            <Activity className="h-7 w-7" strokeWidth={3} />
            <span>&gt;</span>
          </span>
          <span className="text-sm font-semibold tracking-normal text-white sm:text-base">Smart Leads Dashboard</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/88 backdrop-blur transition hover:bg-white/12 hover:text-white"
            to="/login"
          >
            <LogIn className="hidden h-4 w-4 sm:block" />
            Login
          </Link>
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-teal-200/35 bg-teal-200/14 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-950/10 backdrop-blur transition hover:bg-teal-200/22"
            to={isAuthenticated ? "/dashboard" : "/register"}
          >
            {isAuthenticated ? "Open app" : "Create"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <section className="relative z-10 min-h-[calc(100vh-80px)] overflow-hidden border-t border-white/10">
        <div className="relative mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl grid-rows-[1fr_auto] px-4 py-12 md:px-6 lg:py-16">
          <div className="homepage-enter grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-200">Lead routing / Follow-ups / Team visibility</p>
              <TypingHeading />
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl sm:leading-9">
                A focused CRM workspace where internal teams capture leads, route ownership, schedule follow-ups, and keep every customer movement visible.
              </p>
            </div>

            <div className="hidden justify-end lg:flex">
              <div className="max-w-sm">
                <div className="flex items-center gap-2 font-mono text-5xl font-semibold text-white/90">
                  <span>&lt;</span>
                  <Activity className="h-16 w-16 text-teal-200" strokeWidth={2.8} />
                  <span>&gt;</span>
                </div>
                <p className="mt-7 text-sm leading-7 text-white/62">
                  Leads are customer records. Admin and Sales User are the only login roles.
                </p>
              </div>
            </div>
          </div>

          <div className="homepage-enter-delayed grid gap-7 pt-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:pt-0">
            <div className="grid gap-5 md:grid-cols-3">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="border-t border-white/18 pt-5">
                  <p className="font-mono text-sm font-semibold text-teal-200">{String(index + 1).padStart(2, "0")}</p>
                  <h2 className="mt-4 text-base font-semibold text-white">{step.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/66">{step.text}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {roleHighlights.map(({ icon: Icon, text, title }) => (
                <div key={title} className="flex gap-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-teal-200" />
                  <div>
                    <h2 className="text-sm font-semibold text-white">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-white/62">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
