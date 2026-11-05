"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function NavbarActions({ user }: { user: any }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <Link href="/profile">
          <Button
            variant="ghost"
            size="sm"
            className="font-bold text-brand-text-primary flex items-center gap-2 bg-brand-bg-warm rounded-md px-3 h-10 border border-brand-border"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </Button>
        </Link>
      </div>

      <Link href="/owner/new" className="hidden sm:block">
        <Button
          size="sm"
          className="bg-brand-teal hover:bg-brand-teal-mid text-white rounded-pill px-6 font-bold h-10 shadow-teal"
        >
          Post Free
        </Button>
      </Link>
    </div>
  );
}
