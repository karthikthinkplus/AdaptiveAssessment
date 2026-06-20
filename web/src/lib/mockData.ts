// ─── Mock Data — Adaptive Assessment Tool ─────────────────────────────────────

// ── Auth / Users ──────────────────────────────────────────────────────────────
export type UserRole = "student" | "teacher" | "qbm" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  institution: string;
  grade?: string;
  status: "active" | "inactive";
  joinedAt: string;
  dob?: string;
  phone?: string;
}

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Arjun Kumar", email: "arjun@example.com", role: "student", avatar: "AK", institution: "Delhi Public School", grade: "Class 10 - A", status: "active", joinedAt: "2024-01-10", dob: "10 Aug 2008", phone: "+91 98744 43210" },
  { id: "u2", name: "Priya Sharma", email: "priya@example.com", role: "student", avatar: "PS", institution: "Delhi Public School", grade: "Class 9 - B", status: "active", joinedAt: "2024-01-12" },
  { id: "u3", name: "Amit Verma", email: "amit@example.com", role: "teacher", avatar: "AV", institution: "Delhi Public School", status: "active", joinedAt: "2023-07-15" },
  { id: "u4", name: "Neha Singh", email: "neha@example.com", role: "teacher", avatar: "NS", institution: "St. Xavier's School", status: "active", joinedAt: "2023-08-20" },
  { id: "u5", name: "Ravi Kumar", email: "ravi@example.com", role: "qbm", avatar: "RK", institution: "Platform", status: "active", joinedAt: "2023-09-01" },
  { id: "u6", name: "Admin User", email: "admin@example.com", role: "admin", avatar: "AU", institution: "Platform", status: "active", joinedAt: "2023-09-01" },
];

// ── Student Dashboard ─────────────────────────────────────────────────────────
export const STUDENT_STATS = {
  overallProgress: 72,
  masteredTopics: { value: 18, total: 52 },
  averageScore: 78,
  currentAbility: 1.45,
  abilityLabel: "Intermediate",
  progressTrend: "+9% this week",
  topicsTrend: "+1 this week",
  scoreTrend: "Good Performance",
};

export const RADAR_DATA = [
  { dimension: "Reading", score: 78, average: 65 },
  { dimension: "Understanding", score: 85, average: 70 },
  { dimension: "Application", score: 60, average: 62 },
  { dimension: "Calculation", score: 90, average: 75 },
  { dimension: "Retention", score: 70, average: 68 },
];

export const SUBJECT_PERFORMANCE = [
  { subject: "General Aptitude", you: 70, avg: 60 },
  { subject: "Physics", you: 82, avg: 68 },
  { subject: "Algebra", you: 88, avg: 72 },
  { subject: "Arithmetic", you: 65, avg: 60 },
  { subject: "Chemistry", you: 74, avg: 66 },
  { subject: "Trigonometry", you: 55, avg: 58 },
  { subject: "Statistics", you: 80, avg: 70 },
];

export const TOPIC_STRENGTH = [
  { topic: "Algebra", score: 90 },
  { topic: "Geometry", score: 78 },
  { topic: "Statistics", score: 72 },
  { topic: "Arithmetic", score: 65 },
  { topic: "Mensuration", score: 70 },
  { topic: "Trigonometry", score: 55 },
];

export const RECENT_ASSESSMENT = {
  name: "Math Adaptive Test",
  date: "May 12, 2024",
  questions: 30,
  score: 82,
};

// ── Assessments List ──────────────────────────────────────────────────────────
export interface Assessment {
  id: string;
  name: string;
  type: "adaptive" | "fixed";
  questions: number;
  duration: number;
  status: "active" | "upcoming" | "completed";
  date: string;
  score?: number;
  grade?: string;
  subject?: string;
}

