import { CheckCircle2, CircleDot, PhoneCall, TrendingUp, XCircle } from "lucide-react";
import type { LeadStats } from "../../types/lead";

interface StatConfig {
  label: string;
  value: number;
  icon: typeof TrendingUp;
  tone: string;
}

export function StatsGrid({ stats }: { stats: LeadStats }) {
  const items: StatConfig[] = [
    { label: "Total leads", value: stats.total, icon: TrendingUp, tone: "text-stone-900 bg-stone-100" },
    { label: "New", value: stats.New, icon: CircleDot, tone: "text-blue-700 bg-blue-50" },
    { label: "Contacted", value: stats.Contacted, icon: PhoneCall, tone: "text-amber-700 bg-amber-50" },
    { label: "Qualified", value: stats.Qualified, icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-50" },
    { label: "Lost", value: stats.Lost, icon: XCircle, tone: "text-stone-700 bg-stone-100" }
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map(({ icon: Icon, label, tone, value }) => (
        <div key={label} className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-stone-500">{label}</p>
            <span className={`rounded-md p-2 ${tone}`}>
              <Icon className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-normal text-stone-950">{value}</p>
        </div>
      ))}
    </section>
  );
}
