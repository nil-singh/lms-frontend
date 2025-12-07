Adaptive Learning Platform – Frontend (Next.js)

This is the frontend application for the Adaptive Learning & Testing System.
Built using Next.js 14 (App Router), TailwindCSS, and React, it provides:

Student dashboard

Adaptive test-taking interface

Test history & analytics

Admin dashboards (questions + results management)

Authentication with JWT

API communication with a NestJS backend

🚀 Features
👨‍🎓 Student Features

Login & Dashboard

Start new adaptive test

Continue an in-progress test

View past test history

Performance analytics:

Average score

Best streak

Accuracy

Difficulty trends

Total questions answered

🧠 Adaptive Test Runner

Pulls questions dynamically from backend

Timer per question

Auto-submit on timeout

Difficulty adjusts based on correctness

Test finishes when adaptive conditions are met

🛠 Admin Features

Create, update, delete questions

View all users’ test results

UI showing score, difficulty pattern, streaks etc.

🧩 Tech Stack
Technology Purpose
Next.js 14 App Router Frontend framework
React UI components
TailwindCSS Styling
Axios API requests
React Icons Icons
Jest + RTL (optional) Frontend tests
JWT Authentication
📦 Folder Structure
frontend/
├── app/
│ ├── dashboard/
│ ├── test/
│ ├── admin/
│ ├── login/
│ └── globals.css
├── components/
│ ├── UserHeader.tsx
│ ├── AdminHeader.tsx
│ ├── StartTestButton.tsx
│ ├── LogoutButton.tsx
├── lib/
│ └── api.ts (Axios instance)
├── utils/
│ └── stats.ts
├── types/
│ ├── testTypes.ts
│ └── userTypes.ts
├── public/
└── package.json

🔧 Setup Instructions
1️⃣ Clone the repository
git clone https://github.com/YOUR_USERNAME/lms-frontend.git
cd lms-frontend

2️⃣ Install dependencies
npm install

If backend runs on a different port, update accordingly.

3️⃣ Run development server
npm run dev

Visit:

👉 http://localhost:3000

Authentication Flow

Frontend stores JWT token in cookies, and Axios sends it on every request:

Authorization: Bearer <token>

Login → Dashboard → Start Test → Answer Questions → Test History.

Admin routes require isAdmin: true.

🧪 Testing (Optional)

You can run React Testing Library + Jest:

npm run test

Example test included for the adaptive UI components.

🔗 API Integration

The frontend expects the following backend endpoints:

Auth

POST /register_user

POST /login_user

Tests

POST /tests/start

GET /tests/:id/question

POST /tests/:id/questions/:qid/answer

GET /tests/user/all

Admin

GET /tests/admin/all-results

POST /questions

GET /questions

🎨 Styling

TailwindCSS utility-based styling

Reusable component styles

Responsive layouts for dashboards & test runner

🧑‍💻 Development Scripts
Command Description
npm run dev //Start development server
npm run build /Build project
npm start Run //production build
npm run lint //Lint project
npm run test //Run tests
