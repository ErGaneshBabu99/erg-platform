"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { Bell, LogOut, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {/* Breadcrumb will be injected by individual pages */}
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name ?? user.email}</div>
            <Badge variant="navy" className="text-xs capitalize">{user.role?.toLowerCase().replace("_", " ")}</Badge>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
