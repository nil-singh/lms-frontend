"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  FiClock,
  FiBarChart2,
  FiPlay,
  FiCheck,
  FiAlertCircle,
  FiArrowRight,
  FiUser,
  FiAward,
  FiTrendingUp,
  FiRefreshCw,
  FiLogOut,
  FiPlus,
  FiSearch,
  FiCopy,
  FiExternalLink,
  FiCalendar,
  FiTrendingDown,
  FiList,
  FiActivity,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import StartTestButton from "@/components/StartTestButton";
import LogoutButton from "@/components/LogoutButton";
import UserHeader from "@/components/UserHeader";

type TestTemplate = {
  _id: string;
  title: string;
  description: string;
  uniqueURL: string;
  status: "not_started" | "in_progress" | "completed";
  score?: number;
  totalQuestions?: number;
  questionsAttempted?: number;
  createdAt: string;
  completedAt?: string;
  currentQuestionId?: string;
  tags?: string[];
  estimatedTime?: number;
};

type TestHistory = {
  _id: string;
  userId: string;
  currentDifficulty: number;
  questionsAttempted: number;
  correctStreak: number;
  testOver: boolean;
  score: number;
  answers: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  testId?: string;
  testTitle?: string;
};

type Question = {
  _id: string;
  text: string;
  options: string[];
  difficulty: number;
  explanation?: string;
};

type TestSession = {
  testId: string;
  currentQuestion: Question | null;
  score: number;
  questionsAnswered: number;
  totalQuestions: number;
  isCompleted: boolean;
};

