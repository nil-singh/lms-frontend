"use client";

import UserHeader from "@/components/UserHeader";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StartTest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function begin() {
    try {
      setLoading(true);
      const res = await api.post("/tests/start");

      const testId = res.data._id; // <-- ✔ Here is your testId

      router.push(`/test/${testId}`);
    } catch (err) {
      console.error("Start test failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <UserHeader stats={{
        averageScore: 0,
        bestScore: 0,
        totalQuestionsAnswered: 0,
        accuracyRate: 0,
        streakRecord: 0
      }} testHistory={[]} getPerformanceTrend={function (history: any[]): "up" | "down" | "neutral" {
        throw new Error("Function not implemented.");
      } } />
      <div className="flex justify-center pt-10 mt-10">
        <button
          onClick={begin}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Starting..." : "Start Test"}
        </button>
      </div>
    </>
  );
}
