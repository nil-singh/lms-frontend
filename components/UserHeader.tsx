"use client";

import { useState, useEffect } from "react";
import LogoutButton from "@/components/LogoutButton";
import {
  FiList,
  FiTrendingUp,
  FiTrendingDown,
  FiAward,
  FiCheck,
  FiActivity,
  FiBarChart2,
  FiChevronDown,
  FiChevronUp,
  FiMenu,
  FiX,
  FiUser,
  FiSettings,
  FiBell,
} from "react-icons/fi";

type UserHeaderProps = {
  stats: {
    averageScore: number;
    bestScore: number;
    totalQuestionsAnswered: number;
    accuracyRate: number;
    streakRecord: number;
  };
  testHistory: any[];
  getPerformanceTrend: (history: any[]) => "up" | "down" | "neutral";
};

export default function UserHeader({
  stats,
  testHistory,
  getPerformanceTrend,
}: UserHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);
  const [user, setUser] = useState({
    name: "Nilesh",
    avatar: null,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate derived stats
  const completedTests = testHistory?.filter((h) => h.testOver).length;
  const avgDifficulty =
    testHistory?.length > 0
      ? Math.round(
          testHistory.reduce((sum, t) => sum + t.currentDifficulty, 0) /
            testHistory.length
        )
      : 0;

  return (
    <>
      {/* Main Fixed Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 py-3"
            : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left Side - Brand & Navigation */}
            <div className="flex items-center space-x-4">
              {/* Logo / Brand */}
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isScrolled
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                      : "bg-white/20 backdrop-blur-sm text-white"
                  }`}
                >
                  <span className="font-bold text-lg">A</span>
                </div>
                <div>
                  <h1
                    className={`text-xl font-bold ${
                      isScrolled ? "text-gray-900" : "text-white"
                    }`}
                  >
                    Adaptive Learning
                  </h1>
                  <p
                    className={`text-xs ${
                      isScrolled ? "text-gray-600" : "text-white/80"
                    }`}
                  >
                    Intelligent Testing Platform
                  </p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1 ml-8">
                <a
                  href="/dashboard/user"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Analytics
                </a>
                <a
                  href="#"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Resources
                </a>
              </nav>
            </div>

            {/* Right Side - User Actions */}
            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
              <button
                className={`p-2 rounded-lg transition-colors relative ${
                  isScrolled
                    ? "hover:bg-gray-100 text-gray-600"
                    : "hover:bg-white/10 text-white"
                }`}
              >
                <FiBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Desktop User Profile & Actions */}
              <div className="hidden md:flex items-center space-x-3">
                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p
                      className={`font-medium text-sm ${
                        isScrolled ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {user.name}
                    </p>
                    <p
                      className={`text-xs ${
                        isScrolled ? "text-gray-600" : "text-white/80"
                      }`}
                    >
                      Student Account
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full border-2 ${
                      isScrolled
                        ? "border-gray-200 bg-gradient-to-r from-blue-100 to-indigo-100"
                        : "border-white/30 bg-gradient-to-r from-blue-400 to-indigo-400"
                    } flex items-center justify-center`}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <span
                        className={`font-semibold ${
                          isScrolled ? "text-blue-600" : "text-white"
                        }`}
                      >
                        {user.name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Settings */}
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    isScrolled
                      ? "hover:bg-gray-100 text-gray-600"
                      : "hover:bg-white/10 text-white"
                  }`}
                >
                  <FiSettings size={20} />
                </button>

                {/* Logout Button - Desktop */}
                <LogoutButton />
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isScrolled
                    ? "hover:bg-gray-100 text-gray-600"
                    : "hover:bg-white/10 text-white"
                }`}
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
              <div className="flex flex-col space-y-2">
                <a
                  href="/dashboard/user"
                  className="text-white hover:bg-white/10 py-2 px-4 rounded-lg"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="text-white hover:bg-white/10 py-2 px-4 rounded-lg"
                >
                  Analytics
                </a>
                <a
                  href="#"
                  className="text-white hover:bg-white/10 py-2 px-4 rounded-lg"
                >
                  Resources
                </a>
                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center space-x-3 px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center">
                      <span className="font-semibold text-white">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-white/80 text-sm">Student Account</p>
                    </div>
                  </div>
                  <div className="px-4">
                    <LogoutButton variant="mobile" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-10"></div>

      {/* Dashboard Stats Section (Collapsible) */}
    </>
  );
}
