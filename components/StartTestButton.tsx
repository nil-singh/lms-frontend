"use client";

import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";

export default function StartTestButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function begin() {
    try {
      setLoading(true);

      const res = await api.post("/tests/start");

      console.log("START TEST RESPONSE:", res.data);

      const testId = res.data._id;

      if (!testId) {
        console.error("NO TEST ID FOUND in response:", res.data);
        alert("Invalid test response");
        return;
      }

      router.push(`/test/${testId}`);
    } catch (err: any) {
      console.error("Start test failed:", err?.response?.data || err);
      alert(
        "Could not start test: " +
          (err?.response?.data?.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={begin}
      disabled={loading}
      className=" cursor-pointer px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg 
                 hover:bg-blue-700 transition disabled:opacity-50"
    >
      {loading ? "Starting..." : "Start Test"}
    </button>
  );
}
