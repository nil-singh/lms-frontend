"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const { isAdmin } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAdmin === null) return; // still loading auth state
    if (isAdmin) router.push("/admin"); // admin dashboard
    else router.push("/dashboard/user"); // normal user dashboard
  }, [isAdmin, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading dashboard...</p>
    </div>
  );
}
