"use client";

import { User } from "@supabase/supabase-js";
import { UserMenu } from "./user-menu";

interface DashboardGreetingProps {
  user: User | null;
  userName: string;
  sermonCount: number;
  avatarUrl?: string | null;
}

export function DashboardGreeting({ user, userName, sermonCount, avatarUrl }: DashboardGreetingProps) {
  return (
    <header className="mb-10">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground/90">
          Olá, {userName}
        </h1>
        <UserMenu user={user} avatarUrl={avatarUrl} showDetails={false} />
      </div>
      <p className="text-sm text-muted-foreground/60">
        {sermonCount === 0 
          ? "Comece criando seu primeiro sermão"
          : `${sermonCount} sermão${sermonCount !== 1 ? "s" : ""} na sua biblioteca`
        }
      </p>
    </header>
  );
}
