import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import { UploadIdForm } from "@/components/upload-id-form";
import { FormMessage, Message } from "@/components/form-message";

export default async function VerifyIdPage({
  searchParams,
}: {
  searchParams: Promise<Message>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check if user already has verified ID
  const { data: userData } = await supabase
    .from("users")
    .select("id_verified")
    .eq("id", user.id)
    .single();

  // If ID is already verified, redirect to dashboard
  if (userData?.id_verified) {
    return redirect("/dashboard");
  }

  const message = await searchParams;

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">
                Verify Pilot ID
              </h1>
              <p className="text-sm text-muted-foreground">
                Please upload a photo of your airline ID to verify your
                employment
              </p>
            </div>

            <UploadIdForm userId={user.id} />

            {"message" in message && <FormMessage message={message} />}
          </div>
        </div>
      </div>
    </>
  );
}
