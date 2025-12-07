"use client";

import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/authSlice";
import Cookies from "js-cookie";

type LogoutButtonProps = {
  variant?: "default" | "mobile";
};

export default function LogoutButton({
  variant = "default",
}: LogoutButtonProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    dispatch(logout());
    router.push("/");
  };

  if (variant === "mobile") {
    return (
      <button
        onClick={handleLogout}
        className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow"
      >
        <FiLogOut size={18} />
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="cursor-pointer hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow"
    >
      <FiLogOut size={18} />
      Logout
    </button>
  );
}
