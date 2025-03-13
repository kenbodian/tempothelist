import Link from "next/link";
import { ArrowUpRight, Check, Plane } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient with aviation-themed colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-blue-50 opacity-80" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 opacity-10 transform -rotate-12">
        <Image
          src="/pilot-logo.svg"
          alt="PilotRatings Logo"
          width={128}
          height={128}
          className="text-blue-800"
        />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 transform rotate-12">
        <Image
          src="/pilot-logo.svg"
          alt="PilotRatings Logo"
          width={128}
          height={128}
          className="text-blue-800"
        />
      </div>

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              The{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                Pilot Rating
              </span>{" "}
              Platform for Aviation Professionals
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Elevate your aviation career with honest peer feedback. Our secure
              platform connects pilots for confidential ratings on professional
              and personal characteristics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Join as a Pilot
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="#pricing"
                className="inline-flex items-center px-8 py-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
              >
                View Subscription Plans
              </Link>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-500" />
                <span>Verified pilot credentials</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-500" />
                <span>Anonymous feedback system</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-500" />
                <span>Secure & confidential</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
