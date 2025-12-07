export type TestTemplate = {
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

// From MongoDB Test Schema
export type TestHistory = {
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

    // frontend enriched fields
    testId?: string;
    testTitle?: string;
};

export type TestAnswer = {
    questionId: string;
    difficulty: number;
    selected: number;
    correct: boolean;
};

export type TestSession = {
    testId: string;
    currentQuestion: Question | null;
    score: number;
    questionsAnswered: number;
    totalQuestions: number;
    isCompleted: boolean;
};
export type Question = {
    _id: string;
    text: string;
    options: string[];
    difficulty: number;
    weight?: number;          // for scoring system
    explanation?: string;     // optional explanation
};
