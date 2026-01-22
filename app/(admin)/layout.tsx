"use client";

import type React from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { useAuth } from "@/contexts/auth-context";
import { LoadingPage } from "@/components/ui/loading";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check if on admin login page
  const isLoginPage = pathname === "/admin/login";

  // Redirect non-admin users (but not on login page)
  useEffect(() => {
    if (!isLoading && !isLoginPage) {
      if (!user) {
        router.push("/admin/login");
      } else if (!user.is_staff) {
        router.push("/dashboard");
      }
    }
  }, [isLoading, user, router, isLoginPage]);

  // Admin login page - render without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingPage message="Loading admin panel..." />
      </div>
    );
  }

  // Not logged in - redirect handled by useEffect
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingPage message="Redirecting to login..." />
      </div>
    );
  }

  // Check if user is admin
  if (!user.is_staff) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 md:ml-72">
        <div className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
