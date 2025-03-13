import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import { createClient } from "../../supabase/server";
import {
  ArrowUpRight,
  CheckCircle2,
  Shield,
  Users,
  Star,
  Plane,
  BadgeCheck,
  Lock,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose PilotRatings</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing the way pilots connect and grow
              professionally with transparent, verified peer ratings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <BadgeCheck className="w-6 h-6" />,
                title: "Verified Pilots",
                description: "All users are verified aviation professionals",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure & Private",
                description: "Military-grade encryption for your data",
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: "Honest Feedback",
                description: "Anonymous ratings for authentic insights",
              },
              {
                icon: <Plane className="w-6 h-6" />,
                title: "Aviation Focused",
                description: "Built by pilots, for pilots",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-blue-100"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-blue-100">Verified Pilots</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25,000+</div>
              <div className="text-blue-100">Ratings Submitted</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-blue-100">Airlines Represented</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How PilotRatings Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to give and receive professional
              feedback from your aviation peers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                1. Create Your Account
              </h3>
              <p className="text-gray-600">
                Register and verify your pilot credentials through our secure
                verification process.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                2. Connect With Peers
              </h3>
              <p className="text-gray-600">
                Find fellow pilots you've flown with and submit confidential,
                constructive ratings.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                3. Grow Professionally
              </h3>
              <p className="text-gray-600">
                Receive valuable feedback on your professional and personal
                characteristics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Subscription Plans</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your professional development needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans?.map((item: any) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Pilots Are Saying</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from aviation professionals who use PilotRatings to enhance
              their careers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "PilotRatings has been invaluable for my professional growth.
                The feedback I've received has helped me become a better captain
                and mentor."
              </p>
              <div className="font-semibold">Captain Michael T.</div>
              <div className="text-sm text-gray-500">
                Boeing 787 Pilot, Major Airline
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "As a new first officer, the constructive feedback from
                experienced pilots has been crucial to my development. This
                platform bridges the gap between formal training and real-world
                experience."
              </p>
              <div className="font-semibold">First Officer Sarah K.</div>
              <div className="text-sm text-gray-500">
                Airbus A320 Pilot, Regional Carrier
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "The anonymous rating system allows for honest feedback that you
                simply can't get elsewhere. It's transformed how I approach crew
                resource management."
              </p>
              <div className="font-semibold">Captain James R.</div>
              <div className="text-sm text-gray-500">
                Embraer E190 Pilot, Charter Operations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Elevate Your Aviation Career?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professional pilots who trust PilotRatings for
            honest peer feedback.
          </p>
          <a
            href="/sign-up"
            className="inline-flex items-center px-8 py-4 text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
          >
            Get Started Now
            <ArrowUpRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
