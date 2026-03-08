export type ComplaintStatus = "Pending" | "In Progress" | "Resolved" | "Closed";
export type Priority = "Low" | "Medium" | "High" | "Urgent";
export type UserRole = "student" | "officer" | "admin";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  status: ComplaintStatus;
  priority: Priority;
  studentName: string;
  studentId: string;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
}

export interface Department {
  id: string;
  name: string;
  officerName: string;
  complaintCount: number;
}

export const departments: Department[] = [
  { id: "d1", name: "Computer Science & Engineering (CSE)", officerName: "—", complaintCount: 0 },
  { id: "d2", name: "Electrical & Electronic Engineering (EEE)", officerName: "—", complaintCount: 0 },
  { id: "d3", name: "Business Administration (BBA)", officerName: "—", complaintCount: 0 },
  { id: "d4", name: "Law (LLB)", officerName: "—", complaintCount: 0 },
  { id: "d5", name: "English", officerName: "—", complaintCount: 0 },
  { id: "d6", name: "Pharmacy", officerName: "—", complaintCount: 0 },
  { id: "d7", name: "Economics", officerName: "—", complaintCount: 0 },
  { id: "d8", name: "Hostel Management", officerName: "—", complaintCount: 0 },
  { id: "d9", name: "Examination Cell", officerName: "—", complaintCount: 0 },
  { id: "d10", name: "Transport", officerName: "—", complaintCount: 0 },
  { id: "d11", name: "Campus Facilities", officerName: "—", complaintCount: 0 },
  { id: "d12", name: "Library", officerName: "—", complaintCount: 0 },
];

export const categories = [
  "Hostel Issues",
  "Laboratory Problems",
  "Exam / Academic Issues",
  "Transport Services",
  "Campus Facilities",
  "Other",
];

export const complaints: Complaint[] = [
  {
    id: "CMP-001",
    title: "Water supply issue in Hostel Block B",
    description: "There has been no water supply in Hostel Block B for the past 3 days. Students are facing severe difficulties.",
    category: "Hostel Issues",
    department: "Hostel Management",
    status: "In Progress",
    priority: "High",
    studentName: "Tanvir Ahmed",
    studentId: "STU-2021-001",
    createdAt: "2026-03-01",
    updatedAt: "2026-03-05",
  },
  {
    id: "CMP-002",
    title: "Broken equipment in Physics Lab",
    description: "The oscilloscope in Physics Lab Room 203 is not functioning properly, affecting our practical sessions.",
    category: "Laboratory Problems",
    department: "Laboratory",
    status: "Pending",
    priority: "Medium",
    studentName: "Nusrat Jahan",
    studentId: "STU-2022-015",
    createdAt: "2026-03-03",
    updatedAt: "2026-03-03",
  },
  {
    id: "CMP-003",
    title: "Exam hall seating arrangement issue",
    description: "The seating arrangement for CSE 3rd year mid-term was incorrect. Many students were assigned wrong rooms.",
    category: "Exam / Academic Issues",
    department: "Examination Cell",
    status: "Resolved",
    priority: "High",
    studentName: "Rafiq Islam",
    studentId: "STU-2021-042",
    createdAt: "2026-02-20",
    updatedAt: "2026-03-02",
  },
  {
    id: "CMP-004",
    title: "Bus route timing mismatch",
    description: "The university bus on Route 5 consistently arrives 30 minutes late, causing students to miss morning classes.",
    category: "Transport Services",
    department: "Transport",
    status: "Pending",
    priority: "Medium",
    studentName: "Shanta Akter",
    studentId: "STU-2023-008",
    createdAt: "2026-03-06",
    updatedAt: "2026-03-06",
  },
  {
    id: "CMP-005",
    title: "Library AC not working",
    description: "The air conditioning in the main library reading room has been off for a week. It's very uncomfortable.",
    category: "Campus Facilities",
    department: "Campus Facilities",
    status: "In Progress",
    priority: "Low",
    studentName: "Kamal Hasan",
    studentId: "STU-2022-033",
    createdAt: "2026-03-04",
    updatedAt: "2026-03-07",
  },
  {
    id: "CMP-006",
    title: "Result publication delay",
    description: "The results for CSE 401 have not been published even after 2 months of the final exam.",
    category: "Exam / Academic Issues",
    department: "Examination Cell",
    status: "Pending",
    priority: "Urgent",
    studentName: "Farhan Sadiq",
    studentId: "STU-2020-019",
    createdAt: "2026-03-07",
    updatedAt: "2026-03-07",
  },
];

export const statsData = {
  total: 51,
  pending: 18,
  inProgress: 15,
  resolved: 14,
  closed: 4,
};