import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href && {
  item: {
    "@id": item.href.startsWith("http")
      ? item.href
      : `${process.env.NEXT_PUBLIC_SITE_URL}${item.href}`,
  },
}),
    })),
  };

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className={cn("flex items-center gap-1 text-sm", className)}
      >
        <ol className="flex items-center gap-1 flex-wrap">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              {item.href && index < items.length - 1 ? (
                <Link
                  href={item.href}
                  className="hover:underline underline-offset-2 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={index === items.length - 1 ? "font-medium opacity-70" : ""}
                  aria-current={index === items.length - 1 ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