export default function UserDashboard() {
  const [tests, setTests] = useState<TestTemplate[]>([]);
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTest, setActiveTest] = useState<TestSession | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showNewTestModal, setShowNewTestModal] = useState(false);
  const [stats, setStats] = useState({
    totalTests: 0,
    completedTests: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    totalQuestionsAnswered: 0,
    accuracyRate: 0,
    streakRecord: 0,
  });
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);
  const [user, setUser] = useState({
    name: "Nilesh",
    avatar: null,
  });

  useEffect(() => {
    loadUserData();
    loadTestHistory();
  }, []);

  async function loadUserData() {
    setLoading(true);
    try {
      const [testsRes] = await Promise.all([api.get("/me")]);

      //   setTests(testsRes?.data || []);
      const allTests = testsRes.data.tests || [];
      calculateStats(allTests);

      // Check if there's an active test session
      const active = allTests?.find(
        (t: TestTemplate) => t.status === "in_progress"
      );
      if (active) {
        await loadActiveTest(active._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadTestHistory() {
    setHistoryLoading(true);
    try {
      const res = await api.get("/tests/user/all");
      setTests(res?.data || []);
      setTestHistory(res.data || []);
      calculateHistoryStats(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  }

  function calculateStats(tests: TestTemplate[]) {
    const completed = tests?.filter((t) => t.status === "completed");
    const scores = completed.map((t) => t.score || 0);
    const average =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    setStats((prev) => ({
      ...prev,
      totalTests: tests.length,
      completedTests: completed.length,
      averageScore: Math.round(average),
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      totalTimeSpent: completed.reduce(
        (total, test) => total + (test.estimatedTime || 0),
        0
      ),
    }));
  }

  function calculateHistoryStats(history: TestHistory[]) {
    const completedTests = history.filter((h) => h.testOver);
    const totalQuestions = history.reduce(
      (sum, test) => sum + test.questionsAttempted,
      0
    );
    const averageScore =
      completedTests.length > 0
        ? Math.round(
            completedTests.reduce((sum, test) => sum + test.score, 0) /
              completedTests.length
          )
        : 0;
    const bestScore =
      completedTests.length > 0
        ? Math.max(...completedTests.map((t) => t.score))
        : 0;
    const streakRecord = Math.max(...history.map((t) => t.correctStreak));

    // Calculate accuracy (simplified - could be enhanced with actual answer data)
    const totalPossiblePoints = history.reduce(
      (sum, test) => sum + test.questionsAttempted,
      0
    );
    const accuracy =
      totalPossiblePoints > 0
        ? Math.round(
            (history.reduce((sum, test) => sum + test.score, 0) /
              totalPossiblePoints) *
              100
          )
        : 0;

    setStats((prev) => ({
      ...prev,
      averageScore,
      bestScore,
      totalQuestionsAnswered: totalQuestions,
      accuracyRate: accuracy,
      streakRecord,
    }));
  }

  async function loadActiveTest(testId: string) {
    try {
      const res = await api.get(`/tests/${testId}`);
      const test = res.data;

      if (test.status === "in_progress" && test.currentQuestionId) {
        setActiveTest({
          testId: test._id,
          currentQuestion: null,
          score: test.score || 0,
          questionsAnswered: test.questionsAttempted || 0,
          totalQuestions: test.totalQuestions || 0,
          isCompleted: false,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function startTest(testId: string) {
    try {
      setSubmitting(true);
      const res = await api.post(`/tests/${testId}/start`);

      setActiveTest({
        testId,
        currentQuestion: res.data.question,
        score: 0,
        questionsAnswered: 0,
        totalQuestions: res.data.totalQuestions || 0,
        isCompleted: false,
      });

      setTests((prev) =>
        prev.map((t) =>
          t._id === testId ? { ...t, status: "in_progress" } : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to start test");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitAnswer() {
    if (!activeTest || !activeTest.currentQuestion || selectedOption === null) {
      alert("Please select an answer");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(
        `/tests/${activeTest.testId}/questions/${activeTest.currentQuestion._id}/answer`,
        { selectedOption }
      );

      if (res.data.nextQuestion) {
        setActiveTest((prev) =>
          prev
            ? {
                ...prev,
                currentQuestion: res.data.nextQuestion,
                score: res.data.score,
                questionsAnswered: prev.questionsAnswered + 1,
                isCompleted: false,
              }
            : null
        );
      } else {
        setActiveTest(null);
        await loadUserData();
        await loadTestHistory();
        alert(`Test completed! Your score: ${res.data.score}%`);
      }

      setSelectedOption(null);
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  }

  function getTestStatusColor(status: string) {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "not_started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function getDifficultyColor(difficulty: number) {
    if (difficulty <= 3) return "text-green-600 bg-green-50";
    if (difficulty <= 6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  }

  function getHistoryStatusColor(testOver: boolean) {
    return testOver
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  function formatTime(minutes: number) {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getPerformanceTrend(history: TestHistory[]) {
    if (history.length < 2) return "neutral";
    const recentScores = history
      .slice(0, 3)
      .filter((h) => h.testOver)
      .map((h) => h.score);
    if (recentScores.length < 2) return "neutral";

    const firstScore = recentScores[recentScores.length - 1];
    const lastScore = recentScores[0];
    return lastScore > firstScore
      ? "up"
      : lastScore < firstScore
      ? "down"
      : "neutral";
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <UserHeader
          stats={stats}
          testHistory={testHistory}
          getPerformanceTrend={getPerformanceTrend}
        />

        <div
          className={`bg-white rounded-2xl shadow-lg border border-gray-200 mx-4 lg:mx-auto max-w-7xl mb-8 transition-all duration-500 ${
            isScrolled ? "mt-2" : "mt-4"
          }`}
        >
          {/* Stats Header with Toggle */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Performance Dashboard
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Real-time learning analytics and insights
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isStatsExpanded ? (
                    <>
                      <FiChevronUp size={16} />
                      Collapse
                    </>
                  ) : (
                    <>
                      <FiChevronDown size={16} />
                      Expand
                    </>
                  )}
                </button>
                <div className="hidden md:block">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Updated just now
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Content */}
          {isStatsExpanded && (
            <div className="p-6">
              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Tests Taken
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {testHistory.length}
                        <span className="text-sm font-normal text-gray-600 ml-2">
                          ({completedTests} completed)
                        </span>
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <FiList size={24} className="text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">
                        Average Score
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {stats.averageScore}%
                        </p>
                        {getPerformanceTrend(testHistory) === "up" && (
                          <span className="flex items-center text-green-600 text-sm">
                            <FiTrendingUp size={14} className="mr-1" />
                            +2.5%
                          </span>
                        )}
                        {getPerformanceTrend(testHistory) === "down" && (
                          <span className="flex items-center text-red-600 text-sm">
                            <FiTrendingDown size={14} className="mr-1" />
                            -1.2%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <FiTrendingUp size={24} className="text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-700">
                        Best Score
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {stats.bestScore}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Personal record
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <FiAward size={24} className="text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        Accuracy
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {stats.accuracyRate}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.totalQuestionsAnswered} questions
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <FiCheck size={24} className="text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700">
                        Current Streak
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {testHistory.length > 0
                          ? testHistory[0].correctStreak
                          : 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Consecutive correct
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <FiActivity size={24} className="text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700">
                        Streak Record
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {stats.streakRecord}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        All-time best
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <FiActivity size={24} className="text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-700">
                        Avg Difficulty
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {avgDifficulty}/10
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Challenge level
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <FiBarChart2 size={24} className="text-indigo-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Progress Bars */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Breakdown
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">
                        Test Completion
                      </span>
                      <span className="text-gray-600">
                        {completedTests}/{testHistory.length} tests
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-700"
                        style={{
                          width: `${
                            testHistory.length > 0
                              ? (completedTests / testHistory.length) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">
                        Score Improvement
                      </span>
                      <span className="text-gray-600">
                        {getPerformanceTrend(testHistory) === "up"
                          ? "↑ Improving"
                          : getPerformanceTrend(testHistory) === "down"
                          ? "↓ Declining"
                          : "→ Stable"}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          getPerformanceTrend(testHistory) === "up"
                            ? "bg-green-500"
                            : getPerformanceTrend(testHistory) === "down"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                        style={{ width: `${stats.averageScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Active Test */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Test Session */}
            {activeTest && activeTest.currentQuestion ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <FiPlay />
                      Test in Progress
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        Question {activeTest.questionsAnswered + 1} of{" "}
                        {activeTest.totalQuestions}
                      </div>
                      <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        Score: {activeTest.score}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Question */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                          activeTest.currentQuestion.difficulty
                        )}`}
                      >
                        Difficulty: {activeTest.currentQuestion.difficulty}/10
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {activeTest.currentQuestion.text}
                    </h3>
                  </div>

                  {/* Options */}
                  <div className="space-y-3 mb-8">
                    {activeTest.currentQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedOption === index
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedOption(index)}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              selectedOption === index
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-gray-800">{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={submitAnswer}
                      disabled={selectedOption === null || submitting}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <FiRefreshCw className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Submit Answer
                          <FiArrowRight />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTest && !activeTest.currentQuestion ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPlay className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Continue Your Test
                </h3>
                <p className="text-gray-600 mb-6">
                  You have a test in progress. Click continue to resume.
                </p>
                <button
                  onClick={() => {
                    const test = tests.find((t) => t._id === activeTest.testId);
                    if (test) startTest(test._id);
                  }}
                  disabled={submitting}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  {submitting ? "Loading..." : "Continue Test"}
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-200 overflow-hidden">
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiPlay className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Active Test
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Start a new test to challenge yourself and track your
                    learning progress.
                  </p>
                  <StartTestButton />
                </div>
              </div>
            )}

            {/* Recent Test History Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiCalendar />
                  Recent Test History
                </h3>
                <button
                  onClick={() => setActiveTab("history")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-4">
                {historyLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : testHistory.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No test history available</p>
                  </div>
                ) : (
                  testHistory.slice(0, 3).map((test) => (
                    <div
                      key={test._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            test.testOver ? "bg-green-100" : "bg-yellow-100"
                          }`}
                        >
                          {test.testOver ? (
                            <FiCheck className="text-green-600" size={20} />
                          ) : (
                            <FiClock className="text-yellow-600" size={20} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getHistoryStatusColor(
                                test.testOver
                              )}`}
                            >
                              {test.testOver ? "Completed" : "In Progress"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(test.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span
                              className={`text-sm font-semibold ${getScoreColor(
                                test.score
                              )}`}
                            >
                              Score: {test.score}
                            </span>
                            <span className="text-sm text-gray-600">
                              Qs: {test.questionsAttempted}
                            </span>
                            <span className="text-sm text-gray-600">
                              Difficulty: {test.currentDifficulty}/10
                            </span>
                            <span className="text-sm text-gray-600">
                              Streak: {test.correctStreak}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Test List with Tabs */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                {/* Content based on active tab */}
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Test History
                      </h3>
                      <p className="text-sm text-gray-500">
                        All your test attempts
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {testHistory.length} total
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {historyLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Loading history...</p>
                      </div>
                    ) : testHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiActivity className="text-gray-400" size={20} />
                        </div>
                        <p className="text-gray-600 mb-2">
                          No test history yet
                        </p>
                        <p className="text-sm text-gray-500">
                          Start a test to see your history here
                        </p>
                      </div>
                    ) : (
                      testHistory.map((test) => (
                        <div
                          key={test._id}
                          className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  test.testOver
                                    ? "bg-green-100"
                                    : "bg-yellow-100"
                                }`}
                              >
                                {test.testOver ? (
                                  <FiCheck
                                    className="text-green-600"
                                    size={18}
                                  />
                                ) : (
                                  <FiClock
                                    className="text-yellow-600"
                                    size={18}
                                  />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${getHistoryStatusColor(
                                      test.testOver
                                    )}`}
                                  >
                                    {test.testOver
                                      ? "Completed"
                                      : "In Progress"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(test.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  ID: {test._id.substring(18, 24)}...
                                </p>
                              </div>
                            </div>
                            <div
                              className={`text-lg font-bold ${getScoreColor(
                                test.score
                              )}`}
                            >
                              {test.score}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-gray-500">Questions</p>
                              <p className="font-semibold">
                                {test.questionsAttempted}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-gray-500">Difficulty</p>
                              <p className="font-semibold">
                                {test.currentDifficulty}/10
                              </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-gray-500">Streak</p>
                              <p className="font-semibold">
                                {test.correctStreak}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-gray-500">Status</p>
                              <p className="font-semibold">
                                {test.testOver ? "Finished" : "Active"}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(test._id);
                                  alert("Test ID copied to clipboard!");
                                }}
                                className="text-xs text-gray-500 hover:text-gray-700"
                                title="Copy Test ID"
                              >
                                <FiCopy size={14} />
                              </button>
                              <span className="text-xs text-gray-400">
                                {new Date(test.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
