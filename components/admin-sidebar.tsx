"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Globe,
  CreditCard,
  Users,
  GitBranch,
  ScrollText,
  Menu,
  X,
  LogOut,
  Settings,
  Shield,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";

const adminNavigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview & metrics",
  },
  {
    name: "Countries",
    href: "/admin/countries",
    icon: Globe,
    description: "Manage delegations",
  },
  {
    name: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    description: "Review & approve",
  },
  {
    name: "Participants",
    href: "/admin/participants",
    icon: Users,
    description: "All registrations",
  },
  {
    name: "Travel",
    href: "/admin/travel",
    icon: Plane,
    description: "Travel & accommodation",
  },
  {
    name: "Workflow",
    href: "/admin/workflow",
    icon: GitBranch,
    description: "Stages & deadlines",
  },
  {
    name: "Audit Logs",
    href: "/admin/audit-logs",
    icon: ScrollText,
    description: "Activity history",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-72 bg-slate-900 text-white transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">IChO 2026</h2>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* User info */}
          {user && (
            <div className="px-5 py-4 border-b border-slate-700 bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.country?.name?.[0] || "A"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.country?.name || "Administrator"}
                  </p>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-0 text-xs px-2 py-0">
                    Admin
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider px-3">
              Management
            </p>
            <ul className="space-y-1">
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white shadow-lg shadow-[#2f3090]/25"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <item.icon className={cn(
                        "w-5 h-5 transition-colors",
                        isActive ? "text-white" : "text-slate-400"
                      )} />
                      <div className="flex-1">
                        <span>{item.name}</span>
                        {!isActive && (
                          <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
            <p>57th International Chemistry Olympiad</p>
            <p className="mt-1">Uzbekistan 2026</p>
          </div>
        </div>
      </aside>
    </>
  );
}