export const ASSESSMENTS: Assessment[] = [
  { id: "a1", name: "Math Adaptive Test", type: "adaptive", questions: 20, duration: 60, status: "active", date: "May 12, 2024", grade: "Grade 10", subject: "Algebra" },
  { id: "a2", name: "Physics Concept Test", type: "adaptive", questions: 25, duration: 45, status: "active", date: "May 16, 2024", grade: "Grade 9", subject: "Motion" },
  { id: "a3", name: "Chemistry Practice", type: "adaptive", questions: 30, duration: 30, status: "active", date: "May 20, 2024", grade: "Grade 10", subject: "Reactions" },
  { id: "a4", name: "Logical Reasoning", type: "adaptive", questions: 20, duration: 30, status: "active", date: "May 22, 2024", grade: "Grade 9" },
  { id: "a5", name: "English Proficiency", type: "adaptive", questions: 25, duration: 40, status: "active", date: "May 24, 2024", grade: "Grade 8" },
  { id: "a6", name: "Number Theory Quiz", type: "adaptive", questions: 15, duration: 30, status: "completed", date: "Apr 28, 2024", score: 76 },
];

// ── Assessment Player ─────────────────────────────────────────────────────────
export interface Question {
  id: string;
  index: number;
  totalQuestions: number;
  text: string;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
  skillBreadcrumb: { topic: string; skill: string };
  grade: number;
  difficulty: "very_easy" | "easy" | "medium" | "hard" | "very_hard";
  wordProblem: boolean;
}

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q1", index: 1, totalQuestions: 30,
    text: "Simplify: 2x² + 5x − 3 when x = 2",
    options: [
      { key: "A", text: "7" },
      { key: "B", text: "15" },
      { key: "C", text: "11" },
      { key: "D", text: "19" },
    ],
    skillBreadcrumb: { topic: "Algebra", skill: "Polynomial Evaluation" },
    grade: 10, difficulty: "medium", wordProblem: false,
  },
  {
    id: "q2", index: 2, totalQuestions: 30,
    text: "A train travels 240 km in 3 hours. What is its average speed?",
    options: [
      { key: "A", text: "60 km/h" },
      { key: "B", text: "80 km/h" },
      { key: "C", text: "70 km/h" },
      { key: "D", text: "90 km/h" },
    ],
    skillBreadcrumb: { topic: "Arithmetic", skill: "Speed, Distance & Time" },
    grade: 9, difficulty: "very_easy", wordProblem: true,
  },
  {
    id: "q3", index: 3, totalQuestions: 30,
    text: "If the sum of two numbers is 20 and their product is 96, find the numbers.",
    options: [
      { key: "A", text: "8 and 12" },
      { key: "B", text: "6 and 14" },
      { key: "C", text: "10 and 10" },
      { key: "D", text: "4 and 16" },
    ],
    skillBreadcrumb: { topic: "Algebra", skill: "Quadratic Equations" },
    grade: 10, difficulty: "very_hard", wordProblem: false,
  },
];

// ── Diagnostic Report ─────────────────────────────────────────────────────────
export interface SkillMastery {
  skill: string;
  topic: string;
  mastery: number;
  label: "Mastered" | "Developing" | "Gap";
}

export interface Recommendation {
  focus: string;
  ncertRef: string;
  urgency: "high" | "medium";
}

const SKILL_MASTERY_DATA: SkillMastery[] = [
  { skill: "Linear Equations",     topic: "Algebra",        mastery: 0.92, label: "Mastered" },
  { skill: "Polynomial Operations", topic: "Algebra",        mastery: 0.76, label: "Developing" },
  { skill: "Quadratic Equations",   topic: "Algebra",        mastery: 0.45, label: "Developing" },
  { skill: "Speed, Distance, Time", topic: "Arithmetic",     mastery: 0.88, label: "Mastered" },
  { skill: "Percentage & Ratio",    topic: "Arithmetic",     mastery: 0.65, label: "Developing" },
  { skill: "Area & Perimeter",      topic: "Geometry",       mastery: 0.28, label: "Gap" },
  { skill: "Trigonometric Ratios",  topic: "Trigonometry",   mastery: 0.18, label: "Gap" },
  { skill: "Data Interpretation",   topic: "Statistics",     mastery: 0.80, label: "Mastered" },
];

