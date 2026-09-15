import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BusFront,
  ClipboardList,
  Gauge,
  Settings2,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import logo from "@/assets/bcpsc.png";

const navigation = [
  { to: "/", label: "Overview", icon: Gauge },
  { to: "/automation", label: "Auto assign", icon: WandSparkles },
  { to: "/manual", label: "Manual assign", icon: ClipboardList },
  { to: "/settings", label: "System settings", icon: Settings2 },
];

export default function AppShell({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <img src={logo} alt="BCPSC" className="size-8 rounded-lg bg-white p-1 shadow-sm" />
            Transit <span className="text-primary">OS</span>
          </Link>
          <Sparkles className="size-4 text-primary" />
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border/70 bg-card/80 px-3 py-4 backdrop-blur-xl lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-3 px-2">
          <div className="flex size-10 items-center justify-center rounded-xl border bg-white shadow-sm">
            <img src={logo} alt="BCPSC" className="size-7 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Transit <span className="text-primary">OS</span></p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Operations desk</p>
          </div>
        </Link>

        <nav className="space-y-1">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
          {navigation.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <Tooltip key={to}>
                <TooltipTrigger asChild>
                  <Link
                    to={to}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="active-navigation"
                        className="absolute inset-0 -z-0 rounded-xl bg-primary"
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      <Icon className="size-4" />
                      {label}
                    </span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">{label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border bg-muted/35 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium">
            <BusFront className="size-3.5 text-primary" /> Fleet workspace
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">Assignments, routes, and capacity in one place.</p>
        </div>
      </aside>

      <main className="min-h-screen pt-16 lg:pl-64 lg:pt-0">{children}</main>
    </div>
  );
}
