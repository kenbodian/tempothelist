import { redirect } from "next/navigation";
import { checkUserSubscription } from "@/app/actions";
import { createClient } from "../../supabase/server";

interface SubscriptionCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export async function SubscriptionCheck({
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

    if (userDataById) {
      return userDataById;
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

  return <>{children}</>;
}
