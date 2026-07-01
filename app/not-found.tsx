import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-display font-bold text-navy-600/10 dark:text-navy-400/10 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist. It may have been moved or deleted.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button leftIcon={<Home className="w-4 h-4" />}>Go Home</Button>
          </Link>
          <Link href="/district-rate">
            <Button variant="secondary" leftIcon={<Search className="w-4 h-4" />}>
              Search District Rates
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
