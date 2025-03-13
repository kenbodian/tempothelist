'use server';

import { redirect } from "next/navigation";
import { checkUserSubscription } from "@/app/actions";
import { createClient } from "../../supabase/server";
import { ReactNode } from "react";

interface SubscriptionCheckProps {
  children: ReactNode;
}

export function SubscriptionCheck({ children }: SubscriptionCheckProps) {
  return <>{children}</>;
}

async function SubscriptionCheckWrapper({
  children,
  redirectTo = "/pricing",
}: SubscriptionCheckProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user has verified their ID
  const { data: userData, error } = await supabase
    .from("users")
    .select("id_verified")
    .eq("user_id", user.id)
    .single();

  if (error) {
    // If there's an error, try with the user's ID directly
    const { data: userDataById } = await supabase
      .from("users")
      .select("id_verified")
      .eq("id", user.id)
      .single();

    if (userDataById?.id_verified === false) {
      redirect("/verify-id");
    }
  }

  // If ID is not verified, redirect to ID verification page
  if (!userData?.id_verified) {
    redirect("/verify-id");
  }

  const isSubscribed = await checkUserSubscription(user?.id!);

  if (!isSubscribed) {
    redirect(redirectTo);
  }

  // If we reach here, the user is subscribed and can see the children
  return children;
}
