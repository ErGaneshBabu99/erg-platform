"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Upload, BarChart2,
  MessageSquare, Settings, ChevronLeft, ChevronRight,
  Globe, Users, Shield, Database
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "District Rates", href: "/admin/district-rates", icon: FileText },
  { label: "Upload PDF", href: "/admin/district-rates/new", icon: Upload },
  { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { label: "Districts", href: "/admin/districts", icon: Database },
  { label: "Users", href: "/admin/users", icon: Users, roles: ["SUPER_ADMIN", "ADMIN"] },
  { label: "Audit Log", href: "/admin/audit", icon: Shield, roles: ["SUPER_ADMIN", "ADMIN"] },
  { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["SUPER_ADMIN"] },
];

interface AdminSidebarProps {
  userRole: string;
}

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside
      className={cn(
        "flex flex-col bg-navy-950 border-r border-white/5 transition-all duration-300 flex-shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm font-display">E</span>
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold font-display text-sm">Er G Admin</div>
            <div className="text-navy-400 text-xs">Control Panel</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5" aria-label="Admin navigation">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-navy-300 hover:bg-white/5 hover:text-white",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* View Site */}
      <div className="p-2 border-t border-white/5">
        <Link
          href="/"
          target="_blank"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-navy-400 hover:text-white hover:bg-white/5 transition-all",
            collapsed && "justify-center"
          )}
          title={collapsed ? "View Site" : undefined}
        >
          <Globe className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>View Site</span>}
        </Link>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-white/5 text-navy-400 hover:text-white transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
