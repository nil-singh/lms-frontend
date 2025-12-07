"use client";

import { useState, useEffect } from "react";
import LogoutButton from "@/components/LogoutButton";
import {
  FiUsers,
  FiFileText,
  FiSettings,
  FiBarChart2,
  FiDatabase,
  FiShield,
  FiMenu,
  FiX,
  FiBell,
} from "react-icons/fi";

type AdminHeaderProps = {
  stats?: {
    totalUsers?: number;
    totalQuestions?: number;
    totalTests?: number;
    activeUsers?: number;
    avgTestScore?: number;
    platformUptime?: number;
  };
  recentActivity?: any[];
};

export default function AdminHeader({
  stats = {
    totalUsers: 0,
    totalQuestions: 0,
    totalTests: 0,
    activeUsers: 0,
    avgTestScore: 0,
    platformUptime: 100,
  },
  recentActivity = [],
}: AdminHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);
  const [admin, setAdmin] = useState({
    name: "Admin",
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
  const systemHealth =
    stats.platformUptime >= 99
      ? "excellent"
      : stats.platformUptime >= 95
      ? "good"
      : "warning";

  return (
    <>
      {/* Main Fixed Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 py-3"
            : "bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 py-4"
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
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-white/20 backdrop-blur-sm text-white"
                  }`}
                >
                  <FiShield size={20} />
                </div>
                <div>
                  <h1
                    className={`text-xl font-bold ${
                      isScrolled ? "text-gray-900" : "text-white"
                    }`}
                  >
                    Admin
                  </h1>
                  <p
                    className={`text-xs ${
                      isScrolled ? "text-gray-600" : "text-white/80"
                    }`}
                  >
                    Platform Management System
                  </p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1 ml-8">
                <a
                  href="/admin"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:text-purple-600 hover:bg-gray-100"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <FiBarChart2 className="inline mr-2" />
                  Dashboard
                </a>
                <a
                  href="/admin/questions"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:text-purple-600 hover:bg-gray-100"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <FiFileText className="inline mr-2" />
                  Questions
                </a>
                <a
                  href="/admin/all-results"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:text-purple-600 hover:bg-gray-100"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <FiDatabase className="inline mr-2" />
                  Results
                </a>

                <a
                  href="/admin/users"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:text-purple-600 hover:bg-gray-100"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <FiUsers className="inline mr-2" />
                  Users
                </a>
                <a
                  href="/admin/settings"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:text-purple-600 hover:bg-gray-100"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <FiSettings className="inline mr-2" />
                  Settings
                </a>
              </nav>
            </div>

            {/* Right Side - Admin Actions */}
            <div className="flex items-center space-x-3">
              {/* System Health Indicator */}
              <div
                className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full ${
                  isScrolled
                    ? systemHealth === "excellent"
                      ? "bg-green-100 text-green-800"
                      : systemHealth === "good"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                    : "bg-white/20 text-white"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    systemHealth === "excellent"
                      ? "bg-green-500"
                      : systemHealth === "good"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs font-medium">
                  {stats.platformUptime}% Uptime
                </span>
              </div>

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

              {/* Desktop Admin Profile & Actions */}
              <div className="hidden md:flex items-center space-x-3">
                {/* Admin Profile */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p
                      className={`font-medium text-sm ${
                        isScrolled ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {admin.name}
                    </p>
                    <p
                      className={`text-xs ${
                        isScrolled ? "text-gray-600" : "text-white/80"
                      }`}
                    >
                      Administrator
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full border-2 ${
                      isScrolled
                        ? "border-gray-200 bg-gradient-to-r from-purple-100 to-pink-100"
                        : "border-white/30 bg-gradient-to-r from-purple-400 to-pink-400"
                    } flex items-center justify-center`}
                  >
                    {admin.avatar ? (
                      <img
                        src={admin.avatar}
                        alt={admin.name}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <span
                        className={`font-semibold ${
                          isScrolled ? "text-purple-600" : "text-white"
                        }`}
                      >
                        {admin.name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Actions Dropdown */}
                <div className="relative group">
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      isScrolled
                        ? "hover:bg-gray-100 text-gray-600"
                        : "hover:bg-white/10 text-white"
                    }`}
                  >
                    <FiSettings size={20} />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <a
                        href="/admin/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        System Settings
                      </a>
                      <a
                        href="/admin/logs"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        System Logs
                      </a>
                      <a
                        href="/admin/backup"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Backup & Restore
                      </a>
                      <div className="border-t border-gray-200 my-1"></div>
                      <a
                        href="/admin/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Profile
                      </a>
                    </div>
                  </div>
                </div>

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
                  href="/admin"
                  className="text-white hover:bg-white/10 py-2 px-4 rounded-lg flex items-center"
                >
                  <FiBarChart2 className="mr-3" />
                  Dashboard
                </a>
                <a
                  href="/admin/questions"
                  className="text-white hover:bg-white/10 py-2 px-4 rounded-lg flex items-center"
                >
                  <FiFileText className="mr-3" />
                  Questions
                </a>
                <a
                  href="/admin/users"
                  className="text-white hover:bg-white/10 py-2 px-4 rounded-lg flex items-center"
                >
                  <FiUsers className="mr-3" />
                  Users
                </a>
                <a
                  href="/admin/all-results"
                  className="text-white hover:bg-white/10 py-2 px-4 rounded-lg flex items-center"
                >
                  <FiDatabase className="mr-3" />
                  Results
                </a>
                <a
                  href="/admin/settings"
                  className="text-white hover:bg-white/10 py-2 px-4 rounded-lg flex items-center"
                >
                  <FiSettings className="mr-3" />
                  Settings
                </a>
                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center space-x-3 px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="font-semibold text-white">
                        {admin.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{admin.name}</p>
                      <p className="text-white/80 text-sm">Administrator</p>
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
      <div className="h-20 mt-10"></div>
    </>
  );
}
