// utils/testUtils.ts

import { TestHistory } from "@/types/testTypes";


// ----------------------
// 1. Calculate Test Stats
// ----------------------
export function calculateHistoryStats(history: TestHistory[]) {
    const completedTests = history.filter((h) => h.testOver);

    const totalQuestions = history.reduce(
        (sum, test) => sum + test.questionsAttempted,
        0
    );

    const averageScore =
        completedTests.length > 0
            ? Math.round(
                completedTests.reduce((sum, t) => sum + t.score, 0) /
                completedTests.length
            )
            : 0;

    const bestScore =
        completedTests.length > 0
            ? Math.max(...completedTests.map((t) => t.score))
            : 0;

    const streakRecord = Math.max(...history.map((t) => t.correctStreak));

    // Accuracy (score / totalPossibleQuestions)
    const totalPossiblePoints = history.reduce(
        (sum, t) => sum + t.questionsAttempted,
        0
    );
    const accuracy =
        totalPossiblePoints > 0
            ? Math.round(
                (history.reduce((sum, t) => sum + t.score, 0) /
                    totalPossiblePoints) *
                100
            )
            : 0;

    return {
        averageScore,
        bestScore,
        totalQuestionsAnswered: totalQuestions,
        accuracyRate: accuracy,
        streakRecord,
    };
}

// ----------------------
// 2. Active Test Loader
// ----------------------
export async function loadActiveTest(testId: string, api: any) {
    try {
        const res = await api.get(`/tests/${testId}`);
        const test = res.data;

        if (test.status === "in_progress" && test.currentQuestionId) {
            return {
                testId: test._id,
                currentQuestion: null,
                score: test.score || 0,
                questionsAnswered: test.questionsAttempted || 0,
                totalQuestions: test.totalQuestions || 0,
                isCompleted: false,
            };
        }
    } catch (err) {
        console.error(err);
    }
    return null;
}

// ----------------------
// 3. Start Test
// ----------------------
export async function startTestUtil(testId: string, api: any) {
    try {
        const res = await api.post(`/tests/${testId}/start`);
        return {
            testId,
            currentQuestion: res.data.question,
            score: 0,
            questionsAnswered: 0,
            totalQuestions: res.data.totalQuestions || 0,
            isCompleted: false,
        };
    } catch (err) {
        console.error(err);
        throw new Error("Failed to start test");
    }
}

// ----------------------
// 4. Submit Answer
// ----------------------
export async function submitAnswerUtil({
    activeTest,
    selectedOption,
    api,
    loadUserData,
    loadTestHistory,
}: {
    activeTest: any;
    selectedOption: number | null;
    api: any;
    loadUserData: () => Promise<void>;
    loadTestHistory: () => Promise<void>;
}) {
    if (!activeTest || !activeTest.currentQuestion || selectedOption === null) {
        throw new Error("Please select an answer");
    }

    const res = await api.post(
        `/tests/${activeTest.testId}/questions/${activeTest.currentQuestion._id}/answer`,
        { selectedOption }
    );

    // If next question exists
    if (res.data.nextQuestion) {
        return {
            ...activeTest,
            currentQuestion: res.data.nextQuestion,
            score: res.data.score,
            questionsAnswered: activeTest.questionsAnswered + 1,
            isCompleted: false,
        };
    }

    // Otherwise test completed
    await loadUserData();
    await loadTestHistory();

    return null;
}

// ----------------------
// 5. UI Helper Utilities
// ----------------------
export function getTestStatusColor(status: string) {
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

export function getDifficultyColor(difficulty: number) {
    if (difficulty <= 3) return "text-green-600 bg-green-50";
    if (difficulty <= 6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
}

export function getHistoryStatusColor(testOver: boolean) {
    return testOver
        ? "bg-green-100 text-green-800"
        : "bg-yellow-100 text-yellow-800";
}

export function getScoreColor(score: number) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
}

export function formatTime(minutes: number) {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function getPerformanceTrend(history: TestHistory[]) {
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
