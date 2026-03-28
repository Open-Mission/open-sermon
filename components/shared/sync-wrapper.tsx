"use client";

import { SyncProvider } from "@/hooks/use-sync";
import { type ReactNode } from "react";

interface SyncWrapperProps {
  children: ReactNode;
  userId: string;
}

export function SyncWrapper({ children, userId }: SyncWrapperProps) {
  return <SyncProvider userId={userId}>{children}</SyncProvider>;
}
