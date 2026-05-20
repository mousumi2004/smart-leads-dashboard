import { LogOut, Menu } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "../common/Button";
import { useAuth } from "../../context/AuthContext";

export function Header() {
  const { isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/82 px-4 py-3 shadow-sm shadow-violet-950/5 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 lg:hidden">
          <Menu className="h-5 w-5 text-stone-600" />
          <span className="text-sm font-semibold text-stone-950">Smart Leads</span>
        </div>
        <nav className="hidden flex-wrap gap-2 lg:flex">
          {[
            { label: "Dashboard", to: "/dashboard" },
            { label: "Leads", to: "/leads" },
            { label: "Follow-ups", to: "/follow-ups" },
            { label: "Analytics", to: "/analytics" },
            ...(isAdmin ? [{ label: "Team", to: "/team" }] : [])
          ].map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                `rounded-md px-2.5 py-1.5 text-sm font-medium transition ${
                  isActive ? "bg-violet-50 text-violet-950" : "text-stone-600 hover:bg-white/70 hover:text-stone-950"
                }`
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-stone-950">{user?.name}</p>
            <p className="text-xs capitalize text-stone-500">{user?.role === "admin" ? "Admin" : "Sales User"}</p>
          </div>
          <Button
            aria-label="Log out"
            className="px-3"
            icon={<LogOut className="h-4 w-4" />}
            type="button"
            variant="ghost"
            onClick={handleLogout}
          >
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
