"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import useTimer from "@/hooks/useTimer";
import UserHeader from "@/components/UserHeader";
import {
  FiActivity,
  FiAlertCircle,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";

type Question = {
  _id: string;
  text: string;
  options: string[];
  difficulty: number;
  weight: number;
};

export interface TestAnswer {
  questionId: string;
  difficulty: number;
  selected: number;
  correct: boolean;
}

export interface Test {
  _id: string;
  userId: string;
  currentDifficulty: number;
  questionsAttempted: number;
  correctStreak: number;
  testOver: boolean;
  score: number;
  answers: TestAnswer[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function TestRunner() {
  const params = useParams(); // <-- FIX
  const testId = params.testId as string; // <-- FIX
  const router = useRouter();

  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [test, setTest] = useState<Test | null>(null);
  const [questionCount, setQuestionCount] = useState(0);

  const MAX_QUESTIONS = 20;
  const QUESTION_TIME = 45;

  const { timeLeft, reset } = useTimer(QUESTION_TIME, () => handleSubmit(true));

  /** ------------ LOAD FIRST QUESTION -------------- **/
  const initializeTest = useCallback(async () => {
    if (!testId) return;

    console.log("Fetching first question");

    setLoading(true);
    try {
      const q = await api.get(`/tests/${testId}/question`);

      if (!q.data) {
        setFinished(true);
        return;
      }

      setQuestion(q.data);
      reset(QUESTION_TIME);
      setSelected(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [testId]); // ONLY dependency

  /** ------------ LOAD NEXT QUESTION -------------- **/
  const loadNext = useCallback(async () => {
    try {
      const q = await api.get(`/tests/${testId}/question`);

      if (!q.data) {
        setFinished(true);
        return;
      }

      setQuestion(q.data);
      setSelected(null);
      reset(QUESTION_TIME);
    } catch (err) {
      console.error("loadNext error:", err);
    }
  }, [testId, reset]);

  /** ------------ SUBMIT ANSWER -------------- **/
  const handleSubmit = async (auto = false) => {
    if (!question) return;
    setQuestionCount((prev) => prev + 1);
    setLoading(true);

    try {
      const choice = auto ? -1 : selected ?? -1;

      // Send answer and get adaptive response
      const res = await api.post(
        `/tests/${testId}/questions/${question._id}/answer`,
        { selected: choice }
      );

      const { nextQuestionAvailable, testOver, test } = res.data;

      // If test is over → go to finish screen
      if (testOver || !nextQuestionAvailable) {
        setFinished(true);
        setTest(test); // show final score
        return;
      }

      // Otherwise load next question
      await loadNext();
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  /** ------------ INITIAL LOAD -------------- **/
  useEffect(() => {
    if (!testId) return;
    initializeTest();
  }, [testId]); // only run once when testId becomes available

  /** ------------ UI STATES -------------- **/
  if (loading && !question && !finished)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading question...
      </div>
    );
  if (finished)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Confetti Celebration Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  backgroundColor: [
                    "#3B82F6", // Blue
                    "#8B5CF6", // Purple
                    "#10B981", // Green
                    "#F59E0B", // Yellow
                    "#EF4444", // Red
                  ][Math.floor(Math.random() * 5)],
                  animation: `confetti-fall ${
                    Math.random() * 3 + 2
                  }s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          <div className="relative">
            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Header with Gradient */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
                <div className="relative px-8 py-12 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-3">
                    Test Completed!
                  </h1>
                  <p className="text-white/90 text-lg max-w-2xl mx-auto">
                    Great job! You've successfully finished the adaptive test.
                    Here's how you performed.
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Score Card - Main Highlight */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8">
                      <div className="text-center">
                        <div className="inline-block px-6 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                          FINAL SCORE
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            {/* Circular Progress Indicator */}
                            <div className="relative w-48 h-48 mx-auto mb-6">
                              <svg
                                className="w-full h-full"
                                viewBox="0 0 100 100"
                              >
                                {/* Background Circle */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  fill="none"
                                  stroke="#E5E7EB"
                                  strokeWidth="8"
                                />
                                {/* Progress Circle - Fixed Calculation */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  fill="none"
                                  stroke="#3B82F6"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                  strokeDasharray="283"
                                  strokeDashoffset={(() => {
                                    const score = test?.score || 0;
                                    const total = test?.questionsAttempted || 1; // Avoid division by zero
                                    const percentage =
                                      total > 0 ? score / total : 0;
                                    return 283 - 283 * percentage;
                                  })()}
                                  transform="rotate(-90 50 50)"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-5xl font-bold text-gray-900">
                                  {test?.score || 0}
                                  <span className="text-2xl text-gray-600">
                                    /{test?.questionsAttempted * 2 || 0}
                                  </span>
                                </div>
                                <div className="text-lg font-semibold text-blue-600 mt-2">
                                  {(() => {
                                    const score = test?.score || 0;
                                    const total =
                                      test?.questionsAttempted * 2 || 1;
                                    return total > 0
                                      ? Math.round((score / total) * 100)
                                      : 0;
                                  })()}
                                  % Correct
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Performance Summary
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                              <FiTarget className="text-green-600" size={20} />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Questions</p>
                              <p className="font-semibold text-gray-900">
                                {test?.questionsAttempted || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                              <FiTrendingUp
                                className="text-purple-600"
                                size={20}
                              />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Difficulty Reached
                              </p>
                              <p className="font-semibold text-gray-900">
                                Level {test?.currentDifficulty || 0}/10
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                              <FiActivity
                                className="text-yellow-600"
                                size={20}
                              />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Best Streak
                              </p>
                              <p className="font-semibold text-gray-900">
                                {test?.correctStreak || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Rating */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Performance Level
                      </h3>
                      {(() => {
                        const score = test?.score || 0;
                        const total = test?.questionsAttempted || 1;
                        const percentage =
                          total > 0 ? (score / total) * 100 : 0;
                        let level = "";
                        let color = "";
                        let description = "";

                        if (percentage >= 90) {
                          level = "Excellent";
                          color = "text-green-600 bg-green-100";
                          description =
                            "Outstanding performance! You've mastered the content.";
                        } else if (percentage >= 75) {
                          level = "Very Good";
                          color = "text-blue-600 bg-blue-100";
                          description =
                            "Great job! You have a strong understanding.";
                        } else if (percentage >= 60) {
                          level = "Good";
                          color = "text-yellow-600 bg-yellow-100";
                          description =
                            "Good work! Some areas need more practice.";
                        } else {
                          level = "Needs Improvement";
                          color = "text-red-600 bg-red-100";
                          description =
                            "Keep practicing! Review the material and try again.";
                        }

                        return (
                          <div>
                            <span
                              className={`px-4 py-1.5 rounded-full text-sm font-medium ${color}`}
                            >
                              {level}
                            </span>
                            <p className="text-sm text-gray-600 mt-3">
                              {description}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Improvement Suggestions */}
                <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                    <FiAlertCircle className="text-blue-500" />
                    Tips for Improvement
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">
                          Review Answers
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Go through your incorrect answers to understand mistakes
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-bold">2</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">
                          Practice More
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Take more tests to build consistency and confidence
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-bold">3</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">
                          Track Progress
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Monitor your dashboard to see long-term improvement
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push("/dashboard/user")}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
                  >
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      ></path>
                    </svg>
                    Go to Dashboard
                  </button>

                  <button
                    onClick={() => {
                      // Logic to retake test or start new test
                      router.push("/test/start");
                    }}
                    className="px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-3"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      ></path>
                    </svg>
                    Try Another Test
                  </button>

                  <button
                    onClick={() => {
                      // Logic to review answers
                      console.log("Review answers");
                    }}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      ></path>
                    </svg>
                    Review Answers
                  </button>
                </div>

                {/* Share Results */}
                <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                  <p className="text-gray-600 mb-4">Share your achievement</p>
                  <div className="flex gap-3 justify-center">
                    <button className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                      </svg>
                    </button>
                    <button className="w-12 h-12 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                      </svg>
                    </button>
                    <button className="w-12 h-12 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19.995 7.995h-3.998v-1.999c0-1.105-.895-2-2-2h-8c-1.105 0-2 .895-2 2v12c0 1.105.895 2 2 2h12c1.105 0 2-.895 2-2v-8c0-1.105-.895-2-2-2zm-6 6h-8v-8h8v8zm6 4h-12v-2h12v2zm0-4h-2v-2h2v2z"></path>
                      </svg>
                    </button>
                    <button className="w-12 h-12 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Add confetti animation to CSS */}
        <style jsx>{`
          @keyframes confetti-fall {
            0% {
              transform: translateY(-100vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  /** ------------ QUESTION SCREEN -------------- **/
  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center">
      <UserHeader
        stats={{
          averageScore: 0,
          bestScore: 0,
          totalQuestionsAnswered: 0,
          accuracyRate: 0,
          streakRecord: 0,
        }}
        testHistory={[]}
        getPerformanceTrend={function (
          history: any[]
        ): "up" | "down" | "neutral" {
          throw new Error("Function not implemented.");
        }}
      />
      <div className="max-w-3xl w-full bg-white shadow-md rounded-xl p-6 mt-20">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">
              Difficulty: {question?.difficulty}
            </h3>
            <p className="text-sm text-gray-500">Weight: {question?.weight}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Time Left</p>
            <p className="text-xl text-red-600">{timeLeft}s</p>
          </div>
        </div>

        <div className="my-4">
          <ProgressBar current={questionCount} total={MAX_QUESTIONS} />
        </div>

        <p className="text-lg mb-4">{question?.text}</p>

        <div className="space-y-3">
          {question?.options.map((opt, idx) => (
            <label
              key={idx}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition
              ${
                selected === idx
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="option"
                checked={selected === idx}
                onChange={() => setSelected(idx)}
              />
              {opt}
            </label>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => handleSubmit(false)}
            disabled={selected === null}
            className="cursor-pointer px-5 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Save & Next
          </button>

          <button
            onClick={() => {
              setSelected(null);
              loadNext();
            }}
            className="px-4 py-2 border rounded"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