const RECOMMENDATIONS_DATA: Recommendation[] = [
  { focus: "Area & Perimeter (Grade 8)",       ncertRef: "NCERT Class 8 — Chapter 11: Mensuration",       urgency: "high" },
  { focus: "Quadratic Equations (Grade 10)",   ncertRef: "NCERT Class 10 — Chapter 4: Quadratic Equations", urgency: "medium" },
  { focus: "Trigonometric Ratios (Grade 10)",  ncertRef: "NCERT Class 10 — Chapter 8: Trigonometry",       urgency: "medium" },
];

export const DIAGNOSTIC_REPORT = {
  studentName: "Arjun Kumar",
  grade: "Grade 10 — A",
  completedAt: "May 12, 2024",
  overallScore: 82,
  gradeEquivalent: "Grade 10 Standard",
  abilityTheta: 1.45,
  abilityLabel: "Intermediate",
  radarData: RADAR_DATA,
  skillMastery: SKILL_MASTERY_DATA,
  rootCause: {
    summary: "Arjun understands word problems linguistically but consistently fails to apply the correct geometric formula when the shape is irregular or composite. Errors concentrate in formula selection and unit conversion, indicating a conceptual — not procedural — gap rooted in Grade 8 geometry.",
    trapType: "Concept Error",
    weakConcepts: [
      { concept: "Area of Irregular Shapes", topic: "Geometry", grade: "Grade 8" },
      { concept: "Frustum of a Cone", topic: "Mensuration", grade: "Grade 10" },
      { concept: "Curved Surface Area", topic: "Surface Area & Volume", grade: "Grade 9" },
      { concept: "Unit Conversion in Geometry", topic: "Geometry", grade: "Grade 8" },
    ],
    calculationErrors: {
      count: 3,
      total: 8,
      examples: [
        "Multiplied radius instead of diameter in cylinder formula",
        "Forgot to divide by 2 in triangle area",
        "Incorrect squaring of side in polygon perimeter",
      ],
    },
    comprehensionErrors: {
      count: 2,
      total: 8,
      examples: [
        "Misidentified composite solid as a single cone",
        "Confused 'total surface area' with 'lateral surface area' in problem statement",
      ],
    },
    foundationalGapChain: [
      {
        grade: "Grade 10",
        topic: "Mensuration",
        weakSubtopics: ["Volume of Composite Solids", "Frustum of a Cone"],
        severity: "current" as const,
      },
      {
        grade: "Grade 9",
        topic: "Surface Area & Volume",
        weakSubtopics: ["Curved Surface Area of Cylinders", "Surface Area of Spheres"],
        severity: "contributing" as const,
      },
      {
        grade: "Grade 8",
        topic: "Area & Perimeter",
        weakSubtopics: ["Area of Irregular Shapes", "Perimeter of Polygons", "Unit Conversion in Geometry"],
        severity: "root" as const,
      },
    ],
  },
  recommendations: RECOMMENDATIONS_DATA,
};



// ── Teacher Dashboard ─────────────────────────────────────────────────────────
export const TOPIC_PERFORMANCE_RADAR = [
  { dimension: "Statistics", score: 80 },
  { dimension: "Algebra", score: 72 },
  { dimension: "Geometry", score: 55 },
  { dimension: "Arithmetic", score: 70 },
  { dimension: "Trigonometry", score: 45 },
];

export const STUDENT_LIST = [
  { id: "s1", name: "Arjun Kumar", score: 82, ability: 1.45, trend: "up" },
  { id: "s2", name: "Priya Sharma", score: 76, ability: 1.12, trend: "up" },
  { id: "s3", name: "Rahul Gupta", score: 58, ability: 0.32, trend: "down" },
  { id: "s4", name: "Sneha Patel", score: 91, ability: 2.10, trend: "up" },
  { id: "s5", name: "Kiran Mehta", score: 44, ability: -0.45, trend: "down" },
  { id: "s6", name: "Divya Nair", score: 67, ability: 0.88, trend: "neutral" },
];

