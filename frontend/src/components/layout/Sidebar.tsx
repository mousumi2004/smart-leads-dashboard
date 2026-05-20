import { BarChart3, Calendar, Plus, Target, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/follow-ups", label: "Follow-ups", icon: Calendar },
  { to: "/analytics", label: "Analytics", icon: Target },
  { to: "/leads/new", label: "New Lead", icon: Plus }
];

export function Sidebar() {
  const { isAdmin } = useAuth();
  const visibleItems = isAdmin ? [...navItems.slice(0, 4), { to: "/team", label: "Team", icon: Users }, navItems[4]] : navItems;

  return (
    <aside className="hidden min-h-screen w-64 border-r border-white/10 bg-[linear-gradient(180deg,#24104f_0%,#17315f_48%,#083f49_100%)] px-4 py-5 text-white lg:block">
      <div className="px-2">
        <p className="text-sm font-semibold tracking-wide text-white">Smart Leads</p>
        <p className="mt-1 text-xs text-teal-100/75">{isAdmin ? "Admin workspace" : "Sales workspace"}</p>
      </div>
      <nav className="mt-8 grid gap-1">
        {visibleItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-white text-stone-950" : "text-white/72 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
