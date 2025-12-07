"use client";

import AdminHeader from "@/components/AdminHeader";
import LogoutButton from "@/components/LogoutButton";
import { useRouter } from "next/navigation";
import {
  FiSettings,
  FiFileText,
  FiUsers,
  FiBarChart2,
  FiLogOut,
} from "react-icons/fi";

export default function AdminDashboard() {
  const router = useRouter();


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <AdminHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Questions
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">142</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FiSettings className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Updated 2 hours ago</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tests Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">324</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FiFileText className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">+12% from last week</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">89</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <FiUsers className="text-purple-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Currently online</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">78.5%</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <FiBarChart2 className="text-orange-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Across all tests</p>
          </div>
        </div>

        {/* Quick Actions Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <p className="text-gray-600">Manage your platform efficiently</p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manage Questions Card */}
          <div
            onClick={() => router.push("/admin/questions")}
            className="group cursor-pointer bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                    Content Management
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Manage Questions
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create, edit, and organize test questions. Categorize by
                    difficulty and topic.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Add multiple choice questions
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Set difficulty levels
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Import/export question sets
                    </li>
                  </ul>
                </div>
                <div className="ml-6 p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FiSettings size={32} />
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                  Go to Questions →
                </button>
              </div>
            </div>
          </div>

          {/* Test Results Card */}
          <div
            onClick={() => router.push("/admin/all-results")}
            className="group cursor-pointer bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                    Analytics & Reports
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Test Results
                  </h3>
                  <p className="text-gray-600 mb-6">
                    View detailed analytics, performance reports, and user
                    statistics.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Detailed performance metrics
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Export results to CSV/PDF
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Real-time statistics
                    </li>
                  </ul>
                </div>
                <div className="ml-6 p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FiFileText size={32} />
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button className="text-green-600 font-medium hover:text-green-800 transition-colors">
                  View Analytics →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
                <div>
                  <p className="font-medium">New question added</p>
                  <p className="text-sm text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                Mathematics category
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                <div>
                  <p className="font-medium">Test completed by user</p>
                  <p className="text-sm text-gray-500">15 minutes ago</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">Score: 85%</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