// ── Question Bank ─────────────────────────────────────────────────────────────
export interface QuestionRecord {
  id: string;
  questionText: string;
  subject: string;
  topic: string;
  difficulty: "Very Easy" | "Easy" | "Medium" | "Hard" | "Very Hard";
  type: "MCQ" | "Word Problem";
  status: "Active" | "Draft" | "Archived";
  grade: number;
}

export const QUESTION_BANK: QuestionRecord[] = [
  { id: "Q001", questionText: "What is the value of 2x + 3 when x = 4?", subject: "Math", topic: "Algebra", difficulty: "Easy", type: "MCQ", status: "Active", grade: 8 },
  { id: "Q002", questionText: "Simplify: (4x − 2)(y + 3) = ?", subject: "Math", topic: "Algebra", difficulty: "Medium", type: "MCQ", status: "Active", grade: 9 },
  { id: "Q003", questionText: "Derivative of x³ + 4x", subject: "Math", topic: "Calculus", difficulty: "Hard", type: "MCQ", status: "Active", grade: 10 },
  { id: "Q004", questionText: "Integral of x dx + 2", subject: "Math", topic: "Calculus", difficulty: "Easy", type: "MCQ", status: "Draft", grade: 10 },
  { id: "Q005", questionText: "Solve 3x² − 5x + 2 = 0", subject: "Math", topic: "Algebra", difficulty: "Medium", type: "MCQ", status: "Active", grade: 10 },
  { id: "Q006", questionText: "A shop offers 20% discount. Original price is ₹500. Find selling price.", subject: "Math", topic: "Arithmetic", difficulty: "Easy", type: "Word Problem", status: "Active", grade: 8 },
  { id: "Q007", questionText: "Find the area of a triangle with base 8 cm and height 6 cm.", subject: "Math", topic: "Geometry", difficulty: "Very Easy", type: "MCQ", status: "Active", grade: 8 },
  { id: "Q008", questionText: "Two trains start from the same point. What is their relative speed?", subject: "Math", topic: "Arithmetic", difficulty: "Very Hard", type: "Word Problem", status: "Active", grade: 9 },
];

// ── Notifications ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "assignment" | "report" | "approval" | "system";
  read: boolean;
  important: boolean;
}

export const NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "New Assessment Assigned", message: "Math Adaptive Test has been assigned to Class 10 - A", time: "2 min ago", type: "assignment", read: false, important: true },
  { id: "n2", title: "Report Generated", message: "Performance report for Math Adaptive Test is ready", time: "1 hour ago", type: "report", read: false, important: false },
  { id: "n3", title: "Question Approved", message: "Your question Q21001 has been approved", time: "3 hours ago", type: "approval", read: true, important: false },
  { id: "n4", title: "System Update", message: "Scheduled maintenance on May 28, 2024 at 11:00 PM", time: "1 day ago", type: "system", read: true, important: true },
  { id: "n5", title: "New Student Enrolled", message: "5 new students have joined Class 9 - B", time: "2 days ago", type: "assignment", read: true, important: false },
];

// ── Settings ──────────────────────────────────────────────────────────────────
export const PLATFORM_SETTINGS = {
  platformName: "ThinkPlus",
  supportEmail: "support@thinkplus.com",
  defaultTimezone: "Asia/Kolkata",
  dateFormat: "DD MMM YYYY",
  maintenanceMode: false,
  maxQuestionsPerSession: 30,
  defaultGrade: 10,
  allowStudentRegistration: true,
  requireEmailVerification: true,
};

// ── Super Admin ───────────────────────────────────────────────────────────────
export const ADMIN_STATS = {
  totalInstitutions: 48,
  institutionsTrend: "+3 this month",
  totalUsers: 12_840,
  usersTrend: "+214 this week",
  activeAssessments: 326,
  assessmentsTrend: "+12 today",
  platformAvgScore: 74,
  scoreTrend: "+2% vs last month",
};

