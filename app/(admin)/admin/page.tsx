"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Users,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Download,
  RefreshCw,
  Activity,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";
import Link from "next/link";
import { adminService, type AdminStats } from "@/lib/services/admin";
import { Progress } from "@/components/ui/progress";

const recentActivity = [
  { id: 1, action: "Payment approved", country: "Germany", time: "2 min ago", type: "success" },
  { id: 2, action: "New participant added", country: "Japan", time: "15 min ago", type: "info" },
  { id: 3, action: "Travel info submitted", country: "Brazil", time: "32 min ago", type: "info" },
  { id: 4, action: "Payment rejected", country: "France", time: "1 hour ago", type: "error" },
  { id: 5, action: "Stage unlocked", country: "India", time: "2 hours ago", type: "warning" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await adminService.getStats();
        setStats(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch stats:", err);
        setError(err?.message || "Failed to load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error || !stats) {
    return <ErrorDisplay message={error || "Failed to load data"} />;
  }

  const paymentProgress = Math.round((stats.payments.approved / stats.total_countries) * 100);
  const registrationProgress = Math.round((stats.stages.participants / stats.total_countries) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview of IChO 2026 registration progress
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:opacity-90"
            onClick={async () => {
              const blob = await adminService.exportAnalytics();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "icho_analytics.xlsx";
              a.click();
            }}
          >
            <Download className="w-4 h-4" />
            Export Analytics
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Countries</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total_countries}</p>
              <p className="text-sm text-blue-600/80 mt-1">
                {stats.active_countries} active
              </p>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
              <Globe className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Total Participants</p>
              <p className="text-3xl font-bold text-emerald-900 mt-1">{stats.total_participants}</p>
              <p className="text-sm text-emerald-600/80 mt-1">
                pre-reg {stats.total_participants} | detailed {stats.registered_participants}
              </p>
            </div>
            <div className="p-3 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/30">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <Link href="/admin/participants" className="mt-3 inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800">
            Review now <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Pending Payments</p>
              <p className="text-3xl font-bold text-amber-900 mt-1">{stats.payments.pending}</p>
              <p className="text-sm text-amber-600/80 mt-1">
                requires review
              </p>
            </div>
            <div className="p-3 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/30">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
          <Link href="/admin/payments?status=PENDING" className="mt-3 inline-flex items-center text-sm font-medium text-amber-700 hover:text-amber-800">
            Review now <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                ${stats.payments.total_amount.toLocaleString()}
              </p>
              <p className="text-sm text-purple-600/80 mt-1">
                from {stats.payments.approved} approved
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl shadow-lg shadow-purple-500/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Overview & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Funnel */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Registration Funnel</h2>
              <p className="text-sm text-gray-500">Country progress through stages</p>
            </div>
            <Link href="/admin/workflow">
              <Button variant="ghost" size="sm" className="text-[#2f3090]">
                View details
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {[
              { name: "Pre-Registration", count: stats.stages.pre_registration, color: "bg-blue-500" },
              { name: "Payment", count: stats.stages.payment, color: "bg-amber-500" },
              { name: "Participants", count: stats.stages.participants, color: "bg-emerald-500" },
              { name: "Travel", count: stats.stages.travel, color: "bg-purple-500" },
              { name: "Invitations", count: stats.stages.invitations, color: "bg-pink-500" },
            ].map((stage, index) => {
              const percentage = Math.round((stage.count / stats.total_countries) * 100);
              return (
                <div key={stage.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{stage.name}</span>
                    <span className="text-gray-500">
                      {stage.count} / {stats.total_countries} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/admin/audit-logs">
              <Button variant="ghost" size="sm" className="text-[#2f3090]">
                View all
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`mt-0.5 p-1.5 rounded-full ${
                  activity.type === "success" ? "bg-emerald-100 text-emerald-600" :
                  activity.type === "error" ? "bg-red-100 text-red-600" :
                  activity.type === "warning" ? "bg-amber-100 text-amber-600" :
                  "bg-blue-100 text-blue-600"
                }`}>
                  {activity.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                   activity.type === "error" ? <XCircle className="w-3.5 h-3.5" /> :
                   activity.type === "warning" ? <AlertCircle className="w-3.5 h-3.5" /> :
                   <Activity className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.country}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Participants by Role & Payment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participants by Role */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Registered Participants by Role</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { role: "Head Mentors", count: stats.registered_by_role.head_mentors, color: "bg-[#1a1a5c]", icon: "HM" },
              { role: "Mentors", count: stats.registered_by_role.mentors, color: "bg-[#2f3090]", icon: "M" },
              { role: "Students", count: stats.registered_by_role.students, color: "bg-[#00795d]", icon: "S" },
              { role: "Observers", count: stats.registered_by_role.observers, color: "bg-purple-500", icon: "O" },
              { role: "Guests", count: stats.registered_by_role.guests, color: "bg-orange-500", icon: "G" },
              { role: "Remote Translators", count: stats.registered_by_role.remote_translators, color: "bg-teal-500", icon: "RT" },
            ].map((item) => (
              <div
                key={item.role}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-md`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                  <p className="text-sm text-gray-500">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link href="/admin/participants">
              <Button variant="outline" className="w-full">
                View All Participants
              </Button>
            </Link>
          </div>
        </Card>

        {/* Payment Status */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="font-semibold text-emerald-900">Approved</p>
                  <p className="text-sm text-emerald-600">{paymentProgress}% of countries</p>
                </div>
              </div>
              <span className="text-3xl font-bold text-emerald-700">{stats.payments.approved}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="font-semibold text-amber-900">Pending Review</p>
                  <p className="text-sm text-amber-600">Awaiting approval</p>
                </div>
              </div>
              <span className="text-3xl font-bold text-amber-700">{stats.payments.pending}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-semibold text-red-900">Rejected</p>
                  <p className="text-sm text-red-600">Needs resubmission</p>
                </div>
              </div>
              <span className="text-3xl font-bold text-red-700">{stats.payments.rejected}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link href="/admin/payments">
              <Button variant="outline" className="w-full">
                Manage Payments
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/payments?status=PENDING">
            <div className="p-4 border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-all cursor-pointer group">
              <CreditCard className="w-8 h-8 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Review Payments</p>
              <p className="text-sm text-gray-500">{stats.payments.pending} pending</p>
            </div>
          </Link>

          <Link href="/admin/countries">
            <div className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group">
              <Globe className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Manage Countries</p>
              <p className="text-sm text-gray-500">{stats.total_countries} registered</p>
            </div>
          </Link>

          <Link href="/admin/workflow">
            <div className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group">
              <Clock className="w-8 h-8 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Edit Deadlines</p>
              <p className="text-sm text-gray-500">5 stages</p>
            </div>
          </Link>

          <Link href="/admin/audit-logs">
            <div className="p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer group">
              <Activity className="w-8 h-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">View Audit Logs</p>
              <p className="text-sm text-gray-500">Activity history</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
