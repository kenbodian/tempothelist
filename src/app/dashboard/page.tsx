import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import {
  InfoIcon,
  UserCircle,
  Star,
  Search,
  Plane,
  Users,
  Clock,
} from "lucide-react";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { checkUserSubscription } from "@/app/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check if user has verified their ID
  const { data: userData, error } = await supabase
    .from("users")
    .select("id_verified")
    .eq("user_id", user.id)
    .single();

  // Try alternate user ID check if needed
  if (error || !userData) {
    const { data: userDataById } = await supabase
      .from("users")
      .select("id_verified")
      .eq("id", user.id)
      .single();

    if (!userDataById?.id_verified) {
      return redirect("/verify-id");
    }
  } else if (!userData.id_verified) {
    return redirect("/verify-id");
  }

  // Check subscription
  const isSubscribed = await checkUserSubscription(user.id);
  if (!isSubscribed) {
    return redirect("/pricing");
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Pilot Dashboard</h1>
            <div className="bg-blue-50 text-sm p-3 px-4 rounded-lg text-blue-700 flex gap-2 items-center border border-blue-100">
              <InfoIcon size="14" />
              <span>
                Welcome to your PilotRatings dashboard. Here you can manage your
                profile, view ratings, and connect with other pilots.
              </span>
            </div>
          </header>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Rating</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8/5.0</div>
                <p className="text-xs text-muted-foreground">
                  Based on 24 reviews
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ratings Given
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Pilots you've rated
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Subscription
                </CardTitle>
                <Clock className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">Premium Plan</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Profile Views
                </CardTitle>
                <Search className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="#" className="block p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-3 rounded-full mb-4">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Find Pilots</h3>
                  <p className="text-sm text-gray-600">
                    Search for pilots by name, airline, or aircraft type
                  </p>
                </div>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="#" className="block p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-3 rounded-full mb-4">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Submit Rating</h3>
                  <p className="text-sm text-gray-600">
                    Rate a pilot you've flown with recently
                  </p>
                </div>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="#" className="block p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-3 rounded-full mb-4">
                    <UserCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Update Profile</h3>
                  <p className="text-sm text-gray-600">
                    Keep your pilot information current
                  </p>
                </div>
              </Link>
            </Card>
          </section>

          {/* User Profile Section */}
          <section className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <Plane className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-xl">Pilot Profile</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Personal Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="text-sm">
                        {user.user_metadata?.full_name || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Member Since</p>
                      <p className="text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        Verification Status
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        Verified Pilot
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Aviation Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Airline</p>
                      <p className="text-sm">Not provided</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Position</p>
                      <p className="text-sm">Not provided</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Aircraft Type</p>
                      <p className="text-sm">Not provided</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Base</p>
                      <p className="text-sm">Not provided</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
