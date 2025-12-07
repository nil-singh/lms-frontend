"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LandingPage() {
  const router = useRouter();

  const handleStart = () => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
    } else {
      router.push("/test/start");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="w-full py-4 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">LMS System</h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/login")}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/register")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center text-center px-4">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Master Your Skills with Adaptive Learning
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Our intelligent testing system adjusts question difficulty in
            real-time based on how you answer.
          </p>

          <button
            onClick={handleStart}
            className="mt-8 px-8 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700 transition"
          >
            Start Test
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} LMS Adaptive Testing · All Rights Reserved
      </footer>
    </div>
  );
}
