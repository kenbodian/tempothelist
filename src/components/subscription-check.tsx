'use server';

import { ReactNode } from "react";

interface SubscriptionCheckProps {
  children: ReactNode;
}

export function SubscriptionCheck({ children }: SubscriptionCheckProps) {
  return <>{children}</>;
}