export interface Institution {
  id: string;
  name: string;
  type: "School" | "College";
  city: string;
  students: number;
  teachers: number;
  status: "Active" | "Inactive";
  joinedAt: string;
}

export const INSTITUTION_LIST: Institution[] = [
  { id: "i1", name: "Delhi Public School", type: "School", city: "New Delhi", students: 1200, teachers: 48, status: "Active", joinedAt: "Jan 2024" },
  { id: "i2", name: "St. Xavier's School", type: "School", city: "Mumbai", students: 980, teachers: 39, status: "Active", joinedAt: "Feb 2024" },
  { id: "i3", name: "Kendriya Vidyalaya Bangalore", type: "School", city: "Bengaluru", students: 1540, teachers: 62, status: "Active", joinedAt: "Mar 2024" },
  { id: "i4", name: "Ryan International School", type: "School", city: "Pune", students: 870, teachers: 35, status: "Active", joinedAt: "Apr 2024" },
  { id: "i5", name: "DAV Public School", type: "School", city: "Chennai", students: 1100, teachers: 44, status: "Inactive", joinedAt: "May 2024" },
  { id: "i6", name: "Amity International", type: "School", city: "Noida", students: 1320, teachers: 51, status: "Active", joinedAt: "Jun 2024" },
];

export const ADMIN_USER_LIST = [
  { id: "au1", name: "Arjun Kumar", email: "arjun@example.com", role: "Student", institution: "Delhi Public School", status: "Active", joined: "Jan 10, 2024" },
  { id: "au2", name: "Priya Sharma", email: "priya@example.com", role: "Student", institution: "Delhi Public School", status: "Active", joined: "Jan 12, 2024" },
  { id: "au3", name: "Amit Verma", email: "amit@example.com", role: "Teacher", institution: "Delhi Public School", status: "Active", joined: "Jul 15, 2023" },
  { id: "au4", name: "Neha Singh", email: "neha@example.com", role: "Teacher", institution: "St. Xavier's School", status: "Active", joined: "Aug 20, 2023" },
  { id: "au5", name: "Ravi Kumar", email: "ravi@example.com", role: "QBM", institution: "Platform", status: "Active", joined: "Sep 1, 2023" },
  { id: "au6", name: "Sunita Rao", email: "sunita@example.com", role: "Student", institution: "Kendriya Vidyalaya Bangalore", status: "Inactive", joined: "Mar 5, 2024" },
  { id: "au7", name: "Admin User", email: "admin@example.com", role: "Admin", institution: "Platform", status: "Active", joined: "Sep 1, 2023" },
];

export const ADMIN_STUDENT_PROGRESS = {
  average: 68,
  trend: "+5% vs last month",
  completedAssessments: 8420,
  segments: [
    { label: "Grade 8", progress: 72, students: 2180 },
    { label: "Grade 9", progress: 64, students: 2460 },
    { label: "Grade 10", progress: 70, students: 1990 },
    { label: "Grade 11", progress: 61, students: 1430 },
  ],
};

// ── QBM (Question Bank Manager) ───────────────────────────────────────────────
export const QBM_STATS = {
  totalQuestions: 2_480,
  pendingReview: 34,
  approvedThisWeek: 78,
  categories: 12,
  rejectedThisWeek: 6,
};

export const QBM_PENDING_QUESTIONS = [
  { id: "PQ001", text: "Find the LCM of 12, 18, and 24.", subject: "Math", topic: "Number Theory", difficulty: "Very Easy" as const, submittedBy: "Teacher A", submittedAt: "Jun 17, 2026" },
  { id: "PQ002", text: "If sin θ = 3/5, find cos θ.", subject: "Math", topic: "Trigonometry", difficulty: "Medium" as const, submittedBy: "Teacher B", submittedAt: "Jun 16, 2026" },
  { id: "PQ003", text: "A shopkeeper marks up goods by 40% then gives 20% discount. Find profit %.", subject: "Math", topic: "Arithmetic", difficulty: "Very Hard" as const, submittedBy: "Teacher C", submittedAt: "Jun 15, 2026" },
];
