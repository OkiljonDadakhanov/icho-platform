"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  UsersRound,
  Plane,
  FileText,
  Menu,
  X,
  CreditCard,
  ClipboardList,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

const navigation = [
  { name: "Pre-Registration", href: "/pre-registration", icon: ClipboardList },
  { name: "Payment", href: "/payment", icon: CreditCard },
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Coordinators", href: "/coordinators", icon: Users },
  { name: "Team", href: "/team", icon: UsersRound },
  { name: "Travel", href: "/travel", icon: Plane },
  { name: "Invitations", href: "/invitations", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b bg-[#2f3090]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md overflow-hidden p-1">
                <img src="/images/icho_logo.png" alt="IChO" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">SOCenter</h2>
                <p className="text-xs text-white/70 tracking-wider">IChO 2026</p>
              </div>
            </div>
          </div>

          {user && (
            <div className="p-4 border-b bg-gray-50">
              <p className="text-sm font-medium text-gray-900 truncate">
                Team
              </p>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Registration
            </p>
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#2f3090]/10 text-[#2f3090]"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="flex-1">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Admin Link - Only for staff users */}
          {user?.is_staff && (
            <div className="p-4 border-t">
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white hover:opacity-90 transition-opacity"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            </div>
          )}

          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="p-4 border-t text-xs text-muted-foreground">
            <p>58th International Chemistry Olympiad</p>
            <p className="mt-1">
              Copyright - 2026 IChO Uzbekistan by Dadaxanov Oqiljon
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
