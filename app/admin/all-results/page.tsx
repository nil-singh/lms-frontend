"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import {
  FiUser,
  FiCheck,
  FiAlertTriangle,
  FiTrendingUp,
  FiSearch,
  FiFilter,
  FiDownload,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiBarChart2,
  FiTarget,
  FiClock,
  FiAward,
  FiActivity,
  FiRefreshCw,
  FiUsers,
} from "react-icons/fi";
import AdminHeader from "@/components/AdminHeader";

type TestResult = {
  _id: string;
  userId: {
    _id: string;
    email: string;
    name?: string;
    isAdmin: boolean;
  };
  currentDifficulty: number;
  questionsAttempted: number;
  correctStreak: number;
  testOver: boolean;
  score: number;
  answers: any[];
  createdAt: string;
  updatedAt: string;
  testDuration?: number;
  testName?: string;
};

type UserSummary = {
  email: string;
  userId: string;
  totalTests: number;
  completedTests: number;
  averageScore: number;
  bestScore: number;
  totalQuestionsAttempted: number;
  lastActivity: string;
};

export default function AllResultsPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "in_progress"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "score" | "difficulty">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedDetails, setExpandedDetails] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Extract unique users and their summaries
  const userSummaries = useMemo(() => {
    const userMap = new Map<string, UserSummary>();

    results.forEach((result) => {
      const email = result.userId?.email || "Unknown";
      if (!userMap.has(email)) {
        userMap.set(email, {
          email,
          userId: result.userId?._id || "",
          totalTests: 0,
          completedTests: 0,
          averageScore: 0,
          bestScore: 0,
          totalQuestionsAttempted: 0,
          lastActivity: "",
        });
      }

      const summary = userMap.get(email)!;
      summary.totalTests++;
      if (result.testOver) summary.completedTests++;
      summary.totalQuestionsAttempted += result.questionsAttempted;
      summary.bestScore = Math.max(summary.bestScore, result.score);

      if (new Date(result.updatedAt) > new Date(summary.lastActivity)) {
        summary.lastActivity = result.updatedAt;
      }
    });

    // Calculate average scores
    userMap.forEach((summary) => {
      const userResults = results.filter(
        (r) => r.userId?.email === summary.email && r.testOver
      );
      if (userResults.length > 0) {
        summary.averageScore = Math.round(
          userResults.reduce((sum, r) => sum + r.score, 0) / userResults.length
        );
      }
    });

    return Array.from(userMap.values()).sort(
      (a, b) =>
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }, [results]);

  // Filter results based on selected user and filters
  const filteredResults = useMemo(() => {
    let filtered = results;

    // Filter by selected user
    if (selectedUser) {
      filtered = filtered.filter(
        (result) => result.userId?.email === selectedUser
      );
    }

    // Filter by status
    if (statusFilter === "completed") {
      filtered = filtered.filter((result) => result.testOver);
    } else if (statusFilter === "in_progress") {
      filtered = filtered.filter((result) => !result.testOver);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(
        (result) =>
          result.userId?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          result.testName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case "score":
          comparison = b.score - a.score;
          break;
        case "difficulty":
          comparison = b.currentDifficulty - a.currentDifficulty;
          break;
      }
      return sortOrder === "desc" ? comparison : -comparison;
    });

    return filtered;
  }, [results, selectedUser, statusFilter, searchTerm, sortBy, sortOrder]);

  async function loadResults() {
    setLoading(true);
    try {
      const res = await api.get("/tests/admin/all-results");
      setResults(res.data);
    } catch (err) {
      console.error("Failed to load admin results", err);
      alert("Admin access only or server error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResults();
  }, []);

  async function exportToCSV() {
    setExporting(true);
    try {
      const data = filteredResults.map((result) => ({
        User: result.userId?.email || "Unknown",
        Score: result.score,
        Status: result.testOver ? "Completed" : "In Progress",
        Questions: result.questionsAttempted,
        Difficulty: result.currentDifficulty,
        Streak: result.correctStreak,
        "Created At": new Date(result.createdAt).toLocaleString(),
      }));

      const csv = [
        Object.keys(data[0]).join(","),
        ...data.map((row) =>
          Object.values(row)
            .map((value) =>
              typeof value === "string"
                ? `"${value.replace(/"/g, '""')}"`
                : value
            )
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `test-results-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export data");
    } finally {
      setExporting(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  function getScoreBgColor(score: number) {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  }

  function getDifficultyColor(difficulty: number) {
    if (difficulty <= 3) return "bg-green-100 text-green-800";
    if (difficulty <= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        {/* Header/Navigation */}
        <AdminHeader />

        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Test Results Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor and analyze all test attempts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadResults()}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <FiRefreshCw size={18} />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                disabled={exporting || filteredResults.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <FiDownload size={18} />
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {userSummaries.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FiUser className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Tests
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {results.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <FiBarChart2 className="text-purple-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {results.filter((r) => r.testOver).length > 0
                      ? Math.round(
                          results
                            .filter((r) => r.testOver)
                            .reduce((sum, r) => sum + r.score, 0) /
                            results.filter((r) => r.testOver).length
                        )
                      : 0}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <FiTrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {results.length > 0
                      ? Math.round(
                          (results.filter((r) => r.testOver).length /
                            results.length) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <FiCheck className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - User Selection */}
          <div className="space-y-6">
            {/* User List Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiUser />
                  Select User
                </h2>
              </div>

              <div className="p-4">
                {/* Search */}
                <div className="relative mb-4">
                  <FiSearch
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* User List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {/* All Users Option */}
                  <div
                    onClick={() => setSelectedUser(null)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      !selectedUser
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                          <FiUsers className="text-gray-600" size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">All Users</p>
                          <p className="text-sm text-gray-500">
                            {results.length} tests
                          </p>
                        </div>
                      </div>
                      {!selectedUser && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>

                  {/* Individual Users */}
                  {userSummaries.map((user) => (
                    <div
                      key={user.email}
                      onClick={() => setSelectedUser(user.email)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUser === user.email
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                            <span className="font-semibold text-blue-600">
                              {user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">
                              {user.email}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <FiAward size={12} />
                                {user.completedTests} tests
                              </span>
                              <span
                                className={`font-medium ${getScoreColor(
                                  user.averageScore
                                )}`}
                              >
                                {user.averageScore}% avg
                              </span>
                            </div>
                          </div>
                        </div>
                        {selectedUser === user.email && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User Stats */}
            {selectedUser && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  User Statistics
                </h3>
                {(() => {
                  const userSummary = userSummaries.find(
                    (u) => u.email === selectedUser
                  );
                  if (!userSummary) return null;

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Tests</span>
                        <span className="font-bold text-gray-900">
                          {userSummary.totalTests}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-bold text-green-600">
                          {userSummary.completedTests}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Average Score</span>
                        <span
                          className={`font-bold ${getScoreColor(
                            userSummary.averageScore
                          )}`}
                        >
                          {userSummary.averageScore}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Best Score</span>
                        <span className="font-bold text-green-600">
                          {userSummary.bestScore}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          Questions Attempted
                        </span>
                        <span className="font-bold text-gray-900">
                          {userSummary.totalQuestionsAttempted}
                        </span>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">Last Activity</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(userSummary.lastActivity)}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Right Column - Results Table */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters and Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedUser
                      ? `Test Results: ${selectedUser}`
                      : "All Test Results"}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Showing {filteredResults.length} of {results.length} tests
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Sort By */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="date">Sort by Date</option>
                      <option value="score">Sort by Score</option>
                      <option value="difficulty">Sort by Difficulty</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Sort Order */}
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                    }
                    className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {sortOrder === "desc" ? "Descending" : "Ascending"}
                  </button>
                </div>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        User
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Score
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Questions
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Difficulty
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiSearch className="text-gray-400" size={24} />
                          </div>
                          <p className="text-gray-600">No test results found</p>
                          {selectedUser && (
                            <p className="text-sm text-gray-500 mt-2">
                              Try changing filters or select a different user
                            </p>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredResults.map((result) => (
                        <>
                          <tr
                            key={result._id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                                  <FiUser className="text-blue-600" size={18} />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {result.userId?.email}
                                  </p>
                                  {selectedUser === null && (
                                    <button
                                      onClick={() =>
                                        setSelectedUser(result.userId?.email)
                                      }
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      View all tests →
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getScoreBgColor(
                                  result.score
                                )}`}
                              >
                                <span
                                  className={`font-bold ${getScoreColor(
                                    result.score
                                  )}`}
                                >
                                  {result.score}
                                </span>
                                <span className="text-sm text-gray-600">
                                  points
                                </span>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <FiTarget className="text-gray-400" />
                                <span className="font-medium">
                                  {result.questionsAttempted}
                                </span>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                  result.currentDifficulty
                                )}`}
                              >
                                {result.currentDifficulty}
                              </span>
                            </td>

                            <td className="py-2 px-3">
                              {result.testOver ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                  <FiCheck size={10} />
                                  Completed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                  <FiActivity size={10} />
                                  In Progress
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiCalendar size={14} />
                                {formatDate(result.createdAt)}
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <button
                                onClick={() =>
                                  setExpandedDetails(
                                    expandedDetails === result._id
                                      ? null
                                      : result._id
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                {expandedDetails === result._id
                                  ? "Hide Details"
                                  : "View Details"}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Details */}
                          {expandedDetails === result._id && (
                            <tr>
                              <td colSpan={7} className="bg-blue-50 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900">
                                      Test Information
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Test ID:
                                        </span>
                                        <code className="text-sm">
                                          {result._id.substring(0, 8)}...
                                        </code>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Started:
                                        </span>
                                        <span className="font-medium">
                                          {formatDate(result.createdAt)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Last Updated:
                                        </span>
                                        <span className="font-medium">
                                          {formatDate(result.updatedAt)}
                                        </span>
                                      </div>
                                      {result.testDuration && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Duration:
                                          </span>
                                          <span className="font-medium">
                                            {Math.round(
                                              result.testDuration / 60
                                            )}{" "}
                                            min
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900">
                                      Performance Metrics
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Score:
                                        </span>
                                        <span
                                          className={`font-bold ${getScoreColor(
                                            result.score
                                          )}`}
                                        >
                                          {result.score} points
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Questions:
                                        </span>
                                        <span className="font-medium">
                                          {result.questionsAttempted} attempted
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Correct Streak:
                                        </span>
                                        <span className="font-medium">
                                          {result.correctStreak}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Final Difficulty:
                                        </span>
                                        <span className="font-medium">
                                          {result.currentDifficulty}/10
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900">
                                      User Information
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Email:
                                        </span>
                                        <span className="font-medium">
                                          {result.userId?.email}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          User ID:
                                        </span>
                                        <code className="text-sm">
                                          {result.userId?._id.substring(0, 8)}
                                          ...
                                        </code>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Admin:
                                        </span>
                                        <span
                                          className={`font-medium ${
                                            result.userId?.isAdmin
                                              ? "text-green-600"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          {result.userId?.isAdmin
                                            ? "Yes"
                                            : "No"}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {
                                        // Navigate to user's full profile or results
                                        console.log(
                                          "View user profile:",
                                          result.userId?._id
                                        );
                                      }}
                                      className="w-full mt-4 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                      View Full User Profile
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
