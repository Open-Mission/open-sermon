import * as React from "react";
import Image from "next/image";
import { DesignBackground } from "@/components/shared/design-background";
import { Link } from "@/i18n/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 lg:py-24 overflow-hidden">
      <DesignBackground />
      
      <div className="absolute top-8 left-8 hidden lg:block">
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
          <div className="size-8 relative rounded-lg overflow-hidden border shadow-sm">
            <Image src="/logo.png" alt="Open Sermon" fill className="object-cover" />
          </div>
          <span>Open Sermon</span>
        </Link>
      </div>

      <div className="w-full max-w-[440px] z-10 animate-in fade-in zoom-in duration-500">
        {children}
      </div>

      <div className="mt-8 text-center z-10 lg:hidden">
        <Link href="/" className="flex items-center justify-center gap-2 font-heading font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
          <div className="size-7 relative rounded-lg overflow-hidden border shadow-sm">
            <Image src="/logo.png" alt="Open Sermon" fill className="object-cover" />
          </div>
          <span>Open Sermon</span>
        </Link>
      </div>
    </div>
  );
}
