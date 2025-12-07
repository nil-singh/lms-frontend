export interface TestAnswer {
  questionId: string;
  difficulty: number;
  selected: number;
  correct: boolean;
}

export interface TestHistory {
  _id: string;
  userId: string;
  score: number;
  questionsAttempted: number;
  correctStreak: number;
  testOver: boolean;
  createdAt: string;
  updatedAt: string;
  answers: TestAnswer[];
}
export interface User {
  _id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}
